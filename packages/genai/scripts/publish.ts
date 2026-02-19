/**
 * S3 Upload Script for SDK Builds
 * ==============================
 *
 * This script handles uploading SDK build files to AWS S3 and invalidating CloudFront cache.
 * It provides an interactive CLI interface for selecting upload paths and confirming actions.
 *
 * Key Features:
 * - Supports multiple environment configurations (QA, Production)
 * - Flexible AWS credentials management (environment variables or AWS CLI profile)
 * - Interactive path selection
 * - Progress tracking for uploads
 * - Automatic CloudFront cache invalidation
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
 * - S3_BUCKET_NAME: Target S3 bucket
 * - S3_REGION: AWS region for the bucket
 * - S3_UPLOAD_PATHS: Comma-separated list of valid upload paths
 * - CLOUDFRONT_DISTRIBUTION_ID: (Optional) For cache invalidation
 *
 * AWS Authentication:
 * ------------------
 * Two authentication methods are supported:
 * 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 * 2. AWS CLI configuration (recommended)
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront'
import { fromIni } from '@aws-sdk/credential-provider-ini'
import fs from 'fs'
import path from 'path'
import { confirm, checkbox } from '@inquirer/prompts'
import chalk from 'chalk'
import dotenv from 'dotenv'
import cliProgress from 'cli-progress'

/**
 * Configuration interface for S3 upload settings
 */
type S3Config = {
  bucketName: string
  region: string
  paths: string[]
  accessKeyId?: string
  secretAccessKey?: string
  distributionId?: string
}

/**
 * Loads and validates S3 configuration from environment files
 * Combines variables from common and environment-specific config files
 * Performs validation and logs configuration status
 *
 * @returns {Promise<S3Config | null>} Configuration object or null if invalid
 */
async function getS3Config(): Promise<S3Config | null> {
  const NODE_ENV = process.env.NODE_ENV || 'qa'

  // Load environment variables in order of priority
  const commonEnv = dotenv.config({ path: '.env.common' }).parsed || {}
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa'
  const envConfig = dotenv.config({ path: envFile }).parsed || {}

  // Combine environment variables
  const combinedEnv = { ...envConfig, ...commonEnv }

  const bucketName = combinedEnv.S3_BUCKET_NAME
  const region = combinedEnv.S3_REGION
  const paths = combinedEnv.S3_UPLOAD_PATHS?.split(',') || []
  const distributionId = combinedEnv.CLOUDFRONT_DISTRIBUTION_ID

  // Debug information
  console.log(chalk.blue('\nChecking S3 configuration:'))
  console.log('Environment:', chalk.yellow(NODE_ENV))
  console.log('Bucket:', chalk.yellow(bucketName || 'not set'))
  console.log('Region:', chalk.yellow(region || 'not set'))
  console.log('Paths:', chalk.yellow(paths.join(', ') || 'not set'))
  console.log(
    'CloudFront Distribution:',
    chalk.yellow(distributionId || 'not set'),
  )

  // If any required S3 configuration is missing, return null
  if (!bucketName || !region || paths.length === 0) {
    console.log(chalk.red('❌ Missing required S3 configuration'))
    return null
  }

  console.log(chalk.green('✓ S3 configuration found'))
  return {
    bucketName,
    region,
    paths,
    accessKeyId: combinedEnv.AWS_ACCESS_KEY_ID || undefined,
    secretAccessKey: combinedEnv.AWS_SECRET_ACCESS_KEY || undefined,
    distributionId: combinedEnv.CLOUDFRONT_DISTRIBUTION_ID,
  }
}

/**
 * Uploads a single file to S3
 *
 * @param {S3Client} client - Initialized S3 client
 * @param {string} bucketName - Target S3 bucket name
 * @param {string} filePath - Local path of file to upload
 * @param {string} s3Path - Target path in S3 bucket
 * @param {cliProgress.SingleBar} progressBar - Progress bar instance
 * @returns {Promise<void>}
 */
