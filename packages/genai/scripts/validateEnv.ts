import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Validates the genai SDK's build-time environment before `vite build`/`vite dev`.
 *
 * Why this exists: every `VITE_GENAI_*` value is statically inlined into the bundle
 * at build time. A missing or empty key (e.g. an unset Rudderstack write key) does
 * not fail the build — it silently inlines `""` and only throws at runtime deep
 * inside a provider. This script turns that class of failure into a loud, early,
 * build-time error.
 */
function validateEnvironment() {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const envFile = `.env.${NODE_ENV}`;
  const envExampleFile = `${envFile}.example`;

  if (!fs.existsSync(path.resolve(process.cwd(), envFile))) {
    console.error(`\x1b[31m❌ Error: ${envFile} not found!\x1b[0m`);
    console.log('\nPlease follow these steps:');
    console.log('1. Copy the example file:');
    console.log(`   \x1b[36mcp ${envExampleFile} ${envFile}\x1b[0m`);
    console.log('2. Fill in every VITE_GENAI_* value (ask your team lead for secrets)\n');
    process.exit(1);
  }

  // Load only the environment-specific file — genai has no .env.common.
  dotenv.config({ path: envFile });

  // Non-empty string (rejects "" and whitespace-only).
  const required = z.string().trim().min(1);
  // Non-empty, must parse as a URL.
  const requiredUrl = z.string().trim().url();

  // Every VITE_GENAI_* the genai source consumes. Each key is REQUIRED and
  // non-empty — an empty value here means a silently-broken bundle.
  const envSchema = z.object({
    // Deployment environment label.
    VITE_GENAI_CURRENT_ENV: z.enum(['prod', 'qa', 'development']),

    // Service URLs — must be valid, non-empty URLs.
    VITE_GENAI_GEN_SDK_URL: requiredUrl,
    VITE_GENAI_BCC_URL: requiredUrl,
    VITE_GENAI_API_URL: requiredUrl,
    VITE_GENAI_DS_BACKEND_API_URL: requiredUrl,
    VITE_GENAI_BCC_API_URL: requiredUrl,
    VITE_GENAI_DS_ASSETS_URL: requiredUrl,
    VITE_GENAI_RUDDERSTACK_URL: requiredUrl,

    // Analytics write key — required, non-empty (root cause of the runtime throw).
    VITE_GENAI_RUDDERSTACK_KEY: required,

    // IDs / keys — required, non-empty.
    VITE_GENAI_API_KEY: required,
    VITE_GENAI_GEN_SDK_STYLE_ID: required,
    VITE_GENAI_GEN_SDK_PLACEMENT_ID: required,
    VITE_GENAI_FONT_ID: required,
    VITE_GENAI_KOAH_PUBLISHER_ID: required,
  });

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\x1b[31m❌ Invalid genai environment variables:\x1b[0m');

    type ErrorFormat = {
      _errors?: string[];
      [key: string]: ErrorFormat | string[] | undefined;
    };

    const formattedErrors = result.error.format() as ErrorFormat;
    Object.entries(formattedErrors).forEach(([key, value]) => {
      if (key === '_errors') return;
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

  console.log('\x1b[32m✓ genai environment variables validated successfully.\x1b[0m');
  console.log(`\x1b[36m• Using environment: ${NODE_ENV}\x1b[0m`);
  console.log(`\x1b[36m• Config file: ${envFile}\x1b[0m\n`);
}

validateEnvironment();
