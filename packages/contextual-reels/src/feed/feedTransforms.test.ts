/**
 * Tests for feedTransforms — consolidated from:
 *   utils/thumbnails.test.ts
 *   feed/transforms/staticAdCatalog.test.ts
 *   feed/transforms/injectStaticAds.test.ts
 *   feed/transforms/transformReelData.test.ts
 */
import { describe, expect, it } from "vitest";

import {
  replaceThumbnailUrlForSmallDimensions,
  replaceProfileImageUrlForSmallDimensions,
  STATIC_AD_CONFIGS,
  BLANK_HLS_URL,
  buildStaticAdItem,
  buildStaticAdEntry,
  staticAdConfigToReel,
  buildAdObject,
  buildReelAdObjectFromConfig,
  injectStaticAds,
  transformReelData,
  normaliseReel,
  normaliseAd,
  normaliseFeed,
  inferVideoAdPlatform,
  LAST_INDEX_NO_ADS_TAG_IDS,
} from "@cxr/feed/feedTransforms";
import type { Reel, TagResponse, ReelFeedItem, AdFeedItem, FeedItem, AdsConfig } from "@cxr/types";

// ─── Thumbnail URL helpers ────────────────────────────────────────────────────

describe("replaceThumbnailUrlForSmallDimensions", () => {
  it("inserts /s/ after /thumbnails/ in a valid URL", () => {
    const input = "https://example.com/thumbnails/image.jpg";
    expect(replaceThumbnailUrlForSmallDimensions(input)).toBe("https://example.com/thumbnails/s/image.jpg");
  });

  it("works with nested path after /thumbnails/", () => {
    const input = "https://cdn.example.com/thumbnails/2024/01/photo.png";
    expect(replaceThumbnailUrlForSmallDimensions(input)).toBe("https://cdn.example.com/thumbnails/s/2024/01/photo.png");
  });

  it("returns the original URL when /thumbnails/ is not present", () => {
    const input = "https://example.com/images/image.jpg";
    expect(replaceThumbnailUrlForSmallDimensions(input)).toBe(input);
  });

  it("returns the original value for null input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing JS callers
    expect(replaceThumbnailUrlForSmallDimensions(null as any)).toBe(null);
  });

  it("returns the original value for undefined input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing JS callers
    expect(replaceThumbnailUrlForSmallDimensions(undefined as any)).toBe(undefined);
  });

  it("returns the original value for non-string input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing JS callers
    expect(replaceThumbnailUrlForSmallDimensions(42 as any)).toBe(42);
  });

  it("returns original when /thumbnails/ appears more than once (>2 parts after split)", () => {
    // split('/thumbnails/') yields 3 parts → length !== 2 → fallback
    const input = "https://example.com/thumbnails/sub/thumbnails/image.jpg";
    expect(replaceThumbnailUrlForSmallDimensions(input)).toBe(input);
  });
});

describe("replaceProfileImageUrlForSmallDimensions", () => {
  it("inserts /s/ after /profile_images/ in a valid URL", () => {
    const input = "https://example.com/profile_images/image.jpg";
    expect(replaceProfileImageUrlForSmallDimensions(input)).toBe("https://example.com/profile_images/s/image.jpg");
  });

  it("works with nested path after /profile_images/", () => {
    const input = "https://cdn.example.com/profile_images/user/avatar.png";
    expect(replaceProfileImageUrlForSmallDimensions(input)).toBe(
      "https://cdn.example.com/profile_images/s/user/avatar.png"
    );
  });

  it("returns the original URL when /profile_images/ is not present", () => {
    const input = "https://example.com/avatars/user.jpg";
    expect(replaceProfileImageUrlForSmallDimensions(input)).toBe(input);
  });

  it("returns the original value for null input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing JS callers
    expect(replaceProfileImageUrlForSmallDimensions(null as any)).toBe(null);
  });

  it("returns the original value for undefined input", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing JS callers
    expect(replaceProfileImageUrlForSmallDimensions(undefined as any)).toBe(undefined);
  });

  it("returns original when /profile_images/ appears more than once", () => {
    const input = "https://example.com/profile_images/old/profile_images/img.jpg";
    expect(replaceProfileImageUrlForSmallDimensions(input)).toBe(input);
  });
});

