#!/usr/bin/env node
/**
 * Version Synchronization Script
 * ===============================
 *
 * This script ensures that the SDK_VERSION in src/loader.js matches
 * the version in package.json. It should be run as part of the build process.
 */

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

/**
 * Synchronizes the SDK version in loader.js with package.json
 */
function syncVersion(): void {
  try {
    // Read package.json
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const currentVersion = packageJson.version

    // Read loader.js
    const loaderPath = path.resolve(process.cwd(), 'src/loader.js')
    let loaderContent = fs.readFileSync(loaderPath, 'utf-8')

    // Find and replace the SDK_VERSION line
    const versionRegex = /const SDK_VERSION = '[^']*'/
    const newVersionLine = `const SDK_VERSION = '${currentVersion}'`

    if (versionRegex.test(loaderContent)) {
      const oldMatch = loaderContent.match(versionRegex)?.[0]
      loaderContent = loaderContent.replace(versionRegex, newVersionLine)

      // Write the updated content back
      fs.writeFileSync(loaderPath, loaderContent, 'utf-8')

      console.log(chalk.green('✓ Version synchronized successfully'))
      console.log(chalk.blue(`  Package version: ${currentVersion}`))
      console.log(chalk.blue(`  Updated: ${oldMatch} → ${newVersionLine}`))
    } else {
      console.warn(chalk.yellow('⚠ SDK_VERSION not found in loader.js'))
      console.log(
        chalk.yellow(
          "  Please ensure the loader.js contains: const SDK_VERSION = '...' pattern",
        ),
      )
    }
  } catch (error) {
    console.error(chalk.red('❌ Error synchronizing version:'))
    console.error(error)
    process.exit(1)
  }
}

// Export for use in other scripts
export default syncVersion

// Run if called directly
syncVersion()
