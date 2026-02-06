/**
 * Oracle Object Storage Upload Script for SDK Builds
 * ==================================================
 *
 * This script handles uploading SDK build files to Oracle Object Storage using the S3-compatible API.
 * It provides an interactive CLI interface for selecting upload paths and confirming actions.
 *
 * Key Features:
 * - Supports multiple environment configurations (QA, Production)
 * - Oracle Object Storage S3-compatible API integration
 * - Interactive path selection
 * - Progress tracking for uploads
 * - Comprehensive error handling and logging
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
 * - S3_UPLOAD_PATHS: Comma-separated list of valid upload paths
 *
 * Oracle Object Storage Configuration:
 * -----------------------------------
 * Oracle Object Storage provides S3-compatible API with the following requirements:
 * - signatureVersion: "v4" (AWS Signature Version 4)
 * - s3ForcePathStyle: true (Use path-style URLs)
 * - Custom endpoint URL for Oracle Cloud regions
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { confirm, checkbox } from '@inquirer/prompts'
import chalk from 'chalk'
import dotenv from 'dotenv'
import cliProgress from 'cli-progress'
import { purgeBunnyCDN } from './bunnyPurge'

/**
 * Configuration interface for Oracle Object Storage upload settings
 */
type OracleConfig = {
  bucketName: string
  region: string
  endpointUrl: string
  namespace: string
  accessKeyId: string
  secretAccessKey: string
  paths: string[]
}

/**
 * Loads and validates Oracle Object Storage configuration from environment files
 * Combines variables from common and environment-specific config files
 * Performs validation and logs configuration status
 *
 * @returns {Promise<OracleConfig | null>} Configuration object or null if invalid
 */
async function getOracleConfig(): Promise<OracleConfig | null> {
  const NODE_ENV = process.env.NODE_ENV || 'qa'

  // Load environment variables in order of priority
  const commonEnv = dotenv.config({ path: '.env.common' }).parsed || {}
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa'
  const envConfig = dotenv.config({ path: envFile }).parsed || {}

  // Combine environment variables
  const combinedEnv = { ...envConfig, ...commonEnv }

  const accessKeyId = combinedEnv.ORACLE_ACCESS_KEY
  const secretAccessKey = combinedEnv.ORACLE_SECRET_KEY
  const region = combinedEnv.ORACLE_REGION
  const endpointUrl = combinedEnv.ORACLE_ENDPOINT_URL
  const namespace = combinedEnv.ORACLE_NAMESPACE
  const paths = combinedEnv.S3_UPLOAD_PATHS?.split(',') || []

  // Debug information
  console.log(chalk.blue('\nChecking Oracle Object Storage configuration:'))
  console.log('Environment:', chalk.yellow(NODE_ENV))
  console.log(
    'Access Key:',
    chalk.yellow(accessKeyId ? '***configured***' : 'not set'),
  )
  console.log(
    'Secret Key:',
    chalk.yellow(secretAccessKey ? '***configured***' : 'not set'),
  )
  console.log('Region:', chalk.yellow(region || 'not set'))
  console.log('Endpoint URL:', chalk.yellow(endpointUrl || 'not set'))
  console.log('Namespace:', chalk.yellow(namespace || 'not set'))
  console.log('Paths:', chalk.yellow(paths.join(', ') || 'not set'))

  // If any required Oracle configuration is missing, return null
  if (
    !accessKeyId ||
    !secretAccessKey ||
    !region ||
    !endpointUrl ||
    !namespace ||
    paths.length === 0
  ) {
    console.log(
      chalk.red('❌ Missing required Oracle Object Storage configuration'),
    )
    return null
  }

  console.log(chalk.green('✓ Oracle Object Storage configuration found'))
  return {
    bucketName: namespace, // Oracle uses namespace as bucket name
    region,
    endpointUrl,
    namespace,
    accessKeyId,
    secretAccessKey,
    paths,
  }
}

/**
 * Recursively get all files from a directory with relative paths
 */
