#!/usr/bin/env node

/**
 * This script verifies that the correct version of Node.js is being used
 * according to the .nvmrc file.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine if we should enforce or just warn
const isProduction = process.env.NODE_ENV === 'production';
const forceStrictCheck = process.env.FORCE_NODE_VERSION_CHECK === 'true';
// In development, we'll warn but not fail by default
const allowWarningOnly = !isProduction && process.env.ALLOW_NODE_VERSION_WARNING !== 'false';

// Use a simple colorization function if chalk isn't available
let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  chalk = {
    red: text => `\x1b[31m${text}\x1b[0m`,
    yellow: text => `\x1b[33m${text}\x1b[0m`,
    green: text => `\x1b[32m${text}\x1b[0m`,
    cyan: text => `\x1b[36m${text}\x1b[0m`,
    white: text => `\x1b[37m${text}\x1b[0m`,
  };
}

// Path to .nvmrc
const nvmrcPath = path.join(__dirname, '..', '.nvmrc');

// Check if .nvmrc exists
if (!fs.existsSync(nvmrcPath)) {
  console.error(chalk.red('Error: .nvmrc file not found in the project root.'));
  process.exit(1);
}

// Read required Node version from .nvmrc
const requiredNodeVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
const currentNodeVersion = process.version.slice(1); // Remove the 'v' prefix

// Parse versions for comparison
const parseVersionString = versionStr => {
  const parts = versionStr.split('.');
  return {
    major: parseInt(parts[0], 10),
    minor: parseInt(parts[1], 10),
    patch: parseInt(parts[2], 10),
  };
};

const required = parseVersionString(requiredNodeVersion);
const current = parseVersionString(currentNodeVersion);

// Check if current version meets the requirement
const isVersionValid = () => {
  // Check major version first
  if (current.major > required.major) return true;
  if (current.major < required.major) return false;

  // Same major version, check minor
  if (current.minor > required.minor) return true;
  if (current.minor < required.minor) return false;

  // Same major and minor version, check patch
  if (current.patch >= required.patch) return true;
  return false;
};

if (!isVersionValid()) {
  console.error(chalk.yellow(`⚠️  Warning: Node.js version ${requiredNodeVersion} is required.`));
  console.error(chalk.yellow(`You are currently using Node.js ${currentNodeVersion}.`));

  // Provide guidance based on the environment
  console.error(chalk.cyan('\nTo install and use the correct version of Node.js:'));

  // Check if nvm is installed
  try {
    execSync('command -v nvm', { stdio: 'ignore' });
    console.error(chalk.green('Using nvm:'));
    console.error(chalk.white(`  nvm install ${requiredNodeVersion}`));
    console.error(chalk.white(`  nvm use ${requiredNodeVersion}`));
  } catch (e) {
    // nvm not found
    console.error(chalk.green('Install nvm (Node Version Manager):'));
    console.error(chalk.white('  https://github.com/nvm-sh/nvm#installing-and-updating'));
    console.error(chalk.green('Or download the LTS version from:'));
    console.error(chalk.white('  https://nodejs.org/'));
  }

  // Only exit with error in production or if forced, allow development to continue with a warning
  if (isProduction || forceStrictCheck || !allowWarningOnly) {
    console.error(chalk.red('\n❌ Node version check failed. Exiting.'));
    process.exit(1);
  } else {
    console.error(
      chalk.yellow('\n⚠️ Continuing despite Node.js version mismatch (development mode)...')
    );
    console.error(chalk.yellow('   Some features may not work as expected.'));
  }
}

console.log(chalk.green(`✅ Using Node.js ${currentNodeVersion}`));
