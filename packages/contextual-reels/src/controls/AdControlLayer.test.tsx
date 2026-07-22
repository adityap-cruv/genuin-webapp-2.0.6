import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@cxr/config", () => ({
  assetLink: "https://test.cdn/",
  apiurl: "https://api.begenuin.com",
  AD_LAYOUT: { Unknown: 0, L1: 1, L2: 2, L3: 3, L4: 4 },
  isCompactLayout: (id: number) => id === 3 || id === 4,
}));
vi.mock("../providers/PlayerProvider", () => ({
  usePlayer: () => ({
    isMuted: true,
    isPlaying: true,
    setMuted: vi.fn(),
    setPlaying: vi.fn(),
  }),
}));


let testBus: CxrEventBus;

vi.mock("../instance/InstanceContext", () => ({
  useEventBus: () => testBus,
  useOptionalEventBus: () => testBus,
}));

import { AD_LAYOUT } from "@cxr/config";
import { AdControlLayer } from "@cxr/controls/AdControlLayer";
import type { AdControlLayerProps } from "@cxr/controls/control-layer.types";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

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
      adLayout: AD_LAYOUT.L3,
      isAdReady: true,
      onPlayClick: vi.fn(),
      onMuteClick: vi.fn(),
      onFullScreenClick: vi.fn(),
      containerId: "gen-ad-slot-test-1",
      redirectMode: false,
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

  describe("compact 320x50", () => {
    it("wraps the control bar in a pointer-events-none raised layer", () => {
      // The tap-to-fullscreen ClickOverlay was removed from compact ad layouts, so there is
      // no overlay to stack against. The bar wrapper stays z-[2] + pointer-events-none so its
      // empty area passes taps through while interactive rows re-enable them. jsdom does not
      // evaluate CSS, so class presence is the assertion; runtime correctness is covered below.
      render({ adLayout: AD_LAYOUT.L3 });
      const muteBtn = container.querySelector<HTMLElement>('[data-testid="mute-btn"]')!;
      const barWrapper = muteBtn.closest<HTMLElement>(".gencl\\:z-\\[2\\]");
      expect(barWrapper).not.toBeNull();
      expect(barWrapper!.className).toContain("gencl:z-[2]");
      expect(barWrapper!.className).toContain("gencl:pointer-events-none");
    });

    it("mute click toggles audio and does NOT open fullscreen", () => {
      const { onMuteClick, onFullScreenClick, onPlayClick } = render({ adLayout: AD_LAYOUT.L3, isMuted: true });
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledWith(false);
      expect(onFullScreenClick).not.toHaveBeenCalled();
      expect(onPlayClick).not.toHaveBeenCalled();
    });

    it("play click toggles playback and does NOT open fullscreen", () => {
      const { onPlayClick, onFullScreenClick } = render({ adLayout: AD_LAYOUT.L3 });
      act(() => {
        (container.querySelector('[data-testid="play-pause-btn"]') as HTMLButtonElement).click();
      });
      expect(onPlayClick).toHaveBeenCalledOnce();
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });
  });

  describe("compact 320x100", () => {
    it("wraps the control bar in a pointer-events-none raised layer", () => {
      // ClickOverlay removed from compact ad layouts (see 320x50 note above).
      render({ adLayout: AD_LAYOUT.L4 });
      const muteBtn = container.querySelector<HTMLElement>('[data-testid="mute-btn"]')!;
      const barWrapper = muteBtn.closest<HTMLElement>(".gencl\\:z-\\[2\\]");
      expect(barWrapper).not.toBeNull();
      expect(barWrapper!.className).toContain("gencl:pointer-events-none");
    });

    it("mute click does NOT open fullscreen", () => {
      // First tap is pre-engagement: handleMute fires onMuteClick(false) ("I want audio")
      // regardless of the incoming isMuted, per the useAudioEngaged enticement model.
      const { onMuteClick, onFullScreenClick } = render({ adLayout: AD_LAYOUT.L4, isMuted: false });
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
      });
      expect(onMuteClick).toHaveBeenCalledWith(false);
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });

    it("play click toggles playback and does NOT open fullscreen", () => {
      const { onPlayClick, onFullScreenClick } = render({ adLayout: AD_LAYOUT.L4 });
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
      render({ adLayout: AD_LAYOUT.L1, isFullScreen: false });
      const muteBtn = container.querySelector<HTMLElement>('[data-testid="mute-btn"]')!;
      const cluster = muteBtn.closest<HTMLElement>(".gencl\\:z-\\[10\\]");
      expect(cluster).not.toBeNull();
    });

    it("mute click toggles audio and does NOT open fullscreen", () => {
      const { onMuteClick, onFullScreenClick, onPlayClick } = render({
        adLayout: AD_LAYOUT.L1,
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
      const { onPlayClick, onFullScreenClick } = render({ adLayout: AD_LAYOUT.L1, isFullScreen: false });
      act(() => {
        (container.querySelector('[data-testid="play-pause-btn"]') as HTMLButtonElement).click();
      });
      expect(onPlayClick).toHaveBeenCalledOnce();
      expect(onFullScreenClick).not.toHaveBeenCalled();
    });
  });
});
