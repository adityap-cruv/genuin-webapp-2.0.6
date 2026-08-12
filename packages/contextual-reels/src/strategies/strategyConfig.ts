/**
 * Strategy config registry — the single place to manage per-tag and preset
 * feature decisions.
 *
 * Resolution cascades most-specific-wins across three layers (see
 * {@link resolveStrategies}):
 *   DEFAULT_STRATEGIES → preset bundle → tag inline.
 * To change behaviour for a tag, edit this file only — no consumer changes.
 *
 * Currently client-side. When the backend serves this config, prepend one layer
 * in {@link resolveStrategies} and these registries become the dev/fallback default.
 */
import { EVENT } from "@cxr/analytics/analytics";
import type { Strategies } from "@cxr/strategies/strategies";

/**
 * Events with no signal for an ads-only single-interstitial unit.
 *
 * These describe an editorial scrollable-feed experience the unit does not have
 * (no feed to scroll/swipe, no fullscreen, disabled CTA/share/spark) plus the
 * high-frequency per-tick video churn that the L3 hidden-audio player would
 * otherwise emit off the ad creative. The ad-level funnel is covered separately
 * (`Ad Media Quartile` from the GenAd SDK), so the video quartiles are redundant
 * here. Revenue-funnel + boot + diagnostic events are deliberately NOT listed.
 *
 * Attach via a tag's `suppressedEvents` in {@link TAG_STRATEGIES}. Shared as a
 * named list so the entire ads-only Infolinks inventory (all 15 prod tags across
 * 320×50, 320×100, 300×250, 300×600, 320×480) applies the exact same policy
 * without drift.
 */
const ADS_ONLY_INTERSTITIAL_SUPPRESSED: readonly string[] = [
  // Feed lifecycle — degenerate for a single static fixture entry. A
  // servedStatically tag reads its feed from a committed fixture (no /feed
  // call), so the whole feed-lifecycle vocabulary describes a network round-trip
  // that never happens — including `Feed API Call Completed`. (`Tag Displayed`
  // is NOT here: it only fires on the empty-feed branch, which a 1-reel fixture
  // never hits, so it is already absent for this tag.)
  EVENT.SCROLL,
  EVENT.SWIPE_NEXT,
  EVENT.SWIPE_PREVIOUS,
  EVENT.BATCH_STARTED,
  EVENT.BATCH_COMPLETED,
  EVENT.FEED_API_CALL_COMPLETED,
  EVENT.FEED_COMPLETED,
  // Embed chrome — an ads-only interstitial never maximizes/minimizes.
  EVENT.EMBED_MAXIMIZED,
  EVENT.EMBED_MINIMIZED,
  // Disabled features on this tag's config (show_cta/share/spark off).
  EVENT.EMBED_CTA_CLICKED,
  EVENT.CTA_CLICK,
  EVENT.SHARE,
  EVENT.SPARK,
  EVENT.VIDEO_SHARED,
  // Video playback/quartile events — same defense-in-depth rationale as the
  // lifecycle markers below: they belong to the `VideoLayout` player pipeline,
  // which a `type: "ads"` (`AdLayout`) entry never mounts, so they don't fire on
  // the current ads-only tags. Where they WOULD apply, ad-level quartiles already
  // come from the GenAd SDK (`Ad Media Quartile`), making these redundant.
  EVENT.VIDEO_WATCH,
  EVENT.VIDEO_FIRST_QUARTILE,
  EVENT.VIDEO_MIDPOINT,
  EVENT.VIDEO_THIRD_QUARTILE,
  EVENT.VIDEO_PLAY,
  EVENT.VIDEO_PAUSED,
  EVENT.VIDEO_PLAY_INTERRUPTED,
  // Video-layer lifecycle markers — DEFENSE-IN-DEPTH, not a live saving on the
  // current ads-only tags. A `type: "ads"` entry renders via `AdLayout`
  // (`GenAdSlot`, no `LightPlayer`), so the player-event pipeline never attaches
  // and these never fire today. Listed anyway so (a) a future config that routes
  // one of these tags through `VideoLayout` (mixed feed) doesn't start doubling
  // the ad funnel, and (b) sibling ads-only tags reusing this list are covered if
  // they DO take the video path. Where they would map: `Video Loaded`≈`Ad
  // Rendered`, `Video Started`/`Video Play Started`≈`Ad Started`,
  // `Video Complete`≈`Ad Completed` (generic {duration, watch_time}, none of the
  // ad-meaningful {ad_source, provider} fields).
  EVENT.VIDEO_LOADED,
  EVENT.VIDEO_STARTED,
  EVENT.VIDEO_PLAY_STARTED,
  EVENT.VIDEO_COMPLETED,
];

/**
 * Reusable named bundles of toggle values. Attach to a tag via
 * `TAG_STRATEGIES[id].preset`; a tag's own inline keys override the preset.
 */
