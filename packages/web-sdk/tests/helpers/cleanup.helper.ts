/**
 * @fileoverview State cleanup helpers for SDK E2E tests.
 *
 * Provides functions to reset the SDK state between tests by reloading the page
 * and recreating containers. This ensures each test starts with a fresh SDK instance
 * and avoids state leakage between tests.
 *
 * Used in `afterEach` hooks across test suites.
 *
 * @author Genuin Team
 */

import type { Page } from "@playwright/test";

import type { CreateContainerOptions } from "../utils/type";

import { createSDKContainer } from "./sdk-container.helper";
import { waitForSDK } from "./sdk-wait.helper";

/**
 * Reset SDK state for single-embed tests.
 *
 * Reloads the page to destroy all SDK state, waits for `window.genuin` to be
 * available again, then recreates the container with the given options.
 *
 * @param page - Playwright Page instance
 * @param containerOptions - Container config to recreate after reload (default: `{ id: 'gen-sdk' }`)
 */
export async function cleanupSDKState(
  page: Page,
  containerOptions: CreateContainerOptions = {
    id: "gen-sdk",
    dataAttributes: {},
  }
) {
  await page.reload({ waitUntil: "domcontentloaded" });

  await waitForSDK(page);

  await createSDKContainer(page, containerOptions);
}

/**
 * Reset SDK state for multi-embed tests.
 *
 * Reloads the page to destroy all SDK state, waits for `window.genuin`,
 * then recreates all containers from the provided list.
 *
 * @param page - Playwright Page instance
 * @param containerOptionsList - Array of container configs to recreate after reload
 */
export async function cleanupMultiEmbedState(page: Page, containerOptionsList: CreateContainerOptions[]) {
  // Reload gives us a completely fresh SDK state
  await page.reload({ waitUntil: "domcontentloaded" });

  await waitForSDK(page);

  for (const options of containerOptionsList) {
    await createSDKContainer(page, options);
  }
}
