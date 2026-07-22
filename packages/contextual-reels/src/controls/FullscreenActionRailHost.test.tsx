/**
 * Tests for FullscreenActionRailHost — the anchor that decides whether the
 * fullscreen action rail is mounted (gated by fullscreen state and ad activity)
 * and where it is positioned.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FullscreenActionRailHost } from "@cxr/controls/FullscreenActionRailHost";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import type { NormalisedReel, TagResponse } from "@cxr/types";

vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: vi.fn(), setBrandId: vi.fn() }),
}));

const tagDetailsState = vi.hoisted(() => ({
  tagDetails: undefined as TagResponse | undefined,
}));
vi.mock("@cxr/providers/TagDetailsProvider", () => ({
  useTagDetails: () => ({ tagDetails: tagDetailsState.tagDetails, apiFailed: false }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTagDetails(overrides: Partial<NonNullable<TagResponse["config"]>> = {}): TagResponse {
  return { config: { show_spark: true, show_share: true, ...overrides } } as TagResponse;
}

function makeReel(): NormalisedReel {
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
    video: { share_string: "https://share.test/abc" },
    cta: null,
    playerType: "default",
  } as NormalisedReel;
}

describe("FullscreenActionRailHost", () => {
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

  /** tagDetails flows through the mocked useTagDetails, not a component prop. */
  function render(props: {
    tagDetails: TagResponse;
    variant?: ControlLayerVariant;
    isFullScreen: boolean;
    isAdActive: boolean;
    item?: NormalisedReel;
  }): void {
    const { tagDetails, ...rest } = props;
    tagDetailsState.tagDetails = tagDetails;
    act(() => {
      root.render(React.createElement(FullscreenActionRailHost, rest));
    });
  }

  it("renders nothing when not in fullscreen", () => {
    render({ tagDetails: makeTagDetails(), isFullScreen: false, isAdActive: false });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).toBeNull();
  });

  it("renders nothing when an ad is active", () => {
    render({ tagDetails: makeTagDetails(), isFullScreen: true, isAdActive: true });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).toBeNull();
  });

  it("renders the anchor and rail in fullscreen with no active ad", () => {
    render({ tagDetails: makeTagDetails(), isFullScreen: true, isAdActive: false, item: makeReel() });
    const anchor = container.querySelector('[data-testid="fullscreen-action-rail-anchor"]');
    expect(anchor).not.toBeNull();
    expect(container.querySelector('[data-testid="fullscreen-action-rail"]')).not.toBeNull();
  });

  it("positions the anchor to the right of the 9:16 video box", () => {
    render({ tagDetails: makeTagDetails(), isFullScreen: true, isAdActive: false });
    const anchor = container.querySelector('[data-testid="fullscreen-action-rail-anchor"]') as HTMLDivElement;
    expect(anchor.style.left).toContain("calc(50% +");
  });

  it("renders the anchor but no rail for the iheart variant", () => {
    render({ tagDetails: makeTagDetails(), variant: "iheart", isFullScreen: true, isAdActive: false });
    expect(container.querySelector('[data-testid="fullscreen-action-rail-anchor"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="fullscreen-action-rail"]')).toBeNull();
  });
});
