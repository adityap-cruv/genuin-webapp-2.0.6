/**
 * @fileoverview
 * Feature: Webapp Home Page — Visual Regression
 *
 * Objective:
 * Capture a baseline screenshot of the iHeart home composition. Third-party
 * SDK placements are masked because their video inventory is intentionally
 * live and non-deterministic.
 */

import { test, expect } from "../_fixtures/mock";

test.describe("Feature: Webapp Home Page — Visual Regression", () => {
  test("Scenario: Home page full-page layout matches visual baseline", async ({ page }) => {
    await test.step("Action: Navigate to the home page", async () => {
      await page.goto("/home");
    });

    const carouselPlacement = page.getByTestId("iheart-home-carousel-placement").first();
    const feedPlacement = page.getByTestId("iheart-home-feed-placement").first();
    const gridPlacement = page.getByTestId("iheart-home-grid-placement").first();
    const homeMain = page.getByRole("main", { name: "iHeart home" });

    await test.step("Result: New editorial home sections and SDK hosts are visible", async () => {
      await expect(homeMain).toBeVisible();
      await expect(carouselPlacement).toBeVisible();
      await expect(feedPlacement).toBeVisible();
      await expect(gridPlacement).toBeAttached();
      await expect(page.getByRole("button", { name: "Starbucks" }).first()).toBeVisible();
      await expect(page.getByRole("heading", { name: "Featured", exact: true })).toBeVisible();
    });

    await test.step("Result: Home content screenshot matches baseline", async () => {
      await expect(homeMain).toHaveScreenshot("home-full-page.png", {
        animations: "disabled",
        mask: [carouselPlacement, feedPlacement, gridPlacement, homeMain.locator("img")],
        maskColor: "#e5e7eb",
      });
    });
  });
});
