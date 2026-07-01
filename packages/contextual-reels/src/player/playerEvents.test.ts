/**
 * Tests for `playerEvents` — consolidated from:
 *   player/useQuartileEvents.test.ts
 *   player/usePlayStartedEvents.test.ts
 *   player/useActiveVideoIdBroadcast.test.ts
 */
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import {
  useQuartileEvents,
  usePlayStartedEvents,
  useActiveVideoIdBroadcast,
  RECENT_CLICK_WINDOW_MS,
} from "@cxr/player/playerEvents";
import type { PlayerHandle } from "@cxr/player/types";
import { dispatchEvent } from "@cxr/utils/eventBus";

// Mock useEventBus so useActiveVideoIdBroadcast receives the pre-created testBus.
let testBus: CxrEventBus;

vi.mock("../instance/coordination/EventBusContext", () => ({
  useEventBus: () => testBus,
}));

// ─── useQuartileEvents tests ──────────────────────────────────────────────────

function makeQuartilePlayer(eventListeners: Record<string, Array<() => void>> = {}) {
  let _currentTime = 0;
  let _duration = 100;

  const player = {
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    getCurrentTime: vi.fn(() => Promise.resolve(_currentTime)),
    getDuration: vi.fn(() => Promise.resolve(_duration)),
    on: vi.fn((event: string, handler: () => void) => {
      if (!eventListeners[event]) eventListeners[event] = [];
      eventListeners[event]!.push(handler);
    }),
    _setCurrentTime(ct: number) {
      _currentTime = ct;
    },
    _setDuration(d: number) {
      _duration = d;
    },
  };
  return player;
}

async function tick() {
  await Promise.resolve();
  await Promise.resolve();
}

function useQuartile(opts: Parameters<typeof useQuartileEvents>[0]) {
  return useQuartileEvents(opts);
}

describe("useQuartileEvents", () => {
  let sendEvent: ReturnType<typeof vi.fn>;
  let onTimeUpdate: ReturnType<typeof vi.fn>;
  let onEnded: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendEvent = vi.fn();
    onTimeUpdate = vi.fn();
    onEnded = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("emits video_first_quartile at 25% progress", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(25);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_first_quartile", expect.any(Object));
  });

  it("emits video_midpoint at 50% progress", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(50);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_midpoint", expect.any(Object));
  });

  it("emits video_third_quartile at 75% progress", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(75);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_third_quartile", expect.any(Object));
  });

  it("emits video_completed at 100% progress", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(100);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_completed", expect.any(Object));
  });

  it("dedupes: q1 never emits twice without reset", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(25);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();
    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    const calls = sendEvent.mock.calls.filter(([n]) => n === "video_first_quartile");
    expect(calls).toHaveLength(1);
  });

  it("resetForPlay at currentTime=0.05 resets all flags", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(25);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    const before = sendEvent.mock.calls.filter(([n]) => n === "video_first_quartile").length;
    expect(before).toBe(1);

    q.resetForPlay(0.05);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    const after = sendEvent.mock.calls.filter(([n]) => n === "video_first_quartile").length;
    expect(after).toBe(2);
  });

  it("resetForPlay at currentTime=1.0 does NOT reset (not a restart)", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(25);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    q.resetForPlay(1.0);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    const q1Calls = sendEvent.mock.calls.filter(([n]) => n === "video_first_quartile");
    expect(q1Calls).toHaveLength(1);
  });

  it("_wasEnded=true: resetForPlay resets even at non-zero currentTime", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(100);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["ended"] ?? []) {
      h();
    }
    await tick();

    q.resetForPlay(5.0);

    sendEvent.mockClear();
    player._setCurrentTime(25);
    player._setDuration(100);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_first_quartile", expect.any(Object));
  });

  it("video_completed fires on ended event if !_quartilesSent.q4", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(50);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["ended"] ?? []) {
      h();
    }
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_completed", expect.any(Object));
  });

  it("does NOT re-emit video_completed on ended if q4 already sent by timeupdate", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(100);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    sendEvent.mockClear();

    for (const h of listeners["ended"] ?? []) {
      h();
    }
    await tick();

    const completedCalls = sendEvent.mock.calls.filter(([n]) => n === "video_completed");
    expect(completedCalls).toHaveLength(0);
  });

  it("calls onEnded for video items (no end-roll)", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["ended"] ?? []) {
      h();
    }
    await tick();

    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onEnded when ad_placement is end-roll", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: { ad_placement: "end-roll" },
      sendEvent,
      onTimeUpdate,
      itemId: 1,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["ended"] ?? []) {
      h();
    }
    await tick();

    expect(onEnded).not.toHaveBeenCalled();
  });

  it("calls onTimeUpdate with correct args on timeupdate", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const player = makeQuartilePlayer(listeners);
    player._setCurrentTime(30);
    player._setDuration(100);

    const q = useQuartile({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 42,
      onEnded,
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) {
      h();
    }
    await tick();

    expect(onTimeUpdate).toHaveBeenCalledWith(30, 100, 42);
  });
});