function getFilesRecursively(dir: string, basePath: string = dir): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const relativePath = path.relative(basePath, fullPath)

    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getFilesRecursively(fullPath, basePath))
    } else {
      files.push(relativePath)
    }
  }

  return files
}

/**
 * Get all build files that need to be uploaded
 * Includes chunks, source maps (for QA), and main build files
 */
function getBuildFiles(): string[] {
  const NODE_ENV = process.env.NODE_ENV || 'qa'
  const isProduction = NODE_ENV === 'production'

  // Get all files from dist directory
  const allFiles = getFilesRecursively('dist').map((file) =>
    path.join('dist', file),
  )

  // Filter files based on environment
  const buildFiles = allFiles.filter((file) => {
    const filename = path.basename(file)
    const ext = path.extname(file)

    // Always include main build files
    if (
      filename === 'gen_sdk.min.js' ||
      filename === 'genuin-sdk.js' ||
      filename === 'genuin-sdk-legacy.js'
    ) {
      return true
    }

    // Include bundle size report
    if (filename === 'bundle-size-report.json') {
      return true
    }

    // Include hashed ES module files (pattern: genuin-sdk-[hash].js)
    if (
      filename.startsWith('genuin-sdk-') &&
      filename.endsWith('.js') &&
      !filename.includes('legacy') &&
      filename.match(/genuin-sdk-[a-zA-Z0-9_-]+\.js$/)
    ) {
      return true
    }

    // Include all chunk files (.js files in chunks directory)
    if (file.includes('chunks/') && ext === '.js') {
      return true
    }

    // Include source maps for QA environment (for debugging)
    if (!isProduction && ext === '.map') {
      return true
    }

    // Include all CSS files from assets directory (both hashed and non-hashed)
    // Pattern: web-sdk.css or web-sdk-[hash].css
    if (file.includes('assets/') && ext === '.css') {
      if (
        filename === 'web-sdk.css' ||
        filename.match(/web-sdk-[a-zA-Z0-9_-]+\.css$/)
      ) {
        return true
      }
    }

    return false
  })

  console.log(chalk.blue(`\nDiscovered ${buildFiles.length} files to upload:`))
  buildFiles.forEach((file) => console.log(chalk.gray(`  • ${file}`)))

  return buildFiles
}

/**
 * Uploads a single file to Oracle Object Storage with proper directory structure
 *
 * @param {S3Client} client - Initialized S3 client configured for Oracle
 * @param {string} bucketName - Target Oracle Object Storage bucket name (namespace)
 * @param {string} filePath - Local path of file to upload
 * @param {string} oracleBucketPath - Target base path in Oracle Object Storage bucket
 * @param {cliProgress.SingleBar} progressBar - Progress bar instance
 * @returns {Promise<void>}
 */
async function uploadFile(
  client: S3Client,
  bucketName: string,
  filePath: string,
  oracleBucketPath: string,
  progressBar: cliProgress.SingleBar,
): Promise<void> {
  const fileContent = fs.readFileSync(filePath)

  // Preserve directory structure relative to dist/
  const relativePath = path.relative('dist', filePath)
  const oracleKey = `${oracleBucketPath.replace(/^\//, '')}/${relativePath}`

  // Determine content type based on file extension
  const ext = path.extname(filePath).toLowerCase()
  let contentType = 'application/octet-stream'

  if (ext === '.js') {
    contentType = 'application/javascript'
  } else if (ext === '.css') {
    contentType = 'text/css'
  } else if (ext === '.map') {
    contentType = 'application/json'
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: oracleKey,
    Body: fileContent,
    ContentType: contentType,
  })

  try {
    await client.send(command)
    progressBar.increment()
    console.log(
      chalk.green(
        `✓ Successfully uploaded ${relativePath} to ${oracleBucketPath}/${relativePath}`,
      ),
    )
  } catch (error) {
    console.error(
      chalk.red(
        `✗ Failed to upload ${relativePath} to ${oracleBucketPath}/${relativePath}`,
      ),
    )
    throw error
  }
}

