import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import postcssNested from 'postcss-nested'

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

// Custom plugin to copy loader file after build
const copyLoaderPlugin = () => ({
  name: 'copy-loader',
  async writeBundle() {
    // Copy the loader file after each build
    const sourceFile = resolve(__dirname, 'src/loader.js')
    const isDevelopment = process.env.NODE_ENV === 'development'
    const targetFile = resolve(
      __dirname,
      'dist',
      isDevelopment ? 'gen_sdk.js' : 'gen_sdk.min.js',
    )

    try {
      fs.copyFileSync(sourceFile, targetFile)
      console.log(
        `✓ Copied loader to ${isDevelopment ? 'gen_sdk.js' : 'gen_sdk.min.js'}`,
      )
    } catch (error) {
      console.error('Failed to copy loader file:', error)
    }
  },
})

const renameTwVars = () => ({
  postcssPlugin: 'postcss-rename-tw-vars',
  Once(root) {
    // Handle normal declarations
    root.walkDecls((decl) => {
      if (decl.prop.startsWith('--tw-')) {
        decl.prop = decl.prop.replace(/^--tw-/, '--gencl-')
      }
      if (decl.value && decl.value.includes('--tw-')) {
        decl.value = decl.value.replace(/--tw-/g, '--gencl-')
      }
    })

    // Handle @property rules (CSS Houdini)
    root.walkAtRules('property', (rule) => {
      if (rule.params.startsWith('--tw-')) {
        rule.params = rule.params.replace(/^--tw-/, '--gencl-')
      }
    })
  },
})
renameTwVars.postcss = true

// PostCSS plugin to add !important to specific gencl properties
const addImportantToGenclProps = () => ({
  postcssPlugin: 'postcss-add-important-gencl',
  Once(root) {
    root.walkRules((rule) => {
      // Check if any selector in the rule contains gencl:bg- or gencl:border-
      const hasGenclBgOrBorder = rule.selectors.some(
        (selector) =>
          selector.includes('.gencl\\:bg-') ||
          selector.includes('.gencl\\:border') ||
          selector.includes('.gencl\\:p-'),
      )

      if (hasGenclBgOrBorder) {
        // Add !important to all declarations in this rule
        rule.walkDecls((decl) => {
          if (!decl.important) {
            decl.important = true
            console.log(
              `Adding !important to ${rule.selector} -> ${decl.prop}: ${decl.value}`,
            )
          }
        })
      }
    })
  },
})
addImportantToGenclProps.postcss = true

// Post-build CSS processor
const postBuildCssPlugin = () => ({
  name: 'postbuild-css',
  async writeBundle() {
    const cssPath = resolve(__dirname, 'dist/assets/web-sdk.css')
    if (fs.existsSync(cssPath)) {
      const css = fs.readFileSync(cssPath, 'utf8')
      const result = await postcss([
        autoprefixer(),
        postcssNested({ preserveEmpty: true }),
        renameTwVars,
        addImportantToGenclProps,
      ]).process(css, { from: cssPath, to: cssPath })
      fs.writeFileSync(cssPath, result.css)
      console.log(
        '✓ PostCSS applied on generated CSS (variables renamed, !important added to gencl properties)',
      )
    } else {
      console.warn('⚠️ No web-sdk.css found in dist/assets')
    }
  },
})

