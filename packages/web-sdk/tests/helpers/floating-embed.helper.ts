/**
 * @fileoverview Setup helpers for floating (PiP) embed E2E tests.
 *
 * Provides functions to configure the page for floating embed testing:
 * a tall spacer is injected above the SDK container so the embed can be
 * scrolled off-screen, which triggers the IntersectionObserver in EmbedProvider
 * and activates PiP mode.
 *
 * @author Genuin Team
 */

import { type Page, test } from "@playwright/test";

import { EMBED_LAYOUT_DATA, FLOATING_EMBED_SPACER_HEIGHT_PX } from "../data/init";

import { createSDKContainer } from "./sdk-container.helper";
import { initWithDataAttributes } from "./sdk-init.helper";
import { waitForSDKRender } from "./sdk-wait.helper";

/**
 * Inject a tall spacer above the SDK container, initialise the floating embed,
 * then scroll to the embed so the IntersectionObserver fires and the SDK renders.
 *
 * After this function returns, the embed is visible and fully rendered.
 * Scroll the page back to the top to trigger PiP mode.
 *
 * @param page - Playwright Page instance
 */
export async function setupFloatingEmbed(page: Page): Promise<void> {
  await test.step("Setup: Inject tall spacer above SDK container", async () => {
    await page.evaluate((height) => {
      const spacer = document.createElement("div");
      spacer.style.cssText = `width: 100%; height: ${height}px;`;
      document.body.insertBefore(spacer, document.body.firstChild);
    }, FLOATING_EMBED_SPACER_HEIGHT_PX);
  });

  await test.step("Setup: Create SDK container for floating embed", async () => {
    await createSDKContainer(page, {
      id: "gen-sdk",
      className: "gen-sdk-class",
      style: EMBED_LAYOUT_DATA.embed_floating.style,
    });
  });

  await test.step("Action: Scroll to embed and initialise SDK", async () => {
    await page.locator("#gen-sdk").scrollIntoViewIfNeeded();
    await initWithDataAttributes(page, EMBED_LAYOUT_DATA.embed_floating);
  });

  await test.step("Result: SDK renders video content inside the container", async () => {
    await waitForSDKRender(page);
  });
}

/**
 * Click the close (X) button on the PiP widget.
 *
 * The close button is a direct child `<button>` of the fixed PiP wrapper inside
 * `[data-genuin-overlay-host]`'s shadow root. `:scope > button` is used to target
 * only the direct-child close button, skipping play/pause buttons nested inside
 * ControlLayer.
 *
 * @param page - Playwright Page instance
 */
export async function closePipWidget(page: Page): Promise<void> {
  await page.evaluate(() => {
    const overlayHost = document.querySelector("[data-genuin-overlay-host]");
    if (!overlayHost?.shadowRoot) return;
    const container = overlayHost.shadowRoot.querySelector("[data-portal-container]");
    if (!container) return;
    const fixedEl = Array.from(container.querySelectorAll<Element>("*")).find(
      (el) => window.getComputedStyle(el).position === "fixed"
    );
    const closeBtn = fixedEl?.querySelector<HTMLElement>(":scope > button");
    closeBtn?.click();
  });
}
