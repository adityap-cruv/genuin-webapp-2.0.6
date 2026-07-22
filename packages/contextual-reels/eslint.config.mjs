// Package-local ESLint config for @genuin/contextual-reels.
//
// Extends the monorepo root config and adds the `no-console` guardrail
// (CLAUDE.md: "No console.log in committed code — use a structured logger").
// The shared logger (src/utils/logger.ts) routes through console.debug/info/
// warn/error, which stay allowed; only `console.log` is banned. Scoped to this
// package so it cannot break lint/CI in other workspaces that still use
// console.log — a repo-wide rule change requires team approval.
import root from "../../eslint.config.mjs";

export default [
  ...root,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.test.{ts,tsx}", "src/**/*.stories.{ts,tsx}"],
    rules: {
      "no-console": ["error", { allow: ["debug", "info", "warn", "error"] }],
    },
  },
];