export default defineConfig({
  plugins: [
    react(),
    genuinResolver(),
    copyLoaderPlugin(),
    postBuildCssPlugin(),
  ],

  // Set base path for chunk resolution
  base: './',

  // Optimize dependencies for better chunking
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@genuin/ui', '@genuin/components'],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Ensure React resolves to a single instance - CRITICAL for vendor chunks
      react: resolve(__dirname, '../../node_modules/react'),
      'react-dom': resolve(__dirname, '../../node_modules/react-dom'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    mainFields: ['browser', 'module', 'main'],
    dedupe: ['react', 'react-dom'],
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'iife'],
      name: 'GenuinSDK',
      fileName: (format) =>
        format === 'es' ? 'genuin-sdk.js' : 'genuin-sdk-legacy.js',
    },
    rollupOptions: {
      // Don't externalize anything for the web SDK build
      // We want to bundle everything for standalone usage
      external: [],
      output: [
        {
          // Main ES module bundle that supports code splitting
          format: 'es',
          entryFileNames: 'genuin-sdk.js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // Use consistent naming for CSS files, hash-based for others
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/web-sdk.css'
            }
            return 'assets/[name]-[hash][extname]'
          },
          // Set the base path for dynamic imports
          inlineDynamicImports: false,
          // Ensure exports are preserved
          exports: 'named',
          // Configure manual chunks for lazy-loaded components and vendor libraries
          manualChunks: (id) => {
            // DON'T manually chunk standard-wall - let lazy loading handle it naturally
            // This prevents eager loading of the standard-wall chunk

            // === VENDOR LIBRARY CHUNKS ===

            // NOTE: React and React-DOM are intentionally NOT separated into vendor chunks
            // to avoid createContext timing issues. They stay in the main bundle for proper module resolution.

            // React Query - Keep separate for performance
            if (
              id.includes('react-query') ||
              id.includes('@tanstack/react-query')
            ) {
              return 'vendor-react-query'
            }

            // Radix UI components - Large UI primitive library
            if (id.includes('node_modules/@radix-ui/')) {
              return 'vendor-radix'
            }

            // Animation and media libraries
            if (
              id.includes('node_modules/motion/') ||
              id.includes('node_modules/swiper/') ||
              id.includes('node_modules/embla-carousel') ||
              id.includes('node_modules/openplayerjs/')
            ) {
              return 'vendor-animation'
            }

            // Form and input libraries
            if (
              id.includes('node_modules/react-hook-form/') ||
              id.includes('node_modules/input-otp/') ||
              id.includes('node_modules/react-phone-number-input/') ||
              id.includes('node_modules/zod/')
            ) {
              return 'vendor-forms'
            }

            // Utility libraries
            if (
              id.includes('node_modules/axios/') ||
              id.includes('node_modules/crypto-es/') ||
              id.includes('node_modules/dompurify/') ||
              id.includes('node_modules/uuid/') ||
              id.includes('node_modules/ua-parser-js/')
            ) {
              return 'vendor-utils'
            }

            // Router and navigation
            if (id.includes('node_modules/wouter/')) {
              return 'vendor-router'
            }

            // Other large third-party libraries
            if (
              id.includes('node_modules/@fingerprintjs/') ||
              id.includes('node_modules/@rudderstack/') ||
              id.includes('node_modules/next/')
            ) {
              return 'vendor-external'
            }

            // === APPLICATION CHUNKS ===

            // Split other page components (but not standard-wall)
            if (
              id.includes('components/page/') &&
              !id.includes('standard-wall')
            ) {
              return 'app-embed-components'
            }

            // Split large UI libraries into separate chunks
            if (id.includes('@genuin/ui') && !id.includes('src/index')) {
              return 'app-ui-components'
            }

            // Keep core SDK functionality in main bundle
            if (
              id.includes('src/core') ||
              id.includes('src/sdk') ||
              id.includes('src/index')
            ) {
              return undefined // Goes to main bundle
            }

            // Let Rollup handle other chunks automatically
            return null
          },
        },
        {
          // Legacy IIFE bundle for backward compatibility (single file)
          format: 'iife',
          name: 'GenuinSDK',
          entryFileNames: 'genuin-sdk-legacy.js',
          assetFileNames: (assetInfo) => {
            // Use consistent naming for CSS files, hash-based for others
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'assets/web-sdk.css'
            }
            return 'assets/[name]-[hash][extname]'
          },
          inlineDynamicImports: true, // Required for IIFE single file
        },
      ],
    },
    sourcemap: true,
    target: 'es2020',
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000, // Warn for chunks over 1MB
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
