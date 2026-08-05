/**
 * Tests for Feed — container behaviour (fullscreen box, action rail gating)
 * and strict virtualization (only the mount window renders a live ReelItem;
 * other slides render ReelSlidePlaceholder). Feed owns both concerns directly
 * — there is no separate ReelList component.
 *
 * isAdActive/activeReel are read straight from useFeed() (driven here via
 * mockUseFeed) — FeedProvider derives them, not Feed. See FeedProvider.test.tsx
 * for that derivation's own coverage.
 *
 * useSwipeGate is mocked to a no-op here — it has its own unit tests in
 * useSwipeGate.test.ts. useGenAI is mocked only for the octoFraction it feeds
 * into that gate.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { Feed } from "@cxr/feed/Feed";
import type { UseFeedNavigationOptions } from "@cxr/feed/useFeedNavigation";
import type { FeedEntry, TagResponse } from "@cxr/types";

const { mockUseFullScreen, mockUseFeed, mockUseAdWaterfall } = vi.hoisted(() => ({
  mockUseFullScreen: vi.fn(() => ({
    isFullScreen: false,
    enterFullScreen: vi.fn(),
    exitFullScreen: vi.fn(),
    toggleFullScreen: vi.fn(),
  })),
  mockUseFeed: vi.fn(() => ({
    entries: [] as FeedEntry[],
    activeIndex: 0,
    setActiveIndex: vi.fn(),
    isAdActive: false,
    activeReel: undefined as FeedEntry["data"] | undefined,
  })),
  mockUseAdWaterfall: vi.fn(() => ({
    onAdSuccess: vi.fn(),
    onAdFail: vi.fn(),
    adLayout: "unknown",
    isAudioOnlyAds: false,
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

/** Captures the props ReelItem receives so callback wiring can be asserted. */
const capturedReelItemProps: Record<string, unknown>[] = [];

vi.mock("./ReelItem", () => ({
  ReelItem: (props: { entry: FeedEntry; isActive: boolean }) => {
    capturedReelItemProps.push(props as unknown as Record<string, unknown>);
    return React.createElement("div", {
      "data-testid": `reel-item-${props.entry.data.id}`,
      "data-active": String(props.isActive),
    });
  },
}));

const mockTagDetails: TagResponse = { tag_id: "tag-1", brand_color: "#ff0000" };
vi.mock("../providers/TagDetailsProvider", () => ({
  useTagDetails: () => ({ tagDetails: mockTagDetails, apiFailed: false }),
}));

// Module-level so each test can drive the navigation state the mount window reads.
let mockVisibleIndices = new Set<number>([0]);
let capturedNavOptions: UseFeedNavigationOptions | undefined;
const navResult = {
  goNext: vi.fn(),
  emitTimeUpdate: vi.fn(),
};

vi.mock("./useFeedNavigation", () => ({
  useEmblaFeed: vi.fn((_ref: unknown, options: UseFeedNavigationOptions) => {
    capturedNavOptions = options;
    return {
      activeIndex: 0,
      goNext: navResult.goNext,
      goPrev: vi.fn(),
      goTo: vi.fn(),
      autoAdvance: vi.fn(),
      onTimeUpdate: navResult.emitTimeUpdate,
      visibleIndices: mockVisibleIndices,
    };
  }),
}));

vi.mock("@cxr/controls/FullscreenActionRailHost", () => ({
  FullscreenActionRailHost: (props: { isFullScreen: boolean; isAdActive: boolean; item?: { id: number } }) => {
    if (!props.isFullScreen || props.isAdActive) return null;
    return React.createElement("div", {
      "data-testid": "fullscreen-action-rail-anchor",
      "data-item-id": props.item === undefined ? "undefined" : String(props.item.id),
    });
  },
}));

vi.mock("../providers/FullScreenProvider", () => ({
  useFullScreen: () => mockUseFullScreen(),
}));

vi.mock("../providers/GenAIProvider", () => ({
  useGenAI: () => ({ octoFraction: 0 }),
}));

vi.mock("./hooks/useSwipeGate", () => ({
  useSwipeGate: vi.fn(),
}));

