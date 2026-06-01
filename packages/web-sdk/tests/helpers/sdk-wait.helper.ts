/**
 * Wait helpers for SDK E2E tests.
 * Each function waits for a specific SDK state before tests make assertions.
 */
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import {
  copyThumbnailsAndFixProfileImages,
  waitForThumbnailImgsAttached,
} from './snapshot-prep.helper';

/** Polls until the MSW service worker signals it is intercepting requests. */
export async function waitForMSWReady(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForFunction(
    () => (window as unknown as { __MSW_READY__?: boolean }).__MSW_READY__ === true,
    undefined,
    { timeout: timeoutMs },
  );
}

/** Polls until `window.genuin` is defined (max 30s). */
export async function waitForSDK(page: Page) {
  await page.waitForFunction(
    () => typeof (window as unknown as { genuin?: unknown }).genuin !== 'undefined',
    { timeout: 30_000 },
  );
}

/**
 * Waits for the SDK container to be visible and at least one `<video>` to appear.
 * Returns locators for the container and videos.
 */
export async function waitForSDKRender(page: Page, timeoutMs = 30_000) {
  const container = page.locator('[data-genuin-host="true"]');
  await expect(container).toBeVisible({ timeout: 5_000 });

  await page.waitForSelector('video', { timeout: timeoutMs, state: 'attached' });

  const videos = page.locator('video');
  const videoCount = await videos.count();

  return { container, videos, videoCount };
}

/**
 * Prepares the page for a deterministic snapshot. Call immediately before `toHaveScreenshot()`.
 * Waits for thumbnails to decode, pins them onto video posters, and fixes broken profile image MIME types.
 */
export async function pinThumbnailPosters(page: Page) {
  await waitForThumbnailImgsAttached(page);
  await copyThumbnailsAndFixProfileImages(page);
}

/**
 * Waits for all N embed containers to appear and validates each has at least one video.
 *
 * @param expectedContainerCount - Number of SDK containers expected on the page
 * @param containerId - Array of container element IDs
 */
export async function waitForMultiEmbedRender(
  page: Page,
  expectedContainerCount: number,
  containerId: string[],
  timeoutMs = 30_000,
) {
  const selector = containerId.map((id) => `#${id}[data-genuin-host="true"]`).join(',');
  const containers = page.locator(selector);

  await expect(containers).toHaveCount(expectedContainerCount, { timeout: timeoutMs });
  await page.waitForSelector('video', { timeout: timeoutMs, state: 'attached' });

  for (let i = 0; i < expectedContainerCount; i++) {
    const videoCount = await containers.nth(i).locator('video').count();
    expect(videoCount).toBeGreaterThan(1);
  }
}

/**
 * Waits for N shadow host elements to appear, then verifies no SDK elements or styles
 * leak outside the shadow DOM boundary.
 */
export async function waitForSDKshadowDOMRender(
  page: Page,
  expectedCount = 1,
  timeoutMs = 15_000,
) {
  const shadowHosts = page.locator('[data-genuin-host="true"]');
  await expect(shadowHosts).toHaveCount(expectedCount, { timeout: timeoutMs });
  await verifyShadowDOMIsolation(page);
  return { shadowHosts };
}

/**
 * Checks that no SDK elements (`id^=gen-sdk`) or CSS variables (`--gencl-color`)
 * exist outside shadow host boundaries. Fails the test if any leaks are found.
 */
async function verifyShadowDOMIsolation(page: Page) {
  const leakedElements = await page.evaluate(() => {
    const issues: string[] = [];
    const shadowHosts = Array.from(
      document.querySelectorAll(
        '[data-genuin-host="true"], [data-genuin-overlay-host], [data-genuin-toaster-host]',
      ),
    );
    const isInsideShadowHost = (el: Element) =>
      shadowHosts.some((host) => host === el || host.contains(el));

    const genIdElements = Array.from(document.querySelectorAll('[id^="gen-sdk"]')).filter(
      (el) => !isInsideShadowHost(el),
    );
    if (genIdElements.length > 0) {
      issues.push(`Found ${genIdElements.length} elements with 'gen-sdk' ID outside shadow DOM`);
    }

    const elementsWithInlineCss = Array.from(
      document.querySelectorAll('[style*="--gencl-color"]'),
    ).filter((el) => !isInsideShadowHost(el));
    if (elementsWithInlineCss.length > 0) {
      issues.push(
        `Found ${elementsWithInlineCss.length} elements with --gencl-color inline styles outside shadow DOM`,
      );
    }

    return issues;
  });

  expect(
    leakedElements,
    `SDK elements leaked outside shadow DOM: ${leakedElements.join(', ')}`,
  ).toHaveLength(0);
}

/**
 * Verifies a second `genuin.init()` call was a no-op by checking `data-status` stays `done`.
 * If the second init re-ran, the status would briefly flip to `loading` then back to `done`.
 */
export async function assertSecondInitIsNoOp(page: Page, containerId: string) {
  await page.waitForFunction(
    (id) => document.getElementById(id)?.getAttribute('data-status') === 'done',
    containerId,
    { timeout: 2_000 },
  );
}

/** Waits until the PiP overlay shadow host exists and has rendered content inside it. */
export async function waitForPipVisible(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const overlayHost = document.querySelector('[data-genuin-overlay-host]');
      if (!overlayHost?.shadowRoot) return false;
      const container = overlayHost.shadowRoot.querySelector('[data-portal-container]');
      return container !== null && container.children.length > 0;
    },
    { timeout: timeoutMs },
  );
}

/** Waits until the PiP overlay shadow host is removed or its portal container is empty. */
export async function waitForPipHidden(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const overlayHost = document.querySelector('[data-genuin-overlay-host]');
      if (!overlayHost?.shadowRoot) return true;
      const container = overlayHost.shadowRoot.querySelector('[data-portal-container]');
      return !container || container.children.length === 0;
    },
    { timeout: timeoutMs },
  );
}
