/**
 * @jest-environment jsdom
 */

import { createVideoRegistry, type ClaimOptions } from "./registry";

// jsdom can't load the real IMA SDK, so the real AdsLayer never fires its
// content-resume callbacks. Mock it with a lightweight double that captures the
// `events` object the registry passes in, letting a test invoke
// `allAdsCompleted()` / `contentResumeRequested()` exactly as IMA would. The
// stub methods cover every member the registry calls on an adsLayer.
let resumeEvents: {
  contentResumeRequested?: () => void;
  allAdsCompleted?: () => void;
} | null = null;

jest.mock("./ads", () => ({
  AdsLayer: jest.fn().mockImplementation((_container, _adVideo, _content, events) => {
    resumeEvents = events ?? null;
    return {
      get postRollScheduled() {
        return false;
      },
      setMuted: jest.fn(),
      setVolume: jest.fn(),
      request: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      resume: jest.fn(),
      destroy: jest.fn(),
    };
  }),
}));

beforeEach(() => {
  resumeEvents = null;
});

// jsdom's HTMLMediaElement leaves `play`/`pause`/`load` unimplemented and
// has no `loadedmetadata` autopilot. The registry assumes both methods
// exist and that `play()` returns a Promise — stub on the prototype once.
beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "load", {
    configurable: true,
    value: jest.fn(),
  });
  // canPlayType returns "" by default in jsdom; force native HLS off so
  // the lazy hls.js loader path is what runs (and silently no-ops).
  Object.defineProperty(HTMLMediaElement.prototype, "canPlayType", {
    configurable: true,
    value: jest.fn(() => ""),
  });
});

afterEach(() => {
  document.body.innerHTML = "";
  // Block the hls.js CDN <script> from actually triggering `onload` —
  // jsdom doesn't load external scripts, but it does append the tag.
  // We just clean up any leftovers between tests.
  document.head.querySelectorAll('script[src*="hls.js"]').forEach((s) => s.remove());
});

const baseOpts = (overrides: Partial<ClaimOptions> = {}): ClaimOptions => ({
  src: "https://cdn.example.com/clip-a.m3u8",
  isSafari: true, // Pretend Safari → native HLS path; no async hls.js load.
  ...overrides,
});

