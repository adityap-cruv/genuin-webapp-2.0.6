/**
 * Tests for ReelList — Phase 2 FeedEntry.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { FeedEntry, TagResponse } from "@cxr/types";

vi.mock("./ReelItem", () => ({
  ReelItem: (props: { entry: FeedEntry; isActive: boolean }) =>
    React.createElement("div", {
      "data-testid": `reel-item-${props.entry.data.id}`,
      "data-active": String(props.isActive),
    }),
}));

vi.mock("./useFeedNavigation", () => ({
  useEmblaFeed: vi.fn(() => ({
    activeIndex: 0,
    goNext: vi.fn(),
    goPrev: vi.fn(),
    goTo: vi.fn(),
    onTimeUpdate: vi.fn(),
    visibleIndices: new Set([0]),
  })),
}));

import { ReelList } from "@cxr/feed/ReelList";

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

const mockTagDetails: TagResponse = { tag_id: "tag-1" };

describe("ReelList", () => {
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
});