// ─── Static ad catalog ────────────────────────────────────────────────────────

describe("STATIC_AD_CONFIGS", () => {
  it("has exactly 4 entries", () => {
    expect(STATIC_AD_CONFIGS).toHaveLength(4);
  });

  it("snapshot: locks all creative URLs", () => {
    expect(STATIC_AD_CONFIGS).toMatchSnapshot();
  });

  it("each entry has videoSource, adUrl, logo, primaryColor", () => {
    for (const cfg of STATIC_AD_CONFIGS) {
      expect(typeof cfg.videoSource).toBe("string");
      expect(cfg.videoSource.length).toBeGreaterThan(0);
      expect(typeof cfg.adUrl).toBe("string");
      expect(cfg.adUrl.length).toBeGreaterThan(0);
      expect(typeof cfg.logo).toBe("string");
      expect(cfg.logo.length).toBeGreaterThan(0);
      expect(typeof cfg.primaryColor).toBe("string");
      expect(cfg.primaryColor.length).toBeGreaterThan(0);
    }
  });

  it("primaryColor values are hex colour strings", () => {
    for (const cfg of STATIC_AD_CONFIGS) {
      expect(cfg.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("BLANK_HLS_URL", () => {
  it("is a valid HTTPS URL", () => {
    expect(BLANK_HLS_URL).toMatch(/^https:\/\//);
  });

  it("ends with .m3u8 (HLS manifest format)", () => {
    expect(BLANK_HLS_URL).toMatch(/\.m3u8$/);
  });

  it("is the expected S3 blank stream URL", () => {
    expect(BLANK_HLS_URL).toBe("https://reels-media.s3.us-east-2.amazonaws.com/static/blank_screen/300h/master.m3u8");
  });
});

// ─── Static ad injection ──────────────────────────────────────────────────────

function makeReel(id: number): ReelFeedItem {
  return {
    id,
    active: false,
    type: "reel",
    video_url: `https://example.com/${id}.m3u8`,
    video_type: "hls",
    thumb: null,
    user: null,
    community: null,
    cta: null,
    loop: null,
    og_details: null,
    owner: null,
    config: null,
  };
}

describe("buildStaticAdItem", () => {
  it('returns an AdFeedItem with type "ads"', () => {
    const item = buildStaticAdItem(0, 10);
    expect(item.type).toBe("ads");
  });

  it("cycles through the catalog (index % 4)", () => {
    const item0 = buildStaticAdItem(0, 0);
    const item4 = buildStaticAdItem(4, 4);
    expect(item0.video_ad).toBe(item4.video_ad);
    expect(item0.ad_url).toBe(item4.ad_url);
  });

  it("uses the globalIndex for the video.id field", () => {
    const item = buildStaticAdItem(0, 7);
    expect((item as AdFeedItem & { video: { id: string } }).video!.id).toBe("ad-7");
  });

  it("sets video_ad and ad_url to the catalog adUrl", () => {
    const item = buildStaticAdItem(1, 0);
    expect(item.video_ad).toContain("consumerserivce.xml");
    expect(item.ad_url).toContain("consumerserivce.xml");
  });

  it("sets videoAds true and audioAds false", () => {
    const item = buildStaticAdItem(0, 0);
    expect(item.videoAds).toBe(true);
    expect(item.audioAds).toBe(false);
  });

  it("sets video_type to hls", () => {
    const item = buildStaticAdItem(0, 0);
    expect(item.video_type).toBe("hls");
  });
});

describe("injectStaticAds", () => {
  it("returns empty array for empty feed", () => {
    expect(injectStaticAds([])).toEqual([]);
  });

  it("interleaves one reel with one static ad", () => {
    const feed: FeedItem[] = [makeReel(0)];
    const result = injectStaticAds(feed);
    expect(result).toHaveLength(2);
    expect(result[0]?.type).toBe("reel");
    expect(result[1]?.type).toBe("ads");
  });

  it("interleaves two reels with two static ads", () => {
    const feed: FeedItem[] = [makeReel(0), makeReel(1)];
    const result = injectStaticAds(feed);
    expect(result).toHaveLength(4);
    expect(result[0]?.type).toBe("reel");
    expect(result[1]?.type).toBe("ads");
    expect(result[2]?.type).toBe("reel");
    expect(result[3]?.type).toBe("ads");
  });

  it("reassigns ids 0..n after interleaving", () => {
    const feed: FeedItem[] = [makeReel(0), makeReel(1), makeReel(2)];
    const result = injectStaticAds(feed);
    result.forEach((item, i) => {
      expect(item.id).toBe(i);
    });
  });

  it("cycles catalog at index 4+", () => {
    const feed: FeedItem[] = Array.from({ length: 5 }, (_, i) => makeReel(i));
    const result = injectStaticAds(feed);
    // Static ads are at odd indices: 1, 3, 5, 7, 9
    const adItems = result.filter((item) => item.type === "ads") as AdFeedItem[];
    // 5th ad (index 4 in catalog) should cycle to catalog[0]
    const firstAd = adItems[0];
    const fifthAd = adItems[4];
    expect(fifthAd?.video_ad).toBe(firstAd?.video_ad);
  });

  it("total output length = 2 * input length", () => {
    const n = 7;
    const feed: FeedItem[] = Array.from({ length: n }, (_, i) => makeReel(i));
    const result = injectStaticAds(feed);
    expect(result).toHaveLength(n * 2);
  });
});

// ─── Reel data transform ──────────────────────────────────────────────────────

const baseTagDetails: TagResponse = {
  tag_id: "tag-123",
  customer_id: "cust-456",
} as TagResponse & { customer_id: string };

const baseVideoReel: Reel = {
  type: "reel",
  video_type: "hls",
  video: { id: "vid-1", url: "https://cdn.example.com/video.m3u8" },
  video_ad: undefined,
  audio_ad: undefined,
  owner: {
    profile_image: "https://cdn.example.com/profile_images/user.jpg",
    nickname: "Alice",
  },
  cta: { link: "https://cta.example.com", text: "Learn More" },
  community: { id: "comm-1" },
  loop: { id: "loop-1" },
  og_details: { title: "OG Title" },
  config: { autoplay: true },
} as unknown as Reel;

describe("LAST_INDEX_NO_ADS_TAG_IDS", () => {
  it("contains both expected tag IDs", () => {
    expect(LAST_INDEX_NO_ADS_TAG_IDS.has("67f0498997d4b55f87c9b01d")).toBe(true);
    expect(LAST_INDEX_NO_ADS_TAG_IDS.has("69846c0e6852c97693efad40")).toBe(true);
  });

  it("does not contain other IDs", () => {
    expect(LAST_INDEX_NO_ADS_TAG_IDS.has("unknown-tag")).toBe(false);
  });
});

describe("transformReelData — regular video reel", () => {
  it('sets type to "reel" for a non-ads, non-vast reel', () => {
    const reel: Reel = { ...baseVideoReel, type: "reel", video_type: "mp4" } as unknown as Reel;
    const result = transformReelData(reel, 0, baseTagDetails, false);
    expect(result.type).toBe("reel");
  });

  it("sets id and active correctly for index 0", () => {
    const result = transformReelData(baseVideoReel, 0, baseTagDetails, false);
    expect(result.id).toBe(0);
    expect(result.active).toBe(true);
  });

  it("sets active=false for index > 0", () => {
    const result = transformReelData(baseVideoReel, 3, baseTagDetails, false);
    expect(result.id).toBe(3);
    expect(result.active).toBe(false);
  });

  it("uses reel.video.url as video_url", () => {
    const result = transformReelData(baseVideoReel, 0, baseTagDetails, false);
    expect(result.video_url).toBe("https://cdn.example.com/video.m3u8");
  });

  it("has no ad_url for regular video", () => {
    const reel: Reel = { ...baseVideoReel, video_type: "mp4" } as unknown as Reel;
    const result = transformReelData(reel, 0, baseTagDetails, false);
    expect(result.ad_url).toBeUndefined();
  });

  it("passes through community, cta, loop, og_details, owner, config, video", () => {
    const result = transformReelData(baseVideoReel, 0, baseTagDetails, false);
    expect(result.community).toEqual({ id: "comm-1" });
    expect(result.cta).toEqual({ link: "https://cta.example.com", text: "Learn More" });
    expect(result.loop).toEqual({ id: "loop-1" });
    expect(result.og_details).toEqual({ title: "OG Title" });
    expect(result.config).toEqual({ autoplay: true });
  });

  it("rewrites thumbnail URL with small-dimensions helper", () => {
    const reel: Reel = {
      ...baseVideoReel,
      video: {
        url: "https://cdn.example.com/video.m3u8",
        thumbnail: "https://cdn.example.com/thumbnails/img.jpg",
      },
    } as unknown as Reel;
    const result = transformReelData(reel, 0, baseTagDetails, false);
    expect(result.thumb).toContain("/thumbnails/s/");
  });

  it("rewrites profile image URL with small-dimensions helper", () => {
    const result = transformReelData(baseVideoReel, 0, baseTagDetails, false);
    expect(result.user?.thumb).toContain("/profile_images/s/");
  });

  it("populates user.name and CTA fields", () => {
    const result = transformReelData(baseVideoReel, 0, baseTagDetails, false);
    expect(result.user?.name).toBe("Alice");
    expect(result.user?.ctaLink).toBe("https://cta.example.com");
    expect(result.user?.ctaCaption).toBe("Learn More");
    expect(result.user?.ctaColor).toBe("#0645ff");
  });

  it("sets video_ad_platform to reel.video.platform when not vast or ads", () => {
    const reel: Reel = {
      ...baseVideoReel,
      video: { ...baseVideoReel.video, platform: "youtube" },
    } as unknown as Reel;
    const result = transformReelData(reel, 0, baseTagDetails, false);
    expect(result.video_ad_platform).toBe("youtube");
  });

  it("sets display_ad and native_ad to undefined for non-ads", () => {
    const result = transformReelData(baseVideoReel, 0, baseTagDetails, false);
    expect(result.display_ad).toBeUndefined();
    expect(result.native_ad).toBeUndefined();
  });

  it("sets video_type to undefined for non-vast, non-video-ad reel", () => {
    const reel: Reel = { ...baseVideoReel, video_type: "mp4" } as unknown as Reel;
    const result = transformReelData(reel, 0, baseTagDetails, false);
    expect(result.video_type).toBeUndefined();
  });
});

describe("transformReelData — VAST reel (non-ads)", () => {
  const vastReel: Reel = {
    ...baseVideoReel,
    type: "reel",
    video_type: "vast",
    video_ad: undefined,
    audio_ad: undefined,
  } as unknown as Reel;

  it('sets type to "reel" for a VAST non-ads reel', () => {
    const result = transformReelData(vastReel, 0, baseTagDetails, false);
    expect(result.type).toBe("reel");
  });

  it("uses BLANK_HLS_URL as video_url", () => {
    const result = transformReelData(vastReel, 0, baseTagDetails, false);
    expect(result.video_url).toBe(BLANK_HLS_URL);
  });

  it("sets ad_url to the value returned by generateAdLink for VAST non-ads", () => {
    const result = transformReelData(vastReel, 0, baseTagDetails, false);
    expect(result.ad_url).toBe("https://programmatic-dsp.infytvcode.repl.co/vast");
  });

  it('sets video_ad_platform to "gen_video" for VAST non-ads', () => {
    const result = transformReelData(vastReel, 0, baseTagDetails, false);
    expect(result.video_ad_platform).toBe("gen_video");
  });

  it('sets video_type to "hls" for VAST type', () => {
    const result = transformReelData(vastReel, 0, baseTagDetails, false);
    expect(result.video_type).toBe("hls");
  });

  it("does not set display_ad or native_ad", () => {
    const result = transformReelData(vastReel, 0, baseTagDetails, false);
    expect(result.display_ad).toBeUndefined();
    expect(result.native_ad).toBeUndefined();
  });
});

describe("transformReelData — ads type with video_ad array", () => {
  const videoAdArray = [
    {
      url: "https://vast.example.com/ad.xml",
      platform: "ias",
      advertiserDetails: {
        logo: "https://cdn.example.com/logo.png",
        primaryColor: "#FF0000",
      },
      contentVideo: {
        url: "https://cdn.example.com/content.mp4",
        autoplay: true,
        loop: true,
        muted: true,
        objectFit: "contain",
      },
    },
  ];

  const adsReel: Reel = {
    type: "ads",
    video_type: undefined,
    video_ad: videoAdArray,
    audio_ad: undefined,
    display_ad: { type: "banner" },
    native_ad: { headline: "Buy Now" },
    owner: {
      profile_image: "https://cdn.example.com/profile_images/user.jpg",
      nickname: "Brand",
    },
    cta: { link: "https://brand.example.com", text: "Shop" },
    video: { url: "https://fallback.example.com/video.m3u8" },
    community: null,
    loop: null,
    og_details: null,
    config: null,
  } as unknown as Reel;

  it('sets type to "ads"', () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.type).toBe("ads");
  });

  it("sets videoAds = true when video_ad has content", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.videoAds).toBe(true);
  });

  it("uses BLANK_HLS_URL as video_url", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.video_url).toBe(BLANK_HLS_URL);
  });

  it("sets ad_url from firstVideoAd.url when array", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.ad_url).toBe("https://vast.example.com/ad.xml");
  });

  it("sets video_ad_advertiser_details when logo and color exist", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.video_ad_advertiser_details).toEqual({
      logo: "https://cdn.example.com/logo.png",
      primaryColor: "#FF0000",
    });
  });

  it("sets video_ad_content_video from firstVideoAd", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.video_ad_content_video).toEqual({
      url: "https://cdn.example.com/content.mp4",
      autoplay: true,
      loop: true,
      muted: true,
      objectFit: "contain",
    });
  });

  it("sets video_ad_platform from firstVideoAd.platform", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.video_ad_platform).toBe("ias");
  });

  it("passes through display_ad and native_ad", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.display_ad).toEqual({ type: "banner" });
    expect(result.native_ad).toEqual({ headline: "Buy Now" });
  });

  it('sets video_type to "hls" for ads with video_ad', () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(result.video_type).toBe("hls");
  });

  it("sets video_ad to array when video_ad is array", () => {
    const result = transformReelData(adsReel, 0, baseTagDetails, false);
    expect(Array.isArray(result.video_ad)).toBe(true);
  });
});