async function uploadFile(
  client: S3Client,
  bucketName: string,
  filePath: string,
  s3Path: string,
  progressBar: cliProgress.SingleBar,
): Promise<void> {
  const fileContent = fs.readFileSync(filePath)
  const fileName = path.basename(filePath)
  const s3Key = `${s3Path.replace(/^\//, '')}/${fileName}`

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: fileContent,
    ContentType: fileName.endsWith('.js')
      ? 'application/javascript'
      : 'text/css',
  })

  try {
    await client.send(command)
    progressBar.increment()
    console.log(chalk.green(`✓ Successfully uploaded ${fileName} to ${s3Key}`))
  } catch (error) {
    console.error(chalk.red(`✗ Failed to upload ${fileName} to ${s3Key}`))
    throw error
  }
}

/**
 * Creates a CloudFront cache invalidation for uploaded files
 *
 * @param {CloudFrontClient} client - Initialized CloudFront client
 * @param {string} distributionId - CloudFront distribution ID
 * @param {string[]} paths - Paths to invalidate
 * @returns {Promise<void>}
 */
async function invalidateCloudFrontCache(
  client: CloudFrontClient,
  distributionId: string,
  paths: string[],
): Promise<void> {
  console.log(chalk.blue('\nInvalidating CloudFront cache...'))

  try {
    const invalidationPaths = paths.map((path) => `${path}/*`)
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: invalidationPaths.length,
          Items: invalidationPaths,
        },
      },
    })

    const response = await client.send(command)
    console.log(
      chalk.green(`✓ Cache invalidation created: ${response.Invalidation?.Id}`),
    )
    console.log(
      chalk.yellow(
        'Note: Cache invalidation may take up to 5-10 minutes to complete',
      ),
    )
  } catch (error) {
    console.error(chalk.red('✗ Failed to invalidate CloudFront cache:'), error)
    throw error
  }
}

/**
 * Main function to handle the upload process
 *
 * Process:
 * 1. Load and validate configuration
 * 2. Prompt for user confirmation
 * 3. Allow path selection
 * 4. Initialize AWS clients
 * 5. Upload files with progress tracking
 * 6. Invalidate CloudFront cache if configured
 *
 * @returns {Promise<void>}
 */
export async function uploadBuildsToS3(): Promise<void> {
  const s3Config = await getS3Config()

  // If S3 configuration is not found, skip upload silently
  if (!s3Config) {
    return
  }

  const {
    bucketName,
    region,
    paths,
    accessKeyId,
    secretAccessKey,
    distributionId,
  } = s3Config

  // Prompt user if they want to upload to S3
  const shouldUpload = await confirm({
    message: 'Do you want to upload the build files to S3?',
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

  // Initialize AWS clients with credentials provider chain
  const credentials =
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : fromIni()

  const s3Client = new S3Client({ region, credentials })
  const cloudFrontClient = new CloudFrontClient({ region, credentials })

  const buildFiles = ['dist/gen_sdk.min.js', 'dist/gen-sdk.css']
  const totalUploads = buildFiles.length * selectedPaths.length

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format:
      'Uploading files |' +
      chalk.cyan('{bar}') +
      '| {percentage}% || {value}/{total} Files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  })

  console.log(chalk.blue('\nStarting S3 upload...'))
  progressBar.start(totalUploads, 0)

  try {
    for (const filePath of buildFiles) {
      if (!fs.existsSync(filePath)) {
        console.warn(
          chalk.yellow(`⚠ Warning: ${filePath} does not exist, skipping...`),
        )
        progressBar.increment(selectedPaths.length) // Skip progress for missing files
        continue
      }

      for (const uploadPath of selectedPaths) {
        await uploadFile(
          s3Client,
          bucketName,
          filePath,
          uploadPath,
          progressBar,
        )
      }
    }

    progressBar.stop()
    console.log(chalk.green('\n✓ S3 upload completed successfully!'))

    // Invalidate CloudFront cache if distribution ID is provided
    if (distributionId) {
      await invalidateCloudFrontCache(
        cloudFrontClient,
        distributionId,
        selectedPaths,
      )
    } else {
      console.log(
        chalk.yellow(
          '\n⚠ No CloudFront distribution ID provided, skipping cache invalidation',
        ),
      )
    }
  } catch (error) {
    progressBar.stop()
    console.error(chalk.red('\n✗ Upload process failed:'), error)
    process.exit(1)
  }
}

// Run the upload if this script is called directly
if (require.main === module) {
  uploadBuildsToS3().catch(console.error)
}
