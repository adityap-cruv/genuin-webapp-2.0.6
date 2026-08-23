// Home layout data source (the "widget.json"). SERVER-ONLY — read by the /api/home/layout route.
//
// This is the swappable SEAM for backend integration. Today it returns a static dummy manifest;
// to use a real backend later, change ONLY `getHomeLayout()` to fetch the real API and map its
// response to `HomeLayoutManifest` (the frontend + the API route never change). Or point
// `NEXT_PUBLIC_HOME_BFF_URL` at a real backend that serves this same contract and this file is unused.
//
// Types come from the frontend contract (`@genuin/components/.../contract`) so the dummy and the
// real backend share ONE source of truth for the shape.

import type { HomeLayoutManifest } from "@genuin/components/page/home-dynamic/contract";

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
const GRID_PLACEMENT = {
  styleId: "6a7c797ae26bf2c127deb953",
  placementId: "6a7c797ae26bf2c127deb952",
  apiKey: PLACEMENT_API_KEY,
};

const HOME_LAYOUT: HomeLayoutManifest = {
  metadata: { page: "home", schemaVersion: 1 },
  rows: [
    {
      id: "row-1",
      gridTemplateColumns: "minmax(0, 2.5fr) minmax(0, 1fr)",
      height: 500,
      columnGap: 20,
      children: [
        {
          type: "widget",
          id: "salegp_desk",
          component: "video_carousel",
          dataKey: "salegp_desk",
          wrapper: { rounded: true, overflowHidden: true },
          config: DESK_CAROUSEL_PLACEMENT,
        },
        {
          type: "widget",
          id: "latest_news",
          component: "intelligence_panel",
          dataKey: "latest_news",
          dependsOn: { widgetId: "salegp_desk", event: "video_started", param: "videoId" },
        },
      ],
    },
    {
      id: "row-2",
      gridTemplateColumns: "minmax(0, 1fr)",
      height: 190,
      children: [
        { type: "widget", id: "upcoming_races", component: "event_carousel", dataKey: "upcoming_races" },
      ],
    },
    {
      id: "row-3",
      gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr)",
      height: 460,
      columnGap: 20,
      children: [
        {
          type: "widget",
          id: "latest_videos",
          component: "video_feed",
          dataKey: "latest_videos",
          wrapper: { rounded: true, overflowHidden: true },
          config: LATEST_FEED_PLACEMENT,
        },
        {
          type: "widget",
          id: "related_links",
          component: "hover_link_card_list",
          dataKey: "related_links",
          dependsOn: { widgetId: "latest_videos", event: "video_started", param: "videoId" },
          wrapper: { showHeader: false, topSpacerPx: 42, border: true, rounded: true, overflowHidden: true },
        },
        {
          type: "widget",
          id: "latest_interviews",
          component: "intelligence_card_list",
          dataKey: "latest_interviews",
        },
      ],
    },
    {
      id: "row-4",
      gridTemplateColumns: "minmax(0, 1fr)",
      height: 498,
      children: [
        {
          type: "widget",
          id: "top_categories",
          component: "video_carousel",
          dataKey: "top_categories",
          wrapper: { rounded: true, overflowHidden: true },
          config: TOP_CATEGORIES_CAROUSEL_PLACEMENT,
        },
      ],
    },
    {
      id: "row-5",
      gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1fr)",
      height: 654,
      columnGap: 20,
      children: [
        { type: "widget", id: "tmobile", component: "video_grid", dataKey: "tmobile", config: GRID_PLACEMENT },
        {
          type: "widget",
          id: "relevant_news",
          component: "intelligence_panel",
          dataKey: "relevant_news",
        },
      ],
    },
  ],
};

/** SEAM: the home layout manifest. Swap this body to fetch+map a real backend later. */
export function getHomeLayout(): HomeLayoutManifest {
  return HOME_LAYOUT;
}