describe("transformReelData — ads type with video_ad object", () => {
  const videoAdObject = {
    url: "https://vast.example.com/obj.xml",
    ads_url: "https://vast.example.com/ads.xml",
    platform: "gen_video",
    advertiserDetails: { logo: "https://logo.png", primaryColor: "#00FF00" },
    contentVideo: {
      url: "https://content.mp4",
      autoplay: false,
      loop: false,
      muted: false,
      objectFit: "cover",
    },
  };

  const adsReelObj: Reel = {
    type: "ads",
    video_ad: videoAdObject,
    audio_ad: undefined,
    display_ad: undefined,
    native_ad: undefined,
    owner: null,
    cta: null,
    video: null,
    community: null,
    loop: null,
    og_details: null,
    config: null,
  } as unknown as Reel;

  it("sets hasVideoAd = true when object has keys", () => {
    const result = transformReelData(adsReelObj, 0, baseTagDetails, false);
    expect(result.videoAds).toBe(true);
  });

  it("sets ad_url from object.url for object video_ad", () => {
    const result = transformReelData(adsReelObj, 0, baseTagDetails, false);
    expect(result.ad_url).toBe("https://vast.example.com/obj.xml");
  });

  it("sets video_ad to url string from object.url", () => {
    const result = transformReelData(adsReelObj, 0, baseTagDetails, false);
    expect(result.video_ad).toBe("https://vast.example.com/obj.xml");
  });
});

