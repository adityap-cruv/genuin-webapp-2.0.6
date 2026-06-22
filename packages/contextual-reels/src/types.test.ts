/**
 * Type-narrowing tests for `src/types.ts` — merged from types/api.test.ts.
 */
import { describe, it, expect } from "vitest";

import type { TagResponse, Reel, FeedResponse, IpInfo } from "@cxr/types";

describe("types/api — TagResponse", () => {
  it("accepts a well-formed TagResponse at runtime", () => {
    const response: TagResponse = {
      tag_id: "abc123",
      show_cta: true,
      cta: { url: "https://example.com", text: "Click me" },
      config: { some: "value" },
      display_ad: null,
      native_ad: null,
      video_ad: "https://example.com/vast.xml",
      video_ad_advertiser_details: { logo: "https://example.com/logo.png", primaryColor: "#FF0000" },
      video_ad_content_video: {
        url: "https://example.com/video.mp4",
        autoplay: true,
        loop: true,
        muted: true,
        objectFit: "contain",
      },
      ad_url: "https://example.com/ad",
    };
    expect(response.tag_id).toBe("abc123");
    expect(response.show_cta).toBe(true);
  });

  it("allows all nullable fields to be null/undefined", () => {
    const minimal: TagResponse = {
      tag_id: "xyz",
    };
    expect(minimal.tag_id).toBe("xyz");
    expect(minimal.display_ad).toBeUndefined();
  });
});

describe("types/api — Reel", () => {
  it("accepts a well-formed Reel at runtime", () => {
    const reel: Reel = {
      id: 0,
      active: false,
      type: "reel",
      video_url: "https://example.com/video.m3u8",
      video_type: "hls",
      thumb: null,
      user: null,
      community: null,
      cta: null,
      loop: null,
      og_details: null,
      owner: null,
      config: null,
      video: { id: "v1", url: "https://example.com/v.mp4" },
    };
    expect(reel.type).toBe("reel");
    expect(reel.id).toBe(0);
  });

  it("accepts an ads type Reel", () => {
    const adReel: Reel = {
      id: 1,
      active: false,
      type: "ads",
      videoAds: true,
      audioAds: false,
      video_ad: "https://example.com/vast.xml",
    };
    expect(adReel.type).toBe("ads");
    expect(adReel.videoAds).toBe(true);
  });
});

describe("types/api — FeedResponse", () => {
  it("holds reels array and ref", () => {
    const feed: FeedResponse = {
      reels: [],
      ref: "page-token-xyz",
    };
    expect(feed.reels).toHaveLength(0);
    expect(feed.ref).toBe("page-token-xyz");
  });

  it("holds multiple reels", () => {
    const reel: Reel = { id: 0, type: "reel" };
    const feed: FeedResponse = { reels: [reel], ref: "" };
    expect(feed.reels[0]?.type).toBe("reel");
  });
});

describe("types/api — IpInfo", () => {
  it("accepts a fully-populated IpInfo", () => {
    const info: IpInfo = {
      ip: "1.2.3.4",
      query: "1.2.3.4",
      tip: "1.2.3.4",
      city: "Mumbai",
      city_en: "Mumbai",
      country: "IN",
      country_code: "IN",
      country_name: "India",
      country_en: "India",
      latitude: 19.07,
      lat: 19.07,
      longitude: 72.87,
      lon: 72.87,
      lng: 72.87,
      location: "19.07,72.87",
    };
    expect(info.city).toBe("Mumbai");
    expect(info.country_code).toBe("IN");
  });

  it("accepts an empty IpInfo (all fields optional)", () => {
    const info: IpInfo = {};
    expect(info.ip).toBeUndefined();
  });
});