describe("createVideoRegistry — shared element model", () => {
  describe("claim / release / claim — sequential reuse", () => {
    it("returns the same <video> element across release → claim, even with different srcs", () => {
      const registry = createVideoRegistry();

      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8" }), null);
      const elA = a.entry.videoEl;
      registry.release(a);

      const b = registry.claim("b", baseOpts({ src: "https://example.com/b.m3u8" }), null);
      expect(b.entry.videoEl).toBe(elA);
      registry.release(b);

      const c = registry.claim("c", baseOpts({ src: "https://example.com/a.m3u8" }), null);
      expect(c.entry.videoEl).toBe(elA);
    });

    it("flips refCount and parked across the lifecycle", () => {
      const registry = createVideoRegistry();
      const handle = registry.claim("a", baseOpts(), null);
      expect(handle.entry.refCount).toBe(1);
      expect(handle.entry.parked).toBe(false);

      registry.release(handle);
      expect(handle.entry.refCount).toBe(0);
      expect(handle.entry.parked).toBe(true);

      const second = registry.claim("a", baseOpts(), null);
      expect(second.entry.refCount).toBe(1);
      expect(second.entry.parked).toBe(false);
    });

    it("ignores release on an already-parked handle", () => {
      const registry = createVideoRegistry();
      const handle = registry.claim("a", baseOpts(), null);
      registry.release(handle);
      expect(() => registry.release(handle)).not.toThrow();
      expect(registry.getStats().total).toBe(1);
    });

    it("does NOT pause on park — preserves iOS un-muted gesture allowance across src swap", () => {
      // iOS Safari drops the un-muted playback authorization the moment
      // the element pauses. Park must reparent without pausing so the
      // next claim's `play()` (after `swapSrc`) keeps the unmute. The
      // audio leak between release and the next claim is bounded by a
      // single React commit — sub-millisecond in practice.
      const registry = createVideoRegistry();
      const handle = registry.claim("a", baseOpts({ play: true }), null);
      const pauseSpy = handle.entry.videoEl.pause as jest.Mock;
      pauseSpy.mockClear();

      registry.release(handle);
      expect(pauseSpy).not.toHaveBeenCalled();
    });
  });

  describe("userState preservation across srcs", () => {
    it("keeps muted/volume/playbackRate intact when src swaps on the same element", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8", muted: false, volume: 50 }), null);
      const v = a.entry.videoEl;

      v.muted = false;
      v.volume = 0.42;
      v.playbackRate = 1.25;
      v.dispatchEvent(new Event("volumechange"));
      v.dispatchEvent(new Event("ratechange"));

      registry.release(a);

      // Different src — same element. userState should follow.
      const b = registry.claim(
        "b",
        baseOpts({ src: "https://example.com/b.m3u8", muted: undefined, volume: undefined, playbackRate: undefined }),
        null
      );
      expect(b.entry.userState.muted).toBe(false);
      expect(b.entry.userState.volume).toBe(42);
      expect(b.entry.userState.playbackRate).toBe(1.25);
    });
  });

  describe("currentTime cache — scroll-back resume", () => {
    it("stores currentTime under the live src on src swap and reapplies on return", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8" }), null);
      const v = a.entry.videoEl;

      // Pretend the video advanced.
      Object.defineProperty(v, "currentTime", { value: 0, writable: true, configurable: true });
      v.currentTime = 12.5;

      // Apply a new src — should snapshot 12.5 under the old URL.
      registry.apply(a, baseOpts({ src: "https://example.com/b.m3u8" }));
      expect(registry.getStats().storedTimes).toBeGreaterThanOrEqual(1);

      // Now swap back. The seek is queued for `loadedmetadata`; simulate
      // the event firing and check that currentTime got set.
      v.currentTime = 0;
      registry.apply(a, baseOpts({ src: "https://example.com/a.m3u8" }));
      v.dispatchEvent(new Event("loadedmetadata"));
      expect(v.currentTime).toBeCloseTo(12.5);
    });

    it("stores currentTime on release so a later claim resumes from it", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8" }), null);
      const v = a.entry.videoEl;
      Object.defineProperty(v, "currentTime", { value: 0, writable: true, configurable: true });
      v.currentTime = 7.3;

      registry.release(a);
      expect(registry.getStats().storedTimes).toBe(1);

      // Reclaim under a different src first, then swap back.
      const b = registry.claim("b", baseOpts({ src: "https://example.com/b.m3u8" }), null);
      v.currentTime = 0;
      registry.apply(b, baseOpts({ src: "https://example.com/a.m3u8" }));
      v.dispatchEvent(new Event("loadedmetadata"));
      expect(v.currentTime).toBeCloseTo(7.3);
    });
  });

  describe("simultaneous duplicates — transient escape hatch", () => {
    it("mints a transient under a synthetic key when shared is in use", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts(), null);
      const b = registry.claim("b", baseOpts(), null);

      expect(a.entry.shared).toBe(true);
      expect(b.entry.shared).toBe(false);
      expect(b.key.startsWith("@shared::dup-")).toBe(true);
      expect(a.entry.videoEl).not.toBe(b.entry.videoEl);
      expect(registry.getStats().total).toBe(2);
    });

    it("destroys the transient on release rather than parking it", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts(), null);
      const b = registry.claim("b", baseOpts(), null);

      registry.release(b);
      expect(registry.getStats().total).toBe(1);
      expect(registry.getStats().entries.find((e) => e.key === b.key)).toBeUndefined();

      // Shared survives independently.
      expect(a.entry.refCount).toBe(1);
    });
  });

  describe("apply", () => {
    it("forwards muted/volume/playbackRate without re-claiming", () => {
      const registry = createVideoRegistry();
      const handle = registry.claim("a", baseOpts({ muted: false, volume: 100, playbackRate: 1 }), null);
      const v = handle.entry.videoEl;

      registry.apply(handle, baseOpts({ muted: true, volume: 50, playbackRate: 2 }));
      expect(v.muted).toBe(true);
      expect(v.volume).toBeCloseTo(0.5);
      expect(v.playbackRate).toBe(2);
    });
  });

  describe("evict / evictAll", () => {
    it("evict tears down the shared entry and clears the cache", () => {
      const registry = createVideoRegistry();
      const handle = registry.claim("a", baseOpts(), null);
      Object.defineProperty(handle.entry.videoEl, "currentTime", { value: 0, writable: true, configurable: true });
      handle.entry.videoEl.currentTime = 5;
      registry.release(handle);
      expect(registry.getStats().storedTimes).toBe(1);

      registry.evict(handle);
      expect(registry.getStats().total).toBe(0);
      expect(registry.getStats().storedTimes).toBe(0);
    });

    it("evictAll removes everything and the parking div", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts(), null);
      const b = registry.claim("b", baseOpts(), null);
      registry.release(a);
      void b;

      expect(document.querySelector("[data-video-registry-parking]")).not.toBeNull();
      registry.evictAll();
      expect(registry.getStats().total).toBe(0);
      expect(document.querySelector("[data-video-registry-parking]")).toBeNull();
    });
  });

  describe("getStats", () => {
    it("reports total/parked counts and storedTimes size", () => {
      const registry = createVideoRegistry();
      const handle = registry.claim("a", baseOpts(), null);
      Object.defineProperty(handle.entry.videoEl, "currentTime", { value: 0, writable: true, configurable: true });
      handle.entry.videoEl.currentTime = 3;
      registry.release(handle);

      const stats = registry.getStats();
      expect(stats.total).toBe(1);
      expect(stats.parked).toBe(1);
      expect(stats.storedTimes).toBe(1);
      expect(stats.entries).toHaveLength(1);
    });
  });
});

