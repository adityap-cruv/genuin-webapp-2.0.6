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
 * Per-tag strategy config. Migrated from the former allowlist arrays:
 *   FULLSCREEN_AD_BREAK_ENABLED_TAG_IDS + GATE_ON_UNMUTE_TAG_IDS → adBreak + gateOnUnmute
 *   SINGLE_HIT_WATERFALL_TAG_IDS → singleHitWaterfall
 *   MUTE_PASSBACK_TAG_IDS → mutePassback
 *   GENAI_ENABLED_TAG_IDS was empty → no entries.
 */
export const TAG_STRATEGIES: Record<string, TagStrategyEntry> = {
  "6a3aa8244da8cd92d289cc72": { singleHitWaterfall: true, initialVolume: 0.2 },
  "6a2fefd87ce338c3a5afc605": { singleHitWaterfall: true, initialVolume: 0.2 },
  "6a391232d73aa25887ac2af3": { adBreakEnabled: true, gateOnUnmute: true },
  "69b298e3d6a6ad57e7b9a464": { singleHitWaterfall: true, mutePassback: true },
  "69b298f4d6a6ad57e7b9a499": { singleHitWaterfall: true, mutePassback: true },
  "6a032e34054c8fcb08582510": { singleHitWaterfall: true, mutePassback: true },
  "6a032de445fa9f171bd291cb": { singleHitWaterfall: true, mutePassback: true },
};
