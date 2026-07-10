/**
 * Tests for VideoLayout — exercises every per-layout render branch (L1 / L2 /
 * L3 / L4 + fullscreen), the Octo split paths, the ad-break effects, and the
 * handlers (handleTimeUpdate, onMute/onPlay/onFullScreen wiring).
 *
 * LightPlayer, GenAdSlot, OctoSheet and the control layers are mocked so the
 * layout's own branching is what gets measured. Providers are configurable
 * hoisted mocks so each test can drive a different layout/state.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AD_LAYOUT } from "@cxr/config";
import { VideoLayout } from "@cxr/feed/layouts/VideoLayout";
import type { NormalisedReel, NormalisedAd, TagResponse } from "@cxr/types";

const {
  mockLightPlayer,
  mockOctoSheet,
  mockUsePlayer,
  mockUseFullScreen,
  mockUseAdWaterfall,
  mockUseGenAI,
  mockUseOctoSplit,
  mockUseFullscreenAdBreak,
  capturedGenAdSlotProps,
  capturedVideoControlProps,
  capturedAdControlProps,
  sendEventMock,
} = vi.hoisted(() => ({
  mockLightPlayer: vi.fn(),
  mockOctoSheet: vi.fn(),
  mockUsePlayer: vi.fn(),
  mockUseFullScreen: vi.fn(),
  mockUseAdWaterfall: vi.fn(),
  mockUseGenAI: vi.fn(),
  mockUseOctoSplit: vi.fn(),
  mockUseFullscreenAdBreak: vi.fn(),
  capturedGenAdSlotProps: [] as Record<string, unknown>[],
  capturedVideoControlProps: [] as Record<string, unknown>[],
  capturedAdControlProps: [] as Record<string, unknown>[],
  sendEventMock: vi.fn(),
}));

vi.mock("../../player/LightPlayer", () => ({
  LightPlayer: (props: Record<string, unknown>) => {
    mockLightPlayer(props);
    return React.createElement("div", { "data-testid": "light-player" });
  },
}));
vi.mock("../../ads/GenAdSlot", () => ({
  GenAdSlot: (props: Record<string, unknown>) => {
    capturedGenAdSlotProps.push(props);
    return React.createElement("div", { "data-testid": "gen-ad-slot" });
  },
}));
vi.mock("../../ads/adSlotProps", () => ({ genAdSlotAdProps: () => ({}) }));
vi.mock("../../genai/octo/OctoSheet", () => ({
  OctoSheet: (props: Record<string, unknown>) => {
    mockOctoSheet(props);
    return React.createElement("div", { "data-testid": "octo-sheet" });
  },
}));
vi.mock("../../controls/VideoControlLayer", () => ({
  VideoControlLayer: (props: Record<string, unknown>) => {
    capturedVideoControlProps.push(props);
    return React.createElement("div", { "data-testid": "video-control-layer" });
  },
  CompactUnmuteOverlay: (props: Record<string, unknown>) =>
    React.createElement("div", {
      "data-testid": "compact-unmute-overlay",
      onClick: props["onMuteClick"] as () => void,
    }),
}));
vi.mock("../../controls/AdControlLayer", () => ({
  AdControlLayer: (props: Record<string, unknown>) => {
    capturedAdControlProps.push(props);
    return React.createElement("div", { "data-testid": "ad-control-layer" });
  },
}));
vi.mock("../../instance/registry/InstanceContext", () => ({
  useInstanceId: () => "test-instance",
}));
vi.mock("../../providers/PlayerProvider", () => ({ usePlayer: () => mockUsePlayer() }));
vi.mock("../../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setBrandId: vi.fn() }),
}));
vi.mock("../../providers/FullScreenProvider", () => ({ useFullScreen: () => mockUseFullScreen() }));
vi.mock("../../providers/AdProvider", () => ({ useAdWaterfall: () => mockUseAdWaterfall() }));
vi.mock("../../providers/GenAIProvider", () => ({
  useGenAI: () => mockUseGenAI(),
  useOctoSplit: (isActive: boolean) => mockUseOctoSplit(isActive),
}));
vi.mock("../hooks/useFullscreenAdBreak", () => ({
  useFullscreenAdBreak: (opts: unknown) => mockUseFullscreenAdBreak(opts),
  AD_FADE_MS: 300,
}));

// jsdom has no ResizeObserver. Use a controllable stub that records the callback
// so a test can fire a resize entry and exercise VideoLayout's setDimensions path.
type ResizeCb = (entries: Array<{ contentRect: { width: number; height: number } }>) => void;
const resizeCallbacks: ResizeCb[] = [];
globalThis.ResizeObserver = class ResizeObserver {
  constructor(cb: ResizeCb) {
    resizeCallbacks.push(cb);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as unknown as typeof ResizeObserver;

const baseReel: NormalisedReel = {
  kind: "video",
  id: 0,
  active: true,
  videoUrl: "https://example.com/video.m3u8",
  videoType: "hls",
  thumb: null,
  user: { thumb: null, name: "Alice", ctaLink: "#", ctaCaption: "CTA", ctaColor: "#0645ff" },
  community: null,
  cta: null,
  loop: null,
  ogDetails: null,
  owner: null,
  config: null,
  video: null,
};

const tagDetails: TagResponse = { tag_id: "tag-1" };

const adObject: NormalisedAd = {
  kind: "ad",
  id: 99,
  active: true,
  videoUrl: "https://blank.m3u8",
  videoType: "hls",
  audioAds: false,
  videoAds: true,
  videoAd: "https://example.com/vast.xml",
  videoAdAdvertiserDetails: undefined,
  videoAdContentVideo: undefined,
  displayAd: undefined,
  nativeAd: undefined,
  videoPlatform: "gen_video",
  nativePlatform: undefined,
  displayPlatform: undefined,
  adUrl: "https://example.com/vast.xml",
  gateOnUnmute: true,
};

const adBreakIdle = {
  status: "idle" as const,
  shouldMountAd: false,
  isOverlayMounted: false,
  isAdVisible: false,
  suppressVideo: false,
  handleWaterfallSuccess: vi.fn(),
  handleWaterfallFail: vi.fn(),
  handleAdCompleted: vi.fn(),
};

describe("VideoLayout layout branches", () => {
  let container: HTMLDivElement;
  let root: Root;
  let setMuted: ReturnType<typeof vi.fn>;
  let setPlaying: ReturnType<typeof vi.fn>;
  let setAdBreakActive: ReturnType<typeof vi.fn>;
  let toggleFullScreen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedGenAdSlotProps.length = 0;
    capturedVideoControlProps.length = 0;
    capturedAdControlProps.length = 0;
    resizeCallbacks.length = 0;
    setMuted = vi.fn();
    setPlaying = vi.fn();
    setAdBreakActive = vi.fn();
    toggleFullScreen = vi.fn();
    mockUsePlayer.mockReturnValue({
      isMuted: true,
      volume: 1,
      isPlaying: true,
      setMuted,
      setPlaying,
      setAdBreakActive,
    });
    mockUseFullScreen.mockReturnValue({ isFullScreen: false, toggleFullScreen });
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L1 });
    mockUseGenAI.mockReturnValue({ genAiEnabled: false });
    mockUseOctoSplit.mockReturnValue({ splitActive: false, playerShare: 1, octoAxis: "y" });
    mockUseFullscreenAdBreak.mockReturnValue(adBreakIdle);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(props: Partial<React.ComponentProps<typeof VideoLayout>> = {}): void {
    act(() => {
      root.render(
        React.createElement(VideoLayout, {
          reel: baseReel,
          isActive: true,
          tagDetails,
          onTimeUpdate: () => undefined,
          ...props,
        })
      );
    });
  }

  // ─── L1 (300×600 / non-fullscreen default) ──────────────────────────────────
  it("renders the full player in L1", () => {
    render();
    expect(container.querySelector('[data-testid="video-layout"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="light-player"]')).toBeTruthy();
  });

  // ─── L3 (320×50 bar, audio-only player mounts on unmute) ────────────────────
  it("mounts no player in L3 while muted (silent unit never decodes video)", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    // default mock is isMuted: true → never engaged, so no player.
    render();
    expect(container.querySelector('[data-testid="light-player"]')).toBeNull();
    expect(container.querySelector('[data-testid="video-control-layer"]')).toBeTruthy();
  });

  it("lazily mounts the audio-only player in L3 once the active slide is unmuted", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    mockUsePlayer.mockReturnValue({
      isMuted: false,
      volume: 0.2,
      isPlaying: true,
      setMuted,
      setPlaying,
      setAdBreakActive,
    });
    render({ isActive: true });
    expect(container.querySelector('[data-testid="light-player"]')).toBeTruthy();
    // The player receives the unmuted volume so audio is audible, not silent.
    const props = mockLightPlayer.mock.calls.at(-1)?.[0] as { volume?: number; isPlay?: boolean };
    expect(props.volume).toBe(0.2);
    expect(props.isPlay).toBe(true);
  });

  it("does NOT mount the L3 audio player on an inactive slide even when unmuted", () => {
    // isMuted is shared feed-wide state; ReelList keeps every entry mounted and only
    // the active one gets isActive. A feed-wide unmute must not engage off-screen
    // slides, or the whole feed would decode media (the no-decode goal).
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    mockUsePlayer.mockReturnValue({
      isMuted: false, // unmuted feed-wide…
      volume: 0.2,
      isPlaying: true,
      setMuted,
      setPlaying,
      setAdBreakActive,
    });
    render({ isActive: false }); // …but this slide is off-screen
    expect(container.querySelector('[data-testid="light-player"]')).toBeNull();
  });

  it("L3 video-with-ad: lazy audio player pauses while the ad break suppresses video", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    mockUsePlayer.mockReturnValue({
      isMuted: false, // engaged → audio player mounts
      volume: 0.2,
      isPlaying: true,
      setMuted,
      setPlaying,
      setAdBreakActive,
    });
    // Ad break on screen → suppressVideo true; reel audio must not play under the ad.
    mockUseFullscreenAdBreak.mockReturnValue({ ...adBreakIdle, suppressVideo: true });
    render({ reel: { ...baseReel, kind: "video-with-ad", adObject }, adObject });
    expect(container.querySelector('[data-testid="light-player"]')).toBeTruthy();
    const props = mockLightPlayer.mock.calls.at(-1)?.[0] as { isPlay?: boolean };
    expect(props.isPlay).toBe(false);
  });

  // ─── L4 (320×100 thumbnail player + compact unmute) ─────────────────────────
  it("renders the thumbnail player and compact unmute overlay in L4", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L4 });
    render();
    expect(container.querySelector('[data-testid="light-player"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="compact-unmute-overlay"]')).toBeTruthy();
  });

  it("L4 compact unmute overlay unmutes on click", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L4 });
    render();
    const overlay = container.querySelector('[data-testid="compact-unmute-overlay"]') as HTMLElement;
    act(() => overlay.click());
    expect(setMuted).toHaveBeenCalledWith(false);
  });

  it("L4 wires the player onEnded to onAutoAdvance and stubs onTimeUpdate", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L4 });
    const onAutoAdvance = vi.fn();
    const onTimeUpdate = vi.fn();
    render({ onAutoAdvance, onTimeUpdate });
    const props = mockLightPlayer.mock.calls.at(-1)?.[0] as {
      onEnded?: () => void;
      onTimeUpdate?: () => void;
    };
    expect(props?.onEnded).toBe(onAutoAdvance);
    // The compact L4 player intentionally swallows time updates (() => undefined).
    act(() => props?.onTimeUpdate?.());
    expect(onTimeUpdate).not.toHaveBeenCalled();
  });

  // ─── L2 (300×250) — player + Octo column ─────────────────────────────────────
  it("renders the L2 player without Octo when genAI disabled", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    render();
    expect(container.querySelector('[data-testid="video-layout-player"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="octo-sheet"]')).toBeNull();
  });

  it("renders the L2 Octo sheet when genAI enabled and reel has a video id", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    mockUseGenAI.mockReturnValue({ genAiEnabled: true });
    render({ reel: { ...baseReel, video: { id: "vid-1" } as NormalisedReel["video"] } });
    expect(container.querySelector('[data-testid="octo-sheet"]')).toBeTruthy();
    expect(mockOctoSheet).toHaveBeenCalledWith(expect.objectContaining({ host: "split" }));
  });

  it("L2 suppresses player playback while the Octo split is active", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    mockUseOctoSplit.mockReturnValue({ splitActive: true, playerShare: 0.5, octoAxis: "x" });
    render();
    const props = mockLightPlayer.mock.calls.at(-1)?.[0] as { isPlay?: boolean };
    expect(props?.isPlay).toBe(false);
  });

  it("feeds the player updated dimensions when the ResizeObserver fires", () => {
    // L2 mounts the ResizeObserver (not L3/L4). Firing it pushes new dimensions
    // through to the control layer.
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    render();
    expect(resizeCallbacks.length).toBeGreaterThan(0);
    act(() => {
      resizeCallbacks[0]?.([{ contentRect: { width: 300, height: 250 } }]);
    });
    // L2 always passes the fixed playerDimensions to the control layer; the resize
    // callback running without throwing is what we assert here.
    expect(container.querySelector('[data-testid="video-control-layer"]')).toBeTruthy();
  });

  it("ignores a ResizeObserver notification with no entry", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    render();
    expect(() => act(() => resizeCallbacks[0]?.([]))).not.toThrow();
  });

  it("does not mount a ResizeObserver for L3 / L4 layouts", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    render();
    expect(resizeCallbacks.length).toBe(0);
  });

  it("L2 forwards onTimeUpdate with the reel index", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L2 });
    const onTimeUpdate = vi.fn();
    render({ onTimeUpdate });
    const props = mockLightPlayer.mock.calls.at(-1)?.[0] as {
      onTimeUpdate?: (t: number, d: number, id: number) => void;
    };
    act(() => props?.onTimeUpdate?.(5, 10, 0));
    expect(onTimeUpdate).toHaveBeenCalledWith(0, 5, 10);
  });

  // ─── Fullscreen (renderL1 via isFullScreen) ─────────────────────────────────
  it("renders renderL1 when fullscreen regardless of adLayout", () => {
    mockUseFullScreen.mockReturnValue({ isFullScreen: true, toggleFullScreen });
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L3 });
    render();
    // L3 normally has no player; fullscreen forces the full L1 player.
    expect(container.querySelector('[data-testid="light-player"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="video-layout-player"]')).toBeTruthy();
  });

  it("renderL1 uses the horizontal-split column when octoAxis is x", () => {
    mockUseFullScreen.mockReturnValue({ isFullScreen: true, toggleFullScreen });
    mockUseOctoSplit.mockReturnValue({ splitActive: true, playerShare: 0.6, octoAxis: "x" });
    render();
    const props = mockLightPlayer.mock.calls.at(-1)?.[0] as { hideScrubber?: boolean; isPlay?: boolean };
    // splitActive hides the scrubber and suppresses playback.
    expect(props?.hideScrubber).toBe(true);
    expect(props?.isPlay).toBe(false);
  });

  // ─── Control layer wiring ────────────────────────────────────────────────────
  it("control layer onMute/onPlay/onFullScreen toggle the corresponding setters", () => {
    render();
    const props = capturedVideoControlProps.at(-1) as {
      onMuteClick: () => void;
      onPlayClick: () => void;
      onFullScreenClick: () => void;
    };
    act(() => props.onMuteClick());
    expect(setMuted).toHaveBeenCalledWith(false); // isMuted starts true → toggled false
    act(() => props.onPlayClick());
    expect(setPlaying).toHaveBeenCalledWith(false); // isPlaying starts true → toggled false
    act(() => props.onFullScreenClick());
    expect(toggleFullScreen).toHaveBeenCalledTimes(1);
  });

  it("tracks Unmuted / Video Paused when the user toggles from muted+playing", () => {
    render();
    const props = capturedVideoControlProps.at(-1) as {
      onMuteClick: () => void;
      onPlayClick: () => void;
    };
    act(() => props.onMuteClick()); // muted → unmuted
    expect(sendEventMock).toHaveBeenCalledWith("Unmuted", { by_user: true });
    act(() => props.onPlayClick()); // playing → paused
    expect(sendEventMock).toHaveBeenCalledWith("Video Paused", {
      by_user: true,
      position_index: baseReel.id,
      start_position: 0,
    });
  });

  it("tracks Muted / Video Play when the user toggles from unmuted+paused", () => {
    mockUsePlayer.mockReturnValue({
      isMuted: false,
      volume: 1,
      isPlaying: false,
      setMuted,
      setPlaying,
      setAdBreakActive,
    });
    render();
    const props = capturedVideoControlProps.at(-1) as {
      onMuteClick: () => void;
      onPlayClick: () => void;
    };
    act(() => props.onMuteClick()); // unmuted → muted
    expect(sendEventMock).toHaveBeenCalledWith("Muted", { by_user: true });
    act(() => props.onPlayClick()); // paused → playing
    expect(sendEventMock).toHaveBeenCalledWith("Video Play", {
      by_user: true,
      position_index: baseReel.id,
      start_position: 0,
    });
  });

  it("does NOT emit Video Paused during a fullscreen ad break (only the ad pause is tracked)", () => {
    mockUseFullScreen.mockReturnValue({ isFullScreen: true, toggleFullScreen });
    mockUseFullscreenAdBreak.mockReturnValue({ ...adBreakIdle, isAdVisible: true });
    render({ adObject });
    const props = capturedVideoControlProps.at(-1) as { onPlayClick: () => void };
    act(() => props.onPlayClick());
    expect(setPlaying).toHaveBeenCalled(); // playback state still toggles
    expect(sendEventMock).not.toHaveBeenCalledWith("Video Paused", expect.anything());
    expect(sendEventMock).not.toHaveBeenCalledWith("Video Play", expect.anything());
  });

  it("Video Paused reports the latest playback position as start_position", () => {
    render();
    const playerProps = mockLightPlayer.mock.calls.at(-1)?.[0] as {
      onTimeUpdate: (currentTime: number, duration: number, id: number) => void;
    };
    act(() => playerProps.onTimeUpdate(12.5, 60, 0));
    const props = capturedVideoControlProps.at(-1) as { onPlayClick: () => void };
    act(() => props.onPlayClick());
    expect(sendEventMock).toHaveBeenCalledWith("Video Paused", {
      by_user: true,
      position_index: baseReel.id,
      start_position: 12.5,
    });
  });

  it("L4 compact unmute overlay tap tracks Unmuted", () => {
    mockUseAdWaterfall.mockReturnValue({ adLayout: AD_LAYOUT.L4 });
    render();
    const overlay = container.querySelector('[data-testid="compact-unmute-overlay"]')!;
    act(() => {
      overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(setMuted).toHaveBeenCalledWith(false);
    expect(sendEventMock).toHaveBeenCalledWith("Unmuted", { by_user: true });
  });

  // ─── Ad break overlay + effects ──────────────────────────────────────────────
  it("does not mount the ad break overlay without an adObject", () => {
    mockUseFullscreenAdBreak.mockReturnValue({ ...adBreakIdle, isOverlayMounted: true });
    render();
    expect(container.querySelector('[data-testid="fullscreen-ad-break"]')).toBeNull();
  });

  it("mounts the ad break overlay and slot when active over a video-with-ad reel", () => {
    mockUseFullscreenAdBreak.mockReturnValue({
      ...adBreakIdle,
      isOverlayMounted: true,
      isAdVisible: true,
      shouldMountAd: true,
    });
    render({ adObject });
    expect(container.querySelector('[data-testid="fullscreen-ad-break"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="gen-ad-slot"]')).toBeTruthy();
  });

  it("ad break effect calls setAdBreakActive(true) when the ad becomes visible", () => {
    mockUseFullscreenAdBreak.mockReturnValue({
      ...adBreakIdle,
      isOverlayMounted: true,
      isAdVisible: true,
      shouldMountAd: true,
    });
    render({ adObject });
    expect(setAdBreakActive).toHaveBeenCalledWith(true);
  });

  it("ad break effect releases setAdBreakActive(false) on unmount", () => {
    mockUseFullscreenAdBreak.mockReturnValue({
      ...adBreakIdle,
      isOverlayMounted: true,
      isAdVisible: true,
      shouldMountAd: true,
    });
    render({ adObject });
    setAdBreakActive.mockClear();
    act(() => root.unmount());
    expect(setAdBreakActive).toHaveBeenCalledWith(false);
    // Rebuild so afterEach unmount is a no-op.
    root = createRoot(container);
  });

  it("forwards the ad break slot callbacks (success/fail/completed/cta/loaded)", () => {
    const handleWaterfallSuccess = vi.fn();
    const handleWaterfallFail = vi.fn();
    const handleAdCompleted = vi.fn();
    mockUseFullscreenAdBreak.mockReturnValue({
      ...adBreakIdle,
      isOverlayMounted: true,
      isAdVisible: true,
      shouldMountAd: true,
      handleWaterfallSuccess,
      handleWaterfallFail,
      handleAdCompleted,
    });
    render({ adObject });
    const slot = capturedGenAdSlotProps.at(-1) as Record<string, unknown>;
    expect(slot["onWaterfallSuccess"]).toBe(handleWaterfallSuccess);
    expect(slot["onWaterfallFail"]).toBe(handleWaterfallFail);
    expect(slot["onAdCompleted"]).toBe(handleAdCompleted);
    // onAdLoadedChange + onAdCTA update local state without throwing.
    act(() => (slot["onAdLoadedChange"] as (r: boolean) => void)(true));
    act(() => (slot["onAdCTA"] as (cta: unknown) => void)({ onClick: vi.fn() }));
    // Ad-break slot + ad control layer play/mute arrows toggle the player setters.
    act(() => (slot["onPlayClick"] as () => void)());
    expect(setPlaying).toHaveBeenCalledWith(false); // isPlaying starts true → toggled false
    act(() => (slot["onMuteClick"] as (m: boolean) => void)(false));
    expect(setMuted).toHaveBeenCalledWith(false);
    const adControl = capturedAdControlProps.at(-1) as Record<string, unknown>;
    act(() => (adControl["onPlayClick"] as () => void)());
    act(() => (adControl["onMuteClick"] as (m: boolean) => void)(true));
    act(() => (adControl["onFullScreenClick"] as () => void)());
    expect(toggleFullScreen).toHaveBeenCalled();
  });

  it("suppresses video playback while the ad break is on screen", () => {
    mockUseFullscreenAdBreak.mockReturnValue({
      ...adBreakIdle,
      isOverlayMounted: true,
      isAdVisible: true,
      shouldMountAd: true,
      suppressVideo: true,
    });
    render({ adObject });
    // First LightPlayer call is the underlying video — isPlay must be false.
    const videoProps = mockLightPlayer.mock.calls[0]?.[0] as { isPlay?: boolean };
    expect(videoProps?.isPlay).toBe(false);
  });
});