export const STRATEGY_PRESETS = {
  iheart: { adBreakEnabled: true, gateOnUnmute: true },
  genaiDemo: { genAiEnabled: true },
  singleHit: { singleHitWaterfall: true },
  servedStatically: { servedStatically: true },
  // Finite feed: the last slide is a hard stop instead of wrapping to slide 0.
  noLoop: { feedLoopEnabled: false },
  // Hold render until the unit is on screen; passback `unit_hidden` after 30s hidden.
  visibilityGate: { visibilityGate: true },
} satisfies Record<string, Partial<Strategies>>;

/** Name of a defined preset bundle. */
export type StrategyPreset = keyof typeof STRATEGY_PRESETS;

/** A tag's config: an optional attached preset plus inline key overrides (inline wins). */
export type TagStrategyEntry = Partial<Strategies> & { preset?: StrategyPreset };

/**
 * Per-brand strategy config, keyed by numeric `brand_id`. Sits between the preset
 * layer and tag inline keys in the cascade (see {@link resolveStrategies}) — every
 * tag belonging to the brand gets these values unless the tag overrides them
 * inline. Change a value here to repaint/reconfigure every tag under that brand
 * at once, regardless of tag id.
 */
export const BRAND_STRATEGIES: Record<number, Partial<Strategies>> = {
  // Fixed compact-backdrop color for this brand, regardless of backend `brand_color`.
  3252: { compactBackgroundColor: "#EC298C" },
};

/**
 * A per-page-load traffic experiment for a tag. When a page load falls into the
 * bucket (probability `sampleRate`), `overrides` are applied on top of the tag's
 * resolved strategies. The roll happens once per `StrategyProvider` mount, so the
 * bucket is stable for the session but varies load-to-load.
 *
 * Pure data — the random roll lives in {@link StrategyProvider}; the override
 * logic is applied by {@link applyExperiment}, which takes the roll as input.
 */
export interface TagExperiment {
  /** Fraction of page loads in the bucket, 0..1 (e.g. `0.02` = 2%). */
  sampleRate: number;
  /** Strategy values applied when a load is in the bucket. */
  overrides: Partial<Strategies>;
}

/**
 * Per-tag traffic experiments, keyed by tag id. Distinct from {@link TAG_STRATEGIES}
 * (deterministic per-tag config): these apply to a random sample of page loads.
 *
 * Immediate-request experiment — for 2% of loads, ungate the request
 * (gateOnUnmute:false) so the ad fires on load without waiting for unmute, and
 * suppress the mute-passback so the volume-0 ad runs instead of being passed
 * back after the muted-playback timer (`mutePassbackDelayMs`, default 5s). The
 * other 98% stay gated on unmute.
 * The tag's base is gated (gateOnUnmute:true in TAG_STRATEGIES) so the override
 * is what ungates the sampled slice.
 */
export const TAG_EXPERIMENTS: Record<string, TagExperiment> = {
  "6a032e34054c8fcb08582510": {
    sampleRate: 0.1,
    overrides: { gateOnUnmute: false, mutePassback: false },
  },
  "6a032de445fa9f171bd291cb": {
    sampleRate: 0.1,
    overrides: { gateOnUnmute: false, mutePassback: false },
  },
  "6a3aa8244da8cd92d289cc72": {
    sampleRate: 0.1,
    overrides: { gateOnUnmute: false, mutePassback: false },
  },
};

/**
 * Per-tag strategy config. Migrated from the former allowlist arrays:
 *   FULLSCREEN_AD_BREAK_ENABLED_TAG_IDS + GATE_ON_UNMUTE_TAG_IDS → adBreak + gateOnUnmute
 *   SINGLE_HIT_WATERFALL_TAG_IDS → singleHitWaterfall
 *   MUTE_PASSBACK_TAG_IDS → mutePassback
 *   GENAI_ENABLED_TAG_IDS was empty → no entries.
 */
