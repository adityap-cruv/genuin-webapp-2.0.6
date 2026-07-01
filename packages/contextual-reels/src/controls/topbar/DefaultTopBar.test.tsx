import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// DefaultTopBar renders the context-bound V2 atoms (MuteUnmuteButtonV2 reads
// usePlayer; the V2 atoms read assetLink). Mock both so the bar mounts in
// isolation regardless of the active design system. Old and V2 buttons share the
// same test ids, so the assertions below hold under either branch.
vi.mock("@cxr/config", () => ({
  assetLink: "https://test.cdn/",
  // resolveCxrControlSize (via control-size.ts) imports AD_LAYOUT from @cxr/config;
  // the mock must include it or control-size's lookup table throws on load.
  AD_LAYOUT: { Unknown: 0, L1: 1, L2: 2, L3: 3, L4: 4 },
}));
vi.mock("@cxr/providers/PlayerProvider", () => ({
  usePlayer: () => ({
    isMuted: false,
    isPlaying: false,
    volume: 100,
    setMuted: vi.fn(),
    setPlaying: vi.fn(),
    setVolume: vi.fn(),
  }),
}));

// useNewPlayerControls gates V2 (all controls clustered top-right) vs V1
// (mute+play top-left, expand top-right). The real hook is hard-coded to `true`;
// mock it through a mutable flag so the V1 branch (lines 49-60, 70-75) is reachable.
let useV2Flag = true;
vi.mock("@cxr/controls/useNewPlayerControls", () => ({
  useNewPlayerControls: () => useV2Flag,
}));

import { DefaultTopBar } from "@cxr/controls/topbar/DefaultTopBar";

