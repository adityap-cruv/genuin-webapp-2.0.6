// Root ESLint config for the Genuin monorepo (ESM)
// base + react rules apply universally; Next.js rules are scoped to apps/webapp only.
import base from "./packages/eslint-config/base.js";
import reactInternal from "./packages/eslint-config/react-internal.js";
import next from "./packages/eslint-config/next.js";

export default [
  ...base,
  ...reactInternal,
  // Scope Next.js-specific plugins/rules to apps/webapp — they are irrelevant to library packages.
  ...next.map((config) => {
    if (config.ignores) return config;
    if (config.files) {
      return { ...config, files: config.files.map((f) => `apps/webapp/${f}`) };
    }
    return { ...config, files: ["apps/webapp/**"] };
  }),
  {
    ignores: ["node_modules/**", "dist/**", "build/**", ".next/**", "**/*.min.js", "legacy-webapp/**"],
  },
];
