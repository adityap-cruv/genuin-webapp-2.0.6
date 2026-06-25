import { describe, it, expect, vi, beforeEach } from "vitest";

import type { NormalisedAd } from "@cxr/types";

vi.mock("./normalizers", () => ({
  normalizeBannerConfig: vi.fn(),
  normalizeNativeConfig: vi.fn(),
  normalizeVideoConfig: vi.fn(),
}));

import { buildGenAdInitOptions } from "@cxr/ads/adConfig";
import { normalizeBannerConfig, normalizeNativeConfig, normalizeVideoConfig } from "@cxr/ads/normalizers";

const mockNormalizeBanner = normalizeBannerConfig as ReturnType<typeof vi.fn>;
const mockNormalizeNative = normalizeNativeConfig as ReturnType<typeof vi.fn>;
const mockNormalizeVideo = normalizeVideoConfig as ReturnType<typeof vi.fn>;

const BASE_AD: NormalisedAd = {
  kind: "ad",
  id: 0,
  active: true,
  videoUrl: null,
  videoType: null,
  audioAds: false,
  videoAds: false,
  videoAd: undefined,
  videoAdAdvertiserDetails: undefined,
  videoAdContentVideo: undefined,
  displayAd: undefined,
  nativeAd: undefined,
  videoPlatform: undefined,
  nativePlatform: undefined,
  displayPlatform: undefined,
  adUrl: undefined,
  gateOnUnmute: true,
};

describe("buildGenAdInitOptions", () => {
  beforeEach(() => {
    mockNormalizeBanner.mockReset();
    mockNormalizeNative.mockReset();
    mockNormalizeVideo.mockReset();
  });

  it("returns empty object when all ad descriptors are undefined", () => {
    mockNormalizeBanner.mockReturnValue(undefined);
    mockNormalizeNative.mockReturnValue(undefined);
    mockNormalizeVideo.mockReturnValue(undefined);

    const result = buildGenAdInitOptions(BASE_AD, [300, 250]);
    expect(result).toEqual({});
  });

  it("includes banner when normalizeBannerConfig returns a value", () => {
    const bannerCfg = {
      adUnitPath: "/123/unit",
      networkCode: "123",
      size: [300, 250] as [number, number],
      platform: "gam",
    };
    mockNormalizeBanner.mockReturnValue(bannerCfg);
    mockNormalizeNative.mockReturnValue(undefined);
    mockNormalizeVideo.mockReturnValue(undefined);

    const result = buildGenAdInitOptions(BASE_AD, [300, 250]);
    expect(result.banner).toBe(bannerCfg);
    expect(result.native).toBeUndefined();
    expect(result.video).toBeUndefined();
  });

  it("includes native when normalizeNativeConfig returns a value", () => {
    const nativeCfg = { adUnitPath: "/123/native", networkCode: "123", platform: "gam" };
    mockNormalizeBanner.mockReturnValue(undefined);
    mockNormalizeNative.mockReturnValue(nativeCfg);
    mockNormalizeVideo.mockReturnValue(undefined);

    const result = buildGenAdInitOptions(BASE_AD, [300, 250]);
    expect(result.native).toBe(nativeCfg);
    expect(result.banner).toBeUndefined();
  });

  it("includes video when normalizeVideoConfig returns a value", () => {
    const videoCfg = {
      vastUrl: "https://example.com/vast.xml",
      platform: "gen_video",
      audioLayout: "full_video" as const,
    };
    mockNormalizeBanner.mockReturnValue(undefined);
    mockNormalizeNative.mockReturnValue(undefined);
    mockNormalizeVideo.mockReturnValue(videoCfg);

    const result = buildGenAdInitOptions(BASE_AD, [300, 250]);
    expect(result.video).toBe(videoCfg);
  });

  it("includes all three when all normalizers return values", () => {
    const bannerCfg = {
      adUnitPath: "/123/unit",
      networkCode: "123",
      size: [300, 250] as [number, number],
      platform: "gam",
    };
    const nativeCfg = { adUnitPath: "/123/native", networkCode: "123", platform: "gam" };
    const videoCfg = {
      vastUrl: "https://example.com/vast.xml",
      platform: "gen_video",
      audioLayout: "full_video" as const,
    };
    mockNormalizeBanner.mockReturnValue(bannerCfg);
    mockNormalizeNative.mockReturnValue(nativeCfg);
    mockNormalizeVideo.mockReturnValue(videoCfg);

    const result = buildGenAdInitOptions(BASE_AD, [300, 250]);
    expect(result.banner).toBe(bannerCfg);
    expect(result.native).toBe(nativeCfg);
    expect(result.video).toBe(videoCfg);
  });

  it("passes bannerSize to normalizeBannerConfig", () => {
    mockNormalizeBanner.mockReturnValue(undefined);
    mockNormalizeNative.mockReturnValue(undefined);
    mockNormalizeVideo.mockReturnValue(undefined);

    buildGenAdInitOptions(BASE_AD, [320, 50]);
    expect(mockNormalizeBanner).toHaveBeenCalledWith(BASE_AD.displayAd, [320, 50]);
  });

  it("passes platform map to normalizeVideoConfig", () => {
    const ad: NormalisedAd = {
      ...BASE_AD,
      videoPlatform: "gen_video",
      displayPlatform: "gam",
      nativePlatform: "native_co",
    };
    mockNormalizeBanner.mockReturnValue(undefined);
    mockNormalizeNative.mockReturnValue(undefined);
    mockNormalizeVideo.mockReturnValue(undefined);

    buildGenAdInitOptions(ad, [300, 250]);
    expect(mockNormalizeVideo).toHaveBeenCalledWith(
      ad.videoAd,
      { video: "gen_video", banner: "gam", native: "native_co" },
      ad.videoAdAdvertiserDetails,
      ad.videoAdContentVideo
    );
  });
});
