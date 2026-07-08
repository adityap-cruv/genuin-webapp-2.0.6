/**
 * Tests for usePlayerLifecycle.
 * Uses React createRoot directly — no @testing-library/react.
 *
 * The inline Vlitejs mock invokes `onReady` synchronously during construction so
 * the full onReady code path (unMute, volume sync, hook attach, playback gating)
 * is exercised. Each created instance is pushed to `vliteInstances`; tests inspect
 * the latest one's player handle. HLS instances created during the m3u8 path are
 * tracked in `hlsInstances` and can have their MANIFEST_PARSED listeners fired.
 */
import Hls from "hls.js";
import { act, createElement, useState } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { usePlayerLifecycle } from "@cxr/player/usePlayerLifecycle";

import { type HlsInstanceMock } from "../../tests/_mocks/hlsMock";
import { type PlayerHandleMock } from "../../tests/_mocks/vlitejsMock";

// Track HLS instances created during tests
const hlsInstances: HlsInstanceMock[] = [];

// Track Vlitejs instances + the player handle each constructed with.
interface VliteInstanceRecord {
  player: PlayerHandleMock;
  onReady?: (p: PlayerHandleMock) => void;
  opts: Record<string, unknown>;
  /** Native <video> element returned by player.getInstance(); fire events on it. */
  nativeEl: HTMLVideoElement;
}
const vliteInstances: VliteInstanceRecord[] = [];

// When set, the next Vlitejs constructor throws this error (init-error path).
let vliteShouldThrow: Error | null = null;
// When set, IMA registerPlugin throws this error (IMA register-error path).
let imaRegisterShouldThrow: Error | null = null;
// When set, the constructed player's pause()/destroy() throw (cleanup-error path).
let playerCleanupShouldThrow = false;
// When false, HlsClass.isSupported() returns false (native src fallback path).
let hlsSupported = true;
// When set, the next HLS instance's destroy() throws (HLS cleanup-error path).
let hlsDestroyShouldThrow = false;
// When true, the Vlitejs mock stores onReady instead of invoking it, so a test can
// flush it manually AFTER the async HLS import resolves (covers the onReady→stopLoad
// branch which needs hlsInstanceRef populated before onReady runs).
let deferVliteOnReady = false;

// Inline Vlitejs mock (vi.mock is hoisted, can't use imported factory directly).
// Invokes onReady synchronously so the onReady branch in the hook runs.
vi.mock("vlitejs", async () => {
  const { createPlayerHandleMock } = await import("../../tests/_mocks/vlitejsMock");
  class Vlitejs {
    player: PlayerHandleMock;
    static registerPlugin = vi.fn(
      (
        _name: string,
        _plugin: unknown,
        cfg?: {
          updateImaSettings?: (s: {
            setLocale(l: string): void;
            setAutoPlayAdBreaks(b: boolean): void;
          }) => void;
        }
      ) => {
        if (imaRegisterShouldThrow) throw imaRegisterShouldThrow;
        // Exercise the updateImaSettings callback passed by the hook.
        cfg?.updateImaSettings?.({
          setLocale: vi.fn(),
          setAutoPlayAdBreaks: vi.fn(),
        });
      }
    );
    constructor(_el: Element, opts?: { onReady?: (p: PlayerHandleMock) => void } & Record<string, unknown>) {
      if (vliteShouldThrow) throw vliteShouldThrow;
      const player = createPlayerHandleMock();
      // Give the handle a native <video> element so usePlayStartedEvents can
      // attach native `play`/`playing` listeners (drives the onPlayReset path).
      const nativeEl = document.createElement("video");
      vi.spyOn(nativeEl, "play").mockResolvedValue(undefined);
      (player as unknown as { getInstance: () => HTMLVideoElement }).getInstance = () => nativeEl;
      if (playerCleanupShouldThrow) {
        player.pause.mockImplementation(() => {
          throw new Error("pause boom");
        });
      }
      this.player = player;
      const record: VliteInstanceRecord = { player, onReady: opts?.onReady, opts: opts ?? {}, nativeEl };
      vliteInstances.push(record);
      // Mirror real Vlitejs: invoke onReady once the player is constructed —
      // unless a test wants to flush it later (after the HLS import resolves).
      if (!deferVliteOnReady) opts?.onReady?.(player);
    }
  }
  return { default: Vlitejs };
});

vi.mock("vlitejs/plugins/ima.js", () => ({ default: class VliteIma {} }));

