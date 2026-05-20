/**
 * @fileoverview
 * Feature: SDK visual regression — layout rendering
 *
 * Objective:
 * Capture baseline screenshots of each SDK layout after initialization.
 * Video elements are masked to avoid failures from dynamic content.
 * On first run, baselines are generated. Subsequent runs diff against them.
 *
 */

import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

import { VISUAL_LAYOUT_DATA, EMBED_LAYOUT_DATA } from "../../data/init";
import { setupFloatingEmbed } from "../../helpers/floating-embed.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { createSDKContainer } from "../../helpers/sdk-container.helper";
import { initWithDataAttributes, initWithPlacementStyle } from "../../helpers/sdk-init.helper";
import { waitForPipVisible, waitForSDKRender } from "../../helpers/sdk-wait.helper";
import { stubVideoSources, freezeVideosInShadowDom } from "../../helpers/video-intercept.helper";

const LAYOUTS = ["feed", "grid"] as const;
type Layout = (typeof LAYOUTS)[number];

const EMBED_LAYOUTS = ["ted", "carousel"] as const;
type EmbedLayout = (typeof EMBED_LAYOUTS)[number];

test.describe("Feature: SDK Visual Regression — Layout Rendering", () => {
  let sharedPage: Page;

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
    await test.step("Setup: Stub video sources and inject black background", async () => {
      await stubVideoSources(sharedPage);
    });
    await test.step("Setup: Load base test environment with SDK script available", async () => {
      await loadTestPage(sharedPage);
    });
  });

  test.afterEach(async () => {
    await sharedPage.reload({ waitUntil: "domcontentloaded" });
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  for (const layout of EMBED_LAYOUTS) {
    test(`Scenario: SDK renders correctly for ${layout} layout`, async () => {
      const layoutData = EMBED_LAYOUT_DATA[layout as EmbedLayout];

      await test.step(`Setup: Create SDK container with dimensions for ${layout}`, async () => {
        await createSDKContainer(sharedPage, {
          id: "gen-sdk",
          className: "gen-sdk-class",
          style: layoutData.style,
        });
      });

      await test.step(`Action: Initialize SDK with ${layout} embed_id and api_key`, async () => {
        await initWithDataAttributes(sharedPage, layoutData);
      });

      await test.step("Result: SDK renders video content inside the container", async () => {
        await waitForSDKRender(sharedPage);
      });

      await test.step("Setup: Black out video frames inside shadow DOM", async () => {
        await freezeVideosInShadowDom(sharedPage);
      });

      await test.step("Result: Visual snapshot matches baseline", async () => {
        const container = sharedPage.locator('[data-genuin-host="true"]');
        await expect(container).toHaveScreenshot(`sdk-${layout}.png`, {
          animations: "disabled",
        });
      });
    });
  }

  test("Scenario: SDK renders PiP widget correctly for embed_floating layout", async () => {
    await setupFloatingEmbed(sharedPage);

    await test.step("Setup: Black out video frames inside shadow DOM", async () => {
      await freezeVideosInShadowDom(sharedPage);
    });

    await test.step("Action: Scroll embed out of viewport to trigger PiP", async () => {
      await sharedPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await waitForPipVisible(sharedPage);
    });

    await test.step("Result: Visual snapshot of PiP widget matches baseline", async () => {
      // Viewport screenshot (no fullPage) captures the fixed-position PiP at bottom-right.
      await expect(sharedPage).toHaveScreenshot("sdk-embed_floating-pip.png", {
        animations: "disabled",
      });
    });
  });

  for (const layout of LAYOUTS) {
    test(`Scenario: SDK renders correctly for ${layout} layout`, async () => {
      const layoutData = VISUAL_LAYOUT_DATA[layout as Layout];

      await test.step(`Setup: Create SDK container with dimensions for ${layout}`, async () => {
        await createSDKContainer(sharedPage, {
          id: "gen-sdk",
          className: "gen-sdk-class",
          style: layoutData.style,
        });
      });

      await test.step(`Action: Initialize SDK with ${layout} placement and style`, async () => {
        await initWithPlacementStyle(sharedPage, layoutData);
      });

      await test.step("Result: SDK renders video content inside the container", async () => {
        await waitForSDKRender(sharedPage);
      });

      await test.step("Setup: Black out video frames inside shadow DOM", async () => {
        await freezeVideosInShadowDom(sharedPage);
      });

      await test.step("Result: Visual snapshot matches baseline", async () => {
        const container = sharedPage.locator('[data-genuin-host="true"]');
        await expect(container).toHaveScreenshot(`sdk-${layout}.png`, {
          animations: "disabled",
        });
      });
    });
  }
});
