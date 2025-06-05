// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
// ESLint config for the UI package, extending the shared monorepo config
import sharedConfig from "../eslint-config/index.js";

export default [
  ...sharedConfig,
  // UI-specific overrides to disable Next.js and type-aware rules that don't apply
  {
    // TODO [eslint-migration]: Temporarily suppress most warnings for smoother migration. See LINTING.md for plan to re-enable.
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-misused-promises": "off",

      // Suppress common UI warnings for migration
      "@typescript-eslint/no-unused-vars": "off", // TODO: Re-enable after cleanup
      "@typescript-eslint/no-explicit-any": "off", // TODO: Re-enable after cleanup
      "no-console": "off", // TODO: Re-enable after cleanup
      "no-undef": "off", // TODO: Re-enable after cleanup
      "react/no-unescaped-entities": "off", // TODO: Re-enable after cleanup
      "react-hooks/rules-of-hooks": "off", // TODO: Re-enable after cleanup
      "react-hooks/exhaustive-deps": "off", // TODO: Re-enable after cleanup
      "import/order": "off", // TODO: Re-enable after import cleanup
      "no-unused-eslint-disable": "off", // TODO: Re-enable after cleanup
    },
  },
];
