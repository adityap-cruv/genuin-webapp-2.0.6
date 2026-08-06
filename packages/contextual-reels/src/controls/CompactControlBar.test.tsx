/**
 * Tests for CompactControlBar — data-driven row visibility.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { CompactControlBar, type CompactControlBarProps } from "@cxr/controls/CompactControlBar";
import { StrategyProvider } from "@cxr/strategies/StrategyProvider";

// StrategyProvider reads tagId/brandId from useTagDetails() (context), not
// props. Mock it so the real StrategyProvider resolves the configured tag.
const { useTagDetailsMock } = vi.hoisted(() => ({
  useTagDetailsMock: vi.fn(() => ({
    tagId: undefined as string | undefined,
    brandId: undefined as number | undefined,
  })),
}));
vi.mock("@cxr/providers/TagDetailsProvider", () => ({
  useTagDetails: () => useTagDetailsMock(),
}));

describe("CompactControlBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  const baseProps: CompactControlBarProps = {
    size: "md",
    isMuted: true,
    onMuteClick: vi.fn(),
  };

  beforeEach(() => {
    useTagDetailsMock.mockReturnValue({ tagId: undefined, brandId: undefined });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(props: Partial<CompactControlBarProps>): void {
    act(() => {
      root.render(React.createElement(CompactControlBar, { ...baseProps, ...props }));
    });
  }

  const query = (testId: string) => container.querySelector(`[data-testid="${testId}"]`);

  it("renders the icon cluster and Watch row with no optional data", () => {
    render({});
    expect(query("compact-control-bar")).toBeTruthy();
    expect(query("compact-bar-top-row")).toBeTruthy();
    expect(query("compact-bar-actions")).toBeTruthy();
    expect(query("compact-bar-identity-image")).toBeNull();
    expect(query("compact-bar-identity-name")).toBeNull();
    expect(query("compact-bar-description")).toBeNull();
  });

  it("renders identity image and name when provided", () => {
    render({ identity: { imageUrl: "https://example.com/a.png", name: "on3" } });
    expect(query("compact-bar-identity-image")).toBeTruthy();
    expect(query("compact-bar-identity-name")?.textContent).toBe("on3");
  });

  it("renders name without image (and vice versa) based on data", () => {
    render({ identity: { name: "on3" } });
    expect(query("compact-bar-identity-image")).toBeNull();
    expect(query("compact-bar-identity-name")).toBeTruthy();

    render({ identity: { imageUrl: "https://example.com/a.png" } });
    expect(query("compact-bar-identity-image")).toBeTruthy();
    expect(query("compact-bar-identity-name")).toBeNull();
  });

  it("renders the description row only when description is set", () => {
    render({ description: "Andy & Ari share the best traditions" });
    expect(query("compact-bar-description")?.textContent).toContain("Andy & Ari");

    render({ description: undefined });
    expect(query("compact-bar-description")).toBeNull();
  });

  it("renders the Linkout in md when CTA data is complete", () => {
    render({ cta: { url: "https://example.com", caption: "Shop Now" } });
    const link = container.querySelector('a[href="https://example.com"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("Shop Now");
  });

  it("does not render the Linkout when CTA data is incomplete", () => {
    render({ cta: { url: "https://example.com", caption: "" } });
    expect(container.querySelector('a[href="https://example.com"]')).toBeNull();
  });

  it("does not render the Linkout in sm even with complete CTA data", () => {
    render({ size: "sm", cta: { url: "https://example.com", caption: "Shop Now" } });
    expect(container.querySelector('a[href="https://example.com"]')).toBeNull();
  });

  it("renders no actions row in video sm (showWatchInSm omitted)", () => {
    render({ size: "sm", description: "A scrolling caption" });
    expect(query("compact-bar-actions")).toBeNull();
    // Video sm keeps its ticker.
    expect(query("compact-bar-description")).toBeTruthy();
  });

  it("renders a Watch-only actions row in ad sm (showWatchInSm, no description)", () => {
    // Ad sm passes no description — genAd renders it externally — so only Watch shows.
    render({ size: "sm", showWatchInSm: true });
    expect(query("compact-bar-actions")).toBeTruthy();
    expect(container.querySelector('[data-testid="watch-btn"]')).toBeTruthy();
    expect(query("compact-bar-description")).toBeNull();
  });

  it("packs ticker + Watch side by side in video sm (showWatchInSm + description)", () => {
    render({ size: "sm", showWatchInSm: true, description: "A scrolling caption" });
    expect(container.querySelector('[data-testid="watch-btn"]')).toBeTruthy();
    // Both share the second row; the ticker flexes to the leftover width.
    const ticker = query("compact-bar-description");
    expect(ticker).toBeTruthy();
    expect(ticker?.className).toContain("gencl:flex-1");
  });

  // Regression for an audible-start compact VIDEO (e.g. tag with initialVolume:0.2).
  // The bar mounts with no EventBusProvider, so the only audio-action signal is the
  // local mute-tap latch. PlayerProvider would never emit `mute:unmuted` on a
  // mute-DOWN transition, so without the latch the icon would keep showing
  // "sound on" over actually-muted playback.
  const muteIconFile = (): string | null => {
    const img = container.querySelector('[data-testid="mute-btn"] img');
    return img ? (img.getAttribute("src")?.split("/").pop() ?? null) : null;
  };

  it("audible-start: tapping mute ends the enticement and shows the real muted icon", () => {
    const onMuteClick = vi.fn();
    // Audible at load (isMuted=false): icon shows the sound-on enticement.
    render({ isMuted: false, onMuteClick });
    expect(muteIconFile()).toBe("unmute.svg");

    // Tap mute — an audio action even though it sets the player TO muted.
    act(() => {
      (container.querySelector('[data-testid="mute-btn"]') as HTMLElement).click();
    });
    expect(onMuteClick).toHaveBeenCalledTimes(1);

    // Player is now muted; the bar must reflect the REAL state, not the enticement.
    render({ isMuted: true, onMuteClick });
    expect(muteIconFile()).toBe("mute.svg");
  });

  // When the tag is configured to start audible (initialVolume > 0) there is no
  // silent-start enticement, so the mute icon must reflect the REAL `isMuted`
  // immediately — no tap required to "engage" audio.
  it("fires onPlayClick when the play/pause button is tapped", () => {
    const onPlayClick = vi.fn();
    render({ onPlayClick });
    act(() => {
      (container.querySelector('[data-testid="play-pause-btn"]') as HTMLElement).click();
    });
    expect(onPlayClick).toHaveBeenCalledOnce();
  });

  it("play/watch taps are safe no-ops when their handlers are omitted (noop fallback)", () => {
    // No onPlayClick / onWatchClick / onFullScreenClick → the shared `noop`
    // fallback runs. Clicking must not throw.
    render({ onPlayClick: undefined, onWatchClick: undefined, onFullScreenClick: undefined });
    act(() => {
      (container.querySelector('[data-testid="play-pause-btn"]') as HTMLElement).click();
      (container.querySelector('[data-testid="watch-btn"]') as HTMLElement).click();
    });
    expect(query("compact-control-bar")).toBeTruthy();
  });

  it("fires onFullScreenClick when the expand/collapse button is tapped", () => {
    const onFullScreenClick = vi.fn();
    render({ onFullScreenClick });
    act(() => {
      (container.querySelector('[data-testid="topbar-expand"]') as HTMLElement).click();
    });
    expect(onFullScreenClick).toHaveBeenCalledOnce();
  });

  it("Watch tap prefers onWatchClick over onFullScreenClick", () => {
    const onWatchClick = vi.fn();
    const onFullScreenClick = vi.fn();
    render({ onWatchClick, onFullScreenClick });
    act(() => {
      (container.querySelector('[data-testid="watch-btn"]') as HTMLElement).click();
    });
    expect(onWatchClick).toHaveBeenCalledOnce();
    expect(onFullScreenClick).not.toHaveBeenCalled();
  });

  it("Watch tap falls back to onFullScreenClick when onWatchClick is absent", () => {
    const onFullScreenClick = vi.fn();
    render({ onFullScreenClick });
    act(() => {
      (container.querySelector('[data-testid="watch-btn"]') as HTMLElement).click();
    });
    expect(onFullScreenClick).toHaveBeenCalledOnce();
  });

  it("invokes the CTA onClick when the Linkout is tapped", () => {
    const onClick = vi.fn();
    render({ cta: { url: "https://example.com", caption: "Shop Now", onClick } });
    act(() => {
      (container.querySelector('a[href="https://example.com"]') as HTMLElement).click();
    });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("audible-config (initialVolume > 0): shows the real muted icon without any interaction", () => {
    // Tag 6a2fefd87ce338c3a5afc605 is configured with initialVolume: 0.2.
    // StrategyProvider reads the tagId from useTagDetails(), so drive it there.
    useTagDetailsMock.mockReturnValue({ tagId: "6a2fefd87ce338c3a5afc605", brandId: undefined });
    act(() => {
      root.render(
        React.createElement(
          StrategyProvider,
          null,
          React.createElement(CompactControlBar, { ...baseProps, isMuted: true })
        )
      );
    });
    // No mute:unmuted, no tap — yet the icon is the real muted state, not the
    // sound-on enticement (which silent-start would show here).
    expect(muteIconFile()).toBe("mute.svg");
  });

  describe("expandEnabled", () => {
    it("hides the expand button when expandEnabled is false", () => {
      render({ size: "md", expandEnabled: false });
      expect(container.querySelector('[data-testid="topbar-expand"]')).toBeNull();
    });

    it("shows the expand button when expandEnabled is true", () => {
      render({ size: "md", expandEnabled: true });
      expect(container.querySelector('[data-testid="topbar-expand"]')).not.toBeNull();
    });

    it("shows the expand button by default (expandEnabled omitted)", () => {
      render({ size: "md" });
      expect(container.querySelector('[data-testid="topbar-expand"]')).not.toBeNull();
    });

    // The Watch button is also an expand entry point (handleWatch falls back to
    // onFullScreenClick), so it hides alongside the dedicated expand button.
    it("md: hides the Watch button too when expandEnabled is false", () => {
      render({ size: "md", expandEnabled: false });
      expect(query("watch-btn")).toBeNull();
    });

    it("sm: hides the showWatchInSm Watch button when expandEnabled is false", () => {
      render({ size: "sm", showWatchInSm: true, expandEnabled: false });
      expect(query("watch-btn")).toBeNull();
    });

    it("md: still shows the Watch button when expandEnabled is true", () => {
      render({ size: "md", expandEnabled: true });
      expect(query("watch-btn")).toBeTruthy();
    });
  });

  describe("isFullScreenSupported", () => {
    it("md: hides the expand button when isFullScreenSupported is false", () => {
      render({ size: "md", isFullScreenSupported: false });
      expect(container.querySelector('[data-testid="topbar-expand"]')).toBeNull();
    });

    it("md: hides the Watch button when isFullScreenSupported is false", () => {
      render({ size: "md", isFullScreenSupported: false });
      expect(query("watch-btn")).toBeNull();
    });

    it("sm: hides the showWatchInSm Watch button when isFullScreenSupported is false", () => {
      render({ size: "sm", showWatchInSm: true, isFullScreenSupported: false });
      expect(query("watch-btn")).toBeNull();
    });

    it("shows expand and Watch by default (isFullScreenSupported omitted)", () => {
      render({ size: "md" });
      expect(container.querySelector('[data-testid="topbar-expand"]')).not.toBeNull();
      expect(query("watch-btn")).toBeTruthy();
    });

    it("md: the Linkout still renders (and fills the row alone) when Watch hides for isFullScreenSupported: false", () => {
      render({
        size: "md",
        isFullScreenSupported: false,
        cta: { url: "https://example.com", caption: "Shop Now" },
      });
      expect(query("watch-btn")).toBeNull();
      const link = container.querySelector('a[href="https://example.com"]');
      expect(link).toBeTruthy();
      expect(link?.textContent).toContain("Shop Now");
    });

    it("sm: shows a compact (xs) Linkout in the Watch slot when isFullScreenSupported is false and CTA data is present (ad only)", () => {
      render({
        size: "sm",
        showWatchInSm: true,
        isFullScreenSupported: false,
        cta: { url: "https://example.com", caption: "Shop Now", logoUrl: "https://logo.png" },
      });
      expect(query("watch-btn")).toBeNull();
      const link = container.querySelector('[data-testid="linkout-btn"]');
      expect(link).toBeTruthy();
      expect(link?.textContent).toContain("Shop Now");
      // xs: no logo, no chevron, capped width.
      expect(link?.querySelector("img")).toBeNull();
      expect(link?.querySelector("svg")).toBeNull();
      expect(link?.className).toContain("max-w-17.5");
    });

    it("sm: does not show the Linkout in the Watch slot when there is no CTA data (video)", () => {
      render({ size: "sm", showWatchInSm: true, isFullScreenSupported: false });
      expect(query("watch-btn")).toBeNull();
      expect(container.querySelector('[data-testid="linkout-btn"]')).toBeNull();
    });

    it("sm: shows the Linkout instead of Watch even when fullscreen is supported (isFullScreenSupported: true)", () => {
      render({
        size: "sm",
        showWatchInSm: true,
        isFullScreenSupported: true,
        cta: { url: "https://example.com", caption: "Shop Now" },
      });
      expect(query("watch-btn")).toBeNull();
      const link = container.querySelector('[data-testid="linkout-btn"]');
      expect(link).toBeTruthy();
      expect(link?.textContent).toContain("Shop Now");
    });
  });
});
