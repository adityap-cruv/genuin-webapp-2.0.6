/**
 * @fileoverview
 * Feature: Multiple independent embeds on the same page
 *
 * Objective:
 * Validate that the SDK supports multiple independent embed instances on a single page
 * with separate initialization, rendering, dynamic updates, and shadow DOM isolation.
 *
 */

import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

import { MULTI_EMBED_INIT_DATA, CONTAINER_IDS } from "../../data/init";
import { cleanupMultiEmbedState } from "../../helpers/cleanup.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { createMultipleSDKContainers } from "../../helpers/sdk-container.helper";
import { updateSDK, initWithContextualParams } from "../../helpers/sdk-init.helper";
import { waitForMultiEmbedRender } from "../../helpers/sdk-wait.helper";
import { waitForSDKshadowDOMRender } from "../../helpers/sdk-wait.helper";

test.describe("Feature: Multi-Embed — Independent Embeds on Same Page", () => {
  let containerCount: number;
  let containerId: string[];
  let sharedPage: Page;
  const containerDetails = [
    {
      id: CONTAINER_IDS.multi[0],
      dataAttributes: { "embed-id": MULTI_EMBED_INIT_DATA.embed_id, "api-key": MULTI_EMBED_INIT_DATA.api_key },
    },
    {
      id: CONTAINER_IDS.multi[1],
      dataAttributes: { "embed-id": MULTI_EMBED_INIT_DATA.embed_id, "api-key": MULTI_EMBED_INIT_DATA.api_key },
    },
  ];

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();

    await test.step("Setup: Load base test environment with SDK script available", async () => {
      await loadTestPage(sharedPage);
    });

    await test.step("Setup: Create two independent SDK container elements on the same page", async () => {
      const result = await createMultipleSDKContainers(sharedPage, containerDetails);
      containerCount = result.containerLength;
      containerId = result.containerId;
    });
  });

  test.afterEach(async () => {
    await cleanupMultiEmbedState(sharedPage, containerDetails);
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  test("Scenario: Render multiple embeds independently on the same page", async () => {
    await test.step("Action: Initialize SDK with contextual params — both containers should render", async () => {
      await initWithContextualParams(sharedPage, MULTI_EMBED_INIT_DATA);
    });

    await test.step("Result: Both embed containers render video content independently", async () => {
      await waitForMultiEmbedRender(sharedPage, containerCount, containerId);
    });
  });

  test("Scenario: Update token propagates to all embeds on the page", async () => {
    await test.step("Precondition: Initialize SDK with contextual params for both containers", async () => {
      await initWithContextualParams(sharedPage, MULTI_EMBED_INIT_DATA);
    });

    await test.step("Action: Call genuin.update({ token }) with a new authentication token", async () => {
      await updateSDK(sharedPage, { token: MULTI_EMBED_INIT_DATA.token, container_id: CONTAINER_IDS.multi[0] });
    });

    await test.step("Result: Both embed containers re-render with video content after token update", async () => {
      await waitForMultiEmbedRender(sharedPage, containerCount, containerId);
    });
  });

  test("Scenario: Update contextual params propagates to all embeds on the page", async () => {
    await test.step("Precondition: Initialize SDK with contextual params for both containers", async () => {
      await initWithContextualParams(sharedPage, MULTI_EMBED_INIT_DATA);
    });

    await test.step("Precondition: Wait until both embed containers finish rendering", async () => {
      await waitForMultiEmbedRender(sharedPage, containerCount, containerId);
    });

    await test.step("Action: Call genuin.update({ contextual_params }) with new page context", async () => {
      await updateSDK(sharedPage, {
        contextual_params: {
          page_context: MULTI_EMBED_INIT_DATA.page_context,
        },
        container_id: CONTAINER_IDS.multi[0],
      });
    });

    await test.step("Result: Both embed containers continue to render video content after contextual params update", async () => {
      await waitForMultiEmbedRender(sharedPage, containerCount, containerId);
    });
  });

  test("Scenario: Multiple embeds with shadow DOM do not leak elements outside shadow hosts", async () => {
    await test.step("Action: Initialize SDK with useShadowDOM: true for all containers", async () => {
      await sharedPage.evaluate(() => {
        (window as any).genuin.init({ useShadowDOM: true });
      });
    });

    await test.step("Result: Shadow host count matches container count — no DOM leakage", async () => {
      const { shadowHosts } = await waitForSDKshadowDOMRender(sharedPage, containerCount);
      await expect(shadowHosts).toHaveCount(containerCount);
    });
  });
});
