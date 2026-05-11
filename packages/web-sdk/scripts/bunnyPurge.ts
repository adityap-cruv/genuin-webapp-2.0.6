/**
 * Bunny CDN Purge Script for SDK Builds
 * =====================================
 *
 * This script handles purging Bunny CDN cache after SDK builds are uploaded to S3.
 * It provides functionality to purge specific paths based on upload configuration.
 *
 * Key Features:
 * - Environment-specific CDN URL construction
 * - Batch processing for rate limit compliance
 * - Comprehensive error handling and logging
 * - Integration with existing upload process
 *
 * Environment Configuration:
 * -------------------------
 * Required Environment Variables:
 * - BUNNY_API_KEY: Bunny CDN API access key
 * - MEDIA_BASE_URL: Base CDN URL for the environment
 *
 * Rate Limiting:
 * -------------
 * Bunny CDN has rate limits, so we process purge requests in batches
 * with appropriate delays between batches.
 */

import chalk from "chalk";
import dotenv from "dotenv";

/**
 * Configuration interface for Bunny CDN purge settings
 */
type BunnyConfig = {
  apiKey: string;
  mediaBaseUrl: string;
};

/**
 * File path information for purge operations
 */
type FilePath = {
  Key: string;
};

/**
 * Loads and validates Bunny CDN configuration from environment files
 *
 * @returns {Promise<BunnyConfig | null>} Configuration object or null if invalid
 */
async function getBunnyConfig(): Promise<BunnyConfig | null> {
  const NODE_ENV = process.env.NODE_ENV || "qa";

  // Load environment variables in order of priority
  const commonEnv = dotenv.config({ path: ".env.common" }).parsed || {};
  const envFile = NODE_ENV === "production" ? ".env.production" : ".env.qa";
  const envConfig = dotenv.config({ path: envFile }).parsed || {};

  // Combine environment variables
  const combinedEnv = { ...envConfig, ...commonEnv };

  const apiKey = combinedEnv.BUNNY_API_KEY;
  const mediaBaseUrl = combinedEnv.MEDIA_BASE_URL;

  // Debug information
  console.log(chalk.blue("\nChecking Bunny CDN configuration:"));
  console.log("Environment:", chalk.yellow(NODE_ENV));
  console.log("API Key:", chalk.yellow(apiKey ? "set" : "not set"));
  console.log("Media Base URL:", chalk.yellow(mediaBaseUrl || "not set"));

  // If any required configuration is missing, return null
  if (!apiKey || !mediaBaseUrl) {
    console.log(chalk.red("❌ Missing required Bunny CDN configuration"));
    return null;
  }

  console.log(chalk.green("✓ Bunny CDN configuration found"));
  return {
    apiKey,
    mediaBaseUrl,
  };
}

/**
 * Constructs full CDN URLs for purging based on upload paths
 *
 * @param {string[]} uploadPaths - The S3 upload paths that were used
 * @param {string} mediaBaseUrl - Base CDN URL
 * @returns {string[]} Array of full URLs to purge
 */
function constructPurgeUrls(uploadPaths: string[], mediaBaseUrl: string): string[] {
  return uploadPaths.map((path) => {
    // Remove leading slash if present
    const cleanPath = path.replace(/^\//, "");

    // Construct the full URL with wildcard for all files under the path
    return `${mediaBaseUrl}/${cleanPath}/*`;
  });
}

/**
 * Purges a single URL from Bunny CDN
 *
 * @param {string} url - URL to purge
 * @param {string} apiKey - Bunny CDN API key
 * @returns {Promise<boolean>} Success status
 */
async function purgeSingleUrl(url: string, apiKey: string): Promise<boolean> {
  try {
    const purgeUrl = `https://api.bunny.net/purge?async=false&url=${encodeURIComponent(url)}`;

    const response = await fetch(purgeUrl, {
      method: "POST",
      headers: {
        AccessKey: apiKey,
      },
    });

    if (response.ok) {
      console.log(chalk.green(`✓ Purged: ${url} - Status: ${response.status}`));
      return true;
    } else {
      console.error(chalk.red(`✗ Failed to purge: ${url} - Status: ${response.status}`));
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`✗ Error purging: ${url} - ${errorMessage}`));
    return false;
  }
}

