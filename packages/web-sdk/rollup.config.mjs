// rollup.config.mjs - Updated for Rollup v4
import typescript from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import cssnano from 'cssnano'
import json from '@rollup/plugin-json'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const NODE_ENV = process.env.NODE_ENV || 'development'
const isDevelopment = NODE_ENV === 'development'

// Read package.json for version information
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'),
)

// Version information from package.json
const versionInfo = {
  version: packageJson.version,
  lastBuildDate: new Date().toISOString(),
  environment: NODE_ENV,
}

// Load environment variables in order of priority
const commonEnv = dotenv.config({ path: '.env.common' }).parsed || {}
const envFile =
  NODE_ENV === 'production' ? '.env.production' : `.env.${NODE_ENV}`
const envConfig = dotenv.config({ path: envFile }).parsed || {}

// Combine environment variables with common taking precedence
const combinedEnv = {
  ...envConfig, // Environment specific variables
  ...commonEnv, // Common variables override environment specific ones
}

// Convert env variables to process.env format
const processEnvValues = Object.entries(combinedEnv).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [`process.env.${key}`]: JSON.stringify(value),
  }),
  {
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    'process.env.BUILD_DATE': JSON.stringify(versionInfo.lastBuildDate),
  },
)

// Terser configuration for minification
const terserConfig = {
  compress: {
    drop_console: true,
    dead_code: true,
    unused: true,
    warnings: true,
    passes: 2,
    evaluate: true,
  },
  mangle: {
    toplevel: true,
  },
  format: {
    comments: /^!/, // Preserve comments that start with '!'
  },
}

// Generate banner comment
const getBanner = () => {
  if (isDevelopment) {
    return '/*! Genuin Web SDK - Development Build */'
  }
  return `/*! Genuin Web SDK v${versionInfo.version} - ${versionInfo.environment} - Built on ${versionInfo.lastBuildDate} */`
}

export default {
  input: 'src/index.ts',
  output: {
    file: isDevelopment ? 'dist/gen_sdk.js' : 'dist/gen_sdk.min.js',
    format: 'iife',
    sourcemap: isDevelopment,
    globals: {
      'react/jsx-runtime': 'jsxRuntime',
      'react-dom/client': 'client',
    },
    banner: getBanner(),
    generatedCode: 'es2015', // Generate modern ES code
    compact: !isDevelopment,
  },
  plugins: [
    {
      name: 'resolve-cropperjs-css',
      resolveId(source) {
        if (source === 'cropperjs/dist/cropper.css') {
          // Try multiple possible locations for cropperjs CSS in a monorepo setup
          const possiblePaths = [
            // Direct node_modules in the package
            path.resolve(__dirname, 'node_modules/cropperjs/dist/cropper.css'),
            // Hoisted to workspace root
            path.resolve(
              __dirname,
              '../../node_modules/cropperjs/dist/cropper.css',
            ),
            // In pnpm's virtual store under react-cropper
            path.resolve(
              __dirname,
              '../../node_modules/.pnpm/node_modules/cropperjs/dist/cropper.css',
            ),
            // Direct dependency of react-cropper
            path.resolve(
              __dirname,
              '../../node_modules/react-cropper/node_modules/cropperjs/dist/cropper.css',
            ),
            // pnpm nested structure
            path.resolve(
              __dirname,
              '../../node_modules/.pnpm/cropperjs@*/node_modules/cropperjs/dist/cropper.css',
            ),
          ]

          for (const potentialPath of possiblePaths) {
            try {
              if (fs.existsSync(potentialPath)) {
                console.log(`Found cropperjs CSS at: ${potentialPath}`)
                return potentialPath
              }
            } catch (e) {
              // Ignore errors and try next path
            }
          }

          console.warn(
            'Warning: Could not find cropperjs/dist/cropper.css in any expected location',
          )
        }
        return null
      },
    },
    postcss({
      extensions: ['.css'],
      include: !isDevelopment ? '**/*.css' : undefined,
      extract: !isDevelopment ? 'gen-sdk.css' : undefined,
      minimize: true,
      plugins: [
        // Custom PostCSS plugin to fix "!important *" expressions
        {
          postcssPlugin: 'fix-important-multiplication',
          Once(root) {
            root.walkDecls((decl) => {
              // Fix expressions like "12px !important * var(--tw-space-x-reverse)"
              if (decl.value && decl.value.includes('!important *')) {
                decl.value = decl.value.replace(
                  /(\d+px)\s+!important\s+\*\s+(.+)/,
                  'calc($1 * $2)',
                )
              }
            })
          },
        },
        cssnano(),
      ],
    }),
    // Custom plugin to strip 'use client' and 'use server' directives
    {
      name: 'strip-directives',
      transform(code, id) {
        if (id.match(/\.(js|jsx|ts|tsx|mjs)$/)) {
          // More robust regex to handle whitespace variations
          const result = code.replace(
            /^[\s\n]*["']use (client|server)["'];?[\s\n]*/m,
            '',
          )
          return {
            code: result,
            map: null, // Tell Rollup to preserve existing sourcemaps
          }
        }
        return null
      },
    },
    typescript({
      tsconfig: 'tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          skipLibCheck: true,
          noImplicitAny: false,
          strictNullChecks: false,
          exactOptionalPropertyTypes: false,
          strict: false,
        },
      },
      check: false, // Disable TypeScript type checking completely
    }),
    !isDevelopment && terser(terserConfig),
    replace({
      preventAssignment: true,
      ...processEnvValues,
    }),
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
      browser: true,
    }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs(),
    json(),
  ].filter(Boolean),
}
