/**
 * Tests for `hlsPlayer` — consolidated from:
 *   player/useHlsSource.test.ts
 *   player/useAutoplayFallback.test.ts
 *   player/useImaPlugin.test.ts
 */
import Hls from "hls.js";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useHlsSource, tryPlay, useAutoplayFallback, useImaPlugin } from "@cxr/player/hlsPlayer";
import type { PlayerHandle } from "@cxr/player/types";

import { HlsEvents, type HlsInstanceMock } from "../../tests/_mocks/hlsMock";
import { installImaMock, resetImaMock } from "../../tests/_mocks/imaMock";

// Keep a registry of all HLS instances created during the test run.
const hlsInstances: HlsInstanceMock[] = [];

vi.mock("hls.js", async () => {
  const { createHlsInstanceMock, HlsEvents: evts } = await import("../../tests/_mocks/hlsMock");

  class TrackedHls {
    static isSupported() {
      return true;
    }
    static Events = evts;

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
      hlsInstances.push(this as unknown as HlsInstanceMock);
    }
  }

  return { default: TrackedHls, Events: evts };
});

// ─── useHlsSource tests ───────────────────────────────────────────────────────

function createVideoEl(): HTMLVideoElement {
  const v = document.createElement("video");
  vi.spyOn(v, "play").mockResolvedValue(undefined);
  vi.spyOn(v, "pause").mockImplementation(() => undefined);
  return v;
}

type HookOpts = Parameters<typeof useHlsSource>[0];

function HookShim({ videoEl, src, isPlay, onReady }: HookOpts) {
  useHlsSource({ videoEl, src, isPlay, onReady });
  return null;
}

describe("useHlsSource", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    hlsInstances.length = 0;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(Hls, "isSupported" as never).mockReturnValue(true as never);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it("calls loadSource and attachMedia with correct args", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(
        createElement(HookShim, {
          videoEl,
          src: "https://cdn.example.com/stream.m3u8",
          isPlay: false,
        })
      );
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;
    expect(inst.loadSource).toHaveBeenCalledWith("https://cdn.example.com/stream.m3u8");
    expect(inst.attachMedia).toHaveBeenCalledWith(videoEl.current);
  });

  it("sets maxBufferSize to 100_000 on the created instance", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(
        createElement(HookShim, {
          videoEl,
          src: "https://example.com/video.m3u8",
          isPlay: false,
        })
      );
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;
    // @ts-expect-error -- maxBufferSize set directly on instance
    expect(inst.maxBufferSize).toBe(100_000);
  });

  it("selects lowest bitrate level on MANIFEST_PARSED and disables autoLevel", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(
        createElement(HookShim, {
          videoEl,
          src: "https://example.com/video.m3u8",
          isPlay: false,
        })
      );
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;
    const levels = [{ bitrate: 500000 }, { bitrate: 100000 }, { bitrate: 250000 }];
    // @ts-expect-error -- dynamic
    inst.levels = levels;
    // @ts-expect-error -- dynamic
    inst.autoLevelEnabled = true;

    const listeners = inst.__listeners.get(HlsEvents.MANIFEST_PARSED) ?? [];
    for (const cb of listeners) {
      cb(HlsEvents.MANIFEST_PARSED, { levels });
    }

    expect(inst.currentLevel).toBe(1);
    // @ts-expect-error -- dynamic
    expect(inst.autoLevelEnabled).toBe(false);
  });

  it("calls startLoad(-1) immediately after attach (unconditional, even isPlay=false)", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(
        createElement(HookShim, {
          videoEl,
          src: "https://example.com/video.m3u8",
          isPlay: false,
        })
      );
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;
    expect(inst.startLoad).toHaveBeenCalledWith(-1);
  });

  it("calls stopLoad when isPlay becomes false after being true", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(createElement(HookShim, { videoEl, src: "https://example.com/video.m3u8", isPlay: true }));
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;

    act(() => {
      root.render(createElement(HookShim, { videoEl, src: "https://example.com/video.m3u8", isPlay: false }));
    });

    expect(inst.stopLoad).toHaveBeenCalled();
  });

  it("calls startLoad(-1) when isPlay becomes true after initial false", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(createElement(HookShim, { videoEl, src: "https://example.com/video.m3u8", isPlay: false }));
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;
    inst.startLoad.mockClear();

    act(() => {
      root.render(createElement(HookShim, { videoEl, src: "https://example.com/video.m3u8", isPlay: true }));
    });

    expect(inst.startLoad).toHaveBeenCalledWith(-1);
  });

  it("calls hls.destroy on unmount", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(createElement(HookShim, { videoEl, src: "https://example.com/video.m3u8", isPlay: false }));
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;

    act(() => {
      root.unmount();
    });
    root = createRoot(document.createElement("div"));

    expect(inst.destroy).toHaveBeenCalled();
  });

  it("falls back to native src when Hls.isSupported() is false and canPlayType is empty", async () => {
    vi.spyOn(Hls, "isSupported" as never).mockReturnValue(false as never);

    const video = createVideoEl();
    vi.spyOn(video, "canPlayType").mockReturnValue("");
    const videoEl = { current: video } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(createElement(HookShim, { videoEl, src: "https://example.com/video.m3u8", isPlay: false }));
    });

    expect(video.src).toContain("video.m3u8");
    expect(hlsInstances).toHaveLength(0);
  });

  it('uses native HLS src when canPlayType returns "maybe" and isSupported is false', async () => {
    // canPlayType returning non-empty = native HLS branch taken, HLS.js never loaded
    const video = createVideoEl();
    vi.spyOn(video, "canPlayType").mockReturnValue("maybe");
    const videoEl = { current: video } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(createElement(HookShim, { videoEl, src: "https://example.com/stream.m3u8", isPlay: false }));
    });

    expect(video.src).toContain("stream.m3u8");
    expect(hlsInstances).toHaveLength(0);
  });
});