describe("transformReelData — ads type with empty video_ad", () => {
  const adsReelNoVideo: Reel = {
    type: "ads",
    video_ad: [],
    audio_ad: undefined,
    display_ad: undefined,
    native_ad: undefined,
    owner: null,
    cta: null,
    video: null,
    community: null,
    loop: null,
    og_details: null,
    config: null,
  } as unknown as Reel;

  it("sets videoAds = false for empty array", () => {
    const result = transformReelData(adsReelNoVideo, 0, baseTagDetails, false);
    expect(result.videoAds).toBe(false);
  });

  it("sets video_url to null for ads with no video_ad", () => {
    const result = transformReelData(adsReelNoVideo, 0, baseTagDetails, false);
    expect(result.video_url).toBeNull();
  });

  it("does not set video_ad_advertiser_details", () => {
    const result = transformReelData(adsReelNoVideo, 0, baseTagDetails, false);
    expect(result.video_ad_advertiser_details).toBeUndefined();
  });

  it("does not set video_ad_content_video", () => {
    const result = transformReelData(adsReelNoVideo, 0, baseTagDetails, false);
    expect(result.video_ad_content_video).toBeUndefined();
  });
});

describe("transformReelData — audio ads", () => {
  // When video_ad is an empty array and audio_ad has content
  const audioAdReelEmptyVideoAd: Reel = {
    type: "ads",
    video_ad: [],
    audio_ad: { url: "https://audio.example.com/ad.mp3" },
    display_ad: undefined,
    native_ad: undefined,
    owner: null,
    cta: null,
    video: null,
    community: null,
    loop: null,
    og_details: null,
    config: null,
  } as unknown as Reel;

  // When video_ad is undefined and audio_ad has content (object path)
  const audioAdReelObjectPath: Reel = {
    type: "ads",
    video_ad: undefined,
    audio_ad: { url: "https://audio.example.com/ad.mp3" },
    display_ad: undefined,
    native_ad: undefined,
    owner: null,
    cta: null,
    video: null,
    community: null,
    loop: null,
    og_details: null,
    config: null,
  } as unknown as Reel;

  it("sets audioAds = true when isAudioAdsElement=true and audio_ad has content", () => {
    const result = transformReelData(audioAdReelEmptyVideoAd, 0, baseTagDetails, true);
    expect(result.audioAds).toBe(true);
  });

  it("sets audioAds = false when isAudioAdsElement=false", () => {
    const result = transformReelData(audioAdReelEmptyVideoAd, 0, baseTagDetails, false);
    expect(result.audioAds).toBe(false);
  });

  it("uses audio_ad.url for ad_url when isAudioAds and video_ad is an object (not array)", () => {
    // When video_ad is undefined (object path), audio_ad.url is used
    const result = transformReelData(audioAdReelObjectPath, 0, baseTagDetails, true);
    expect(result.ad_url).toBe("https://audio.example.com/ad.mp3");
  });

  it("ad_url is undefined when video_ad is empty array (array path, no firstVideoAd)", () => {
    // Matches legacy: Array.isArray([]) → firstVideoAd=undefined → ad_url=undefined
    const result = transformReelData(audioAdReelEmptyVideoAd, 0, baseTagDetails, true);
    expect(result.ad_url).toBeUndefined();
  });
});

