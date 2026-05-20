/**
 * @fileoverview SDK initialization and update helpers for E2E tests.
 *
 * Provides functions that call `window.genuin.init()` and `window.genuin.update()`
 * inside the browser via `page.evaluate()`. Each function passes a different config
 * shape to test different initialization and update paths.
 *
 * @author Genuin Team
 */

import type { Page } from "@playwright/test";

/**
 * Initialize the SDK by passing embed_id and api_key directly to init().
 *
 * Calls `genuin.init({ embed_id, api_key })` with explicit credentials
 * so the test is self-documenting about which embed is being loaded.
 *
 * @param page - Playwright Page instance
 * @param config - Object containing `embed_id` and `api_key`
 */
export async function initWithDataAttributes(page: Page, config: { embed_id: string; api_key: string }) {
  await page.evaluate((cfg) => {
    (window as any).genuin.init({
      embed_id: cfg.embed_id,
      api_key: cfg.api_key,
    });
  }, config);
}

/**
 * Initialize the SDK using a token for authentication.
 *
 * Calls `genuin.init({ token })` to authenticate via email/token.
 * The embed-id and api-key are still read from container data attributes.
 *
 * @param page - Playwright Page instance
 * @param config - Config object containing `token` property
 */
export async function initWithToken(page: Page, config: any) {
  await page.evaluate((cfg) => {
    (window as any).genuin.init({
      token: cfg.token,
    });
  }, config);
}

/**
 * Initialize the SDK with contextual parameters for content filtering.
 *
 * Calls `genuin.init()` with `api_key` and a `contextualParams` object containing
 * `embed_id`, `page_context`, `geo`, and `url`. Used for multi-embed and filtering tests.
 *
 * @param page - Playwright Page instance
 * @param config - Config object with api_key, embed_id, page_context, geo, and url
 */
export async function initWithContextualParams(page: Page, config: any) {
  await page.evaluate((cfg) => {
    (window as any).genuin.init({
      api_key: cfg.api_key,
      contextualParams: {
        embed_id: cfg.embed_id,
        page_context: cfg.page_context,
        geo: cfg.geo,
        url: cfg.url,
      },
    });
  }, config);
}

/**
 * Initialize the SDK with no JS config relies purely on container data attributes.
 *
 * Calls `genuin.init({})` so SDK reads embed_id and api_key from `data-embed-id`
 * and `data-api-key` attributes already set on the container element.
 *
 * @param page - Playwright Page instance
 */
export async function initEmpty(page: Page) {
  await page.evaluate(() => {
    (window as any).genuin.init({});
  });
}

/**
 * Initialize the SDK with placement_id, style_id, and api_key.
 * Used for layout-based embeds (feed, grid, iheart, carousel, placement).
 *
 * @param page - Playwright Page instance
 * @param config - Object containing `placement_id`, `style_id`, and `api_key`
 */
export async function initWithPlacementStyle(
  page: Page,
  config: { placement_id: string; style_id: string; api_key: string }
) {
  await page.evaluate((cfg) => {
    (window as any).genuin.init({
      placement_id: cfg.placement_id,
      style_id: cfg.style_id,
      api_key: cfg.api_key,
    });
  }, config);
}

/**
 * Update the SDK configuration at runtime without re-initialization.
 *
 * Calls `genuin.update()` with the given payload (e.g., new token, contextual_params).
 * The SDK applies changes to all existing embeds without a page reload.
 *
 * @param page - Playwright Page instance
 * @param payload - Update payload (e.g., `{ token: '...' }` or `{ contextual_params: { ... } }`)
 */
export async function updateSDK(page: Page, payload: any) {
  await page.evaluate((data) => {
    if ((window as any).genuin?.update) {
      (window as any).genuin.update(data);
    }
  }, payload);
}
