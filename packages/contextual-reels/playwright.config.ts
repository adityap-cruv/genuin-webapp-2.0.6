import { defineConfig, devices } from "@playwright/test";

const PORT = 3011;

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: ["**/legacy/**"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // CI: 2. Local: 1 — the widget occasionally triggers a silent Chromium
  // renderer close while an ad slot mounts (environmental, not a product bug);
  // a single retry absorbs it without masking real failures.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Drive playback from our taps, not Chrome's media-engagement heuristic
        // (the localhost autoplay gotcha). Lets the control E2E assert play state
        // deterministically.
        launchOptions: {
          args: [
            "--autoplay-policy=no-user-gesture-required",
            "--mute-audio",
            // Use /tmp instead of the small /dev/shm — avoids intermittent silent
            // renderer crashes (page closes with no error) when an ad slot mounts.
            "--disable-dev-shm-usage",
          ],
        },
      },
    },
  ],
  webServer: {
    command: `npx --no-install serve dist -l ${PORT} --cors`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