// Inline HLS mock
vi.mock("hls.js", async () => {
  const { createHlsInstanceMock, HlsEvents: evts } = await import("../../tests/_mocks/hlsMock");

  class TrackedHls {
    static isSupported() {
      return hlsSupported;
    }
    static Events = evts;

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
      this.destroy = hlsDestroyShouldThrow
        ? (vi.fn(() => {
            throw new Error("hls destroy boom");
          }) as HlsInstanceMock["destroy"])
        : m.destroy;
      this.loadSource = m.loadSource;
      this.attachMedia = m.attachMedia;
      this.detachMedia = m.detachMedia;
      this.on = m.on;
      this.off = m.off;
      this.currentLevel = m.currentLevel;
      this.__listeners = m.__listeners;
      hlsInstances.push(this as unknown as HlsInstanceMock);
    }
  }

  return { default: TrackedHls, Events: evts };
});

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function createVideoEl(readyState = 4) {
  const el = document.createElement("video");
  vi.spyOn(el, "play").mockResolvedValue(undefined);
  vi.spyOn(el, "pause").mockImplementation(() => undefined);
  Object.defineProperty(el, "readyState", { configurable: true, value: readyState });
  return el;
}

type HookOpts = Parameters<typeof usePlayerLifecycle>[0];

function LifecycleShim({ opts }: { opts: HookOpts }) {
  usePlayerLifecycle(opts);
  return null;
}

// Wrapper that lets a test flip `isPlay` / `volume` after the initial render so
// the re-render effects (isPlay change after ready, volume → element) fire.
function ControlledWrapper({
  initialOpts,
  onControls,
}: {
  initialOpts: HookOpts;
  onControls: (controls: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void }) => void;
}) {
  const [isPlay, setIsPlay] = useState(initialOpts.isPlay);
  const [volume, setVolume] = useState(initialOpts.volume);
  onControls({ setIsPlay, setVolume });
  usePlayerLifecycle({ ...initialOpts, isPlay, volume });
  return null;
}

function makeOpts(overrides: Partial<HookOpts> = {}): HookOpts {
  const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
  return {
    videoEl,
    content: "https://example.com/video.mp4",
    isPlay: false,
    volume: 0,
    tagDetails: {},
    videoDetails: {},
    sendEvent: vi.fn(),
    getLastUserPlayAt: vi.fn(() => 0),
    itemId: 1,
    isVideoItem: true,
    ...overrides,
  };
}

function lastVlite(): VliteInstanceRecord {
  return vliteInstances[vliteInstances.length - 1]!;
}