describe("transformReelData — ads type without advertiser logo/color", () => {
  const adsReelNoLogo: Reel = {
    type: "ads",
    video_ad: [{ url: "https://ad.xml", platform: "gen", advertiserDetails: {} }],
    audio_ad: undefined,
    display_ad: undefined,
    native_ad: undefined,
    owner: null,
    cta: null,
    video: null,
    community: null,
    loop: null,
    og_details: null,
    config: null,
  } as unknown as Reel;

  it("omits video_ad_advertiser_details when neither logo nor color exists", () => {
    const result = transformReelData(adsReelNoLogo, 0, baseTagDetails, false);
    expect(result.video_ad_advertiser_details).toBeUndefined();
  });
});

describe("transformReelData — ads type with video_ad as array using ads_url fallback", () => {
  it("falls back to firstVideoAd.ads_url when url is absent", () => {
    const reel: Reel = {
      type: "ads",
      video_ad: [{ ads_url: "https://fallback.ads.xml", platform: "gen" }],
      audio_ad: undefined,
      display_ad: undefined,
      native_ad: undefined,
      owner: null,
      cta: null,
      video: null,
      community: null,
      loop: null,
      og_details: null,
      config: null,
    } as unknown as Reel;
    const result = transformReelData(reel, 0, baseTagDetails, false);
    expect(result.ad_url).toBe("https://fallback.ads.xml");
  });
});

