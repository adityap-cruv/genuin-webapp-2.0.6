import { spawn } from 'child_process'
import promptVersion from './npmVersionManager'
import { uploadBuildsToS3 } from './uploadToS3'

export async function runCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ')
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }, // Ensure environment variables are passed through
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
  })
}

export async function build(): Promise<void> {
  const NODE_ENV = process.env.NODE_ENV || 'development'
  console.log(`Building for environment: ${NODE_ENV}`)

  try {
    // If not in development, prompt for version update
    if (NODE_ENV !== 'development') {
      await promptVersion()
    }

    // Run the Rollup build with explicit environment
    await runCommand(`cross-env NODE_ENV=${NODE_ENV} rollup -c`)

    // Try to upload to S3 if configured
    await uploadBuildsToS3()

    console.log('\n\x1b[32m✓ Build completed successfully\x1b[0m\n')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

// Run the build if this script is called directly
if (require.main === module) {
  build().catch(console.error)
}
