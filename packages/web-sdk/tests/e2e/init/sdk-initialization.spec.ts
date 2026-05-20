/**
 * @fileoverview
 * Feature: SDK initialization and rendering
 *
 * Objective:
 * Validate that the SDK can be initialized using different authentication methods
 * (direct credentials via data attributes, token-based auth) and correctly renders
 * video content in the browser.
 *
 */

import type { Page } from "@playwright/test";
import { test } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA } from "../../data/init";
import { cleanupSDKState } from "../../helpers/cleanup.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { initWithDataAttributes, initWithToken } from "../../helpers/sdk-init.helper";
import { waitForSDKRender } from "../../helpers/sdk-wait.helper";

test.describe("Feature: SDK Initialization — Credentials vs Token", () => {
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

    await test.step("Setup: Create SDK container element with embed-id and api-key data attributes", async () => {
      await createSDKContainer(sharedPage, containerDetails);
    });
  });

  test.afterEach(async () => {
    await cleanupSDKState(sharedPage, containerDetails);
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  test("Scenario: Initialize SDK with direct credentials (embed-id + api-key)", async () => {
    await test.step("Action: Call genuin.init({ embed_id, api_key }) with direct credentials", async () => {
      await initWithDataAttributes(sharedPage, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Result: SDK renders video content inside the container", async () => {
      await waitForSDKRender(sharedPage);
    });
  });

  test("Scenario: Initialize SDK with authentication token", async () => {
    await test.step("Action: Call genuin.init({ token }) to authenticate via token", async () => {
      await initWithToken(sharedPage, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Result: SDK renders video content inside the container", async () => {
      await waitForSDKRender(sharedPage);
    });
  });
});
