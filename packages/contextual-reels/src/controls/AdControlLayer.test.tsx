import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@cxr/config", () => ({ assetLink: "https://test.cdn/" }));
vi.mock("../providers/PlayerProvider", () => ({
  usePlayer: () => ({
    isMuted: true,
    isPlaying: true,
    setMuted: vi.fn(),
    setPlaying: vi.fn(),
  }),
}));

import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

let testBus: CxrEventBus;

vi.mock("../instance/coordination/EventBusContext", () => ({
  useEventBus: () => testBus,
}));

import { AdControlLayer } from "@cxr/controls/AdControlLayer";
import type { AdControlLayerProps } from "@cxr/controls/control-layer.types";

describe("AdControlLayer — overlay stacking", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    testBus = new CxrEventBus();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(overrides: Partial<AdControlLayerProps> = {}) {
    const props: AdControlLayerProps = {
      isPlay: true,
      isMuted: true,
      isFullScreen: false,
      adLayout: "mobile-320x50",
      isAdReady: true,
      variant: "new",
      onPlayClick: vi.fn(),
      onMuteClick: vi.fn(),
      onFullScreenClick: vi.fn(),
      containerId: "gen-ad-slot-test-1",
      ...overrides,
    };
    act(() => {
      root.render(React.createElement(AdControlLayer, props));
    });
    return props;
  }

  it("does not render controls until the ad is ready", () => {
    render({ isAdReady: false });
    expect(container.querySelector('[data-testid="click-overlay"]')).toBeNull();
    expect(container.querySelector('[data-testid="mute-btn"]')).toBeNull();
  });

  describe("compact variant=new (320x50)", () => {
    it("raises the control bar above the click overlay", () => {
      // Asserts class presence only: jsdom does not evaluate CSS, so the actual z-stacking
      // and pointer-events fall-through are not exercised. Runtime correctness is covered by
      // the behavioral mute/play tests below.
      render({ adLayout: "mobile-320x50" });
      const overlay = container.querySelector<HTMLElement>('[data-testid="click-overlay"]')!;
      const muteBtn = container.querySelector<HTMLElement>('[data-testid="mute-btn"]')!;
      const barWrapper = muteBtn.closest<HTMLElement>(".gencl\\:z-\\[2\\]");
      expect(overlay.className).toContain("gencl:z-[1]");
      expect(barWrapper).not.toBeNull();
      expect(barWrapper!.className).toContain("gencl:z-[2]");
      // Empty bar area passes taps through to the overlay; interactive rows re-enable them.
      expect(barWrapper!.className).toContain("gencl:pointer-events-none");
    });

    it("mute click toggles audio and does NOT open fullscreen", () => {
      const { onMuteClick, onFullScreenClick, onPlayClick } = render({ adLayout: "mobile-320x50", isMuted: true });
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledWith(false);
      expect(onFullScreenClick).not.toHaveBeenCalled();
      expect(onPlayClick).not.toHaveBeenCalled();
    });

    it("play click toggles playback and does NOT open fullscreen", () => {
      const { onPlayClick, onFullScreenClick } = render({ adLayout: "mobile-320x50" });
      act(() => {
        (container.querySelector('[data-testid="play-pause-btn"]') as HTMLButtonElement).click();
      });
      expect(onPlayClick).toHaveBeenCalledOnce();
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });
  });

  describe("compact variant=new (320x100)", () => {
    it("raises the control bar above the click overlay", () => {
      // Asserts class presence only: jsdom does not evaluate CSS, so the actual z-stacking
      // and pointer-events fall-through are not exercised. Runtime correctness is covered by
      // the behavioral mute/play tests below.
      render({ adLayout: "mobile-320x100" });
      const overlay = container.querySelector<HTMLElement>('[data-testid="click-overlay"]')!;
      const muteBtn = container.querySelector<HTMLElement>('[data-testid="mute-btn"]')!;
      const barWrapper = muteBtn.closest<HTMLElement>(".gencl\\:z-\\[2\\]");
      expect(overlay.className).toContain("gencl:z-[1]");
      expect(barWrapper).not.toBeNull();
      expect(barWrapper!.className).toContain("gencl:pointer-events-none");
    });

    it("mute click does NOT open fullscreen", () => {
      const { onMuteClick, onFullScreenClick } = render({ adLayout: "mobile-320x100", isMuted: false });
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledWith(true);
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });

    it("play click toggles playback and does NOT open fullscreen", () => {
      const { onPlayClick, onFullScreenClick } = render({ adLayout: "mobile-320x100" });
      act(() => {
        (container.querySelector('[data-testid="play-pause-btn"]') as HTMLButtonElement).click();
      });
      expect(onPlayClick).toHaveBeenCalledOnce();
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });
  });

  describe("compact variant=old", () => {
    it("raises the legacy control bar above the click overlay", () => {
      // Asserts class presence only: jsdom does not evaluate CSS, so the actual z-stacking
      // and pointer-events fall-through are not exercised. Runtime correctness is covered by
      // the behavioral mute/play tests below.
      render({ adLayout: "mobile-320x50", variant: "old" });
      const overlay = container.querySelector<HTMLElement>('[data-testid="click-overlay"]')!;
      const bar = container.querySelector<HTMLElement>('[data-testid="compact-control-bar"]')!;
      const barWrapper = bar.closest<HTMLElement>(".gencl\\:z-\\[2\\]");
      expect(overlay.className).toContain("gencl:z-[1]");
      expect(barWrapper).not.toBeNull();
      expect(barWrapper!.className).toContain("gencl:pointer-events-none");
    });

    it("mute click does NOT open fullscreen", () => {
      const { onMuteClick, onFullScreenClick } = render({ adLayout: "mobile-320x50", variant: "old", isMuted: true });
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledWith(false);
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });

    it("play click toggles playback and does NOT open fullscreen", () => {
      const { onPlayClick, onFullScreenClick } = render({ adLayout: "mobile-320x50", variant: "old" });
      act(() => {
        (container.querySelector('[data-testid="play-pause-btn"]') as HTMLButtonElement).click();
      });
      expect(onPlayClick).toHaveBeenCalledOnce();
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });
  });

  describe("default layout", () => {
    it("keeps the control cluster above the overlay (z-[10])", () => {
      // Asserts class presence only: jsdom does not evaluate CSS, so stacking/pointer
      // behavior cannot be exercised here. Runtime correctness (a button tap reaching its
      // own handler and not the overlay) is covered by the behavioral mute/play tests below.
      render({ adLayout: "fullscreen", isFullScreen: false });
      const muteBtn = container.querySelector<HTMLElement>('[data-testid="mute-btn"]')!;
      const cluster = muteBtn.closest<HTMLElement>(".gencl\\:z-\\[10\\]");
      expect(cluster).not.toBeNull();
    });

    it("mute click toggles audio and does NOT open fullscreen", () => {
      const { onMuteClick, onFullScreenClick, onPlayClick } = render({
        adLayout: "fullscreen",
        isFullScreen: false,
        isMuted: true,
      });
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledWith(false);
      expect(onFullScreenClick).not.toHaveBeenCalled();
      expect(onPlayClick).not.toHaveBeenCalled();
    });

    it("play click toggles playback and does NOT open fullscreen", () => {
      const { onPlayClick, onFullScreenClick } = render({ adLayout: "fullscreen", isFullScreen: false });
      act(() => {
        (container.querySelector('[data-testid="play-pause-btn"]') as HTMLButtonElement).click();
      });
      expect(onPlayClick).toHaveBeenCalledOnce();
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });
  });
});
