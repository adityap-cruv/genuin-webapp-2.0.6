/**
 * Tests for `genAdSdk` — consolidated from:
 *   ads/loadGenAdSdk.test.ts
 *   ads/useGenAdInstance.test.tsx
 *
 * The two describe suites have different isolation requirements:
 *   - `ads/loadGenAdSdk` uses `vi.resetModules()` + dynamic `import('./genAdSdk')`
 *     to reset the module-level singleton between tests.
 *   - `ads/useGenAdInstance` passes `_loadSdk` via props so tests can control
 *     resolution timing without module-level mocking.
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";

import { useGenAdInstance, type UseGenAdInstanceOptions } from "@cxr/ads/genAdSdk";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const sendEventMock = vi.fn();

vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock }),
}));

let testBus: CxrEventBus;

vi.mock("../instance/coordination/EventBusContext", () => ({
  useEventBus: () => testBus,
}));

// ─── loadGenAdSdk tests ───────────────────────────────────────────────────────
// Uses vi.resetModules() + dynamic import so each test gets a fresh module
// instance with a clean singleton — no module-level mock needed.

describe("ads/loadGenAdSdk", () => {
  beforeEach(() => {
    vi.resetModules();
    document.querySelectorAll('link[href*="gen_ad.min.css"]').forEach((el) => el.remove());
    document.querySelectorAll('script[src*="gen_ad.min.js"]').forEach((el) => el.remove());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves when the script onload fires", async () => {
    const { loadGenAdSdk } = await import("./genAdSdk");

    const promise = loadGenAdSdk();

    const script = document.querySelector('script[src*="gen_ad.min.js"]') as HTMLScriptElement;
    expect(script).not.toBeNull();
    script.dispatchEvent(new Event("load"));

    await expect(promise).resolves.toBeUndefined();
  });

  it("rejects when the script onerror fires", async () => {
    const { loadGenAdSdk } = await import("./genAdSdk");

    const promise = loadGenAdSdk();

    const script = document.querySelector('script[src*="gen_ad.min.js"]') as HTMLScriptElement;
    expect(script).not.toBeNull();
    script.dispatchEvent(new Event("error"));

    await expect(promise).rejects.toBeDefined();
  });

  it("returns the same promise on second call (singleton)", async () => {
    const { loadGenAdSdk } = await import("./genAdSdk");

    const p1 = loadGenAdSdk();
    const p2 = loadGenAdSdk();

    expect(p1).toBe(p2);

    const script = document.querySelector('script[src*="gen_ad.min.js"]') as HTMLScriptElement;
    script.dispatchEvent(new Event("load"));
    await p1;
  });

  it("injects the CSS link exactly once", async () => {
    const { loadGenAdSdk } = await import("./genAdSdk");

    loadGenAdSdk();
    loadGenAdSdk(); // second call — same singleton

    const links = document.querySelectorAll('link[href*="gen_ad.min.css"]');
    expect(links).toHaveLength(1);

    const script = document.querySelector('script[src*="gen_ad.min.js"]') as HTMLScriptElement;
    script.dispatchEvent(new Event("load"));
  });

  it("injects the script exactly once", async () => {
    const { loadGenAdSdk } = await import("./genAdSdk");

    loadGenAdSdk();
    loadGenAdSdk();

    const scripts = document.querySelectorAll('script[src*="gen_ad.min.js"]');
    expect(scripts).toHaveLength(1);

    const script = document.querySelector('script[src*="gen_ad.min.js"]') as HTMLScriptElement;
    script.dispatchEvent(new Event("load"));
  });

  it("resolves immediately when script is already present in DOM", async () => {
    const existingScript = document.createElement("script");
    existingScript.src = "https://media.begenuin.com/ad-sdk/in-feed/gen_ad.min.js";
    document.head.appendChild(existingScript);

    const { loadGenAdSdk } = await import("./genAdSdk");

    const promise = loadGenAdSdk();
    await expect(promise).resolves.toBeUndefined();
  });

  it("_resetGenAdSdkSingleton clears the cached promise", async () => {
    const { loadGenAdSdk, _resetGenAdSdkSingleton } = await import("./genAdSdk");

    const p1 = loadGenAdSdk();
    _resetGenAdSdkSingleton();
    const p2 = loadGenAdSdk();

    expect(p1).not.toBe(p2);

    for (const s of Array.from(document.querySelectorAll('script[src*="gen_ad.min.js"]'))) {
      (s as HTMLScriptElement).dispatchEvent(new Event("load"));
    }
    await p1.catch(() => undefined);
    await p2;
  });
});

// ─── useGenAdInstance hook tests ──────────────────────────────────────────────
// Uses the `_loadSdk` DI prop instead of mocking the module, so the
// loadGenAdSdk describe block's module-reset pattern is not affected.

let genAdInit: Mock;
let genAdDestroy: Mock;
let genAdMuteByContainer: Mock;
let genAdSetVolumeByContainer: Mock;
let lastInitOptions: Record<string, unknown> = {};

function installGenAd(): void {
  genAdInit = vi.fn((opts: Record<string, unknown>) => {
    lastInitOptions = opts;
    return 42; // instance id
  });
  genAdDestroy = vi.fn();
  genAdMuteByContainer = vi.fn();
  genAdSetVolumeByContainer = vi.fn();
  (window as unknown as { GenAd: unknown }).GenAd = {
    init: genAdInit,
    destroy: genAdDestroy,
    muteByContainer: genAdMuteByContainer,
    setVolumeByContainer: genAdSetVolumeByContainer,
  };
}

function uninstallGenAd(): void {
  delete (window as unknown as { GenAd?: unknown }).GenAd;
  lastInitOptions = {};
}

// Controllable SDK loader — tests override `.impl` per-test
const sdkLoader: { impl: () => Promise<void> } = {
  impl: () => Promise.resolve(),
};

interface HookResult {
  adLoaded: boolean;
  provider: string | null;
  containerId: string;
}

function mountHook(props: Omit<UseGenAdInstanceOptions, "_loadSdk">): {
  root: Root;
  container: HTMLDivElement;
  result: HookResult;
  rerender: (newProps: Omit<UseGenAdInstanceOptions, "_loadSdk">) => void;
} {
  const result: HookResult = { adLoaded: false, provider: null, containerId: "" };
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let currentProps = props;

  function Consumer() {
    const out = useGenAdInstance({ ...currentProps, _loadSdk: () => sdkLoader.impl() });
    Object.assign(result, out);
    return null;
  }

  act(() => {
    root.render(<Consumer />);
  });

  const rerender = (newProps: Omit<UseGenAdInstanceOptions, "_loadSdk">): void => {
    currentProps = newProps;
    act(() => {
      root.render(<Consumer />);
    });
  };

  return { root, container, result, rerender };
}

function unmount(root: Root, container: HTMLDivElement): void {
  act(() => root.unmount());
  container.remove();
}

const baseProps: Omit<UseGenAdInstanceOptions, "_loadSdk"> = {
  id: 1,
  instanceId: "test-instance",
  containerRef: { current: null },
  isActive: false,
  isMuted: false,
  platforms: {},
  tagDetails: {},
  item: {},
  destroySignal: 0,
};

describe("ads/useGenAdInstance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testBus = new CxrEventBus();
    installGenAd();
    lastInitOptions = {};
    sdkLoader.impl = () => Promise.resolve();
  });

  afterEach(() => {
    uninstallGenAd();
    vi.clearAllMocks();
    document.querySelectorAll("[data-gen-ad]").forEach((el) => el.remove());
  });

  it("sets containerId to gen-ad-slot-{instanceId}-{id}", () => {
    const { result, root, container } = mountHook(baseProps);
    expect(result.containerId).toBe("gen-ad-slot-test-instance-1");
    unmount(root, container);
  });

  it("does not init GenAd when isActive is false", async () => {
    const { root, container } = mountHook(baseProps);
    await act(async () => {
      await Promise.resolve();
    });
    expect(genAdInit).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("initialises GenAd when isActive becomes true", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).toHaveBeenCalledTimes(1);
    expect((lastInitOptions as { containerId: string }).containerId).toBe("gen-ad-slot-test-instance-1");
    unmount(root, container);
  });

  it("does not init while muted when gateOnUnmute is true (organic-video ad break)", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true, isMuted: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("inits immediately while muted when gateOnUnmute is false (standalone type:ads slide)", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true, isMuted: true, gateOnUnmute: false });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("init is called exactly once even when effect runs twice", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(genAdInit).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("destroys existing instance when destroySignal changes", async () => {
    const { root, container, rerender } = mountHook({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    rerender({ ...baseProps, isActive: true, destroySignal: 1 });

    expect(genAdDestroy).toHaveBeenCalledWith(42);
    unmount(root, container);
  });

  it("sets adLoaded true and fires events on waterfall success", async () => {
    const onWaterfallSuccess = vi.fn();
    const { root, container, result } = mountHook({
      ...baseProps,
      isActive: true,
      onWaterfallSuccess,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      (lastInitOptions.onWaterfallSuccess as (p: string) => void)("video");
    });

    expect(result.adLoaded).toBe(true);
    expect(result.provider).toBe("video");
    expect(onWaterfallSuccess).toHaveBeenCalledWith("video");
    expect(sendEventMock).toHaveBeenCalledWith("Ad Response Received", expect.any(Object));
    expect(sendEventMock).toHaveBeenCalledWith("Ad Impression", expect.any(Object));

    unmount(root, container);
  });

  it("resets state and fires Ad Request Failed on waterfall fail", async () => {
    const onWaterfallFail = vi.fn();
    const { root, container, result } = mountHook({
      ...baseProps,
      isActive: true,
      onWaterfallFail,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      (lastInitOptions.onWaterfallFail as (p: string) => void)("video");
    });

    expect(result.adLoaded).toBe(false);
    expect(onWaterfallFail).toHaveBeenCalledTimes(1);
    expect(sendEventMock).toHaveBeenCalledWith("Ad Request Failed", expect.any(Object));

    unmount(root, container);
  });

  it("fires Ad Requested after GenAd.init is called", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(sendEventMock).toHaveBeenCalledWith("Ad Requested", expect.any(Object));
    unmount(root, container);
  });

  it("syncs mute state via muteByContainer when isMuted changes", async () => {
    const { root, container } = mountHook({ ...baseProps, isMuted: true });
    await act(async () => {
      await Promise.resolve();
    });
    expect(genAdMuteByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1", true);
    unmount(root, container);
  });

  it("re-syncs SDK mute state when the ad loads (clears the gated-on-unmute desync)", async () => {
    // Host is unmuted, but the unmute that triggered the request fired before the
    // SDK instance existed, so the SDK can start stranded muted. When the ad fills
    // the sync must re-apply the host's unmuted state to the live instance.
    const { root, container } = mountHook({ ...baseProps, isActive: true, isMuted: false });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    genAdMuteByContainer.mockClear();

    await act(async () => {
      (lastInitOptions.onWaterfallSuccess as (p: string) => void)("video");
    });

    expect(genAdMuteByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1", false);
    unmount(root, container);
  });

  it("ad:unmuteRequest (matching containerId, muted) sets volume to 0.2 before unmuting, synchronously", async () => {
    const { root, container, result } = mountHook({ ...baseProps, isMuted: true });
    await act(async () => {
      await Promise.resolve();
    });
    // Mute-sync effect already ran for the muted prop.
    genAdMuteByContainer.mockClear();
    genAdSetVolumeByContainer.mockClear();

    // Emit the gesture-bound unmute request (what ClickOverlay does on tap).
    // emit is synchronous — the SDK calls happen inline in this same stack.
    act(() => {
      testBus.emit("ad:unmuteRequest", { containerId: result.containerId });
    });

    expect(genAdSetVolumeByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1", 0.2);
    expect(genAdMuteByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1", false);

    // Volume must be set before the unmute call to stay in the gesture chain.
    const volumeOrder = genAdSetVolumeByContainer.mock.invocationCallOrder[0] ?? Infinity;
    const muteOrder = genAdMuteByContainer.mock.invocationCallOrder[0] ?? -Infinity;
    expect(volumeOrder).toBeLessThan(muteOrder);
    unmount(root, container);
  });

  it("ad:unmuteRequest is a no-op when the ad is already unmuted", async () => {
    const { root, container, result } = mountHook({ ...baseProps, isMuted: false });
    await act(async () => {
      await Promise.resolve();
    });
    // Clear the mute-sync effect's initial muteByContainer(false) call.
    genAdMuteByContainer.mockClear();
    genAdSetVolumeByContainer.mockClear();

    act(() => {
      testBus.emit("ad:unmuteRequest", { containerId: result.containerId });
    });

    // Already unmuted → neither volume nor mute should be touched.
    expect(genAdSetVolumeByContainer).not.toHaveBeenCalled();
    expect(genAdMuteByContainer).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("ad:unmuteRequest for a NON-matching containerId is ignored (instance isolation)", async () => {
    const { root, container } = mountHook({ ...baseProps, isMuted: true });
    await act(async () => {
      await Promise.resolve();
    });
    // Mute-sync effect already ran for the muted prop.
    genAdMuteByContainer.mockClear();
    genAdSetVolumeByContainer.mockClear();

    // A different slot's request must not touch this instance.
    act(() => {
      testBus.emit("ad:unmuteRequest", { containerId: "gen-ad-slot-other-instance-99" });
    });

    expect(genAdSetVolumeByContainer).not.toHaveBeenCalled();
    expect(genAdMuteByContainer).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("does not set volume on a system/automatic unmute (effect path only)", async () => {
    const { root, container } = mountHook({ ...baseProps, isMuted: false });
    await act(async () => {
      await Promise.resolve();
    });

    // The mute-sync effect syncs mute state but never touches volume.
    expect(genAdSetVolumeByContainer).not.toHaveBeenCalled();
    expect(genAdMuteByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1", false);
    unmount(root, container);
  });

  it("does not set volume when muting", async () => {
    const { root, container } = mountHook({ ...baseProps, isMuted: true });
    await act(async () => {
      await Promise.resolve();
    });

    expect(genAdSetVolumeByContainer).not.toHaveBeenCalled();
    expect(genAdMuteByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1", true);
    unmount(root, container);
  });

  it("does not re-fire volume from an effect when containerId changes while unmuted", async () => {
    const { root, container, rerender } = mountHook({ ...baseProps, id: 1, isMuted: false });
    await act(async () => {
      await Promise.resolve();
    });
    genAdSetVolumeByContainer.mockClear();

    // Scroll to a different slot (new containerId) while still unmuted.
    act(() => {
      rerender({ ...baseProps, id: 2, isMuted: false });
    });

    // No volume call must fire from an effect re-run — volume is gesture-only now.
    expect(genAdSetVolumeByContainer).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("ad:unmuteRequest does not throw when SDK lacks setVolumeByContainer", async () => {
    delete (window as unknown as { GenAd: { setVolumeByContainer?: unknown } }).GenAd.setVolumeByContainer;

    const { root, container, result } = mountHook({ ...baseProps, isMuted: true });
    await act(async () => {
      await Promise.resolve();
    });
    genAdMuteByContainer.mockClear();

    act(() => {
      testBus.emit("ad:unmuteRequest", { containerId: result.containerId });
    });

    expect(genAdMuteByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1", false);
    unmount(root, container);
  });

  it("installs and cleans up genad:destroy listener", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      testBus.emit("genad:destroy", {});
    });

    expect(genAdDestroy).toHaveBeenCalled();

    unmount(root, container);
  });

  it("calls onAdCompleted and allows reinit via reinitKey", async () => {
    const onAdCompleted = vi.fn();
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      onAdCompleted,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      (lastInitOptions.onAdCompleted as () => void)();
    });

    expect(onAdCompleted).toHaveBeenCalledTimes(1);
    expect(genAdDestroy).toHaveBeenCalled();

    unmount(root, container);
  });

  it("fires Ad Completed analytics on onAdCompleted", async () => {
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      platforms: { video: "aniview" },
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      (lastInitOptions.onAdCompleted as (p?: string) => void)("video");
    });

    expect(sendEventMock).toHaveBeenCalledWith(
      "Ad Completed",
      expect.objectContaining({ provider: "video", ad_source: "aniview" })
    );
    unmount(root, container);
  });

  it("fires Ad Error on a generic onStageFail", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      (lastInitOptions.onStageFail as (p: string, e?: Error) => void)("video", new Error("boom 500"));
    });

    expect(sendEventMock).toHaveBeenCalledWith("Ad Error", expect.objectContaining({ provider: "video" }));
    unmount(root, container);
  });

  it("fires Ad Render Failed on a 4xx onStageFail", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      (lastInitOptions.onStageFail as (p: string, e?: Error) => void)("banner", new Error("status 404"));
    });

    expect(sendEventMock).toHaveBeenCalledWith("Ad Render Failed", expect.objectContaining({ provider: "banner" }));
    unmount(root, container);
  });

  it("fires Ad Started and Ad Rendered from the SDK events block", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const events = lastInitOptions.events as {
      onAdStarted: (e?: { provider?: string }) => void;
      onAdRendered: (e?: { provider?: string }) => void;
    };

    await act(async () => {
      events.onAdStarted({ provider: "video" });
      events.onAdRendered({ provider: "video" });
    });

    expect(sendEventMock).toHaveBeenCalledWith("Ad Started", expect.objectContaining({ provider: "video" }));
    expect(sendEventMock).toHaveBeenCalledWith("Ad Rendered", expect.objectContaining({ provider: "video" }));
    unmount(root, container);
  });

  it("fires Ad Media Quartile, Ad Skipped and Ad Clicked from the SDK events block", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const events = lastInitOptions.events as {
      onAdQuartile: (e?: { provider?: string; quartile?: number }) => void;
      onAdSkipped: (e?: { provider?: string }) => void;
      onAdClicked: (e?: { provider?: string }) => void;
    };

    await act(async () => {
      events.onAdQuartile({ provider: "video", quartile: 2 });
      events.onAdSkipped({ provider: "video" });
      events.onAdClicked({ provider: "video" });
    });

    expect(sendEventMock).toHaveBeenCalledWith(
      "Ad Media Quartile",
      expect.objectContaining({ provider: "video", quartile: 2 })
    );
    expect(sendEventMock).toHaveBeenCalledWith("Ad Skipped", expect.objectContaining({ provider: "video" }));
    expect(sendEventMock).toHaveBeenCalledWith("Ad Clicked", expect.objectContaining({ provider: "video" }));
    unmount(root, container);
  });

  it("calls onMuteClick via onVolumeChange only for system-driven changes", async () => {
    const onMuteClick = vi.fn();
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      onMuteClick,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const fireVolume = lastInitOptions.onVolumeChange as (d: {
      volume: number;
      isMuted: boolean;
      reason?: "system" | "user";
    }) => void;

    // A user-driven change inside the ad must NOT be echoed back to the host.
    await act(async () => {
      fireVolume({ volume: 0, isMuted: true, reason: "user" });
    });
    expect(onMuteClick).not.toHaveBeenCalled();

    // A system-driven change (autoplay policy / programmatic) syncs to the host.
    await act(async () => {
      fireVolume({ volume: 0, isMuted: true, reason: "system" });
    });

    expect(onMuteClick).toHaveBeenCalledWith(true);

    unmount(root, container);
  });

  it("onStageStart callback does not throw", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(() => {
      (lastInitOptions.onStageStart as (d: { stage: string }) => void)({ stage: "PLAYING" });
    }).not.toThrow();

    unmount(root, container);
  });

  it("cleanup on unmount while isActive destroys instance", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    unmount(root, container);

    expect(genAdDestroy).toHaveBeenCalled();
  });

  it("genad:destroy with no instance does not throw", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: false });

    await act(async () => {
      testBus.emit("genad:destroy", {});
    });

    expect(genAdDestroy).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("reads banner size from .gen-ext element clientWidth/Height when non-zero", async () => {
    const genExtEl = document.createElement("div");
    genExtEl.className = "gen-ext";
    Object.defineProperty(genExtEl, "clientWidth", { value: 320, configurable: true });
    Object.defineProperty(genExtEl, "clientHeight", { value: 50, configurable: true });
    document.body.appendChild(genExtEl);

    const { root, container } = mountHook({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(genAdInit).toHaveBeenCalledTimes(1);
    genExtEl.remove();
    unmount(root, container);
  });

  it("falls back to offsetWidth/Height when .gen-ext clientWidth is 0", async () => {
    const genExtEl = document.createElement("div");
    genExtEl.className = "gen-ext";
    Object.defineProperty(genExtEl, "clientWidth", { value: 0, configurable: true });
    Object.defineProperty(genExtEl, "clientHeight", { value: 0, configurable: true });
    Object.defineProperty(genExtEl, "offsetWidth", { value: 300, configurable: true });
    Object.defineProperty(genExtEl, "offsetHeight", { value: 250, configurable: true });
    document.body.appendChild(genExtEl);

    const { root, container } = mountHook({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(genAdInit).toHaveBeenCalledTimes(1);
    genExtEl.remove();
    unmount(root, container);
  });

  it("double-init guard: does not re-init when initInFlight is true (stays active)", async () => {
    let resolveLoad!: () => void;
    const deferred = new Promise<void>((res) => {
      resolveLoad = res;
    });
    sdkLoader.impl = () => deferred;

    const { root, container, rerender } = mountHook({ ...baseProps, isActive: true });

    rerender({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      resolveLoad();
      await deferred;
    });

    expect(genAdInit).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("sets banner config when displayAd is provided", async () => {
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      displayAd: { tag_id: "/123/unit", platform: "gam" },
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(genAdInit).toHaveBeenCalledTimes(1);
    const options = lastInitOptions as Record<string, unknown>;
    expect(options["banner"]).toBeDefined();
    unmount(root, container);
  });

  it("sets native config when nativeAd is provided", async () => {
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      nativeAd: { tag_id: "/456/native", platform: "native-dsp" },
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const options = lastInitOptions as Record<string, unknown>;
    expect(options["native"]).toBeDefined();
    unmount(root, container);
  });

  it("sets video config when videoAd is provided", async () => {
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: "https://example.com/vast.xml",
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const options = lastInitOptions as Record<string, unknown>;
    expect(options["video"]).toBeDefined();
    unmount(root, container);
  });

  it("handles cancelled promise (cleanup before SDK resolves)", async () => {
    let resolveLoad!: () => void;
    const deferred = new Promise<void>((res) => {
      resolveLoad = res;
    });

    const originalImpl = sdkLoader.impl;
    sdkLoader.impl = () => deferred;

    const { root, container } = mountHook({ ...baseProps, isActive: true });

    unmount(root, container);

    await act(async () => {
      resolveLoad();
      await deferred;
    });

    sdkLoader.impl = originalImpl;

    expect(genAdInit).not.toHaveBeenCalled();
  });
});

// ─── useGenAdInstance — shadow root resync ────────────────────────────────────

describe("useGenAdInstance — shadow root resync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testBus = new CxrEventBus();
    installGenAd();
    sdkLoader.impl = () => Promise.resolve();
  });

  afterEach(() => {
    uninstallGenAd();
    vi.clearAllMocks();
  });

  it("clones gen_ad.min.css into the shadow root after SDK loads", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });
    const mountDiv = document.createElement("div");
    shadowRoot.appendChild(mountDiv);

    // Ensure gen_ad.min.css is present in document.head before the SDK resolves
    const genAdLink = document.createElement("link");
    genAdLink.rel = "stylesheet";
    genAdLink.href = "https://media.begenuin.com/ad-sdk/in-feed/gen_ad.min.css";
    document.head.appendChild(genAdLink);

    const containerRef: { current: HTMLDivElement } = { current: mountDiv };

    const { root, container } = mountHook({
      ...baseProps,
      id: 99,
      instanceId: "test-shadow",
      containerRef,
      isActive: true,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const shadowLinks = Array.from(
      shadowRoot.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    );
    expect(shadowLinks.some((l) => l.href.includes("gen_ad.min.css"))).toBe(true);

    unmount(root, container);
    host.remove();
    genAdLink.remove();
  });

  it("does not throw when containerRef is not inside a shadow root", async () => {
    // containerRef pointing to a regular DOM node (no shadow root)
    const plainDiv = document.createElement("div");
    document.body.appendChild(plainDiv);
    const containerRef: React.RefObject<HTMLDivElement> = { current: plainDiv };

    const { root, container } = mountHook({
      ...baseProps,
      id: 100,
      instanceId: "test-no-shadow",
      containerRef,
      isActive: true,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // No assertion needed beyond "does not throw" — if we get here the test passes
    unmount(root, container);
    plainDiv.remove();
  });
});
