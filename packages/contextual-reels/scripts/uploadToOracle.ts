import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import dotenv from 'dotenv';
import cliProgress from 'cli-progress';
import { purgeBunnyCDN } from './bunnyPurge.js';

type OracleConfig = {
  bucketName: string;
  region: string;
  endpointUrl: string;
  namespace: string;
  accessKeyId: string;
  secretAccessKey: string;
  paths: string[];
};

/**
 * Loads and validates Oracle Object Storage configuration from .env.common and the
 * env-specific file (.env.qa or .env.production). Returns null if any key is missing.
 */
async function getOracleConfig(): Promise<OracleConfig | null> {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';

  const commonEnv = dotenv.config({ path: '.env.common' }).parsed ?? {};
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa';
  const envConfig = dotenv.config({ path: envFile }).parsed ?? {};
  const combinedEnv = { ...commonEnv, ...envConfig };

  const accessKeyId = combinedEnv['ORACLE_ACCESS_KEY'];
  const secretAccessKey = combinedEnv['ORACLE_SECRET_KEY'];
  const region = combinedEnv['ORACLE_REGION'];
  const endpointUrl = combinedEnv['ORACLE_ENDPOINT_URL'];
  const namespace = combinedEnv['ORACLE_NAMESPACE'];
  const paths = combinedEnv['S3_UPLOAD_PATHS']?.split(',').map((p) => p.trim()).filter(Boolean) ?? [];

  console.log(chalk.blue('\nChecking Oracle Object Storage configuration:'));
  console.log('Environment:', chalk.yellow(NODE_ENV));
  console.log('Access Key:', chalk.yellow(accessKeyId ? '***configured***' : 'not set'));
  console.log('Secret Key:', chalk.yellow(secretAccessKey ? '***configured***' : 'not set'));
  console.log('Region:', chalk.yellow(region ?? 'not set'));
  console.log('Endpoint URL:', chalk.yellow(endpointUrl ?? 'not set'));
  console.log('Namespace:', chalk.yellow(namespace ?? 'not set'));
  console.log('Paths:', chalk.yellow(paths.join(', ') || 'not set'));

  if (!accessKeyId || !secretAccessKey || !region || !endpointUrl || !namespace || paths.length === 0) {
    console.log(chalk.red('❌ Missing required Oracle Object Storage configuration'));
    return null;
  }

  console.log(chalk.green('✓ Oracle Object Storage configuration found'));
  // Oracle's S3-compatible API uses the namespace as the S3 bucket name in PutObjectCommand.
  return { bucketName: namespace, region, endpointUrl, namespace, accessKeyId, secretAccessKey, paths };
}

/**
 * Discovers all dist/ files that should be uploaded.
 * QA: includes source maps. Production: excludes source maps.
 */
function getBuildFiles(): string[] {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';
  const isProduction = NODE_ENV === 'production';

  const allFiles = getFilesRecursively('dist').map((f) => path.join('dist', f));

  const buildFiles = allFiles.filter((file) => {
    const filename = path.basename(file);
    const ext = path.extname(file);

    // Stable loader
    if (filename === 'gen_ext.min.js') return true;

    // Hashed core bundle: gen_ext-[hash].js
    if (/^gen_ext-[A-Za-z0-9_-]+\.js$/.test(filename)) return true;

    // CSS assets: cxr-[hash].css
    if (file.includes('assets/') && ext === '.css' && /^cxr-[A-Za-z0-9_-]+\.css$/.test(filename)) return true;

    // Chunks
    if (file.includes('chunks/') && ext === '.js') return true;

    // Source maps — QA only
    if (!isProduction && ext === '.map') return true;

    return false;
  });

  console.log(chalk.blue(`\nDiscovered ${buildFiles.length} files to upload:`));
  buildFiles.forEach((f) => console.log(chalk.gray(`  • ${f}`)));

  return buildFiles;
}

/** Recursively lists all files under a directory, returning paths relative to that directory. */
function getFilesRecursively(dir: string, basePath: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath, basePath));
    } else {
      files.push(path.relative(basePath, fullPath));
    }
  }
  return files;
}

