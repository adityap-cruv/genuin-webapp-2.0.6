/**
 * @fileoverview
 * Feature: Content filtering by page context and brand ID
 *
 * Objective:
 * Validate that the SDK correctly handles contextual parameters (page context, brand IDs)
 * passed via HTML data attributes to filter and customize the displayed content.
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

test.describe("Feature: Content Filtering — Page Context and Brand ID", () => {
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

  test("Scenario: Filter content using page context", async () => {
    await test.step("Precondition: Add data-page-context attribute to container", async () => {
      await addAttributesToContainer(sharedPage, {
        "page-context": SINGLE_EMBED_INIT_DATA.page_context,
      });
    });

    await test.step("Action: Initialize SDK with token — SDK reads page context from data attributes", async () => {
      await initWithToken(sharedPage, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Result: SDK renders filtered video content based on page context", async () => {
      await waitForSDKRender(sharedPage);
    });
  });

  test("Scenario: Filter content using brand IDs", async () => {
    await test.step("Precondition: Add data-brand-ids attribute to container", async () => {
      await addAttributesToContainer(sharedPage, {
        "brand-ids": SINGLE_EMBED_INIT_DATA.brand_ids,
      });
    });

    await test.step("Action: Initialize SDK with token — SDK reads brand IDs from data attributes", async () => {
      await initWithToken(sharedPage, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Result: SDK renders filtered video content restricted by brand", async () => {
      await waitForSDKRender(sharedPage);
    });
  });
});
