import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Base ESLint configuration shared across all packages.
 * React, Next.js, and other framework-specific rules go in their own config files.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    // Build/config/tooling files run in Node, not the browser/bundler sandbox,
    // so they legitimately reference Node globals (`process`, `__dirname`, …).
    // Without this, `no-undef` (from js.configs.recommended) flags them. Scoped
    // to tooling file patterns so `src/**` app code never silently gains Node
    // globals it shouldn't use.
    files: [
      "**/*.config.{js,cjs,mjs,ts}",
      "**/vite.config.*",
      "**/rollup.config*.{js,cjs,mjs}",
      "**/scripts/**/*.{js,cjs,mjs}",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ignores: ["dist/**"],
  },
];
