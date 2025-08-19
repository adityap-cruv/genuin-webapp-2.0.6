import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Custom plugin to resolve @genuin/* imports
const genuinResolver = () => ({
  name: 'genuin-resolver',
  enforce: 'pre', // Run before other resolvers
  resolveId(id, importer) {
    // Handle base @genuin/ui import
    if (id === '@genuin/ui') {
      const mainPath = resolve(__dirname, '../ui/src/index.ts')
      if (fs.existsSync(mainPath)) {
        return mainPath
      }
    }

    // Handle base @genuin/components import
    if (id === '@genuin/components') {
      const mainPath = resolve(__dirname, '../components/src/index.ts')
      if (fs.existsSync(mainPath)) {
        return mainPath
      }
    }

    // Handle @genuin/tailwind-config import
    if (id === '@genuin/tailwind-config') {
      const configPath = resolve(
        __dirname,
        '../tailwind-config/shared-styles.css',
      )
      if (fs.existsSync(configPath)) {
        return configPath
      }
    }

    if (id.startsWith('@genuin/ui/')) {
      const subPath = id.replace('@genuin/ui/', '')

      // Special case: styles maps to dist/index.css (built CSS)
      if (subPath === 'styles') {
        const stylesPath = resolve(__dirname, '../ui/dist/index.css')
        if (fs.existsSync(stylesPath)) {
          return stylesPath
        }
      }

      // Special case: utils maps to lib/utils
      if (subPath === 'utils') {
        const utilsPath = resolve(__dirname, '../ui/src/lib/utils.ts')
        if (fs.existsSync(utilsPath)) {
          return utilsPath
        }
      }

      // Try different resolution patterns
      const patterns = [
        resolve(__dirname, `../ui/src/components/${subPath}/index.ts`),
        resolve(__dirname, `../ui/src/components/${subPath}/index.tsx`),
        resolve(__dirname, `../ui/src/components/${subPath}.ts`),
        resolve(__dirname, `../ui/src/components/${subPath}.tsx`),
        resolve(__dirname, `../ui/src/${subPath}/index.ts`),
        resolve(__dirname, `../ui/src/${subPath}/index.tsx`),
        resolve(__dirname, `../ui/src/${subPath}.ts`),
        resolve(__dirname, `../ui/src/${subPath}.tsx`),
      ]

      for (const pattern of patterns) {
        if (fs.existsSync(pattern)) {
          return pattern
        }
      }
    }

    if (id.startsWith('@genuin/components/')) {
      const subPath = id.replace('@genuin/components/', '')

      // Special case: styles maps to dist/index.css (built CSS)
      if (subPath === 'styles') {
        const stylesPath = resolve(__dirname, '../components/dist/index.css')
        if (fs.existsSync(stylesPath)) {
          return stylesPath
        }
      }

      const patterns = [
        resolve(__dirname, `../components/src/${subPath}/index.ts`),
        resolve(__dirname, `../components/src/${subPath}/index.tsx`),
        resolve(__dirname, `../components/src/${subPath}.ts`),
        resolve(__dirname, `../components/src/${subPath}.tsx`),
      ]

      for (const pattern of patterns) {
        if (fs.existsSync(pattern)) {
          return pattern
        }
      }
    }

    return null
  },
})

export default defineConfig({
  plugins: [react(), genuinResolver()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    mainFields: ['browser', 'module', 'main'],
    dedupe: ['react', 'react-dom'],
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GenuinSDK',
      formats: ['iife'],
      fileName: () => `genuin-sdk.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        inlineDynamicImports: true,
        format: 'iife',
      },
    },
    sourcemap: true,
    target: 'es2020',
  },

  define: {
    global: 'globalThis',
    // Basic environment variables (for direct use in web-sdk)
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development',
    ),
    'process.env.ENVIRONMENT': JSON.stringify(
      process.env.ENVIRONMENT || 'development',
    ),
    'process.env.DOMAIN': JSON.stringify(
      process.env.DOMAIN || 'qa.begenuin.com',
    ),
    'process.env.BASE_URL': JSON.stringify(
      process.env.BASE_URL || 'https://app.qa.begenuin.com',
    ),
    'process.env.API_BASE_URL': JSON.stringify(
      process.env.API_BASE_URL || 'https://api.qa.begenuin.com',
    ),
    'process.env.MEDIA_BASE_URL': JSON.stringify(
      process.env.MEDIA_BASE_URL || 'https://media.qa.begenuin.com',
    ),
    'process.env.RUDDERSTACK_URL': JSON.stringify(
      process.env.RUDDERSTACK_URL || 'https://rudderstack.qa.begenuin.com',
    ),
    'process.env.RUDDERSTACK_API_KEY': JSON.stringify(
      process.env.RUDDERSTACK_API_KEY || '',
    ),
    'process.env.ENCRYPTION_SALT': JSON.stringify(
      process.env.ENCRYPTION_SALT || '',
    ),
    'process.env.ACCESS_TOKEN_KEY': JSON.stringify(
      process.env.ACCESS_TOKEN_KEY || '',
    ),
    'process.env.UNIQUE_USER_ID_KEY': JSON.stringify(
      process.env.UNIQUE_USER_ID_KEY || '',
    ),
    'process.env.ENCRYPTION_IV': JSON.stringify(
      process.env.ENCRYPTION_IV || '',
    ),
    'process.env.ENCRYPTION_KEY': JSON.stringify(
      process.env.ENCRYPTION_KEY || '',
    ),
    'process.env.BRAND_ID_KEY': JSON.stringify(process.env.BRAND_ID_KEY || ''),
    'process.env.NEXT_PUBLIC_BCC_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_BCC_URL || 'https://brands.qa.begenuin.com',
    ),

    // Components package environment variables (using import.meta.env format)
    // These are what the @genuin/components package expects when running in Vite/client environment
    'import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_RUDDERSTACK_KEY ||
        process.env.RUDDERSTACK_API_KEY ||
        '',
    ),
    'import.meta.env.NEXT_PUBLIC_RUDDERSTACK_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_RUDDERSTACK_URL ||
        process.env.RUDDERSTACK_URL ||
        'https://rudderstack.qa.begenuin.com',
    ),
    'import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
        process.env.MEDIA_BASE_URL ||
        'https://media.qa.begenuin.com',
    ),
    'import.meta.env.NEXT_PUBLIC_HOST_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_HOST_URL ||
        process.env.BASE_URL ||
        'https://app.qa.begenuin.com',
    ),
    'import.meta.env.NEXT_PUBLIC_API_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_API_URL ||
        process.env.API_BASE_URL ||
        'https://api.qa.begenuin.com',
    ),
    'import.meta.env.NEXT_PUBLIC_AES_IV': JSON.stringify(
      process.env.NEXT_PUBLIC_AES_IV || process.env.ENCRYPTION_IV || '',
    ),
    'import.meta.env.NEXT_PUBLIC_AES_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_AES_KEY || process.env.ENCRYPTION_KEY || '',
    ),
    'import.meta.env.NEXT_PUBLIC_SECRET_STRING': JSON.stringify(
      process.env.NEXT_PUBLIC_SECRET_STRING ||
        process.env.ENCRYPTION_SALT ||
        '',
    ),
    'import.meta.env.NEXT_PUBLIC_REDIRECT_URI': JSON.stringify(
      process.env.NEXT_PUBLIC_REDIRECT_URI ||
        process.env.BASE_URL ||
        'https://app.qa.begenuin.com',
    ),
  },
})
