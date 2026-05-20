/**
 * @fileoverview Playwright global setup for SDK E2E tests.
 *
 * Runs once before all test suites. Creates `index-test.html` at the web-sdk root
 * if it doesn't already exist. This HTML file is a minimal page that loads the built
 * SDK bundle (`dist/gen_sdk.js`) via a script tag.
 *
 * All tests navigate to this page using `loadTestPage()` from `page.helper.ts`.
 *
 * Prerequisites: Run `npm run build` before running tests so `dist/gen_sdk.js` exists.
 *
 * @author Genuin Team
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Playwright globalSetup function.
 *
 * Checks if `dist/gen_sdk.js` exists. If not, automatically triggers
 * `npm run build` to create it. Then creates `index-test.html` if missing.
 */
async function globalSetup() {
  const webSdkRoot = path.join(__dirname, "..");
  const sdkBuildPath = path.join(webSdkRoot, "dist", "gen_sdk.js");
  const testHtmlPath = path.join(webSdkRoot, "index-test.html");

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

  const htmlContent = `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            <title>SDK Test Page</title>
        </head>
        <body>
        </body>
        <script src="./dist/gen_sdk.js"></script>
        </html>
`;
  fs.writeFileSync(testHtmlPath, htmlContent);
  console.log("✅ index-test.html created.");
}

export default globalSetup;
