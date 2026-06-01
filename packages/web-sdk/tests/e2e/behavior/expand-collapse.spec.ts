/**
 * @fileoverview
 * Feature: SDK expand and collapse functionality
 *
 * Objective:
 * Verify that the expand view opens when a user clicks an SDK video (UI interaction)
 * and that the collapse() method programmatically closes it (API call).
 *
 */

import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA, CONTAINER_IDS } from "../../data/init";
import { cleanupSDKState } from "../../helpers/cleanup.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { initEmpty } from "../../helpers/sdk-init.helper";
import { waitForSDKRender } from "../../helpers/sdk-wait.helper";

test.describe("Feature: SDK Expand and Collapse", () => {
  let sharedPage: Page;
  const containerDetails = {
    dataAttributes: {
      "embed-id": SINGLE_EMBED_INIT_DATA.embed_id,
      "api-key": SINGLE_EMBED_INIT_DATA.api_key,
    },
  };

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();

    await test.step("Setup: Load base test environment with SDK script available", async () => {
      await loadTestPage(sharedPage);
    });

    await test.step("Setup: Create SDK container element with required embed configuration", async () => {
      await createSDKContainer(sharedPage, containerDetails);
    });
  });

  test.afterEach(async () => {
    await cleanupSDKState(sharedPage, containerDetails);
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  test("Scenario: Expand view opens when SDK expand() is called", async () => {
    await test.step("Precondition: Initialize SDK with embed_id and api_key", async () => {
      await initEmpty(sharedPage);
    });

    await test.step("Precondition: Wait until SDK finishes rendering video content", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call expand() API method to open expand view", async () => {
      await sharedPage.evaluate((id) => {
        (window as any).genuin.expand(id);
      }, CONTAINER_IDS.single);
    });

    await test.step("Result: Full-screen expand view becomes visible with video elements", async () => {
      const expandView = sharedPage.locator(".gen-sdk-expand-view");
      await expect(expandView).toBeVisible({ timeout: 5_000 });

      const expandVideos = expandView.locator("video");
      await expect(expandVideos.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test("Scenario: Collapse closes the expanded view opened via start_video_slug", async () => {
    await test.step("Precondition: Initialize SDK with start_video_slug to auto-expand", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          start_video_slug: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Precondition: Wait until SDK finishes rendering and expand view is visible", async () => {
      await waitForSDKRender(sharedPage);
      const expandView = sharedPage.locator(".gen-sdk-expand-view");
      await expect(expandView).toBeVisible({ timeout: 5_000 });
    });

    await test.step("Action: Call genuin.collapse() to programmatically close the expand view", async () => {
      await sharedPage.evaluate((id) => {
        (window as any).genuin.collapse(id);
      }, CONTAINER_IDS.single);
    });

    await test.step("Result: Expand view is no longer visible", async () => {
      const expandView = sharedPage.locator(".gen-sdk-expand-view");
      await expect(expandView).toBeHidden({ timeout: 5_000 });
    });
  });
});
