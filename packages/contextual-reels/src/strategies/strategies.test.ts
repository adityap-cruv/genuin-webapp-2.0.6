/**
 * Tests for the pure strategy resolver cascade.
 *
 * Cascade order (most-specific wins):
 *   DEFAULT → preset bundle → brand inline (by brandId) → tag inline keys.
 */
import { describe, it, expect } from "vitest";

import {
  applyExperiment,
  resolveStrategies,
  isAdBreakEnabled,
  isGateOnUnmuteEnabled,
  isSingleHitWaterfallEnabled,
  isGenAiAllowed,
  isAdsDisabled,
  isMutePassbackEnabled,
  getInitialVolume,
  DEFAULT_STRATEGIES,
} from "@cxr/strategies/strategies";

// IDs migrated into TAG_STRATEGIES (see strategyConfig.ts).
const AD_BREAK_TAG = "6a391232d73aa25887ac2af3";
// Single-hit + mute-passback both ride on this tag (see strategyConfig.ts).
const SINGLE_HIT_TAG = "69b298e3d6a6ad57e7b9a464";
const MUTE_PASSBACK_TAG = "69b298e3d6a6ad57e7b9a464";
const UNKNOWN_TAG = "aaaabbbbccccdddd11112222";
// Configured with initialVolume: 0.2 (see strategyConfig.ts).
const INITIAL_VOLUME_TAG = "6a2fefd87ce338c3a5afc605";
// Tags with the 2% mute-passback-suppression experiment (see TAG_EXPERIMENTS).
const EXPERIMENT_TAG = "6a032e34054c8fcb08582510";

describe("strategies/resolveStrategies — cascade", () => {
  it("returns all-off defaults for an unknown tag", () => {
    expect(resolveStrategies(UNKNOWN_TAG)).toEqual(DEFAULT_STRATEGIES);
  });

  it("returns all-off defaults for an empty tagId", () => {
    expect(resolveStrategies("")).toEqual(DEFAULT_STRATEGIES);
  });

  it("applies a migrated ad-break tag's inline keys", () => {
    const result = resolveStrategies(AD_BREAK_TAG);
    expect(result.adBreakEnabled).toBe(true);
    expect(result.gateOnUnmute).toBe(true);
    expect(result.genAiEnabled).toBe(false);
    expect(result.singleHitWaterfall).toBe(false);
  });

  it("applies a migrated single-hit tag", () => {
    expect(resolveStrategies(SINGLE_HIT_TAG).singleHitWaterfall).toBe(true);
  });

  it("defaults adsDisabled off", () => {
    expect(resolveStrategies(UNKNOWN_TAG).adsDisabled).toBe(false);
    expect(resolveStrategies(AD_BREAK_TAG).adsDisabled).toBe(false);
  });

  it("applies a migrated mute-passback tag", () => {
    expect(resolveStrategies(MUTE_PASSBACK_TAG).mutePassback).toBe(true);
  });

  it("defaults initialVolume to 0", () => {
    expect(resolveStrategies(UNKNOWN_TAG).initialVolume).toBe(0);
    expect(resolveStrategies("").initialVolume).toBe(0);
  });

  it("applies a tag's configured initialVolume", () => {
    expect(resolveStrategies(INITIAL_VOLUME_TAG).initialVolume).toBe(0.2);
  });
});

describe("strategies/resolveStrategies — brand layer", () => {
  const PINK_BRAND_ID = 3252;

  it("applies the brand's compactBackgroundColor when brandId matches", () => {
    expect(resolveStrategies(UNKNOWN_TAG, PINK_BRAND_ID).compactBackgroundColor).toBe("#EC298C");
  });

  it("leaves compactBackgroundColor undefined for an unconfigured brandId", () => {
    expect(resolveStrategies(UNKNOWN_TAG, 1).compactBackgroundColor).toBeUndefined();
  });

  it("leaves compactBackgroundColor undefined when brandId is omitted", () => {
    expect(resolveStrategies(UNKNOWN_TAG).compactBackgroundColor).toBeUndefined();
  });

  it("tag inline keys still win over the brand layer", () => {
    // AD_BREAK_TAG has no compactBackgroundColor override, so brand wins here;
    // this documents cascade order rather than exercising an override.
    const result = resolveStrategies(AD_BREAK_TAG, PINK_BRAND_ID);
    expect(result.compactBackgroundColor).toBe("#EC298C");
    expect(result.adBreakEnabled).toBe(true);
  });
});

