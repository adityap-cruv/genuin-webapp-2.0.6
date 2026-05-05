// ESLint config for web-sdk — uses React preset only (no Next.js).
// All rules are defined in packages/eslint-config.

import sharedConfig from "../eslint-config/library.js";

export default [
  ...sharedConfig,
  {
    ignores: ["dist/**", "build/**"],
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
      "import/internal-regex": "^@/",
    },
  },
  {
    files: ["src/loader.js"],
    languageOptions: {
      globals: {
        __DEV_ENVIRONMENT__: "readonly",
      },
    },
  },
  {
    rules: {
      // TODO: re-enable this
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
