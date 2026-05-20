/**
 * @fileoverview
 * Feature: Shadow DOM isolation for single embed
 *
 * Objective:
 * Verify that when useShadowDOM is enabled, all SDK elements are properly
 * encapsulated within a shadow DOM and nothing leaks into the main document.
 *
 */

import { test, expect } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA, CONTAINER_IDS } from "../../data/init";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { waitForSDKshadowDOMRender } from "../../helpers/sdk-wait.helper";

test.describe("Feature: SDK Shadow DOM Isolation", () => {
  test.beforeEach(async ({ page }) => {
    await test.step("Setup: Load base test environment with SDK script available", async () => {
      await loadTestPage(page);
    });
  });

  test("Scenario: single embed with shadow DOM does not leak elements outside shadow host", async ({ page }) => {
    await test.step("Setup: Create SDK container element with embed-id and api-key data attributes", async () => {
      await createSDKContainer(page, {
        id: CONTAINER_IDS.single,
        dataAttributes: {
          "embed-id": SINGLE_EMBED_INIT_DATA.embed_id,
          "api-key": SINGLE_EMBED_INIT_DATA.api_key,
        },
      });
    });

    await test.step("Action: Initialize SDK with useShadowDOM: true", async () => {
      await page.evaluate(() => {
        (window as any).genuin.init({ useShadowDOM: true });
      });
    });

    await test.step("Result: Exactly 1 shadow host exists and all SDK elements are encapsulated", async () => {
      const { shadowHosts } = await waitForSDKshadowDOMRender(page, 1);
      await expect(shadowHosts).toHaveCount(1);
    });
  });
});
