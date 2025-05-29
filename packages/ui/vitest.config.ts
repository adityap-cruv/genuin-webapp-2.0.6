import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(
        typeof require !== "undefined" ? require.main?.filename || "" : ""
      );

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineConfig({
  plugins: [react()], // This imports and uses @vitejs/plugin-react
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/jest.setup.ts"],
    workspace: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            name: "chromium",
            provider: "playwright",
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
