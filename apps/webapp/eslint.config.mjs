// ESLint config for the webapp — environment setup only.
// All rules are defined in packages/eslint-config.
// This file only sets: parser project path, globals, ignores, and migration suppressions.

import globals from "globals";

import sharedConfig from "../../packages/eslint-config/index.js";

const tsconfigRootDir = new URL(".", import.meta.url).pathname;

export default [
  ...sharedConfig,
  {
    ignores: ["src/app/.well-known/**", "config/**", "scripts/**"],
  },
  {
    settings: {
      next: {
        rootDir: tsconfigRootDir,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: `${tsconfigRootDir}tsconfig.json`,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
  {
    files: ["*.mjs", "*.cjs", "*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      // TODO: this is a quick fix to suppress errors from next.config.mjs — we should refactor next.config.mjs to be type-safe and remove this
      // @genuin/components/styles resolves to dist/index.css (built artifact) — bundler handles it
      "import/no-unresolved": ["error", { ignore: ["@genuin/components/styles"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
