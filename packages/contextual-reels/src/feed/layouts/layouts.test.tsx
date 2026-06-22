/**
 * Tests for feed layouts — Phase 2 typed props.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { NormalisedReel, NormalisedAd, TagResponse } from "@cxr/types";

vi.mock("../../player/LightPlayer", () => ({
  LightPlayer: () => React.createElement("div", { "data-testid": "light-player" }),
}));
vi.mock("../../ads/GenAdSlot", () => ({
  GenAdSlot: () => React.createElement("div", { "data-testid": "gen-ad-slot" }),
}));
vi.mock("../../providers/PlayerProvider", () => ({
  usePlayer: vi.fn(() => ({
    isMuted: true,
    isPlaying: false,
    setMuted: vi.fn(),
    setPlaying: vi.fn(),
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

vi.mock("../../instance/registry/InstanceContext", () => ({
  useInstanceId: () => "test-instance",
}));

vi.mock("../../genai/octo/OctoSheet", () => ({
  OctoSheet: () => null,
}));

vi.mock("../../config", () => ({
  isGenAiAllowed: () => false,
  resolveAdLayout: () => "unknown",
}));

vi.mock("../../providers/AdProvider", () => ({
  useAdWaterfall: vi.fn(() => ({
    adLayout: "unknown",
    isAudioOnlyAds: false,
    onAdSuccess: vi.fn(),
    onAdFail: vi.fn(),
  })),
}));

// Mock control layers so layout tests don't need full provider trees
vi.mock("../../controls/VideoControlLayer", () => ({
  VideoControlLayer: () => React.createElement("div", { "data-testid": "video-control-layer" }),
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
  kind: "reel",
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

const mockTagDetails: TagResponse = { tag_id: "tag-1" };

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
          tagDetails: mockTagDetails,
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
