import { defineConfig, devices } from "@playwright/test";
import path from "path";
import fs from "fs";

const isDocMode = process.env.IGNORE_TEST_FAILURES === "true";
const testDocsDir = path.resolve(__dirname, "tests", "test-docs");
if (isDocMode) {
  fs.mkdirSync(testDocsDir, { recursive: true });
}

const mockPort = Number(process.env.MOCK_SERVER_PORT ?? 4006);
const mockBaseUrl = `http://localhost:${mockPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/test-results",
  globalSetup: "./tests/mocks/global-setup.ts",
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
    : [["html", { outputFolder: "./tests/playwright-report" }]],
  use: {
    baseURL: "http://localhost:4005",
    trace: isDocMode ? "off" : "on-first-retry",
    screenshot: isDocMode ? "off" : "on",
  },
  // Allow minor sub-pixel differences between machines and OS render engines.
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
    // Load `.env` from repo root (NextAuth secret, encryption keys, etc.)
    // via env-cmd, but use `--no-override` so the mock-URL env block below
    // wins over the real API URLs in `.env`.
    command:
      "pnpm --filter @genuin/webapp exec env-cmd -f ../../.env --no-override next dev -p 4005",
    url: "http://localhost:4005/home",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      GO_API_URL: mockBaseUrl,
      NEXT_PUBLIC_GO_API_URL: mockBaseUrl,
      NEXT_PUBLIC_API_URL: mockBaseUrl,
    },
  },
});
