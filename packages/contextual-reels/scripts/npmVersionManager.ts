#!/usr/bin/env node
import { execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const commonEnvFile = path.resolve(process.cwd(), '.env.common');
if (fs.existsSync(commonEnvFile)) {
  dotenv.config({ path: commonEnvFile, override: false });
}

type VersionType = 'major' | 'minor' | 'patch';

function createPrompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

/**
 * Interactively prompts for a semver version bump (major/minor/patch) and updates package.json.
 * Skipped silently in the development environment.
 */
async function promptVersion(): Promise<void> {
  const NODE_ENV = process.env.NODE_ENV ?? 'development';

  if (NODE_ENV === 'development') {
    console.log('\n\x1b[36mℹ Version management is disabled for development environment\x1b[0m');
    console.log('\x1b[36mℹ Use QA or Production builds for version management\x1b[0m\n');
    return;
  }

  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version: string };
  const currentVersion = packageJson.version;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n\x1b[36m=== Version Management ===\x1b[0m');
  console.log(`Current version: \x1b[33m${currentVersion}\x1b[0m`);
  console.log(`Environment: \x1b[33m${NODE_ENV}\x1b[0m\n`);

  const shouldBump = await createPrompt(rl, 'Do you want to bump the version? (y/n): ');

  if (shouldBump === 'y') {
    console.log('\nSelect version bump type:');
    console.log('1. major (x.0.0) - Breaking changes');
    console.log('2. minor (0.x.0) - New features');
    console.log('3. patch (0.0.x) - Bug fixes\n');

    const bumpType = await createPrompt(rl, 'Enter your choice (1-3): ');
    let versionType: VersionType = 'patch';

    switch (bumpType) {
      case '1':
        versionType = 'major';
        break;
      case '2':
        versionType = 'minor';
        break;
      case '3':
        versionType = 'patch';
        break;
      default:
        console.log('\x1b[33m⚠ Invalid choice. Using patch version bump.\x1b[0m\n');
    }

    try {
      console.log(`\nUpdating version (${versionType})...`);
      execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });

      const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version: string };
      const newVersion = updatedPackageJson.version;

      console.log('\n\x1b[32m✓ Version updated successfully\x1b[0m');
      console.log(`Previous version: \x1b[33m${currentVersion}\x1b[0m`);
      console.log(`New version: \x1b[32m${newVersion}\x1b[0m\n`);
    } catch (error) {
      console.error('\n\x1b[31m❌ Error updating version:\x1b[0m', error);
      rl.close();
      process.exit(1);
    }
  } else {
    console.log('\n\x1b[36mℹ Version bump skipped\x1b[0m\n');
  }

  rl.close();
}

promptVersion().catch(console.error);
