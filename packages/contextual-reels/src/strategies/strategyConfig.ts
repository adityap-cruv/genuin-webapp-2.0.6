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
import type { Strategies } from "@cxr/strategies/strategies";

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
 * back after the 3s muted-playback timer. The other 98% stay gated on unmute.
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

  // Start audible at 20% on load (unmuted); served from static fixtures (see
  // staticTagData.ts) — skips /ad_creative and /feed (/ip_info still fires for
  // geoip + real client IP on the ad-URL rewrite).
  // `feedLoopEnabled: false` inline rather than the `noLoop` preset — a tag can
  // only carry one preset and these already use `servedStatically`.
  "6a39163e92929ebec64d78ab": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 320x50
  "6a3916de30e1406c10507518": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 300x250
  "6a3915b692929ebec64d785e": {
    initialVolume: 0.2,
    singleHitWaterfall: true,
    feedLoopEnabled: false,
    preset: "servedStatically",
  }, // 320x100
  // 320x480 (AD_LAYOUT.L5) sibling of the two above — same brand (3252), same
  // static Triton ad slots, rendered on L1's full player instead of a banner.
  "6a6892e52ca77d200369fb9e": {
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
  "69b298e3d6a6ad57e7b9a464": { singleHitWaterfall: true, mutePassback: true, gateOnUnmute: true },
  "69b298f4d6a6ad57e7b9a499": {
    singleHitWaterfall: true,
    mutePassback: true,
    gateOnUnmute: true,
  },
  "6a032e34054c8fcb08582510": {
    singleHitWaterfall: true,
    mutePassback: true,
    gateOnUnmute: true,
  },
  "6a032de445fa9f171bd291cb": {
    singleHitWaterfall: true,
    mutePassback: true,
    gateOnUnmute: true,
  },
};
