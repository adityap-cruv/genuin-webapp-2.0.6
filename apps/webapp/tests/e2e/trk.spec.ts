/**
 * @fileoverview
 * Feature: `/trk` ad-redirect route
 *
 * Objective:
 * `/trk` is a client-side redirect middleware used by ad/QR-code destinations. On load it reads
 * tracking query params, fires a RudderStack "Page Viewed" event, and redirects the browser via
 * `window.location.replace(target)` within a 500ms cap. `target` is the `redirect_url` query param
 * only if it parses as an absolute `https:` URL; any other value (missing, malformed, or a
 * non-https scheme such as `http:`) falls back to the site homepage `/` to prevent open-redirect
 * abuse. These tests verify both the happy-path external redirect and the two homepage-fallback
 * cases.
 *
 * @author Genuin Team
 */
import { test, expect } from "./_fixtures/mock";

test.describe("Feature: /trk ad-redirect route", () => {
  test("Scenario: Valid https redirect_url redirects to the external destination", async ({ page }) => {
    await test.step("Action: Stub the external destination so the test never hits a real site", async () => {
      await page.route("https://redirect-target.test/**", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<html><body>dest</body></html>",
        })
      );
    });

    await test.step("Action: Navigate to /trk with a valid https redirect_url and ad params", async () => {
      const redirectUrl = encodeURIComponent("https://redirect-target.test/landing");
      await page.goto(
        `/trk?utm_medium=QR&redirect_url=${redirectUrl}&tag_id=t1&user_id=u1&creative_id=c1&ad_domain=redirect-target.test`
      );
    });

    await test.step("Result: Browser is redirected to the validated https destination", async () => {
      await page.waitForURL("https://redirect-target.test/landing", { timeout: 5000, waitUntil: "commit" });
      expect(page.url()).toBe("https://redirect-target.test/landing");
    });
  });

  test("Scenario: Missing redirect_url falls back to the homepage", async ({ page }) => {
    await test.step("Action: Navigate to /trk without a redirect_url param", async () => {
      await page.goto("/trk?utm_medium=QR&tag_id=t1");
    });

    await test.step("Result: Browser is redirected to the homepage", async () => {
      await page.waitForURL((url) => url.pathname === "/", { timeout: 5000, waitUntil: "commit" });
      expect(new URL(page.url()).pathname).toBe("/");
    });
  });

  test("Scenario: Non-https redirect_url falls back to the homepage", async ({ page }) => {
    await test.step("Action: Navigate to /trk with an insecure http redirect_url", async () => {
      const redirectUrl = encodeURIComponent("http://insecure.test/x");
      await page.goto(`/trk?redirect_url=${redirectUrl}`);
    });

    await test.step("Result: Browser is redirected to the homepage rather than the insecure URL", async () => {
      await page.waitForURL((url) => url.pathname === "/", { timeout: 5000, waitUntil: "commit" });
      expect(new URL(page.url()).pathname).toBe("/");
    });
  });
});
