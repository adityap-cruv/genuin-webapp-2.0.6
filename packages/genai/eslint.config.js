// ESLint config for the genai package — environment setup only.
// All rules are defined in packages/eslint-config.

import globals from 'globals';

import sharedConfig from '../eslint-config/library.js';

export default [
  ...sharedConfig,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.app.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // TODO(eslint-migration): Re-enable after migrating legacy code to proper types.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
