/**
 * Tests for AdLayout — exercises the click/fullscreen/waterfall-fail handlers and
 * the provider-driven branches (muted/playing, fullscreen, containerId emit).
 *
 * GenAdSlot and AdControlLayer are mocked to capture the callback props AdLayout
 * passes down, so the handler bodies (handleAdClick, handleFullScreenClick,
 * handleWaterfallFail) can be invoked directly through those props.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AD_LAYOUT } from "@cxr/config";
import { AdLayout } from "@cxr/feed/layouts/AdLayout";
import type { NormalisedAd } from "@cxr/types";

// ─── Hoisted mock fns so each test can reconfigure provider return values ──────
const {
  mockUsePlayer,
  mockUseFullScreen,
  mockUseAdWaterfall,
  mockBusEmit,
  mockUseInactivityAdvance,
  capturedGenAdSlotProps,
  capturedAdControlLayerProps,
} = vi.hoisted(() => ({
  mockUsePlayer: vi.fn(),
  mockUseFullScreen: vi.fn(),
  mockUseAdWaterfall: vi.fn(),
  mockBusEmit: vi.fn(),
  mockUseInactivityAdvance: vi.fn(),
  capturedGenAdSlotProps: [] as Record<string, unknown>[],
  capturedAdControlLayerProps: [] as Record<string, unknown>[],
}));

vi.mock("../../ads/GenAdSlot", () => ({
  GenAdSlot: (props: Record<string, unknown>) => {
    capturedGenAdSlotProps.push(props);
    return React.createElement("div", { "data-testid": "gen-ad-slot" });
  },
}));
vi.mock("../../ads/adSlotProps", () => ({
  genAdSlotAdProps: () => ({}),
}));
vi.mock("../../controls/AdControlLayer", () => ({
  AdControlLayer: (props: Record<string, unknown>) => {
    capturedAdControlLayerProps.push(props);
    return React.createElement("div", { "data-testid": "ad-control-layer" });
  },
}));
vi.mock("../hooks/useInactivityAdvance", () => ({
  useInactivityAdvance: mockUseInactivityAdvance,
}));
vi.mock("../../instance/registry/InstanceContext", () => ({
  useInstanceId: () => "test-instance",
}));
vi.mock("../../instance/coordination/EventBusContext", () => ({
  useEventBus: () => ({ emit: mockBusEmit, on: vi.fn(() => () => undefined), off: vi.fn() }),
}));
vi.mock("../../providers/PlayerProvider", () => ({
  usePlayer: () => mockUsePlayer(),
}));
vi.mock("../../providers/FullScreenProvider", () => ({
  useFullScreen: () => mockUseFullScreen(),
}));
vi.mock("../../providers/AdProvider", () => ({
  useAdWaterfall: () => mockUseAdWaterfall(),
}));


const baseAd: NormalisedAd = {
  kind: "ad",
  id: 7,
  active: true,
  videoUrl: null,
  videoType: null,
  audioAds: true,
  videoAds: false,
  videoAd: undefined,
  videoAdAdvertiserDetails: undefined,
  videoAdContentVideo: undefined,
  displayAd: undefined,
  nativeAd: undefined,
  videoPlatform: undefined,
  nativePlatform: undefined,
  displayPlatform: undefined,
  adUrl: undefined,
  gateOnUnmute: false,
};

/** Latest captured props for the named mock, or throws if none captured. */
function lastGenAdSlot(): Record<string, unknown> {
  const props = capturedGenAdSlotProps.at(-1);
  if (!props) throw new Error("GenAdSlot was not rendered");
  return props;
}