// ─── Phase 2: canonical ad builder ────────────────────────────────────────────

describe("buildAdObject", () => {
  it("derives videoUrl/videoType from videoAds=true", () => {
    const ad = buildAdObject({ id: 5, videoAds: true, videoAd: "https://ad.xml" });
    expect(ad.kind).toBe("ad");
    expect(ad.id).toBe(5);
    expect(ad.videoAds).toBe(true);
    expect(ad.videoUrl).toBe(BLANK_HLS_URL);
    expect(ad.videoType).toBe("hls");
  });

  it("leaves videoUrl/videoType null when videoAds is false", () => {
    const ad = buildAdObject({ id: 1, audioAds: true });
    expect(ad.videoAds).toBe(false);
    expect(ad.videoUrl).toBeNull();
    expect(ad.videoType).toBeNull();
    expect(ad.audioAds).toBe(true);
  });

  it("defaults active/audioAds/videoAds to false and forwards the rest verbatim", () => {
    const ad = buildAdObject({
      id: 2,
      videoAd: "https://v.xml",
      videoAds: true,
      videoPlatform: "tritondigital",
      videoAdAdvertiserDetails: { logo: "l", primaryColor: "#000" },
      displayAd: { tag_id: "/1/x" },
      adUrl: "https://click",
    });
    expect(ad.active).toBe(false);
    expect(ad.videoPlatform).toBe("tritondigital");
    expect(ad.videoAdAdvertiserDetails).toEqual({ logo: "l", primaryColor: "#000" });
    expect(ad.displayAd).toEqual({ tag_id: "/1/x" });
    expect(ad.adUrl).toBe("https://click");
  });
});

