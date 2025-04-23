#!/usr/bin/env node
import { execSync } from 'child_process'
import readline from 'readline'
import fs from 'fs'
import path from 'path'

type VersionType = 'major' | 'minor' | 'patch'

function createPrompt(
  rl: readline.Interface,
  question: string,
): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim())
    })
  })
}

async function promptVersion() {
  const NODE_ENV = process.env.NODE_ENV || 'development'

  // For development environment, just show info message and exit
  if (NODE_ENV === 'development') {
    console.log(
      '\n\x1b[36mℹ Version management is disabled for development environment\x1b[0m',
    )
    console.log(
      '\x1b[36mℹ Use QA or Production builds for version management\x1b[0m\n',
    )
    return
  }

  // Read current version info from package.json
  const packageJsonPath = path.resolve(process.cwd(), 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const currentVersion = packageJson.version

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log('\n\x1b[36m=== Version Management ===\x1b[0m')
  console.log(`Current version: \x1b[33m${currentVersion}\x1b[0m`)
  console.log(`Environment: \x1b[33m${NODE_ENV}\x1b[0m\n`)

  const shouldBump = await createPrompt(
    rl,
    'Do you want to bump the version? (y/n): ',
  )

  if (shouldBump === 'y') {
    console.log('\nSelect version bump type:')
    console.log('1. major (x.0.0) - Breaking changes')
    console.log('2. minor (0.x.0) - New features')
    console.log('3. patch (0.0.x) - Bug fixes\n')

    const bumpType = await createPrompt(rl, 'Enter your choice (1-3): ')
    let versionType: VersionType = 'patch'

    switch (bumpType) {
      case '1':
        versionType = 'major'
        break
      case '2':
        versionType = 'minor'
        break
      case '3':
        versionType = 'patch'
        break
      default:
        console.log(
          '\x1b[33m⚠ Invalid choice. Using patch version bump.\x1b[0m\n',
        )
    }

    try {
      // Use npm version command to bump the version
      console.log(`\nUpdating version (${versionType})...`)
      execSync(`npm version ${versionType} --no-git-tag-version`)

      // Read the new version
      const updatedPackageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, 'utf-8'),
      )
      const newVersion = updatedPackageJson.version

      console.log('\n\x1b[32m✓ Version updated successfully\x1b[0m')
      console.log(`Previous version: \x1b[33m${currentVersion}\x1b[0m`)
      console.log(`New version: \x1b[32m${newVersion}\x1b[0m\n`)
    } catch (error) {
      console.error('\n\x1b[31m❌ Error updating version:\x1b[0m')
      console.error(error)
    }
  } else {
    console.log('\n\x1b[36mℹ Version bump skipped\x1b[0m\n')
  }

  rl.close()
}

// If script is run directly
if (require.main === module) {
  promptVersion().catch(console.error)
}

export default promptVersion
