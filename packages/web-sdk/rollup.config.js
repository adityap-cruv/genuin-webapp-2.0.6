const typescript = require('@rollup/plugin-typescript')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const terser = require('@rollup/plugin-terser')
const postcss = require('rollup-plugin-postcss')
const replace = require('@rollup/plugin-replace')
const json = require('@rollup/plugin-json')
const packageJson = require('./package.json')

// Environment variables
const isProduction = process.env.NODE_ENV === 'production'
const env = process.env.BUILD_ENV || 'development'

module.exports = {
  input: 'src/index.ts',

  output: {
    file: `dist/genuin-sdk.${env}.js`,
    format: 'iife', // Changed from 'umd' to 'iife' for single bundle
    name: 'GenuinSDK',
    sourcemap: !isProduction,
    inlineDynamicImports: true, // Critical for single bundle
    banner: `/*! Genuin Web SDK v${packageJson.version} | ${env} */`,
  },

  external: [], // Bundle everything - no externals for single bundle

  plugins: [
    // Replace environment variables
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development',
        ),
        'process.env.BUILD_ENV': JSON.stringify(env),
        'process.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
        'process.env.NEXT_PUBLIC_HOST_URL': JSON.stringify(
          process.env.NEXT_PUBLIC_HOST_URL || '',
        ),
        'process.env.NEXT_PUBLIC_MEDIA_BASE_URL': JSON.stringify(
          process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '',
        ),
        'process.env.NEXT_PUBLIC_RUDDERSTACK_KEY': JSON.stringify(
          process.env.NEXT_PUBLIC_RUDDERSTACK_KEY || '',
        ),
        'process.env.NEXT_PUBLIC_RUDDERSTACK_URL': JSON.stringify(
          process.env.NEXT_PUBLIC_RUDDERSTACK_URL || '',
        ),
      },
    }),

    // Handle JSON imports
    json(),

    // Resolve node modules with browser polyfills
    resolve({
      browser: true,
      preferBuiltins: false,
      resolveOnly: [/.*/], // Resolve everything for single bundle
    }),

    // Convert CommonJS to ES modules
    commonjs({
      include: ['node_modules/**'],
      transformMixedEsModules: true,
    }),

    // Process CSS
    postcss({
      extract: `genuin-sdk.${env}.css`,
      minimize: isProduction,
      sourceMap: !isProduction,
      config: {
        path: './postcss.config.cjs',
      },
    }),

    // TypeScript compilation with relaxed checking for external packages
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      // Skip type checking for faster builds - focus on compilation only
      noEmitOnError: false,
      // Include TypeScript files from workspace packages but skip type checking
      compilerOptions: {
        skipLibCheck: true,
        noEmit: false,
        declaration: false,
        declarationMap: false,
        // Allow JS files to be processed
        allowJs: true,
        // Don't check types in node_modules or workspace packages
        skipDefaultLibCheck: true,
      },
      // Include workspace packages for compilation but not type checking
      include: ['src/**/*', '../ui/src/**/*', '../components/src/**/*'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.stories.*',
      ],
    }),

    // Strip React directives for browser compatibility
    {
      name: 'strip-react-directives',
      transform(code, id) {
        if (id.match(/\.(js|jsx|ts|tsx)$/)) {
          return code.replace(/^[\s\n]*["']use (client|server)["'];?\s*/gm, '')
        }
        return null
      },
    },

    // Minify in production
    ...(isProduction
      ? [
          terser({
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }),
        ]
      : []),
  ],

  // Suppress warnings for external packages
  onwarn(warning, warn) {
    // Skip certain warnings
    if (warning.code === 'THIS_IS_UNDEFINED') return
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    if (warning.message.includes('node_modules')) return
    if (warning.message.includes('packages/ui')) return
    if (warning.message.includes('packages/components')) return

    // Use default for everything else
    warn(warning)
  },
}
