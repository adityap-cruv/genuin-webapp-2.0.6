import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import dotenv from 'dotenv'
import postcssNested from 'postcss-nested'
import { visualizer } from 'rollup-plugin-visualizer'
import bundleAnalyzer from 'vite-bundle-analyzer'
import { gzipSync } from 'zlib'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development'
const envFile = resolve(__dirname, `.env.${nodeEnv}`)
const commonEnvFile = resolve(__dirname, '.env.common')
const deployTempEnvFile = resolve(__dirname, '.env.deploy.tmp')

// Load environment variables from the appropriate file
if (fs.existsSync(commonEnvFile)) {
  dotenv.config({ path: commonEnvFile })
  console.log(`✓ Loaded common environment variables from .env.common`)
  console.log(`DEBUG: S3_UPLOAD_PATHS = ${process.env.S3_UPLOAD_PATHS}`)
}

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true })
  console.log(`✓ Loaded environment variables from .env.${nodeEnv}`)
  console.log(`DEBUG: NEXT_PUBLIC_API_URL = ${process.env.NEXT_PUBLIC_API_URL}`)
} else {
  console.warn(`⚠️ Environment file .env.${nodeEnv} not found`)
}

// Load deploy-time environment variables (SDK_VERSION_PATH, etc.)
if (fs.existsSync(deployTempEnvFile)) {
  dotenv.config({ path: deployTempEnvFile, override: true })
  console.log(`✓ Loaded deploy-time environment variables from .env.deploy.tmp`)
}

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

