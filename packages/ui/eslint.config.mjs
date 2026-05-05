// ESLint config for the UI package — environment setup only.
// All rules are defined in packages/eslint-config.

import globals from "globals";

import sharedConfig from "../eslint-config/library.js";

export default [
  ...sharedConfig,
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      // TODO(eslint-migration): Re-enable after migrating legacy code to proper types.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
