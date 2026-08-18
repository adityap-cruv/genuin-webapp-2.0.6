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
  // Playwright E2E. The root config supplies browser globals only, so `test`,
  // `expect`, `page` and Node's `process`/`console` all read as undefined and
  // `no-undef` fired on every spec — which is why `pnpm lint` was `eslint src/`
  // and the whole tests/ tree went unlinted.
  //
  // `page.evaluate` bodies are serialised into the browser, so these files
  // legitimately mix Node and DOM globals in one module; both are declared.
  {
    // Pre-Playwright Mocha-style files kept for reference only. Playwright
    // already `testIgnore`s them (playwright.config.ts) and they are not run,
    // maintained, or type-checked — linting them would only add noise.
    ignores: ["tests/e2e/legacy/**"],
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      globals: {
        // Playwright test runner
        test: "readonly",
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
        // Node side (harness helpers read fixtures off disk)
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        // Browser side (inside page.evaluate / addInitScript)
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        Element: "readonly",
        HTMLElement: "readonly",
        HTMLVideoElement: "readonly",
        HTMLImageElement: "readonly",
        ShadowRoot: "readonly",
        DOMRect: "readonly",
      },
    },
    rules: {
      // `page.waitForTimeout` is banned repo-wide (see tests/e2e/README.md) and
      // `page.waitForFunction` hangs once the widget mounts — rAF callbacks stop
      // being delivered for the slot, so a false predicate never re-evaluates and
      // never times out. Both cost hours to diagnose, so fail the lint instead.
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='waitForTimeout']",
          message: "Banned: use waitUntil/pollUntil from tests/e2e/support/poll.ts.",
        },
        {
          selector: "MemberExpression[property.name='waitForFunction']",
          message:
            "Banned: Playwright polls this on rAF, which stops firing once the widget mounts — the call hangs past its own timeout. Use waitUntil/pollUntil from tests/e2e/support/poll.ts.",
        },
      ],
    },
  },
];