// Custom plugin to process loader file after build
const copyLoaderPlugin = () => ({
  name: 'copy-loader',
  async writeBundle(options, bundle) {
    // Find the loader bundle entry
    const loaderEntry = Object.keys(bundle).find(
      (key) => key.startsWith('gen_sdk') && bundle[key].type === 'chunk',
    )

    if (loaderEntry) {
      const loaderBundle = bundle[loaderEntry]
      let loaderContent = loaderBundle.code

      // Replace environment placeholders in the generated code
      const mediaBaseUrl =
        process.env.MEDIA_BASE_URL ||
        process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
        'https://media.qa.begenuin.com'
      loaderContent = loaderContent.replace(/__MEDIA_BASE_URL__/g, mediaBaseUrl)

      // Replace NODE_ENV check with actual value
      const isDevelopment = process.env.NODE_ENV === 'development'
      const nodeEnvCheck = isDevelopment ? 'true' : 'false'
      loaderContent = loaderContent.replace(
        /__DEV_ENVIRONMENT__/g,
        nodeEnvCheck,
      )

      // Replace __SDK_VERSION_PATH__ with version path if provided
      const sdkVersionPath = process.env.SDK_VERSION_PATH
      if (sdkVersionPath && sdkVersionPath.trim()) {
        const versionPath = `${sdkVersionPath.trim()}/`
        loaderContent = loaderContent.replace(
          /__SDK_VERSION_PATH__/g,
          versionPath,
        )
      } else {
        loaderContent = loaderContent.replace(/__SDK_VERSION_PATH__/g, '')
      }

      // Find the main SDK file with hash by checking the actual dist directory
      // The bundle object might not contain all files, so check the filesystem
      const distDir = resolve(__dirname, 'dist')
      const distAssetsDir = resolve(__dirname, 'dist/assets')
      let sdkFile = null
      let cssFile = null
      try {
        // Read the dist directory to find the hashed SDK file
        const distFiles = fs.readdirSync(distDir)
        sdkFile = distFiles.find(
          (fileName) =>
            fileName.startsWith('genuin-sdk-') &&
            fileName.endsWith('.js') &&
            !fileName.includes('legacy') &&
            fileName.match(/genuin-sdk-[a-zA-Z0-9_-]+\.js$/), // Ensure it has a hash (can include _, -)
        )
        console.log(
          '🔍 Dist directory files:',
          distFiles.filter((f) => f.endsWith('.js')),
        )
        console.log('🔍 Found hashed SDK file:', sdkFile)

        // Read the assets directory to find the hashed CSS file
        const assetFiles = fs.readdirSync(distAssetsDir)
        cssFile = assetFiles.find(
          (fileName) =>
            fileName.startsWith('web-sdk') && fileName.endsWith('.css'),
        )
        console.log('🔍 Found CSS file:', cssFile)
      } catch (error) {
        console.error('❌ Could not read dist directory:', error)
      }
      if (!sdkFile) {
        console.error(
          '❌ Could not find hashed ES module file in dist directory!',
        )
        console.error('❌ This build is invalid - hashed ES module is required')
        throw new Error('Build failed: No hashed ES module found')
      }
      if (sdkFile) {
        console.log('🔄 Found hashed SDK filename:', sdkFile)
        loaderContent = loaderContent.replace(
          /__SDK_FILENAME_PLACEHOLDER__/g,
          sdkFile,
        )
        console.log('✅ Replaced SDK filename placeholder with:', sdkFile)
      }

      // Replace CSS filename placeholder
      if (cssFile) {
        console.log('🔄 Found hashed CSS filename:', cssFile)
        loaderContent = loaderContent.replace(
          /__CSS_FILENAME_PLACEHOLDER__/g,
          cssFile,
        )
        console.log('✅ Replaced CSS filename placeholder with:', cssFile)
      } else {
        // Fallback to default name if no hashed CSS file found (development)
        loaderContent = loaderContent.replace(
          /__CSS_FILENAME_PLACEHOLDER__/g,
          'web-sdk.css',
        )
      }

      // Remove console statements in production
      if (process.env.NODE_ENV === 'production') {
        // Remove console.log, console.warn, console.error, console.debug, console.info
        loaderContent = loaderContent.replace(
          /console\.(log|warn|error|debug|info|group|groupEnd|groupCollapsed)\([^)]*\);?/g,
          '',
        )
      }

      // Generate build metadata header
      const buildTime = new Date().toISOString()
      const environment = process.env.NODE_ENV || 'development'
      const version = process.env.npm_package_version || '2.0.0'
      const sdkPath = isDevelopment ? 'gen_sdk.js' : 'gen_sdk.min.js'

      const metadataHeader = `/**
 * Genuin SDK v${version}
 * Built: ${buildTime}
 * Environment: ${environment}
 * File: ${sdkPath}
 *
 * Copyright (c) Genuin Inc.
 * https://begenuin.com
 */

`

      // Prepend metadata header to the processed content
      loaderBundle.code = metadataHeader + loaderContent

      // Write the modified loader file back to disk
      const loaderFilePath = resolve(__dirname, 'dist', loaderEntry)
      fs.writeFileSync(loaderFilePath, loaderBundle.code, 'utf8')

      console.log(`✓ Processed loader bundle: ${loaderEntry}`)
      console.log(`  - Build time: ${buildTime}`)
      console.log(`  - Environment: ${environment}`)
      console.log(`  - Version: ${version}`)
      console.log(`  - MEDIA_BASE_URL: ${mediaBaseUrl}`)
      console.log(`  - SDK_FILENAME: ${sdkFile}`)
      console.log(`  - CSS_FILENAME: ${cssFile || 'web-sdk.css'}`)
      console.log(`  - Written to: ${loaderFilePath}`)
      console.log(`  - Processed by Vite build pipeline: Yes`)
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
          selector.includes('.gencl\\:p-') ||
          selector.includes('.gencl\\:pt') ||
          selector.includes('.gencl\\:pb') ||
          selector.includes('.gencl\\:pl') ||
          selector.includes('.gencl\\:pr') ||
          selector.includes('.gencl\\:px') ||
          selector.includes('.gencl\\:py') ||
          selector.includes('.gencl\\:text-'),
      )

      if (hasGenclBgOrBorder) {
        // Add !important to all declarations in this rule
        rule.walkDecls((decl) => {
          if (!decl.important) {
            decl.important = true
          }
        })
      }
    })
  },
})
addImportantToGenclProps.postcss = true

// PostCSS plugin to normalize CSS Houdini @property inheritance for Shadow DOM.
// Tailwind emits many `inherits: false` declarations, which can block variables
// from flowing from SDK host containers into nested Shadow DOM content.
const forcePropertyInheritsTrue = () => ({
  postcssPlugin: 'postcss-force-property-inherits-true',
  Once(root) {
    root.walkAtRules('property', (rule) => {
      let hasInheritsDescriptor = false

      rule.walkDecls('inherits', (decl) => {
        hasInheritsDescriptor = true
        if (decl.value.trim() !== 'true') {
          decl.value = 'true'
        }
      })

      if (!hasInheritsDescriptor) {
        rule.append({ prop: 'inherits', value: 'true' })
      }
    })
  },
})
forcePropertyInheritsTrue.postcss = true

