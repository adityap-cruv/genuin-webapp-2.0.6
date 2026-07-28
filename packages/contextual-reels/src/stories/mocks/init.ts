/**
 * @fileoverview Storybook-only identifiers and config for the MSW mock layer.
 *
 * Mirrors web-sdk's `tests/mocks/data/init` pattern: each previewable variant
 * maps to a distinct id, and the MSW handlers dispatch on that id. Here the
 * in-feed content type maps to a synthetic `tag_id`; the feed handler returns
 * a different fixture per id, so switching the story's Content button just
 * remounts `App` with a new `tagId`.
 *
 * The ids are intentionally absent from `TAG_STRATEGIES`, so strategy
 * resolution yields clean defaults (no mutePassback gating).
 */
import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";

/** In-feed content modes exposed by the story's Content control. */
export const CONTENT = {
  VideoAd: "video-ad",
  AdOnly: "ad-only",
  VideoOnly: "video-only",
} as const;

/** A content mode value. */
export type ContentMode = (typeof CONTENT)[keyof typeof CONTENT];

/** Content mode → synthetic storybook tag id (dispatched by the MSW handlers). */
export const CONTENT_TAG_ID: Record<ContentMode, string> = {
  [CONTENT.VideoAd]: "storybook-cxr-video-ad",
  [CONTENT.AdOnly]: "storybook-cxr-ad-only",
  [CONTENT.VideoOnly]: "storybook-cxr-video-only",
};

/** Shared root tag id for the embedding container. */
export const ROOT_TAG_ID = "__gen__ext__id__1";

/** A previewable ad size: its adLayout variant plus exact container dimensions. */
export interface SizeConfig {
  adLayout: AdLayoutId;
  width: number;
  height: number;
}

/** Size label → adLayout variant + container dimensions (story Size control). */
export const SIZES: Record<string, SizeConfig> = {
  "300x600": { adLayout: AD_LAYOUT.L1, width: 300, height: 600 },
  "300x250": { adLayout: AD_LAYOUT.L2, width: 300, height: 250 },
  "320x480": { adLayout: AD_LAYOUT.L5, width: 320, height: 480 },
  "320x100": { adLayout: AD_LAYOUT.L4, width: 320, height: 100 },
  "320x50": { adLayout: AD_LAYOUT.L3, width: 320, height: 50 },
};
