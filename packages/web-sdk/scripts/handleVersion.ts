import fs from 'fs'
import path from 'path'
import readline from 'readline'

type VersionInfo = {
  version: string
  lastBuildDate: string
  environment: string
}

type VersionType = 'major' | 'minor' | 'patch'

// Path to store temporary version info
const TEMP_VERSION_FILE = '.version.temp.json'

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

export function cleanupTempVersion() {
  if (fs.existsSync(TEMP_VERSION_FILE)) {
    fs.unlinkSync(TEMP_VERSION_FILE)
  }
}

export function commitVersion() {
  if (!fs.existsSync(TEMP_VERSION_FILE)) {
    console.log('\n\x1b[33mℹ No version changes to commit\x1b[0m\n')
    return
  }

  const NODE_ENV = process.env.NODE_ENV || 'development'
  const versionFile = `version.${NODE_ENV === 'production' ? 'prod' : NODE_ENV}.json`

  try {
    const tempVersionInfo = JSON.parse(
      fs.readFileSync(TEMP_VERSION_FILE, 'utf-8'),
    )

    // Write to actual version file
    fs.writeFileSync(versionFile, JSON.stringify(tempVersionInfo, null, 2))

    // Update SDK_VERSION in .env files
    const envFile = `.env.${NODE_ENV}`
    if (fs.existsSync(envFile)) {
      let envContent = fs.readFileSync(envFile, 'utf-8')
      envContent = envContent.replace(
        /SDK_VERSION=.*$/m,
        `SDK_VERSION="${tempVersionInfo.version}"`,
      )
      fs.writeFileSync(envFile, envContent)
    }

    console.log('\n\x1b[32m✓ Version changes committed successfully\x1b[0m')
    console.log(`Version: \x1b[32m${tempVersionInfo.version}\x1b[0m`)
    console.log(`Build date: \x1b[36m${tempVersionInfo.lastBuildDate}\x1b[0m\n`)
  } catch (error) {
    console.error('\n\x1b[31m❌ Error committing version changes\x1b[0m\n')
  } finally {
    cleanupTempVersion()
  }
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

  // Clean up any existing temp file
  cleanupTempVersion()

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

    console.log('\n\x1b[32m✓ Version prepared\x1b[0m')
    console.log(`Current version: \x1b[33m${versionInfo.version}\x1b[0m`)
    console.log(`New version: \x1b[32m${newVersion}\x1b[0m`)
  } else {
    console.log('\n\x1b[36mℹ Version bump skipped\x1b[0m')
  }

  // Store version info in temporary file
  fs.writeFileSync(TEMP_VERSION_FILE, JSON.stringify(versionInfo, null, 2))
  console.log(
    `\n\x1b[36mℹ Version changes prepared and stored temporarily\x1b[0m`,
  )
  console.log(
    `\x1b[36mℹ Changes will be committed after successful build\x1b[0m\n`,
  )

  rl.close()
}

// If script is run directly
if (require.main === module) {
  promptVersion().catch(console.error)
}
