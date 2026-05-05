/**
 * Oracle Object Storage Upload Script for Storybook Builds
 * =========================================================
 *
 * This script handles uploading Storybook static build files to Oracle Object Storage
 * using the S3-compatible API. It provides an interactive CLI interface for selecting
 * upload paths and confirming actions.
 *
 * Key Features:
 * - Supports multiple environment configurations (QA, Production)
 * - Oracle Object Storage S3-compatible API integration
 * - Interactive path selection
 * - Progress tracking for uploads
 * - Comprehensive error handling and logging
 * - Extended content-type detection for Storybook asset types
 *
 * Environment Configuration:
 * -------------------------
 * The script uses environment variables from:
 * - .env.common: Shared configuration across environments
 * - .env.qa: QA environment specific configuration
 * - .env.production: Production environment specific configuration
 *
 * Required Environment Variables:
 * - ORACLE_ACCESS_KEY: Oracle Object Storage access key
 * - ORACLE_SECRET_KEY: Oracle Object Storage secret key
 * - ORACLE_REGION: Oracle Cloud region
 * - ORACLE_ENDPOINT_URL: Oracle Object Storage endpoint URL
 * - ORACLE_NAMESPACE: Oracle Object Storage namespace
 * - STORYBOOK_UPLOAD_PATHS: Comma-separated list of valid upload paths
 */

import fs from "fs";
import path from "path";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { confirm, checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import cliProgress from "cli-progress";
import dotenv from "dotenv";

import { purgeBunnyCDN } from "./bunnyPurge.js";

/**
 * Configuration interface for Oracle Object Storage upload settings
 */
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
 * Loads and validates Oracle Object Storage configuration from environment files.
 * Combines variables from common and environment-specific config files.
 * Performs validation and logs configuration status.
 *
 * @returns {Promise<OracleConfig | null>} Configuration object or null if invalid
 */
async function getOracleConfig(): Promise<OracleConfig | null> {
  const NODE_ENV = process.env.NODE_ENV || "qa";

  // Load environment variables in order of priority
  const commonEnv = dotenv.config({ path: ".env.common" }).parsed || {};
  const envFile = NODE_ENV === "production" ? ".env.production" : ".env.qa";
  const envConfig = dotenv.config({ path: envFile }).parsed || {};

  // Common vars take precedence over env-specific vars (matching reference impl)
  const combinedEnv = { ...envConfig, ...commonEnv };

  const accessKeyId = combinedEnv.ORACLE_ACCESS_KEY;
  const secretAccessKey = combinedEnv.ORACLE_SECRET_KEY;
  const region = combinedEnv.ORACLE_REGION;
  const endpointUrl = combinedEnv.ORACLE_ENDPOINT_URL;
  const namespace = combinedEnv.ORACLE_NAMESPACE;
  const paths =
    combinedEnv.STORYBOOK_UPLOAD_PATHS?.split(",")
      .map((p) => p.trim())
      .filter(Boolean) || [];

  // Debug information
  console.log(chalk.blue("\nChecking Oracle Object Storage configuration:"));
  console.log("Environment:", chalk.yellow(NODE_ENV));
  console.log("Access Key:", chalk.yellow(accessKeyId ? "***configured***" : "not set"));
  console.log("Secret Key:", chalk.yellow(secretAccessKey ? "***configured***" : "not set"));
  console.log("Region:", chalk.yellow(region || "not set"));
  console.log("Endpoint URL:", chalk.yellow(endpointUrl || "not set"));
  console.log("Namespace:", chalk.yellow(namespace || "not set"));
  console.log("Paths:", chalk.yellow(paths.join(", ") || "not set"));

  if (!accessKeyId || !secretAccessKey || !region || !endpointUrl || !namespace || paths.length === 0) {
    console.log(chalk.red("❌ Missing required Oracle Object Storage configuration"));
    return null;
  }

  console.log(chalk.green("✓ Oracle Object Storage configuration found"));
  return {
    bucketName: namespace, // Oracle uses namespace as bucket name
    region,
    endpointUrl,
    namespace,
    accessKeyId,
    secretAccessKey,
    paths,
  };
}

/**
 * Recursively collects all file paths under a directory.
 * Returns paths relative to the provided basePath.
 *
 * @param {string} dir - Absolute directory path to scan
 * @param {string} basePath - Base path used to compute relative paths
 * @returns {string[]} Array of relative file paths
 */
function getFilesRecursively(dir: string, basePath: string = dir): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(basePath, fullPath);

    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath, basePath));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Discovers all files inside storybook-static/ for upload.
 * All files are included since Storybook outputs a self-contained static site.
 *
 * @returns {string[]} Array of file paths prefixed with storybook-static/
 */
function getStorybookFiles(): string[] {
  const storybookDir = "storybook-static";

  if (!fs.existsSync(storybookDir)) {
    console.log(chalk.yellow(`⚠ Directory '${storybookDir}' not found. Run build-storybook first.`));
    return [];
  }

  const allFiles = getFilesRecursively(storybookDir).map((file) => path.join(storybookDir, file));

  console.log(chalk.blue(`\nDiscovered ${allFiles.length} files to upload:`));
  allFiles.forEach((file) => console.log(chalk.gray(`  • ${file}`)));

  return allFiles;
}

