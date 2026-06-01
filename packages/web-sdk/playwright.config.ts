import fs from "fs";
import path from "path";

import { defineConfig, devices } from "@playwright/test";

const isDocMode = process.env.IGNORE_TEST_FAILURES === "true";
const testDocsDir = path.resolve(__dirname, "tests", "test-docs");
if (isDocMode) {
  fs.mkdirSync(testDocsDir, { recursive: true });
}

export default defineConfig({
  globalSetup: require.resolve("./tests/global-setup.ts"),
  testDir: "./tests/e2e",
  outputDir: "./tests/results/test-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: isDocMode ? 0 : 1,
  workers: 1,
  reporter: isDocMode
    ? [
        ["list"],
        [
          "@test2doc/playwright",
          {
            outputDir: testDocsDir,
            cleanOutput: true,
          },
        ],
      ]
    : [["html", { outputFolder: "./tests/results/playwright-report" }]],
  use: {
    baseURL: "http://localhost:3000/",
    trace: isDocMode ? "off" : "on-first-retry",
    screenshot: isDocMode ? "off" : "only-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // // Uncomment other browsers and devices as needed
    //  {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
    // /* Test against branded browsers. */
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // or 'chrome-beta'
    // },
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' }, // or 'msedge-dev'
    // },
  ],
  webServer: {
    command: "pnpm exec serve -l 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
