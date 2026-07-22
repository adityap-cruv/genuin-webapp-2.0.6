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
import type { ShadowDomConfig } from "@cxr/shadow-dom-config";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const sendEventMock = vi.fn();
const setBaseEventContextMock = vi.fn();

vi.mock("../providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setBaseEventContext: setBaseEventContextMock }),
}));

let testBus: CxrEventBus;

vi.mock("../instance/InstanceContext", () => ({
  useEventBus: () => testBus,
}));

// shadowConfig defaults to null (direct/non-shadow mode); the shadow-DOM-init
// tests below override `.value` to exercise the shadow-mode branches.
const tagDetailsMock: { value: { shadowConfig: ShadowDomConfig | null; tagId?: string } } = {
  value: { shadowConfig: null },
};

vi.mock("../providers/TagDetailsProvider", () => ({
  useTagDetails: () => tagDetailsMock.value,
}));

// Controllable `initialVolume` — tests override `.value` to exercise the
// audible-ad-start branches (`wantsAudibleAdStart = initialVolume > 0`), which
// no other test in this suite drives true.
const strategyMock: { value: { initialVolume: number; servedStatically?: boolean } } = {
  value: { initialVolume: 0 },
};

vi.mock("../strategies/StrategyProvider", () => ({
  useStrategy: () => strategyMock.value,
}));

// Shared geoip — the ad-URL ip rewrite reads this for the real client IP.
// Defaults to null (fetch unavailable in jsdom); the ip-replace test overrides it.
// `pending` lets a test hold the geoip promise open to exercise the
// cancelled-during-await race; when null, resolves immediately with `value`.
const geoipMock: {
  value: { ip?: string; query?: string; tip?: string } | null;
  pending: Promise<{ ip?: string } | null> | null;
} = { value: null, pending: null };
vi.mock("../services/api", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import("../services/api")>();
  return { ...original, getSharedGeoIp: () => geoipMock.pending ?? Promise.resolve(geoipMock.value) };
});

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
let genAdUpdateView: Mock;
let lastInitOptions: Record<string, unknown> = {};

