/**
 * @fileoverview
 * Feature: Multiple sequential init() calls with different configurations
 *
 * Objective:
 * Validate that calling genuin.init() a second time (without destroy()) is a no-op —
 * the SDK guardrail in getAndSetDivs() skips elements already in 'done' status.
 * No re-render is triggered regardless of the config passed (start_video_slug,
 * initial_video_ids, etc.).
 *
 */

import type { Page } from "@playwright/test";
import { test } from "@playwright/test";

import { SINGLE_EMBED_INIT_DATA, CONTAINER_IDS } from "../../data/init";
import { cleanupSDKState } from "../../helpers/cleanup.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { waitForSDKRender, assertSecondInitIsNoOp } from "../../helpers/sdk-wait.helper";

test.describe("Feature: Multiple Sequential init() Calls with Different Configurations", () => {
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

  test("Scenario: Second init() with start_video_slug should not re-initialize the already loaded embed", async () => {
    await test.step("Precondition: Call genuin.init() with embed_id and api_key —no video slug", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Precondition: Wait for SDK to render after first init()", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.init() again with start_video_slug", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          start_video_slug: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step('Result: data-status stays "done" SDK guardrail blocked second init()', async () => {
      await assertSecondInitIsNoOp(sharedPage, CONTAINER_IDS.single);
    });
  });

  test("Scenario: Second init() with initial_video_ids should not re-initialize the already loaded embed", async () => {
    await test.step("Precondition: Call genuin.init() with embed_id and api_key —no initial video IDs", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Precondition: Wait for SDK to render after first init()", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.init() again with initial_video_ids", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          initial_video_ids: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step('Result: data-status stays "done" SDK guardrail blocked second init()', async () => {
      await assertSecondInitIsNoOp(sharedPage, CONTAINER_IDS.single);
    });
  });

  test("Scenario: Second init() with initial_video_ids after first init() with start_video_slug is a no-op", async () => {
    await test.step("Precondition: Call genuin.init() with start_video_slug", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          start_video_slug: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Precondition: Wait for SDK to render after first init() with start_video_slug", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.init() again with initial_video_ids", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          initial_video_ids: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step('Result: data-status stays "done" SDK guardrail blocked second init()', async () => {
      await assertSecondInitIsNoOp(sharedPage, CONTAINER_IDS.single);
    });
  });

  test("Scenario: Second init() with start_video_slug after first init() with initial_video_ids is a no-op", async () => {
    await test.step("Precondition: Call genuin.init() with initial_video_ids", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          initial_video_ids: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Precondition: Wait for SDK to render after first init() with initial_video_ids", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Call genuin.init() again with start_video_slug", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          start_video_slug: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step('Result: data-status stays "done" SDK guardrail blocked second init()', async () => {
      await assertSecondInitIsNoOp(sharedPage, CONTAINER_IDS.single);
    });
  });

  test("Scenario: Three consecutive init() calls -only first one initializes, rest are no-ops", async () => {
    await test.step("Action: First init() plain credentials", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Precondition: Wait for SDK to render after first init()", async () => {
      await waitForSDKRender(sharedPage);
    });

    await test.step("Action: Second init() with start_video_slug", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          start_video_slug: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step("Action: Third init() with initial_video_ids", async () => {
      await sharedPage.evaluate((cfg) => {
        (window as any).genuin.init({
          embed_id: cfg.embed_id,
          api_key: cfg.api_key,
          initial_video_ids: cfg.video_slug,
        });
      }, SINGLE_EMBED_INIT_DATA);
    });

    await test.step('Result: data-status stays "done" second and third init() calls were blocked', async () => {
      await assertSecondInitIsNoOp(sharedPage, CONTAINER_IDS.single);
    });
  });
});