describe("VideoPlayerV2 callback rewire — Phase 1+4 regression guards", () => {
  describe("play toggle preserves shared entry", () => {
    it("does not grow entries count when only `play` flips", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ play: true }), null);
      const initial = registry.getStats().entries.length;
      registry.apply(a, baseOpts({ play: false }));
      registry.apply(a, baseOpts({ play: true }));
      expect(registry.getStats().entries.length).toBe(initial);
      registry.release(a);
    });
  });

  describe("ad play/pause sync with external play/pause (IMPROVEMENT-003)", () => {
    // The prototype-level play/pause stubs are a single shared jest.fn() whose
    // call count accumulates across every element and every test. To count
    // calls per element, assign a fresh own-property mock that shadows the
    // prototype for just that element.
    const mockEl = (el: HTMLVideoElement, method: "play" | "pause") => {
      const fn = method === "play" ? jest.fn().mockResolvedValue(undefined) : jest.fn();
      Object.defineProperty(el, method, { configurable: true, value: fn });
      return fn;
    };

    // IMA drives the ad through its AdsManager, not the raw adVideoEl, so the
    // registry routes external play/pause through AdsLayer.pause()/resume().
    // jsdom can't load the IMA SDK (loadImaSdk returns null), so stub a minimal
    // adsLayer with spy pause/resume to assert the routing.
    const stubAdsLayer = (entry: { adsLayer: unknown }) => {
      const pause = jest.fn();
      const resume = jest.fn();
      entry.adsLayer = { pause, resume } as never;
      return { pause, resume };
    };

    it("play=false during an ad break pauses the ad via AdsManager and sets pendingPause", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ play: true }), null);
      // Simulate IMA having taken over the content element for an ad break.
      a.entry.adIsPlaying = true;
      const ads = stubAdsLayer(a.entry);
      const contentPauseSpy = mockEl(a.entry.videoEl, "pause");

      registry.apply(a, baseOpts({ play: false }));

      // The ad must be paused through the AdsManager (AdsLayer.pause), NOT by
      // pausing the raw adVideoEl — IMA ignores the raw element's paused state.
      expect(ads.pause).toHaveBeenCalledTimes(1);
      expect(a.entry.pendingPause).toBe(true);
      // The content <video> must NOT be paused by this branch — IMA already
      // paused it on contentPauseRequested.
      expect(contentPauseSpy).not.toHaveBeenCalled();
      registry.release(a);
    });

    it("play=true during an ad break after a pending pause resumes the ad via AdsManager and clears pendingPause", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ play: true }), null);
      a.entry.adIsPlaying = true;
      a.entry.pendingPause = true;
      const ads = stubAdsLayer(a.entry);
      const contentPlaySpy = mockEl(a.entry.videoEl, "play");

      registry.apply(a, baseOpts({ play: true }));

      expect(ads.resume).toHaveBeenCalledTimes(1);
      expect(a.entry.pendingPause).toBe(false);
      // The content <video> must NOT be restarted while IMA drives the break.
      expect(contentPlaySpy).not.toHaveBeenCalled();
      registry.release(a);
    });

    it("clears pendingPause when content src swaps mid-break", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8", play: true }), null);
      a.entry.adIsPlaying = true;
      a.entry.pendingPause = true;

      registry.apply(a, baseOpts({ src: "https://example.com/b.m3u8", play: true }));

      // srcChanged teardown resets the ad-break state defensively.
      expect(a.entry.pendingPause).toBe(false);
      expect(a.entry.adIsPlaying).toBe(false);
      registry.release(a);
    });

    it("park resets pendingPause so a reclaimed entry starts clean", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ play: true }), null);
      a.entry.pendingPause = true;
      registry.release(a);
      expect(a.entry.pendingPause).toBe(false);
    });

    it("regression: play toggles outside an ad break still drive the content <video>", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ play: true }), null);
      // No ad break in progress.
      expect(a.entry.adIsPlaying).toBe(false);
      const contentPlaySpy = mockEl(a.entry.videoEl, "play");
      const contentPauseSpy = mockEl(a.entry.videoEl, "pause");
      const adPlaySpy = mockEl(a.entry.adVideoEl, "play");
      const adPauseSpy = mockEl(a.entry.adVideoEl, "pause");

      registry.apply(a, baseOpts({ play: false }));
      expect(contentPauseSpy).toHaveBeenCalledTimes(1);

      registry.apply(a, baseOpts({ play: true }));
      expect(contentPlaySpy).toHaveBeenCalledTimes(1);

      // The ad element is never touched outside a break.
      expect(adPlaySpy).not.toHaveBeenCalled();
      expect(adPauseSpy).not.toHaveBeenCalled();
      // pendingPause stays false the whole time.
      expect(a.entry.pendingPause).toBe(false);
      registry.release(a);
    });
  });

  describe("postRollScheduled accessor", () => {
    // VMAP-with-postroll `true` cannot be tested in jsdom — loadImaSdk() returns
    // null (no DOM script execution), so AdsLayer.ensureInitialized short-circuits
    // and `hasPostRoll` never flips. Full-loop coverage lives in Storybook/Playwright.
    it("returns false when no adUrl supplied", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts(), null);
      expect(a.entry.adsLayer?.postRollScheduled ?? false).toBe(false);
      registry.release(a);
    });

    it("adsLayer is null when adUrl is undefined", () => {
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ adUrl: undefined }), null);
      expect(a.entry.adsLayer).toBeNull();
      registry.release(a);
    });
  });

  describe("content resume after pre-roll recovers via the play() rejection", () => {
    // Pre-play wedge detection is structurally impossible: IMA leaves the content
    // element so that the *resume play() itself* fails with `NotSupportedError`
    // (MEDIA_ERR_SRC_NOT_SUPPORTED / NETWORK_NO_SOURCE). Recovery is therefore
    // driven by the rejection — a full source reset + a single play() retry.

    const notSupported = () => new DOMException("The element has no supported sources.", "NotSupportedError");

    // The prototype-level `load`/`play` stubs are a single shared jest.fn() whose
    // call count accumulates across every element and every test. Assign a fresh
    // own-property mock that shadows the prototype for just this element so the
    // count reflects only what recovery did. Mirrors the IMPROVEMENT-003 `mockEl`.
    const mockMethod = (el: HTMLVideoElement, method: "load" | "play") => {
      const fn = method === "play" ? jest.fn().mockResolvedValue(undefined) : jest.fn();
      Object.defineProperty(el, method, { configurable: true, value: fn });
      return fn;
    };

    it("native path: play() rejects NotSupportedError → full reset (removeAttribute + src re-assign + load twice) then one retry", async () => {
      const registry = createVideoRegistry();
      const a = registry.claim(
        "a",
        baseOpts({
          src: "https://example.com/a.m3u8",
          isSafari: true, // native HLS path
          play: true,
          adUrl: "https://ads.example.com/vast.xml",
        }),
        null
      );
      expect(resumeEvents).not.toBeNull();

      a.entry.adIsPlaying = true;

      // First play() (the resume attempt) rejects with the wedged-source error;
      // the recovery retry then resolves.
      const playSpy = jest.fn().mockReturnValueOnce(Promise.reject(notSupported())).mockResolvedValue(undefined);
      Object.defineProperty(a.entry.videoEl, "play", { configurable: true, value: playSpy });

      const loadSpy = mockMethod(a.entry.videoEl, "load");
      const removeAttrSpy = jest.spyOn(a.entry.videoEl, "removeAttribute");
      const srcSetter = jest.fn();
      Object.defineProperty(a.entry.videoEl, "src", {
        configurable: true,
        get: () => "https://example.com/a.m3u8",
        set: srcSetter,
      });
      // Pretend IMA left srcObject + crossorigin attached so recovery has
      // something to clear. srcObject wins resource selection over src per
      // spec; a stale crossorigin can fail resource selection synchronously.
      const srcObjectSetter = jest.fn();
      const fakeMediaSource = {} as unknown as MediaStream;
      let srcObjectValue: MediaStream | null = fakeMediaSource;
      Object.defineProperty(a.entry.videoEl, "srcObject", {
        configurable: true,
        get: () => srcObjectValue,
        set: (next: MediaStream | null) => {
          srcObjectValue = next;
          srcObjectSetter(next);
        },
      });
      a.entry.videoEl.setAttribute("crossorigin", "anonymous");

      // Drive the resume exactly as IMA's ALL_ADS_COMPLETED does.
      resumeEvents!.allAdsCompleted?.();
      // The reset + retry runs inside the rejection microtask; the re-entrancy
      // flag clears in the retry's .finally() — flush enough microtasks for both.
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      // Full reset: clear srcObject + crossorigin (IMA leftovers that win
      // resource selection / fail it synchronously), then clear the attribute
      // and re-assign the same encoded src, with a load() after each step so
      // resource selection runs fresh.
      expect(srcObjectSetter).toHaveBeenCalledWith(null);
      expect(removeAttrSpy).toHaveBeenCalledWith("crossorigin");
      expect(a.entry.videoEl.getAttribute("crossorigin")).toBeNull();
      expect(removeAttrSpy).toHaveBeenCalledWith("src");
      expect(srcSetter).toHaveBeenCalledWith("https://example.com/a.m3u8");
      expect(loadSpy).toHaveBeenCalledTimes(2);
      // play() retried exactly once (initial resume + one recovery retry = 2).
      expect(playSpy).toHaveBeenCalledTimes(2);
      expect(a.entry.recoveringSrc).toBe(false);
      expect(a.entry.adIsPlaying).toBe(false);

      registry.release(a);
    });

    it("hls.js path: recovery re-attaches via hls.js, never removeAttribute/native load()", async () => {
      // Inject a stub Hls onto window so `loadHlsCtor` resolves it synchronously
      // (its `existing` branch) and `ensureShared`'s non-native branch wires a
      // live `hls` instance. The CDN <script> never executes in jsdom otherwise.
      const loadSource = jest.fn();
      const onFn = jest.fn();
      (window as unknown as { Hls: unknown }).Hls = class {
        config: { startPosition?: number } = {};
        attachMedia() {}
        loadSource = loadSource;
        startLoad = jest.fn();
        stopLoad = jest.fn();
        on = onFn;
        off = jest.fn();
        destroy() {}
      };

      const registry = createVideoRegistry();
      // canPlayType returns "" in jsdom and isSafari:false → non-native → hls.js.
      const b = registry.claim(
        "b",
        baseOpts({
          src: "https://example.com/b.m3u8",
          isSafari: false,
          play: true,
          adUrl: "https://ads.example.com/vast.xml",
        }),
        null
      );
      // The lazy loader resolves on a microtask; flush so `hls` is attached and
      // the initial `hls.loadSource` (the pending-src replay) has fired.
      await Promise.resolve();
      await Promise.resolve();
      expect(loadSource).toHaveBeenCalledWith("https://example.com/b.m3u8");
      // The cold-start load also registers a manifest-parsed listener so the
      // fragment loader starts (autoStartLoad: false makes this mandatory).
      expect(onFn).toHaveBeenCalledWith("hlsManifestParsed", expect.any(Function));
      expect(resumeEvents).not.toBeNull();
      loadSource.mockClear();
      onFn.mockClear();

      b.entry.adIsPlaying = true;

      const playSpy = jest.fn().mockReturnValueOnce(Promise.reject(notSupported())).mockResolvedValue(undefined);
      Object.defineProperty(b.entry.videoEl, "play", { configurable: true, value: playSpy });
      const loadSpy = mockMethod(b.entry.videoEl, "load");
      const removeAttrSpy = jest.spyOn(b.entry.videoEl, "removeAttribute");
      // hls.js attaches its MediaSource to the element via srcObject. Recovery
      // must never null it out on this branch — that would tear the stream mid-
      // playback. Spy the setter and assert it's not called.
      const srcObjectSetter = jest.fn();
      Object.defineProperty(b.entry.videoEl, "srcObject", {
        configurable: true,
        get: () => null,
        set: srcObjectSetter,
      });

      resumeEvents!.allAdsCompleted?.();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      // hls.js owns the MediaSource — the native reset must never run.
      expect(removeAttrSpy).not.toHaveBeenCalledWith("src");
      expect(removeAttrSpy).not.toHaveBeenCalledWith("crossorigin");
      expect(srcObjectSetter).not.toHaveBeenCalled();
      expect(loadSpy).not.toHaveBeenCalled();
      // Recovery routes through hls.loadSource with the stored content src AND
      // re-registers the manifest-parsed listener — otherwise the fragment
      // loader would sit idle (autoStartLoad: false) and the retry play()
      // below would never produce decoded frames.
      expect(loadSource).toHaveBeenCalledWith("https://example.com/b.m3u8");
      expect(onFn).toHaveBeenCalledWith("hlsManifestParsed", expect.any(Function));
      expect(playSpy).toHaveBeenCalledTimes(2);
      expect(b.entry.recoveringSrc).toBe(false);
      expect(b.entry.adIsPlaying).toBe(false);

      registry.release(b);
      delete (window as unknown as { Hls?: unknown }).Hls;
    });

    it("NotAllowedError takes the autoplay path, NOT the source reset (regression guard)", async () => {
      const registry = createVideoRegistry();
      const a = registry.claim(
        "a",
        baseOpts({
          src: "https://example.com/a.m3u8",
          isSafari: true,
          play: true,
          adUrl: "https://ads.example.com/vast.xml",
        }),
        null
      );
      a.entry.adIsPlaying = true;
      // User is muted → autoplay rejection should trigger the muted retry, never
      // the heavy source reset.
      a.entry.userState.muted = true;
      Object.defineProperty(a.entry.videoEl, "muted", {
        configurable: true,
        writable: true,
        value: false,
      });

      const playSpy = jest
        .fn()
        .mockReturnValueOnce(Promise.reject(new DOMException("blocked", "NotAllowedError")))
        .mockResolvedValue(undefined);
      Object.defineProperty(a.entry.videoEl, "play", { configurable: true, value: playSpy });
      const loadSpy = mockMethod(a.entry.videoEl, "load");
      const removeAttrSpy = jest.spyOn(a.entry.videoEl, "removeAttribute");

      resumeEvents!.allAdsCompleted?.();
      await Promise.resolve();
      await Promise.resolve();

      // Source reset must NOT run for an autoplay rejection.
      expect(removeAttrSpy).not.toHaveBeenCalledWith("src");
      expect(loadSpy).not.toHaveBeenCalled();
      expect(a.entry.recoveringSrc).toBe(false);
      // The autoplay path muted-retried instead.
      expect(a.entry.videoEl.muted).toBe(true);

      registry.release(a);
    });

    it("retry that also rejects does not loop (bounded reset + play attempts)", async () => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      const registry = createVideoRegistry();
      const a = registry.claim(
        "a",
        baseOpts({
          src: "https://example.com/a.m3u8",
          isSafari: true,
          play: true,
          adUrl: "https://ads.example.com/vast.xml",
        }),
        null
      );
      a.entry.adIsPlaying = true;

      // Every play() rejects with the wedged-source error. The re-entrancy guard
      // must prevent the retry's rejection from re-entering recovery.
      const playSpy = jest.fn().mockImplementation(() => Promise.reject(notSupported()));
      Object.defineProperty(a.entry.videoEl, "play", { configurable: true, value: playSpy });
      const loadSpy = mockMethod(a.entry.videoEl, "load");

      resumeEvents!.allAdsCompleted?.();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      // Exactly one reset (two native load() calls) and exactly two play() calls
      // (initial resume + one retry) — no infinite loop.
      expect(loadSpy).toHaveBeenCalledTimes(2);
      expect(playSpy).toHaveBeenCalledTimes(2);
      expect(a.entry.recoveringSrc).toBe(false);

      registry.release(a);
      warn.mockRestore();
    });

    it("hls.js swipe-back resume drives startLoad via hlsManifestParsed listener (IMPROVEMENT-002)", async () => {
      // Verify hls.js's fragment loader is started by a MANUAL `startLoad(pos)`
      // dispatched from a one-shot `hlsManifestParsed` listener — not by the
      // auto-start `attachMedia` would normally queue. This is the only way to
      // prevent segments 0/1 from being pre-fetched before the resume offset
      // takes effect. Pair with `autoStartLoad: false` (asserted separately).
      const loadSource = jest.fn();
      const startLoad = jest.fn();
      const stopLoad = jest.fn();
      const destroy = jest.fn();
      // Listener registry — capture every `on('hlsManifestParsed', …)` so the
      // test can simulate hls.js dispatching the event after `loadSource()`.
      const manifestListeners: Array<() => void> = [];
      const onFn = jest.fn((event: string, listener: () => void) => {
        if (event === "hlsManifestParsed") manifestListeners.push(listener);
      });
      const offFn = jest.fn((event: string, listener: () => void) => {
        if (event !== "hlsManifestParsed") return;
        const idx = manifestListeners.indexOf(listener);
        if (idx >= 0) manifestListeners.splice(idx, 1);
      });
      const fireManifestParsed = () => {
        // Snapshot + invoke; listeners self-remove via `off` so the array
        // shrinks as we go.
        for (const l of [...manifestListeners]) l();
      };
      (window as unknown as { Hls: unknown }).Hls = class {
        config: { startPosition?: number } = {};
        attachMedia() {}
        loadSource = loadSource;
        startLoad = startLoad;
        stopLoad = stopLoad;
        on = onFn;
        off = offFn;
        destroy = destroy;
      };

      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8", isSafari: false }), null);
      // Flush the lazy hls.js loader (resolves on the existing-Hls microtask).
      await Promise.resolve();
      await Promise.resolve();
      // The cold-start claim feeds the src through hls.loadSource and registers
      // a one-shot manifest-parsed listener. Before the manifest dispatches,
      // startLoad has NOT been called.
      expect(loadSource).toHaveBeenCalledWith("https://example.com/a.m3u8");
      expect(onFn).toHaveBeenCalledWith("hlsManifestParsed", expect.any(Function));
      expect(startLoad).not.toHaveBeenCalled();

      // Simulate hls.js dispatching MANIFEST_PARSED — the listener fires
      // startLoad(-1) for a fresh cold-start (no resume position).
      fireManifestParsed();
      expect(startLoad).toHaveBeenCalledTimes(1);
      expect(startLoad).toHaveBeenCalledWith(-1);
      // The one-shot listener removed itself.
      expect(offFn).toHaveBeenCalledWith("hlsManifestParsed", expect.any(Function));

      // Pretend the video advanced.
      const v = a.entry.videoEl;
      Object.defineProperty(v, "currentTime", { value: 0, writable: true, configurable: true });
      v.currentTime = 12.4;

      loadSource.mockClear();
      startLoad.mockClear();
      onFn.mockClear();

      // Swap away to src B — stopLoad on the prior src, loadSource for B,
      // and a fresh listener registered for B's manifest (no resume → -1).
      registry.apply(a, baseOpts({ src: "https://example.com/b.m3u8", isSafari: false }));
      expect(stopLoad).toHaveBeenCalledTimes(1);
      expect(loadSource).toHaveBeenCalledWith("https://example.com/b.m3u8");
      expect(onFn).toHaveBeenCalledWith("hlsManifestParsed", expect.any(Function));
      expect(startLoad).not.toHaveBeenCalled();
      fireManifestParsed();
      expect(startLoad).toHaveBeenCalledWith(-1);

      loadSource.mockClear();
      startLoad.mockClear();
      stopLoad.mockClear();
      onFn.mockClear();

      // Swap back to A — pending seek to 12.4 must drive startLoad via the
      // manifest-parsed listener (NOT directly from loadSource).
      registry.apply(a, baseOpts({ src: "https://example.com/a.m3u8", isSafari: false }));
      expect(loadSource).toHaveBeenCalledWith("https://example.com/a.m3u8");
      expect(onFn).toHaveBeenCalledWith("hlsManifestParsed", expect.any(Function));
      expect(startLoad).not.toHaveBeenCalled();
      // stopLoad fires on the swap-away from B back to A.
      expect(stopLoad).toHaveBeenCalledTimes(1);
      // Now dispatch MANIFEST_PARSED — the listener calls startLoad(12.4).
      fireManifestParsed();
      expect(startLoad).toHaveBeenCalledTimes(1);
      expect(startLoad).toHaveBeenCalledWith(12.4);

      registry.release(a);
      delete (window as unknown as { Hls?: unknown }).Hls;
    });

    it("hls.js is constructed with autoStartLoad: false (IMPROVEMENT-002 race-fix)", async () => {
      // The CRITICAL piece of the race fix: `autoStartLoad: false` stops
      // hls.js from queueing its own `startLoad(-1)` on MANIFEST_PARSED. Without
      // this, the registry's `config.startPosition` + manual `startLoad(pos)`
      // both lose to the pre-queued auto-start in some hls.js versions, and
      // segments 0/1 get fetched before the override takes effect.
      let capturedConfig: Record<string, unknown> | undefined;
      (window as unknown as { Hls: unknown }).Hls = class {
        config: { startPosition?: number } = {};
        constructor(config?: Record<string, unknown>) {
          capturedConfig = config;
        }
        attachMedia() {}
        loadSource = jest.fn();
        startLoad = jest.fn();
        stopLoad = jest.fn();
        on = jest.fn();
        off = jest.fn();
        destroy() {}
      };

      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8", isSafari: false }), null);
      await Promise.resolve();
      await Promise.resolve();

      expect(capturedConfig).toBeDefined();
      expect(capturedConfig?.autoStartLoad).toBe(false);
      // IMPROVEMENT-002 (back-buffer pre-fill fix): prevents hls.js from
      // backfilling segments 0/1 when the resume position is deep into the
      // stream. Together with autoStartLoad: false and startFragPrefetch:
      // false, this is what eliminates the `0 → 1 → 10 → 11` swap-back trace.
      expect(capturedConfig?.backBufferLength).toBe(0);
      expect(capturedConfig?.startFragPrefetch).toBe(false);

      registry.release(a);
      delete (window as unknown as { Hls?: unknown }).Hls;
    });

    it("hls.js config.startPosition is set BEFORE loadSource() on swap-back (IMPROVEMENT-002)", async () => {
      // The race-fix: hls.js consults `config.startPosition` at MANIFEST_PARSED
      // to decide where the fragment loader fires its first request. Setting
      // it AFTER loadSource() is too late — the auto-start that attachMedia
      // queued (autoStartLoad: true) has already fired startLoad(-1) by the
      // time the manifest fetch resolves, and hls.js requests segment 0 first.
      // This test captures the live value of `config.startPosition` at the
      // exact moment `loadSource()` is invoked.
      let capturedAtLoad: number | undefined;
      const hlsInstance: {
        config: { startPosition?: number };
        loadSource: jest.Mock;
        startLoad: jest.Mock;
        stopLoad: jest.Mock;
      } = {
        config: {},
        loadSource: jest.fn(),
        startLoad: jest.fn(),
        stopLoad: jest.fn(),
      };
      hlsInstance.loadSource.mockImplementation(() => {
        capturedAtLoad = hlsInstance.config.startPosition;
      });
      (window as unknown as { Hls: unknown }).Hls = class {
        config = hlsInstance.config;
        attachMedia() {}
        loadSource = hlsInstance.loadSource;
        startLoad = hlsInstance.startLoad;
        stopLoad = hlsInstance.stopLoad;
        on = jest.fn();
        off = jest.fn();
        destroy() {}
      };

      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8", isSafari: false }), null);
      await Promise.resolve();
      await Promise.resolve();

      // Cold start (fresh src, no pending seek). config.startPosition MUST be -1
      // at the moment loadSource() runs — don't pollute the next load with a
      // stale resume offset.
      expect(capturedAtLoad).toBe(-1);

      // Advance, swap away, swap back — the swap-back should set
      // config.startPosition to the stored position BEFORE calling loadSource().
      const v = a.entry.videoEl;
      Object.defineProperty(v, "currentTime", { value: 0, writable: true, configurable: true });
      v.currentTime = 12.4;

      capturedAtLoad = undefined;
      registry.apply(a, baseOpts({ src: "https://example.com/b.m3u8", isSafari: false }));
      // Fresh src B has no stored time — startPosition must reset to -1.
      expect(capturedAtLoad).toBe(-1);

      capturedAtLoad = undefined;
      registry.apply(a, baseOpts({ src: "https://example.com/a.m3u8", isSafari: false }));
      // Swap-back to A: startPosition was set to 12.4 BEFORE loadSource fired.
      expect(capturedAtLoad).toBe(12.4);

      registry.release(a);
      delete (window as unknown as { Hls?: unknown }).Hls;
    });

    it("Safari native HLS path is unaffected by startLoad/stopLoad (IMPROVEMENT-002 regression guard)", () => {
      // Native HLS path doesn't touch hls.js at all — verify a claim with
      // isSafari:true sets videoEl.src directly and never errors regardless
      // of whether hls.js would have been used.
      const registry = createVideoRegistry();
      const a = registry.claim("a", baseOpts({ src: "https://example.com/a.m3u8", isSafari: true }), null);
      const v = a.entry.videoEl;
      Object.defineProperty(v, "currentTime", { value: 0, writable: true, configurable: true });
      v.currentTime = 8.7;

      // Swap back-and-forth should not throw — hls is null on the native path.
      expect(() => {
        registry.apply(a, baseOpts({ src: "https://example.com/b.m3u8", isSafari: true }));
        registry.apply(a, baseOpts({ src: "https://example.com/a.m3u8", isSafari: true }));
      }).not.toThrow();

      // The native seek path still runs via loadedmetadata.
      v.currentTime = 0;
      v.dispatchEvent(new Event("loadedmetadata"));
      expect(v.currentTime).toBeCloseTo(8.7);

      registry.release(a);
    });

    it("healthy element (mid/post-roll, play resolves) skips recovery and just plays", async () => {
      const registry = createVideoRegistry();
      const a = registry.claim(
        "a",
        baseOpts({
          src: "https://example.com/a.m3u8",
          isSafari: true,
          play: true,
          adUrl: "https://ads.example.com/vast.xml",
        }),
        null
      );
      a.entry.adIsPlaying = true;

      // play() resolves cleanly → no rejection → recovery never runs.
      const loadSpy = mockMethod(a.entry.videoEl, "load");
      const removeAttrSpy = jest.spyOn(a.entry.videoEl, "removeAttribute");
      const playSpy = mockMethod(a.entry.videoEl, "play");

      resumeEvents!.allAdsCompleted?.();
      await Promise.resolve();

      expect(removeAttrSpy).not.toHaveBeenCalledWith("src");
      expect(loadSpy).not.toHaveBeenCalled();
      expect(playSpy).toHaveBeenCalledTimes(1);
      expect(a.entry.recoveringSrc).toBe(false);
      expect(a.entry.adIsPlaying).toBe(false);

      registry.release(a);
    });
  });
});
