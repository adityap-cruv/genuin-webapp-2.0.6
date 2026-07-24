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
  mockSendEvent,
  capturedGenAdSlotProps,
  capturedAdControlLayerProps,
} = vi.hoisted(() => ({
  mockUsePlayer: vi.fn(),
  mockUseFullScreen: vi.fn(),
  mockUseAdWaterfall: vi.fn(),
  mockBusEmit: vi.fn(),
  mockUseInactivityAdvance: vi.fn(),
  mockSendEvent: vi.fn(),
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
vi.mock("../../instance/InstanceContext", () => ({
  useInstanceId: () => "test-instance",
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
vi.mock("../../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: mockSendEvent, setBrandId: vi.fn(), setBaseEventContext: vi.fn() }),
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
    mockUseFullScreen.mockReturnValue({
      isFullScreen: false,
      isFullScreenSupported: true,
      toggleFullScreen,
    });
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
      root.render(React.createElement(AdLayout, { ad: baseAd, isActive: true, onAutoAdvance }));
    });
  }

  // ── Tap behavior ───────────────────────────────────────────────────────────

  it("handleAdClick (non-fullscreen): emits ad:unmuteRequest, unmutes, and resumes play when paused", () => {
    render();
    // Ad entries autoplay on activation (a mount effect, not the click handler
    // under test) — clear that call so the assertion below isolates the click.
    setPlaying.mockClear();
    const slot = container.querySelector('[data-testid="ad-layout"]') as HTMLElement;
    act(() => slot.click());
    expect(mockBusEmit).toHaveBeenCalledWith("ad:unmuteRequest", {
      containerId: "gen-ad-slot-test-instance-7",
    });
    expect(setMuted).toHaveBeenCalledWith(false);
    // isPlaying is false in this suite's beforeEach — a muted+paused tap must resume playback.
    expect(setPlaying).toHaveBeenCalledWith(true);
  });

  it("handleAdClick (non-fullscreen): does not touch play state when already playing", () => {
    mockUsePlayer.mockReturnValue({
      isMuted: true,
      isPlaying: true,
      setMuted,
      setPlaying,
    });
    render();
    setPlaying.mockClear();
    const slot = container.querySelector('[data-testid="ad-layout"]') as HTMLElement;
    act(() => slot.click());
    expect(setMuted).toHaveBeenCalledWith(false);
    expect(setPlaying).not.toHaveBeenCalled();
  });

  it("handleAdClick (fullscreen): toggles play and fires the SDK onClick", () => {
    mockUseFullScreen.mockReturnValue({
      isFullScreen: true,
      toggleFullScreen,
    });
    mockUsePlayer.mockReturnValue({ isMuted: false, isPlaying: true, setMuted, setPlaying });
    render();
    const ctaOnClick = vi.fn();
    act(() => {
      (lastGenAdSlot()["onAdCTA"] as (cta: { ctaUrl: string; onClick: () => void }) => void)({
        ctaUrl: "https://cta.example/x",
        onClick: ctaOnClick,
      });
    });
    const slot = container.querySelector('[data-testid="ad-layout"]') as HTMLElement;
    act(() => slot.click());
    expect(setPlaying).toHaveBeenCalledWith(false);
    expect(ctaOnClick).toHaveBeenCalledTimes(1);
    expect(setMuted).not.toHaveBeenCalled();
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

  it("ad mute button emits Muted/Unmuted (by_user) and updates player mute state", () => {
    render();
    const layer = capturedAdControlLayerProps.at(-1);
    const onMuteClick = layer?.["onMuteClick"] as (m: boolean) => void;

    act(() => onMuteClick(true));
    expect(setMuted).toHaveBeenCalledWith(true);
    expect(mockSendEvent).toHaveBeenCalledWith("Muted", { by_user: true });

    act(() => onMuteClick(false));
    expect(setMuted).toHaveBeenCalledWith(false);
    expect(mockSendEvent).toHaveBeenCalledWith("Unmuted", { by_user: true });
  });

  it("onWaterfallSuccess forwards to onAdSuccess with the slot id", () => {
    render();
    act(() => (lastGenAdSlot()["onWaterfallSuccess"] as (p: string) => void)("video"));
    expect(onAdSuccess).toHaveBeenCalledWith("video", String(baseAd.id));
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
    expect(mockUseInactivityAdvance).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }));
  });

  it("passes destroySignal=1 when inactive", () => {
    act(() => {
      root.render(React.createElement(AdLayout, { ad: baseAd, isActive: false }));
    });
    expect(lastGenAdSlot()["destroySignal"]).toBe(1);
  });

  // ─── Additional branch coverage ──────────────────────────────────────────────
  it("does not treat the ad as an audio ad when audioAds is absent (falls back to false)", () => {
    render();
    // audioAds is typed as a required boolean, but upstream data isn't always
    // guaranteed to conform — the component guards with `ad.audioAds ?? false`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- exercising the ?? fallback for malformed data
    const adWithoutAudioAds = { ...baseAd, audioAds: undefined } as any as NormalisedAd;
    act(() => {
      root.render(React.createElement(AdLayout, { ad: adWithoutAudioAds, isActive: true }));
    });
    expect(mockUseInactivityAdvance).toHaveBeenLastCalledWith(expect.objectContaining({ isActive: false }));
  });

  it("defaults isMuted to false in AdControlLayer when usePlayer reports undefined", () => {
    mockUsePlayer.mockReturnValue({ isMuted: undefined, isPlaying: false, setMuted, setPlaying });
    render();
    const layer = capturedAdControlLayerProps.at(-1);
    expect(layer?.["isMuted"]).toBe(false);
  });

  it("AdControlLayer onPlayClick toggles play state via setPlaying(!isPlaying)", () => {
    render();
    const layer = capturedAdControlLayerProps.at(-1);
    const onPlayClick = layer?.["onPlayClick"] as () => void;
    act(() => onPlayClick());
    // isPlaying starts false in the default mock → toggled to true.
    expect(setPlaying).toHaveBeenCalledWith(true);
  });
});
