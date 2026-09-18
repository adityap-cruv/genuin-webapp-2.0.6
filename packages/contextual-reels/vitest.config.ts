import { resolve } from "path";
import { fileURLToPath } from "url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@cxr": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/_setup/vitest.setup.ts"],
    include: [
      "tests/unit/**/*.test.{ts,tsx,js,jsx}",
      "tests/_mocks/**/*.test.{ts,tsx,js,jsx}",
      "src/**/*.test.{ts,tsx,js,jsx}",
    ],
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx,js,jsx}",
        "src/**/*.stories.{ts,tsx,js,jsx}",
        // Browser-only bootstrap entrypoints: mount the widget into a real host
        // node via createRoot + MutationObserver and use Date.now/Math.random.
        // Not unit-testable in jsdom.
        //
        // "Exercised by E2E" is now specifically true, which it was not when this
        // exclusion was written: `tests/e2e/publicApi.spec.ts` asserts the
        // host-facing surface these two files build — `window.cxr` and its
        // methods, the per-instance `ready` emit, DOM-id alias resolution through
        // `expand`/`collapse`, the `cxr:*` postMessage bridge, multi-slot
        // instancing, node-removal teardown, and the `adFillCallback` partner
        // global — and `tests/e2e/init.spec.ts` covers the loader's build-time
        // placeholder substitution. Before that, the only assertion against
        // either file was "the bundle responds 200".
        //
        // If you add logic here that those specs do not reach, add the assertion
        // rather than relying on this comment.
        "src/loader.jsx",
        "src/index.jsx",
        // Type-only declarations carry no executable lines.
        "src/types.ts",
        "src/**/*.d.ts",
        // Storybook-only MSW bootstrap + handlers: loaded by .storybook preview,
        // never shipped or imported by src runtime code.
        "src/stories/**",
      ],
      thresholds: {
        perFile: true,
        // Ratcheted 2026-08-15 from 85/75/85/85. That floor sat ~14 points below
        // reality (the suite measures 99.6% lines / 97.4% branches / 100%
        // functions), so a file could regress from 100% to 85% and still pass —
        // the gate protected a floor nothing was near instead of protecting what
        // exists.
        //
        // These are set against the WEAKEST file on this gate, not the average,
        // because `perFile: true` evaluates every file independently. Of the 87
        // files here the minima are: lines 92.1, branches 82.0, statements 92.1
        // (all `observability/pixel-reporter.ts`), functions 100. So each number
        // below keeps ~2 points of headroom — enough that an honest refactor does
        // not trip it, tight enough that a real regression does.
        //
        // Re-measure before raising further:
        //   pnpm test:coverage -- --coverage.reporter=json-summary
        lines: 90,
        branches: 80,
        // 100 deliberately, and it is currently free: every file already sits at
        // 100% functions. This is what makes CLAUDE.md's "a new source file with
        // no test fails the coverage gate" actually true — before this, a new file
        // could pass on transitive coverage alone, and 16 of them did.
        functions: 100,
        statements: 90,
        "src/utils/**": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/device/**": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/analytics/**/*.{ts,tsx}": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/services/**/*.{ts,tsx}": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/config/**/*.{ts,tsx}": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/providers/**/*.{ts,tsx}": {
          lines: 95,
          branches: 90,
          functions: 95,
          statements: 95,
        },
        "src/ads/**": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/feed/transforms/**": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/player/**": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
        "src/utils/thumbnails.ts": {
          lines: 100,
          branches: 100,
          functions: 100,
          statements: 100,
        },
      },
    },
  },
});
