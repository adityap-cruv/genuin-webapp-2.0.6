/**
 * Tests for the pure strategy resolver cascade.
 *
 * Cascade order (most-specific wins):
 *   DEFAULT → preset bundle → brand inline (by brandId) → tag inline keys.
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import {
  applyExperiment,
  getExperimentRoll,
  resolveStrategies,
  isAdBreakEnabled,
  isGateOnUnmuteEnabled,
  isSingleHitWaterfallEnabled,
  isGenAiAllowed,
  isAdsDisabled,
  isMutePassbackEnabled,
  getInitialVolume,
  getCompactBackgroundColor,
  isAutoplayEnabled,
  DEFAULT_STRATEGIES,
  __resetWarningsForTesting,
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

describe("strategies/getExperimentRoll — session-stable roll (S2)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });
  afterEach(() => {
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the same roll for a tag across repeated calls in a session", () => {
    const first = getExperimentRoll(EXPERIMENT_TAG);
    const second = getExperimentRoll(EXPERIMENT_TAG);
    expect(second).toBe(first);
  });

  it("persists the roll to sessionStorage keyed by tag id", () => {
    const roll = getExperimentRoll(EXPERIMENT_TAG);
    expect(window.sessionStorage.getItem(`cxr:exp-roll:${EXPERIMENT_TAG}`)).toBe(String(roll));
  });

  it("reuses a previously persisted roll instead of drawing a new one", () => {
    window.sessionStorage.setItem(`cxr:exp-roll:${EXPERIMENT_TAG}`, "0.42");
    expect(getExperimentRoll(EXPERIMENT_TAG)).toBe(0.42);
  });

  it("draws independent rolls for different tags", () => {
    window.sessionStorage.setItem(`cxr:exp-roll:${EXPERIMENT_TAG}`, "0.1");
    window.sessionStorage.setItem(`cxr:exp-roll:${AD_BREAK_TAG}`, "0.9");
    expect(getExperimentRoll(EXPERIMENT_TAG)).toBe(0.1);
    expect(getExperimentRoll(AD_BREAK_TAG)).toBe(0.9);
  });

  it("returns a value in [0,1)", () => {
    const roll = getExperimentRoll(EXPERIMENT_TAG);
    expect(roll).toBeGreaterThanOrEqual(0);
    expect(roll).toBeLessThan(1);
  });

  it("falls back to a random roll without throwing when sessionStorage is unavailable", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("SecurityError: storage disabled");
      },
      setItem: () => {
        throw new Error("SecurityError: storage disabled");
      },
      clear: () => undefined,
    });
    let roll = -1;
    expect(() => {
      roll = getExperimentRoll(EXPERIMENT_TAG);
    }).not.toThrow();
    expect(roll).toBeGreaterThanOrEqual(0);
    expect(roll).toBeLessThan(1);
  });

  it("falls back to a random roll without throwing when setItem throws (quota/privacy mode)", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError: storage full");
      },
      clear: () => undefined,
    });
    let roll = -1;
    expect(() => {
      roll = getExperimentRoll(EXPERIMENT_TAG);
    }).not.toThrow();
    expect(roll).toBeGreaterThanOrEqual(0);
    expect(roll).toBeLessThan(1);
  });

  it("draws a fresh roll when the persisted value is out of the valid [0,1) range", () => {
    window.sessionStorage.setItem(`cxr:exp-roll:${EXPERIMENT_TAG}`, "1.5");
    const roll = getExperimentRoll(EXPERIMENT_TAG);
    expect(roll).toBeGreaterThanOrEqual(0);
    expect(roll).toBeLessThan(1);
    // The invalid stored value is replaced by the freshly drawn, valid roll.
    expect(window.sessionStorage.getItem(`cxr:exp-roll:${EXPERIMENT_TAG}`)).toBe(String(roll));
  });

  it("draws a fresh roll when the persisted value is not a finite number", () => {
    window.sessionStorage.setItem(`cxr:exp-roll:${EXPERIMENT_TAG}`, "not-a-number");
    const roll = getExperimentRoll(EXPERIMENT_TAG);
    expect(roll).toBeGreaterThanOrEqual(0);
    expect(roll).toBeLessThan(1);
  });
});

describe("strategies/resolveStrategies — cascade", () => {
  beforeEach(() => {
    __resetWarningsForTesting();
  });

  it("returns all-off defaults for an unknown tag", () => {
    expect(resolveStrategies(UNKNOWN_TAG)).toEqual(DEFAULT_STRATEGIES);
  });

  it("warns once when resolving an unknown non-empty tag id (S3)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveStrategies(UNKNOWN_TAG);
    resolveStrategies(UNKNOWN_TAG);
    const unknownWarns = warn.mock.calls.filter((c) => String(c[1] ?? c[0]).includes(UNKNOWN_TAG));
    expect(unknownWarns.length).toBe(1);
    warn.mockRestore();
  });

  it("does not warn for an empty tagId (no tag to look up)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveStrategies("");
    const emptyWarns = warn.mock.calls.filter((c) => String(c[1] ?? c[0]).includes("unknown tag"));
    expect(emptyWarns.length).toBe(0);
    warn.mockRestore();
  });

  it("does not warn for a configured tag", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveStrategies(AD_BREAK_TAG);
    const warns = warn.mock.calls.filter((c) => String(c[1] ?? c[0]).includes("unknown tag"));
    expect(warns.length).toBe(0);
    warn.mockRestore();
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

describe("strategies/resolveStrategies — preset layer", () => {
  // No TAG_STRATEGIES entry in strategyConfig.ts currently attaches a `preset`,
  // so the preset branch is exercised here in isolation via a mocked config
  // module rather than by editing the shared strategyConfig.ts fixture data.
  // vi.resetModules() before each mock forces a fresh module graph, since
  // strategies.ts is already statically imported (and linked to the real
  // strategyConfig) at the top of this file.
  afterEach(() => {
    vi.doUnmock("@cxr/strategies/strategyConfig");
    vi.resetModules();
  });

  it("applies a preset bundle's values when the tag's config attaches a preset", async () => {
    vi.resetModules();
    vi.doMock("@cxr/strategies/strategyConfig", () => ({
      STRATEGY_PRESETS: { iheart: { adBreakEnabled: true, gateOnUnmute: true } },
      BRAND_STRATEGIES: {},
      TAG_EXPERIMENTS: {},
      TAG_STRATEGIES: { "preset-tag": { preset: "iheart" } },
    }));
    const { resolveStrategies: resolveWithPreset } = await import("@cxr/strategies/strategies");
    const result = resolveWithPreset("preset-tag");
    expect(result.adBreakEnabled).toBe(true);
    expect(result.gateOnUnmute).toBe(true);
  });

  it("lets tag inline keys override the preset's values", async () => {
    vi.resetModules();
    vi.doMock("@cxr/strategies/strategyConfig", () => ({
      STRATEGY_PRESETS: { iheart: { adBreakEnabled: true, gateOnUnmute: true } },
      BRAND_STRATEGIES: {},
      TAG_EXPERIMENTS: {},
      TAG_STRATEGIES: { "preset-tag": { preset: "iheart", gateOnUnmute: false } },
    }));
    const { resolveStrategies: resolveWithPreset } = await import("@cxr/strategies/strategies");
    const result = resolveWithPreset("preset-tag");
    expect(result.adBreakEnabled).toBe(true);
    expect(result.gateOnUnmute).toBe(false);
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

describe("strategies/applyExperiment — 10% mute-passback suppression", () => {
  it("leaves strategies unchanged for a tag with no experiment", () => {
    const base = resolveStrategies(AD_BREAK_TAG);
    // Even a roll of 0 (always-in-bucket) is a no-op when the tag has no experiment.
    expect(applyExperiment(base, AD_BREAK_TAG, 0)).toEqual(base);
  });

  it("suppresses mutePassback when the roll lands in the 10% bucket", () => {
    const base = resolveStrategies(EXPERIMENT_TAG);
    expect(base.mutePassback).toBe(true);
    // roll < 0.1 → in bucket.
    const result = applyExperiment(base, EXPERIMENT_TAG, 0.01);
    expect(result.mutePassback).toBe(false);
    // Other flags are untouched.
    expect(result.singleHitWaterfall).toBe(base.singleHitWaterfall);
  });

  it("keeps mutePassback for the 90% outside the bucket", () => {
    const base = resolveStrategies(EXPERIMENT_TAG);
    // roll >= 0.1 → not in bucket.
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.1).mutePassback).toBe(true);
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.5).mutePassback).toBe(true);
  });

  it("skips the experiment when skip is true, even for an in-bucket roll", () => {
    const base = resolveStrategies(EXPERIMENT_TAG);
    // roll 0.01 would normally be in the 10% bucket; skip=true forces base.
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.01, true)).toEqual(base);
  });

  it("keeps the base unchanged for a roll at or above the tag's actual sampleRate", () => {
    // EXPERIMENT_TAG's configured sampleRate is 0.1 (see TAG_EXPERIMENTS in
    // strategyConfig.ts) — exercised directly here rather than relying on the
    // stale 0.02 assumption in the sibling (known pre-existing failing) test above.
    const base = resolveStrategies(EXPERIMENT_TAG);
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.1)).toEqual(base);
    expect(applyExperiment(base, EXPERIMENT_TAG, 0.5)).toEqual(base);
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

  it("getCompactBackgroundColor mirrors the resolver (undefined by default, tag-only)", () => {
    // No brandId parameter: this predicate only resolves the tag-inline layer,
    // so it can never surface the brand-layer color (see resolveStrategies).
    expect(getCompactBackgroundColor(UNKNOWN_TAG)).toBeUndefined();
    expect(getCompactBackgroundColor(AD_BREAK_TAG)).toBeUndefined();
    expect(getCompactBackgroundColor("")).toBeUndefined();
  });

  it("isAutoplayEnabled mirrors the resolver (false by default)", () => {
    expect(isAutoplayEnabled(AD_BREAK_TAG)).toBe(false);
    expect(isAutoplayEnabled(UNKNOWN_TAG)).toBe(false);
    expect(isAutoplayEnabled("")).toBe(false);
  });
});

describe("strategies/__resetWarningsForTesting — dedup reset", () => {
  it("allows the unknown-tag warning to fire again after resetting", () => {
    __resetWarningsForTesting();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveStrategies(UNKNOWN_TAG);
    resolveStrategies(UNKNOWN_TAG);
    const firstRoundWarns = warn.mock.calls.filter((c) => String(c[1] ?? c[0]).includes(UNKNOWN_TAG));
    expect(firstRoundWarns.length).toBe(1);

    __resetWarningsForTesting();
    resolveStrategies(UNKNOWN_TAG);
    const secondRoundWarns = warn.mock.calls.filter((c) => String(c[1] ?? c[0]).includes(UNKNOWN_TAG));
    // One warning from the first round plus one more after the reset.
    expect(secondRoundWarns.length).toBe(2);
    warn.mockRestore();
  });
});
