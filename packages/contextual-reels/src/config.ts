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

// ─── Stacked layout ───────────────────────────────────────────────────────────
//
// A stacked slot is split into two equal halves: our widget on top and an
// Infolinks in-place unit below. Two tags opt in today:
//   - 320×100 (L4): top 320×50 (our L3) + bottom 320×50 Infolinks.
//   - 300×600 (L1): top 300×300 (our L2) + bottom 300×300 Infolinks.
// Activation requires the `gen_variant=stacked` URL param (this frame or the top
// frame) plus a matching tag id — relaxed to any matching slot size on
// localhost so either layout can be tested without the production tag id.

/**
 * URL query param that opts a supported slot into the stacked layout.
 * Prefixed with `gen_` to avoid colliding with a publisher's own `variant` param.
 */
export const STACKED_VARIANT_PARAM = "gen_variant";

/** Value of {@link STACKED_VARIANT_PARAM} that activates the stacked layout. */
export const STACKED_VARIANT_VALUE = "stacked";

/**
 * Loader script param that overrides the Infolinks `purl` (publisher attribution
 * URL). When present, it wins over the auto-resolved page URL — useful when our
 * frame is cross-origin and cannot read the real page URL on its own. Read from
 * our own <script src> query, so it can't collide with a publisher's page params.
 */
export const INFOLINKS_PURL_PARAM = "purl";

/** Infolinks publisher id used for the bottom Infolinks in-place unit. */
export const INFOLINKS_PID = 3446242;

/** Per-tag stacked layout configuration. */
export interface StackedLayoutConfig {
  /** The layout the embedded slot must resolve to for this tag. */
  readonly requiredLayout: AdLayoutId;
  /** The layout our widget renders in the top half. */
  readonly ourLayout: AdLayoutId;
  /** Height in CSS px of each half (both halves are equal). */
  readonly halfHeight: number;
  /** Width in CSS px of the stacked slot (and each half). */
  readonly width: number;
  /** Infolinks `inplace_slot` size for the bottom half. */
  readonly infolinks: { readonly width: number; readonly height: number };
}

/**
 * Registry of tags that opt into the stacked layout, keyed by tag id.
 * Add a tag here to enable stacking for it.
 */
export const STACKED_LAYOUT_TAGS: Readonly<Record<string, StackedLayoutConfig>> = {
  // 320×100 → 320×50 (our L3 compact) + 320×50 Infolinks.
  "6a032e34054c8fcb08582510": {
    requiredLayout: AD_LAYOUT.L4,
    ourLayout: AD_LAYOUT.L3,
    halfHeight: 50,
    width: 320,
    infolinks: { width: 320, height: 50 },
  },
  // 300×600 → 300×300 (our L1 full player) + 300×300 Infolinks.
  // L1 fills its container (h-full/w-full), so the player fills the 300×300 half
  // exactly; L2 is dimensionally locked to 300×250 and would leave a 50px gap.
  "69b298e3d6a6ad57e7b9a464": {
    requiredLayout: AD_LAYOUT.L1,
    ourLayout: AD_LAYOUT.L1,
    halfHeight: 300,
    width: 300,
    infolinks: { width: 300, height: 300 },
  },
};

/**
 * The first opted-in tag (320×100). Retained as a named export for tests and
 * back-compat; prefer {@link STACKED_LAYOUT_TAGS} for lookups.
 */
export const STACKED_LAYOUT_TAG_ID = "6a032e34054c8fcb08582510";

/**
 * True when `url` carries `gen_variant=stacked`.
 *
 * Checks the parsed query string first, then falls back to a raw substring test
 * so we still match when the pair is URL-encoded or nested inside another param
 * (Infolinks forwards it inside its own tracking URLs, e.g.
 * `...&gen_variant%3Dstacked...`). The raw test tolerates both `=` and `%3D`.
 */
function urlHasStackedVariant(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, "http://x");
    if (parsed.searchParams.get(STACKED_VARIANT_PARAM) === STACKED_VARIANT_VALUE) return true;
  } catch {
    // not a parseable URL — fall through to the raw test
  }
  const needle = `${STACKED_VARIANT_PARAM}=${STACKED_VARIANT_VALUE}`;
  const decoded = (() => {
    try {
      return decodeURIComponent(url);
    } catch {
      return url;
    }
  })();
  return decoded.includes(needle);
}

