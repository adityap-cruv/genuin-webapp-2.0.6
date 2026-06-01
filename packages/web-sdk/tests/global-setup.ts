/**
 * @fileoverview Playwright global setup for SDK E2E tests.
 *
 * - Ensures dist/gen_sdk.js exists (builds if missing).
 * - Bundles the MSW boot entry (tests/mocks/browser.ts) into test-dist/msw-boot.js.
 * - Writes index-test.html that loads MSW first and defers gen_sdk.js until the
 *   worker is active.
 *
 * All regression tests navigate to index-test.html via `loadTestPage()`.
 *
 * Prerequisites: Run `npm run build` before running tests so `dist/gen_sdk.js` exists.
 *
 * @author Genuin Team
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { build as esbuild } from "esbuild";

/**
 * Playwright globalSetup function.
 *
 * Checks if `dist/gen_sdk.js` exists (builds if missing), bundles the MSW
 * boot entry into `test-dist/msw-boot.js`, and writes `index-test.html` that
 * loads MSW before the SDK so no SDK request races the worker.
 */
async function globalSetup(): Promise<void> {
  const webSdkRoot = path.join(__dirname, "..");
  const sdkBuildPath = path.join(webSdkRoot, "dist", "gen_sdk.js");
  const testHtmlPath = path.join(webSdkRoot, "index-test.html");
  const mswBootSrc = path.join(webSdkRoot, "tests", "mocks", "browser.ts");
  const mswBootDir = path.join(webSdkRoot, "test-dist");
  fs.mkdirSync(mswBootDir, { recursive: true });
  const mswBootOut = path.join(mswBootDir, "msw-boot.js");

  if (fs.existsSync(sdkBuildPath)) {
    console.log("✅ dist/gen_sdk.js found.");
  } else {
    console.log("⚠️  dist/gen_sdk.js not found. Running build...");
    execSync("npm run build", { cwd: webSdkRoot, stdio: "inherit" });

    if (!fs.existsSync(sdkBuildPath)) {
      throw new Error("❌ Build completed but dist/gen_sdk.js still not found.");
    }
    console.log("✅ Build successful. dist/gen_sdk.js created.");
  }

  await esbuild({
    entryPoints: [mswBootSrc],
    bundle: true,
    format: "iife",
    globalName: "MSWBoot",
    target: "es2020",
    outfile: mswBootOut,
    loader: { ".json": "json" },
  });
  fs.appendFileSync(mswBootOut, `\nwindow.__MSW_BOOT__ = MSWBoot.startWorker();\n`);
  console.log("✅ test-dist/msw-boot.js built.");

  const htmlContent = `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>SDK Test Page</title>
    <script src="./test-dist/msw-boot.js"></script>
    <script>
      // Defer the SDK script until MSW worker has activated.
      // The SDK never fires a network request before window.__MSW_READY__ is true.
      window.addEventListener('load', async () => {
        try { await window.__MSW_BOOT__; }
        catch (err) { console.error('[test] MSW boot failed:', err); }
        const sdk = document.createElement('script');
        sdk.src = './dist/gen_sdk.js';
        // The SDK calls window.addEventListener('DOMContentLoaded', ...) for
        // its onGenuinReady callback path. That event has already fired by
        // the time the script is injected, so re-dispatch it after load so
        // any late-registered listeners still run.
        sdk.onload = () => {
          document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
        };
        document.body.appendChild(sdk);
      });
    </script>
</head>
<body></body>
</html>
`;
  fs.writeFileSync(testHtmlPath, htmlContent);
  console.log("✅ index-test.html created with MSW boot.");

  // Clean up legacy index-capture.html if it exists from earlier capture work.
  const captureHtmlPath = path.join(webSdkRoot, "index-capture.html");
  if (fs.existsSync(captureHtmlPath)) {
    fs.unlinkSync(captureHtmlPath);
  }
}

export default globalSetup;
