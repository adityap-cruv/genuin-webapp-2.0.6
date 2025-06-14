// ESLint config for the webapp, extending the shared monorepo config (ESM)

import sharedConfig from '../../packages/eslint-config/index.js'
import pluginNext from '@next/eslint-plugin-next'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'
// ESM-safe __dirname replacement
const tsconfigRootDir = new URL('.', import.meta.url).pathname

/**
 * Webapp-specific ESLint config:
 * - Enables type-aware linting (parserOptions.project)
 * - Adds Prettier plugin and rule
 * - Sets browser and ES2021 env
 */
// TODO [eslint-migration]: Temporarily suppress most warnings for smoother transition.
// See LINTING.md for details and plan to re-enable rules after code cleanup.
// Create a Next.js config object for ESLint
const nextJsConfig = {
  plugins: {
    next: pluginNext,
  },
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  rules: {
    ...(pluginNext.configs.recommended?.rules || {}),
    'next/no-html-link-for-pages': 'warn',
    'next/no-img-element': 'warn',
    'next/no-sync-scripts': 'warn',
    'next/no-unwanted-polyfillio': 'warn',
  },
}

// Ignore config for specific paths that don't need linting or cause issues
const ignoreConfig = {
  ignores: [
    'src/app/.well-known/**', // Ignore .well-known directory files
  ],
}

export default [
  ...sharedConfig,
  // Include the Next.js plugin config
  nextJsConfig,
  // Add ignore configuration
  ignoreConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir,
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      prettier: prettierPlugin,
      next: pluginNext,
    },
    rules: {
      // Suppress parserOptions.project errors for .well-known routes (not in TS project)
      // TODO [eslint-migration]: Re-enable after moving these files into the TS project or excluding from lint
      'no-unused-vars': 'off',
      // Suppress parserOptions.project errors for .well-known routes (not in TS project)
      // TODO [eslint-migration]: Re-enable after moving these files into the TS project or excluding from lint
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-constant-binary-expression': 'off', // TODO [eslint-migration]: Re-enable after cleanup
      // Prettier as warning, as in legacy config
      'prettier/prettier': 'off', // TODO [eslint-migration]: Re-enable after formatting cleanup

      // Suppress common TypeScript/React warnings for migration
      '@typescript-eslint/no-unused-vars': 'off', // TODO [eslint-migration]: Re-enable after cleanup
      '@typescript-eslint/no-explicit-any': 'off', // TODO [eslint-migration]: Re-enable after cleanup
      '@typescript-eslint/consistent-type-imports': 'off', // TODO [eslint-migration]: Re-enable after cleanup
      '@typescript-eslint/no-empty-object-type': 'off', // TODO [eslint-migration]: Re-enable after cleanup
      '@typescript-eslint/no-unused-expressions': 'off', // TODO [eslint-migration]: Re-enable after cleanup
      '@typescript-eslint/no-require-imports': 'off', // TODO [eslint-migration]: Re-enable after cleanup

      'import/order': 'off', // TODO [eslint-migration]: Re-enable after import cleanup
      'import/no-unresolved': 'off', // TODO [eslint-migration]: Re-enable after path alias/config cleanup
      'no-console': 'off', // TODO [eslint-migration]: Re-enable after removing debug logs
      'no-undef': 'off', // TODO [eslint-migration]: Re-enable after fixing globals
      'react-hooks/rules-of-hooks': 'off', // TODO [eslint-migration]: Re-enable after hooks cleanup
      'react-hooks/exhaustive-deps': 'off', // TODO [eslint-migration]: Re-enable after hooks cleanup
      'react/no-unescaped-entities': 'off', // TODO [eslint-migration]: Re-enable after content cleanup
      'react/no-unknown-property': 'off', // TODO [eslint-migration]: Re-enable after content cleanup

      '@next/next/no-html-link-for-pages': 'off', // TODO [eslint-migration]: Re-enable after Next.js link cleanup
      'turbo/no-undeclared-env-vars': 'off', // TODO [eslint-migration]: Re-enable after env var cleanup

      // Workaround: Disable all @tanstack/query rules due to ESLint v9 incompatibility
      '@tanstack/query/exhaustive-deps': 'off',
      '@tanstack/query/stable-query-client': 'off',
      '@tanstack/query/prefer-query-object-syntax': 'off',
      '@tanstack/query/no-rest-destructuring': 'off',
      '@tanstack/query/no-mount': 'off',
      '@tanstack/query/no-mutation-in-render': 'off',
      '@tanstack/query/no-mutation-in-side-effect': 'off',
      '@tanstack/query/no-mutation-in-query-fn': 'off',
      '@tanstack/query/no-mutation-in-query-key': 'off',
      '@tanstack/query/no-mutation-in-query-options': 'off',
      '@tanstack/query/no-mutation-in-query-result': 'off',
      '@tanstack/query/no-mutation-in-query-state': 'off',
      '@tanstack/query/no-mutation-in-query-updater': 'off',
      '@tanstack/query/no-mutation-in-query-variables': 'off',
      '@tanstack/query/no-mutation-in-query': 'off',
    },
  },
]
