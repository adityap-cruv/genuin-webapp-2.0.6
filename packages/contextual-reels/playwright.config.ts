import { defineConfig, devices } from "@playwright/test";

// 3111 by default — deliberately far from the dev range. `pnpm dev` asks for 3010
// but Vite drifts upward when that is taken (3011, 3012, …), so it used to land on
// this suite's port; `reuseExistingServer` then handed the tests the dev server,
// which serves the app shell instead of the built `dist/gen_ext.min.js`.
// Override with CXR_E2E_PORT if 3111 is busy too. The `globalSetup` guard below
// catches the collision either way.
const PORT = Number(process.env.CXR_E2E_PORT ?? 3111);

/** Shared across projects — every one of these is load-bearing for the suite. */
const LAUNCH_OPTIONS = {
  args: [
    // Drive playback from our taps, not Chrome's media-engagement heuristic (the
    // localhost autoplay gotcha). Lets the control E2E assert play state
    // deterministically.
    "--autoplay-policy=no-user-gesture-required",
    "--mute-audio",
    // Use /tmp instead of the small /dev/shm — avoids intermittent silent
    // renderer crashes (page closes with no error) when an ad slot mounts.
    "--disable-dev-shm-usage",
  ],
};

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: ["**/legacy/**"],
  // Fails in ~1s with a readable message when dist/ is missing or the port is
  // owned by `pnpm dev` — otherwise both show up as 50 identical 15s mount
  // timeouts that read like a product break.
  globalSetup: "./tests/e2e/support/assertDistServer.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // CI: 2. Local: 1 — the widget occasionally triggers a silent Chromium
  // renderer close while an ad slot mounts (environmental, not a product bug);
  // a single retry absorbs it without masking real failures.
  retries: process.env.CI ? 2 : 1,
  // Conservative default of 1 under CI; `e2e-cxr.yml` overrides to `--workers=2`.
  // The suite waits on real media and real ad fill far more than it uses CPU, so
  // it overlaps well even on a 2-vCPU runner. Measured worker scaling is in
  // docs/TESTING.md (#8–11) — taken on the previous 41-test suite, so re-measure
  // before raising it further.
  workers: process.env.CI ? 1 : undefined,
  // CI: annotate failures inline AND write the HTML report the workflow uploads
  // as an artifact (the `github` reporter alone leaves nothing to download).
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: LAUNCH_OPTIONS },
    },
    // L3 (320×50), L4 (320×100) and L5 (320×480) only ever ship to phones, so
    // they also run under mobile Chrome: touch input, a mobile UA (which changes
    // `platform/device.ts`'s reported os_type) and a phone-sized viewport around
    // the slot. Pixel 5 is 393×851, so every mobile slot fits without scrolling.
    // The desktop formats (L1 300×600, L2 300×250) stay desktop-only.
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"], launchOptions: LAUNCH_OPTIONS },
      grep: /@mobile/,
    },
    // WebKit — the widget's riskiest untested surface. CXR embeds into arbitrary
    // publisher pages and its core mechanic is audio (silent autoplay, the
    // unmute gesture, `volume === 0` as source of truth), and iOS Safari differs
    // from Chromium on exactly those. Until this project existed, an entire
    // class of production bug was structurally invisible to the suite.
    //
    // Scoped to `@routing`: the layout-resolution and bundle-bootstrap cases
    // that read the mounted DOM without depending on media playback or a real ad
    // fill. Those are the assertions whose WebKit result is a genuine signal
    // rather than a retelling of how Safari handles autoplay — and they cost no
    // extra ad inventory. Widening it to the audio specs is worthwhile, but
    // expect real differences there and treat them as findings, not test bugs.
    //
    // `LAUNCH_OPTIONS` is Chromium-only (`--autoplay-policy`, `--mute-audio`,
    // `--disable-dev-shm-usage`), so it is deliberately not passed here.
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      grep: /@routing/,
    },
  ],
  webServer: {
    command: `npx --no-install serve dist -l ${PORT} --cors`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