/**
 * Whether the stacked variant is requested anywhere in the frame chain.
 *
 * The `gen_variant=stacked` signal is not reliably a query param on our own
 * frame: in the real Infolinks embedding our widget runs inside an `about:srcdoc`
 * iframe whose own URL carries no query string, and `window.top` (the publisher
 * page) is cross-origin so its `location` throws `SecurityError`. So we scan
 * every reachable source instead of just self + top:
 *
 *  1. Each ancestor `window` whose `location` we can read (same-origin frames);
 *     cross-origin reads throw and are skipped, and the walk is bounded by the
 *     frame chain so it always terminates.
 *  2. `document.referrer` — carries the parent frame's full URL (query string
 *     included) even when that parent is cross-origin, which is our best signal
 *     when the immediate embedder is on another origin.
 *
 * Each candidate URL is tested with {@link urlHasStackedVariant}, which also
 * matches the encoded form Infolinks forwards inside its tracking URLs.
 */
/**
 * Read a single param from the loader script's own query string, captured by the
 * loader into `window.__CXR_SCRIPT_PARAMS__`. This is the most reliable config
 * channel from inside a cross-origin `srcdoc` iframe: the partner controls the
 * loader URL and it lives in our own document. Example:
 *   <script src=".../gen_ext.min.js?gen_variant=stacked&purl=https%3A%2F%2F..."></script>
 *
 * @returns The (URL-decoded) value, or `undefined` when the param is absent.
 */
export function getScriptParam(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  if (!raw) return undefined;
  return new URLSearchParams(raw).get(name) ?? undefined;
}

export function hasStackedVariant(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Loader override — the query string of our own <script src>. Enable
  //    stacking with:
  //      <script src=".../gen_ext.min.js?gen_variant=stacked"></script>
  if (getScriptParam(STACKED_VARIANT_PARAM) === STACKED_VARIANT_VALUE) return true;

  // 2. Walk the ancestor chain, reading each frame's URL where the same-origin
  //    policy permits it. `win.parent === win` at the top frame terminates.
  for (let win: Window | null = window; win; win = win === win.parent ? null : win.parent) {
    try {
      if (urlHasStackedVariant(win.location.href)) return true;
    } catch {
      // cross-origin frame — cannot read its location; keep climbing
    }
  }

  // 3. The referrer exposes the (possibly cross-origin) embedder's URL.
  try {
    if (urlHasStackedVariant(document.referrer)) return true;
  } catch {
    // referrer unavailable
  }

  return false;
}

/**
 * Whether the widget is running on a local development host (localhost,
 * 127.0.0.1, [::1], or a `*.local` hostname). Used to relax the tag-id gate so
 * the stacked layout can be exercised locally against any supported slot size.
 */
export function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".local");
}

/**
 * Resolve the stacked layout config for a slot, or `null` when it should not
 * stack. Requires the `gen_variant=stacked` URL param plus a supported slot layout.
 *
 * In production the tag id must be registered in {@link STACKED_LAYOUT_TAGS} and
 * the slot must resolve to that tag's `requiredLayout`. On a local development
 * host ({@link isLocalhost}) the tag-id check is relaxed: any slot whose
 * resolved layout matches a registered `requiredLayout` stacks, so both the
 * 320×100 and 300×600 variants can be tested with `?gen_variant=stacked`.
 */
export function resolveStackedLayout(
  tagId: string | null | undefined,
  adLayout: AdLayoutId
): StackedLayoutConfig | null {
  if (!hasStackedVariant()) return null;

  if (tagId && tagId in STACKED_LAYOUT_TAGS) {
    const config = STACKED_LAYOUT_TAGS[tagId];
    return config && config.requiredLayout === adLayout ? config : null;
  }

  if (isLocalhost()) {
    const match = Object.values(STACKED_LAYOUT_TAGS).find((c) => c.requiredLayout === adLayout);
    return match ?? null;
  }

  return null;
}

/**
 * Whether a slot should render the stacked layout. Thin boolean wrapper over
 * {@link resolveStackedLayout}.
 */
export function shouldUseStackedLayout(tagId: string | null | undefined, adLayout: AdLayoutId): boolean {
  return resolveStackedLayout(tagId, adLayout) !== null;
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
