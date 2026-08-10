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
import { BRAND_STRATEGIES, STRATEGY_PRESETS, TAG_EXPERIMENTS, TAG_STRATEGIES } from "@cxr/strategies/strategyConfig";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/strategies");

/** Tag ids already warned about (unknown-tag drift), so the warning fires once each. */
const warnedUnknownTags = new Set<string>();

/** sessionStorage key prefix for the per-tag experiment roll (see {@link getExperimentRoll}). */
const EXP_ROLL_KEY_PREFIX = "cxr:exp-roll:";

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
  /**
   * Compact-layout backdrop color override (hex). Takes precedence over the
   * backend-supplied `tagDetails.brand_color` when set — use for tags that need
   * a fixed brand color regardless of backend config. `undefined` defers to
   * `tagDetails.brand_color` (see {@link VideoLayout}).
   */
  compactBackgroundColor: string | undefined;
  /**
   * Whether the active slide autoplays on mount/activation. Defaults to `false`.
   * Also gates the GenAd request (see {@link useGenAdInstance}).
   */
  autoplayEnabled: boolean;
  /**
   * Static AD-only tag. Serves committed per-tag tag-config + feed fixtures (from
   * `STATIC_TAG_DATA`) and skips `/ad_creative` and `/feed`. `/ip_info` still
   * fires — geoip stays on analytics and supplies the real client IP for the
   * ad-URL rewrite. The ad URL is rewritten client-side: real
   * `navigator.userAgent` for `ua`, `[PAGE_URL]` resolved, and the `ip` param
   * replaced with the real client IP (stripped only when geoip is unavailable).
   * Defaults to `false`.
   */
  servedStatically: boolean;
  /**
   * Whether the feed wraps from the last slide back to the first. Defaults to
   * `true` (Embla's long-standing behaviour — an ads-only feed replays its
   * filled slots indefinitely). Set `false` per-tag to make the feed finite:
   * the last slide becomes a hard stop, so `autoAdvance`/`goNext` on the final
   * entry is a no-op and the widget rests there instead of returning to slide 0.
   *
   * Only affects navigation. It does not change ad requests — `singleHitWaterfall`
   * already prevents a looped-back slot from re-requesting.
   */
  feedLoopEnabled: boolean;
  /**
   * Viewport visibility gate: hold the feed render until the widget is actually
   * on screen, pass the impression back if it never gets there, and tear the
   * widget down if it leaves the viewport after rendering. Defaults to `false`.
   *
   * When on, the feed shows the skeleton instead of mounting `Feed` until the
   * unit intersects the viewport. If it stays hidden for
   * {@link visibilityGateTimeoutMs}, the whole placement is passed back with
   * `passback_reason: "unit_hidden"`. After a first visibility, `unit_hidden` can
   * never fire — a later hide destroys the widget silently instead.
   *
   * Distinct from {@link gateOnUnmute} and {@link mutePassback}, which gate on
   * *audio* engagement: this one gates on whether the unit exists on screen at all.
   */
  visibilityGate: boolean;
  /**
   * How long the unit may stay hidden before {@link visibilityGate} passes the
   * placement back, in milliseconds. Measured from the gate's first effect commit
   * (i.e. once the tag config has resolved and the feed is otherwise ready to
   * render), not from script load. Ignored unless {@link visibilityGate} is on.
   */
  visibilityGateTimeoutMs: number;
  /**
   * Once {@link visibilityGate} has rendered the unit at least once, a later hide
   * tears it down (no passback) only when this is `true`. Defaults to `false` —
   * once visible, the unit stays up regardless of subsequent visibility. Ignored
   * unless {@link visibilityGate} is on.
   */
  destroyOnHide: boolean;
  /**
   * Analytics events to suppress for this tag — a per-tag drop list checked at
   * the single `AnalyticsProvider.sendEvent` choke point. Each string is matched
   * verbatim against the event name passed to `sendEvent` (the `EVENT` value,
   * e.g. `"Video Watch"`, NOT the `EVENT.VIDEO_WATCH` constant name). Any listed
   * event is dropped before it reaches the Rudderstack buffer; everything else
   * emits unchanged. Defaults to `[]` (suppress nothing).
   *
   * Use to trim analytics volume for tags whose experience makes certain events
   * meaningless — e.g. a 320×50 ads-only interstitial has no scrollable feed, so
   * `Scroll`/`Swipe *`/`Feed Completed` carry no signal. Never list revenue-funnel
   * events (`Ad Requested`/`Ad Impression`/`Ad Passback`/`Tag Displayed`, …) —
   * dropping them silently corrupts fill/impression tracking.
   */
  suppressedEvents: readonly string[];
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
  mutePassbackDelayMs: 5000,
  initialVolume: 0,
  compactBackgroundColor: undefined,
  autoplayEnabled: false,
  // Exception to "every feature is off": loop is the pre-existing behaviour for
  // every tag, so the safe default is on. Only an explicit per-tag `false` opts out.
  feedLoopEnabled: true,
  servedStatically: false,
  visibilityGate: false,
  visibilityGateTimeoutMs: 30_000,
  destroyOnHide: false,
  suppressedEvents: [],
};