describe("buildReelAdObjectFromConfig", () => {
  it("maps ads_config.ads_url onto a video ad break", () => {
    const cfg: AdsConfig = { ads_url: "https://triton/ars?stid=1" };
    const ad = buildReelAdObjectFromConfig(cfg, 100_003);
    expect(ad.id).toBe(100_003);
    expect(ad.videoAds).toBe(true);
    expect(ad.audioAds).toBe(false);
    expect(ad.videoAd).toBe("https://triton/ars?stid=1");
    expect(ad.adUrl).toBe("https://triton/ars?stid=1");
    expect(ad.videoUrl).toBe(BLANK_HLS_URL);
  });

  it("forwards optional platform, advertiser, and content fields", () => {
    const cfg: AdsConfig = {
      ads_url: "https://v.xml",
      platform: "gen_video",
      advertiserDetails: { logo: "logo.png", primaryColor: "#F00" },
      contentVideo: { url: "c.mp4", autoplay: true, loop: true, muted: true, objectFit: "contain" },
    };
    const ad = buildReelAdObjectFromConfig(cfg, 1);
    expect(ad.videoPlatform).toBe("gen_video");
    expect(ad.videoAdAdvertiserDetails).toEqual({ logo: "logo.png", primaryColor: "#F00" });
    expect(ad.videoAdContentVideo?.url).toBe("c.mp4");
  });
});

describe("buildStaticAdEntry", () => {
  it("builds a catalog creative through the backend normaliseAd path", () => {
    const cfg = STATIC_AD_CONFIGS[0]!;
    const { kind, data } = buildStaticAdEntry(0, 7);
    expect(kind).toBe("ad");
    expect(data.id).toBe(7);
    expect(data.videoAds).toBe(true);
    expect(data.audioAds).toBe(false);
    // videoAd is the backend `video_ad[]` array, same as a real ads reel.
    expect(Array.isArray(data.videoAd)).toBe(true);
    expect(data.adUrl).toBe(cfg.adUrl);
    expect(data.videoPlatform).toBe("gen_video");
    expect(data.videoAdAdvertiserDetails).toEqual({ logo: cfg.logo, primaryColor: cfg.primaryColor });
    expect(data.videoAdContentVideo?.url).toBe(cfg.videoSource);
    expect(data.videoUrl).toBe(BLANK_HLS_URL);
  });

  it("matches the shape of a directly-normalised backend ads reel", () => {
    const cfg = STATIC_AD_CONFIGS[1]!;
    const viaStatic = buildStaticAdEntry(1, 3).data;
    const viaBackend = normaliseAd(staticAdConfigToReel(cfg), 3).data;
    expect(viaStatic).toEqual(viaBackend);
  });
});

