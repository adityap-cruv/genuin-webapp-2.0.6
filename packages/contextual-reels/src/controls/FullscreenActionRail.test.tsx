/**
 * Tests for FullscreenActionRail — the fullscreen-only spark/share action rail.
 *
 * Covers the variant/config gating that decides whether the rail renders, plus
 * the spark (open share link) and share (copy to clipboard) click handlers.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendEventMock } = vi.hoisted(() => ({ sendEventMock: vi.fn() }));
vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setBrandId: vi.fn() }),
}));

import { FullscreenActionRail } from "@cxr/controls/FullscreenActionRail";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import type { NormalisedReel, TagResponse } from "@cxr/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig(overrides: Partial<NonNullable<TagResponse["config"]>> = {}): TagResponse["config"] {
  return { ...overrides } as TagResponse["config"];
}

function makeReel(shareString?: string): NormalisedReel {
  return {
    kind: "video",
    id: 0,
    active: true,
    videoUrl: null,
    videoType: null,
    thumb: null,
    user: null,
    community: null,
    loop: null,
    ogDetails: null,
    owner: null,
    config: null,
    video: shareString != null ? { id: "vid-1", description: "A clip", share_string: shareString } : null,
    cta: null,
    playerType: "default",
  } as NormalisedReel;
}

describe("FullscreenActionRail", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    sendEventMock.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  function render(props: {
    config: TagResponse["config"];
    variant?: ControlLayerVariant;
    item?: NormalisedReel;
  }): void {
    act(() => {
      root.render(React.createElement(FullscreenActionRail, props));
    });
  }

  it("renders nothing for the iheart variant", () => {
    render({ config: makeConfig({ show_spark: true, show_share: true }), variant: "iheart" });
    expect(container.querySelector('[data-testid="fullscreen-action-rail"]')).toBeNull();
  });

  it("renders nothing when neither spark nor share is enabled", () => {
    render({ config: makeConfig({ show_spark: false, show_share: false }) });
    expect(container.querySelector('[data-testid="fullscreen-action-rail"]')).toBeNull();
  });

  it("renders nothing when config is null", () => {
    render({ config: null });
    expect(container.querySelector('[data-testid="fullscreen-action-rail"]')).toBeNull();
  });

  it("renders only the spark button when show_spark is enabled", () => {
    render({ config: makeConfig({ show_spark: true }) });
    expect(container.querySelector('[data-testid="fullscreen-action-rail"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="bottombar-spark"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="bottombar-share"]')).toBeNull();
  });

  it("renders only the share button when show_share is enabled", () => {
    render({ config: makeConfig({ show_share: true }) });
    expect(container.querySelector('[data-testid="bottombar-spark"]')).toBeNull();
    expect(container.querySelector('[data-testid="bottombar-share"]')).not.toBeNull();
  });

  it("renders both buttons when spark and share are enabled", () => {
    render({ config: makeConfig({ show_spark: true, show_share: true }) });
    expect(container.querySelector('[data-testid="bottombar-spark"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="bottombar-share"]')).not.toBeNull();
  });

  it("opens the share link in a new tab when the spark button is clicked", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    render({ config: makeConfig({ show_spark: true }), item: makeReel("https://share.test/abc") });

    const spark = container.querySelector('[data-testid="bottombar-spark"]') as HTMLButtonElement;
    act(() => {
      spark.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(openSpy).toHaveBeenCalledWith("https://share.test/abc", "_blank", "noopener,noreferrer");
  });

  it("does not open a tab when there is no share string", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    render({ config: makeConfig({ show_spark: true }) });

    const spark = container.querySelector('[data-testid="bottombar-spark"]') as HTMLButtonElement;
    act(() => {
      spark.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(openSpy).not.toHaveBeenCalled();
  });

  it("copies the share string to the clipboard when the share button is clicked", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render({ config: makeConfig({ show_share: true }), item: makeReel("https://share.test/xyz") });

    const share = container.querySelector('[data-testid="bottombar-share"]') as HTMLButtonElement;
    act(() => {
      share.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(writeText).toHaveBeenCalledWith("https://share.test/xyz");
    vi.unstubAllGlobals();
  });

  it("tracks Video Shared when the share button is clicked", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render({ config: makeConfig({ show_share: true }), item: makeReel("https://share.test/xyz") });

    const share = container.querySelector('[data-testid="bottombar-share"]') as HTMLButtonElement;
    act(() => {
      share.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(sendEventMock).toHaveBeenCalledWith("Video Shared", {
      content_id: "vid-1",
      title: "A clip",
      platform: "copy_link",
    });
    vi.unstubAllGlobals();
  });

  it("does not track Video Shared for the spark (open link) button", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    render({ config: makeConfig({ show_spark: true }), item: makeReel("https://share.test/abc") });

    const spark = container.querySelector('[data-testid="bottombar-spark"]') as HTMLButtonElement;
    act(() => {
      spark.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(sendEventMock).not.toHaveBeenCalled();
  });

  it("stops click propagation so taps never reach a React backdrop handler", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    const backdropClick = vi.fn();
    // React attaches its synthetic listeners at the root container, so a React
    // onClick on an ancestor is the correct level to assert stopPropagation against.
    act(() => {
      root.render(
        React.createElement(
          "div",
          { onClick: backdropClick },
          React.createElement(FullscreenActionRail, {
            config: makeConfig({ show_spark: true }),
            item: makeReel("https://share.test/abc"),
          })
        )
      );
    });

    const spark = container.querySelector('[data-testid="bottombar-spark"]') as HTMLButtonElement;
    act(() => {
      spark.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(backdropClick).not.toHaveBeenCalled();
  });
});
