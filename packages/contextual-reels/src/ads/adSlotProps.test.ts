/**
 * Tests for `genAdSlotAdProps` — the projection from a `NormalisedAd` onto the
 * props `GenAdSlot` hands to the GenAd SDK.
 *
 * Worth a direct test despite `src/ads/**` already sitting at 100% via other
 * files' tests: this function is a pure field mapping, so the failure mode is a
 * *silently wrong* wire-up (banner platform landing in `video`, `gateOnUnmute`
 * dropped) rather than a crash. Coverage cannot see that; assertions can.
 */
import { describe, it, expect } from "vitest";

import { genAdSlotAdProps } from "@cxr/ads/adSlotProps";
import type { NormalisedAd } from "@cxr/types";

/** A fully-populated ad, so every field has a distinguishable value. */
function makeAd(overrides: Partial<NormalisedAd> = {}): NormalisedAd {
  return {
    kind: "ad",
    id: 7,
    active: true,
    videoUrl: null,
    videoType: null,
    audioAds: true,
    videoAds: false,
    videoAd: { ads_url: "https://example.test/vast" },
    videoAdAdvertiserDetails: { logo: "logo.png", primaryColor: "#ff0000" },
    videoAdContentVideo: { url: "c.mp4", autoplay: true, loop: false, muted: true, objectFit: "cover" },
    displayAd: { banner: 1 },
    nativeAd: { native: 1 },
    videoPlatform: "triton",
    nativePlatform: "nativeco",
    displayPlatform: "bannerco",
    adUrl: "https://example.test/ad",
    gateOnUnmute: true,
    ...overrides,
  } as NormalisedAd;
}

describe("ads/genAdSlotAdProps", () => {
  it("maps every payload field through unchanged", () => {
    const ad = makeAd();
    const props = genAdSlotAdProps(ad);

    expect(props.isAudioAds).toBe(true);
    expect(props.displayAd).toBe(ad.displayAd);
    expect(props.nativeAd).toBe(ad.nativeAd);
    expect(props.videoAd).toBe(ad.videoAd);
    expect(props.videoAdAdvertiserDetails).toBe(ad.videoAdAdvertiserDetails);
    expect(props.videoAdContentVideo).toBe(ad.videoAdContentVideo);
    expect(props.gateOnUnmute).toBe(true);
  });

  // The platforms object re-keys three separately-named fields. Crossing two of
  // them would send the wrong vendor for a slot and is invisible to coverage.
  it("re-keys the three platform fields without crossing them", () => {
    const props = genAdSlotAdProps(makeAd());
    expect(props.platforms).toEqual({ video: "triton", native: "nativeco", banner: "bannerco" });
  });

  it("carries undefined platforms through as undefined rather than dropping the key", () => {
    const props = genAdSlotAdProps(
      makeAd({ videoPlatform: undefined, nativePlatform: undefined, displayPlatform: undefined })
    );
    expect(props.platforms).toEqual({ video: undefined, native: undefined, banner: undefined });
  });

  it("reflects a false gateOnUnmute rather than defaulting it back on", () => {
    expect(genAdSlotAdProps(makeAd({ gateOnUnmute: false })).gateOnUnmute).toBe(false);
  });

  it("reflects a video (non-audio) ad", () => {
    expect(genAdSlotAdProps(makeAd({ audioAds: false })).isAudioAds).toBe(false);
  });

  it("is pure — it does not mutate the ad it is given", () => {
    const ad = makeAd();
    const snapshot = JSON.stringify(ad);
    genAdSlotAdProps(ad);
    expect(JSON.stringify(ad)).toBe(snapshot);
  });

  it("projects only the documented keys (no accidental passthrough of adUrl/id)", () => {
    const props = genAdSlotAdProps(makeAd());
    expect(Object.keys(props).sort()).toEqual(
      [
        "displayAd",
        "gateOnUnmute",
        "isAudioAds",
        "nativeAd",
        "platforms",
        "videoAd",
        "videoAdAdvertiserDetails",
        "videoAdContentVideo",
      ].sort()
    );
  });
});