// ─── tryPlay / useAutoplayFallback tests ──────────────────────────────────────

function makePlayer(overrides: Partial<PlayerHandle> = {}): PlayerHandle {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    getCurrentTime: vi.fn(() => Promise.resolve(0)),
    getDuration: vi.fn(() => Promise.resolve(0)),
    on: vi.fn(),
    ...overrides,
  };
}

describe("tryPlay", () => {
  let video: HTMLVideoElement;

  beforeEach(() => {
    video = document.createElement("video");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls player.play() and video.play() on successful play", async () => {
    const player = makePlayer();
    vi.spyOn(video, "play").mockResolvedValue(undefined);

    await tryPlay(player, video);

    expect(player.play).toHaveBeenCalledTimes(1);
    expect(video.play).toHaveBeenCalledTimes(1);
  });

  it("sets video.muted=true and calls player.mute and retries on NotAllowedError", async () => {
    const player = makePlayer();
    const notAllowed = Object.assign(new Error("NotAllowedError"), { name: "NotAllowedError" });

    let callCount = 0;
    vi.spyOn(video, "play").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(notAllowed);
      return Promise.resolve(undefined);
    });

    await tryPlay(player, video);

    expect(video.muted).toBe(true);
    expect(player.mute).toHaveBeenCalledTimes(1);
    expect(video.play).toHaveBeenCalledTimes(2);
  });

  it("swallows AbortError silently without calling logger.warn", async () => {
    const player = makePlayer();
    const abortErr = Object.assign(new Error("AbortError"), { name: "AbortError" });
    vi.spyOn(video, "play").mockRejectedValue(abortErr);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await expect(tryPlay(player, video)).resolves.toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("calls logger.warn for errors other than NotAllowedError and AbortError", async () => {
    const player = makePlayer();
    const unknownErr = Object.assign(new Error("SomethingElse"), { name: "SomethingElse" });
    vi.spyOn(video, "play").mockRejectedValue(unknownErr);

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await tryPlay(player, video);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("swallows the retry catch error silently (nested catch)", async () => {
    const player = makePlayer();
    const notAllowed = Object.assign(new Error("NotAllowedError"), { name: "NotAllowedError" });
    const retryErr = new Error("RetryFailed");

    let callCount = 0;
    vi.spyOn(video, "play").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(notAllowed);
      return Promise.reject(retryErr);
    });

    await expect(tryPlay(player, video)).resolves.toBeUndefined();
  });
});

