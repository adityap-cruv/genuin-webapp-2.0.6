import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  root: repoRoot,
  plugins: [
    tsconfigPaths({
      projects: ["apps/webapp/tsconfig.json", "packages/components/tsconfig.json"],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    environment: "node",
    include: [
      "packages/components/src/**/*.test.{ts,tsx}",
      "apps/webapp/src/lib/**/*.test.{ts,tsx}",
    ],
  },
});
