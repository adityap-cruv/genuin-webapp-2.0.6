// ESLint config for the components package — environment setup only.
// All rules are defined in packages/eslint-config.

import sharedConfig from "../eslint-config/library.js";

export default [
  ...sharedConfig,
  {
    rules: {
      // TODO(eslint-migration): Re-enable after migrating legacy code to proper types.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // vitest is a peer dep of @storybook/addon-vitest — not a direct dep, resolver can't find it
      "import/no-unresolved": ["error", { ignore: ["^vitest"] }],
    },
  },
];
