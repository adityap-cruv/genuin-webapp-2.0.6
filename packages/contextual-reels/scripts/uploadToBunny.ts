import fs from "fs";
import path from "path";

import chalk from "chalk";
import cliProgress from "cli-progress";
import dotenv from "dotenv";

import { getBuildFiles, contentTypeFor } from "./buildFiles.js";
import { purgeBunnyStorage } from "./bunnyPurge.js";
import type { UploadOptions } from "./uploadToOracle.js";

type BunnyStorageConfig = {
  accessKey: string;
  zone: string;
  /** Native Storage host, e.g. https://storage.bunnycdn.com (region-prefixed for non-default regions). */
  storageHost: string;
};

/**
 * Loads Bunny Storage credentials from .env.common and the env-specific file.
 * Returns null (with a logged reason) if any key is missing; the caller turns that
 * into a hard error so a selected-but-misconfigured target never reports success.
 */
export async function getBunnyStorageConfig(): Promise<BunnyStorageConfig | null> {
  const NODE_ENV = process.env.NODE_ENV ?? "qa";
  const commonEnv = dotenv.config({ path: ".env.common" }).parsed ?? {};
  const envFile = NODE_ENV === "production" ? ".env.production" : ".env.qa";
  const envConfig = dotenv.config({ path: envFile }).parsed ?? {};
  const combinedEnv = { ...commonEnv, ...envConfig };

  const accessKey = combinedEnv["BUNNY_STORAGE_ACCESS_KEY"];
  const zone = combinedEnv["BUNNY_STORAGE_ZONE"];
  // BUNNY_STORAGE_ENDPOINT is the native Storage host. Fall back to the global host,
  // which routes to the zone's region internally.
  const storageHost = combinedEnv["BUNNY_STORAGE_ENDPOINT"] || "https://storage.bunnycdn.com";

  console.log(chalk.blue("\nChecking Bunny Storage configuration:"));
  console.log("Environment:", chalk.yellow(NODE_ENV));
  console.log("Access Key:", chalk.yellow(accessKey ? "***configured***" : "not set"));
  console.log("Zone:", chalk.yellow(zone ?? "not set"));
  console.log("Storage host:", chalk.yellow(storageHost));

  if (!accessKey || !zone) {
    console.log(chalk.red("❌ Missing required Bunny Storage configuration"));
    return null;
  }

  console.log(chalk.green("✓ Bunny Storage configuration found"));
  return { accessKey, zone, storageHost };
}

/**
 * Uploads a single file to Bunny Storage via the native Storage HTTP API.
 *
 * Bunny's S3-compatible gateway rejects our SigV4 requests with AccessDenied, but the
 * native `PUT https://<host>/<zone>/<path>` endpoint with an `AccessKey` header works.
 * A successful upload returns HTTP 201.
 */
async function uploadFile(
  storageHost: string,
  zone: string,
  accessKey: string,
  filePath: string,
  bunnyBasePath: string,
  progressBar: cliProgress.SingleBar
): Promise<void> {
  const fileContent = fs.readFileSync(filePath);
  const relativePath = path.relative("dist", filePath);
  const key = `${bunnyBasePath.replace(/^\//, "")}/${relativePath}`;
  const url = `${storageHost.replace(/\/$/, "")}/${zone}/${key}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: accessKey,
      "Content-Type": contentTypeFor(filePath),
    },
    body: fileContent,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error(chalk.red(`✗ Failed to upload ${relativePath} → ${zone}/${key} (HTTP ${response.status})`));
    throw new Error(`Bunny Storage upload failed for ${key}: HTTP ${response.status} ${body}`.trim());
  }

  progressBar.increment();
  console.log(chalk.green(`✓ Uploaded ${relativePath} → ${zone}/${key}`));
}

/**
 * Uploads the current dist/ build to Bunny Storage under each given path, then purges
 * the pull-zone. Prompting/target selection happens upstream in deploy.ts.
 */
export async function uploadBuildsToBunny({ paths, dryRun }: UploadOptions): Promise<void> {
  const config = await getBunnyStorageConfig();
  // A selected target with missing config is a hard failure — the deploy was asked to
  // upload here and cannot. Throw so the orchestrator records it (never a silent success).
  if (!config) {
    throw new Error("Bunny Storage is not configured — cannot upload.");
  }

  const { accessKey, zone, storageHost } = config;
  const selectedPaths = paths;

  const buildFiles = getBuildFiles();
  if (buildFiles.length === 0) {
    throw new Error("No build files found in dist/ — run the build before deploying.");
  }

  if (dryRun) {
    console.log(chalk.magenta("\n[dry-run] Bunny Storage — would upload:"));
    for (const filePath of buildFiles) {
      const relativePath = path.relative("dist", filePath);
      for (const uploadPath of selectedPaths) {
        console.log(chalk.gray(`  • ${zone}/${uploadPath.replace(/^\//, "")}/${relativePath}`));
      }
    }
    console.log(chalk.magenta("[dry-run] Bunny Storage — would then purge pull-zone for:"));
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
    format: "Uploading |" + chalk.cyan("{bar}") + "| {percentage}% || {value}/{total} Files",
    barCompleteChar: "█",
    barIncompleteChar: "░",
  });

  console.log(chalk.blue("\nStarting Bunny Storage upload..."));
  progressBar.start(totalUploads, 0);

  try {
    const uploadPromises: Promise<void>[] = [];
    for (const filePath of existingFiles) {
      for (const uploadPath of selectedPaths) {
        uploadPromises.push(uploadFile(storageHost, zone, accessKey, filePath, uploadPath, progressBar));
      }
    }
    await Promise.all(uploadPromises);
    progressBar.stop();

    console.log(chalk.green("\n✓ Bunny Storage upload completed successfully!"));
    console.log(chalk.blue(`\nFiles uploaded to Bunny Storage zone: ${zone}`));
    console.log(chalk.blue(`Storage host: ${storageHost}`));

    try {
      await purgeBunnyStorage(selectedPaths);
    } catch (error) {
      console.error(chalk.red("\n⚠ Bunny Storage purge failed (non-critical):"), error);
    }
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red("\n✗ Bunny Storage upload failed:"), error);
    throw error;
  }
}
