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

    const breakfastClubPlacement = page.getByTestId("iheart-breakfast-club-carousel-placement");
    const carouselPlacement = page.getByTestId("iheart-home-carousel-placement");
    const homeMain = page.getByRole("main", { name: "iHeart home" });

    await test.step("Result: The iHeart media rails and SDK host are visible", async () => {
      await expect(homeMain).toBeVisible();
      await expect(breakfastClubPlacement).toBeVisible();
      await expect(carouselPlacement).toBeVisible();
      await expect(page.getByRole("heading", { name: "Latest from Breakfast Club" })).toBeVisible();
      await expect(
        homeMain
          .locator('section[aria-labelledby="latest-breakfast-club"]')
          .getByTestId("iheart-breakfast-club-carousel-placement")
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "iHeart Contests & Promotions" })).toBeVisible();
      await expect(page.getByRole("link", { name: /\$1,000 Great Gas Giveaway/ })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Articles", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Audio Players" })).toBeVisible();
      await expect(page.getByText("Z100", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Top Live Categories in iHeart" })).toBeVisible();
      await expect(
        homeMain
          .locator('section[aria-labelledby="iheart-live-categories"]')
          .getByTestId("iheart-home-carousel-placement")
      ).toBeVisible();
      await expect(page.getByRole("heading", { name: "Latest Videos" })).toHaveCount(0);
    });

    await test.step("Result: Home content screenshot matches baseline", async () => {
      await expect(homeMain).toHaveScreenshot("home-full-page.png", {
        animations: "disabled",
        mask: [breakfastClubPlacement, carouselPlacement, homeMain.locator("img")],
        maskColor: "#e5e7eb",
      });
    });
  });
});
