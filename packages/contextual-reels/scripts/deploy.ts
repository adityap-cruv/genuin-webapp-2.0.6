#!/usr/bin/env tsx
import { confirm, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import dotenv from 'dotenv';

import { uploadBuildsToBunny } from './uploadToBunny.js';
import { uploadBuildsToOracle } from './uploadToOracle.js';
import type { UploadOptions } from './uploadToOracle.js';

type Target = {
  id: 'oracle' | 'bunny';
  label: string;
  run: (opts: UploadOptions) => Promise<void>;
};

const TARGETS: Target[] = [
  { id: 'oracle', label: 'Oracle Object Storage', run: uploadBuildsToOracle },
  { id: 'bunny', label: 'Bunny Storage', run: uploadBuildsToBunny },
];

/** Reads S3_UPLOAD_PATHS from .env.common + the env-specific file. */
function getConfiguredPaths(): string[] {
  const NODE_ENV = process.env.NODE_ENV ?? 'qa';
  const commonEnv = dotenv.config({ path: '.env.common' }).parsed ?? {};
  const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.qa';
  const envConfig = dotenv.config({ path: envFile }).parsed ?? {};
  const combinedEnv = { ...commonEnv, ...envConfig };
  return (combinedEnv['S3_UPLOAD_PATHS'] ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  const isInteractive = process.argv.includes('--interactive');
  const dryRun = process.argv.includes('--dry-run');

  console.log(chalk.blue('🚀 Contextual Reels Deploy'));
  console.log(chalk.gray('==========================\n'));
  if (dryRun) console.log(chalk.magenta('DRY RUN — no files will be uploaded or purged.\n'));

  const configuredPaths = getConfiguredPaths();
  if (configuredPaths.length === 0) {
    console.error(chalk.red('❌ S3_UPLOAD_PATHS is not set — nothing to deploy.'));
    process.exit(1);
  }

  // Resolve which targets to run.
  let selectedTargets: Target[];
  if (isInteractive) {
    const chosen = await checkbox<Target['id']>({
      message: 'Select the storage targets to upload to:',
      choices: TARGETS.map((t) => ({ value: t.id, name: t.label, checked: true })),
      validate: (selected) => selected.length > 0 || 'You must select at least one target',
    });
    selectedTargets = TARGETS.filter((t) => chosen.includes(t.id));
  } else {
    selectedTargets = TARGETS;
    console.log(
      chalk.blue(`CI mode: uploading to all targets: ${selectedTargets.map((t) => t.label).join(', ')}`),
    );
  }

  // Resolve which paths to use.
  let selectedPaths: string[];
  if (isInteractive) {
    selectedPaths = await checkbox<string>({
      message: 'Select the paths to upload the build files to:',
      choices: configuredPaths.map((p) => ({ value: p, name: p, checked: true })),
      validate: (selected) => selected.length > 0 || 'You must select at least one path',
    });
    const proceed = await confirm({
      message: `Upload to [${selectedTargets.map((t) => t.label).join(', ')}] at [${selectedPaths.join(', ')}]?`,
      default: true,
    });
    if (!proceed) {
      console.log(chalk.yellow('Aborted by user.'));
      return;
    }
  } else {
    selectedPaths = configuredPaths;
  }

  // Run each target independently; isolate failures.
  const failures: string[] = [];
  for (const target of selectedTargets) {
    console.log(chalk.blue(`\n──────── ${target.label} ────────`));
    try {
      await target.run({ paths: selectedPaths, dryRun });
    } catch (error) {
      failures.push(target.label);
      console.error(chalk.red(`\n✗ ${target.label} failed:`), error);
    }
  }

  if (failures.length > 0) {
    console.error(chalk.red(`\n💥 Deploy finished with failures: ${failures.join(', ')}`));
    process.exit(1);
  }
  console.log(chalk.green('\n✓ Deploy completed successfully.'));
}

main().catch((error: unknown) => {
  console.error(chalk.red('💥 Deploy script failed:'), error);
  process.exit(1);
});
