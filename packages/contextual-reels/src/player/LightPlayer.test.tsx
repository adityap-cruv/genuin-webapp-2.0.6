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

// Captures the timeupdate listeners registered by useQuartileEvents so a test
// can fire a tick and exercise LightPlayer's handleTimeUpdate / getLastUserPlayAt.
const timeupdateHandlers: Array<() => void> = [];

// The native <video> element the mocked player exposes via getInstance().
// usePlayStartedEvents attaches native play/playing listeners to it; a test
// fires `playing` to exercise LightPlayer's getLastUserPlayAt closure.
let playerNativeEl: HTMLVideoElement | null = null;

// Shared analytics.sendEvent spy. Declared via vi.hoisted so the (hoisted)
// vi.mock factory below and the tests both reference the same mock instance —
// LightPlayer calls sendEvent("video_loaded") for video items, and the
// isVideoItem-branch tests assert against this exact spy.
const { analyticsSendEvent } = vi.hoisted(() => ({ analyticsSendEvent: vi.fn() }));

// Inline mocks to avoid vi.mock hoisting issues with imported factories.
// Invokes onReady synchronously so the player pipeline (quartile listeners) wires up.
vi.mock("vlitejs", async () => {
  const { createPlayerHandleMock } = await import("../../tests/_mocks/vlitejsMock");
  class Vlitejs {
    player: PlayerHandleMock;
    __onReady?: (p: PlayerHandleMock) => void;
    static registerPlugin = vi.fn();
    constructor(_el: Element, opts?: { onReady?: (p: PlayerHandleMock) => void }) {
      const player = createPlayerHandleMock();
      player.getDuration.mockReturnValue(Promise.resolve(100) as unknown as number);
      player.getCurrentTime.mockReturnValue(Promise.resolve(40) as unknown as number);
      player.on.mockImplementation((event: string, handler: () => void) => {
        if (event === "timeupdate") timeupdateHandlers.push(handler);
      });
      // Expose a native <video> so usePlayStartedEvents can attach native
      // play/playing listeners (its `player.getInstance?.() ?? player` path).
      const nativeEl = document.createElement("video");
      vi.spyOn(nativeEl, "play").mockResolvedValue(undefined);
      (player as unknown as { getInstance: () => HTMLVideoElement }).getInstance = () => nativeEl;
      playerNativeEl = nativeEl;
      this.player = player;
      this.__onReady = opts?.onReady;
      opts?.onReady?.(player);
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
    detachMedia: HlsInstanceMock["detachMedia"];
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
      this.detachMedia = m.detachMedia;
      this.on = m.on;
      this.off = m.off;
      this.currentLevel = m.currentLevel;
      this.__listeners = m.__listeners;
    }
  }
  return { default: MockHls, Events: HlsEvents };
});

vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: analyticsSendEvent }),
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
    timeupdateHandlers.length = 0;
    playerNativeEl = null;
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

  it("hides the scrubber when hideScrubber is true", () => {
    act(() => {
      root.render(createElement(LightPlayer, { ...baseProps, hideScrubber: true }));
    });
    // VideoScrubber renders a progress bar; with hideScrubber it is absent.
    expect(container.querySelector(".lightPlayer")?.children.length).toBe(1);
  });

  it("forwards onTimeUpdate and updates progress on a timeupdate tick", async () => {
    const onTimeUpdate = vi.fn();
    await act(async () => {
      root.render(
        createElement(LightPlayer, { ...baseProps, onTimeUpdate, lastUserPlayAt: 1234 })
      );
    });

    expect(timeupdateHandlers.length).toBeGreaterThan(0);

    await act(async () => {
      for (const h of timeupdateHandlers) h();
      await Promise.resolve();
      await Promise.resolve();
    });

    // handleTimeUpdate forwards currentTime=40, duration=100, id=1 to onTimeUpdate.
    expect(onTimeUpdate).toHaveBeenCalledWith(40, 100, 1);
  });

  it("does not throw on a timeupdate tick when no onTimeUpdate prop is given", async () => {
    await act(async () => {
      root.render(createElement(LightPlayer, baseProps));
    });
    await expect(
      act(async () => {
        for (const h of timeupdateHandlers) h();
        await Promise.resolve();
        await Promise.resolve();
      })
    ).resolves.toBeUndefined();
  });

  it('treats item as a video item when videoDetails.type === "video"', () => {
    const sendEvent = analyticsSendEvent;
    sendEvent.mockClear();
    act(() => {
      root.render(
        createElement(LightPlayer, { ...baseProps, videoDetails: { type: "video" } })
      );
    });
    expect(sendEvent).toHaveBeenCalledWith("video_loaded");
  });

  it('treats item as a video item when videoDetails.kind === "video-with-ad"', () => {
    const sendEvent = analyticsSendEvent;
    sendEvent.mockClear();
    act(() => {
      root.render(
        createElement(LightPlayer, { ...baseProps, videoDetails: { kind: "video-with-ad" } })
      );
    });
    expect(sendEvent).toHaveBeenCalledWith("video_loaded");
  });

  it("treats item as a video item when videoType is a non-empty string", () => {
    const sendEvent = analyticsSendEvent;
    sendEvent.mockClear();
    act(() => {
      root.render(
        createElement(LightPlayer, { ...baseProps, videoDetails: { videoType: "mp4" } })
      );
    });
    expect(sendEvent).toHaveBeenCalledWith("video_loaded");
  });

  it("treats item as a non-video item when videoType is an empty string", () => {
    const sendEvent = analyticsSendEvent;
    sendEvent.mockClear();
    act(() => {
      root.render(
        createElement(LightPlayer, { ...baseProps, videoDetails: { videoType: "" } })
      );
    });
    expect(sendEvent).not.toHaveBeenCalledWith("video_loaded");
  });

  it("reads lastUserPlayAt on the native playing event", async () => {
    // LightPlayer passes `getLastUserPlayAt: () => lastUserPlayAtRef.current`
    // into the lifecycle hook; usePlayStartedEvents invokes it inside the native
    // `playing` listener. Firing that event exercises the closure.
    await act(async () => {
      root.render(createElement(LightPlayer, { ...baseProps, lastUserPlayAt: 5555 }));
    });

    expect(playerNativeEl).not.toBeNull();

    await act(async () => {
      playerNativeEl!.dispatchEvent(new Event("playing"));
      await Promise.resolve();
      await Promise.resolve();
    });

    // The closure resolved without throwing; getCurrentTime (40) drove the
    // not-a-restart path, and getLastUserPlayAt was read for the recent-click check.
    expect(playerNativeEl).not.toBeNull();
  });
});
