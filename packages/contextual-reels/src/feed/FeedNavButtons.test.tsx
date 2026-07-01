/**
 * Tests for FeedNavButtons — the V2-only up/down feed nav arrows.
 *
 * Covers the three early-return gates (not V2, iheart variant, not fullscreen)
 * and the rendered path where the up/down arrows drive Embla scrollPrev/scrollNext.
 */
/* eslint-disable import/order -- the external `embla-carousel` type import trips
   import/order's group detection for the @cxr internal import; ordering is correct. */
import type { EmblaCarouselType } from "embla-carousel";
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AD_LAYOUT } from "@cxr/config";
/* eslint-enable import/order */

const { mockUseNewPlayerControls, mockUseOptionalAdWaterfall, mockUseFullScreen } = vi.hoisted(() => ({
  mockUseNewPlayerControls: vi.fn(),
  mockUseOptionalAdWaterfall: vi.fn(),
  mockUseFullScreen: vi.fn(),
}));

vi.mock("@genuin/ui/player-controls", () => ({
  NavArrowButton: (props: { direction: string; onClick: () => void }) =>
    React.createElement("button", {
      "data-testid": `nav-arrow-${props.direction}`,
      onClick: props.onClick,
    }),
}));
vi.mock("../controls/control-size", () => ({ resolveCxrControlSize: () => "lg" }));
vi.mock("../controls/useNewPlayerControls", () => ({
  useNewPlayerControls: () => mockUseNewPlayerControls(),
}));
vi.mock("../providers/AdProvider", () => ({
  useOptionalAdWaterfall: () => mockUseOptionalAdWaterfall(),
}));
vi.mock("../providers/FullScreenProvider", () => ({
  useFullScreen: () => mockUseFullScreen(),
}));

import { FeedNavButtons } from "@cxr/feed/FeedNavButtons";

describe("FeedNavButtons", () => {
  let container: HTMLDivElement;
  let root: Root;
  let scrollNext: ReturnType<typeof vi.fn>;
  let scrollPrev: ReturnType<typeof vi.fn>;
  let emblaApiRef: React.RefObject<EmblaCarouselType | null>;

  beforeEach(() => {
    vi.clearAllMocks();
    scrollNext = vi.fn();
    scrollPrev = vi.fn();
    emblaApiRef = { current: { scrollNext, scrollPrev } as unknown as EmblaCarouselType };
    mockUseNewPlayerControls.mockReturnValue(true);
    mockUseOptionalAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L1 });
    mockUseFullScreen.mockReturnValue({ isFullScreen: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(variant?: "iheart" | "default"): void {
    act(() => {
      root.render(React.createElement(FeedNavButtons, { emblaApiRef, variant }));
    });
  }

  it("renders both nav arrows in the V2 fullscreen player", () => {
    render();
    expect(container.querySelector('[data-testid="nav-arrow-up"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="nav-arrow-down"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="feed-nav-buttons"]')).toBeTruthy();
  });

  it("up arrow drives scrollPrev, down arrow drives scrollNext", () => {
    render();
    act(() => (container.querySelector('[data-testid="nav-arrow-up"]') as HTMLElement).click());
    expect(scrollPrev).toHaveBeenCalledTimes(1);
    act(() => (container.querySelector('[data-testid="nav-arrow-down"]') as HTMLElement).click());
    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  it("stops click propagation so a tap on the arrows never reaches the player", () => {
    const onParentClick = vi.fn();
    act(() => {
      root.render(
        React.createElement(
          "div",
          { onClick: onParentClick },
          React.createElement(FeedNavButtons, { emblaApiRef, variant: undefined })
        )
      );
    });
    act(() => (container.querySelector('[data-testid="feed-nav-buttons"]') as HTMLElement).click());
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("returns null when not in fullscreen", () => {
    mockUseFullScreen.mockReturnValue({ isFullScreen: false });
    render();
    expect(container.querySelector('[data-testid="feed-nav-buttons"]')).toBeNull();
  });

  it("returns null for the iheart variant (V1 controls)", () => {
    render("iheart");
    expect(container.querySelector('[data-testid="feed-nav-buttons"]')).toBeNull();
  });

  it("returns null when V2 controls are disabled", () => {
    mockUseNewPlayerControls.mockReturnValue(false);
    render();
    expect(container.querySelector('[data-testid="feed-nav-buttons"]')).toBeNull();
  });

  it("tolerates a null Embla API ref without throwing", () => {
    emblaApiRef = { current: null };
    render();
    expect(() =>
      act(() => (container.querySelector('[data-testid="nav-arrow-down"]') as HTMLElement).click())
    ).not.toThrow();
  });
});
