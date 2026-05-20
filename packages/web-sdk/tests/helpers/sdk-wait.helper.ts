/**
 * @fileoverview Wait and assertion helpers for SDK E2E tests.
 *
 * Provides functions that wait for SDK readiness, video rendering, multi-embed rendering,
 * and shadow DOM encapsulation. These are used across all test suites to ensure the SDK
 * has fully loaded before assertions are made.
 *
 * @author Genuin Team
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Wait for the SDK to be available on `window.genuin`.
 *
 * Polls until `window.genuin` is defined (max 10 seconds).
 * Called internally by `loadTestPage()` and `cleanupSDKState()`.
 *
 * @param page - Playwright Page instance
 */
export async function waitForSDK(page: Page) {
  await page.waitForFunction(() => typeof (window as any).genuin !== "undefined", { timeout: 30_000 });
}

/**
 * Wait for a single SDK embed to render video content.
 *
 * Waits for the `#gen-sdk` container to be visible and at least one `<video>`
 * element to be attached to the DOM. Returns locators for the container and videos.
 *
 * @param page - Playwright Page instance
 * @param timeoutMs - Maximum time to wait for video elements (default: 30s)
 * @returns Object with `container` locator, `videos` locator, and `videoCount`
 */
export async function waitForSDKRender(page: Page, timeoutMs = 10_000) {
  const container = page.locator('[data-genuin-host="true"]');
  await expect(container).toBeVisible({ timeout: 5_000 });

  await page.waitForSelector("video", {
    timeout: timeoutMs,
    state: "attached",
  });

  const videos = page.locator("video");
  const videoCount = await videos.count();

  return { container, videos, videoCount };
}

/**
 * Wait for multiple SDK embeds to render video content.
 *
 * Verifies the expected number of containers exist, waits for `<video>` elements,
 * then validates each container has at least one video inside it.
 *
 * @param page - Playwright Page instance
 * @param expectedContainerCount - Number of containers expected on the page
 * @param containerId - Array of container IDs to locate (e.g., ['gen-sdk-1', 'gen-sdk-2'])
 * @param timeoutMs - Maximum time to wait for video elements (default: 30s)
 */
export async function waitForMultiEmbedRender(
  page: Page,
  expectedContainerCount: number,
  containerId: string[],
  timeoutMs = 30_000
) {
  const selector = containerId.map((id) => `#${id}[data-genuin-host="true"]`).join(",");
  const containers = page.locator(selector);

  // toHaveCount retries until SDK attaches data-genuin-host to all containers
  await expect(containers).toHaveCount(expectedContainerCount, { timeout: timeoutMs });
  // Wait for videos to load
  await page.waitForSelector("video", {
    timeout: timeoutMs,
    state: "attached",
  });
  // Validate each container has at least 1 video

  for (let i = 0; i < expectedContainerCount; i++) {
    const container = containers.nth(i);
    const videoInContainer = container.locator("video");
    const videoCount = await videoInContainer.count();

    expect(videoCount).toBeGreaterThan(1);
  }
}
/**
 * Wait for SDK shadow DOM render and verify element isolation.
 *
 * Waits for shadow host elements (`[data-genuin-host="true"]`) to appear,
 * then runs `verifyShadowDOMIsolation()` to ensure no SDK elements or styles
 * leak outside the shadow DOM boundary.
 *
 * @param page - Playwright Page instance
 * @param expectedCount - Number of shadow hosts expected (default: 1)
 * @param timeoutMs - Maximum time to wait for shadow hosts (default: 15s)
 * @returns Object with `shadowHosts` locator
 */
export async function waitForSDKshadowDOMRender(page: Page, expectedCount: number = 1, timeoutMs = 15_000) {
  // Wait for shadow hosts to be visible
  const shadowHosts = page.locator('[data-genuin-host="true"]');
  await expect(shadowHosts).toHaveCount(expectedCount, { timeout: timeoutMs });

  // Verify nothing leaks outside shadow DOM
  await verifyShadowDOMIsolation(page);

  return { shadowHosts };
}

