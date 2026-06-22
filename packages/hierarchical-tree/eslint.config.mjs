// ESLint config for hierarchical-tree — uses the React library preset
// (no Next.js). All rules are defined in packages/eslint-config.
//
// The `dist/**` ignore is repeated here because flat-config `ignores`
// are resolved relative to the config file's directory. Running
// `eslint .` from this package picks up the root config, whose
// `dist/**` ignore points at the repo-root `dist`, not this package's.

import globals from "globals";

import sharedConfig from "../eslint-config/library.js";

export default [
  ...sharedConfig,
  {
    ignores: ["dist/**", "build/**"],
  },
  {
    files: ["vite.config.ts", "vitest.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
];
