// Home layout data source (the "widget.json"). SERVER-ONLY — read by the /api/home/layout route and
// by the feed generator (which attaches a per-page layout so each infinite-scroll iteration can look
// different).
//
// This is the swappable SEAM for backend integration. Today it returns static dummy manifests; to use
// a real backend later, change ONLY `getHomeLayout()` / `getHomeLayoutForPage()` to fetch the real API
// and map its response to `HomeLayoutManifest` (the frontend + the API route never change). Or point
// `NEXT_PUBLIC_HOME_BFF_URL` at a real backend that serves this same contract and this file is unused.
//
// Types come from the frontend contract (`@genuin/components/.../contract`) so the dummy and the real
// backend share ONE source of truth for the shape.

import type { HomeLayoutManifest, LayoutRow, WidgetNode } from "@genuin/components/page/home-dynamic/contract";

// Placement ids MATCH the /home page (`HOME_PLACEMENTS`), so the backend-driven home renders the
// SAME intelligence-chat-enabled placements. Each slot has its own distinct placement.
const PLACEMENT_API_KEY = "018b5a9408d982482ee586511456679c1cc1f4bc4adc5dc2";
const DESK_CAROUSEL_PLACEMENT = {
  styleId: "6a86fefe1b5332711228a548",
  placementId: "6a86fefe1b5332711228a547",
  apiKey: PLACEMENT_API_KEY,
};
const LATEST_FEED_PLACEMENT = {
  styleId: "6a8712d44fc9bb6b22ea8c7b",
  placementId: "6a8712d44fc9bb6b22ea8c7a",
  apiKey: PLACEMENT_API_KEY,
};
const TOP_CATEGORIES_CAROUSEL_PLACEMENT = {
  styleId: "6a8713aa1b5332711228b24c",
  placementId: "6a8713aa1b5332711228b24b",
  apiKey: PLACEMENT_API_KEY,
};
const GRID_PLACEMENTS = [
  {
    styleId: "6a8d7df90ab638a100b16f74",
    placementId: "6a8d7df90ab638a100b16f73",
    mobileStyleId: "6a8d98dfceb52d9183e7e2e6",
    mobilePlacementId: "6a8d98dfceb52d9183e7e2e5",
    apiKey: PLACEMENT_API_KEY,
  },
  {
    styleId: "6aa3fe388bc64b3c7fc2cae5",
    placementId: "6aa3fe388bc64b3c7fc2cae4",
    mobileStyleId: "6aa3fe40d64b5ab580a4f4bf",
    mobilePlacementId: "6aa3fe40d64b5ab580a4f4be",
    apiKey: PLACEMENT_API_KEY,
  },
  {
    styleId: "6aa3fe478bc64b3c7fc2cb0c",
    placementId: "6aa3fe478bc64b3c7fc2cb0b",
    mobileStyleId: "6aa3fe4e8bc64b3c7fc2cb2a",
    mobilePlacementId: "6aa3fe4e8bc64b3c7fc2cb29",
    apiKey: PLACEMENT_API_KEY,
  },
];

// ─── Widgets (reused across layout variants; each dataKey exists in every feed page) ──────────────
const W_SALEGP_DESK: WidgetNode = {
  type: "widget",
  id: "salegp_desk",
  component: "video_carousel",
  dataKey: "salegp_desk",
  wrapper: { rounded: true, overflowHidden: true },
  config: DESK_CAROUSEL_PLACEMENT,
};
const W_LATEST_NEWS: WidgetNode = {
  type: "widget",
  id: "latest_news",
  component: "intelligence_panel",
  dataKey: "latest_news",
  dependsOn: { widgetId: "salegp_desk", event: "video_started", param: "videoId" },
};
const W_UPCOMING_RACES: WidgetNode = {
  type: "widget",
  id: "upcoming_races",
  component: "event_carousel",
  dataKey: "upcoming_races",
};
const W_LATEST_VIDEOS: WidgetNode = {
  type: "widget",
  id: "latest_videos",
  component: "video_feed",
  dataKey: "latest_videos",
  wrapper: { rounded: true, overflowHidden: true },
  config: LATEST_FEED_PLACEMENT,
};
const W_RELATED_LINKS: WidgetNode = {
  type: "widget",
  id: "related_links",
  component: "hover_link_card_list",
  dataKey: "related_links",
  dependsOn: { widgetId: "latest_videos", event: "video_started", param: "videoId" },
  wrapper: { showHeader: false, topSpacerPx: 42, border: true, rounded: true, overflowHidden: true },
};
const W_LATEST_INTERVIEWS: WidgetNode = {
  type: "widget",
  id: "latest_interviews",
  component: "intelligence_card_list",
  dataKey: "latest_interviews",
};
const W_TOP_CATEGORIES: WidgetNode = {
  type: "widget",
  id: "top_categories",
  component: "video_carousel",
  dataKey: "top_categories",
  wrapper: { rounded: true, overflowHidden: true },
  config: TOP_CATEGORIES_CAROUSEL_PLACEMENT,
};
const W_TMOBILE: WidgetNode = {
  type: "widget",
  id: "tmobile",
  component: "video_grid",
  dataKey: "tmobile",
  config: GRID_PLACEMENTS[0],
  // Three desktop columns of 9:16 tiles, tuned so Intelligence sits just inside the video edge.
  intrinsicSize: { width: 1000, height: 582 },
  // Three stacked 1:1 mobile tiles plus the placement's two 8px gaps at the authored 383px width.
  mobileIntrinsicSize: { width: 383, height: 1165 },
};
const W_RELEVANT_NEWS: WidgetNode = {
  type: "widget",
  id: "relevant_news",
  component: "intelligence_panel",
  dataKey: "relevant_news",
};