describe("AdLayout handlers", () => {
  let container: HTMLDivElement;
  let root: Root;
  let setMuted: ReturnType<typeof vi.fn>;
  let setPlaying: ReturnType<typeof vi.fn>;
  let onAdSuccess: ReturnType<typeof vi.fn>;
  let onAdFail: ReturnType<typeof vi.fn>;
  let toggleFullScreen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedGenAdSlotProps.length = 0;
    capturedAdControlLayerProps.length = 0;
    setMuted = vi.fn();
    setPlaying = vi.fn();
    onAdSuccess = vi.fn();
    onAdFail = vi.fn();
    toggleFullScreen = vi.fn();
    mockUsePlayer.mockReturnValue({
      isMuted: true,
      isPlaying: false,
      setMuted,
      setPlaying,
    });
    mockUseFullScreen.mockReturnValue({ isFullScreen: false, toggleFullScreen });
    mockUseAdWaterfall.mockReturnValue({ onAdSuccess, onAdFail, adLayout: AD_LAYOUT.Unknown });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(onAutoAdvance?: () => void): void {
    act(() => {
      root.render(
        React.createElement(AdLayout, { ad: baseAd, isActive: true, onAutoAdvance })
      );
    });
  }

  it("handleAdClick (non-fullscreen): emits ad:unmuteRequest and unmutes, never toggles play", () => {
    render();
    const slot = container.querySelector('[data-testid="ad-layout"]') as HTMLElement;
    act(() => slot.click());
    expect(mockBusEmit).toHaveBeenCalledWith("ad:unmuteRequest", {
      containerId: "gen-ad-slot-test-instance-7",
    });
    expect(setMuted).toHaveBeenCalledWith(false);
    expect(setPlaying).not.toHaveBeenCalled();
  });

  it("handleAdClick (fullscreen): toggles play instead of unmuting", () => {
    mockUseFullScreen.mockReturnValue({ isFullScreen: true, toggleFullScreen });
    mockUsePlayer.mockReturnValue({ isMuted: false, isPlaying: true, setMuted, setPlaying });
    render();
    const slot = container.querySelector('[data-testid="ad-layout"]') as HTMLElement;
    act(() => slot.click());
    expect(setPlaying).toHaveBeenCalledWith(false);
    expect(mockBusEmit).not.toHaveBeenCalled();
    expect(setMuted).not.toHaveBeenCalled();
  });

  it("handleAdClick fires the SDK ctaDetails.onClick once a CTA is registered", () => {
    render();
    const ctaOnClick = vi.fn();
    // GenAdSlot reports a CTA — drives the ctaDetails state used by handleAdClick.
    act(() => {
      (lastGenAdSlot()["onAdCTA"] as (cta: { onClick: () => void }) => void)({ onClick: ctaOnClick });
    });
    const slot = container.querySelector('[data-testid="ad-layout"]') as HTMLElement;
    act(() => slot.click());
    expect(ctaOnClick).toHaveBeenCalledTimes(1);
  });

  it("handleWaterfallFail advances the carousel and notifies onAdFail", () => {
    const onAutoAdvance = vi.fn();
    render(onAutoAdvance);
    act(() => (lastGenAdSlot()["onWaterfallFail"] as () => void)());
    expect(onAutoAdvance).toHaveBeenCalledTimes(1);
    expect(onAdFail).toHaveBeenCalledTimes(1);
  });

  it("handleWaterfallFail is safe without an onAutoAdvance callback", () => {
    render();
    expect(() => act(() => (lastGenAdSlot()["onWaterfallFail"] as () => void)())).not.toThrow();
    expect(onAdFail).toHaveBeenCalledTimes(1);
  });

  it("handleFullScreenClick unmutes when entering fullscreen, then toggles", () => {
    render();
    act(() => (lastGenAdSlot()["onFullScreenClick"] as () => void)());
    expect(setMuted).toHaveBeenCalledWith(false);
    expect(toggleFullScreen).toHaveBeenCalledTimes(1);
  });

  it("handleFullScreenClick does not unmute when already fullscreen", () => {
    mockUseFullScreen.mockReturnValue({ isFullScreen: true, toggleFullScreen });
    render();
    act(() => (lastGenAdSlot()["onFullScreenClick"] as () => void)());
    expect(setMuted).not.toHaveBeenCalled();
    expect(toggleFullScreen).toHaveBeenCalledTimes(1);
  });

  it("onPlayClick / onMuteClick / onAdPlay / onAdPause wire through to the player setters", () => {
    render();
    const slot = lastGenAdSlot();
    act(() => (slot["onPlayClick"] as () => void)());
    expect(setPlaying).toHaveBeenCalledWith(true);
    act(() => (slot["onMuteClick"] as (m: boolean) => void)(true));
    expect(setMuted).toHaveBeenCalledWith(true);
    act(() => (slot["onAdPlay"] as () => void)());
    expect(setPlaying).toHaveBeenCalledWith(true);
    act(() => (slot["onAdPause"] as () => void)());
    expect(setPlaying).toHaveBeenCalledWith(false);
  });

  it("onWaterfallSuccess forwards to the waterfall's onAdSuccess", () => {
    render();
    expect(lastGenAdSlot()["onWaterfallSuccess"]).toBe(onAdSuccess);
  });

  it("onAdLoadedChange toggles the AdControlLayer isAdReady flag", () => {
    render();
    act(() => (lastGenAdSlot()["onAdLoadedChange"] as (ready: boolean) => void)(true));
    const layer = capturedAdControlLayerProps.at(-1);
    expect(layer?.["isAdReady"]).toBe(true);
  });

  it("passes destroySignal=0 when active and toggles inactivity advance for audio ads", () => {
    render();
    expect(lastGenAdSlot()["destroySignal"]).toBe(0);
    expect(mockUseInactivityAdvance).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true })
    );
  });

  it("passes destroySignal=1 when inactive", () => {
    act(() => {
      root.render(React.createElement(AdLayout, { ad: baseAd, isActive: false }));
    });
    expect(lastGenAdSlot()["destroySignal"]).toBe(1);
  });
});
