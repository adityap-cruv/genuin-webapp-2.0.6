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

import { makeFeedEntry } from "@cxr/__fixtures__/feedEntries";
import { ReelItem } from "@cxr/feed/ReelItem";
import type { FeedEntry } from "@cxr/types";

/** Captures props passed to VideoLayout so tests can assert on forwarded values. */
const capturedVideoLayoutProps: Record<string, unknown>[] = [];

vi.mock("@cxr/feed/layouts/VideoLayout", () => ({
  VideoLayout: (props: Record<string, unknown>) => {
    capturedVideoLayoutProps.push(props);
    return React.createElement("div", { "data-testid": "video-layout" });
  },
}));

vi.mock("@cxr/feed/layouts/AdLayout", () => ({
  AdLayout: () => React.createElement("div", { "data-testid": "ad-layout" }),
}));

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

  async function render(entry: FeedEntry) {
    await act(async () => {
      root.render(
        React.createElement(
          React.Suspense,
          { fallback: null },
          React.createElement(ReelItem, {
            entry,
            isActive: true,
            onTimeUpdate: () => undefined,
          })
        )
      );
    });
  }

  it("routes ad entry (kind=ad) to AdLayout", async () => {
    await render(makeFeedEntry("ad"));
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeTruthy();
  });

  it("routes reel entry (kind=video) to VideoLayout", async () => {
    await render(makeFeedEntry("video"));
    expect(container.querySelector('[data-testid="video-layout"]')).toBeTruthy();
  });

  it("routes video-with-ad entry to VideoLayout (unified)", async () => {
    await render(makeFeedEntry("video-with-ad"));
    expect(container.querySelector('[data-testid="video-layout"]')).toBeTruthy();
    // Verify adObject is forwarded so VideoLayout can gate the ad break overlay.
    expect(capturedVideoLayoutProps.some((p) => p["adObject"] != null)).toBe(true);
  });

  it("does not render VideoLayout for an ad entry", async () => {
    await render(makeFeedEntry("ad"));
    expect(container.querySelector('[data-testid="video-layout"]')).toBeNull();
  });

  it("does not render AdLayout for a reel entry", async () => {
    await render(makeFeedEntry("video"));
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeNull();
  });

  it("does not render AdLayout for a video-with-ad entry", async () => {
    await render(makeFeedEntry("video-with-ad"));
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeNull();
  });

  it("renders an empty fragment for an unrecognised entry kind", async () => {
    // Defensive fallback: a kind outside the 3-branch router renders nothing.
    const unknownEntry = { kind: "unknown", data: makeFeedEntry("video").data } as unknown as FeedEntry;
    await render(unknownEntry);
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeNull();
    expect(container.querySelector('[data-testid="video-layout"]')).toBeNull();
  });
});
