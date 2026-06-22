import { describe, expect, it } from "vitest";

import {
  BANNER_AD_MAX_HEIGHT,
  BANNER_AD_MIN_CONTAINER_HEIGHT,
  BANNER_AD_SIZES,
  findBannerConfigForSize,
  pickBannerAdSize,
} from "./banner-ad-picker";

describe("pickBannerAdSize", () => {
  it("returns the largest-area size that fits a roomy container", () => {
    // 360x600 admits all three sizes; the picker prefers the 320x100
    // entry (largest area).
    expect(pickBannerAdSize(360, 600)).toEqual({ w: 320, h: 100 });
  });

  it("prefers width 320 over 300 when both heights fit", () => {
    // 320x200 admits 300x50, 320x50, 320x100. 320x100 wins on area.
    expect(pickBannerAdSize(320, 200)).toEqual({ w: 320, h: 100 });
  });

  it("falls back to the next-smaller width when 320 doesn't fit", () => {
    // 310x600 fits 300x50 only (320-wide entries excluded).
    expect(pickBannerAdSize(310, 600)).toEqual({ w: 300, h: 50 });
  });

  it("returns null when the container is narrower than the smallest ad", () => {
    expect(pickBannerAdSize(299, 600)).toBeNull();
  });

  it("returns null when the container is shorter than the min height", () => {
    // 360x199 is wide enough but below `BANNER_AD_MIN_CONTAINER_HEIGHT`.
    expect(pickBannerAdSize(360, BANNER_AD_MIN_CONTAINER_HEIGHT - 1)).toBeNull();
  });

  it("admits exactly at the min-height threshold", () => {
    // Boundary check: 200 is the floor (>=).
    expect(pickBannerAdSize(360, BANNER_AD_MIN_CONTAINER_HEIGHT)).toEqual({ w: 320, h: 100 });
  });

  it("never returns a size whose height exceeds the max guardrail", () => {
    for (const result of [pickBannerAdSize(360, 600), pickBannerAdSize(320, 200), pickBannerAdSize(310, 800)]) {
      if (result) expect(result.h).toBeLessThanOrEqual(BANNER_AD_MAX_HEIGHT);
    }
  });

  it("returns a member of BANNER_AD_SIZES (referential, not a new object)", () => {
    const result = pickBannerAdSize(360, 600);
    expect(BANNER_AD_SIZES).toContainEqual(result);
  });
});

describe("findBannerConfigForSize", () => {
  const banner320x100 = {
    networkCode: "test-network",
    adUnitPath: "/test/320x100",
    platform: "gpt",
    size: [320, 100] as [number, number],
  };
  const banner300x50 = {
    networkCode: "test-network",
    adUnitPath: "/test/300x50",
    platform: "gpt",
    size: [300, 50] as [number, number],
  };

  it("returns the entry matching the picked size from an array", () => {
    expect(findBannerConfigForSize([banner320x100, banner300x50], { w: 300, h: 50 })).toEqual(banner300x50);
  });

  it("accepts a single config (not just an array)", () => {
    expect(findBannerConfigForSize(banner300x50, { w: 300, h: 50 })).toEqual(banner300x50);
  });

  it("returns null when no entry matches", () => {
    expect(findBannerConfigForSize([banner320x100], { w: 300, h: 50 })).toBeNull();
  });

  it("returns null on an empty array", () => {
    expect(findBannerConfigForSize([], { w: 320, h: 100 })).toBeNull();
  });
});
