/**
 * @fileoverview
 * Feature: SDK Floating (PiP) Embed
 *
 * Objective:
 * Validate the Picture-in-Picture floating embed behaviour:
 * - PiP widget appears when the embed container scrolls out of view
 * - PiP widget disappears when the embed container returns to view
 * - PiP widget can be dismissed via the close (X) button
 *
 * How it works:
 * The floating mode is enabled by `is_floating_view: true` on the embed record (backend).
 * An IntersectionObserver in EmbedProvider watches the embed container. When it leaves
 * the viewport it fires `changeActivePlayerType('pip')`, mounting the PiP widget.
 * The PiP renders inside the overlay shadow host via RootPortal as a `position: fixed`
 * overlay at the bottom-right of the viewport.
 *
 * Test setup:
 * A tall spacer div is injected above the SDK container so scrolling to the top of the
 * page pushes the embed off-screen, triggering PiP mode.
 */

import type { Page } from "@playwright/test";
import { test } from "@playwright/test";

import { closePipWidget, setupFloatingEmbed } from "../../helpers/floating-embed.helper";
import { loadTestPage } from "../../helpers/page.helper";
import { waitForPipHidden, waitForPipVisible, waitForSDK } from "../../helpers/sdk-wait.helper";

test.describe("Feature: SDK Floating (PiP) Embed", () => {
  let sharedPage: Page;

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
    await test.step("Setup: Load base test environment with SDK script available", async () => {
      await loadTestPage(sharedPage);
    });
  });

  test.afterEach(async () => {
    await sharedPage.reload({ waitUntil: "domcontentloaded" });
    await waitForSDK(sharedPage);
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  test("Scenario: PiP widget appears when embed scrolls out of viewport", async () => {
    await setupFloatingEmbed(sharedPage);

    await test.step("Action: Scroll embed out of viewport (back to page top)", async () => {
      await sharedPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    });

    await test.step("Result: PiP fixed widget is visible in the bottom-right corner", async () => {
      await waitForPipVisible(sharedPage);
    });
  });

  test("Scenario: PiP widget disappears when embed scrolls back into viewport", async () => {
    await setupFloatingEmbed(sharedPage);

    await test.step("Action: Scroll embed out of viewport", async () => {
      await sharedPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await waitForPipVisible(sharedPage);
    });

    await test.step("Action: Scroll embed back into viewport", async () => {
      // After SDK init, shadow DOM creates a second #gen-sdk inside the shadow root.
      // Use data-genuin-host which only exists on the outer host element.
      await sharedPage.locator('[data-genuin-host="true"]').scrollIntoViewIfNeeded();
    });

    await test.step("Result: PiP widget is no longer visible", async () => {
      await waitForPipHidden(sharedPage);
    });
  });

  test("Scenario: PiP widget can be dismissed via the close button", async () => {
    await setupFloatingEmbed(sharedPage);

    await test.step("Action: Scroll embed out of viewport", async () => {
      await sharedPage.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await waitForPipVisible(sharedPage);
    });

    await test.step("Action: Click the close (X) button on the PiP widget", async () => {
      await closePipWidget(sharedPage);
    });

    await test.step("Result: PiP widget is dismissed and no longer visible", async () => {
      await waitForPipHidden(sharedPage);
    });
  });
});
