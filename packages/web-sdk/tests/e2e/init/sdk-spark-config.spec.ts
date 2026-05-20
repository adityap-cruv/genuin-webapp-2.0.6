/**
 * @fileoverview
 * Feature: Spark action configuration via init() and data attributes
 *
 * Objective:
 * Verify that the SDK correctly resolves action-related configuration (spark action,
 * start_video_slug) when provided through JavaScript init() config or HTML data attributes.
 *
 */

import type { Page } from "@playwright/test";
import { test } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA } from "../../data/init";
import { cleanupSDKState } from "../../helpers/cleanup.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { addAttributesToContainer, createSDKContainer } from "../../helpers/sdk-container.helper";
import { initWithToken } from "../../helpers/sdk-init.helper";
import { waitForSDKRender } from "../../helpers/sdk-wait.helper";

test.describe("Feature: Spark Action Configuration — init() vs Data Attribute", () => {
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

  test("Scenario: Spark action and video slug passed via init() config object", async () => {
    await test.step('Action: Call genuin.init() with token, action: "spark", and start_video_slug', async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          token: cfg.token,
          action: "spark",
          start_video_slug: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Result: SDK renders video content successfully", async () => {
      await waitForSDKRender(sharedPage);
    });
  });

  test("Scenario: Spark action and video slug passed via HTML data attributes", async () => {
    await test.step("Precondition: Add data-action and data-start-video-slug attributes to container", async () => {
      await addAttributesToContainer(sharedPage, {
        action: "spark",
        "start-video-slug": SINGLE_EMBED_INIT_DATA.video_slug,
      });
    });

    await test.step("Action: Call genuin.init() with token — SDK reads action config from data attributes", async () => {
      await initWithToken(sharedPage, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Result: SDK renders video content successfully", async () => {
      await waitForSDKRender(sharedPage);
    });
  });
});
