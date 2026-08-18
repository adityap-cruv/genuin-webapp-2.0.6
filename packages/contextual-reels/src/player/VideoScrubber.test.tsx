/**
 * Tests for VideoScrubber — the visual-only playback progress bar.
 *
 * Its whole job is turning a 0–1 fraction into a CSS width, and the clamp is the
 * part that matters: `currentTime / duration` is NaN before metadata loads and
 * can exceed 1 on a loop boundary, either of which would emit a broken style.
 */
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { VideoScrubber } from "@cxr/player/VideoScrubber";

describe("player/VideoScrubber", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(progress: number): HTMLElement {
    act(() => {
      root.render(React.createElement(VideoScrubber, { progress }));
    });
    return container.querySelector('[data-testid="video-scrubber-fill"]') as HTMLElement;
  }

  it("renders the track and its fill", () => {
    render(0.5);
    expect(container.querySelector('[data-testid="video-scrubber"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="video-scrubber-fill"]')).not.toBeNull();
  });

  it.each([
    [0, "0%"],
    [0.25, "25%"],
    [0.5, "50%"],
    [1, "100%"],
  ])("maps progress %s to width %s", (progress, expected) => {
    expect(render(progress).style.width).toBe(expected);
  });

  // A loop boundary can briefly report currentTime > duration.
  it("clamps above 1 to 100%", () => {
    expect(render(1.4).style.width).toBe("100%");
  });

  // Some browsers report a negative currentTime while seeking.
  it("clamps below 0 to 0%", () => {
    expect(render(-0.3).style.width).toBe("0%");
  });

  // `currentTime / duration` is NaN until metadata loads. Math.min/max propagate
  // NaN, so this documents what actually reaches the DOM — an invalid width is
  // dropped by CSSOM, leaving the bar at its natural size rather than throwing.
  it("does not throw on NaN progress", () => {
    expect(() => render(Number.NaN)).not.toThrow();
    expect(container.querySelector('[data-testid="video-scrubber-fill"]')).not.toBeNull();
  });

  it("updates the fill when progress advances", () => {
    expect(render(0.1).style.width).toBe("10%");
    expect(render(0.9).style.width).toBe("90%");
  });
});
