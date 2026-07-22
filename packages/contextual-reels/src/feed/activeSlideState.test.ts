import { describe, it, expect } from "vitest";

import { getActiveSlideState } from "@cxr/feed/activeSlideState";
import type { FeedEntry } from "@cxr/types";

const makeReelEntry = (id: number, kind: "video" | "video-with-ad" = "video"): FeedEntry => ({
  kind,
  data: {
    kind,
    id,
    active: id === 0,
    videoUrl: null,
    videoType: null,
    thumb: null,
    user: null,
    community: null,
    cta: null,
    loop: null,
    ogDetails: null,
    owner: null,
    config: null,
    video: null,
  },
});

const makeAdEntry = (): FeedEntry => ({ kind: "ad", data: { kind: "ad", id: 99, active: false } }) as unknown as FeedEntry;

describe("getActiveSlideState", () => {
  it("returns the active reel's data when the active slide is a video", () => {
    const entries = [makeReelEntry(0), makeReelEntry(1)];
    const { isAdActive, activeReel } = getActiveSlideState(entries, 0, false);
    expect(isAdActive).toBe(false);
    expect(activeReel).toBe(entries[0]?.data);
  });

  it("returns the active reel's data when the active slide is video-with-ad", () => {
    const entries = [makeReelEntry(0, "video-with-ad")];
    const { activeReel } = getActiveSlideState(entries, 0, false);
    expect(activeReel).toBe(entries[0]?.data);
  });

  it("marks isAdActive and activeReel undefined when the active slide is a bare ad", () => {
    const entries = [makeReelEntry(0), makeAdEntry()];
    const { isAdActive, activeReel } = getActiveSlideState(entries, 1, false);
    expect(isAdActive).toBe(true);
    expect(activeReel).toBeUndefined();
  });

  it("marks isAdActive when a fullscreen ad break is active over a reel", () => {
    const entries = [makeReelEntry(0)];
    const { isAdActive, activeReel } = getActiveSlideState(entries, 0, true);
    expect(isAdActive).toBe(true);
    expect(activeReel).toBe(entries[0]?.data);
  });

  it("handles an out-of-range active index gracefully", () => {
    const entries = [makeReelEntry(0)];
    const { isAdActive, activeReel } = getActiveSlideState(entries, 5, false);
    expect(isAdActive).toBe(false);
    expect(activeReel).toBeUndefined();
  });
});
