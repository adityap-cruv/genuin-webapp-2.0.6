/**
 * Strategy layer — resolves per-tag feature decisions by cascading config layers.
 *
 * A "strategy" answers one question per feature: is it on for this tag? Values
 * cascade most-specific-wins across three layers:
 *   DEFAULT_STRATEGIES → preset bundle → tag inline.
 *
 * All configurable values live in {@link STRATEGY_PRESETS} and
 * {@link TAG_STRATEGIES} (strategyConfig.ts) — the single place to manage
 * behaviour. To add a feature toggle, extend {@link Strategies} and give it a
 * default here; consumers read it through {@link resolveStrategies} unchanged.
 */
import { STRATEGY_PRESETS, TAG_STRATEGIES } from "@cxr/strategies/strategyConfig";

/** Resolved feature decisions for the active tag. */
export interface Strategies {
  /** GenAI Octo experience is available for this tag. */
  genAiEnabled: boolean;
  /** Fullscreen ad break fires on organic reel playback for this tag. */
  adBreakEnabled: boolean;
  /**
   * Default value for `NormalisedAd.gateOnUnmute` when the backend does not
   * supply an explicit `gate_on_unmute` on the ad config.
   */
  gateOnUnmute: boolean;
  /** Fill/no-fill waterfall callbacks are suppressed after the first per page load. */
  singleHitWaterfall: boolean;
  /**
   * Hard kill switch: no ads are ever shown for this tag, even when the backend
   * returns ad entries. Standalone ad slides are dropped from the feed and the
   * fullscreen ad break is stripped from organic reels. Overrides
   * {@link adBreakEnabled}.
   */
  adsDisabled: boolean;
  /**
   * Mute-passback gate: when the first video starts playing, start a timer (see
   * {@link mutePassbackDelayMs}); if the user has not unmuted before it fires,
   * trigger an ad passback (`onAdFail`). Distinct from {@link gateOnUnmute},
   * which suppresses the ad *request* while muted rather than passing the slot back.
   */
  mutePassback: boolean;
  /**
   * Delay in milliseconds before the {@link mutePassback} timer fires, measured
   * from the first `player:play`. Ignored unless {@link mutePassback} is on.
   */
  mutePassbackDelayMs: number;
  /**
   * Volume (0..1) the feed starts at on first load. Defaults to `0` — the player
   * plays unmuted but silent and shows the unmute prompt. Set per-tag (e.g.
   * `0.2`) to start with sound. A browser autoplay block (`NotAllowedError`)
   * snaps it back to 0; the user can unmute from there.
   */
  initialVolume: number;
}

/**
 * Safe defaults used when no {@link StrategyProvider} is mounted (e.g. a leaf
 * component rendered in isolation) and as the base of the cascade. Every feature
 * is off.
 */
export const DEFAULT_STRATEGIES: Strategies = {
  genAiEnabled: false,
  adBreakEnabled: false,
  gateOnUnmute: false,
  singleHitWaterfall: false,
  adsDisabled: false,
  mutePassback: false,
  mutePassbackDelayMs: 3000,
  // 0% by default: plays unmuted-but-silent and shows the unmute prompt.
  initialVolume: 0,
};

/**
 * Resolve all feature decisions for a tag across three layers (most-specific wins):
 *   DEFAULT_STRATEGIES → preset bundle → tag inline keys.
 *
 * Pure and total: an unknown or empty `tagId` falls through to
 * {@link DEFAULT_STRATEGIES}; never throws.
 */
export function resolveStrategies(tagId: string): Strategies {
  const { preset, ...tagOverrides } = TAG_STRATEGIES[tagId] ?? {};
  return {
    ...DEFAULT_STRATEGIES,
    ...(preset ? STRATEGY_PRESETS[preset] : {}),
    ...tagOverrides,
  };
}

// ─── Backward-compatible per-feature predicates ─────────────────────────────────
// Thin wrappers over the resolver so existing @cxr/config callers keep working.

/** Returns whether the GenAI experience is enabled for the given tag. */
export function isGenAiAllowed(tagId: string): boolean {
  return resolveStrategies(tagId).genAiEnabled;
}

/** Returns whether the ad break is enabled for the given tag. */
export function isAdBreakEnabled(tagId: string): boolean {
  return resolveStrategies(tagId).adBreakEnabled;
}

/** Returns whether ad requests should be gated on unmute for the given tag. */
export function isGateOnUnmuteEnabled(tagId: string): boolean {
  return resolveStrategies(tagId).gateOnUnmute;
}

/** Returns whether fill/no-fill callbacks should be suppressed after the first. */
export function isSingleHitWaterfallEnabled(tagId: string): boolean {
  return resolveStrategies(tagId).singleHitWaterfall;
}

/** Returns whether all ads are suppressed for the given tag (hard kill switch). */
export function isAdsDisabled(tagId: string): boolean {
  return resolveStrategies(tagId).adsDisabled;
}

/** Returns whether the mute-passback behaviour is enabled for the given tag. */
export function isMutePassbackEnabled(tagId: string): boolean {
  return resolveStrategies(tagId).mutePassback;
}

/** Returns the initial feed volume (0..1) for the given tag. */
export function getInitialVolume(tagId: string): number {
  return resolveStrategies(tagId).initialVolume;
}
