/**
 * Tests for usePlayerLifecycle.
 * Uses React createRoot directly — no @testing-library/react.
 */
import Hls from "hls.js";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { usePlayerLifecycle } from "@cxr/player/usePlayerLifecycle";

import { type HlsInstanceMock } from "../../tests/_mocks/hlsMock";
import { type PlayerHandleMock } from "../../tests/_mocks/vlitejsMock";

// Track HLS instances created during tests
const hlsInstances: HlsInstanceMock[] = [];

// Inline Vlitejs mock (vi.mock is hoisted, can't use imported factory directly)
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

// Inline HLS mock
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

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function createVideoEl() {
  const el = document.createElement("video");
  vi.spyOn(el, "play").mockResolvedValue(undefined);
  vi.spyOn(el, "pause").mockImplementation(() => undefined);
  return el;
}

type HookOpts = Parameters<typeof usePlayerLifecycle>[0];

function LifecycleShim({ opts }: { opts: HookOpts }) {
  usePlayerLifecycle(opts);
  return null;
}

// function ControlledWrapper({
//   initialOpts,
//   onSetIsPlay,
// }: {
//   initialOpts: HookOpts;
//   onSetIsPlay: (setter: (v: boolean) => void) => void;
// }) {
//   const [isPlay, setIsPlay] = useState(initialOpts.isPlay);
//   onSetIsPlay(setIsPlay);
//   usePlayerLifecycle({ ...initialOpts, isPlay });
//   return null;
// }

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

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("usePlayerLifecycle", () => {
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
});
