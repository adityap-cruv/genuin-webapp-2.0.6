/**
 * Tests for FeedSkeleton — the loading shimmer shown while tag config or feed
 * data resolves. Trivial component: mount it and assert the skeleton element
 * (with its inline keyframes style) renders.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { FeedSkeleton } from "@cxr/app/FeedSkeleton";

describe("FeedSkeleton", () => {
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

  it('renders the skeleton element with data-testid="cxr-skeleton"', () => {
    act(() => {
      root.render(React.createElement(FeedSkeleton));
    });
    const skeleton = container.querySelector('[data-testid="cxr-skeleton"]');
    expect(skeleton).toBeTruthy();
  });

  it("includes the shimmer keyframes in an inline <style> tag", () => {
    act(() => {
      root.render(React.createElement(FeedSkeleton));
    });
    const style = container.querySelector('[data-testid="cxr-skeleton"] style');
    expect(style?.textContent).toContain("cxr-shimmer");
  });
});