/** Uploads a single file to Oracle Object Storage, preserving its dist/ subdirectory structure. */
async function uploadFile(
  client: S3Client,
  bucketName: string,
  filePath: string,
  oracleBucketPath: string,
  progressBar: cliProgress.SingleBar,
): Promise<void> {
  const fileContent = fs.readFileSync(filePath);
  const relativePath = path.relative('dist', filePath);
  const oracleKey = `${oracleBucketPath.replace(/^\//, '')}/${relativePath}`;

  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.js') contentType = 'application/javascript';
  else if (ext === '.css') contentType = 'text/css';
  else if (ext === '.map') contentType = 'application/json';

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: oracleKey,
    Body: fileContent,
    ContentType: contentType,
  });

  try {
    await client.send(command);
    progressBar.increment();
    console.log(chalk.green(`✓ Uploaded ${relativePath} → ${oracleBucketPath}/${relativePath}`));
  } catch (error) {
    console.error(chalk.red(`✗ Failed to upload ${relativePath} → ${oracleBucketPath}/${relativePath}`));
    throw error;
  }
}

/**
 * Main upload function. Entry point for the deploy pipeline.
 *
 * By default (CI mode): reads S3_UPLOAD_PATHS from env and uploads without prompts.
 * With --interactive flag: shows path selection and confirmation prompts.
 */
export async function uploadBuildsToOracle(): Promise<void> {
  const isInteractive = process.argv.includes('--interactive');
  const oracleConfig = await getOracleConfig();
  if (!oracleConfig) return;

  const { bucketName, region, endpointUrl, namespace, accessKeyId, secretAccessKey, paths } = oracleConfig;

  let selectedPaths: string[];

  if (isInteractive) {
    const shouldUpload = await confirm({
      message: 'Do you want to upload the build files to Oracle Object Storage?',
      default: false,
    });
    if (!shouldUpload) return;

    selectedPaths = await checkbox<string>({
      message: 'Select the paths where you want to upload the build files:',
      choices: paths.map((p) => ({ value: p, label: p })),
      validate: (selected) => selected.length > 0 || 'You must select at least one path',
    });
  } else {
    selectedPaths = paths;
    console.log(chalk.blue(`\nCI mode: uploading to all configured paths: ${selectedPaths.join(', ')}`));
  }

  const oracleS3Client = new S3Client({
    region,
    endpoint: endpointUrl,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  const buildFiles = getBuildFiles();
  if (buildFiles.length === 0) {
    console.log(chalk.yellow('⚠ No build files found to upload'));
    return;
  }

  const existingFiles = buildFiles.filter((f) => {
    if (!fs.existsSync(f)) {
      console.warn(chalk.yellow(`⚠ ${f} does not exist, skipping`));
      return false;
    }
    return true;
  });

  const totalUploads = existingFiles.length * selectedPaths.length;
  const progressBar = new cliProgress.SingleBar({
    format: 'Uploading |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} Files',
    barCompleteChar: '█',
    barIncompleteChar: '░',
  });

  console.log(chalk.blue('\nStarting Oracle Object Storage upload...'));
  progressBar.start(totalUploads, 0);

  try {
    const uploadPromises: Promise<void>[] = [];
    for (const filePath of existingFiles) {
      for (const uploadPath of selectedPaths) {
        uploadPromises.push(uploadFile(oracleS3Client, bucketName, filePath, uploadPath, progressBar));
      }
    }
    await Promise.all(uploadPromises);
    progressBar.stop();

    console.log(chalk.green('\n✓ Oracle Object Storage upload completed successfully!'));
    console.log(chalk.blue(`\nFiles uploaded to Oracle namespace: ${namespace}`));
    console.log(chalk.blue(`Region: ${region}`));
    console.log(chalk.blue(`Endpoint: ${endpointUrl}`));
    console.log(chalk.blue('\nFiles accessible at:'));
    for (const uploadPath of selectedPaths) {
      const cleanPath = uploadPath.replace(/^\//, '').replace(/\/$/, '');
      console.log(chalk.cyan(`  • ${endpointUrl}/${cleanPath}/`));
    }

    try {
      await purgeBunnyCDN(selectedPaths);
    } catch (error) {
      console.error(chalk.red('\n⚠ Bunny CDN purge failed (non-critical):'), error);
    }
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red('\n✗ Oracle Object Storage upload failed:'), error);
    process.exit(1);
  }
}

uploadBuildsToOracle().catch((error: unknown) => {
  console.error(chalk.red('💥 Upload script failed:'), error);
  process.exit(1);
});
