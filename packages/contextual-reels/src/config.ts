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

/**
 * Numeric identifiers for supported ad slot sizes.
 * Use these constants everywhere — pixel dimensions live in comments only.
 */
export const AD_LAYOUT = {
  Unknown: 0,
  L1: 1, // desktop 300×600 — full player
  L2: 2, // desktop 300×250 — full player + Octo overlay
  L3: 3, // mobile 320×50  — compact bar, no player
  L4: 4, // mobile 320×100 — banner with 100px thumbnail player
} as const;

/** Numeric layout identifier produced by {@link resolveAdLayout}. */
export type AdLayoutId = (typeof AD_LAYOUT)[keyof typeof AD_LAYOUT];

/** A single supported ad slot size. */
export interface AdLayoutVariant {
  readonly id: Exclude<AdLayoutId, 0>;
  readonly width: number;
  readonly height: number;
}

/**
 * The four pixel-perfect ad sizes the widget supports.
 *
 * Order is intentional — the resolver scans front-to-back so the canonical
 * "primary" variant (L1) is listed first for documentation purposes.
 */
export const adLayoutVariants: readonly AdLayoutVariant[] = [
  { id: AD_LAYOUT.L1, width: 300, height: 600 },
  { id: AD_LAYOUT.L2, width: 300, height: 250 },
  { id: AD_LAYOUT.L3, width: 320, height: 50 },
  { id: AD_LAYOUT.L4, width: 320, height: 100 },
] as const;

/**
 * Resolve a slot's pixel size to a canonical layout id.
 *
 * @param width  Slot width in CSS pixels.
 * @param height Slot height in CSS pixels.
 * @returns The matching layout id, or `AD_LAYOUT.Unknown` (0) when no variant
 *          matches exactly (also returned when either dimension is falsy).
 */
export function resolveAdLayout(width = 0, height = 0): AdLayoutId {
  if (!width || !height) return AD_LAYOUT.Unknown;
  const exact = adLayoutVariants.find((v) => v.width === width && v.height === height);
  return exact ? exact.id : AD_LAYOUT.Unknown;
}

// ─── Tag strategy predicates ────────────────────────────────────────────────
// Predicates live in strategies/strategies.ts (thin wrappers over the cascade
// resolver) — re-exported here so existing @cxr/config imports keep working.
export {
  isGenAiAllowed,
  isAdBreakEnabled,
  isGateOnUnmuteEnabled,
  isSingleHitWaterfallEnabled,
  isAdsDisabled,
  isMutePassbackEnabled,
} from "@cxr/strategies/strategies";

// utils/isIframe.ts
export function isIframe(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}