export const TAG_STRATEGIES: Record<string, TagStrategyEntry> = {
  // Dev slot (index.html): start audible at 20%; other defaults unchanged.
  // THIS IS FOR QA TESTING ONLY — DO NOT COPY TO PROD TAGS.
  "697c46aa9f432b1a2055e803": { initialVolume: 0.2 },
  "6a3aa78ba0daccfd439648b8": {
    initialVolume: 0.2,
    gateOnUnmute: true,
    singleHitWaterfall: true,
    servedStatically: true,
  },
  "6a3ba4395df1fee89bf0b2e7": { gateOnUnmute: true },
  "6a3aa8244da8cd92d289cc72": { gateOnUnmute: true },

  // ===========================================================================
  // LIVE PRODUCTION Infolinks ads-only tags (brand 3252) — 15 total.
  //
  // The full live inventory from the Infolinks size×tag sheet: 3 tags per size
  // across the 5 supported sizes (organized in size blocks below). All start
  // audible at 20% on load (unmuted) and are served from static fixtures (see
  // staticTagData.ts) — skips /ad_creative and /feed (/ip_info still fires for
  // geoip + the real client IP on the ad-URL rewrite). Each carries the same
  // config; the -2/-3 siblings reuse the brand-level Triton ad feed of their
  // size's first (anchor) tag via their loaders in staticTagData.ts.
  //
  // All 15 are `type: "ads"` single-interstitial units, so every one drops the
  // no-signal event vocabulary via `suppressedEvents:
  // ADS_ONLY_INTERSTITIAL_SUPPRESSED` (the shared list is defined once so the
  // whole ads-only inventory stays in sync — no per-tag drift).
  //
  // `feedLoopEnabled: false` is inline rather than the `noLoop` preset — a tag
  // can only carry one preset and these already use `servedStatically`.
  //
  // ⚠️ THESE ARE PRODUCTION TAGS IN LIVE TRAFFIC — DO NOT render, request, or
  // point a browser/harness/E2E run at any of these ids on local or in
  // automation. A single live request inflates the real tag's analytics
  // (impressions, fill, funnel). The only network-safe sandbox tag is
  // 6a1fd43b45aec54862ed235d. Offline fixtures for these tags load without a
  // network call, but never drive an actual ad request against them in tests.
  // ===========================================================================

  // --- 320x50 ---
  "6a39163e92929ebec64d78ab": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x50-ads-only
  "6a7c45fcf3f875e5e06dadab": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x50-ads-only-2
  "6a7c465586d060bd42fb5ab7": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x50-ads-only-3

  // --- 320x100 ---
  "6a3915b692929ebec64d785e": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x100-ads-only
  "6a7c46dcf3f875e5e06daef0": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x100-ads-only-2
  "6a7c46fef3f875e5e06daf19": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x100-ads-only-3

  // --- 300x250 ---
  "6a3916de30e1406c10507518": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 300x250-ads-only
  "6a7c4727fa1b811d815aa00f": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 300x250-ads-only-2
  "6a7c473df3f875e5e06daf87": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 300x250-ads-only-3

  // --- 300x600 ---
  "6a391708a7d9f8da7f6e56ad": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 300x600-ads-only
  "6a7c476af3f875e5e06dafc1": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 300x600-ads-only-2
  "6a7c479586d060bd42fb5c3c": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 300x600-ads-only-3

  // --- 320x480 (AD_LAYOUT.L5) — rendered on L1's full player, not a banner ---
  "6a6892e52ca77d200369fb9e": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x480-ads-only
  "6a7c47bf86d060bd42fb5c95": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x480-ads-only-2
  "6a7c47d8f3f875e5e06db080": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
    suppressedEvents: ADS_ONLY_INTERSTITIAL_SUPPRESSED,
  }, // 320x480-ads-only-3

  // Demo-only static tags (no DB entry) — served from committed fixtures with a
  // single Triton ad reel each. Same static strategy as the tags above. Sizes
  // per the demo size×tag-id sheet; layout is driven by container px, so the
  // tag config just carries the descriptive tag_name.
  "6a3aa78ba0daccfd439648b81": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 320x50
  "6a3aa78ba0daccfd439648b82": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 320x100
  "6a3aa78ba0daccfd439648b83": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 300x250
  "6a3aa78ba0daccfd439648b84": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 300x600
  "6a3aa78ba0daccfd439648b85": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 320x480
  // Audible-start tags too, but served from the live exchange rather than fixtures.
  // The 20% volume is the advertiser requirement, not a test override — these
  // intentionally bypass the mute gate and start unmuted. Do not "fix" by muting.
  "6a1fd43b45aec54862ed235d": { initialVolume: 0.2, singleHitWaterfall: true }, // 320x50
  "6a3aa86e4da8cd92d289ccda": { initialVolume: 0.2, singleHitWaterfall: true }, // 320x50 QA

  "6a2fefd87ce338c3a5afc605": { singleHitWaterfall: true, initialVolume: 0.2 },
  "6a391232d73aa25887ac2af3": { adBreakEnabled: true, gateOnUnmute: true },
  "69b298e3d6a6ad57e7b9a464": { singleHitWaterfall: false, mutePassback: true, gateOnUnmute: true },
  "69b298f4d6a6ad57e7b9a499": {
    singleHitWaterfall: false,
    mutePassback: true,
    gateOnUnmute: true,
  },
  "6a032e34054c8fcb08582510": {
    singleHitWaterfall: false,
    mutePassback: true,
    gateOnUnmute: true,
  },
  "6a032de445fa9f171bd291cb": {
    singleHitWaterfall: false,
    mutePassback: true,
    gateOnUnmute: true,
  },
};
