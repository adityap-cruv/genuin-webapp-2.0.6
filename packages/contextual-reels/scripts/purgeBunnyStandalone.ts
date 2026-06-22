#!/usr/bin/env tsx
import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import { purgeBunnyCDN } from './bunnyPurge.js';

const PREDEFINED_PATHS = ['cxr/1.0.0', 'cxr'];

/**
 * Standalone Bunny CDN purge tool.
 * Usage:
 *   npm run purge:bunny:qa              — interactive path selection
 *   npm run purge:bunny:qa cxr/1.0.0   — purge specific path directly
 */
async function main(): Promise<void> {
  console.log(chalk.blue('🔥 Bunny CDN Cache Purge Tool'));
  console.log(chalk.gray('==============================\n'));

  const args = process.argv.slice(2);
  let pathsToPurge: string[];

  if (args.length > 0) {
    pathsToPurge = args;
    console.log(chalk.blue('Paths provided via command line:'));
    pathsToPurge.forEach((p) => console.log(chalk.gray(`  • ${p}`)));
  } else {
    pathsToPurge = await checkbox<string>({
      message: 'Select the paths you want to purge from Bunny CDN:',
      choices: PREDEFINED_PATHS.map((p) => ({ value: p, label: p })),
      validate: (selected) => selected.length > 0 || 'You must select at least one path',
    });
  }

  if (pathsToPurge.length === 0) {
    console.log(chalk.yellow('⚠ No paths selected, exiting...'));
    return;
  }

  try {
    await purgeBunnyCDN(pathsToPurge);
    console.log(chalk.green('\n🎉 Bunny CDN purge completed successfully!'));
  } catch (error) {
    console.error(chalk.red('\n💥 Bunny CDN purge failed:'), error);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(chalk.red('💥 Script failed:'), error);
  process.exit(1);
});

export { main as purgeBunnyCDNStandalone };