describe("strategies/applyExperiment — 2% mute-passback suppression", () => {
  it("leaves strategies unchanged for a tag with no experiment", () => {
    const base = resolveStrategies(AD_BREAK_TAG);
    // Even a roll of 0 (always-in-bucket) is a no-op when the tag has no experiment.
    expect(applyExperiment(base, AD_BREAK_TAG, 0)).toEqual(base);
  });

  it("suppresses mutePassback when the roll lands in the 2% bucket", () => {
    const base = resolveStrategies(EXPERIMENT_TAG);
    expect(base.mutePassback).toBe(true);
    // roll < 0.02 → in bucket.
    const result = applyExperiment(base, EXPERIMENT_TAG, 0.01);
    expect(result.mutePassback).toBe(false);
    // Other flags are untouched.
    expect(result.singleHitWaterfall).toBe(base.singleHitWaterfall);
  });

  it("keeps mutePassback for the 98% outside the bucket", () => {
    const base = resolveStrategies(EXPERIMENT_TAG);
    // roll >= 0.02 → not in bucket.
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.02).mutePassback).toBe(true);
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.5).mutePassback).toBe(true);
  });

  it("skips the experiment when skip is true, even for an in-bucket roll", () => {
    const base = resolveStrategies(EXPERIMENT_TAG);
    // roll 0.01 would normally be in the 2% bucket; skip=true forces base.
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.01, true)).toEqual(base);
  });
});

describe("strategies — backward-compatible predicates", () => {
  it("isAdBreakEnabled mirrors the resolver", () => {
    expect(isAdBreakEnabled(AD_BREAK_TAG)).toBe(true);
    expect(isAdBreakEnabled(UNKNOWN_TAG)).toBe(false);
    expect(isAdBreakEnabled("")).toBe(false);
  });

  it("isGateOnUnmuteEnabled mirrors the resolver", () => {
    expect(isGateOnUnmuteEnabled(AD_BREAK_TAG)).toBe(true);
    expect(isGateOnUnmuteEnabled(UNKNOWN_TAG)).toBe(false);
  });

  it("isSingleHitWaterfallEnabled mirrors the resolver", () => {
    expect(isSingleHitWaterfallEnabled(SINGLE_HIT_TAG)).toBe(true);
    expect(isSingleHitWaterfallEnabled(UNKNOWN_TAG)).toBe(false);
  });

  it("isGenAiAllowed is false everywhere (no genAi tags configured)", () => {
    expect(isGenAiAllowed(AD_BREAK_TAG)).toBe(false);
    expect(isGenAiAllowed("")).toBe(false);
  });

  it("isAdsDisabled mirrors the resolver (off by default)", () => {
    expect(isAdsDisabled(UNKNOWN_TAG)).toBe(false);
    expect(isAdsDisabled(AD_BREAK_TAG)).toBe(false);
    expect(isAdsDisabled("")).toBe(false);
  });

  it("isMutePassbackEnabled mirrors the resolver", () => {
    expect(isMutePassbackEnabled(MUTE_PASSBACK_TAG)).toBe(true);
    expect(isMutePassbackEnabled(UNKNOWN_TAG)).toBe(false);
    expect(isMutePassbackEnabled("")).toBe(false);
  });

  it("getInitialVolume mirrors the resolver (0 by default)", () => {
    expect(getInitialVolume(INITIAL_VOLUME_TAG)).toBe(0.2);
    expect(getInitialVolume(UNKNOWN_TAG)).toBe(0);
    expect(getInitialVolume("")).toBe(0);
  });
});
