import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { ReelSlidePlaceholder } from "@cxr/feed/ReelSlidePlaceholder";
import type { TagResponse } from "@cxr/types";

describe("ReelSlidePlaceholder", () => {
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

  it("renders a full-height aria-hidden box", () => {
    act(() => root.render(React.createElement(ReelSlidePlaceholder, {})));
    const el = container.querySelector('[data-testid="reel-slide-placeholder"]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute("aria-hidden")).toBe("true");
  });

  it("fetches nothing — renders no img or video node", () => {
    act(() => root.render(React.createElement(ReelSlidePlaceholder, { tagDetails: { tag_id: "t" } })));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("video")).toBeNull();
  });

  it("uses the tag brand_color as the background for video slides", () => {
    const tagDetails = { tag_id: "t", brand_color: "#ff0000" } as TagResponse;
    act(() => root.render(React.createElement(ReelSlidePlaceholder, { tagDetails })));
    const el = container.querySelector('[data-testid="reel-slide-placeholder"]');
    expect(el?.getAttribute("style")).toContain("rgb(255, 0, 0)");
  });

  it("uses the neutral shimmer base for ad slides, ignoring brand_color", () => {
    // Ad slots overlay a #1a1a1a shimmer while GenAd loads; matching it keeps
    // the placeholder → shimmer → ad transition seamless. A saturated brand_color
    // (e.g. a full-bleed red) reads as an error screen during the cold-start
    // window before the shimmer/video covers it. See the component doc comment.
    const tagDetails = { tag_id: "t", brand_color: "#ff0000" } as TagResponse;
    act(() => root.render(React.createElement(ReelSlidePlaceholder, { tagDetails, isAd: true })));
    const el = container.querySelector('[data-testid="reel-slide-placeholder"]');
    expect(el?.getAttribute("style")).toContain("rgb(26, 26, 26)");
    expect(el?.getAttribute("style")).not.toContain("rgb(255, 0, 0)");
  });

  it("falls back to the dark default when the tag has no brand_color", () => {
    act(() => root.render(React.createElement(ReelSlidePlaceholder, { tagDetails: { tag_id: "t" } })));
    const el = container.querySelector('[data-testid="reel-slide-placeholder"]');
    expect(el?.getAttribute("style")).toContain("rgb(26, 26, 26)");
  });
});
