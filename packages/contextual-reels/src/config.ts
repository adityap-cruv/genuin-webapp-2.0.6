/**
 * All static configuration for the contextual-reels widget.
 *
 * Consolidates: config/env, config/constants, config/adLayouts, config/tagAllowLists.
 */

// ─── Environment constants ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- import.meta.env shape is bundler-defined
const _env: Record<string, string | undefined> = (import.meta as any).env ?? {};

/** Genuin API gateway base URL. Set VITE_CXR_API_BASE_URL to override. */
export const apiurl: string = _env.VITE_CXR_API_BASE_URL ?? "https://api.begenuin.com";

/** Marketing site hostname. */
export const hostname = "https://begenuin.com";

/**
 * Rudderstack write key for analytics ingestion.
 * Set VITE_CXR_RUDDERSTACK_KEY in your local .env.development (never commit the real value).
 */
export const rudderstackKey: string = _env.VITE_CXR_RUDDERSTACK_KEY ?? "";
console.log({ rudderstackKey: _env.VITE_CXR_RUDDERSTACK_KEY, VITE_CXR_API_BASE_URL: _env.VITE_CXR_API_BASE_URL });

/** Rudderstack data plane URL. Set VITE_CXR_RUDDERSTACK_DATA_PLANE_URL to override. */
export const rudderstackLink: string = _env.VITE_CXR_RUDDERSTACK_DATA_PLANE_URL ?? "https://etr.begenuin.com";

/** Deployment environment label propagated to analytics. */
export const env = "prod";

/** CDN base URL for widget static assets (icons, images). Set VITE_CXR_ASSET_BASE_URL to override. */
export const assetLink: string = _env.VITE_CXR_ASSET_BASE_URL ?? "https://media.begenuin.com/webapp_assets/";

/** DOM id used by the widget mount point. */
export const rootTagId = "gen-ext";

/** Universal deep link for the Genuin app (Branch/SmartLink). */
export const appStoreLink = "https://install.begenuin.com/86sn/cgs";

/** Apple App Store listing for the Genuin iOS app. */
export const appleAppStoreLink = "https://apps.apple.com/US/app/id1511177838?mt=8";

/** Google Play Store listing for the Genuin Android app. */
export const googlePlayStoreLink = "https://play.google.com/store/apps/details?id=com.begenuin.begenuin";

/** LinkedIn jobs URL surfaced on the "hire us" CTA. */
export const hireLink = "https://www.linkedin.com/jobs/genuin-jobs-worldwide?f_C=11153452";

/** LinkedIn company URL surfaced on the "invest" CTA. */
export const investLink = "https://www.linkedin.com/company/begenuin/";

// ─── SDK constants ────────────────────────────────────────────────────────────

/** Version of the Rudderstack JS SDK snippet inlined by the widget. */
export const RUDDER_SNIPPET_VERSION = "3.0.3";

/** Base URL the Rudderstack snippet loads `rsa.min.js` from. */
export const RUDDER_SDK_BASE_URL = "https://cdn.rudderlabs.com/v3";

// ─── Ad layout resolver ───────────────────────────────────────────────────────

/** Identifier strings emitted by {@link resolveAdLayout}. */
export type AdLayoutId = "desktop-300x600" | "desktop-300x250" | "mobile-320x50" | "mobile-320x100" | "unknown";

/** A single supported ad slot size. */
export interface AdLayoutVariant {
  readonly id: Exclude<AdLayoutId, "unknown">;
  readonly width: number;
  readonly height: number;
}

/**
 * The four pixel-perfect ad sizes the widget supports.
 *
 * Order is intentional — the resolver scans front-to-back so the canonical
 * "primary" variant (300x600) is listed first for documentation purposes.
 */
export const adLayoutVariants: readonly AdLayoutVariant[] = [
  { id: "desktop-300x600", width: 300, height: 600 },
  { id: "desktop-300x250", width: 300, height: 250 },
  { id: "mobile-320x50", width: 320, height: 50 },
  { id: "mobile-320x100", width: 320, height: 100 },
] as const;

/**
 * Resolve a slot's pixel size to a canonical layout id.
 *
 * @param width  Slot width in CSS pixels.
 * @param height Slot height in CSS pixels.
 * @returns The matching layout id, or `'unknown'` when no variant matches
 *          exactly (also returned when either dimension is falsy).
 */
export function resolveAdLayout(width = 0, height = 0): AdLayoutId {
  if (!width || !height) return "unknown";
  const exact = adLayoutVariants.find((v) => v.width === width && v.height === height);
  return exact ? exact.id : "unknown";
}

// ─── Tag allow lists ──────────────────────────────────────────────────────────

/**
 * The tag ids for which the GenAI experience is enabled.
 *
 * Pinned to the legacy list — DO NOT extend without confirming the GenAI
 * pipeline can serve the new tag.
 */
export const GENAI_ENABLED_TAG_IDS: readonly string[] = [
  // "69846c0e6852c97693efad40",
  // "69c66cfe2d3aa5231a687a3d",
  // "69c66cfe2d3aa5231a687a3d",
] as const;

/**
 * Returns whether the given tag id is allowed to render the GenAI experience.
 *
 * @param tagId The tag identifier to test. Empty strings return `false`.
 */
export function isGenAiAllowed(tagId: string): boolean {
  if (!tagId) return false;
  return GENAI_ENABLED_TAG_IDS.includes(tagId);
}

/**
 * Tag IDs for which the fullscreen ad break on organic videos is enabled.
 * While enabled, every reel gets a mock `adObject` (see `buildReelAdObject`)
 * until the backend supplies real per-reel ad configs.
 */
export const FULLSCREEN_AD_BREAK_ENABLED_TAG_IDS: readonly string[] = [
  "6a2fefd87ce338c3a5afc605",
  "6a391232d73aa25887ac2af3",
] as const;

/**
 * Returns whether the fullscreen ad break is enabled for the given tag.
 *
 * @param tagId The tag identifier to test. Empty strings return `false`.
 */
export function isFullscreenAdBreakEnabled(tagId: string): boolean {
  if (!tagId) return false;
  return FULLSCREEN_AD_BREAK_ENABLED_TAG_IDS.includes(tagId);
}

/**
 * Tag IDs for which static ad injection is enabled in the feed.
 */
export const STATIC_AD_INJECT_TAG_IDS: readonly string[] = [] as const;

/**
 * Returns whether static ad injection is enabled for the given tag.
 *
 * @param tagId The tag identifier to test. Empty strings return `false`.
 */
export function isStaticAdInjectionEnabled(tagId: string): boolean {
  if (!tagId) return false;
  return STATIC_AD_INJECT_TAG_IDS.includes(tagId);
}

// utils/isIframe.ts
export function isIframe(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
