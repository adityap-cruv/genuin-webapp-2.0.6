/**
 * Tests for useFullscreenAdBreak — the fullscreen ad break state machine.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { buildReelAdObject } from "@cxr/feed/feedTransforms";
import {
  COMPLETED_COVER_MS,
  useFullscreenAdBreak,
  type UseFullscreenAdBreakOptions,
  type UseFullscreenAdBreakResult,
} from "@cxr/feed/hooks/useFullscreenAdBreak";

interface ShimProps extends UseFullscreenAdBreakOptions {
  onResult: (result: UseFullscreenAdBreakResult) => void;
}

function HookShim({ onResult, ...options }: ShimProps): null {
  onResult(useFullscreenAdBreak(options));
  return null;
}

describe("useFullscreenAdBreak", () => {
  let container: HTMLDivElement;
  let root: Root;
  let latest: UseFullscreenAdBreakResult;
  let onAdComplete: ReturnType<typeof vi.fn>;

  const adObject = buildReelAdObject(0);

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    onAdComplete = vi.fn();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  function render(options: Partial<UseFullscreenAdBreakOptions>): void {
    act(() => {
      root.render(
        React.createElement(HookShim, {
          isActive: true,
          adObject,
          onAdComplete,
          ...options,
          onResult: (result) => {
            latest = result;
          },
        })
      );
    });
  }

  it("requests an ad when active in the outer (non-expanded) view too", () => {
    render({});
    expect(latest.status).toBe("requesting");
    expect(latest.shouldMountAd).toBe(true);
    expect(latest.isOverlayMounted).toBe(true);
  });

  it("requests once per activation across the expand transition — no re-request while active", () => {
    // The outer carousel view and the expanded fullscreen view can both report
    // isActive=true during the expand/collapse swap. This hook is the per-reel
    // gatekeeper: once it leaves "idle" it must never re-enter "requesting" on a
    // re-render while still active, so a sustained-active swap fires no second
    // waterfall request (the removed isFullScreen guard relied on this).
    render({});
    expect(latest.status).toBe("requesting");

    // Multiple active re-renders simulate the view swap holding isActive=true.
    render({});
    render({});
    expect(latest.status).toBe("requesting");

    act(() => latest.handleWaterfallSuccess("video"));
    expect(latest.status).toBe("playing");

    // Re-render again mid-transition — must stay "playing", never bounce back to
    // "requesting" (which would tear down and re-request the ad).
    render({});
    render({});
    expect(latest.status).toBe("playing");
    expect(latest.shouldMountAd).toBe(true);
  });

  it("stays idle without an adObject", () => {
    render({ adObject: undefined });
    expect(latest.status).toBe("idle");
    expect(latest.shouldMountAd).toBe(false);
  });

  it("requests an ad when active — overlay mounted but invisible", () => {
    render({});
    expect(latest.status).toBe("requesting");
    expect(latest.shouldMountAd).toBe(true);
    expect(latest.isOverlayMounted).toBe(true);
    expect(latest.isAdVisible).toBe(false);
    expect(latest.suppressVideo).toBe(false);
  });

  it("plays the ad after waterfall success — visible, video suppressed", () => {
    render({});
    act(() => latest.handleWaterfallSuccess("video"));
    expect(latest.status).toBe("playing");
    expect(latest.isAdVisible).toBe(true);
    expect(latest.suppressVideo).toBe(true);
    expect(latest.shouldMountAd).toBe(true);
  });

  it("fails non-blockingly on waterfall fail — overlay unmounts, no advance", () => {
    render({});
    act(() => latest.handleWaterfallFail());
    expect(latest.status).toBe("failed");
    expect(latest.shouldMountAd).toBe(false);
    expect(latest.isOverlayMounted).toBe(false);
    expect(latest.suppressVideo).toBe(false);
    expect(onAdComplete).not.toHaveBeenCalled();
  });

  it("advances the feed on completion and keeps the black cover up", () => {
    render({});
    act(() => latest.handleWaterfallSuccess("video"));
    act(() => latest.handleAdCompleted());
    expect(latest.status).toBe("completed");
    expect(onAdComplete).toHaveBeenCalledTimes(1);
    // Slot gone (SDK destroyed) but the cover stays opaque for the scroll.
    expect(latest.shouldMountAd).toBe(false);
    expect(latest.isOverlayMounted).toBe(true);
    expect(latest.isAdVisible).toBe(true);
    expect(latest.suppressVideo).toBe(true);
  });

  it("holds the cover through slide-away, then releases to idle", () => {
    render({});
    act(() => latest.handleWaterfallSuccess("video"));
    act(() => latest.handleAdCompleted());
    // Feed advanced — this reel deactivates while the carousel animates.
    render({ isActive: false });
    expect(latest.status).toBe("completed");
    expect(latest.isOverlayMounted).toBe(true);
    act(() => vi.advanceTimersByTime(COMPLETED_COVER_MS));
    expect(latest.status).toBe("idle");
    expect(latest.isOverlayMounted).toBe(false);
  });

  it("falls back to failed when there is nothing to advance to (last item)", () => {
    render({});
    act(() => latest.handleWaterfallSuccess("video"));
    act(() => latest.handleAdCompleted());
    // Still active after the hold → release without re-request.
    act(() => vi.advanceTimersByTime(COMPLETED_COVER_MS));
    expect(latest.status).toBe("failed");
    expect(latest.isOverlayMounted).toBe(false);
    expect(latest.suppressVideo).toBe(false);
  });

  it("does not re-request after a failure within the same slide activation", () => {
    render({});
    act(() => latest.handleWaterfallFail());
    // Re-render with unchanged active state — must stay failed.
    render({});
    expect(latest.status).toBe("failed");
    expect(latest.shouldMountAd).toBe(false);
  });

  it("re-requests only after the slide deactivates and re-activates", () => {
    render({});
    act(() => latest.handleWaterfallFail());
    render({ isActive: false });
    expect(latest.status).toBe("idle");
    render({ isActive: true });
    expect(latest.status).toBe("requesting");
  });

  it("keeps a filled ad playing across re-renders (e.g. collapse)", () => {
    render({});
    act(() => latest.handleWaterfallSuccess("video"));
    render({});
    expect(latest.status).toBe("playing");
    expect(latest.shouldMountAd).toBe(true);
    expect(latest.suppressVideo).toBe(true);
  });

  it("does not cancel a pending request on a view re-render while still active", () => {
    render({});
    expect(latest.status).toBe("requesting");
    render({});
    expect(latest.status).toBe("requesting");
    expect(latest.shouldMountAd).toBe(true);
  });

  it("completes and advances, then releases the cover on deactivation", () => {
    render({});
    act(() => latest.handleWaterfallSuccess("video"));
    act(() => latest.handleAdCompleted());
    expect(latest.status).toBe("completed");
    expect(onAdComplete).toHaveBeenCalledTimes(1);
    // Feed advanced — this reel deactivates, cover holds, then releases.
    render({ isActive: false });
    expect(latest.status).toBe("completed");
    act(() => vi.advanceTimersByTime(COMPLETED_COVER_MS));
    expect(latest.status).toBe("idle");
  });

  it("resets to idle when the slide deactivates mid-request", () => {
    render({});
    act(() => latest.handleWaterfallSuccess("video"));
    render({ isActive: false });
    expect(latest.status).toBe("idle");
    expect(latest.shouldMountAd).toBe(false);
  });
});