/**
 * Purges multiple URLs from Bunny CDN with batch processing and rate limiting
 *
 * @param {string[]} urls - Array of URLs to purge
 * @param {string} apiKey - Bunny CDN API key
 * @returns {Promise<void>}
 */
async function purgeBunnyUrls(urls: string[], apiKey: string): Promise<void> {
  console.log(chalk.blue("\nStarting Bunny CDN purge..."));
  console.log(chalk.gray(`URLs to purge: ${urls.length}`));

  let successful = 0;
  const batchSize = 10; // Process in batches to respect rate limits
  const batches: string[][] = [];

  // Split URLs into batches
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  console.log(chalk.blue(`Processing ${batches.length} batches of up to ${batchSize} URLs each...`));

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(chalk.blue(`\nProcessing batch ${i + 1}/${batches.length}...`));

    // Process all URLs in the current batch concurrently
    const batchResults = await Promise.all(batch.map((url) => purgeSingleUrl(url, apiKey)));

    successful += batchResults.filter((result) => result).length;

    // Add delay between batches to respect rate limits (except for the last batch)
    if (i < batches.length - 1) {
      console.log(chalk.gray("Waiting 200ms before next batch..."));
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log(chalk.green(`\n✓ Bunny CDN purge completed: ${successful}/${urls.length} successful`));
}

/**
 * Main function to handle Bunny CDN cache purging
 *
 * @param {string[]} uploadPaths - The S3 upload paths that were used for deployment
 * @returns {Promise<void>}
 */
export async function purgeBunnyCDN(uploadPaths: string[]): Promise<void> {
  const bunnyConfig = await getBunnyConfig();

  // If Bunny CDN configuration is not found, skip purge silently
  if (!bunnyConfig) {
    console.log(chalk.yellow("⚠ Bunny CDN not configured, skipping cache purge"));
    return;
  }

  const { apiKey, mediaBaseUrl } = bunnyConfig;

  if (uploadPaths.length === 0) {
    console.log(chalk.yellow("⚠ No upload paths provided, skipping Bunny CDN purge"));
    return;
  }

  // Construct full URLs to purge
  const urlsToPurge = constructPurgeUrls(uploadPaths, mediaBaseUrl);

  console.log(chalk.blue("\nBunny CDN purge URLs:"));
  urlsToPurge.forEach((url) => console.log(chalk.gray(`  • ${url}`)));

  try {
    await purgeBunnyUrls(urlsToPurge, apiKey);
  } catch (error) {
    console.error(chalk.red("\n✗ Bunny CDN purge process failed:"), error);
    throw error;
  }
}

/**
 * Legacy compatibility function that mimics the backend's invalidateBunnyCDN function
 * for cases where file paths need to be processed differently
 *
 * @param {FilePath[]} filePaths - Array of file path objects with Key property
 * @returns {Promise<void>}
 */
export async function invalidateBunnyCDN(filePaths: FilePath[]): Promise<void> {
  const bunnyConfig = await getBunnyConfig();

  if (!bunnyConfig) {
    console.log(chalk.yellow("⚠ Bunny CDN not configured, skipping cache invalidation"));
    return;
  }

  const { apiKey, mediaBaseUrl } = bunnyConfig;

  try {
    // Convert file paths to full URLs
    const itemsToInvalidate = filePaths.map((fp) => {
      if (fp.Key.startsWith("http")) {
        return fp.Key;
      }
      return `${mediaBaseUrl}/${fp.Key.replace(/^\//, "")}`;
    });

    await purgeBunnyUrls(itemsToInvalidate, apiKey);
  } catch (error) {
    console.error(chalk.red("Failed to invalidate Bunny CDN cache:"), error);
    throw error;
  }
}

// Export all functions for external use
export { getBunnyConfig, constructPurgeUrls, purgeSingleUrl, purgeBunnyUrls };