vi.mock("../providers/FeedProvider", () => ({
  useFeed: () => mockUseFeed(),
}));

vi.mock("../providers/AdProvider", () => ({
  useAdWaterfall: () => mockUseAdWaterfall(),
  useOptionalAdWaterfall: () => mockUseAdWaterfall(),
}));

const makeReelEntry = (id: number): FeedEntry => ({
  kind: "video",
  data: {
    kind: "video",
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

/** Minimal ad-kind entry — only `kind`/`id` matter for placeholder-wiring assertions. */
const makeAdEntry = (id: number): FeedEntry =>
  ({ kind: "ad", data: { kind: "ad", id, active: false } }) as unknown as FeedEntry;

const mockEntries: FeedEntry[] = [makeReelEntry(0), makeReelEntry(1)];

describe("Feed", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    capturedReelItemProps.length = 0;
    capturedNavOptions = undefined;
    mockVisibleIndices = new Set([0]);
    navResult.goNext.mockClear();
    navResult.emitTimeUpdate.mockClear();
    mockUseFullScreen.mockReturnValue({
      isFullScreen: false,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    mockUseFeed.mockReturnValue({
      entries: [],
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    mockUseAdWaterfall.mockReturnValue({
      onAdSuccess: vi.fn(),
      onAdFail: vi.fn(),
      adLayout: "unknown",
      isAudioOnlyAds: false,
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
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    expect(container.querySelector('[data-testid="feed-container"]')).toBeTruthy();
  });

  it("renders the reel list inside the container", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    expect(container.querySelector('[data-testid="reel-list"]')).toBeTruthy();
  });

  it("renders the reel list even when entries array is empty", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: [] }));
    });
    expect(container.querySelector('[data-testid="reel-list"]')).not.toBeNull();
  });

  it("shows the action rail in fullscreen when isAdActive is false", () => {
    mockUseFullScreen.mockReturnValue({
      isFullScreen: true,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    mockUseFeed.mockReturnValue({
      entries: mockEntries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: mockEntries[0]?.data,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).toBeTruthy();
  });

  it("passes useFeed()'s activeReel through to the action rail as `item`", () => {
    mockUseFullScreen.mockReturnValue({
      isFullScreen: true,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    const activeReel = mockEntries[0]?.data;
    mockUseFeed.mockReturnValue({
      entries: mockEntries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    const anchor = container.querySelector('[data-testid="fullscreen-action-rail-anchor"]');
    expect(anchor?.getAttribute("data-item-id")).toBe(String(activeReel?.id));
  });

  it("hides the action rail in fullscreen when useFeed()'s isAdActive is true", () => {
    mockUseFullScreen.mockReturnValue({
      isFullScreen: true,
      enterFullScreen: vi.fn(),
      exitFullScreen: vi.fn(),
      toggleFullScreen: vi.fn(),
    });
    mockUseFeed.mockReturnValue({
      entries: mockEntries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: true,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).toBeNull();
  });

  // ── Strict virtualization ────────────────────────────────────────────────

  it("mounts only the active entry and renders placeholders for the rest", () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeReelEntry(i));
    mockUseFeed.mockReturnValue({
      entries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries }));
    });
    expect(container.querySelectorAll('[data-testid^="reel-item-"]').length).toBe(1);
    expect(container.querySelector('[data-testid="reel-item-0"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="reel-slide-placeholder"]').length).toBe(4);
  });

  it("passes isAd to placeholders so ad slides get the neutral background, video slides keep brand_color", () => {
    // A video slide (idx 1) and an ad slide (idx 2), both outside the mount
    // window (activeIndex 0, only idx 0 visible), so both render a real
    // ReelSlidePlaceholder. The ad slide must take the neutral shimmer base
    // (#1a1a1a → rgb(26,26,26)); the video slide keeps the tag brand_color
    // (#ff0000 → rgb(255,0,0)). This locks in the Feed → isAd → placeholder wiring.
    const entries: FeedEntry[] = [makeReelEntry(0), makeReelEntry(1), makeAdEntry(2)];
    mockUseFeed.mockReturnValue({
      entries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries }));
    });
    const list = container.querySelector('[data-testid="reel-list"]');
    const wrappers = list ? Array.from(list.children) : [];
    const videoPlaceholder = wrappers[1]?.querySelector('[data-testid="reel-slide-placeholder"]');
    const adPlaceholder = wrappers[2]?.querySelector('[data-testid="reel-slide-placeholder"]');

    expect(videoPlaceholder?.getAttribute("style")).toContain("rgb(255, 0, 0)");
    expect(adPlaceholder?.getAttribute("style")).toContain("rgb(26, 26, 26)");
    expect(adPlaceholder?.getAttribute("style")).not.toContain("rgb(255, 0, 0)");
  });

  it("keeps every slide wrapper mounted so Embla retains real scroll height", () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeReelEntry(i));
    mockUseFeed.mockReturnValue({
      entries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries }));
    });
    const list = container.querySelector('[data-testid="reel-list"]');
    expect(list?.children.length).toBe(5);
  });

  it("mounts both the outgoing and incoming slide while a swipe is in view", () => {
    mockVisibleIndices = new Set([0, 1]);
    const entries = Array.from({ length: 5 }, (_, i) => makeReelEntry(i));
    mockUseFeed.mockReturnValue({
      entries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries }));
    });
    expect(container.querySelector('[data-testid="reel-item-0"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="reel-item-1"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="reel-slide-placeholder"]').length).toBe(3);
  });

  it("shifts the mounted window when the active index changes", () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeReelEntry(i));
    mockUseFeed.mockReturnValue({
      entries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries }));
    });
    expect(container.querySelector('[data-testid="reel-item-0"]')).toBeTruthy();

    mockVisibleIndices = new Set([2]);
    mockUseFeed.mockReturnValue({
      entries,
      activeIndex: 2,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries }));
    });
    expect(container.querySelector('[data-testid="reel-item-2"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="reel-item-0"]')).toBeNull();
  });

  it("marks only the active mounted entry with data-active=true", () => {
    mockVisibleIndices = new Set([0, 1]);
    const entries = [makeReelEntry(0), makeReelEntry(1), makeReelEntry(2)];
    mockUseFeed.mockReturnValue({
      entries,
      activeIndex: 0,
      setActiveIndex: vi.fn(),
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries }));
    });
    expect(container.querySelector('[data-testid="reel-item-0"]')?.getAttribute("data-active")).toBe("true");
    expect(container.querySelector('[data-testid="reel-item-1"]')?.getAttribute("data-active")).toBe("false");
  });

  it("renders no reel items or placeholders when entries is empty", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: [] }));
    });
    expect(container.querySelectorAll('[data-testid^="reel-item-"]').length).toBe(0);
    expect(container.querySelectorAll('[data-testid="reel-slide-placeholder"]').length).toBe(0);
  });

  it("forwards the nav onTimeUpdate to the mounted ReelItem", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    expect(capturedReelItemProps[0]?.["onTimeUpdate"]).toBe(navResult.emitTimeUpdate);
  });

  it("onAutoAdvance calls goNext unconditionally (not gated on user interaction)", () => {
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    const advance = capturedReelItemProps[0]?.["onAutoAdvance"] as () => void;
    act(() => advance());
    expect(navResult.goNext).toHaveBeenCalledTimes(1);
  });

  it("passes setActiveIndex as onSlideEnter and no-op defaults for the rest to useEmblaFeed", () => {
    const setActiveIndex = vi.fn();
    mockUseFeed.mockReturnValue({
      entries: mockEntries,
      activeIndex: 0,
      setActiveIndex,
      isAdActive: false,
      activeReel: undefined,
    });
    act(() => {
      root.render(React.createElement(Feed, { entries: mockEntries }));
    });
    expect(capturedNavOptions?.onSlideEnter).toBe(setActiveIndex);
    expect(() => {
      capturedNavOptions?.onSlideAway(0, undefined);
      capturedNavOptions?.onTimeUpdate(0, 0, 0);
    }).not.toThrow();
  });
});
