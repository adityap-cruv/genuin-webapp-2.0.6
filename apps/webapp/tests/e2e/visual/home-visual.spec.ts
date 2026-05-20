/**
 * @fileoverview
 * Feature: Webapp Home Page — Visual Regression
 *
 * Objective:
 * Capture a full-page baseline screenshot of the authenticated home feed.
 * Feed API responses are intercepted to strip video URLs so no media loads.
 * Dynamic user content (avatars, names, counts) is masked to prevent false diffs.
 * Video controls are revealed via hover before the snapshot is taken.
 *
 */

import { test, expect } from "@playwright/test";

import { stubVideoSources } from "../../helpers/video-intercept.helper";
import { getFeedVisualMasks, stabilizeFeedPlayer } from "../../helpers/visual-regression.helper";

test.describe.skip("Feature: Webapp Home Page — Visual Regression", () => {
  test("Scenario: Home page full-page layout matches visual baseline", async ({ page }) => {
    await test.step("Setup: Intercept feed API to strip video URLs before navigation", async () => {
      // Must register route before goto so the intercept is active when the feed API fires.
      await stubVideoSources(page);
    });

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
      // Pills render synchronously from feed data once PostSidePanel mounts.
      await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible({ timeout: 15_000 });
    });

    await test.step("Result: Comment section has settled (no skeleton rows)", async () => {
      // Any terminal state means the Comments API call is done and skeletons are gone.
      const commentItem = page.locator(".comment").first();
      const emptyState = page.getByText("No Comments Yet");
      const errorState = page.getByText("We're unable to load comments.");
      await expect(commentItem.or(emptyState).or(errorState)).toBeVisible({ timeout: 15_000 });
    });

    await test.step("Setup: Stabilise video player and reveal controls overlay", async () => {
      await stabilizeFeedPlayer(page);
    });

    await test.step("Result: Full-page screenshot matches baseline", async () => {
      await expect(page).toHaveScreenshot("home-full-page.png", {
        fullPage: true,
        animations: "disabled",
        mask: getFeedVisualMasks(page),
      });
    });
  });
});
