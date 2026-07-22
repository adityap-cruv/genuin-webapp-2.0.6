/**
 * Tests for feed layouts — Phase 2 typed props.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AD_LAYOUT } from "@cxr/config";
import type * as ConfigModule from "@cxr/config";
import type { NormalisedReel, NormalisedAd } from "@cxr/types";

import { useAdWaterfall } from "../../providers/AdProvider";
import { useFullscreenAdBreak } from "../hooks/useFullscreenAdBreak";

const { mockLightPlayer } = vi.hoisted(() => ({ mockLightPlayer: vi.fn() }));
vi.mock("../../player/LightPlayer", () => ({
  LightPlayer: (props: Record<string, unknown>) => {
    mockLightPlayer(props);
    return React.createElement("div", { "data-testid": "light-player" });
  },
}));
vi.mock("../../ads/GenAdSlot", () => ({
  GenAdSlot: () => React.createElement("div", { "data-testid": "gen-ad-slot" }),
}));
vi.mock("../../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: vi.fn(), setBrandId: vi.fn() }),
}));
vi.mock("../../providers/PlayerProvider", () => ({
  usePlayer: vi.fn(() => ({
    isMuted: true,
    isPlaying: false,
    volume: 1,
    setMuted: vi.fn(),
    setPlaying: vi.fn(),
    setAdBreakActive: vi.fn(),
  })),
}));

vi.mock("../../providers/FullScreenProvider", () => ({
  useFullScreen: vi.fn(() => ({
    isFullScreen: false,
    enterFullScreen: vi.fn(),
    exitFullScreen: vi.fn(),
    toggleFullScreen: vi.fn(),
  })),
}));

const { mockUseInactivityAdvance } = vi.hoisted(() => {
  const mockUseInactivityAdvance = vi.fn();
  return { mockUseInactivityAdvance };
});

vi.mock("../hooks/useInactivityAdvance", () => ({
  useInactivityAdvance: mockUseInactivityAdvance,
}));

vi.mock("../../instance/InstanceContext", () => ({
  useInstanceId: () => "test-instance",
  useEventBus: () => ({ emit: vi.fn(), on: vi.fn(() => () => undefined), off: vi.fn() }),
}));

vi.mock("../../genai/octo/OctoSheet", () => ({
  OctoSheet: () => null,
}));

vi.mock("../../config", async (importOriginal) => {
  const actual = await importOriginal<typeof ConfigModule>();
  return {
    ...actual,
    isGenAiAllowed: () => false,
    resolveAdLayout: () => actual.AD_LAYOUT.Unknown,
  };
});

vi.mock("../../providers/AdProvider", () => ({
  useAdWaterfall: vi.fn(() => ({
    adLayout: AD_LAYOUT.Unknown,
    isAudioOnlyAds: false,
    onAdSuccess: vi.fn(),
    onAdFail: vi.fn(),
  })),
}));

vi.mock("../../providers/GenAIProvider", () => ({
  useGenAI: vi.fn(() => ({
    genAiEnabled: false,
    octoFraction: 0,
    setOctoFraction: vi.fn(),
    octoAxis: "y" as const,
    setOctoAxis: vi.fn(),
  })),
  useOctoSplit: vi.fn(() => ({
    octoFraction: 0,
    octoAxis: "y" as const,
    splitActive: false,
    playerShare: 1,
  })),
}));

const { hoistedTagDetails } = vi.hoisted(() => ({
  hoistedTagDetails: { tag_id: "tag-1" } as Record<string, unknown>,
}));
vi.mock("../../providers/TagDetailsProvider", () => ({
  useTagDetails: () => ({ tagDetails: hoistedTagDetails, apiFailed: false }),
}));

vi.mock("../hooks/useFullscreenAdBreak", () => ({
  useFullscreenAdBreak: vi.fn(() => ({
    status: "idle",
    shouldMountAd: false,
    isOverlayMounted: false,
    isAdVisible: false,
    suppressVideo: false,
    handleWaterfallSuccess: vi.fn(),
    handleWaterfallFail: vi.fn(),
    handleAdCompleted: vi.fn(),
  })),
  AD_FADE_MS: 300,
}));

// Mock control layers so layout tests don't need full provider trees
vi.mock("../../controls/VideoControlLayer", () => ({
  VideoControlLayer: () => React.createElement("div", { "data-testid": "video-control-layer" }),
  CompactUnmuteOverlay: () =>
    React.createElement("div", { "data-testid": "compact-unmute-overlay" }),
}));
vi.mock("../../controls/AdControlLayer", () => ({
  AdControlLayer: () => React.createElement("div", { "data-testid": "ad-control-layer" }),
}));

// ResizeObserver is not available in jsdom — stub it so VideoLayout doesn't throw.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

import { VideoLayout, AdLayout } from ".";

const mockReel: NormalisedReel = {
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

describe("VideoLayout (default / fullscreen path)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(isActive = true) {
    act(() => {
      root.render(
        React.createElement(VideoLayout, {
          reel: mockReel,
          isActive,
          onTimeUpdate: () => undefined,
        })
      );
    });
  }

  it("renders the light player", () => {
    render();
    expect(container.querySelector('[data-testid="light-player"]')).toBeTruthy();
  });

  it('renders a containing div with data-testid="video-layout"', () => {
    render();
    expect(container.querySelector('[data-testid="video-layout"]')).toBeTruthy();
  });
});

// Regression: the 320×100 compact layout (L4) must wire onEnded → onAutoAdvance
// so a finished video scrolls to the next reel, like the L1/L2 players already do.
describe("VideoLayout L4 (320×100 compact) auto-advance", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockLightPlayer.mockClear();
    (useAdWaterfall as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      adLayout: AD_LAYOUT.L4,
      isAudioOnlyAds: false,
      onAdSuccess: vi.fn(),
      onAdFail: vi.fn(),
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
    (useAdWaterfall as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      adLayout: AD_LAYOUT.Unknown,
      isAudioOnlyAds: false,
      onAdSuccess: vi.fn(),
      onAdFail: vi.fn(),
    });
  });

  it("passes onAutoAdvance to the compact LightPlayer's onEnded", () => {
    const onAutoAdvance = vi.fn();
    act(() => {
      root.render(
        React.createElement(VideoLayout, {
          reel: mockReel,
          isActive: true,
          onTimeUpdate: () => undefined,
          onAutoAdvance,
        })
      );
    });

    const props = mockLightPlayer.mock.calls.at(-1)?.[0] as { onEnded?: () => void } | undefined;
    expect(props?.onEnded).toBe(onAutoAdvance);
  });
});

const mockAd: NormalisedAd = {
  kind: "ad",
  id: 0,
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

describe("AdLayout", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(isActive = true) {
    act(() => {
      root.render(
        React.createElement(AdLayout, {
          ad: mockAd,
          isActive,
        })
      );
    });
  }

  it('renders with data-testid="ad-layout"', () => {
    render();
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeTruthy();
  });

  it("renders GenAdSlot", () => {
    render();
    expect(container.querySelector('[data-testid="gen-ad-slot"]')).toBeTruthy();
  });

  it("calls useInactivityAdvance", () => {
    render();
    expect(mockUseInactivityAdvance).toHaveBeenCalled();
  });
});

const mockVideoAd: NormalisedAd = {
  kind: "ad",
  id: 0,
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
  gateOnUnmute: false,
};

describe("AdLayout (video ad)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(isActive = true) {
    act(() => {
      root.render(
        React.createElement(AdLayout, {
          ad: mockVideoAd,
          isActive,
        })
      );
    });
  }

  it('renders with data-testid="ad-layout"', () => {
    render();
    expect(container.querySelector('[data-testid="ad-layout"]')).toBeTruthy();
  });

  it("renders GenAdSlot", () => {
    render();
    expect(container.querySelector('[data-testid="gen-ad-slot"]')).toBeTruthy();
  });
});

const mockAdObject: NormalisedAd = {
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

describe("VideoLayout with adObject (video-with-ad path)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(adBreakOverrides: Partial<ReturnType<typeof useFullscreenAdBreak>> = {}) {
    (useFullscreenAdBreak as ReturnType<typeof vi.fn>).mockReturnValue({
      status: "idle",
      shouldMountAd: false,
      isOverlayMounted: false,
      isAdVisible: false,
      suppressVideo: false,
      handleWaterfallSuccess: vi.fn(),
      handleWaterfallFail: vi.fn(),
      handleAdCompleted: vi.fn(),
      ...adBreakOverrides,
    });
    act(() => {
      root.render(
        React.createElement(VideoLayout, {
          reel: mockReel,
          isActive: true,
          onTimeUpdate: () => undefined,
          adObject: mockAdObject,
        })
      );
    });
  }

  it("renders light player when no ad break active", () => {
    render();
    expect(container.querySelector('[data-testid="light-player"]')).toBeTruthy();
  });

  it("renders ad break overlay when isOverlayMounted=true", () => {
    render({ isOverlayMounted: true, isAdVisible: true, shouldMountAd: true });
    expect(container.querySelector('[data-testid="fullscreen-ad-break"]')).toBeTruthy();
  });

  it("does not render ad break overlay when isOverlayMounted=false", () => {
    render({ isOverlayMounted: false });
    expect(container.querySelector('[data-testid="fullscreen-ad-break"]')).toBeNull();
  });
});