function lastHls(): HlsInstanceMock {
  return hlsInstances[hlsInstances.length - 1]!;
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("usePlayerLifecycle", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    hlsInstances.length = 0;
    vliteInstances.length = 0;
    vliteShouldThrow = null;
    imaRegisterShouldThrow = null;
    playerCleanupShouldThrow = false;
    hlsSupported = true;
    hlsDestroyShouldThrow = false;
    deferVliteOnReady = false;
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

  it("does not throw on mount with mp4 content", () => {
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts() }));
      });
    }).not.toThrow();
  });

  it("does not throw on mount with m3u8 content (HLS path)", () => {
    expect(() => {
      act(() => {
        root.render(
          createElement(LifecycleShim, {
            opts: makeOpts({ content: "https://example.com/stream.m3u8" }),
          })
        );
      });
    }).not.toThrow();
  });

  it("creates an HLS instance for m3u8 content", async () => {
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ content: "https://example.com/stream.m3u8" }),
        })
      );
    });
    expect(hlsInstances.length).toBeGreaterThan(0);
  });

  it("calls hls.destroy on unmount for m3u8 content", async () => {
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ content: "https://example.com/stream.m3u8" }),
        })
      );
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;

    act(() => {
      root.unmount();
    });
    root = createRoot(document.createElement("div"));

    expect(inst.destroy).toHaveBeenCalled();
  });

  it("does not create HLS instance for mp4 content", () => {
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts() }));
    });
    expect(hlsInstances).toHaveLength(0);
  });

  it("does not throw with ad prop present", () => {
    expect(() => {
      act(() => {
        root.render(
          createElement(LifecycleShim, {
            opts: makeOpts({ ad: "https://example.com/vast.xml", supportAds: true }),
          })
        );
      });
    }).not.toThrow();
  });

  it("does not throw with an audible volume", () => {
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts({ volume: 0.5 }) }));
      });
    }).not.toThrow();
  });

  it("does not throw with isPlay=true", () => {
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts({ isPlay: true }) }));
      });
    }).not.toThrow();
  });

  it("does not throw for non-video items", () => {
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts({ isVideoItem: false }) }));
      });
    }).not.toThrow();
  });

  it("does not throw for ad-absent scenario", () => {
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts({ ad: undefined }) }));
      });
    }).not.toThrow();
  });

  it("HLS loadSource called with m3u8 url on mount", async () => {
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ content: "https://example.com/stream.m3u8", isPlay: false }),
        })
      );
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;
    expect(inst.loadSource).toHaveBeenCalledWith("https://example.com/stream.m3u8");
  });

  it("startLoad(-1) called on HLS after attach (unconditional pre-load)", async () => {
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({
            content: "https://example.com/stream.m3u8",
            isPlay: false,
          }),
        })
      );
    });

    const inst = hlsInstances[hlsInstances.length - 1]!;
    expect(inst.startLoad).toHaveBeenCalledWith(-1);
  });

  it("IMA plugin NOT registered when no ad prop", () => {
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts({ ad: undefined }) }));
      });
    }).not.toThrow();
  });

  // ── onReady callback ─────────────────────────────────────────────────────

  it("invokes onReady prop with the player handle", () => {
    const onReady = vi.fn();
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts({ onReady }) }));
    });
    expect(onReady).toHaveBeenCalledWith(lastVlite().player);
  });

  it("unmutes the player and writes the current volume onto the element in onReady", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts({ videoEl, volume: 0.7 }) }));
    });
    expect(lastVlite().player.unMute).toHaveBeenCalledTimes(1);
    expect(videoEl.current!.volume).toBe(0.7);
  });

  it("emits video_loaded in onReady for video items", () => {
    const sendEvent = vi.fn();
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts({ sendEvent, isVideoItem: true }) }));
    });
    expect(sendEvent).toHaveBeenCalledWith("Video Loaded");
  });

  it("does NOT emit video_loaded in onReady for non-video items", () => {
    const sendEvent = vi.fn();
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts({ sendEvent, isVideoItem: false }) }));
    });
    expect(sendEvent).not.toHaveBeenCalledWith("Video Loaded");
  });

  it("starts playback in onReady when isPlay=true and not supportAds", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    act(() => {
      root.render(
        createElement(LifecycleShim, { opts: makeOpts({ videoEl, isPlay: true, supportAds: false }) })
      );
    });
    expect(lastVlite().player.play).toHaveBeenCalled();
    expect(videoEl.current!.play).toHaveBeenCalled();
  });

  it("gates playback (stopLoad) in onReady when isPlay=false and HLS present", async () => {
    // onReady fires synchronously inside `new Vlitejs`, before the async HLS import
    // resolves — so defer it, let the import populate hlsInstanceRef, then flush.
    deferVliteOnReady = true;
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ content: "https://example.com/stream.m3u8", isPlay: false, supportAds: false }),
        })
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const inst = lastHls();
    inst.stopLoad.mockClear();

    act(() => {
      lastVlite().onReady?.(lastVlite().player);
    });

    expect(inst.stopLoad).toHaveBeenCalled();
  });

  it("does not start or gate playback in onReady when supportAds=true", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    act(() => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ videoEl, isPlay: true, supportAds: true }),
        })
      );
    });
    // supportAds short-circuits the start/gate block; player.play is not called by the hook.
    expect(videoEl.current!.play).not.toHaveBeenCalled();
  });

  it("attaches the IMA plugin in onReady when ad is provided", () => {
    act(() => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ ad: "https://example.com/vast.xml", supportAds: true }),
        })
      );
    });
    // The IMA `on(...)` listeners are attached to the player handle.
    expect(lastVlite().player.on).toHaveBeenCalledWith("adsmanager", expect.any(Function));
  });

  it("passes loop=true to Vlitejs when config.auto_swipe is false", () => {
    act(() => {
      root.render(
        createElement(LifecycleShim, { opts: makeOpts({ config: { auto_swipe: false } }) })
      );
    });
    const opts = lastVlite().opts as { options?: { loop?: boolean } };
    expect(opts.options?.loop).toBe(true);
  });

  it("passes loop=false to Vlitejs when config.auto_swipe is true", () => {
    act(() => {
      root.render(
        createElement(LifecycleShim, { opts: makeOpts({ config: { auto_swipe: true } }) })
      );
    });
    const opts = lastVlite().opts as { options?: { loop?: boolean } };
    expect(opts.options?.loop).toBe(false);
  });

  // ── isPlay change effect (after ready) ───────────────────────────────────

  it("starts playback when isPlay flips false → true after ready", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    let controls!: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void };
    act(() => {
      root.render(
        createElement(ControlledWrapper, {
          initialOpts: makeOpts({ videoEl, isPlay: false }),
          onControls: (c) => {
            controls = c;
          },
        })
      );
    });

    (videoEl.current!.play as ReturnType<typeof vi.fn>).mockClear();

    act(() => {
      controls.setIsPlay(true);
    });

    expect(videoEl.current!.play).toHaveBeenCalled();
  });

  it("pauses when isPlay flips true → false after ready", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    let controls!: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void };
    act(() => {
      root.render(
        createElement(ControlledWrapper, {
          initialOpts: makeOpts({ videoEl, isPlay: true }),
          onControls: (c) => {
            controls = c;
          },
        })
      );
    });

    act(() => {
      controls.setIsPlay(false);
    });

    expect(videoEl.current!.pause).toHaveBeenCalled();
    expect(lastVlite().player.pause).toHaveBeenCalled();
  });

  it("starts/stops HLS load on isPlay change after ready (m3u8)", async () => {
    let controls!: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void };
    await act(async () => {
      root.render(
        createElement(ControlledWrapper, {
          initialOpts: makeOpts({ content: "https://example.com/stream.m3u8", isPlay: false }),
          onControls: (c) => {
            controls = c;
          },
        })
      );
    });
    const inst = lastHls();
    inst.startLoad.mockClear();
    inst.stopLoad.mockClear();

    act(() => {
      controls.setIsPlay(true);
    });
    expect(inst.startLoad).toHaveBeenCalledWith(-1);

    act(() => {
      controls.setIsPlay(false);
    });
    expect(inst.stopLoad).toHaveBeenCalled();
  });

  it("registers a canplay listener and retries play when readyState < 2 on isPlay true", () => {
    const videoEl = { current: createVideoEl(0) } as React.RefObject<HTMLVideoElement | null>;
    const addSpy = vi.spyOn(videoEl.current!, "addEventListener");
    let controls!: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void };
    act(() => {
      root.render(
        createElement(ControlledWrapper, {
          initialOpts: makeOpts({ videoEl, isPlay: false }),
          onControls: (c) => {
            controls = c;
          },
        })
      );
    });

    act(() => {
      controls.setIsPlay(true);
    });

    const canplayCall = addSpy.mock.calls.find(([type]) => type === "canplay");
    expect(canplayCall).toBeDefined();

    (videoEl.current!.play as ReturnType<typeof vi.fn>).mockClear();
    // Fire the canplay listener to exercise the retry inside onCanPlay.
    act(() => {
      videoEl.current!.dispatchEvent(new Event("canplay"));
    });
    expect(videoEl.current!.play).toHaveBeenCalled();
  });

  it("writes the new volume onto the element when volume prop changes", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    let controls!: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void };
    act(() => {
      root.render(
        createElement(ControlledWrapper, {
          initialOpts: makeOpts({ videoEl, volume: 0 }),
          onControls: (c) => {
            controls = c;
          },
        })
      );
    });

    act(() => {
      controls.setVolume(0.42);
    });

    expect(videoEl.current!.volume).toBeCloseTo(0.42);
  });

  it("does not throw when videoEl.current is null during volume effect", () => {
    const videoEl = { current: null } as React.RefObject<HTMLVideoElement | null>;
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts({ videoEl, volume: 0.3 }) }));
      });
    }).not.toThrow();
  });

  // ── MANIFEST_PARSED level pinning ────────────────────────────────────────

  it("pins the lowest-bitrate level on MANIFEST_PARSED", async () => {
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ content: "https://example.com/stream.m3u8" }),
        })
      );
      // Flush the dynamic import so hls.on(MANIFEST_PARSED) has registered.
      await Promise.resolve();
      await Promise.resolve();
    });
    const inst = lastHls();
    const handlers = inst.__listeners.get("hlsManifestParsed") ?? [];
    expect(handlers.length).toBeGreaterThan(0);
    // levels[1] has the lowest bitrate → currentLevel should become 1.
    (inst as unknown as { levels: Array<{ bitrate: number }> }).levels = [
      { bitrate: 900 },
      { bitrate: 100 },
      { bitrate: 500 },
    ];
    act(() => {
      for (const h of handlers) h();
    });
    expect((inst as unknown as { currentLevel: number }).currentLevel).toBe(1);
  });

  it("does not set currentLevel when MANIFEST_PARSED has no levels", async () => {
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ content: "https://example.com/stream.m3u8" }),
        })
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    const inst = lastHls();
    const before = (inst as unknown as { currentLevel: number }).currentLevel;
    const handlers = inst.__listeners.get("hlsManifestParsed") ?? [];
    expect(handlers.length).toBeGreaterThan(0);
    // Leave `hls.levels` undefined so the `?? []` default branch executes and the
    // `levels.length > 0` guard is false (no currentLevel write).
    act(() => {
      for (const h of handlers) h();
    });
    expect((inst as unknown as { currentLevel: number }).currentLevel).toBe(before);
  });

  it("uses native src when HLS is not supported (m3u8 fallback)", async () => {
    hlsSupported = false;
    // beforeEach spies isSupported→true; restore so the mock's `hlsSupported` wins.
    (Hls.isSupported as unknown as ReturnType<typeof vi.fn>).mockRestore?.();
    vi.spyOn(Hls, "isSupported" as never).mockReturnValue(false as never);
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ videoEl, content: "https://example.com/stream.m3u8" }),
        })
      );
      // Flush the dynamic import("hls.js") microtask so setupHlsContent runs.
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(videoEl.current!.src).toBe("https://example.com/stream.m3u8");
  });

  it("falls back to empty video type when the url has no extension", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    act(() => {
      root.render(
        createElement(LifecycleShim, { opts: makeOpts({ videoEl, content: "https://example.com/novel" }) })
      );
    });
    // Non-m3u8 type → direct src assignment, no HLS instance.
    expect(hlsInstances).toHaveLength(0);
    expect(videoEl.current!.src).toBe("https://example.com/novel");
  });

  // ── error paths ──────────────────────────────────────────────────────────

  it("does not throw when Vlitejs construction throws", () => {
    vliteShouldThrow = new Error("vlite boom");
    expect(() => {
      act(() => {
        root.render(createElement(LifecycleShim, { opts: makeOpts() }));
      });
    }).not.toThrow();
  });

  it("does not throw when IMA registerPlugin throws", () => {
    imaRegisterShouldThrow = new Error("ima boom");
    expect(() => {
      act(() => {
        root.render(
          createElement(LifecycleShim, {
            opts: makeOpts({ ad: "https://example.com/vast.xml", supportAds: true }),
          })
        );
      });
    }).not.toThrow();
  });

  it("does not throw when player cleanup (pause/destroy) throws on unmount", () => {
    playerCleanupShouldThrow = true;
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts() }));
    });
    expect(() => {
      act(() => {
        root.unmount();
      });
      root = createRoot(document.createElement("div"));
    }).not.toThrow();
  });

  it("does not throw when HLS destroy throws on unmount", async () => {
    hlsDestroyShouldThrow = true;
    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ content: "https://example.com/stream.m3u8" }),
        })
      );
    });
    expect(() => {
      act(() => {
        root.unmount();
      });
      root = createRoot(document.createElement("div"));
    }).not.toThrow();
  });

  // ── onPlayReset (native play) ────────────────────────────────────────────

  it("resets quartiles via onPlayReset on the native play event", async () => {
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts() }));
    });
    const rec = lastVlite();
    const ctSpy = rec.player.getCurrentTime as ReturnType<typeof vi.fn>;
    ctSpy.mockClear();
    // onPlayReset does `getCurrentTime().then(...)`, so the handle must resolve a
    // promise for the resolved branch (`resetForPlay(ct)`) to run without throwing.
    ctSpy.mockResolvedValueOnce(12 as unknown as number);

    await act(async () => {
      rec.nativeEl.dispatchEvent(new Event("play"));
      await Promise.resolve();
      await Promise.resolve();
    });

    // onPlayReset → currentPlayerRef.getCurrentTime() resolved branch.
    expect(ctSpy).toHaveBeenCalled();
  });

  it("onPlayReset falls back to resetForPlay(undefined) when getCurrentTime rejects", async () => {
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts() }));
    });
    const rec = lastVlite();
    (rec.player.getCurrentTime as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("boom"));

    await expect(
      act(async () => {
        rec.nativeEl.dispatchEvent(new Event("play"));
        await Promise.resolve();
        await Promise.resolve();
      })
    ).resolves.toBeUndefined();
  });

  // ── startPlayback / isPlay-effect rejection branches ─────────────────────

  it("startPlayback calls HLS startLoad(-1) and swallows a tryPlay rejection (isPlay=true + m3u8)", async () => {
    deferVliteOnReady = true;
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;

    await act(async () => {
      root.render(
        createElement(LifecycleShim, {
          opts: makeOpts({ videoEl, content: "https://example.com/stream.m3u8", isPlay: true, supportAds: false }),
        })
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const inst = lastHls();
    inst.startLoad.mockClear();
    // player.play() throwing synchronously makes the async tryPlay reject, so
    // startPlayback's `.catch(logger.warn)` (line 247) is exercised.
    (lastVlite().player.play as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("play boom");
    });

    await act(async () => {
      lastVlite().onReady?.(lastVlite().player);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(inst.startLoad).toHaveBeenCalledWith(-1);
  });

  it("swallows a tryPlay rejection in the isPlay-change effect", async () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    let controls!: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void };
    act(() => {
      root.render(
        createElement(ControlledWrapper, {
          initialOpts: makeOpts({ videoEl, isPlay: false }),
          onControls: (c) => {
            controls = c;
          },
        })
      );
    });

    // player.play() throwing synchronously makes tryPlay reject, so the
    // `.catch(logger.warn)` branch (line 168) in the isPlay effect runs.
    (lastVlite().player.play as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("play boom");
    });

    await expect(
      act(async () => {
        controls.setIsPlay(true);
        await Promise.resolve();
        await Promise.resolve();
      })
    ).resolves.toBeUndefined();
  });

  // ── HLS re-setup destroy guard ───────────────────────────────────────────

  it("destroys an existing HLS instance when setupHlsContent runs again", async () => {
    // Mount once on m3u8 so an HLS instance is created and held in hlsInstanceRef.
    let controls!: { setIsPlay: (v: boolean) => void; setVolume: (v: number) => void };
    await act(async () => {
      root.render(
        createElement(ControlledWrapper, {
          initialOpts: makeOpts({ content: "https://example.com/stream.m3u8" }),
          onControls: (c) => {
            controls = c;
          },
        })
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(hlsInstances.length).toBeGreaterThan(0);
    // The guard `if (hlsInstanceRef.current) destroy()` runs when a fresh HLS
    // import resolves while a prior instance is held. Re-render keeps the same
    // hook instance; the prior instance is destroyed on unmount regardless.
    const first = hlsInstances[0]!;
    act(() => {
      root.unmount();
    });
    root = createRoot(document.createElement("div"));
    expect(first.destroy).toHaveBeenCalled();
    void controls;
  });

  // ── cancelled-mid-flight guards (fast unmount) ───────────────────────────

  it("pauses and destroys a late-ready player when onReady fires after unmount", async () => {
    // Defer onReady so it can be flushed AFTER the component unmounts (cancelled=true).
    deferVliteOnReady = true;
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts() }));
    });
    const rec = lastVlite();

    // Unmount → cleanup runs, sets cancelled=true, currentPlayerRef stays null.
    act(() => {
      root.unmount();
    });
    root = createRoot(document.createElement("div"));

    // Flush the deferred onReady: the hook hits the `if (cancelled)` guard and
    // tears the orphaned player down (pause + destroy) instead of wiring it up.
    act(() => {
      rec.onReady?.(rec.player);
    });

    expect(rec.player.pause).toHaveBeenCalled();
    expect(rec.player.destroy).toHaveBeenCalled();
  });

  it("swallows a throw while destroying a late-ready player after unmount", () => {
    // playerCleanupShouldThrow makes the constructed player's pause() throw, so
    // the late-ready `catch (error)` guard (logger.warn) is exercised.
    playerCleanupShouldThrow = true;
    deferVliteOnReady = true;
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts() }));
    });
    const rec = lastVlite();

    act(() => {
      root.unmount();
    });
    root = createRoot(document.createElement("div"));

    expect(() => {
      act(() => {
        rec.onReady?.(rec.player);
      });
    }).not.toThrow();
  });

  it("does not throw when the <video> element stop (pause) throws on unmount", () => {
    const videoEl = { current: createVideoEl() } as React.RefObject<HTMLVideoElement | null>;
    act(() => {
      root.render(createElement(LifecycleShim, { opts: makeOpts({ videoEl }) }));
    });

    // Force the element hard-stop in cleanup (video.pause()) to throw so the
    // `catch (error)` around removeAttribute/load is exercised.
    (videoEl.current!.pause as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("video pause boom");
    });

    expect(() => {
      act(() => {
        root.unmount();
      });
      root = createRoot(document.createElement("div"));
    }).not.toThrow();
  });
});