function installGenAd(): void {
  genAdInit = vi.fn((opts: Record<string, unknown>) => {
    lastInitOptions = opts;
    return 42; // instance id
  });
  genAdDestroy = vi.fn();
  genAdMuteByContainer = vi.fn();
  genAdSetVolumeByContainer = vi.fn();
  genAdUpdateView = vi.fn();
  (window as unknown as { GenAd: unknown }).GenAd = {
    init: genAdInit,
    destroy: genAdDestroy,
    muteByContainer: genAdMuteByContainer,
    setVolumeByContainer: genAdSetVolumeByContainer,
    updateView: genAdUpdateView,
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
  // Ad requests are gated on isPlaying (see "gates the ad request on isPlaying"
  // below) — default to true here so the existing mute/active-gating tests keep
  // exercising exactly the condition they were written for.
  isPlaying: true,
  platforms: {},
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
    strategyMock.value = { initialVolume: 0 };
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

  it("does not init GenAd while isPlaying is false (autoplay paused, user hasn't tapped play)", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true, isPlaying: false });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("initialises GenAd once isPlaying becomes true", async () => {
    const { root, container, rerender } = mountHook({ ...baseProps, isActive: true, isPlaying: false });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).not.toHaveBeenCalled();

    rerender({ ...baseProps, isActive: true, isPlaying: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).toHaveBeenCalledTimes(1);
    unmount(root, container);
  });

  it("does not tear down the ad when isPlaying flips back to false after arming (latch, not a live gate)", async () => {
    const { root, container, rerender } = mountHook({ ...baseProps, isActive: true, isPlaying: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).toHaveBeenCalledTimes(1);

    rerender({ ...baseProps, isActive: true, isPlaying: false });
    await act(async () => {
      await Promise.resolve();
    });
    // Re-init would double-count the request/impression — the latch keeps the
    // already-armed slot from tearing down on a mid-play pause.
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
    // Ad Impression is intentionally NOT fired here — it fires once from the SDK's
    // own onAdImpression creative event (see the dedicated test below), so a fill
    // signal and a render signal don't double-count the same impression.
    expect(sendEventMock).not.toHaveBeenCalledWith("Ad Impression", expect.any(Object));

    unmount(root, container);
  });

  it("fires Ad Impression from the SDK's onAdImpression creative event, not from onWaterfallSuccess", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const events = lastInitOptions.events as {
      onAdImpression: (e?: { provider?: string; advertiserDomain?: string; mediaFileUrl?: string }) => void;
    };

    await act(async () => {
      events.onAdImpression({
        provider: "video",
        advertiserDomain: "example.com",
        mediaFileUrl: "https://example.com/ad.mp4",
      });
    });

    expect(sendEventMock).toHaveBeenCalledWith(
      "Ad Impression",
      expect.objectContaining({
        provider: "video",
        advertiser_domain: "example.com",
        media_file_url: "https://example.com/ad.mp4",
      })
    );

    unmount(root, container);
  });

  it("fires Ad Impression Pixel Fired from the SDK's onAdImpressionPixelFire event", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const events = lastInitOptions.events as {
      onAdImpressionPixelFire: (e?: {
        provider?: string;
        ad_pixel_url?: string;
        ad_pixel_status_code?: string;
      }) => void;
    };

    await act(async () => {
      events.onAdImpressionPixelFire({
        provider: "video",
        ad_pixel_url: "https://pixel.example.com/imp?id=1",
        ad_pixel_status_code: "200",
      });
    });

    expect(sendEventMock).toHaveBeenCalledWith(
      "Ad Impression Pixel Fired",
      expect.objectContaining({
        provider: "video",
        ad_pixel_url: "https://pixel.example.com/imp?id=1",
        ad_pixel_status_code: "200",
      })
    );

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

  it("reports a no-fill when the SDK script fails to load (ad-blocker / network)", async () => {
    const onWaterfallFail = vi.fn();
    const emitSpy = vi.spyOn(testBus, "emit");
    // The injected loader rejects — as when gen_ad.min.js is blocked; no
    // onWaterfallFail SDK callback can fire, so the .catch must terminalize.
    sdkLoader.impl = () => Promise.reject(new Error("blocked"));

    const { root, container, result } = mountHook({
      ...baseProps,
      isActive: true,
      onWaterfallFail,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.adLoaded).toBe(false);
    expect(onWaterfallFail).toHaveBeenCalledTimes(1);
    expect(sendEventMock).toHaveBeenCalledWith("Ad Request Failed", expect.any(Object));
    expect(emitSpy).toHaveBeenCalledWith("ad:nofill", {});

    unmount(root, container);
  });

  it("drops a late waterfall success that arrives after a no-fill (no double terminal event)", async () => {
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

    // No-fill fires first — sets the `cancelled` flag.
    await act(async () => {
      (lastInitOptions.onWaterfallFail as (p: string) => void)("video");
    });
    sendEventMock.mockClear();

    // A late success then arrives (SDK callback races the teardown). It must be
    // dropped: no ad:fill after ad:nofill, no Impression, no success callback.
    await act(async () => {
      (lastInitOptions.onWaterfallSuccess as (p: string) => void)("video");
    });

    expect(result.adLoaded).toBe(false);
    expect(onWaterfallSuccess).not.toHaveBeenCalled();
    expect(sendEventMock).not.toHaveBeenCalledWith("Ad Impression", expect.any(Object));

    unmount(root, container);
  });

  it("fires a terminal event at most once per run (duplicate success is dropped)", async () => {
    const onWaterfallSuccess = vi.fn();
    const { root, container } = mountHook({
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
      // Duplicate SDK callback for the same run — must be ignored.
      (lastInitOptions.onWaterfallSuccess as (p: string) => void)("video");
    });

    expect(onWaterfallSuccess).toHaveBeenCalledTimes(1);

    unmount(root, container);
  });

  it("drops a stale callback from a prior run so it cannot destroy the new run's instance (W4)", async () => {
    // Run A: activate, SDK inits (instance id 42), capture run A's callbacks.
    const { root, container, rerender } = mountHook({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const runAOnAdCompleted = lastInitOptions.onAdCompleted as (p?: string) => void;

    // Swipe away then back: run A cleans up, run B inits with a fresh instance.
    rerender({ ...baseProps, isActive: false });
    await act(async () => {
      await Promise.resolve();
    });
    genAdInit.mockReturnValueOnce(99); // run B gets a distinct instance id
    rerender({ ...baseProps, isActive: true });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    genAdDestroy.mockClear();

    // Run A's late onAdCompleted fires — it must NOT destroy run B's instance (99).
    await act(async () => {
      runAOnAdCompleted("video");
    });

    expect(genAdDestroy).not.toHaveBeenCalledWith(99);

    unmount(root, container);
  });

  it("drops a no-fill that arrives after a success in the same run", async () => {
    const onWaterfallSuccess = vi.fn();
    const onWaterfallFail = vi.fn();
    const { root, container, result } = mountHook({
      ...baseProps,
      isActive: true,
      onWaterfallSuccess,
      onWaterfallFail,
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      (lastInitOptions.onWaterfallSuccess as (p: string) => void)("video");
      (lastInitOptions.onWaterfallFail as (p: string) => void)("video");
    });

    expect(onWaterfallSuccess).toHaveBeenCalledTimes(1);
    expect(onWaterfallFail).not.toHaveBeenCalled();
    expect(result.adLoaded).toBe(true);

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

  it("onStageStart 'play' invokes onAdPlay and 'pause' invokes onAdPause", async () => {
    const onAdPlay = vi.fn();
    const onAdPause = vi.fn();
    const { root, container } = mountHook({ ...baseProps, isActive: true, onAdPlay, onAdPause });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const onStageStart = lastInitOptions.onStageStart as (d: { stage: string }) => void;
    await act(async () => {
      onStageStart({ stage: "play" });
    });
    expect(onAdPlay).toHaveBeenCalledTimes(1);
    expect(onAdPause).not.toHaveBeenCalled();

    await act(async () => {
      onStageStart({ stage: "pause" });
    });
    expect(onAdPause).toHaveBeenCalledTimes(1);

    unmount(root, container);
  });

  it("onPlaybackStateChange routes isPaused to onAdPause and unpaused to onAdPlay", async () => {
    const onAdPlay = vi.fn();
    const onAdPause = vi.fn();
    const { root, container } = mountHook({ ...baseProps, isActive: true, onAdPlay, onAdPause });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const onPlaybackStateChange = lastInitOptions.onPlaybackStateChange as (d: { isPaused: boolean }) => void;
    await act(async () => {
      onPlaybackStateChange({ isPaused: true });
    });
    expect(onAdPause).toHaveBeenCalledTimes(1);
    expect(onAdPlay).not.toHaveBeenCalled();

    await act(async () => {
      onPlaybackStateChange({ isPaused: false });
    });
    expect(onAdPlay).toHaveBeenCalledTimes(1);

    unmount(root, container);
  });

  it("tracks Ad Paused on a pause callback and nothing on resume", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    sendEventMock.mockClear();

    const onStageStart = lastInitOptions.onStageStart as (d: { stage: string }) => void;
    const onPlaybackStateChange = lastInitOptions.onPlaybackStateChange as (d: { isPaused: boolean }) => void;

    // The SDK fires a single pause callback per pause (verified live), so a
    // pause emits `Ad Paused` once.
    await act(async () => {
      onStageStart({ stage: "pause" });
    });
    expect(sendEventMock.mock.calls.filter(([name]) => name === "Ad Paused")).toHaveLength(1);

    // Resume emits nothing (Web SDK has no ad-resume event).
    await act(async () => {
      onStageStart({ stage: "play" });
      onPlaybackStateChange({ isPaused: false });
    });
    expect(sendEventMock.mock.calls.filter(([name]) => name === "Ad Paused")).toHaveLength(1);
    expect(sendEventMock.mock.calls.filter(([name]) => name === "Ad Started")).toHaveLength(0);

    unmount(root, container);
  });

  it("forwards CTA details through the events.onAdCTA callback", async () => {
    const onAdCTA = vi.fn();
    const { root, container } = mountHook({ ...baseProps, isActive: true, onAdCTA });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const events = lastInitOptions.events as { onAdCTA: (cta: unknown) => void };
    const cta = { advertiserLogo: "logo.png", ctaTitle: "Buy", ctaUrl: "https://x.test", onClick: vi.fn() };
    await act(async () => {
      events.onAdCTA(cta);
    });

    expect(onAdCTA).toHaveBeenCalledWith(cta);
    unmount(root, container);
  });

  it("fires Ad Error on an onStageFail with no error object (empty message fallback)", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // No Error argument → `error?.message ?? ""` falls back to "" → generic Ad Error.
    await act(async () => {
      (lastInitOptions.onStageFail as (p: string, e?: Error) => void)("video");
    });

    expect(sendEventMock).toHaveBeenCalledWith("Ad Error", expect.objectContaining({ provider: "video" }));
    unmount(root, container);
  });

  it("resets initInFlight when the SDK loader rejects", async () => {
    let rejectLoad!: (reason?: unknown) => void;
    const deferred = new Promise<void>((_res, rej) => {
      rejectLoad = rej;
    });
    sdkLoader.impl = () => deferred;

    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      rejectLoad(new Error("sdk load failed"));
      await deferred.catch(() => undefined);
    });

    // The rejection path must swallow the error and never call init.
    expect(genAdInit).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("does not run the fullscreen updateView handler when the slot is inactive", async () => {
    vi.useFakeTimers();
    try {
      const { root, container } = mountHook({ ...baseProps, isActive: false });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Inactive slot: the fullscreen handler hits its `if (!isActive) return` guard.
      await act(async () => {
        testBus.emit("fullscreen:enter", {});
        await vi.runAllTimersAsync();
      });

      expect(genAdUpdateView).not.toHaveBeenCalled();
      unmount(root, container);
    } finally {
      vi.useRealTimers();
    }
  });

  it("ad:unmuteRequest is a no-op when window.GenAd is absent", async () => {
    const { root, container, result } = mountHook({ ...baseProps, isMuted: true });
    await act(async () => {
      await Promise.resolve();
    });

    // Remove the SDK so the handler hits its `if (!GenAd) return` guard.
    uninstallGenAd();

    expect(() => {
      act(() => {
        testBus.emit("ad:unmuteRequest", { containerId: result.containerId });
      });
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
    // showVideo must reach GenAd.init or the side video never renders (320×100).
    expect((options["video"] as { showVideo?: boolean }).showVideo).toBe(true);
    // The ad's resolved URL is mirrored into advertiserDetails.videoUrl so the
    // current ad clip is what GenAd shows beside the banner.
    expect((options["video"] as { advertiserDetails?: { videoUrl?: string } }).advertiserDetails?.videoUrl).toBe(
      "https://example.com/vast.xml"
    );
    unmount(root, container);
  });

  it("stamps ad_url into base event context from a string videoAd", async () => {
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: "https://ads.example.com/vast?x=1",
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(setBaseEventContextMock).toHaveBeenCalledWith(
      expect.objectContaining({ ad_url: "https://ads.example.com/vast?x=1" })
    );
    unmount(root, container);
  });

  it("rewrites the ad URL (real ua + real ip) for a registered servedStatically tag", async () => {
    const uaSpy = vi.spyOn(navigator, "userAgent", "get").mockReturnValue("RealUA/9 (Test)");
    // A tag that is BOTH flagged servedStatically AND present in STATIC_TAG_IDS.
    strategyMock.value = { initialVolume: 0, servedStatically: true };
    tagDetailsMock.value = { shadowConfig: null, tagId: "6a39163e92929ebec64d78ab" };
    geoipMock.value = { ip: "203.0.113.7" };

    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: "https://ads.example.com/vast?ua=Mozilla%2FFake&ip=1.2.3.4&x=1",
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const stamped = setBaseEventContextMock.mock.calls
      .map(([arg]) => arg)
      .find((arg) => arg && typeof arg === "object" && "ad_url" in arg) as { ad_url: string };
    expect(stamped.ad_url).toContain(`ua=${encodeURIComponent("RealUA/9 (Test)")}`);
    expect(stamped.ad_url).toContain("ip=203.0.113.7");
    expect(stamped.ad_url).not.toContain("1.2.3.4");
    expect(stamped.ad_url).not.toContain("Fake");

    uaSpy.mockRestore();
    geoipMock.value = null;
    unmount(root, container);
  });

  it("strips the ip param (never sends a stale ip) for a static tag when geoip is unavailable", async () => {
    const uaSpy = vi.spyOn(navigator, "userAgent", "get").mockReturnValue("RealUA/9 (Test)");
    // Registered static tag, but geoip never resolved → clientIp undefined → strip ip.
    strategyMock.value = { initialVolume: 0, servedStatically: true };
    tagDetailsMock.value = { shadowConfig: null, tagId: "6a39163e92929ebec64d78ab" };
    geoipMock.value = null;

    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: "https://ads.example.com/vast?ua=Mozilla%2FFake&ip=1.2.3.4&x=1",
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const stamped = setBaseEventContextMock.mock.calls
      .map(([arg]) => arg)
      .find((arg) => arg && typeof arg === "object" && "ad_url" in arg) as { ad_url: string };
    // ua still rewritten to the real value; the ip param is removed entirely,
    // and the surrounding `?…&x=1` separators stay well-formed.
    expect(stamped.ad_url).toContain(`ua=${encodeURIComponent("RealUA/9 (Test)")}`);
    expect(stamped.ad_url).not.toContain("ip=");
    expect(stamped.ad_url).not.toContain("1.2.3.4");
    expect(stamped.ad_url).toContain("x=1");
    // No malformed separators from the strip.
    expect(stamped.ad_url).not.toContain("?&");
    expect(stamped.ad_url).not.toContain("&&");

    uaSpy.mockRestore();
    unmount(root, container);
  });

  it("does NOT rewrite the ad URL for a flagged-but-unregistered tag (half-static → live URL untouched)", async () => {
    const uaSpy = vi.spyOn(navigator, "userAgent", "get").mockReturnValue("RealUA/9 (Test)");
    // Flag set, but tagId absent from STATIC_TAG_IDS: this tag falls back to the
    // real feed, whose ad URL is a live backend URL that must NOT be rewritten.
    strategyMock.value = { initialVolume: 0, servedStatically: true };
    tagDetailsMock.value = { shadowConfig: null, tagId: "not-a-registered-static-tag" };
    geoipMock.value = { ip: "203.0.113.7" };

    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: "https://ads.example.com/vast?ua=Mozilla%2FFake&ip=1.2.3.4&x=1",
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const stamped = setBaseEventContextMock.mock.calls
      .map(([arg]) => arg)
      .find((arg) => arg && typeof arg === "object" && "ad_url" in arg) as { ad_url: string };
    // Byte-identical to the input: neither ua nor ip touched.
    expect(stamped.ad_url).toBe("https://ads.example.com/vast?ua=Mozilla%2FFake&ip=1.2.3.4&x=1");

    uaSpy.mockRestore();
    geoipMock.value = null;
    unmount(root, container);
  });

  it("does not init GenAd if the slot tears down while the static-tag geoip fetch is in flight", async () => {
    // Registered static tag → the effect awaits getSharedGeoIp before init. Hold
    // that promise open, unmount mid-await, then resolve: init must never fire on
    // the torn-down slot (else a leaked SDK instance the cleanup can't destroy).
    let resolveGeoip: (v: { ip?: string } | null) => void = () => {};
    geoipMock.pending = new Promise((resolve) => {
      resolveGeoip = resolve;
    });
    strategyMock.value = { initialVolume: 0, servedStatically: true };
    tagDetailsMock.value = { shadowConfig: null, tagId: "6a39163e92929ebec64d78ab" };

    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: "https://ads.example.com/vast?ip=1.2.3.4&x=1",
    });
    // Let _loadSdk resolve so the effect reaches the awaited geoip and parks there.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(genAdInit).not.toHaveBeenCalled();

    // Tear down while geoip is still pending, then resolve it.
    unmount(root, container);
    await act(async () => {
      resolveGeoip({ ip: "203.0.113.7" });
      await Promise.resolve();
      await Promise.resolve();
    });

    // The cancelled re-check after the await must have short-circuited init.
    expect(genAdInit).not.toHaveBeenCalled();

    geoipMock.pending = null;
  });

  it("stamps ad_url from an object videoAd (first resolved url field)", async () => {
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: { url: "https://ads.example.com/obj-vast?y=2", platform: "video" },
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(setBaseEventContextMock).toHaveBeenCalledWith(
      expect.objectContaining({ ad_url: "https://ads.example.com/obj-vast?y=2" })
    );
    unmount(root, container);
  });

  it("does not stamp ad_url when no videoAd url is resolvable", async () => {
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // No videoAd → no ad_url should ever be stamped into base context.
    const stampedAdUrl = setBaseEventContextMock.mock.calls.some(
      ([arg]) => arg && typeof arg === "object" && "ad_url" in arg
    );
    expect(stampedAdUrl).toBe(false);
    unmount(root, container);
  });

  it("stamps ad_url from the FIRST entry of an array videoAd", async () => {
    // extractPrimaryAdUrl's `Array.isArray(resolvedVideoAd) ? resolvedVideoAd[0] : ...`
    // true arm — only exercised by an array-shaped videoAd.
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: ["https://ads.example.com/first.xml", "https://ads.example.com/second.xml"],
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(setBaseEventContextMock).toHaveBeenCalledWith(
      expect.objectContaining({ ad_url: "https://ads.example.com/first.xml" })
    );
    unmount(root, container);
  });

  it("does not stamp ad_url when the resolved videoAd is an empty string", async () => {
    // `typeof first === "string"` true, but `first` itself is falsy ("") —
    // exercises the `first || undefined` false arm.
    const { root, container } = mountHook({ ...baseProps, isActive: true, videoAd: "" });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const stampedAdUrl = setBaseEventContextMock.mock.calls.some(
      ([arg]) => arg && typeof arg === "object" && "ad_url" in arg
    );
    expect(stampedAdUrl).toBe(false);
    unmount(root, container);
  });

  it("does not stamp ad_url when the resolved videoAd object has no url/ads_url/vastUrl string field", async () => {
    // extractPrimaryAdUrl's for-loop must fall through every key without
    // returning (none is a truthy string) and reach `return undefined`.
    const { root, container } = mountHook({
      ...baseProps,
      isActive: true,
      videoAd: { platform: "video", url: 42, ads_url: "", vastUrl: null },
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const stampedAdUrl = setBaseEventContextMock.mock.calls.some(
      ([arg]) => arg && typeof arg === "object" && "ad_url" in arg
    );
    expect(stampedAdUrl).toBe(false);
    unmount(root, container);
  });

  it("calls updateView on fullscreen change so GenAd re-renders for the new viewport", async () => {
    vi.useFakeTimers();
    try {
      const { root, container } = mountHook({ ...baseProps, isActive: true });

      // Flush the async SDK-load promise chain that precedes init.
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(genAdInit).toHaveBeenCalledTimes(1);
      // updateView is NOT called at init time — only when the viewport changes.
      expect(genAdUpdateView).not.toHaveBeenCalled();

      // Entering fullscreen schedules a deferred updateView (10ms, after DOM settles).
      await act(async () => {
        testBus.emit("fullscreen:enter", {});
        await vi.runAllTimersAsync();
      });

      expect(genAdUpdateView).toHaveBeenCalledWith(42);

      unmount(root, container);
    } finally {
      vi.useRealTimers();
    }
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

  it("drops a rejected SDK load that arrives after the run is already cancelled (no double no-fill)", async () => {
    // Mirrors "handles cancelled promise" above, but for the REJECT path: the
    // hook unmounts (cleanup sets `cancelled = true`) before the SDK load
    // settles, then the load rejects. The `.catch` guard
    // `if (cancelled || terminalFired) return;` must short-circuit so no
    // duplicate no-fill/analytics fires after teardown.
    let rejectLoad!: (reason?: unknown) => void;
    const deferred = new Promise<void>((_res, rej) => {
      rejectLoad = rej;
    });

    const originalImpl = sdkLoader.impl;
    sdkLoader.impl = () => deferred;

    const onWaterfallFail = vi.fn();
    const { root, container } = mountHook({ ...baseProps, isActive: true, onWaterfallFail });

    unmount(root, container);
    sendEventMock.mockClear();

    await act(async () => {
      rejectLoad(new Error("blocked"));
      await deferred.catch(() => undefined);
    });

    sdkLoader.impl = originalImpl;

    // Cancelled before the rejection landed — the catch guard must drop it.
    expect(onWaterfallFail).not.toHaveBeenCalled();
    expect(sendEventMock).not.toHaveBeenCalledWith("Ad Request Failed", expect.any(Object));
  });

  it("requests the ad audible (unmuted, at initialVolume) when the tag's initialVolume > 0", async () => {
    // wantsAudibleAdStart = initialVolume > 0 — drives:
    //   - `unmuteVolume` picking `initialVolume` over the shared default (line 286)
    //   - the init-time `unmute_blocked: false` seed (lines 430-432)
    //   - `muted: false` at init regardless of the host's mute prop (line 437)
    strategyMock.value = { initialVolume: 0.5 };

    const { root, container } = mountHook({ ...baseProps, isActive: true, isMuted: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(setBaseEventContextMock).toHaveBeenCalledWith({ unmute_blocked: false });
    expect((lastInitOptions as { muted?: boolean }).muted).toBe(false);
    expect((lastInitOptions as { volume?: number }).volume).toBe(0.5);

    unmount(root, container);
  });

  it("records unmute_blocked: true when an audible-start ad is system-force-muted by autoplay policy", async () => {
    strategyMock.value = { initialVolume: 0.5 };

    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    setBaseEventContextMock.mockClear();

    const fireVolume = lastInitOptions.onVolumeChange as (d: {
      volume: number;
      isMuted: boolean;
      reason?: "system" | "user";
    }) => void;

    await act(async () => {
      fireVolume({ volume: 0, isMuted: true, reason: "system" });
    });

    expect(setBaseEventContextMock).toHaveBeenCalledWith({ unmute_blocked: true });
    unmount(root, container);
  });

  it("does not record unmute_blocked when a system mute fires but the tag is not audible-start", async () => {
    // wantsAudibleAdStart is false (default initialVolume 0) — the
    // `wantsAudibleAdStart && data.isMuted` guard must stay false even though
    // `data.isMuted` is true, so `unmute_blocked` is never set from this path.
    const { root, container } = mountHook({ ...baseProps, isActive: true });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    setBaseEventContextMock.mockClear();

    const fireVolume = lastInitOptions.onVolumeChange as (d: {
      volume: number;
      isMuted: boolean;
      reason?: "system" | "user";
    }) => void;

    await act(async () => {
      fireVolume({ volume: 0, isMuted: true, reason: "system" });
    });

    expect(setBaseEventContextMock).not.toHaveBeenCalledWith({ unmute_blocked: true });
    unmount(root, container);
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

    const shadowLinks = Array.from(shadowRoot.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
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

// ─── useGenAdInstance — play/pause sync, SDK-absent guards, shadow init ────────
// A standalone block so it can install a GenAd mock that includes
// pause/resumeByContainer (the default mock omits them on purpose to exercise
// the version-guard early-return).

describe("useGenAdInstance — play/pause sync", () => {
  let pauseByContainer: Mock;
  let resumeByContainer: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    testBus = new CxrEventBus();
    pauseByContainer = vi.fn();
    resumeByContainer = vi.fn();
    lastInitOptions = {};
    sdkLoader.impl = () => Promise.resolve();
    (window as unknown as { GenAd: unknown }).GenAd = {
      init: vi.fn(() => 42),
      destroy: vi.fn(),
      muteByContainer: vi.fn(),
      setVolumeByContainer: vi.fn(),
      updateView: vi.fn(),
      pauseByContainer,
      resumeByContainer,
    };
  });

  afterEach(() => {
    delete (window as unknown as { GenAd?: unknown }).GenAd;
    vi.clearAllMocks();
  });

  it("resumes via resumeByContainer when isPlaying is true", () => {
    const { root, container } = mountHook({ ...baseProps, isPlaying: true });
    expect(resumeByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1");
    expect(pauseByContainer).not.toHaveBeenCalled();
    unmount(root, container);
  });

  it("pauses via pauseByContainer when isPlaying is false", () => {
    const { root, container } = mountHook({ ...baseProps, isPlaying: false });
    expect(pauseByContainer).toHaveBeenCalledWith("gen-ad-slot-test-instance-1");
    expect(resumeByContainer).not.toHaveBeenCalled();
    unmount(root, container);
  });
});

describe("useGenAdInstance — SDK absent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testBus = new CxrEventBus();
    lastInitOptions = {};
    sdkLoader.impl = () => Promise.resolve();
    // Intentionally do NOT install window.GenAd for this block.
    delete (window as unknown as { GenAd?: unknown }).GenAd;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("mute-sync effect is a no-op when window.GenAd is absent", () => {
    // The effect must hit its `if (!GenAd) return` guard without throwing.
    const { root, container } = mountHook({ ...baseProps, isMuted: true });
    unmount(root, container);
  });

  it("play/pause sync is a no-op when pauseByContainer is unavailable", () => {
    // Version guard: no GenAd at all → the effect early-returns safely.
    const { root, container } = mountHook({ ...baseProps, isPlaying: true });
    unmount(root, container);
  });
});

describe("useGenAdInstance — shadow DOM init", () => {
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
    tagDetailsMock.value = { shadowConfig: null };
  });

  it("passes containerElement to GenAd.init when running inside shadow DOM", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });
    const mountDiv = document.createElement("div");
    shadowRoot.appendChild(mountDiv);

    tagDetailsMock.value = {
      shadowConfig: {
        enabled: true,
        hostElement: host,
        shadowRoot,
        mountTarget: mountDiv,
        shadowHostId: "cxr-host-1",
      },
    };

    const containerRef: { current: HTMLDivElement } = { current: mountDiv };
    const result: HookResult = { adLoaded: false, provider: null, containerId: "" };
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    function Consumer() {
      const out = useGenAdInstance({
        ...baseProps,
        id: 7,
        instanceId: "shadow-init",
        containerRef,
        isActive: true,
        _loadSdk: () => sdkLoader.impl(),
      });
      Object.assign(result, out);
      return null;
    }

    act(() => {
      root.render(<Consumer />);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(genAdInit).toHaveBeenCalledTimes(1);
    // shadowDom truthy → the SDK is handed the live element so it can resolve
    // its own shadow root via element.getRootNode().
    expect((lastInitOptions as { containerElement?: HTMLElement }).containerElement).toBe(mountDiv);

    act(() => root.unmount());
    container.remove();
    host.remove();
  });

  it("omits containerElement in shadow DOM mode when the containerRef is null", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });

    tagDetailsMock.value = {
      shadowConfig: {
        enabled: true,
        hostElement: host,
        shadowRoot,
        mountTarget: host,
        shadowHostId: "cxr-host-2",
      },
    };

    // shadowDom truthy but containerRef.current === null exercises the
    // `containerRef?.current ?? undefined` nullish fallback.
    const containerRef: { current: HTMLDivElement | null } = { current: null };
    const result: HookResult = { adLoaded: false, provider: null, containerId: "" };
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    function Consumer() {
      const out = useGenAdInstance({
        ...baseProps,
        id: 8,
        instanceId: "shadow-null-ref",
        containerRef,
        isActive: true,
        _loadSdk: () => sdkLoader.impl(),
      });
      Object.assign(result, out);
      return null;
    }

    act(() => {
      root.render(<Consumer />);
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(genAdInit).toHaveBeenCalledTimes(1);
    expect((lastInitOptions as { containerElement?: HTMLElement }).containerElement).toBeUndefined();

    act(() => root.unmount());
    container.remove();
    host.remove();
  });
});
