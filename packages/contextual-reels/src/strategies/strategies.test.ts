/**
 * Tests for the pure strategy resolver cascade.
 *
 * Cascade order (most-specific wins):
 *   DEFAULT → preset bundle → tag inline keys.
 */
import { describe, it, expect } from "vitest";

import {
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
const AD_BREAK_TAG = "6a2fefd87ce338c3a5afc605";
// Single-hit + mute-passback both ride on this tag (see strategyConfig.ts).
const SINGLE_HIT_TAG = "69b298e3d6a6ad57e7b9a464";
const MUTE_PASSBACK_TAG = "69b298e3d6a6ad57e7b9a464";
const UNKNOWN_TAG = "aaaabbbbccccdddd11112222";
// Configured with initialVolume: 0.2 (see strategyConfig.ts).
const INITIAL_VOLUME_TAG = "6a032de445fa9f171bd291cb";

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