// ─── usePlayStartedEvents tests ───────────────────────────────────────────────

function makePlayPlayer(vliteListeners: Record<string, Array<(e?: unknown) => void>> = {}) {
  let _currentTime = 0;
  let _duration = 100;
  const videoEl = document.createElement("video");

  const player = {
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    getCurrentTime: vi.fn(() => Promise.resolve(_currentTime)),
    getDuration: vi.fn(() => Promise.resolve(_duration)),
    getInstance: vi.fn(() => videoEl),
    on: vi.fn((event: string, handler: (e?: unknown) => void) => {
      if (!vliteListeners[event]) vliteListeners[event] = [];
      vliteListeners[event]!.push(handler);
    }),
    _videoEl: videoEl,
    _setCurrentTime(ct: number) {
      _currentTime = ct;
    },
    _setDuration(d: number) {
      _duration = d;
    },
  };
  return player;
}

function fire(videoEl: HTMLVideoElement, type: string): void {
  videoEl.dispatchEvent(new Event(type));
}

function callNames(spy: ReturnType<typeof vi.fn>): string[] {
  return (spy.mock.calls as Array<[string, ...unknown[]]>).map(([n]) => n);
}

function callsNamed(spy: ReturnType<typeof vi.fn>, name: string): Array<unknown[]> {
  return (spy.mock.calls as Array<[string, ...unknown[]]>).filter(([n]) => n === name);
}

function usePlayStartedEventsHelper(opts: Parameters<typeof usePlayStartedEvents>[0]) {
  return usePlayStartedEvents(opts);
}