describe("useAutoplayFallback hook", () => {
  it("returns tryPlay as the same module-level function", () => {
    const video = document.createElement("video");
    const player: PlayerHandle = {
      play: vi.fn(),
      pause: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      getCurrentTime: vi.fn(() => Promise.resolve(0)),
      getDuration: vi.fn(() => Promise.resolve(0)),
      on: vi.fn(),
    };
    const result = useAutoplayFallback({
      videoEl: { current: video } as React.RefObject<HTMLVideoElement | null>,
      player,
    });
    expect(result.tryPlay).toBe(tryPlay);
  });
});

// ─── useImaPlugin tests ───────────────────────────────────────────────────────

type AdsManagerListener = (event: unknown) => void;

function makeImaPlayer(
  onListeners: Record<string, Array<(e?: unknown) => void>> = {},
  plugins: PlayerHandle["plugins"] = {}
): PlayerHandle {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    getCurrentTime: vi.fn(() => Promise.resolve(0)),
    getDuration: vi.fn(() => Promise.resolve(0)),
    getInstance: vi.fn(() => null),
    plugins,
    on: vi.fn((event: string, handler: (e?: unknown) => void) => {
      if (!onListeners[event]) onListeners[event] = [];
      onListeners[event]!.push(handler);
    }),
  };
}

function useGetPlugin(opts: Parameters<typeof useImaPlugin>[0]) {
  return useImaPlugin(opts);
}

