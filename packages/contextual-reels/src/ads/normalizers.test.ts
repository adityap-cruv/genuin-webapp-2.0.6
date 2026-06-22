/**
 * Tests for ad-pipeline normalizers — consolidated from:
 *   ads/normalizeBannerConfig.test.ts
 *   ads/normalizeNativeConfig.test.ts
 *   ads/normalizeVideoConfig.test.ts
 */
import { describe, it, expect } from "vitest";

import { normalizeBannerConfig, normalizeNativeConfig, normalizeVideoConfig } from "@cxr/ads/normalizers";

// ─── normalizeBannerConfig ────────────────────────────────────────────────────

describe("ads/normalizeBannerConfig", () => {
  it("returns undefined when displayAd is undefined", () => {
    expect(normalizeBannerConfig(undefined, [300, 250])).toBeUndefined();
  });

  it("returns undefined when displayAd is null", () => {
    expect(normalizeBannerConfig(null, [300, 250])).toBeUndefined();
  });

  it("maps a single ad object to a single BannerConfig", () => {
    const result = normalizeBannerConfig({ tag_id: "/123456/ad_unit", platform: "gam" }, [300, 250]);
    expect(result).toEqual({
      adUnitPath: "/123456/ad_unit",
      networkCode: "123456",
      size: [300, 250],
      platform: "gam",
    });
  });

  it("maps an array of ads to an array of BannerConfigs", () => {
    const input = [
      { tag_id: "/111/unit_a", platform: "gam" },
      { tag_id: "/222/unit_b", platform: "prebid" },
    ];
    const result = normalizeBannerConfig(input, [320, 50]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect((result as Array<{ adUnitPath: string }>)[0]?.adUnitPath).toBe("/111/unit_a");
    expect((result as Array<{ adUnitPath: string }>)[1]?.adUnitPath).toBe("/222/unit_b");
  });

  it("extracts networkCode as the second segment of the tag_id path", () => {
    const result = normalizeBannerConfig({ tag_id: "/9876/banner", platform: "" }, [300, 600]);
    expect((result as { networkCode: string })?.networkCode).toBe("9876");
  });

  it("sets networkCode to null when tag_id has no second segment", () => {
    const result = normalizeBannerConfig({ tag_id: "no-slash", platform: "" }, [300, 250]);
    expect((result as { networkCode: string | null })?.networkCode).toBeNull();
  });

  it("defaults platform to empty string when undefined", () => {
    const result = normalizeBannerConfig({ tag_id: "/1/u" }, [300, 250]);
    expect((result as { platform: string })?.platform).toBe("");
  });

  it("passes the bannerSize through unchanged", () => {
    const result = normalizeBannerConfig({ tag_id: "/1/u", platform: "x" }, [728, 90]);
    expect((result as { size: [number, number] })?.size).toEqual([728, 90]);
  });

  it("handles undefined tag_id gracefully", () => {
    const result = normalizeBannerConfig({ platform: "x" }, [300, 250]);
    expect((result as { adUnitPath: string })?.adUnitPath).toBe("");
    expect((result as { networkCode: string | null })?.networkCode).toBeNull();
  });
});

// ─── normalizeNativeConfig ────────────────────────────────────────────────────

describe("ads/normalizeNativeConfig", () => {
  it("returns undefined when nativeAd is undefined", () => {
    expect(normalizeNativeConfig(undefined)).toBeUndefined();
  });

  it("returns undefined when nativeAd is null", () => {
    expect(normalizeNativeConfig(null)).toBeUndefined();
  });

  it("maps a single native ad object to a NativeConfig", () => {
    const result = normalizeNativeConfig({ tag_id: "/100/native_unit", platform: "native-dsp" });
    expect(result).toEqual({
      adUnitPath: "/100/native_unit",
      networkCode: "100",
      platform: "native-dsp",
    });
  });

  it("maps an array of native ads to an array of NativeConfigs", () => {
    const input = [
      { tag_id: "/111/native_a", platform: "x" },
      { tag_id: "/222/native_b", platform: "y" },
    ];
    const result = normalizeNativeConfig(input);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect((result as Array<{ adUnitPath: string }>)[0]?.adUnitPath).toBe("/111/native_a");
  });

  it("sets networkCode to null when no second segment", () => {
    const result = normalizeNativeConfig({ tag_id: "flat-tag", platform: "" });
    expect((result as { networkCode: string | null })?.networkCode).toBeNull();
  });

  it("defaults platform to empty string when undefined", () => {
    const result = normalizeNativeConfig({ tag_id: "/1/n" });
    expect((result as { platform: string })?.platform).toBe("");
  });

  it("handles undefined tag_id gracefully", () => {
    const result = normalizeNativeConfig({ platform: "x" });
    expect((result as { adUnitPath: string })?.adUnitPath).toBe("");
    expect((result as { networkCode: string | null })?.networkCode).toBeNull();
  });
});

// ─── normalizeVideoConfig ─────────────────────────────────────────────────────

const advertiserDetails = { logo: "https://example.com/logo.png", primaryColor: "#FF0000" };
const contentVideo = {
  url: "https://example.com/v.mp4",
  autoplay: true,
  loop: true,
  muted: true,
  objectFit: "contain" as const,
};

describe("ads/normalizeVideoConfig", () => {
  it("returns undefined when videoAd is undefined", () => {
    expect(normalizeVideoConfig(undefined)).toBeUndefined();
  });

  it("returns undefined when videoAd is null", () => {
    expect(normalizeVideoConfig(null)).toBeUndefined();
  });

  it("maps a VAST URL string to a VideoConfig", () => {
    const result = normalizeVideoConfig("https://example.com/vast.xml");
    expect(result).toEqual({
      vastUrl: "https://example.com/vast.xml",
      platform: "",
      audioLayout: "full_video",
    });
  });

  it("uses platforms.video for platform when videoAd is a string", () => {
    const result = normalizeVideoConfig("https://example.com/vast.xml", { video: "gen_video" });
    expect((result as { platform: string })?.platform).toBe("gen_video");
  });

  it("spreads advertiserDetails from outer args", () => {
    const result = normalizeVideoConfig("https://example.com/vast.xml", undefined, advertiserDetails);
    expect((result as { advertiserDetails: typeof advertiserDetails })?.advertiserDetails).toEqual(advertiserDetails);
  });

  it("spreads contentVideo from outer args", () => {
    const result = normalizeVideoConfig("https://example.com/vast.xml", undefined, undefined, contentVideo);
    expect((result as { contentVideo: typeof contentVideo })?.contentVideo).toEqual(contentVideo);
  });

  it("maps an object with url field to a VideoConfig", () => {
    const result = normalizeVideoConfig({ url: "https://example.com/vast.xml", platform: "gam" });
    expect(result).toMatchObject({
      vastUrl: "https://example.com/vast.xml",
      platform: "gam",
      audioLayout: "full_video",
    });
  });

  it("reads ads_url when url is missing", () => {
    const result = normalizeVideoConfig({ ads_url: "https://example.com/v.xml" });
    expect((result as { vastUrl: string })?.vastUrl).toBe("https://example.com/v.xml");
  });

  it("reads vastUrl field from object", () => {
    const result = normalizeVideoConfig({ vastUrl: "https://example.com/v.xml" });
    expect((result as { vastUrl: string })?.vastUrl).toBe("https://example.com/v.xml");
  });

  it("filters out object entries with no URL", () => {
    const result = normalizeVideoConfig([
      { url: "https://example.com/v1.xml" },
      { platform: "x" }, // no url
      { url: "https://example.com/v2.xml" },
    ]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("maps an array of strings and objects", () => {
    const result = normalizeVideoConfig([
      "https://example.com/a.xml",
      { url: "https://example.com/b.xml", platform: "prebid" },
    ]);
    expect(Array.isArray(result)).toBe(true);
    expect((result as Array<{ vastUrl: string }>)[0]?.vastUrl).toBe("https://example.com/a.xml");
    expect((result as Array<{ vastUrl: string }>)[1]?.vastUrl).toBe("https://example.com/b.xml");
  });

  it("per-entry advertiserDetails override outer advertiserDetails", () => {
    const outerAdv = { logo: "outer.png", primaryColor: "#111" };
    const innerAdv = { logo: "inner.png", primaryColor: "#222" };
    const result = normalizeVideoConfig(
      { url: "https://example.com/v.xml", advertiserDetails: innerAdv },
      undefined,
      outerAdv
    );
    expect((result as { advertiserDetails: typeof innerAdv })?.advertiserDetails).toEqual(innerAdv);
  });

  it("per-entry contentVideo overrides outer contentVideo", () => {
    const outerCv = {
      url: "outer.mp4",
      autoplay: false,
      loop: false,
      muted: false,
      objectFit: "cover",
    };
    const innerCv = {
      url: "inner.mp4",
      autoplay: true,
      loop: true,
      muted: true,
      objectFit: "contain",
    };
    const result = normalizeVideoConfig(
      { url: "https://example.com/v.xml", contentVideo: innerCv },
      undefined,
      undefined,
      outerCv
    );
    expect((result as { contentVideo: typeof innerCv })?.contentVideo).toEqual(innerCv);
  });

  it("returns null-filtered array (all filtered → empty array)", () => {
    const result = normalizeVideoConfig([{ platform: "x" }, { platform: "y" }]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("returns undefined when single object has no URL", () => {
    const result = normalizeVideoConfig({ platform: "x" });
    expect(result).toBeUndefined();
  });

  it("uses empty string platform when neither object.platform nor platforms.video is set", () => {
    const result = normalizeVideoConfig({ url: "https://example.com/v.xml" });
    expect((result as { platform: string })?.platform).toBe("");
  });
});