// PostCSS plugin to scope Tailwind preflight CSS to .gen-sdk-class
const scopePreflightCss = () => ({
  postcssPlugin: 'postcss-scope-preflight',
  Once(root) {
    root.walkRules((rule) => {
      // Check if selector is :root - scope it to .gen-sdk-class
      const hasRootSelector = rule.selectors.some(
        (selector) => selector === ':root',
      )

      if (hasRootSelector) {
        rule.selectors = rule.selectors.map((selector) => {
          if (selector === ':root') {
            return '.gen-sdk-class'
          }
          return selector
        })
        return
      }

      // Check if this is a preflight rule (typically base styles applied to html, body, *, etc.)
      const isPreflightRule = rule.selectors.some((selector) => {
        // Preflight selectors include: *, ::before, ::after, html, body, hr, abbr, etc.
        const preflightPatterns = [
          /^\*$/, // Universal selector
          /^::?before$/, // ::before, :before
          /^::?after$/, // ::after, :after
          /^\*::?before$/, // *::before, *:before
          /^\*::?after$/, // *::after, *:after
          /^html$/, // html
          /^body$/, // body
          /^hr$/, // hr
          /^h[1-6]$/, // h1-h6
          /^p$/, // p
          /^a$/, // a
          /^abbr$/, // abbr
          /^b$/, // b
          /^code$/, // code
          /^kbd$/, // kbd
          /^pre$/, // pre
          /^small$/, // small
          /^sub$/, // sub
          /^sup$/, // sup
          /^table$/, // table
          /^button$/, // button
          /^input$/, // input
          /^optgroup$/, // optgroup
          /^select$/, // select
          /^textarea$/, // textarea
          /^fieldset$/, // fieldset
          /^legend$/, // legend
          /^img$/, // img
          /^svg$/, // svg
          /^video$/, // video
          /^canvas$/, // canvas
          /^audio$/, // audio
          /^iframe$/, // iframe
          /^embed$/, // embed
          /^object$/, // object
          /^blockquote$/, // blockquote
          /^dl$/, // dl
          /^dd$/, // dd
          /^ol$/, // ol
          /^ul$/, // ul
          /^li$/, // li
        ]

        return preflightPatterns.some((pattern) =>
          pattern.test(selector.trim()),
        )
      })

      if (isPreflightRule) {
        // Scope each selector to .gen-sdk-class
        rule.selectors = rule.selectors.map((selector) => {
          // For *, ::before, ::after selectors, scope to .gen-sdk-class
          if (selector.match(/^\*(::|:)?(before|after)?$/)) {
            if (selector === '*') {
              return '.gen-sdk-class *'
            }
            if (selector === '*::before' || selector === '*:before') {
              return '.gen-sdk-class *::before'
            }
            if (selector === '*::after' || selector === '*:after') {
              return '.gen-sdk-class *::after'
            }
          }

          // For element selectors, scope to .gen-sdk-class
          return `.gen-sdk-class ${selector}`
        })
      }
    })
  },
})
scopePreflightCss.postcss = true

// Post-build CSS processor
const postBuildCssPlugin = () => ({
  name: 'postbuild-css',
  async writeBundle() {
    const distAssetsDir = resolve(__dirname, 'dist/assets')

    // Find the CSS file (could be web-sdk.css or web-sdk-[hash].css)
    let cssFile = null
    try {
      const assetFiles = fs.readdirSync(distAssetsDir)
      cssFile = assetFiles.find(
        (fileName) =>
          fileName.startsWith('web-sdk') && fileName.endsWith('.css'),
      )
    } catch (error) {
      console.warn('⚠️ Could not read dist/assets directory:', error)
      return
    }

    if (!cssFile) {
      console.warn('⚠️ No web-sdk CSS file found in dist/assets')
      return
    }

    const cssPath = resolve(distAssetsDir, cssFile)
    if (fs.existsSync(cssPath)) {
      const css = fs.readFileSync(cssPath, 'utf8')
      const result = await postcss([
        autoprefixer(),
        postcssNested({ preserveEmpty: true }),
        scopePreflightCss,
        renameTwVars,
        forcePropertyInheritsTrue,
        addImportantToGenclProps,
      ]).process(css, { from: cssPath, to: cssPath })
      fs.writeFileSync(cssPath, result.css)
      console.log(
        `✓ PostCSS applied on generated CSS: ${cssFile} (preflight scoped, variables renamed, @property inherits normalized, !important added to gencl properties)`,
      )
    } else {
      console.warn(`⚠️ CSS file not found: ${cssPath}`)
    }
  },
})

