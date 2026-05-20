/**
 * @fileoverview
 * Feature: SDK destroy() lifecycle behavior
 *
 * Objective:
 * Validate that invoking destroy() completely tears down the SDK instance,
 * removes all rendered UI elements, and leaves the container in a clean state.
 *
 */

import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA, CONTAINER_IDS } from "../../data/init";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { initEmpty } from "../../helpers/sdk-init.helper";
import { waitForSDKRender } from "../../helpers/sdk-wait.helper";

test.describe("Feature: SDK destroy() method", () => {
  let sharedPage: Page;

  const containerId = CONTAINER_IDS.single;

  const containerDetails = {
    id: containerId,
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

  test.afterAll(async () => {
    await sharedPage.close();
  });

  test(" After destroy() is invoked, all rendered video elements must be removed from the container", async () => {
    await test.step("Precondition: Initialize SDK with embed_id and api_key", async () => {
      await initEmpty(sharedPage);
    });

    await test.step("Precondition: Wait until SDK finishes rendering video content", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Verification (Before Action): Ensure at least one video element is rendered inside the container", async () => {
      const videosBefore = sharedPage.locator("#gen-sdk video");
      const countBefore = await videosBefore.count();
      expect(countBefore).toBeGreaterThan(0);
    });

    await test.step("Action: Invoke genuin.destroy() to tear down the SDK instance", async () => {
      await sharedPage.evaluate(() => {
        (window as any).genuin.destroy();
      });
    });

    await test.step("Result: No video elements should remain inside the SDK container after destroy()", async () => {
      const videosAfter = sharedPage.locator("#gen-sdk video");
      await expect(videosAfter).toHaveCount(0, { timeout: 5_000 });
    });
  });
});
