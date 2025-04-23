import fs from 'fs'
import path from 'path'
import readline from 'readline'

type VersionInfo = {
  version: string
  lastBuildDate: string
  environment: string
}

type VersionType = 'major' | 'minor' | 'patch'

function incrementVersion(version: string, type: VersionType): string {
  const [major, minor, patch] = version.split('.').map(Number)

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
  }
}

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

  const versionFile = `version.${NODE_ENV === 'production' ? 'prod' : NODE_ENV}.json`
  const versionPath = path.resolve(process.cwd(), versionFile)

  // For QA and Production environments, check if version file exists
  if (!fs.existsSync(versionPath)) {
    console.error(`\x1b[31m❌ Error: ${versionFile} not found!\x1b[0m`)
    console.log(
      '\nPlease ensure the version file exists for non-development environments.',
    )
    console.log(`Expected path: ${versionPath}\n`)
    process.exit(1)
  }

  // Read current version info
  const versionInfo: VersionInfo = JSON.parse(
    fs.readFileSync(versionPath, 'utf-8'),
  )

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log('\n\x1b[36m=== Version Management ===\x1b[0m')
  console.log(`Current version: \x1b[33m${versionInfo.version}\x1b[0m`)
  console.log(`Environment: \x1b[33m${NODE_ENV}\x1b[0m\n`)

  const shouldBump = await createPrompt(
    rl,
    'Do you want to bump the version? (y/n): ',
  )

  // Always update the build date
  versionInfo.lastBuildDate = new Date().toISOString()

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

    // Increment version
    const newVersion = incrementVersion(versionInfo.version, versionType)
    versionInfo.version = newVersion

    console.log('\n\x1b[32m✓ Version updated successfully\x1b[0m')
    console.log(`Old version: \x1b[33m${versionInfo.version}\x1b[0m`)
    console.log(`New version: \x1b[32m${newVersion}\x1b[0m`)
  } else {
    console.log('\n\x1b[36mℹ Version bump skipped\x1b[0m\n')
  }

  // Write updated version info (includes new build date even if version wasn't bumped)
  fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2))
  console.log(`Build date: \x1b[36m${versionInfo.lastBuildDate}\x1b[0m\n`)

  rl.close()
}

promptVersion()
