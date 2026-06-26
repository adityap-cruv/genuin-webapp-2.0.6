/**
 * Tests for player helper hooks — consolidated from:
 *   player/useAutoplayFallback.test.ts
 *   player/useImaPlugin.test.ts
 *
 * The former useHlsSource tests were removed along with that unused hook; the
 * live HLS.js lifecycle is covered by usePlayerLifecycle.test.ts.
 */
import type { RefObject } from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { tryPlay, useAutoplayFallback, useImaPlugin } from "@cxr/player/hlsPlayer";
import type { PlayerHandle } from "@cxr/player/types";

import { installImaMock, resetImaMock } from "../../tests/_mocks/imaMock";

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

  it("invokes onAutoplayBlocked on NotAllowedError", async () => {
    const player = makePlayer();
    const notAllowed = Object.assign(new Error("NotAllowedError"), { name: "NotAllowedError" });
    const onAutoplayBlocked = vi.fn();

    let callCount = 0;
    vi.spyOn(video, "play").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(notAllowed);
      return Promise.resolve(undefined);
    });

    await tryPlay(player, video, false, onAutoplayBlocked);

    expect(onAutoplayBlocked).toHaveBeenCalledTimes(1);
  });

  it("does not invoke onAutoplayBlocked on successful play", async () => {
    const player = makePlayer();
    const onAutoplayBlocked = vi.fn();
    vi.spyOn(video, "play").mockResolvedValue(undefined);

    await tryPlay(player, video, false, onAutoplayBlocked);

    expect(onAutoplayBlocked).not.toHaveBeenCalled();
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
      videoEl: { current: video } as RefObject<HTMLVideoElement | null>,
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
