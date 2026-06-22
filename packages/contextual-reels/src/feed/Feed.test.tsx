/**
 * Tests for Feed — Phase 2 FeedEntry.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { FeedEntry, TagResponse } from "@cxr/types";

const { mockUseFullScreen, mockUseFeed, mockUseAdWaterfall } = vi.hoisted(() => ({
  mockUseFullScreen: vi.fn(() => ({
    isFullScreen: false,
    enterFullScreen: vi.fn(),
    exitFullScreen: vi.fn(),
    toggleFullScreen: vi.fn(),
  })),
  mockUseFeed: vi.fn(() => ({ entries: [] as FeedEntry[], activeIndex: 0, setActiveIndex: vi.fn() })),
  mockUseAdWaterfall: vi.fn(() => ({
    onAdSuccess: vi.fn(),
    onAdFail: vi.fn(),
    adLayout: "unknown",
    isAudioOnlyAds: false,
    isAdBreakActive: false,
    setAdBreakActive: vi.fn(),
  })),
}));

vi.mock("embla-carousel", () => ({
  default: vi.fn(() => ({
    scrollNext: vi.fn(),
    scrollPrev: vi.fn(),
    scrollTo: vi.fn(),
    selectedScrollSnap: vi.fn(() => 0),
    reInit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock("./ReelList", () => ({
  ReelList: (props: { entries: FeedEntry[]; tagDetails: TagResponse }) =>
    React.createElement("div", { "data-testid": "reel-list", "data-count": props.entries.length }),
}));

vi.mock("../providers/FullScreenProvider", () => ({
  useFullScreen: () => mockUseFullScreen(),
}));

vi.mock("../providers/PlayerProvider", () => ({
  usePlayer: () => ({ isMuted: true, isPlaying: true, setMuted: vi.fn(), setPlaying: vi.fn() }),
}));

vi.mock("../providers/GenAIProvider", () => ({
  useGenAI: () => ({ isAllowed: false, octoFraction: 0, setOctoFraction: vi.fn() }),
}));

vi.mock("../providers/FeedProvider", () => ({
  useFeed: () => mockUseFeed(),
}));

vi.mock("../providers/AdProvider", () => ({
  useAdWaterfall: () => mockUseAdWaterfall(),
}));

import { Feed } from "@cxr/feed/Feed";

const makeReelEntry = (id: number): FeedEntry => ({
  kind: "reel",
  data: {
    kind: "reel",
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

const makeAdEntry = (): FeedEntry =>
  ({ kind: "ad", data: { kind: "ad", id: 99, active: false } } as unknown as FeedEntry);

const mockEntries: FeedEntry[] = [makeReelEntry(0), makeReelEntry(1)];
const mockTagDetails: TagResponse = { tag_id: "tag-1" };
/** Config that turns the fullscreen action rail on. */
const railTagDetails: TagResponse = { tag_id: "tag-1", config: { show_spark: true } };

describe("Feed", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockUseFullScreen.mockReturnValue({
      isFullScreen: false,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    mockUseFeed.mockReturnValue({ entries: [], activeIndex: 0, setActiveIndex: vi.fn() });
    mockUseAdWaterfall.mockReturnValue({
      onAdSuccess: vi.fn(),
      onAdFail: vi.fn(),
      adLayout: "unknown",
      isAudioOnlyAds: false,
      isAdBreakActive: false,
      setAdBreakActive: vi.fn(),
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  it("renders a scroll-snap container", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries, tagDetails: mockTagDetails }));
    });
    expect(container.querySelector('[data-testid="feed-container"]')).toBeTruthy();
  });

  it("renders ReelList inside the container", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries, tagDetails: mockTagDetails }));
    });
    expect(container.querySelector('[data-testid="reel-list"]')).toBeTruthy();
  });

  it("renders ReelList even when entries array is empty", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: [], tagDetails: mockTagDetails }));
    });
    expect(container.querySelector('[data-testid="reel-list"]')).not.toBeNull();
  });

  it("passes entries and tagDetails to ReelList", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries, tagDetails: mockTagDetails }));
    });
    expect(container.querySelector('[data-testid="reel-list"]')?.getAttribute("data-count")).toBe("2");
  });

  it("shows the action rail in fullscreen when the active slide is a reel", () => {
    mockUseFullScreen.mockReturnValue({
      isFullScreen: true,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    mockUseFeed.mockReturnValue({ entries: mockEntries, activeIndex: 0, setActiveIndex: vi.fn() });
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries, tagDetails: railTagDetails }));
    });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).toBeTruthy();
  });

  it("hides the action rail in fullscreen when the active slide is an ad", () => {
    const entries = [makeReelEntry(0), makeAdEntry()];
    mockUseFullScreen.mockReturnValue({
      isFullScreen: true,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    mockUseFeed.mockReturnValue({ entries, activeIndex: 1, setActiveIndex: vi.fn() });
    act(() => {
      root.render(React.createElement(Feed, { entries, tagDetails: railTagDetails }));
    });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).toBeNull();
  });

  it("hides the action rail while a fullscreen ad break is on screen over a reel", () => {
    mockUseFullScreen.mockReturnValue({
      isFullScreen: true,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    mockUseFeed.mockReturnValue({ entries: mockEntries, activeIndex: 0, setActiveIndex: vi.fn() });
    mockUseAdWaterfall.mockReturnValue({
      onAdSuccess: vi.fn(),
      onAdFail: vi.fn(),
      adLayout: "unknown",
      isAudioOnlyAds: false,
      isAdBreakActive: true,
      setAdBreakActive: vi.fn(),
    });
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries, tagDetails: railTagDetails }));
    });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).toBeNull();
  });
});
