/**
 * @fileoverview Test data constants for SDK E2E tests.
 *
 * Contains credential sets and configuration objects used across all test suites.
 * - SINGLE_EMBED_INIT_DATA: Used for single-container tests (render, actions, context, expand, destroy, etc.)
 * - MULTI_EMBED_INIT_DATA: Used for multi-container tests (multi-embed, shadow DOM with multiple embeds)
 *
 * @author Genuin Team
 */

/**
 * Default container IDs used across test suites.
 */
export const CONTAINER_IDS = {
  single: "gen-sdk",
  multi: ["gen-sdk-1", "gen-sdk-2"],
};

/**
 * Layout-specific credentials for embed and visual regression tests.
 * carousel is the canonical source of credentials shared with single/multi embed tests.
 */
export const EMBED_LAYOUT_DATA = {
  ted: {
    embed_id: "68764eb43d0440d31e645f2a",
    api_key: "6e408e7a5ca516d4b612a268ce5626e057542fb4b131522b",
    style: "width: 100%; height: 600px;",
  },
  carousel: {
    embed_id: "69e7452db7908587274a305d",
    api_key: "3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4",
    style: "width: 100%; height: 600px;",
  },
  embed_floating: {
    embed_id: "69f44cffe964b815fc223d4b",
    api_key: "3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4",
    style: "width: 100%; height: 600px;",
  },
};

/**
 * Height (px) of the spacer injected above the SDK container to enable scroll-based PiP testing.
 */
export const FLOATING_EMBED_SPACER_HEIGHT_PX = 2000;

export const VISUAL_LAYOUT_DATA = {
  feed: {
    placement_id: "69e74417c389e59d070a4521",
    style_id: "69e74417c389e59d070a4522",
    api_key: "3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4",
    style: "width: 300px; height: 600px;",
  },
  grid: {
    placement_id: "69e74498c389e59d070a4556",
    style_id: "69e74498c389e59d070a4557",
    api_key: "3d9fbaa9ee0777b4c9bbf15303f7ce8108394b5dd9759af4",
    style: "width: 300px; height: 600px;",
  },
  iheart: {
    placement_id: "6901f4c0bc8cdde8e253d1e5",
    style_id: "6901f4c0bc8cdde8e253d1e6",
    api_key: "188e43c588c69904abefc500378b803e31d90f40495e53dd",
    style: "width: 300px; height: 600px;",
  },
  iheartPlacement: {
    placement_id: "69c2812fd98484cf6b83a5ba",
    style_id: "69c2812fd98484cf6b83a5bb",
    api_key: "188e43c588c69904abefc500378b803e31d90f40495e53dd",
    style: "width: 375px; height: 500px; aspect-ratio: 9/16;",
  },
};

/**
 * Default credentials for single embed testing.
 * Reuses carousel embed_id and api_key as the canonical credentials.
 */
export const SINGLE_EMBED_INIT_DATA = {
  embed_id: EMBED_LAYOUT_DATA.carousel.embed_id,
  api_key: EMBED_LAYOUT_DATA.carousel.api_key,
  brand_ids: "123,456,789",
  page_context: "BMW,AUDI,JAGUAR",
  token: "dharmil@gmail.com",
  video_slug: "1db93b8c0a00140a",
};

/**
 * Default configuration for multi-embed testing.
 * Used by test suites that create multiple SDK containers on the same page.
 */
export const MULTI_EMBED_INIT_DATA = {
  embed_id: EMBED_LAYOUT_DATA.carousel.embed_id,
  api_key: EMBED_LAYOUT_DATA.carousel.api_key,
  token: "dharmil@gmail.com",
  page_context: "page_context",
  geo: {
    lat: 37.7749,
    long: -122.4194,
  },
  url: "https://example.com",
};