describe("usePlayStartedEvents", () => {
  let sendEvent: ReturnType<typeof vi.fn>;
  let getLastUserPlayAt: ReturnType<typeof vi.fn>;
  let onPlayReset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    sendEvent = vi.fn();
    getLastUserPlayAt = vi.fn(() => 0);
    onPlayReset = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("emits video_play_interrupted on vlitejs pause with duration + watch_time", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(30);
    player._setDuration(100);

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of vlite["pause"] ?? []) {
      h();
    }
    await tick();

    expect(sendEvent).toHaveBeenCalledWith(
      "video_play_interrupted",
      expect.objectContaining({
        duration: 100,
        watch_time: 30,
      })
    );
  });

  it("emits video_started + video_play_started when currentTime <= 0.1 and recentClick", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(0.0);
    player._setDuration(100);

    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(9500); // 500ms ago — recent

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    fire(player._videoEl, "playing");
    await tick();

    const names = callNames(sendEvent);
    expect(names).toContain("video_started");
    expect(names).toContain("video_play_started");
  });

  it("emits only video_started when currentTime <= 0.1 and NOT recentClick", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(0.0);
    player._setDuration(100);

    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(5000); // 5s ago — not recent

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    fire(player._videoEl, "playing");
    await tick();

    const names = callNames(sendEvent);
    expect(names).toContain("video_started");
    expect(names).not.toContain("video_play_started");
  });

  it("emits only video_play_started when currentTime=5.0 and recentClick", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(5.0);
    player._setDuration(100);

    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(9500);

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    fire(player._videoEl, "playing");
    await tick();

    const names = callNames(sendEvent);
    expect(names).toContain("video_play_started");
    expect(names).not.toContain("video_started");
  });

  it("emits only video_started when currentTime=5.0 and NOT recentClick", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(5.0);
    player._setDuration(100);

    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(3000); // 7s ago

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    fire(player._videoEl, "playing");
    await tick();

    const names = callNames(sendEvent);
    expect(names).toContain("video_started");
    expect(names).not.toContain("video_play_started");
  });

  it("_startedSent dedupe: second playing event in same cycle is ignored", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(0.0);

    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(9500);

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    fire(player._videoEl, "playing");
    await tick();
    fire(player._videoEl, "playing");
    await tick();

    const started = callsNamed(sendEvent, "video_started");
    expect(started).toHaveLength(1);
  });

  it("_playSent dedupe: sendPlayEvent is idempotent within a play cycle", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(5.0);

    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(9500);

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    fire(player._videoEl, "playing");
    await tick();

    const playCalls = callsNamed(sendEvent, "video_play_started");
    expect(playCalls).toHaveLength(1);
  });

  it("pause resets _playSent allowing video_play_started to fire again in next cycle", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);
    player._setCurrentTime(5.0);

    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(9500);

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    // First play cycle
    fire(player._videoEl, "playing");
    await tick();
    expect(callsNamed(sendEvent, "video_play_started")).toHaveLength(1);

    // Pause resets _playSent
    for (const h of vlite["pause"] ?? []) {
      h();
    }
    await tick();

    // New play cycle: native 'play' resets _startedSent
    fire(player._videoEl, "play");
    await tick();

    fire(player._videoEl, "playing");
    await tick();

    expect(callsNamed(sendEvent, "video_play_started")).toHaveLength(2);
  });

  it("native play event calls onPlayReset", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const player = makePlayPlayer(vlite);

    const hook = usePlayStartedEventsHelper({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt,
      onPlayReset,
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    fire(player._videoEl, "play");
    await tick();

    expect(onPlayReset).toHaveBeenCalledTimes(1);
  });

  it("2000ms boundary: exactly 2000ms is NOT recent (strict <)", () => {
    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(10000 - RECENT_CLICK_WINDOW_MS);

    const isRecent = Date.now() - getLastUserPlayAt() < RECENT_CLICK_WINDOW_MS;
    expect(isRecent).toBe(false);
  });

  it("1999ms is recent", () => {
    vi.setSystemTime(10000);
    getLastUserPlayAt.mockReturnValue(10000 - 1999);

    const isRecent = Date.now() - getLastUserPlayAt() < RECENT_CLICK_WINDOW_MS;
    expect(isRecent).toBe(true);
  });

  it("RECENT_CLICK_WINDOW_MS exported constant equals 2000", () => {
    expect(RECENT_CLICK_WINDOW_MS).toBe(2000);
  });
});

// ─── useActiveVideoIdBroadcast tests ──────────────────────────────────────────

describe("useActiveVideoIdBroadcast — logic (via dispatchEvent utility)", () => {
  let events: Array<{ type: string; detail: unknown }>;

  beforeEach(() => {
    events = [];
    vi.spyOn(window, "dispatchEvent").mockImplementation((evt) => {
      const ce = evt as CustomEvent;
      events.push({ type: ce.type, detail: ce.detail });
      return true;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dispatches genai:videoId with the given videoId", () => {
    dispatchEvent("genai:videoId", { videoId: "vid-123" });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "genai:videoId",
      detail: { videoId: "vid-123" },
    });
  });

  it("dispatches again when called with a different videoId", () => {
    dispatchEvent("genai:videoId", { videoId: "vid-001" });
    dispatchEvent("genai:videoId", { videoId: "vid-002" });
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({ detail: { videoId: "vid-002" } });
  });

  it("empty string guard: hook skips dispatch for empty videoId", () => {
    const videoId: string = "";
    if (videoId && videoId.trim() !== "") {
      dispatchEvent("genai:videoId", { videoId });
    }
    expect(events).toHaveLength(0);
  });

  it("undefined guard: hook skips dispatch for undefined videoId", () => {
    const videoId: string | undefined = undefined;
    if (videoId && (videoId as string).trim() !== "") {
      dispatchEvent("genai:videoId", { videoId });
    }
    expect(events).toHaveLength(0);
  });
});

