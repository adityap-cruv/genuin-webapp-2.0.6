import { describe, it, expect } from "vitest";

import { makeFeedEntry, makeNormalisedAd, makeNormalisedReel } from "@cxr/__fixtures__/feedEntries";

describe("__fixtures__/feedEntries", () => {
  it("makeNormalisedReel returns a valid base reel with kind=video", () => {
    const reel = makeNormalisedReel();
    expect(reel.kind).toBe("video");
    expect(reel.id).toBe(0);
    expect(reel.active).toBe(true);
    expect(reel.adObject).toBeUndefined();
  });

  it("makeNormalisedReel applies overrides", () => {
    const reel = makeNormalisedReel({ id: 5, active: false });
    expect(reel.id).toBe(5);
    expect(reel.active).toBe(false);
  });

  it("makeNormalisedAd returns a valid base ad", () => {
    const ad = makeNormalisedAd();
    expect(ad.kind).toBe("ad");
    expect(ad.id).toBe(1);
    expect(ad.videoAds).toBe(true);
    expect(ad.adUrl).toBe("https://example.com/vast.xml");
  });

  it("makeNormalisedAd applies overrides", () => {
    const ad = makeNormalisedAd({ id: 9, gateOnUnmute: true });
    expect(ad.id).toBe(9);
    expect(ad.gateOnUnmute).toBe(true);
  });

  it('makeFeedEntry("video") returns a plain video entry', () => {
    const entry = makeFeedEntry("video");
    expect(entry.kind).toBe("video");
    expect(entry.data.kind).toBe("video");
  });

  it('makeFeedEntry("video-with-ad") returns a reel with adObject set', () => {
    const entry = makeFeedEntry("video-with-ad");
    expect(entry.kind).toBe("video-with-ad");
    if (entry.kind !== "video-with-ad") throw new Error("expected video-with-ad");
    expect(entry.data.kind).toBe("video-with-ad");
    expect(entry.data.adObject).toBeDefined();
    expect(entry.data.adObject?.kind).toBe("ad");
  });

  it('makeFeedEntry("ad") returns a standalone ad entry', () => {
    const entry = makeFeedEntry("ad");
    expect(entry.kind).toBe("ad");
    expect(entry.data.kind).toBe("ad");
  });

  it('makeFeedEntry("video-with-ad") accepts reel and ad overrides', () => {
    const entry = makeFeedEntry("video-with-ad", { reel: { id: 3 }, ad: { id: 7 } });
    if (entry.kind !== "video-with-ad") throw new Error("expected video-with-ad");
    expect(entry.data.id).toBe(3);
    expect(entry.data.adObject?.id).toBe(7);
  });

  it('makeFeedEntry("ad") accepts ad overrides', () => {
    const entry = makeFeedEntry("ad", { ad: { id: 42 } });
    expect(entry.data.id).toBe(42);
  });
});