describe("normaliseReel — ads_config", () => {
  function reelWithAdsConfig(adsConfig?: AdsConfig): Reel {
    return {
      type: "loop",
      video: { id: "vid-1", url: "https://playlist.m3u8", ads_config: adsConfig },
      owner: null,
      cta: null,
      community: null,
      loop: null,
      og_details: null,
      config: null,
    } as unknown as Reel;
  }

  it("builds an adObject from video.ads_config regardless of tag gating", () => {
    const { data } = normaliseReel(reelWithAdsConfig({ ads_url: "https://triton/ars" }), 3, "any-tag");
    expect(data.adObject).toBeDefined();
    expect(data.adObject?.videoAd).toBe("https://triton/ars");
    expect(data.adObject?.videoAds).toBe(true);
    // Offset keeps the ad-break slot id distinct from in-feed ad ids.
    expect(data.adObject?.id).toBe(100_003);
  });

  it("leaves adObject undefined when ads_config has no ads_url and the tag is not flagged", () => {
    const { data } = normaliseReel(reelWithAdsConfig({}), 0, "unflagged-tag");
    expect(data.adObject).toBeUndefined();
  });

  it("leaves adObject undefined when video carries no ads_config", () => {
    const { data } = normaliseReel(reelWithAdsConfig(undefined), 0, "unflagged-tag");
    expect(data.adObject).toBeUndefined();
  });
});

describe("normaliseAd — via buildAdObject", () => {
  it("normalises a video ad-type reel", () => {
    const reel = {
      type: "ads",
      video_ad: [{ url: "https://ad.xml", platform: "gen_video" }],
    } as unknown as Reel;
    const { kind, data } = normaliseAd(reel, 0);
    expect(kind).toBe("ad");
    expect(data.videoAds).toBe(true);
    expect(data.videoUrl).toBe(BLANK_HLS_URL);
    expect(data.videoPlatform).toBe("gen_video");
    expect(data.adUrl).toBe("https://ad.xml");
  });
});

describe("inferVideoAdPlatform", () => {
  it("maps streamtheworld hosts to tritondigital", () => {
    expect(inferVideoAdPlatform("https://cmod-na.live.streamtheworld.com/ondemand/ars?stid=1")).toBe("tritondigital");
  });
  it("maps nxs.begenuin.com hosts to infy", () => {
    expect(inferVideoAdPlatform("https://nxs.begenuin.com/tagxml/customer/3119/tag/3753")).toBe("infy");
  });
  it("returns undefined for unknown hosts and falsy input", () => {
    expect(inferVideoAdPlatform("https://example.com/vast.xml")).toBeUndefined();
    expect(inferVideoAdPlatform(undefined)).toBeUndefined();
  });
});

describe("normaliseFeed — both backend ad structures", () => {
  // Kind 1: ad delivered in the feed object → render the ad directly.
  const adsUrl =
    "https://cmod-na.live.streamtheworld.com/ondemand/ars?type=midroll&stid=1446814&ttag=brand_id:3252";
  const inFeedAd = {
    type: "ads",
    video_ad: [{ ads_url: adsUrl, cpm: 5, platform: "tritondigital", url: adsUrl }],
  } as unknown as Reel;

  // Kind 2: ad delivered on an organic loop's video.ads_config → ad break.
  const organicWithBreak = {
    type: "loop",
    video: { id: "vid", url: "https://playlist.m3u8", ads_config: { ads_url: adsUrl } },
  } as unknown as Reel;

  it("routes a type=ads reel to a directly-rendered ad entry", () => {
    const entry = normaliseFeed([inFeedAd], "tag")[0];
    if (!entry || entry.kind !== "ad") throw new Error("expected an ad entry");
    expect(entry.data.videoAds).toBe(true);
    expect(entry.data.videoAd).toEqual([{ ads_url: adsUrl, cpm: 5, platform: "tritondigital", url: adsUrl }]);
    expect(entry.data.videoPlatform).toBe("tritondigital");
    expect(entry.data.adUrl).toBe(adsUrl);
  });

  it("routes a type=loop reel to a video entry with an ad-break adObject from ads_config", () => {
    const entry = normaliseFeed([organicWithBreak], "tag")[0];
    if (!entry || entry.kind !== "reel") throw new Error("expected a reel entry");
    // Organic video still plays.
    expect(entry.data.videoUrl).toBe("https://playlist.m3u8");
    // Ad break sourced from ads_config, platform inferred from the host.
    expect(entry.data.adObject).toBeDefined();
    expect(entry.data.adObject?.videoAd).toBe(adsUrl);
    expect(entry.data.adObject?.videoPlatform).toBe("tritondigital");
    expect(entry.data.adObject?.videoUrl).toBe(BLANK_HLS_URL);
  });
});