// Bundle size report generator
const bundleSizeReportPlugin = () => ({
  name: 'bundle-size-report',
  generateBundle(options, bundle) {
    const report = []
    let totalSize = 0
    let totalGzipSize = 0

    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'chunk') {
        const size = chunk.code.length
        const gzipSize = gzipSync(chunk.code).length
        totalSize += size
        totalGzipSize += gzipSize

        report.push({
          file: fileName,
          sizeBytes: size,
          gzipSizeBytes: gzipSize,
        })
      }
    }

    // Sort by size descending
    report.sort((a, b) => b.sizeBytes - a.sizeBytes)

    // Add totals
    report.push({
      file: 'TOTAL',
      sizeBytes: totalSize,
      gzipSizeBytes: totalGzipSize,
    })

    // Ensure dist directory exists
    const distDir = resolve(__dirname, 'dist')
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }

    // Write JSON report
    const reportPath = resolve(__dirname, 'dist/bundle-size-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`✓ Bundle size report generated: ${reportPath}`)
  },
})

export default defineConfig({
  plugins: [
    react(),
    genuinResolver(),
    copyLoaderPlugin(),
    postBuildCssPlugin(),
    bundleSizeReportPlugin(),
    // process.env.ANALYZE === 'true' &&
    //   visualizer({
    //     filename: 'stats.html',
    //     template: process.env.VISUALIZER_TEMPLATE || 'treemap', // Options: 'treemap', 'sunburst', 'network', 'raw-data', 'list'
    //     open: true, // Automatically open the report in browser
    //     gzipSize: true, // Show gzipped sizes
    //     brotliSize: true, // Show brotli sizes
    //     sourcemap: process.env.NODE_ENV !== 'production', // Analyze sourcemaps for more accurate sizes
    //   }),
    process.env.ANALYZE === 'true' &&
      bundleAnalyzer({
        analyzerMode: 'static',
        openAnalyzer: true,
      }),
  ],

  // Set base path for chunk resolution
  base: './',

  // Development server configuration with CORS for cross-origin access
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow external access
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'http://localhost:4005',
        'http://dev.listen.iheart.com',
        /^https?:\/\/.*\.iheart\.com$/,
        /^https?:\/\/.*\.begenuin\.com$/,
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    // Serve static files from dist directory
    fs: {
      allow: ['..', '../..', './dist'],
    },
  },

  // Preview server (for production builds) with same CORS settings
  preview: {
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'http://localhost:4005',
        'http://dev.listen.iheart.com',
        /^https?:\/\/.*\.iheart\.com$/,
        /^https?:\/\/.*\.begenuin\.com$/,
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ],
      credentials: true,
    },
  },

  // Configure esbuild for all transforms and minification
  esbuild:
    process.env.NODE_ENV === 'production'
      ? {
          drop: ['console', 'debugger'],
        }
      : undefined,

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
      entry: {
        'genuin-sdk': resolve(__dirname, 'src/index.ts'),
        gen_sdk: resolve(__dirname, 'src/loader.js'),
      },
      formats: ['es'], // Only ES format for multi-entry builds
      name: 'GenuinSDK',
      fileName: (format, entryName) => {
        if (entryName === 'gen_sdk') {
          // Use environment-specific naming for loader
          const isDevelopment = process.env.NODE_ENV === 'development'
          return isDevelopment ? 'gen_sdk.js' : 'gen_sdk.min.js'
        }
        return 'genuin-sdk.js'
      },
    },
    rollupOptions: {
      // Don't externalize anything for the web SDK build
      // We want to bundle everything for standalone usage
      external: [],
      output: {
        // Single ES module output with multiple entries
        format: 'es',
        // Auto-merge chunks smaller than 10KB (pre-minification)
        // This consolidates micro-chunks while preserving lazy loading for larger chunks
        experimentalMinChunkSize: 10000,
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'gen_sdk') {
            const isDevelopment = process.env.NODE_ENV === 'development'
            return isDevelopment ? 'gen_sdk.js' : 'gen_sdk.min.js'
          }
          return 'genuin-sdk-[hash].js'
        },
        chunkFileNames: (chunkInfo) => {
          let name = chunkInfo.name

          // If chunk name is 'index', use parent folder name for better clarity
          if (name === 'index' || name.endsWith('/index')) {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              const parts = facadeModuleId.split('/')
              // Find parent folder of index file
              for (let i = parts.length - 1; i >= 0; i--) {
                if (parts[i].startsWith('index.')) {
                  if (i > 0) {
                    name = parts[i - 1]
                    break
                  }
                }
              }
            }
          }

          return `chunks/${name}-[hash].js`
        },
        assetFileNames: (assetInfo) => {
          // Use hash-based naming for all assets including CSS in production
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            const isProduction = process.env.NODE_ENV === 'production'
            return isProduction
              ? 'assets/web-sdk-[hash].css'
              : 'assets/web-sdk.css'
          }
          return 'assets/[name]-[hash][extname]'
        },
        // Set the base path for dynamic imports
        inlineDynamicImports: false,
        // Ensure exports are preserved
        exports: 'named',
        // Let Rollup handle chunk splitting automatically for optimal tree-shaking
      },
    },
    sourcemap: process.env.NODE_ENV !== 'production',
    target: 'es2020',
    // Optimize chunk sizes
    chunkSizeWarningLimit: 300, // Warn for chunks over 300KB (reduced from 1MB)
  },

  define: {
    global: 'globalThis',
    // Force process to be undefined to ensure import.meta.env is used
    process: 'undefined',
    'process.env': 'undefined',

    // Debug logging
    __DEBUG_API_URL: JSON.stringify(
      process.env.NEXT_PUBLIC_API_URL || 'NOT_FOUND',
    ),
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
    'process.env.TRACK_OBSERVABILITY': JSON.stringify(
      process.env.TRACK_OBSERVABILITY || 'false',
    ),
    // NEXT_PUBLIC_* environment variables for process.env access (components package compatibility)
    'process.env.NEXT_PUBLIC_RUDDERSTACK_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_RUDDERSTACK_KEY ||
        process.env.RUDDERSTACK_API_KEY ||
        '',
    ),
    'process.env.NEXT_PUBLIC_RUDDERSTACK_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_RUDDERSTACK_URL ||
        process.env.RUDDERSTACK_URL ||
        'https://rudderstack.qa.begenuin.com',
    ),
    'process.env.NEXT_PUBLIC_MEDIA_BASE_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
        process.env.MEDIA_BASE_URL ||
        'https://media.qa.begenuin.com',
    ),
    'process.env.NEXT_PUBLIC_HOST_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_HOST_URL ||
        process.env.BASE_URL ||
        'https://app.qa.begenuin.com',
    ),
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_API_URL ||
        process.env.API_BASE_URL ||
        'https://api.qa.begenuin.com',
    ),
    'process.env.NEXT_PUBLIC_AES_IV': JSON.stringify(
      process.env.NEXT_PUBLIC_AES_IV || process.env.ENCRYPTION_IV || '',
    ),
    'process.env.NEXT_PUBLIC_AES_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_AES_KEY || process.env.ENCRYPTION_KEY || '',
    ),
    'process.env.NEXT_PUBLIC_SECRET_STRING': JSON.stringify(
      process.env.NEXT_PUBLIC_SECRET_STRING ||
        process.env.ENCRYPTION_SALT ||
        '',
    ),
    'process.env.NEXT_PUBLIC_REDIRECT_URI': JSON.stringify(
      process.env.NEXT_PUBLIC_REDIRECT_URI ||
        process.env.BASE_URL ||
        'https://app.qa.begenuin.com',
    ),

    // Components package environment variables (using import.meta.env format)
    // These are what the @genuin/components package expects when running in Vite/client environment
    'import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_RUDDERSTACK_KEY ||
        process.env.RUDDERSTACK_API_KEY ||
        '',
    ),
    'import.meta.env.TRACK_OBSERVABILITY': JSON.stringify(
      process.env.TRACK_OBSERVABILITY || 'false',
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
