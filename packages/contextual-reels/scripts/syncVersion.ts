#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

/**
 * Synchronizes the CXR_VERSION in src/loader.jsx with the version in package.json.
 * Run automatically as part of build:qa and build:prod via prebuild hooks.
 */
function syncVersion(): void {
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
    const currentVersion = packageJson.version;
    if (!currentVersion) {
      throw new Error('package.json is missing a "version" field');
    }

    const loaderPath = path.resolve(process.cwd(), 'src/loader.jsx');
    let loaderContent = fs.readFileSync(loaderPath, 'utf-8');

    const versionRegex = /var CXR_VERSION = '[^']*'/;
    const newVersionLine = `var CXR_VERSION = '${currentVersion}'`;

    if (versionRegex.test(loaderContent)) {
      const oldMatch = loaderContent.match(versionRegex)?.[0];
      loaderContent = loaderContent.replace(versionRegex, newVersionLine);
      fs.writeFileSync(loaderPath, loaderContent, 'utf-8');

      console.log(chalk.green('✓ CXR_VERSION synchronized successfully'));
      console.log(chalk.blue(`  Package version: ${currentVersion}`));
      console.log(chalk.blue(`  Updated: ${oldMatch} → ${newVersionLine}`));
    } else {
      console.warn(chalk.yellow('⚠ CXR_VERSION not found in src/loader.jsx'));
      console.log(chalk.yellow("  Ensure loader.jsx contains: var CXR_VERSION = '...' pattern"));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error synchronizing version:'));
    console.error(error);
    process.exit(1);
  }
}

syncVersion();