/**
 * Resolves the MIME content-type for a given file extension.
 * Covers all asset types produced by a Storybook static build.
 *
 * @param {string} filePath - Path to the file (used to extract extension)
 * @returns {string} MIME type string
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  const contentTypeMap: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".map": "application/json",
  };

  return contentTypeMap[ext] ?? "application/octet-stream";
}

/**
 * Uploads a single Storybook file to Oracle Object Storage, preserving its
 * directory structure relative to storybook-static/.
 *
 * @param {S3Client} client - Initialized S3 client configured for Oracle
 * @param {string} bucketName - Target Oracle Object Storage bucket name (namespace)
 * @param {string} filePath - Local path of file to upload (prefixed with storybook-static/)
 * @param {string} oracleBucketPath - Target base path in Oracle Object Storage bucket
 * @param {cliProgress.SingleBar} progressBar - Progress bar instance
 * @returns {Promise<void>}
 */
async function uploadFile(
  client: S3Client,
  bucketName: string,
  filePath: string,
  oracleBucketPath: string,
  progressBar: cliProgress.SingleBar
): Promise<void> {
  const fileContent = fs.readFileSync(filePath);

  // Preserve directory structure relative to storybook-static/
  const relativePath = path.relative("storybook-static", filePath);
  const oracleKey = `${oracleBucketPath.replace(/^\//, "")}/${relativePath}`;
  const contentType = getContentType(filePath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: oracleKey,
    Body: fileContent,
    ContentType: contentType,
  });

  try {
    await client.send(command);
    progressBar.increment();
    console.log(chalk.green(`✓ Successfully uploaded ${relativePath} to ${oracleBucketPath}/${relativePath}`));
  } catch (error) {
    console.error(chalk.red(`✗ Failed to upload ${relativePath} to ${oracleBucketPath}/${relativePath}`));
    throw error;
  }
}

/**
 * Main entry point for uploading the Storybook static build to Oracle Object Storage.
 *
 * Process:
 * 1. Load and validate Oracle configuration
 * 2. Prompt for user confirmation
 * 3. Allow path selection
 * 4. Initialize Oracle-compatible S3 client
 * 5. Upload all storybook-static/ files with progress tracking
 * 6. Purge Bunny CDN cache for uploaded paths
 *
 * @returns {Promise<void>}
 */
export async function uploadStorybookToOracle(): Promise<void> {
  const oracleConfig = await getOracleConfig();

  // If Oracle configuration is not found, skip upload silently
  if (!oracleConfig) {
    return;
  }

  const { bucketName, region, endpointUrl, namespace, accessKeyId, secretAccessKey, paths } = oracleConfig;

  // Prompt user if they want to upload to Oracle Object Storage
  const shouldUpload = await confirm({
    message: "Do you want to upload the Storybook build to Oracle Object Storage?",
    default: false,
  });

  if (!shouldUpload) {
    return;
  }

  // Prompt user to select paths
  const selectedPaths = await checkbox<string>({
    message: "Select the paths where you want to upload the Storybook build:",
    choices: paths.map((p) => ({
      value: p,
      label: p,
    })),
    validate(selected) {
      return selected.length > 0 || "You must select at least one path";
    },
  });

  // Initialize Oracle Object Storage S3-compatible client
  const oracleS3Client = new S3Client({
    region,
    endpoint: endpointUrl,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    // Oracle Object Storage specific configuration
    forcePathStyle: true, // Required for Oracle Object Storage
    signatureVersion: "v4", // AWS Signature Version 4
  });

  // Discover all storybook-static files
  const storybookFiles = getStorybookFiles();

  if (storybookFiles.length === 0) {
    console.log(chalk.yellow("⚠ No Storybook files found to upload"));
    return;
  }

  // Filter to existing files and log warnings for missing ones
  const existingFiles: string[] = [];
  for (const filePath of storybookFiles) {
    if (!fs.existsSync(filePath)) {
      console.warn(chalk.yellow(`⚠ Warning: ${filePath} does not exist, skipping...`));
    } else {
      existingFiles.push(filePath);
    }
  }

  const totalUploads = existingFiles.length * selectedPaths.length;

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: "Uploading files |" + chalk.cyan("{bar}") + "| {percentage}% || {value}/{total} Files",
    barCompleteChar: "█",
    barIncompleteChar: "░",
  });

  console.log(chalk.blue("\nStarting Oracle Object Storage upload..."));
  progressBar.start(totalUploads, 0);

  try {
    // Create upload promises for all file-path combinations
    const uploadPromises: Promise<void>[] = [];
    for (const filePath of existingFiles) {
      for (const uploadPath of selectedPaths) {
        uploadPromises.push(uploadFile(oracleS3Client, bucketName, filePath, uploadPath, progressBar));
      }
    }

    // Upload all files in parallel
    await Promise.all(uploadPromises);

    progressBar.stop();
    console.log(chalk.green("\n✓ Oracle Object Storage upload completed successfully!"));
    console.log(chalk.blue(`\nFiles uploaded to Oracle Object Storage namespace: ${namespace}`));
    console.log(chalk.blue(`Region: ${region}`));
    console.log(chalk.blue(`Endpoint: ${endpointUrl}`));
    console.log(chalk.blue("\nFiles can be accessed at:"));
    for (const uploadPath of selectedPaths) {
      const cleanPath = uploadPath.replace(/^\//, "").replace(/\/$/, "");
      const accessUrl = `${endpointUrl}/${cleanPath}/`;
      console.log(chalk.cyan(`  • ${accessUrl}`));
    }

    // Purge Bunny CDN cache
    try {
      await purgeBunnyCDN(selectedPaths);
    } catch (error) {
      console.error(chalk.red("\n⚠ Bunny CDN purge failed (non-critical):"), error);
      // Don't fail the entire process if Bunny CDN purge fails
    }
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red("\n✗ Oracle Object Storage upload process failed:"), error);
    process.exit(1);
  }
}

// ESM-compatible main guard — run upload when invoked directly via tsx
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  uploadStorybookToOracle().catch(console.error);
}
