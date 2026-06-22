import chalk from 'chalk';
import dotenv from 'dotenv';

type BunnyConfig = {
  apiKey: string;
  mediaBaseUrl: string;
};

type FilePath = {
  Key: string;
};

/**
 * Loads Bunny CDN credentials from .env.common and the env-specific file.
 * Returns null if any required variable is missing (upload proceeds without purge).
 */
async function getBunnyConfig(): Promise<BunnyConfig | null> {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';

  const commonEnv = dotenv.config({ path: '.env.common' }).parsed ?? {};
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa';
  const envConfig = dotenv.config({ path: envFile }).parsed ?? {};
  const combinedEnv = { ...commonEnv, ...envConfig };

  const apiKey = combinedEnv['BUNNY_API_KEY'];
  const mediaBaseUrl = combinedEnv['MEDIA_BASE_URL'];

  console.log(chalk.blue('\nChecking Bunny CDN configuration:'));
  console.log('Environment:', chalk.yellow(NODE_ENV));
  console.log('API Key:', chalk.yellow(apiKey ? 'set' : 'not set'));
  console.log('Media Base URL:', chalk.yellow(mediaBaseUrl ?? 'not set'));

  if (!apiKey || !mediaBaseUrl) {
    console.log(chalk.red('❌ Missing required Bunny CDN configuration'));
    return null;
  }

  console.log(chalk.green('✓ Bunny CDN configuration found'));
  return { apiKey, mediaBaseUrl };
}

/**
 * Constructs wildcard CDN URLs for purging: `${mediaBaseUrl}/<path>/*`
 */
function constructPurgeUrls(uploadPaths: string[], mediaBaseUrl: string): string[] {
  return uploadPaths.map((p) => {
    const cleanPath = p.replace(/^\//, '');
    return `${mediaBaseUrl}/${cleanPath}/*`;
  });
}

/** Purges a single URL from Bunny CDN. Returns true on success. */
async function purgeSingleUrl(url: string, apiKey: string): Promise<boolean> {
  try {
    const purgeUrl = `https://api.bunny.net/purge?async=false&url=${encodeURIComponent(url)}`;
    const response = await fetch(purgeUrl, {
      method: 'POST',
      headers: { AccessKey: apiKey },
    });

    if (response.ok) {
      console.log(chalk.green(`✓ Purged: ${url} - Status: ${response.status}`));
      return true;
    } else {
      console.error(chalk.red(`✗ Failed to purge: ${url} - Status: ${response.status}`));
      return false;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`✗ Error purging: ${url} - ${msg}`));
    return false;
  }
}

/** Purges an array of URLs in batches of 10, with 200 ms delay between batches. */
async function purgeBunnyUrls(urls: string[], apiKey: string): Promise<void> {
  console.log(chalk.blue('\nStarting Bunny CDN purge...'));
  console.log(chalk.gray(`URLs to purge: ${urls.length}`));

  let successful = 0;
  const batchSize = 10;
  const batches: string[][] = [];

  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  console.log(chalk.blue(`Processing ${batches.length} batches of up to ${batchSize} URLs each...`));

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]!;
    console.log(chalk.blue(`\nProcessing batch ${i + 1}/${batches.length}...`));
    const results = await Promise.all(batch.map((url) => purgeSingleUrl(url, apiKey)));
    successful += results.filter(Boolean).length;

    if (i < batches.length - 1) {
      console.log(chalk.gray('Waiting 200ms before next batch...'));
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  console.log(chalk.green(`\n✓ Bunny CDN purge completed: ${successful}/${urls.length} successful`));
}

/**
 * Purges Bunny CDN cache for the given Oracle upload paths.
 * Non-fatal if Bunny CDN is not configured.
 *
 * @param uploadPaths - The Oracle paths that were just uploaded (e.g. ['cxr/1.0.0'])
 */
export async function purgeBunnyCDN(uploadPaths: string[]): Promise<void> {
  const bunnyConfig = await getBunnyConfig();

  if (!bunnyConfig) {
    console.log(chalk.yellow('⚠ Bunny CDN not configured, skipping cache purge'));
    return;
  }

  const { apiKey, mediaBaseUrl } = bunnyConfig;

  if (uploadPaths.length === 0) {
    console.log(chalk.yellow('⚠ No upload paths provided, skipping Bunny CDN purge'));
    return;
  }

  const urlsToPurge = constructPurgeUrls(uploadPaths, mediaBaseUrl);
  console.log(chalk.blue('\nBunny CDN purge URLs:'));
  urlsToPurge.forEach((url) => console.log(chalk.gray(`  • ${url}`)));

  await purgeBunnyUrls(urlsToPurge, apiKey);
}

/**
 * Legacy compatibility — accepts `{ Key: string }[]` objects instead of plain strings.
 */
export async function invalidateBunnyCDN(filePaths: FilePath[]): Promise<void> {
  const bunnyConfig = await getBunnyConfig();
  if (!bunnyConfig) {
    console.log(chalk.yellow('⚠ Bunny CDN not configured, skipping cache invalidation'));
    return;
  }

  const { apiKey, mediaBaseUrl } = bunnyConfig;
  const urls = filePaths.map((fp) =>
    fp.Key.startsWith('http') ? fp.Key : `${mediaBaseUrl}/${fp.Key.replace(/^\//, '')}`,
  );
  await purgeBunnyUrls(urls, apiKey);
}

export { getBunnyConfig, constructPurgeUrls, purgeSingleUrl, purgeBunnyUrls };
