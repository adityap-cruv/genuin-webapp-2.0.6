import dotenv from 'dotenv';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

function validateEnvironment() {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const envFile = `.env.${NODE_ENV}`;
  const envExampleFile = `${envFile}.example`;

  // Check if the environment-specific file exists
  if (!fs.existsSync(path.resolve(process.cwd(), envFile))) {
    console.error(`\x1b[31m❌ Error: ${envFile} not found!\x1b[0m`);
    console.log('\nPlease follow these steps:');
    console.log('1. Copy the example file:');
    console.log(`   \x1b[36mcp ${envExampleFile} ${envFile}\x1b[0m`);
    console.log('2. Fill in VITE_CXR_RUDDERSTACK_KEY (ask team lead)');
    console.log(
      '3. For deploys, also copy: cp .env.common.example .env.common (fill in Oracle + Bunny creds)\n',
    );
    process.exit(1);
  }

  // Load only the environment-specific file.
  // .env.common is only needed by deploy scripts (uploadToOracle, bunnyPurge), not for build/dev.
  dotenv.config({ path: envFile });

  // Define the schema for Vite environment variables
  const envSchema = z.object({
    VITE_CXR_API_BASE_URL: z.string().url(),
    VITE_CXR_RUDDERSTACK_DATA_PLANE_URL: z.string().url(),
    VITE_CXR_ASSET_BASE_URL: z.string().url(),
    VITE_CXR_GEN_AD_BASE_URL: z.string().url(),
    VITE_CXR_GENAI_SDK_URL: z.string().url(),
    // Allowed to be empty string — some environments don't have Rudderstack configured
    VITE_CXR_RUDDERSTACK_KEY: z.string(),
  });

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\x1b[31m❌ Invalid environment variables:\x1b[0m');

    type ErrorFormat = {
      _errors?: string[];
      [key: string]: ErrorFormat | string[] | undefined;
    };

    const formattedErrors = result.error.format() as ErrorFormat;
    Object.entries(formattedErrors).forEach(([key, value]) => {
      // Skip the root _errors array
      if (key === '_errors') return;

      // Handle nested error object
      if (value && typeof value === 'object' && '_errors' in value) {
        const errors = value._errors;
        if (errors && errors.length > 0) {
          console.error(`\n\x1b[33m${key}:\x1b[0m ${errors.join(', ')}`);
        }
      }
    });

    console.log(`\nPlease check your environment file: ${envFile}`);
    console.log('Contact your team lead if you need the correct values.\n');
    process.exit(1);
  }

  console.log('\x1b[32m✓ Environment variables validated successfully.\x1b[0m');
  console.log(`\x1b[36m• Using environment: ${NODE_ENV}\x1b[0m`);
  console.log(`\x1b[36m• Config file: ${envFile}\x1b[0m\n`);
}

validateEnvironment();