/**
 * Main function to handle the Oracle Object Storage upload process
 *
 * Process:
 * 1. Load and validate Oracle configuration
 * 2. Prompt for user confirmation
 * 3. Allow path selection
 * 4. Initialize Oracle-compatible S3 client
 * 5. Upload files with progress tracking
 *
 * @returns {Promise<void>}
 */
export async function uploadBuildsToOracle(): Promise<void> {
  const oracleConfig = await getOracleConfig()

  // If Oracle configuration is not found, skip upload silently
  if (!oracleConfig) {
    return
  }

  const {
    bucketName,
    region,
    endpointUrl,
    namespace,
    accessKeyId,
    secretAccessKey,
    paths,
  } = oracleConfig

  // Prompt user if they want to upload to Oracle Object Storage
  const shouldUpload = await confirm({
    message: 'Do you want to upload the build files to Oracle Object Storage?',
    default: false,
  })

  if (!shouldUpload) {
    return
  }

  // Prompt user to select paths
  const selectedPaths = await checkbox<string>({
    message: 'Select the paths where you want to upload the build files:',
    choices: paths.map((path) => ({
      value: path,
      label: path,
    })),
    validate(selected) {
      return selected.length > 0 || 'You must select at least one path'
    },
  })

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
    signatureVersion: 'v4', // AWS Signature Version 4
  })

  // Dynamically discover all build files
  const buildFiles = getBuildFiles()

  if (buildFiles.length === 0) {
    console.log(chalk.yellow('⚠ No build files found to upload'))
    return
  }

  // Filter to existing files and log warnings for missing ones
  const existingBuildFiles: string[] = []
  for (const filePath of buildFiles) {
    if (!fs.existsSync(filePath)) {
      console.warn(
        chalk.yellow(`⚠ Warning: ${filePath} does not exist, skipping...`),
      )
    } else {
      existingBuildFiles.push(filePath)
    }
  }

  const totalUploads = existingBuildFiles.length * selectedPaths.length

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format:
      'Uploading files |' +
      chalk.cyan('{bar}') +
      '| {percentage}% || {value}/{total} Files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  })

  console.log(chalk.blue('\nStarting Oracle Object Storage upload...'))
  progressBar.start(totalUploads, 0)

  try {
    // Create upload promises for all file-path combinations
    const uploadPromises: Promise<void>[] = []
    for (const filePath of existingBuildFiles) {
      for (const uploadPath of selectedPaths) {
        uploadPromises.push(
          uploadFile(
            oracleS3Client,
            bucketName,
            filePath,
            uploadPath,
            progressBar,
          ),
        )
      }
    }

    // Upload all files in parallel
    await Promise.all(uploadPromises)

    progressBar.stop()
    console.log(
      chalk.green('\n✓ Oracle Object Storage upload completed successfully!'),
    )
    console.log(
      chalk.blue(
        `\nFiles uploaded to Oracle Object Storage namespace: ${namespace}`,
      ),
    )
    console.log(chalk.blue(`Region: ${region}`))
    console.log(chalk.blue(`Endpoint: ${endpointUrl}`))
    console.log(chalk.blue('\nFiles can be accessed at:'))
    for (const uploadPath of selectedPaths) {
      const cleanPath = uploadPath.replace(/^\//, '').replace(/\/$/, '')
      const accessUrl = `${endpointUrl}/${cleanPath}/`
      console.log(chalk.cyan(`  • ${accessUrl}`))
    }

    // Purge Bunny CDN cache
    try {
      await purgeBunnyCDN(selectedPaths)
    } catch (error) {
      console.error(
        chalk.red('\n⚠ Bunny CDN purge failed (non-critical):'),
        error,
      )
      // Don't fail the entire process if Bunny CDN purge fails
    }
  } catch (error) {
    progressBar.stop()
    console.error(
      chalk.red('\n✗ Oracle Object Storage upload process failed:'),
      error,
    )
    process.exit(1)
  }
}

// Run the upload if this script is called directly
if (require.main === module) {
  uploadBuildsToOracle().catch(console.error)
}