// ─── Reusable rows (normal + column-flipped variants of the two-up rows) ──────────────────────────
const ROW_CAROUSEL_NEWS: LayoutRow = {
  id: "row-carousel-news",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 0.75fr)",
  height: 574,
  padding: 20,
  columnGap: 16,
  children: [W_SALEGP_DESK, W_LATEST_NEWS],
};
/** Column-flipped: intelligence panel on the LEFT, carousel on the right. */
const ROW_NEWS_CAROUSEL: LayoutRow = {
  id: "row-news-carousel",
  gridTemplateColumns: "minmax(0, 0.75fr) minmax(0, 2fr)",
  height: 574,
  padding: 20,
  columnGap: 16,
  children: [W_LATEST_NEWS, W_SALEGP_DESK],
};
const ROW_EVENTS: LayoutRow = {
  id: "row-events",
  gridTemplateColumns: "minmax(0, 1fr)",
  height: 190,
  padding: 20,
  children: [W_UPCOMING_RACES],
};
const ROW_FEED_LINKS: LayoutRow = {
  id: "row-feed-links",
  gridTemplateColumns: "minmax(0, 1.259fr) minmax(0, 0.741fr) minmax(0, 0.75fr)",
  height: 441,
  padding: 20,
  columnGap: 16,
  children: [W_LATEST_VIDEOS, W_RELATED_LINKS, W_LATEST_INTERVIEWS],
};
const ROW_TOP_CATS: LayoutRow = {
  id: "row-top-cats",
  gridTemplateColumns: "minmax(0, 1fr)",
  height: 419,
  mobileHeight: 574,
  padding: 20,
  children: [W_TOP_CATEGORIES],
};
const ROW_GRID_NEWS: LayoutRow = {
  id: "row-grid-news",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 0.75fr)",
  height: 622,
  padding: 20,
  columnGap: 16,
  children: [W_TMOBILE, W_RELEVANT_NEWS],
};
/** Column-flipped: intelligence panel on the LEFT, grid on the right. */
const ROW_NEWS_GRID: LayoutRow = {
  id: "row-news-grid",
  gridTemplateColumns: "minmax(0, 0.75fr) minmax(0, 2fr)",
  height: 622,
  padding: 20,
  columnGap: 16,
  children: [W_RELEVANT_NEWS, W_TMOBILE],
};

const META = { page: "home", schemaVersion: 1 } as const;

// ─── Layout VARIANTS — each infinite-scroll page rotates through these ─────────────────────────────
// Every variant uses each widget exactly once (so ids stay unique and every placement/data slot
// renders), just arranged differently. Variant A is the original /home layout.
const VARIANT_A: HomeLayoutManifest = {
  metadata: META,
  rows: [ROW_CAROUSEL_NEWS, ROW_EVENTS, ROW_FEED_LINKS, ROW_TOP_CATS, ROW_GRID_NEWS],
};
/** Grid-led, columns flipped (panels on the left), events last. */
const VARIANT_B: HomeLayoutManifest = {
  metadata: META,
  rows: [ROW_NEWS_GRID, ROW_FEED_LINKS, ROW_TOP_CATS, ROW_NEWS_CAROUSEL, ROW_EVENTS],
};
/** Full-width carousels first, then the two-up rows. */
const VARIANT_C: HomeLayoutManifest = {
  metadata: META,
  rows: [ROW_TOP_CATS, ROW_GRID_NEWS, ROW_EVENTS, ROW_CAROUSEL_NEWS, ROW_FEED_LINKS],
};

const VARIANTS: readonly HomeLayoutManifest[] = [VARIANT_A, VARIANT_B, VARIANT_C];

/** SEAM: the default home layout manifest (variant A). Swap this body for a real backend later. */
export function getHomeLayout(): HomeLayoutManifest {
  return VARIANT_A;
}

/**
 * SEAM: the layout for a given infinite-scroll page. Rotates through the variants so each iteration
 * looks different. A real backend would return the layout it wants per page from here.
 */
export function getHomeLayoutForPage(pageIndex: number): HomeLayoutManifest {
  const count = VARIANTS.length;
  const variant = VARIANTS[((pageIndex % count) + count) % count]!;
  return {
    ...variant,
    rows: variant.rows.map((row) => ({
      ...row,
      children: row.children.map((node) =>
        node.type === "widget" && node.dataKey === "tmobile"
          ? { ...node, config: GRID_PLACEMENTS[pageIndex % GRID_PLACEMENTS.length] }
          : node
      ),
    })),
  };
}
