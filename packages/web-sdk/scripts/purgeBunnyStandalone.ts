#!/usr/bin/env tsx

/**
 * Standalone Bunny CDN Purge Script
 * =================================
 *
 * This script can be run independently to purge Bunny CDN cache for specific paths.
 * It's useful for manual cache purging or integration into other deployment processes.
 *
 * Usage:
 *   npm run purge:bunny [path1] [path2] ...
 *
 * Examples:
 *   npm run purge:bunny sdk/2.0.0
 *   npm run purge:bunny sdk sdk/2.0.0
 *
 * If no paths are provided, it will prompt for interactive selection.
 */

import { checkbox } from "@inquirer/prompts";
import chalk from "chalk";
import { purgeBunnyCDN } from "./bunnyPurge";

/**
 * Main function for standalone Bunny CDN purging
 */
async function main(): Promise<void> {
  console.log(chalk.blue("🔥 Bunny CDN Cache Purge Tool"));
  console.log(chalk.gray("==============================\n"));

  // Get command line arguments (skip first two: node and script path)
  const args = process.argv.slice(2);
  let pathsToPurge: string[] = [];

  if (args.length > 0) {
    // Use paths provided as command line arguments
    pathsToPurge = args;
    console.log(chalk.blue("Paths provided via command line:"));
    pathsToPurge.forEach((path) => console.log(chalk.gray(`  • ${path}`)));
  } else {
    // Interactive path selection
    const predefinedPaths = [
      "sdk", // Root SDK path (all versions)
      "sdk/2.0.0", // Specific version
      "sdk/1.2.7", // Legacy version
    ];

    pathsToPurge = await checkbox<string>({
      message: "Select the paths you want to purge from Bunny CDN:",
      choices: predefinedPaths.map((path) => ({
        value: path,
        label: path,
      })),
      validate(selected) {
        return selected.length > 0 || "You must select at least one path";
      },
    });
  }

  if (pathsToPurge.length === 0) {
    console.log(chalk.yellow("⚠ No paths selected, exiting..."));
    return;
  }

  try {
    await purgeBunnyCDN(pathsToPurge);
    console.log(chalk.green("\n🎉 Bunny CDN purge completed successfully!"));
  } catch (error) {
    console.error(chalk.red("\n💥 Bunny CDN purge failed:"), error);
    process.exit(1);
  }
}

// Run the main function if this script is called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red("💥 Script failed:"), error);
    process.exit(1);
  });
}

export { main as purgeBunnyCDNStandalone };
