/**
 * Tests for ReelList — Phase 2 FeedEntry.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ReelList } from "@cxr/feed/ReelList";
import type { UseFeedNavigationOptions } from "@cxr/feed/useFeedNavigation";
import type { FeedEntry, TagResponse } from "@cxr/types";

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

/** Captures the options ReelList passes into useEmblaFeed (incl. default fallbacks). */
let capturedNavOptions: UseFeedNavigationOptions | undefined;
const navResult = {
  goNext: vi.fn(),
  autoAdvance: vi.fn(),
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
      autoAdvance: navResult.autoAdvance,
      onTimeUpdate: navResult.emitTimeUpdate,
      visibleIndices: new Set([0]),
    };
  }),
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

const mockTagDetails: TagResponse = { tag_id: "tag-1" };

describe("ReelList", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    capturedReelItemProps.length = 0;
    capturedNavOptions = undefined;
    navResult.goNext.mockClear();
    navResult.emitTimeUpdate.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  it("renders the active entry", () => {
    const entries = [makeReelEntry(0), makeReelEntry(1), makeReelEntry(2)];
    act(() => {
      root.render(
        React.createElement(ReelList, { emblaApiRef: { current: null }, entries, tagDetails: mockTagDetails })
      );
    });
    expect(container.querySelector('[data-testid="reel-item-0"]')).toBeTruthy();
  });

  it("renders all entries", () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeReelEntry(i));
    act(() => {
      root.render(
        React.createElement(ReelList, { emblaApiRef: { current: null }, entries, tagDetails: mockTagDetails })
      );
    });
    expect(container.querySelectorAll('[data-testid^="reel-item-"]').length).toBe(5);
  });

  it("renders nothing when entries is empty", () => {
    act(() => {
      root.render(
        React.createElement(ReelList, { emblaApiRef: { current: null }, entries: [], tagDetails: mockTagDetails })
      );
    });
    expect(container.querySelectorAll('[data-testid^="reel-item-"]').length).toBe(0);
  });

  it("marks only the active entry with data-active=true", () => {
    const entries = [makeReelEntry(0), makeReelEntry(1), makeReelEntry(2)];
    act(() => {
      root.render(
        React.createElement(ReelList, { emblaApiRef: { current: null }, entries, tagDetails: mockTagDetails })
      );
    });
    expect(container.querySelector('[data-testid="reel-item-0"]')?.getAttribute("data-active")).toBe("true");
    expect(container.querySelector('[data-testid="reel-item-1"]')?.getAttribute("data-active")).toBe("false");
  });

  it("forwards autoAdvance as onAutoAdvance and the nav onTimeUpdate as onTimeUpdate to each ReelItem", () => {
    const entries = [makeReelEntry(0), makeReelEntry(1)];
    act(() => {
      root.render(
        React.createElement(ReelList, { emblaApiRef: { current: null }, entries, tagDetails: mockTagDetails })
      );
    });
    const first = capturedReelItemProps[0];
    // Auto-advance must go through the flagged variant so the resulting
    // Swipe Next analytics event reports auto_swipe: true.
    expect(first?.["onAutoAdvance"]).toBe(navResult.autoAdvance);
    expect(first?.["onTimeUpdate"]).toBe(navResult.emitTimeUpdate);
  });

  it("supplies no-op default callbacks to useEmblaFeed when none are passed", () => {
    const entries = [makeReelEntry(0)];
    act(() => {
      root.render(
        React.createElement(ReelList, { emblaApiRef: { current: null }, entries, tagDetails: mockTagDetails })
      );
    });
    expect(capturedNavOptions).toBeDefined();
    // The defaults are real no-op functions — invoking them must not throw.
    expect(() => {
      capturedNavOptions?.onSlideAway(0, undefined);
      capturedNavOptions?.onSlideEnter(0);
      capturedNavOptions?.onTimeUpdate(0, 0, 0);
    }).not.toThrow();
  });

  it("forwards caller-supplied navigation callbacks through to useEmblaFeed", () => {
    const onSlideAway = vi.fn();
    const onSlideEnter = vi.fn();
    const onTimeUpdate = vi.fn();
    act(() => {
      root.render(
        React.createElement(ReelList, {
          emblaApiRef: { current: null },
          entries: [makeReelEntry(0)],
          tagDetails: mockTagDetails,
          onSlideAway,
          onSlideEnter,
          onTimeUpdate,
        })
      );
    });
    expect(capturedNavOptions?.onSlideAway).toBe(onSlideAway);
    expect(capturedNavOptions?.onSlideEnter).toBe(onSlideEnter);
    expect(capturedNavOptions?.onTimeUpdate).toBe(onTimeUpdate);
  });
});