/**
 * Resolve all feature decisions for a tag across four layers (most-specific wins):
 *   DEFAULT_STRATEGIES → preset bundle → brand inline (by `brandId`) → tag inline keys.
 *
 * Pure and total: an unknown or empty `tagId`/`brandId` falls through to
 * {@link DEFAULT_STRATEGIES}; never throws.
 *
 * @param tagId    Active tag id — keys into {@link TAG_STRATEGIES}.
 * @param brandId  Active tag's `brand_id` (from `tagDetails`) — keys into
 *                 {@link BRAND_STRATEGIES}. Omit when unresolved yet.
 */
export function resolveStrategies(tagId: string, brandId?: number): Strategies {
  const tagConfig = TAG_STRATEGIES[tagId];
  // Warn once on an unknown tag: it silently falls back to all-safeguards-off, so surface
  // the config drift. Empty tagId is not a drift signal.
  if (!tagConfig && tagId && !warnedUnknownTags.has(tagId)) {
    warnedUnknownTags.add(tagId);
    logger.warn(`unknown tag ${tagId} — falling back to DEFAULT_STRATEGIES (all safeguards off)`);
  }
  const { preset, ...tagOverrides } = tagConfig ?? {};
  return {
    ...DEFAULT_STRATEGIES,
    ...(preset ? STRATEGY_PRESETS[preset] : {}),
    ...(brandId !== undefined ? BRAND_STRATEGIES[brandId] : {}),
    ...tagOverrides,
  };
}

/**
 * Draw (or recall) the experiment bucket roll for a tag, persisted in `sessionStorage`
 * so the bucket stays stable across reloads (see {@link applyExperiment}). Falls back to
 * a fresh unpersisted draw when storage is unavailable (SSR / privacy mode); never throws.
 *
 * @param tagId Active tag id — keys the persisted roll.
 * @returns A number in `[0, 1)`.
 */
export function getExperimentRoll(tagId: string): number {
  const key = `${EXP_ROLL_KEY_PREFIX}${tagId}`;
  try {
    const stored = window.sessionStorage.getItem(key);
    if (stored !== null) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed < 1) return parsed;
    }
    const roll = Math.random();
    window.sessionStorage.setItem(key, String(roll));
    return roll;
  } catch {
    // sessionStorage blocked / SSR — behave like a normal (unpersisted) roll.
    return Math.random();
  }
}

/**
 * Apply a tag's traffic experiment (if any) on top of its resolved strategies.
 *
 * Pure and total: `roll` and `skip` are caller-supplied (the random draw and
 * crawler detection live in {@link StrategyProvider}, not here, so this stays
 * testable). The load is in the experiment bucket when `roll < sampleRate`; only
 * then are the experiment's `overrides` applied. Tags with no experiment, a roll
 * outside the bucket, or `skip = true` return `base` unchanged.
 *
 * @param base   Resolved strategies from {@link resolveStrategies}.
 * @param tagId  Active tag id — keys into {@link TAG_EXPERIMENTS}.
 * @param roll   Random draw in `[0, 1)` for this page load.
 * @param skip   Skip the experiment entirely (e.g. ad-verification crawlers) —
 *               the load then behaves like the un-sampled majority.
 */
export function applyExperiment(base: Strategies, tagId: string, roll: number, skip = false): Strategies {
  if (skip) return base;
  const experiment = TAG_EXPERIMENTS[tagId];
  if (!experiment || roll >= experiment.sampleRate) return base;
  return { ...base, ...experiment.overrides };
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

/**
 * Clear the one-time unknown-tag warning set. For test isolation only.
 * @internal
 */
export function __resetWarningsForTesting(): void {
  warnedUnknownTags.clear();
}

/** Returns the compact-backdrop color override (hex) for the given tag, if any. */
export function getCompactBackgroundColor(tagId: string): string | undefined {
  return resolveStrategies(tagId).compactBackgroundColor;
}

/** Returns whether the active slide should autoplay on mount/activation for the given tag. */
export function isAutoplayEnabled(tagId: string): boolean {
  return resolveStrategies(tagId).autoplayEnabled;
}

/** Returns whether the feed wraps last→first for the given tag. Defaults to `true`. */
export function isFeedLoopEnabled(tagId: string): boolean {
  return resolveStrategies(tagId).feedLoopEnabled;
}

/**
 * Returns the set of analytics event names suppressed for the given tag, ready
 * for O(1) membership checks at the `AnalyticsProvider.sendEvent` choke point.
 * Empty set when the tag suppresses nothing (the default).
 */
export function getSuppressedEvents(tagId: string): ReadonlySet<string> {
  return new Set(resolveStrategies(tagId).suppressedEvents);
}
