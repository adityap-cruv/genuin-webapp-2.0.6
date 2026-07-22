import fs from 'fs';
import path from 'path';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import dotenv from 'dotenv';

import { getBuildFiles, contentTypeFor } from './buildFiles.js';
import { purgeBunnyCDN } from './bunnyPurge.js';

type OracleConfig = {
  bucketName: string;
  region: string;
  endpointUrl: string;
  namespace: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export type UploadOptions = {
  /** Paths to upload to (already resolved by the orchestrator, e.g. ['cxr/1.0.0']). */
  paths: string[];
  /** When true, log the intended actions but send nothing. */
  dryRun: boolean;
};

/**
 * Loads and validates Oracle Object Storage configuration from .env.common and the
 * env-specific file (.env.qa or .env.production). Returns null if any key is missing.
 */
export async function getOracleConfig(): Promise<OracleConfig | null> {
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
  // Upload paths come from the caller (deploy.ts), not this config; the S3_UPLOAD_PATHS check
  // above only gates whether Oracle is considered configured at all.
  return { bucketName: namespace, region, endpointUrl, namespace, accessKeyId, secretAccessKey };
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

  const contentType = contentTypeFor(filePath);

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
 * Uploads the current dist/ build to Oracle Object Storage under each given path,
 * then purges Bunny CDN for those paths. Prompting/target selection happens upstream.
 */
export async function uploadBuildsToOracle({ paths, dryRun }: UploadOptions): Promise<void> {
  const oracleConfig = await getOracleConfig();
  // A selected target with missing config is a hard failure — the deploy was asked to
  // upload here and cannot. Throw so the orchestrator records it (never a silent success).
  if (!oracleConfig) {
    throw new Error('Oracle Object Storage is not configured — cannot upload.');
  }

  const { bucketName, region, endpointUrl, namespace, accessKeyId, secretAccessKey } = oracleConfig;
  const selectedPaths = paths;

  const oracleS3Client = new S3Client({
    region,
    endpoint: endpointUrl,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  const buildFiles = getBuildFiles();
  if (buildFiles.length === 0) {
    throw new Error('No build files found in dist/ — run the build before deploying.');
  }

  if (dryRun) {
    console.log(chalk.magenta('\n[dry-run] Oracle — would upload:'));
    for (const filePath of buildFiles) {
      const relativePath = path.relative('dist', filePath);
      for (const uploadPath of selectedPaths) {
        console.log(chalk.gray(`  • ${bucketName}/${uploadPath.replace(/^\//, '')}/${relativePath}`));
      }
    }
    console.log(chalk.magenta('[dry-run] Oracle — would then purge Bunny CDN for:'));
    selectedPaths.forEach((p) => console.log(chalk.gray(`  • ${p}`)));
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
    throw error;
  }
}
