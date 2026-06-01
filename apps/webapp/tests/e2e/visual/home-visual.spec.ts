/**
 * @fileoverview
 * Feature: Webapp Home Page — Visual Regression
 *
 * Objective:
 * Capture a full-page baseline screenshot of the home feed. Mock backend
 * provides deterministic data so no per-element masking is needed.
 * Video controls are revealed via hover before the snapshot is taken.
 */

import { test, expect } from "../_fixtures/mock";

test.describe("Feature: Webapp Home Page — Visual Regression", () => {
  test("Scenario: Home page full-page layout matches visual baseline", async ({ page }) => {
    await test.step("Action: Navigate to the home page", async () => {
      await page.goto("/home");
    });

    await test.step("Result: Feed section is visible (skeleton has resolved)", async () => {
      await expect(page.locator("div#gencl-feed-view")).toBeVisible({ timeout: 20_000 });
    });

    await test.step("Result: Video player has mounted", async () => {
      await page.waitForSelector("video", { state: "attached", timeout: 20_000 });
    });

    await test.step("Result: Side panel pills are visible (PostSidePanel Suspense resolved)", async () => {
      await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible({ timeout: 15_000 });
    });

    await test.step("Result: Comment section has settled (no skeleton rows)", async () => {
      const commentItem = page.locator(".comment").first();
      const emptyState = page.getByText("No Comments Yet");
      const errorState = page.getByText("We're unable to load comments.");
      await expect(commentItem.or(emptyState).or(errorState)).toBeVisible({ timeout: 15_000 });
    });

    await test.step("Setup: Hover video to reveal controls overlay", async () => {
      await page.hover("video", { force: true });
    });

    await test.step("Result: Full-page screenshot matches baseline", async () => {
      await expect(page).toHaveScreenshot("home-full-page.png", {
        fullPage: true,
        animations: "disabled",
      });
    });
  });
});