describe("useImaPlugin", () => {
  let sendEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    installImaMock();
    sendEvent = vi.fn();
  });

  afterEach(() => {
    resetImaMock();
    vi.clearAllMocks();
  });

  it("emits ad_request with ad_url on adsrequest event", () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makeImaPlayer(listeners, { ima: {} });

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: {}, sendEvent });
    plugin.attachToPlayer(player);

    const adsrequestHandlers = listeners["adsrequest"] ?? [];
    for (const h of adsrequestHandlers) {
      h({ detail: { adsRequest: { adTagUrl: "https://example.com/vast.xml" } } });
    }

    expect(sendEvent).toHaveBeenCalledWith("ad_request", {
      ad_url: "https://example.com/vast.xml",
    });
  });

  it("emits ad_response on IMA LOADED event", () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makeImaPlayer(listeners, { ima: {} });
    const adsManagerListeners: Record<string, AdsManagerListener[]> = {};
    const adsManager = {
      addEventListener: vi.fn((type: string, cb: AdsManagerListener) => {
        if (!adsManagerListeners[type]) adsManagerListeners[type] = [];
        adsManagerListeners[type]!.push(cb);
      }),
    };

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: {}, sendEvent });
    plugin.attachToPlayer(player);

    for (const h of listeners["adsmanager"] ?? []) {
      h({ detail: { adsManager } });
    }

    const adData = { adId: "ad-1", dealId: "d-1", creativeId: "c-1", mediaUrl: "url", adSystem: "sys", adPodInfo: {} };
    for (const h of adsManagerListeners["loaded"] ?? []) {
      h({ getAdData: () => adData });
    }

    expect(sendEvent).toHaveBeenCalledWith("ad_response", expect.objectContaining({ adId: "ad-1" }));
  });

  it("emits ad_start on IMA STARTED event", () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makeImaPlayer(listeners, { ima: {} });
    const adsManagerListeners: Record<string, AdsManagerListener[]> = {};
    const adsManager = {
      addEventListener: vi.fn((type: string, cb: AdsManagerListener) => {
        if (!adsManagerListeners[type]) adsManagerListeners[type] = [];
        adsManagerListeners[type]!.push(cb);
      }),
    };

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: {}, sendEvent });
    plugin.attachToPlayer(player);

    for (const h of listeners["adsmanager"] ?? []) {
      h({ detail: { adsManager } });
    }

    const adData = { adId: "ad-2", dealId: "", creativeId: "", mediaUrl: "", adSystem: "", adPodInfo: {} };
    for (const h of adsManagerListeners["started"] ?? []) {
      h({ getAd: () => ({ data: adData }) });
    }

    expect(sendEvent).toHaveBeenCalledWith("ad_start", expect.objectContaining({ adId: "ad-2" }));
  });

  it("emits ad_complete on IMA COMPLETE event", () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makeImaPlayer(listeners, { ima: {} });
    const adsManagerListeners: Record<string, AdsManagerListener[]> = {};
    const adsManager = {
      addEventListener: vi.fn((type: string, cb: AdsManagerListener) => {
        if (!adsManagerListeners[type]) adsManagerListeners[type] = [];
        adsManagerListeners[type]!.push(cb);
      }),
    };

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: {}, sendEvent });
    plugin.attachToPlayer(player);

    for (const h of listeners["adsmanager"] ?? []) {
      h({ detail: { adsManager } });
    }

    const adData = { adId: "ad-3", dealId: "", creativeId: "", mediaUrl: "", adSystem: "", adPodInfo: {} };
    for (const h of adsManagerListeners["complete"] ?? []) {
      h({ getAd: () => ({ data: adData }) });
    }

    expect(sendEvent).toHaveBeenCalledWith("ad_complete", expect.objectContaining({ adId: "ad-3" }));
  });

  it("wires the provided onAdError to player.plugins.ima.onAdError", () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const imaPlugin = { onAdError: undefined as unknown as (e: unknown) => void };
    const player = makeImaPlayer(listeners, { ima: imaPlugin });
    const onAdError = vi.fn();

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: {}, sendEvent, onAdError });
    plugin.attachToPlayer(player);

    expect(imaPlugin.onAdError).toBe(onAdError);
  });

  it("wires a default no-op to onAdError when none provided", () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const imaPlugin = { onAdError: undefined as unknown as (e: unknown) => void };
    const player = makeImaPlayer(listeners, { ima: imaPlugin });

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: {}, sendEvent });
    plugin.attachToPlayer(player);

    expect(typeof imaPlugin.onAdError).toBe("function");
    expect(() => imaPlugin.onAdError(new Error("test"))).not.toThrow();
  });

  it("calls player.play() on adsmanager event", () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makeImaPlayer(listeners, { ima: {} });
    const adsManager = { addEventListener: vi.fn() };

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: {}, sendEvent });
    plugin.attachToPlayer(player);

    for (const h of listeners["adsmanager"] ?? []) {
      h({ detail: { adsManager } });
    }

    expect(player.play).toHaveBeenCalled();
  });

  it('calls onEnded when COMPLETE fires and videoDetails.type === "ad"', () => {
    const listeners: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makeImaPlayer(listeners, { ima: {} });
    const adsManagerListeners: Record<string, AdsManagerListener[]> = {};
    const adsManager = {
      addEventListener: vi.fn((type: string, cb: AdsManagerListener) => {
        if (!adsManagerListeners[type]) adsManagerListeners[type] = [];
        adsManagerListeners[type]!.push(cb);
      }),
    };
    const onEnded = vi.fn();

    const plugin = useGetPlugin({ tagDetails: {}, videoDetails: { type: "ad" }, sendEvent, onEnded });
    plugin.attachToPlayer(player);

    for (const h of listeners["adsmanager"] ?? []) {
      h({ detail: { adsManager } });
    }

    const adData = { adId: "x", dealId: "", creativeId: "", mediaUrl: "", adSystem: "", adPodInfo: {} };
    for (const h of adsManagerListeners["complete"] ?? []) {
      h({ getAd: () => ({ data: adData }) });
    }

    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});