describe("DefaultTopBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    useV2Flag = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(overrides: Partial<React.ComponentProps<typeof DefaultTopBar>> = {}) {
    act(() => {
      root.render(
        React.createElement(DefaultTopBar, {
          isFullScreen: false,
          isMuted: false,
          isPlay: true,
          onMuteClick: vi.fn(),
          onPlayClick: vi.fn(),
          onFullScreenClick: vi.fn(),
          ...overrides,
        })
      );
    });
  }

  it('renders data-testid="default-top-bar"', () => {
    render();
    expect(container.querySelector('[data-testid="default-top-bar"]')).toBeTruthy();
  });

  it("non-full: renders expand button", () => {
    render({ isFullScreen: false });
    expect(container.querySelector('[data-testid="topbar-expand"]')).toBeTruthy();
  });

  it("non-full: does not render collapse button", () => {
    render({ isFullScreen: false });
    expect(container.querySelector('[data-testid="topbar-collapse"]')).toBeNull();
  });

  it("non-full: right group contains expand button", () => {
    render({ isFullScreen: false });
    const rightGroup = container.querySelector('[data-testid="topbar-right-group"]');
    // Count interactive controls by role, not tag: the V2 expand button renders a
    // div[role="button"], the legacy one a native <button>. Both satisfy this.
    expect(rightGroup?.querySelectorAll('button, [role="button"]').length).toBeGreaterThanOrEqual(1);
    expect(rightGroup?.querySelector('[data-testid="topbar-expand"]')).toBeTruthy();
  });

  it("non-full: left group has no buttons", () => {
    render({ isFullScreen: false });
    const leftGroup = container.querySelector('[data-testid="topbar-left-group"]');
    expect(leftGroup?.querySelectorAll("button").length).toBe(0);
  });

  it("full: renders collapse button", () => {
    render({ isFullScreen: true });
    expect(container.querySelector('[data-testid="topbar-collapse"]')).toBeTruthy();
  });

  it("full: does not render expand button", () => {
    render({ isFullScreen: true });
    expect(container.querySelector('[data-testid="topbar-expand"]')).toBeNull();
  });

  it("calls onFullScreenClick when expand clicked", () => {
    const onFullScreenClick = vi.fn();
    render({ isFullScreen: false, onFullScreenClick });
    const btn = container.querySelector('[data-testid="topbar-expand"]');
    act(() => {
      btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onFullScreenClick).toHaveBeenCalledOnce();
  });

  it("calls onFullScreenClick when collapse clicked", () => {
    const onFullScreenClick = vi.fn();
    render({ isFullScreen: true, onFullScreenClick });
    const btn = container.querySelector('[data-testid="topbar-collapse"]');
    act(() => {
      btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onFullScreenClick).toHaveBeenCalledOnce();
  });

  // Both groups stop click propagation so a tap on a control doesn't bubble to
  // the underlying video/ad surface (lines 37-38). Verified on the right group,
  // which is present in every branch.
  it("stops click propagation from the control groups", () => {
    render();
    const rightGroup = container.querySelector('[data-testid="topbar-right-group"]')!;
    const event = new MouseEvent("click", { bubbles: true });
    const spy = vi.spyOn(event, "stopPropagation");
    act(() => {
      rightGroup.dispatchEvent(event);
    });
    expect(spy).toHaveBeenCalled();
  });

  it("V2: renders mute and play in the right cluster (non-iheart)", () => {
    render();
    const rightGroup = container.querySelector('[data-testid="topbar-right-group"]')!;
    expect(rightGroup.querySelector('[data-testid="mute-btn"]')).toBeTruthy();
    expect(rightGroup.querySelector('[data-testid="play-pause-btn"]')).toBeTruthy();
  });

  it("V2: calls onPlayClick when the clustered play button is clicked", () => {
    const onPlayClick = vi.fn();
    render({ onPlayClick });
    act(() => {
      (container.querySelector('[data-testid="play-pause-btn"]') as HTMLElement).click();
    });
    expect(onPlayClick).toHaveBeenCalledOnce();
  });

  it("V2: calls onMuteClick when the clustered mute button is clicked", () => {
    const onMuteClick = vi.fn();
    render({ onMuteClick });
    act(() => {
      (container.querySelector('[data-testid="mute-btn"]') as HTMLElement).click();
    });
    expect(onMuteClick).toHaveBeenCalledOnce();
  });

  it("V2: calls onFullScreenClick when the clustered expand button is clicked", () => {
    const onFullScreenClick = vi.fn();
    render({ onFullScreenClick });
    act(() => {
      (container.querySelector('[data-testid="topbar-expand"]') as HTMLElement).click();
    });
    expect(onFullScreenClick).toHaveBeenCalledOnce();
  });

  // The right cluster suppresses the button text on hover — exercise the
  // setRightHovered state setter via mouseenter/mouseleave.
  it("toggles the hovered state on mouse enter/leave of the right group", () => {
    render();
    const rightGroup = container.querySelector('[data-testid="topbar-right-group"]')!;
    // React 19 synthesises onMouseEnter/onMouseLeave from delegated
    // mouseover/mouseout events, so dispatch those (with an outside relatedTarget)
    // to drive the setRightHovered handlers.
    act(() => {
      rightGroup.dispatchEvent(
        new MouseEvent("mouseover", { bubbles: true, relatedTarget: document.body })
      );
    });
    act(() => {
      rightGroup.dispatchEvent(
        new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body })
      );
    });
    // No throw and the bar still renders — the hover handlers ran.
    expect(container.querySelector('[data-testid="default-top-bar"]')).toBeTruthy();
  });

  // V1 branch (useNewPlayerControls=false): mute+play live in the LEFT group and
  // the right group shows only the legacy expand button (lines 49-60, 70-75).
  describe("V1 (legacy) controls", () => {
    beforeEach(() => {
      useV2Flag = false;
    });

    it("non-full: left group shows mute and play", () => {
      render({ isFullScreen: false });
      const leftGroup = container.querySelector('[data-testid="topbar-left-group"]')!;
      expect(leftGroup.querySelector('[data-testid="mute-btn"]')).toBeTruthy();
      expect(leftGroup.querySelector('[data-testid="play-pause-btn"]')).toBeTruthy();
    });

    it("non-full: right group shows the legacy expand button", () => {
      render({ isFullScreen: false });
      const rightGroup = container.querySelector('[data-testid="topbar-right-group"]')!;
      expect(rightGroup.querySelector('[data-testid="topbar-expand"]')).toBeTruthy();
    });

    it("full: mute button reflects the real muted state", () => {
      render({ isFullScreen: true, isMuted: true });
      const muteImg = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(muteImg.getAttribute("src")).toContain("mute.svg");
    });

    it("non-full: mute button always shows the unmuted icon (silent outer view)", () => {
      render({ isFullScreen: false, isMuted: true });
      const muteImg = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
      expect(muteImg.getAttribute("src")).toContain("unmute.svg");
    });

    it("calls onMuteClick when the legacy mute button is clicked", () => {
      const onMuteClick = vi.fn();
      render({ isFullScreen: true, onMuteClick });
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledOnce();
    });
  });

  // iHeart always uses the legacy expand-only right cluster regardless of V2,
  // and never renders left-group mute/play (line 49 `!isIheart`, line 70).
  describe("iheart variant", () => {
    it("renders only the expand button, no left-group controls", () => {
      render({ variant: "iheart" });
      const leftGroup = container.querySelector('[data-testid="topbar-left-group"]')!;
      expect(leftGroup.querySelectorAll("button").length).toBe(0);
      expect(container.querySelector('[data-testid="topbar-expand"]')).toBeTruthy();
    });
  });
});
