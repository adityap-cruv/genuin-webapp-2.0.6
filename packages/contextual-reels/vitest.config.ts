import { resolve } from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

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
      exclude: ["src/**/*.test.{ts,tsx,js,jsx}", "src/loader.js", "src/**/*.stories.{ts,tsx,js,jsx}"],
      thresholds: {
        perFile: true,
        lines: 85,
        branches: 75,
        functions: 85,
        statements: 85,
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