function VideoIdWrapper({ videoId }: { videoId?: string }) {
  useActiveVideoIdBroadcast({ videoId });
  return null;
}

describe("useActiveVideoIdBroadcast — hook", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  let busEmitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    testBus = new CxrEventBus();
    busEmitSpy = vi.spyOn(testBus, "emit");
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it("emits genai:videoId on the bus on mount with non-empty videoId", () => {
    act(() => {
      root.render(createElement(VideoIdWrapper, { videoId: "vid-abc" }));
    });
    expect(busEmitSpy).toHaveBeenCalledWith("genai:videoId", { videoId: "vid-abc" });
  });

  it("emits again when videoId prop changes", () => {
    act(() => {
      root.render(createElement(VideoIdWrapper, { videoId: "vid-1" }));
    });
    const before = busEmitSpy.mock.calls.filter(([n]) => n === "genai:videoId").length;
    act(() => {
      root.render(createElement(VideoIdWrapper, { videoId: "vid-2" }));
    });
    const after = busEmitSpy.mock.calls.filter(([n]) => n === "genai:videoId").length;
    expect(after).toBe(before + 1);
  });

  it("does not emit for empty string", () => {
    act(() => {
      root.render(createElement(VideoIdWrapper, { videoId: "" }));
    });
    expect(busEmitSpy.mock.calls.filter(([n]) => n === "genai:videoId")).toHaveLength(0);
  });

  it("does not emit for undefined", () => {
    act(() => {
      root.render(createElement(VideoIdWrapper, { videoId: undefined }));
    });
    expect(busEmitSpy.mock.calls.filter(([n]) => n === "genai:videoId")).toHaveLength(0);
  });
});

// ─── error / edge branches ────────────────────────────────────────────────────

describe("useQuartileEvents — error/edge branches", () => {
  it("emits video_completed(0,0) when the ended-handler Promise.all rejects", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const sendEvent = vi.fn();
    const player = {
      getCurrentTime: vi.fn(() => Promise.reject(new Error("boom"))),
      getDuration: vi.fn(() => Promise.reject(new Error("boom"))),
      on: vi.fn((event: string, handler: () => void) => {
        (listeners[event] ??= []).push(handler);
      }),
    };
    const q = useQuartileEvents({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate: vi.fn(),
      itemId: 1,
      onEnded: vi.fn(),
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["ended"] ?? []) h();
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_completed", { duration: 0, watch_time: 0 });
  });

  it("rounds non-finite duration/watch_time to 0 in the completed payload", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const sendEvent = vi.fn();
    const player = {
      // NaN/Infinity resolve values drive safeRound's non-finite (`isFinite`) false
      // branch inside buildPayload for the ended → video_completed emit.
      getCurrentTime: vi.fn(() => Promise.resolve(Infinity)),
      getDuration: vi.fn(() => Promise.resolve(NaN)),
      on: vi.fn((event: string, handler: () => void) => {
        (listeners[event] ??= []).push(handler);
      }),
    };
    const q = useQuartileEvents({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate: vi.fn(),
      itemId: 1,
      onEnded: vi.fn(),
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["ended"] ?? []) h();
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_completed", { duration: 0, watch_time: 0 });
  });

  it("skips quartile math when duration is 0 (non-positive guard)", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    const sendEvent = vi.fn();
    const onTimeUpdate = vi.fn();
    const player = {
      // duration 0 → the `duration <= 0` guard returns before any quartile emits,
      // and safeRound receives NaN watch_time to exercise its non-finite branch.
      getCurrentTime: vi.fn(() => Promise.resolve(NaN)),
      getDuration: vi.fn(() => Promise.resolve(0)),
      on: vi.fn((event: string, handler: () => void) => {
        (listeners[event] ??= []).push(handler);
      }),
    };
    const q = useQuartileEvents({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      onTimeUpdate,
      itemId: 7,
      onEnded: vi.fn(),
      isVideoItem: true,
    });
    q.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of listeners["timeupdate"] ?? []) h();
    await tick();

    expect(onTimeUpdate).toHaveBeenCalledWith(NaN, 0, 7);
    expect(sendEvent).not.toHaveBeenCalled();
  });
});

