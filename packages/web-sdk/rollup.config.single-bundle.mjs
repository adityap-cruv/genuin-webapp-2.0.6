import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json'
import postcss from 'rollup-plugin-postcss'
import { visualizer } from 'rollup-plugin-visualizer'
import tailwindcssPostcss from '@tailwindcss/postcss'
import cssnano from 'cssnano'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import fs from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Environment setup
const NODE_ENV = process.env.NODE_ENV || 'development'
const isDevelopment = NODE_ENV === 'development'

// Load package.json for version info
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
)

// Environment variable loading and processing
const commonEnv = dotenv.config({ path: '.env.common' }).parsed || {}
const envFile = `.env.${NODE_ENV}`
const envConfig = dotenv.config({ path: envFile }).parsed || {}

// Combine environment variables with common taking precedence
const combinedEnv = {
  ...envConfig, // Environment specific variables
  ...commonEnv, // Common variables override environment specific ones
}

// Convert env variables to process.env format
const envReplacements = Object.entries(combinedEnv).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [`process.env.${key}`]: JSON.stringify(value),
  }),
  {
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    'process.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
)

export default defineConfig({
  input: 'src/index.ts',

  output: {
    file: isDevelopment ? 'dist/genuin-sdk.js' : 'dist/genuin-sdk.min.js',
    format: 'iife',
    name: 'GenuinSDK',
    inlineDynamicImports: true, // Critical for single bundle
    sourcemap: isDevelopment,
    compact: !isDevelopment,
    banner: `/*! Genuin Web SDK v${packageJson.version} | ${NODE_ENV} */`,
  },

  external: [], // Bundle everything - no externals

  plugins: [
    // 1. TypeScript compilation (must be first)
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        skipLibCheck: true,
        jsx: 'react-jsx',
        jsxImportSource: 'react',
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
          '@genuin/components': ['../../packages/components/src'],
          '@genuin/ui': ['../../packages/ui/src'],
        },
      },
    }),

    // 2. Alias resolution for monorepo
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        {
          find: '@genuin/components',
          replacement: path.resolve(__dirname, '../../packages/components/src'),
        },
        {
          find: '@genuin/ui',
          replacement: path.resolve(__dirname, '../../packages/ui/src'),
        },
      ],
    }),

    // 3. Node module resolution with polyfills for browser
    resolve({
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      browser: true,
      preferBuiltins: false,
      resolveOnly: [/.*/], // Resolve everything
    }),

    // 4. CommonJS to ES modules
    commonjs({
      include: ['node_modules/**'],
      transformMixedEsModules: true,
    }),

    // 5. CSS processing (Updated for Tailwind v4)
    postcss({
      extensions: ['.css'],
      extract: false, // Inline CSS in JS bundle
      minimize: !isDevelopment,
      inject: true,
      plugins: [
        // Tailwind v4 uses @tailwindcss/postcss plugin
        tailwindcssPostcss,
        // autoprefixer no longer needed - handled by Lightning CSS in Tailwind v4
        !isDevelopment &&
          cssnano({
            preset: 'default',
          }),
      ].filter(Boolean),
    }),

    // 6. Environment variable replacement
    replace({
      preventAssignment: true,
      values: envReplacements,
    }),

    // 7. Strip React directives
    {
      name: 'strip-react-directives',
      transform(code, id) {
        if (id.match(/\.(js|jsx|ts|tsx)$/)) {
          return code.replace(/^[\s\n]*["']use (client|server)["'];?\s*/gm, '')
        }
        return null
      },
    },

    // 8. Minification for production
    !isDevelopment &&
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2,
        },
        mangle: {
          toplevel: true,
          safari10: true,
        },
        format: {
          comments: false,
        },
      }),

    // 9. Bundle analyzer
    process.env.ANALYZE &&
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
      }),
  ].filter(Boolean),
})
