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
} satisfies Record<string, Partial<Strategies>>;

/** Name of a defined preset bundle. */
export type StrategyPreset = keyof typeof STRATEGY_PRESETS;

/** A tag's config: an optional attached preset plus inline key overrides (inline wins). */
export type TagStrategyEntry = Partial<Strategies> & { preset?: StrategyPreset };

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
    sampleRate: 0.02,
    overrides: { gateOnUnmute: false, mutePassback: false },
  },
  "6a032de445fa9f171bd291cb": {
    sampleRate: 0.02,
    overrides: { gateOnUnmute: false, mutePassback: false },
  },
  "6a3aa8244da8cd92d289cc72": {
    sampleRate: 0.02,
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
  // gateOnUnmute:true gates the 98% (request waits for unmute); the 2%
  // experiment below ungates it. Needed because DEFAULT_STRATEGIES.gateOnUnmute
  // is false, so without this the base would ungate every load. initialVolume
  // stays 0.2 (audible start) for all traffic — the experiment doesn't touch it.
  "6a3aa8244da8cd92d289cc72": {
    singleHitWaterfall: true,
    gateOnUnmute: true,
    initialVolume: 0.2,
  },
  "6a2fefd87ce338c3a5afc605": { singleHitWaterfall: true, initialVolume: 0.2 },
  "6a391232d73aa25887ac2af3": { adBreakEnabled: true, gateOnUnmute: true },
  "69b298e3d6a6ad57e7b9a464": { singleHitWaterfall: true, mutePassback: true },
  "69b298f4d6a6ad57e7b9a499": { singleHitWaterfall: true, mutePassback: true },
  // gateOnUnmute:true gates the 98% (request waits for unmute); the 2%
  // experiment above ungates the sampled slice. Needed because
  // DEFAULT_STRATEGIES.gateOnUnmute is false, so without this the base would
  // ungate every load and the override would be a no-op.
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
