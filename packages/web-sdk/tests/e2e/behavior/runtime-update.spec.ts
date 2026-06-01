/**
 * @fileoverview
 * Feature: SDK runtime updates — authentication and context
 *
 * Objective:
 * Validate that the SDK can dynamically update parameters (token, contextual params)
 * after initial initialization without requiring a page reload, and that rendered
 * content remains intact after the update.
 *
 */

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA, CONTAINER_IDS } from "../../data/init";
import { cleanupSDKState } from "../../helpers/cleanup.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { initEmpty, updateSDK } from "../../helpers/sdk-init.helper";
import { waitForSDKRender } from "../../helpers/sdk-wait.helper";

test.describe("Feature: SDK Runtime Updates — Authentication and Context", () => {
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

  test("Scenario: Update authentication token dynamically after initialization", async () => {
    await test.step("Precondition: Initialize SDK with embed_id and api_key", async () => {
      await initEmpty(sharedPage);
    });

    await test.step("Precondition: Wait until SDK finishes rendering video content", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.update({ token }) with a new authentication token", async () => {
      await updateSDK(sharedPage, {
        token: SINGLE_EMBED_INIT_DATA.token,
      });
    });

    await test.step("Result: Video content remains rendered after token update", async () => {
      await sharedPage.waitForSelector("video");
    });
  });

  test("Scenario: Update contextual params dynamically after initialization", async () => {
    await test.step("Precondition: Initialize SDK with embed_id and api_key", async () => {
      await initEmpty(sharedPage);
    });

    await test.step("Precondition: Wait until SDK finishes rendering video content", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.update({ contextual_params }) with new page context", async () => {
      await updateSDK(sharedPage, {
        contextual_params: {
          page_context: SINGLE_EMBED_INIT_DATA.page_context,
        },
        container_id: CONTAINER_IDS.single,
      });
    });

    await test.step("Result: SDK continues to render video content after contextual params update", async () => {
      await waitForSDKRender(sharedPage);
    });
  });

  test("Scenario: Update start_video_slug dynamically after initialization", async () => {
    await test.step("Precondition: Initialize SDK with embed_id and api_key", async () => {
      await initEmpty(sharedPage);
    });

    await test.step("Precondition: Wait until SDK finishes rendering video content", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.update({ start_video_slug }) with a target video slug", async () => {
      await updateSDK(sharedPage, {
        start_video_slug: SINGLE_EMBED_INIT_DATA.video_slug,
        container_id: CONTAINER_IDS.single,
      });
    });

    await test.step("Result: Expand view opens with video content after start_video_slug update", async () => {
      const expandView = sharedPage.locator(".gen-sdk-expand-view");
      await expect(expandView).toBeVisible({ timeout: 5_000 });

      const expandVideos = expandView.locator("video");
      await expect(expandVideos.first()).toBeVisible({ timeout: 10_000 });
    });
  });

  test("Scenario: Update start_video_slug with spark action triggers expand view", async () => {
    await test.step("Precondition: Initialize SDK with embed_id and api_key", async () => {
      await initEmpty(sharedPage);
    });

    await test.step("Precondition: Wait until SDK finishes rendering video content", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.update({ start_video_slug, action: spark }) to trigger expand", async () => {
      await updateSDK(sharedPage, {
        token: SINGLE_EMBED_INIT_DATA.token,
        start_video_slug: SINGLE_EMBED_INIT_DATA.video_slug,
        action: "spark",
        container_id: CONTAINER_IDS.single,
      });
    });

    await test.step("Result: Expand view becomes visible with video content after spark action", async () => {
      const expandView = sharedPage.locator(".gen-sdk-expand-view");
      await expect(expandView).toBeVisible({ timeout: 5_000 });

      const expandVideos = expandView.locator("video");
      await expect(expandVideos.first()).toBeVisible({ timeout: 10_000 });
    });
  });
});
