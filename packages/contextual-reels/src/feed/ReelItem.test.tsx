/**
 * Tests for ReelItem routing — Phase 2 FeedEntry.
 *
 * ReelItem is a 2-branch router: ad → AdLayout, reel → VideoLayout.
 * All adLayout-specific branching lives inside the layout components.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { FeedEntry, NormalisedReel, NormalisedAd, TagResponse } from "@cxr/types";

vi.mock("./layouts", () => ({
  AdLayout: () => React.createElement("div", { "data-testid": "ad-layout" }),
  VideoLayout: () => React.createElement("div", { "data-testid": "video-layout" }),
}));

import { ReelItem } from "@cxr/feed/ReelItem";

const BASE_REEL: NormalisedReel = {
  kind: "reel",
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
};

const makeReelEntry = (): FeedEntry => ({ kind: "reel", data: BASE_REEL });
const makeAdEntry = (): FeedEntry => ({ kind: "ad", data: BASE_AD });

const baseTagDetails: TagResponse = { tag_id: "tag-1" };

describe("ReelItem routing", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it("routes reel entry (kind=reel) to VideoLayout", () => {
    render(makeReelEntry());
    expect(container.querySelector('[data-testid="video-layout"]')).toBeTruthy();
  });

  it("does not render VideoLayout for an ad entry", () => {
    render(makeAdEntry());
    expect(container.querySelector('[data-testid="video-layout"]')).toBeNull();
  });

  it("does not render AdLayout for a reel entry", () => {
    render(makeReelEntry());
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeNull();
  });
});
