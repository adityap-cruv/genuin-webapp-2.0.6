import dotenv from 'dotenv'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

function validateEnvironment() {
  const NODE_ENV = process.env.NODE_ENV || 'development'
  const envFile = `.env.${NODE_ENV}`
  const envCommonFile = '.env.common'
  const envExampleFile = `${envFile}.example`

  // Check if the environment-specific file exists
  if (!fs.existsSync(path.resolve(process.cwd(), envFile))) {
    console.error(`\x1b[31m❌ Error: ${envFile} not found!\x1b[0m`)
    console.log('\nPlease follow these steps:')
    console.log(`1. Copy the example file:`)
    console.log(`   \x1b[36mcp ${envExampleFile} ${envFile}\x1b[0m`)
    console.log(
      '2. Contact your team lead to get the correct environment values',
    )
    console.log(
      `3. Update ${envFile} with the values provided by your team lead\n`,
    )
    process.exit(1)
  }

  // Check if .env.common exists
  if (!fs.existsSync(path.resolve(process.cwd(), envCommonFile))) {
    console.error(`\x1b[31m❌ Error: ${envCommonFile} not found!\x1b[0m`)
    console.log('This file should be present in the repository.')
    console.log(
      'Please pull the latest changes from the repository or contact your team lead.\n',
    )
    process.exit(1)
  }

  // Load environment variables from both files
  dotenv.config({ path: envCommonFile })
  dotenv.config({ path: envFile })

  // Define the schema for environment variables
  const envSchema = z.object({
    // Common variables (from .env.common)
    // SDK_VERSION is now managed via package.json
    ACCESS_TOKEN_KEY: z.string(),
    BRAND_ID_KEY: z.string(),
    UNIQUE_USER_ID_KEY: z.string(),
    ENCRYPTION_IV: z.string(),
    ENCRYPTION_KEY: z.string(),

    // Environment-specific variables
    ENVIRONMENT: z.enum(['prod', 'qa', 'development']),
    DOMAIN: z.string(),
    BASE_URL: z.string().url(),
    API_BASE_URL: z.string().url(),
    MEDIA_BASE_URL: z.string().url(),
    RUDDERSTACK_URL: z.string().url(),
    RUDDERSTACK_API_KEY: z.string(),
    ENCRYPTION_SALT: z.string(),
    NEXT_PUBLIC_BCC_URL: z.string().url(),
  })

  // Validate the environment variables
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('\x1b[31m❌ Invalid environment variables:\x1b[0m')

    type ErrorFormat = {
      _errors?: string[]
      [key: string]: ErrorFormat | string[] | undefined
    }

    const formattedErrors = result.error.format() as ErrorFormat
    Object.entries(formattedErrors).forEach(([key, value]) => {
      // Skip the root _errors array
      if (key === '_errors') return

      // Handle nested error object
      if (value && typeof value === 'object' && '_errors' in value) {
        const errors = value._errors
        if (errors && errors.length > 0) {
          console.error(`\n\x1b[33m${key}:\x1b[0m ${errors.join(', ')}`)
        }
      }
    })

    console.log('\nPlease check your environment files:')
    console.log(`- ${envFile}`)
    console.log(`- ${envCommonFile}`)
    console.log('\nContact your team lead if you need the correct values.\n')
    process.exit(1)
  }

  console.log('\x1b[32m✓ Environment variables validated successfully.\x1b[0m')
  console.log(`\x1b[36m• Using environment: ${NODE_ENV}\x1b[0m`)
  console.log(`\x1b[36m• Config files: ${envFile}, ${envCommonFile}\x1b[0m\n`)
}

validateEnvironment()