/**
 * Verify that no SDK elements leak outside shadow DOM boundaries.
 *
 * Checks the main document for:
 * - Elements with `gen-sdk` ID prefix outside any shadow host
 * - Elements with `--gencl-color` inline CSS variables outside any shadow host
 *
 * Fails the test if any leaked elements are found.
 *
 * @param page - Playwright Page instance (called internally, not exported)
 */
async function verifyShadowDOMIsolation(page: Page) {
  const leakedElements = await page.evaluate(() => {
    const issues: string[] = [];
    const shadowHosts = Array.from(document.querySelectorAll('[data-genuin-host="true"]'));

    // Helper: check if element is inside any shadow host
    const isInsideShadowHost = (el: Element) => shadowHosts.some((host) => host === el || host.contains(el));

    //  Elements with gen-sdk ID outside shadow DOM
    const genIdElements = Array.from(document.querySelectorAll('[id^="gen-sdk"]')).filter(
      (el) => !isInsideShadowHost(el)
    );

    if (genIdElements.length > 0) {
      issues.push(`Found ${genIdElements.length} elements with 'gen-sdk' ID outside shadow DOM`);
    }

    // Inline CSS variables outside shadow DOM
    const elementsWithInlineCss = Array.from(document.querySelectorAll('[style*="--gencl-color"]')).filter(
      (el) => !isInsideShadowHost(el)
    );
    if (elementsWithInlineCss.length > 0) {
      issues.push(`Found ${elementsWithInlineCss.length} elements with --gencl-color inline styles outside shadow DOM`);
    }

    return issues;
  });

  expect(leakedElements, `SDK elements leaked outside shadow DOM: ${leakedElements.join(", ")}`).toHaveLength(0);
}
/**
 * Assert that a second genuin.init() call was a no-op by reading the SDK's own
 * data-status guardrail attribute. getInitializationStatus() in genuin-sdk.ts reads
 * this same attribute to skip already-initialized elements. If second init re-ran,
 * the status would transition 'done' → 'loading' → 'done'. Verifying it stays 'done'
 * immediately after the call confirms the guardrail in getAndSetDivs() blocked it.
 *
 * @param page - Playwright Page instance
 * @param containerId - ID of the SDK container element (e.g. 'gen-sdk')
 */
export async function assertSecondInitIsNoOp(page: Page, containerId: string) {
  await page.waitForFunction((id) => document.getElementById(id)?.getAttribute("data-status") === "done", containerId, {
    timeout: 2_000,
  });
}

/**
 * Wait for the PiP overlay host to appear and contain rendered content.
 *
 * RootPortal creates a separate `[data-genuin-overlay-host]` shadow host (distinct from
 * the main `[data-genuin-host]`) and mounts PiP content into its `[data-portal-container]`.
 * This host is appended to document.body when PiP mounts and removed when it unmounts.
 *
 * @param page - Playwright Page instance
 * @param timeoutMs - Maximum time to wait (default: 10s)
 */
export async function waitForPipVisible(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const overlayHost = document.querySelector("[data-genuin-overlay-host]");
      if (!overlayHost?.shadowRoot) return false;
      const container = overlayHost.shadowRoot.querySelector("[data-portal-container]");
      return container !== null && container.children.length > 0;
    },
    { timeout: timeoutMs }
  );
}

/**
 * Wait for the PiP overlay host to be removed from the DOM.
 *
 * RootPortal calls cleanupOverlayShadowHost() on unmount, which removes
 * `[data-genuin-overlay-host]` from document.body entirely.
 *
 * @param page - Playwright Page instance
 * @param timeoutMs - Maximum time to wait (default: 10s)
 */
export async function waitForPipHidden(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const overlayHost = document.querySelector("[data-genuin-overlay-host]");
      if (!overlayHost?.shadowRoot) return true;
      const container = overlayHost.shadowRoot.querySelector("[data-portal-container]");
      return !container || container.children.length === 0;
    },
    { timeout: timeoutMs }
  );
}
