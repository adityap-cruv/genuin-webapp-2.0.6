/**
 * Tests for ReelItem routing — Phase 2 FeedEntry.
 *
 * ReelItem is a pure 3-branch router: ad → AdLayout, video-with-ad → VideoLayout
 * (with adObject forwarded), video → VideoLayout. All layout-specific branching
 * lives inside the layout components.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ReelItem } from "@cxr/feed/ReelItem";
import type { FeedEntry, NormalisedReel, NormalisedAd, TagResponse } from "@cxr/types";

/** Captures props passed to VideoLayout so tests can assert on forwarded values. */
const capturedVideoLayoutProps: Record<string, unknown>[] = [];

vi.mock("./layouts", () => ({
  AdLayout: () => React.createElement("div", { "data-testid": "ad-layout" }),
  VideoLayout: (props: Record<string, unknown>) => {
    capturedVideoLayoutProps.push(props);
    return React.createElement("div", { "data-testid": "video-layout" });
  },
}));

const BASE_REEL: NormalisedReel = {
  kind: "video",
  id: 0,
  active: true,
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
};

const BASE_AD: NormalisedAd = {
  kind: "ad",
  id: 1,
  active: false,
  videoUrl: null,
  videoType: null,
  audioAds: false,
  videoAds: true,
  videoAd: "https://example.com/vast.xml",
  videoAdAdvertiserDetails: undefined,
  videoAdContentVideo: undefined,
  displayAd: undefined,
  nativeAd: undefined,
  videoPlatform: "gen_video",
  nativePlatform: undefined,
  displayPlatform: undefined,
  adUrl: "https://example.com/vast.xml",
  gateOnUnmute: false,
};

const makeReelEntry = (): FeedEntry => ({ kind: "video", data: BASE_REEL });
const makeVideoWithAdEntry = (): FeedEntry => ({
  kind: "video-with-ad",
  data: { ...BASE_REEL, kind: "video-with-ad", adObject: BASE_AD },
});
const makeAdEntry = (): FeedEntry => ({ kind: "ad", data: BASE_AD });

const baseTagDetails: TagResponse = { tag_id: "tag-1" };

describe("ReelItem routing", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    capturedVideoLayoutProps.length = 0;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(entry: FeedEntry, tagDetails: TagResponse = baseTagDetails) {
    act(() => {
      root.render(
        React.createElement(ReelItem, {
          entry,
          isActive: true,
          tagDetails,
          onTimeUpdate: () => undefined,
        })
      );
    });
  }

  it("routes ad entry (kind=ad) to AdLayout", () => {
    render(makeAdEntry());
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeTruthy();
  });

  it("routes reel entry (kind=video) to VideoLayout", () => {
    render(makeReelEntry());
    expect(container.querySelector('[data-testid="video-layout"]')).toBeTruthy();
  });

  it("routes video-with-ad entry to VideoLayout (unified)", () => {
    render(makeVideoWithAdEntry());
    expect(container.querySelector('[data-testid="video-layout"]')).toBeTruthy();
    // Verify adObject is forwarded so VideoLayout can gate the ad break overlay.
    expect(capturedVideoLayoutProps.some((p) => p["adObject"] != null)).toBe(true);
  });

  it("does not render VideoLayout for an ad entry", () => {
    render(makeAdEntry());
    expect(container.querySelector('[data-testid="video-layout"]')).toBeNull();
  });

  it("does not render AdLayout for a reel entry", () => {
    render(makeReelEntry());
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeNull();
  });

  it("does not render AdLayout for a video-with-ad entry", () => {
    render(makeVideoWithAdEntry());
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeNull();
  });

  it("renders an empty fragment for an unrecognised entry kind", () => {
    // Defensive fallback: a kind outside the 3-branch router renders nothing.
    const unknownEntry = { kind: "unknown", data: BASE_REEL } as unknown as FeedEntry;
    render(unknownEntry);
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeNull();
    expect(container.querySelector('[data-testid="video-layout"]')).toBeNull();
  });
});
