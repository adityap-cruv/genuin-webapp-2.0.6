import baseConfig from './vite.config.mjs'
import { defineConfig, mergeConfig } from 'vite'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// Try to import chalk, fallback to plain console if not available
let chalk
try {
  const chalkModule = await import('chalk')
  chalk = chalkModule.default
} catch {
  // Fallback if chalk is not available
  chalk = {
    green: (text) => text,
    yellow: (text) => text,
    red: (text) => text,
    cyan: (text) => text,
    gray: (text) => text,
  }
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Check for mkcert certificates first (recommended for network access)
const mkcertKeyPath = resolve(__dirname, 'cert/localhost+2-key.pem')
const mkcertCertPath = resolve(__dirname, 'cert/localhost+2.pem')

// Check for custom certificates
const customKeyPath = resolve(__dirname, 'cert/key.pem')
const customCertPath = resolve(__dirname, 'cert/cert.pem')

let httpsConfig

if (existsSync(mkcertKeyPath) && existsSync(mkcertCertPath)) {
  // Use mkcert certificates (best option for network access)
  httpsConfig = {
    https: {
      key: readFileSync(mkcertKeyPath),
      cert: readFileSync(mkcertCertPath),
    },
  }
  console.log(
    chalk.green(
      '✅ Using mkcert certificates for HTTPS (supports network access)',
    ),
  )
} else if (existsSync(customKeyPath) && existsSync(customCertPath)) {
  // Use custom certificates
  httpsConfig = {
    https: {
      key: readFileSync(customKeyPath),
      cert: readFileSync(customCertPath),
    },
  }
  console.log(
    chalk.yellow(
      '⚠️ Using custom certificates for HTTPS (may be localhost only)',
    ),
  )
} else {
  // Fallback to Vite's built-in HTTPS (localhost only)
  httpsConfig = {
    https: true,
  }
  console.log(chalk.red('❌ No HTTPS certificates found!'))
  console.log(
    chalk.yellow(
      '\n🔧 To set up trusted HTTPS certificates for network access:',
    ),
  )
  console.log(chalk.cyan('   npm run setup:https'))
  console.log(chalk.gray('\n📝 Or use HTTP instead:'))
  console.log(chalk.cyan('   npm run serve:prod      # HTTP over network'))
  console.log(
    chalk.yellow('\n⚠️ Continuing with basic HTTPS (localhost only)...'),
  )
}

export default defineConfig(
  mergeConfig(baseConfig, {
    server: {
      ...baseConfig.server,
      https: httpsConfig.https,
    },
    preview: {
      ...baseConfig.preview,
      https: httpsConfig.https,
    },
  }),
)
