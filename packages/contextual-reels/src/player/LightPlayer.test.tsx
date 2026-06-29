/**
 * Tests for LightPlayer — presentation component.
 * Uses React createRoot directly — no @testing-library/react.
 */
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { LightPlayer } from "@cxr/player/LightPlayer";

import type { HlsInstanceMock } from "../../tests/_mocks/hlsMock";
import type { PlayerHandleMock } from "../../tests/_mocks/vlitejsMock";

// Inline mocks to avoid vi.mock hoisting issues with imported factories
vi.mock("vlitejs", async () => {
  const { createPlayerHandleMock } = await import("../../tests/_mocks/vlitejsMock");
  class Vlitejs {
    player: PlayerHandleMock;
    __onReady?: (p: PlayerHandleMock) => void;
    static registerPlugin = vi.fn();
    constructor(_el: Element, opts?: { onReady?: (p: PlayerHandleMock) => void }) {
      this.player = createPlayerHandleMock();
      this.__onReady = opts?.onReady;
    }
  }
  return { default: Vlitejs };
});

vi.mock("vlitejs/plugins/ima.js", () => ({ default: class VliteIma {} }));

vi.mock("hls.js", async () => {
  const { createHlsInstanceMock, HlsEvents } = await import("../../tests/_mocks/hlsMock");
  class MockHls {
    static isSupported() {
      return true;
    }
    static Events = HlsEvents;
    startLoad: HlsInstanceMock["startLoad"];
    stopLoad: HlsInstanceMock["stopLoad"];
    destroy: HlsInstanceMock["destroy"];
    loadSource: HlsInstanceMock["loadSource"];
    attachMedia: HlsInstanceMock["attachMedia"];
    on: HlsInstanceMock["on"];
    off: HlsInstanceMock["off"];
    currentLevel: number;
    __listeners: HlsInstanceMock["__listeners"];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_opts?: unknown) {
      const m = createHlsInstanceMock();
      this.startLoad = m.startLoad;
      this.stopLoad = m.stopLoad;
      this.destroy = m.destroy;
      this.loadSource = m.loadSource;
      this.attachMedia = m.attachMedia;
      this.on = m.on;
      this.off = m.off;
      this.currentLevel = m.currentLevel;
      this.__listeners = m.__listeners;
    }
  }
  return { default: MockHls, Events: HlsEvents };
});

vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: vi.fn() }),
}));

vi.mock("../instance/coordination/EventBusContext", () => ({
  useEventBus: () => ({ on: () => () => undefined, emit: () => undefined }),
}));

vi.mock("../providers/PlayerProvider", () => ({
  usePlayer: () => ({
    volume: 0,
    isMuted: true,
    isPlaying: true,
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setPlaying: vi.fn(),
    notifyAutoplayBlocked: vi.fn(),
  }),
}));

const baseProps = {
  content: "https://example.com/video.mp4",
  id: 1,
  volume: 0,
  isPlay: false,
  tagDetails: {},
  videoDetails: {},
};

describe("LightPlayer", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it("renders a video element", () => {
    act(() => {
      root.render(createElement(LightPlayer, baseProps));
    });
    expect(container.querySelector("video")).not.toBeNull();
  });

  it('renders video element with data-testid="light-player-video"', () => {
    act(() => {
      root.render(createElement(LightPlayer, baseProps));
    });
    expect(container.querySelector('[data-testid="light-player-video"]')).not.toBeNull();
  });

  it('sets crossOrigin="true" on the video element', () => {
    act(() => {
      root.render(createElement(LightPlayer, baseProps));
    });
    const video = container.querySelector("video")!;
    // The original JSX uses crossOrigin="true" (non-standard but preserved for compat)
    expect(video.getAttribute("crossorigin")).toBeTruthy();
  });

  it('sets preload="metadata" on the video element', () => {
    act(() => {
      root.render(createElement(LightPlayer, baseProps));
    });
    const video = container.querySelector("video")!;
    expect(video.getAttribute("preload")).toBe("metadata");
  });

  it("has muted attribute on the video element", () => {
    act(() => {
      root.render(createElement(LightPlayer, baseProps));
    });
    const video = container.querySelector("video")!;
    expect(video.muted).toBe(true);
  });

  it("has playsInline on the video element", () => {
    act(() => {
      root.render(createElement(LightPlayer, baseProps));
    });
    const video = container.querySelector("video")!;
    expect(video.hasAttribute("playsinline")).toBe(true);
  });

  it("applies poster attribute when provided", () => {
    act(() => {
      root.render(createElement(LightPlayer, { ...baseProps, poster: "https://example.com/poster.jpg" }));
    });
    const video = container.querySelector("video")!;
    expect(video.getAttribute("poster")).toBe("https://example.com/poster.jpg");
  });

  it("renders inside a div.lightPlayer wrapper", () => {
    act(() => {
      root.render(createElement(LightPlayer, baseProps));
    });
    expect(container.querySelector(".lightPlayer")).not.toBeNull();
  });
});