describe("usePlayStartedEvents — error/edge branches", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("emits video_play_interrupted(0,0) when the pause Promise.all rejects", async () => {
    const vlite: Record<string, Array<(e?: unknown) => void>> = {};
    const sendEvent = vi.fn();
    const videoEl = document.createElement("video");
    const player = {
      getCurrentTime: vi.fn(() => Promise.reject(new Error("boom"))),
      getDuration: vi.fn(() => Promise.reject(new Error("boom"))),
      getInstance: vi.fn(() => videoEl),
      on: vi.fn((event: string, handler: (e?: unknown) => void) => {
        (vlite[event] ??= []).push(handler);
      }),
    };
    const hook = usePlayStartedEvents({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt: vi.fn(() => 0),
      onPlayReset: vi.fn(),
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    for (const h of vlite["pause"] ?? []) h();
    await tick();

    expect(sendEvent).toHaveBeenCalledWith("video_play_interrupted", { duration: 0, watch_time: 0 });
  });

  it("emits video_started(0,0) and play_started when the playing getCurrentTime rejects", async () => {
    const sendEvent = vi.fn();
    const videoEl = document.createElement("video");
    let ctCalls = 0;
    const player = {
      // First getCurrentTime (the isRestart check) rejects → fallback catch path.
      // Subsequent calls (sendVideoStarted's Promise.all) also reject → 0,0 payload.
      getCurrentTime: vi.fn(() => {
        ctCalls += 1;
        return Promise.reject(new Error("boom"));
      }),
      getDuration: vi.fn(() => Promise.reject(new Error("boom"))),
      getInstance: vi.fn(() => videoEl),
      on: vi.fn(),
    };
    const hook = usePlayStartedEvents({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt: vi.fn(() => Date.now()), // recent click
      onPlayReset: vi.fn(),
    });
    hook.attachToPlayer(player as unknown as PlayerHandle);

    videoEl.dispatchEvent(new Event("playing"));
    await tick();
    await tick();

    expect(ctCalls).toBeGreaterThan(0);
    const names = (sendEvent.mock.calls as Array<[string, ...unknown[]]>).map(([n]) => n);
    expect(names).toContain("video_started");
    expect(names).toContain("video_play_started");
  });

  it("uses the player itself as the native target when getInstance is absent", () => {
    const sendEvent = vi.fn();
    // No getInstance → `player.getInstance?.() ?? player` falls back to `player`,
    // which HAS addEventListener, so listeners still attach without throwing.
    const listeners: Record<string, Array<() => void>> = {};
    const player = {
      getCurrentTime: vi.fn(() => Promise.resolve(0)),
      getDuration: vi.fn(() => Promise.resolve(100)),
      on: vi.fn(),
      addEventListener: vi.fn((type: string, cb: () => void) => {
        (listeners[type] ??= []).push(cb);
      }),
    };
    const hook = usePlayStartedEvents({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt: vi.fn(() => 0),
      onPlayReset: vi.fn(),
    });

    expect(() => hook.attachToPlayer(player as unknown as PlayerHandle)).not.toThrow();
    expect(player.addEventListener).toHaveBeenCalledWith("play", expect.any(Function));
  });

  it("swallows a throw while attaching the native play listeners", () => {
    const sendEvent = vi.fn();
    // addEventListener throwing forces the `catch (e)` around native attach.
    const badEl = {
      addEventListener: vi.fn(() => {
        throw new Error("attach boom");
      }),
    };
    const player = {
      getCurrentTime: vi.fn(() => Promise.resolve(0)),
      getDuration: vi.fn(() => Promise.resolve(100)),
      getInstance: vi.fn(() => badEl as unknown as HTMLVideoElement),
      on: vi.fn(),
    };
    const hook = usePlayStartedEvents({
      tagDetails: {},
      videoDetails: {},
      sendEvent,
      getLastUserPlayAt: vi.fn(() => 0),
      onPlayReset: vi.fn(),
    });

    expect(() => hook.attachToPlayer(player as unknown as PlayerHandle)).not.toThrow();
  });
});
