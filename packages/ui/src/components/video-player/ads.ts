"use client";

/**
 * Thin wrapper around Google's IMA SDK so the shared-element registry
 * can play VAST / VMAP ads in front of (and during) the long-lived
 * `<video>`. The SDK is lazy-loaded from the canonical Google host on
 * first use; subsequent `AdsLayer` instances reuse the same module.
 *
 * Why a class:
 *  - Each shared `<video>` has exactly one ad container, one
 *    `AdDisplayContainer`, and one `AdsLoader` over its lifetime.
 *    `AdsManager` is per-ad-request, so it gets recycled on every src
 *    swap or new `adUrl`.
 *  - Reparenting works for free: the IMA SDK keeps DOM references to
 *    the container element, and we always move the container alongside
 *    the `<video>` (via `entry.containerEl` in registry.ts).
 *
 * Caller contract:
 *  - Construct once per shared entry: `new AdsLayer(adContainer, videoEl)`.
 *  - Call `request(adUrl, width, height)` whenever a new ad break is
 *    appropriate (typically per src swap). The class handles ads-loaded,
 *    AdsManager init, content-pause / content-resume signaling.
 *  - Provide event hooks (`contentPauseRequested`, `contentResumeRequested`,
 *    `allAdsCompleted`, `adError`) so the registry can pause / resume
 *    the shared `<video>` without IMA managing it directly.
 *  - Call `resize` on layout change and `destroy` on shared-element
 *    teardown.
 */

const IMA_SDK_URL = "https://imasdk.googleapis.com/js/sdkloader/ima3.js";

function clampUnitVolume(volume: number): number {
  if (!Number.isFinite(volume) || volume <= 0) return 0;
  if (volume >= 1) return 1;
  return volume;
}

/**
 * Ensures the VAST/VMAP tag carries a fresh, unique `correlator` per request.
 *
 * Google's ad server uses `correlator` to dedupe ad requests within a short
 * window: two requests sharing the same correlator are treated as the same
 * page view and the second returns no ad. Our sample/production tags ship with
 * an empty `correlator=` on the expectation that the IMA SDK fills it — but the
 * SDK only does so reliably for the *first* request of a page session, so on a
 * refresh (or a second mount) the empty value is reused verbatim and the ad
 * server returns nothing. Stamping a `Date.now()` value here guarantees every
 * request is unique regardless of SDK behavior, fixing the "ad plays once, then
 * never again after refresh" failure. If a non-empty correlator is already
 * present we leave it untouched so explicit caller intent wins.
 */
function withFreshCorrelator(adTagUrl: string): string {
  try {
    const url = new URL(adTagUrl);
    const existing = url.searchParams.get("correlator");
    if (existing === null || existing === "") {
      url.searchParams.set("correlator", String(Date.now()));
    }
    return url.toString();
  } catch {
    // Not a parseable absolute URL — return as-is rather than risk mangling it.
    return adTagUrl;
  }
}

type ImaNamespace = {
  AdDisplayContainer: new (container: HTMLElement, videoEl: HTMLMediaElement) => ImaAdDisplayContainer;
  AdsLoader: new (adc: ImaAdDisplayContainer) => ImaAdsLoader;
  AdsRequest: new () => ImaAdsRequest;
  AdsRenderingSettings: new () => ImaAdsRenderingSettings;
  AdsManagerLoadedEvent: { Type: { ADS_MANAGER_LOADED: string } };
  AdEvent: {
    Type: {
      CONTENT_PAUSE_REQUESTED: string;
      CONTENT_RESUME_REQUESTED: string;
      ALL_ADS_COMPLETED: string;
      STARTED: string;
      LOADED: string;
      IMPRESSION: string;
      FIRST_QUARTILE: string;
      MIDPOINT: string;
      THIRD_QUARTILE: string;
      COMPLETE: string;
      PAUSED: string;
      RESUMED: string;
      CLICK: string;
      SKIPPED: string;
    };
  };
  AdErrorEvent: { Type: { AD_ERROR: string } };
  ViewMode: { NORMAL: string; FULLSCREEN: string };
};

interface ImaAdDisplayContainer {
  initialize(): void;
  destroy(): void;
}

interface ImaAdsLoader {
  addEventListener(type: string, listener: (e: unknown) => void): void;
  requestAds(req: ImaAdsRequest): void;
  contentComplete(): void;
  destroy(): void;
}

interface ImaAdsRequest {
  adTagUrl: string;
  linearAdSlotWidth: number;
  linearAdSlotHeight: number;
  nonLinearAdSlotWidth: number;
  nonLinearAdSlotHeight: number;
}

interface ImaAdsRenderingSettings {
  restoreCustomPlaybackStateOnAdBreakComplete: boolean;
  loadVideoTimeout?: number;
  enablePreloading?: boolean;
}

interface ImaAdsManager {
  init(width: number, height: number, viewMode: string): void;
  start(): void;
  resize(width: number, height: number, viewMode: string): void;
  destroy(): void;
  addEventListener(type: string, listener: (e: unknown) => void): void;
  setVolume(volume: number): void;
  getVolume(): number;
  getCuePoints(): number[];
  /** Pauses the ad currently rendering. IMA owns the ad's media element and
   *  playback timer — pausing the raw `<video>` does NOT stop an IMA ad; only
   *  `AdsManager.pause()` does. Mirrored by `AdsManager.resume()`. */
  pause(): void;
  /** Resumes a previously `pause()`d ad. */
  resume(): void;
}

interface ImaContentPlayhead {
  readonly currentTime: number;
}

interface ImaAdsManagerLoadedEvent {
  getAdsManager(
    contentPlayback: HTMLMediaElement | ImaContentPlayhead,
    settings: ImaAdsRenderingSettings
  ): ImaAdsManager;
}

interface ImaAdErrorEvent {
  getError(): { getMessage(): string; getErrorCode(): number };
}

interface ImaAdPodInfo {
  getTotalAds(): number;
  getAdPosition(): number;
}

interface ImaAd {
  getAdId(): string;
  getTitle(): string;
  getContentType(): string;
  getAdSystem?(): string;
  getCreativeId?(): string;
  getAdvertiserName?(): string;
  getDealId?(): string;
  getDuration?(): number;
  getAdPodInfo(): ImaAdPodInfo;
}

interface ImaAdEvent {
  getAd(): ImaAd | null;
}

/**
 * Normalized payload dispatched on `CustomEvent.detail` for all ad-level
 * `genuin:ad-*` events. Shape mirrors what `feed-player.tsx#buildAdEventData`
 * already reads — fields nullable since IMA's `Ad` object can be partially
 * populated and `getAd()` may return `null` on some event types.
 */
export type AdDetail = {
  adId: string | null;
  url: string | null;
  title: string | null;
  adFormat: string | null;
  advertiserBrandId: string | null;
  campaignId: string | null;
  lineItemId: string | null;
  creativeId: string | null;
  mediaType: string | null;
  totalAds: number;
  currentAdIndex: number;
};

let imaPromise: Promise<ImaNamespace | null> | null = null;

/**
 * Lazy-loads `ima3.js` from `imasdk.googleapis.com`. Resolves with the
 * `google.ima` namespace, or `null` when the script can't load (CSP
 * block, offline, etc.) — callers should treat that as "ads disabled,
 * play content normally".
 */
export function loadImaSdk(): Promise<ImaNamespace | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const existing = (window as unknown as { google?: { ima?: ImaNamespace } }).google?.ima;
  if (existing) return Promise.resolve(existing);
  if (imaPromise) return imaPromise;

  imaPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = IMA_SDK_URL;
    script.async = true;
    script.onload = () => {
      const ima = (window as unknown as { google?: { ima?: ImaNamespace } }).google?.ima;
      if (!ima) {
        // Script loaded but didn't expose `google.ima` — e.g. CSP
        // allowed the script tag but a follow-up XHR was blocked, or
        // the SDK loader returned an unexpected payload. Surface it so
        // the test page can show "ads disabled" instead of failing
        // silently.
        window.dispatchEvent(
          new CustomEvent("video-registry:ad-error", {
            detail: {
              message: "ima3.js loaded but window.google.ima is missing",
              code: -2,
            },
          })
        );
      }
      resolve(ima ?? null);
    };
    script.onerror = () => {
      window.dispatchEvent(
        new CustomEvent("video-registry:ad-error", {
          detail: {
            message: "failed to load ima3.js from imasdk.googleapis.com — check CSP script-src and network",
            code: -3,
          },
        })
      );
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return imaPromise;
}

export type AdsLayerEvents = {
  /** IMA fired CONTENT_PAUSE_REQUESTED — pause the content `<video>`. */
  contentPauseRequested?: () => void;
  /** IMA fired CONTENT_RESUME_REQUESTED — resume the content `<video>`. */
  contentResumeRequested?: () => void;
  /** All ads in the request finished. Optional housekeeping. */
  allAdsCompleted?: () => void;
  /** Fatal ad error — caller should fall back to content. */
  adError?: (err: { message: string; code: number }) => void;
  /**
   * Fired when the content `<video>` reaches end-of-stream while a post-roll
   * is scheduled — right before `AdsLayer` forwards `contentComplete()` to IMA.
   * Lets the registry mark its end-of-stream state (e.g. `postRollPending`) so
   * the eventual `contentResumeRequested` can branch on it.
   */
  postRollPending?: () => void;
};

/**
 * Initial audio state for the ad video. Lets the registry hand in the current
 * content-side mute/volume at construction time so the very first ad frame
 * already matches user state — no flash of silent (or loud) audio before a
 * follow-up `setMuted` / `setVolume` lands.
 */
export type AdsLayerOptions = {
  initialMuted?: boolean;
  initialVolume?: number;
};

export class AdsLayer {
  private adDisplayContainer: ImaAdDisplayContainer | null = null;
  private adsLoader: ImaAdsLoader | null = null;
  private adsManager: ImaAdsManager | null = null;
  private ima: ImaNamespace | null = null;
  /** Last `adTagUrl` we asked for. Suppresses duplicate requests. */
  private lastAdUrl: string | undefined;
  private destroyed = false;
  /** Guards `adDisplayContainer.initialize()` — IMA requires it to be called
   *  exactly once per `AdDisplayContainer` lifetime. Reset in `destroy()`. */
  private adDisplayContainerInitialized = false;
  /**
   * Incremented each time we replace the AdsLoader (in resetForNewContent).
   * Each ADS_MANAGER_LOADED listener captures the generation at registration
   * time; if it fires after the loader was replaced, the stale generation
   * causes the callback to no-op — preventing the previous ad from replaying.
   */
  private loaderGeneration = 0;
  /**
   * Desired ad audio state — mirrors the content `<video>`. Persists across
   * AdsManager rebuilds (resetForNewContent / destroy do not clear these) so
   * every new ad break starts with the user's last-known mute/volume.
   */
  private pendingMuted: boolean;
  private pendingVolume: number;
  /**
   * True when the loaded VMAP/AdsManager schedule contains a post-roll cue
   * (`getCuePoints()` includes `-1`). Used by the registry to decide whether
   * to fire `contentComplete()` on the content video's `ended` event.
   * Reset whenever the AdsManager is torn down.
   */
  private hasPostRoll = false;
  /**
   * Guards against double-signaling `adsLoader.contentComplete()` within the
   * same ad break. IMA's spec treats a second call as undefined behavior, and
   * the content video can fire `ended` multiple times in pathological cases.
   * Reset whenever the loader is recreated or a new ad break starts.
   */
  private contentCompleteSignaled = false;
  /**
   * Mirrors IMA's pause/resume signals — true between CONTENT_PAUSE_REQUESTED
   * and CONTENT_RESUME_REQUESTED / ALL_ADS_COMPLETED / AD_ERROR. Used by the
   * internal `ended` listener to ignore end-of-stream events that fire while
   * an ad break is already on screen (IMA pauses the content video during
   * a break, but `restoreCustomPlaybackStateOnAdBreakComplete=false` + SDK
   * quirks can still surface an `ended` here).
   */
  private adActive = false;
  /**
   * Most recent `currentTime` observed on the content video. Used by
   * `onContentTimeUpdate` to detect a loop wrap — a transition from a sample
   * near `duration` back to a sample near `0` — which is the only end-of-
   * content signal available when `videoEl.loop === true` (in that case the
   * native `ended` event is suppressed by the browser).
   */
  private lastContentTime = 0;
  /** Bound ref so removeEventListener works in destroy(). */
  private onContentEnded = (): void => {
    if (this.destroyed || this.adActive) return;
    if (!this.hasPostRoll) return;
    this.events.postRollPending?.();
    this.contentComplete();
  };
  /**
   * Loop-wrap detector. With `video.loop = true`, the `ended` event never
   * fires, so a post-roll-scheduled VMAP would otherwise sit dormant forever.
   * On every `timeupdate`, compare the previous sample's `currentTime` to the
   * current sample's `currentTime`; if the previous one was near `duration`
   * and this one is near `0`, the element just looped — treat that as "content
   * finished" and fire the same path as `onContentEnded`. The
   * `contentCompleteSignaled` latch inside `contentComplete()` ensures
   * subsequent loop wraps do not re-trigger the post-roll.
   */
  private onContentTimeUpdate = (): void => {
    if (this.destroyed || this.adActive) return;
    if (!this.hasPostRoll || this.contentCompleteSignaled) return;
    const v = this.contentVideoEl;
    if (!v.loop) return;
    const dur = v.duration;
    const cur = v.currentTime;
    const WRAP_END = 0.5;
    const WRAP_START = 0.5;
    if (Number.isFinite(dur) && dur > 0 && this.lastContentTime >= dur - WRAP_END && cur <= WRAP_START) {
      this.lastContentTime = cur;
      this.onContentEnded();
      return;
    }
    this.lastContentTime = cur;
  };

  constructor(
    private adContainer: HTMLDivElement,
    private adVideoEl: HTMLVideoElement,
    private contentVideoEl: HTMLVideoElement,
    private events: AdsLayerEvents = {},
    options: AdsLayerOptions = {}
  ) {
    this.pendingMuted = options.initialMuted ?? true;
    this.pendingVolume = clampUnitVolume(options.initialVolume ?? 1);
    this.adVideoEl.muted = this.pendingMuted;
    this.adVideoEl.volume = this.pendingVolume;
    // Signal IMA when content finishes so a scheduled VMAP post-roll fires.
    // Two parallel detectors: `ended` for non-looping playback, and a
    // `timeupdate` wrap detector for `videoEl.loop === true` (where `ended`
    // is never emitted by the browser). Both ultimately route through
    // `onContentEnded`, which is idempotent via `contentCompleteSignaled`.
    this.contentVideoEl.addEventListener("ended", this.onContentEnded);
    this.contentVideoEl.addEventListener("timeupdate", this.onContentTimeUpdate);
  }

  /**
   * Mirror the content video's muted state onto the ad track. Applies to the
   * underlying `<video>` immediately and, if an AdsManager exists, drives IMA
   * via `setVolume(0)` — IMA has no dedicated mute, so volume=0 is the
   * canonical way to silence ad audio at the SDK layer.
   */
  setMuted(muted: boolean): void {
    this.pendingMuted = muted;
    this.adVideoEl.muted = muted;
    if (this.adsManager) {
      try {
        this.adsManager.setVolume(muted ? 0 : this.pendingVolume);
      } catch {
        // ignore — some SDK versions throw if called pre-init
      }
    }
  }

  /**
   * Mirror the content video's volume onto the ad track. Stored even while
   * muted so an unmute restores the correct level.
   */
  setVolume(volume: number): void {
    const v = clampUnitVolume(volume);
    this.pendingVolume = v;
    this.adVideoEl.volume = v;
    if (this.adsManager && !this.pendingMuted) {
      try {
        this.adsManager.setVolume(v);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Pauses the ad currently on screen via IMA's `AdsManager.pause()`.
   *
   * Why this exists (overrides the IMPROVEMENT-003 doc note that said "no new
   * AdsLayer API"): IMA drives the ad through its own `AdsManager`, not the raw
   * `adVideoEl`. Calling `adVideoEl.pause()` directly does NOT stop an IMA ad —
   * the SDK keeps its playback timer running and re-asserts control, so the ad
   * audio/video continues and the external pause button appears to do nothing.
   * `AdsManager.pause()` is the only call that actually halts an IMA ad (this
   * mirrors how mute/volume already route through `AdsManager.setVolume`, never
   * through `adVideoEl`). No-op when no ad break is active.
   */
  pause(): void {
    if (this.destroyed || !this.adsManager) return;
    try {
      this.adsManager.pause();
    } catch {
      // Some SDK builds throw if pause() is called between ad slots; the
      // AdsManager state is then already non-playing, so a no-op is correct.
    }
  }

  /**
   * Resumes an ad previously paused via {@link pause}. No-op when no ad break
   * is active. On iOS Safari a resume after a long background gap may still be
   * blocked by autoplay policy (documented known edge case) — IMA surfaces that
   * as an AD_ERROR which the registry handles by falling back to content.
   */
  resume(): void {
    if (this.destroyed || !this.adsManager) return;
    try {
      this.adsManager.resume();
    } catch {
      // ignore — mirrors pause(): a throw means there's nothing to resume.
    }
  }

  /**
   * Idempotent. The first call loads the SDK and constructs the
   * `AdDisplayContainer` + `AdsLoader`; later calls fast-path.
   * Returns `false` if the SDK couldn't load — caller should skip ads.
   */
  async ensureInitialized(): Promise<boolean> {
    if (this.destroyed) return false;
    if (this.adsLoader) return true;
    const ima = await loadImaSdk();
    if (!ima || this.destroyed) return false;
    this.ima = ima;

    this.adDisplayContainer = new ima.AdDisplayContainer(this.adContainer, this.adVideoEl);
    this.adsLoader = new ima.AdsLoader(this.adDisplayContainer);
    this.attachLoaderListeners(this.adsLoader, this.loaderGeneration);
    return true;
  }

  /**
   * Request a new ad break. If the same `adUrl` was already requested
   * since the last `destroy`, this is a no-op. Always tears down any
   * prior `AdsManager` first so VMAPs don't double-trigger.
   */
  async request(adUrl: string, width: number, height: number): Promise<void> {
    if (this.destroyed) return;
    if (this.lastAdUrl === adUrl && this.adsManager) return;

    // Snapshot generation before the async gap — if resetForNewContent() fires
    // while we await the SDK, the generation will have incremented and we must
    // discard this stale request rather than calling requestAds on the new loader.
    const requestGen = this.loaderGeneration;

    const ok = await this.ensureInitialized();
    if (!ok || !this.ima || !this.adsLoader) return;
    if (this.loaderGeneration !== requestGen) return;

    if (this.adsManager) {
      try {
        this.adsManager.destroy();
      } catch {
        // IMA's destroy occasionally throws on partial state; safe to
        // swallow — we're replacing the manager anyway.
      }
      this.adsManager = null;
    }

    // initialize() must be called exactly once per AdDisplayContainer
    // lifetime — IMA requires it from a user gesture or an autoplay-
    // permitted context (muted+playsinline qualifies on iOS). Calling it
    // again after the first time is a no-op at best and throws on some
    // SDK versions, so guard with a flag.
    if (!this.adDisplayContainerInitialized) {
      try {
        this.adDisplayContainer?.initialize();
        this.adDisplayContainerInitialized = true;
        // iOS Safari paints <video> in its own GPU compositor layer above
        // sibling DOM at the same z-index. IMA prepends its UI wrapper
        // (iframe + skip button) during initialize(), so adVideoEl ends up
        // as the LAST child and obscures the skip UI. Move adVideoEl to
        // the front so IMA's wrapper is last in DOM order and paints on top.
        if (this.adContainer.firstChild !== this.adVideoEl) {
          this.adContainer.insertBefore(this.adVideoEl, this.adContainer.firstChild);
        }
      } catch (e) {
        this.events.adError?.({
          message: e instanceof Error ? e.message : String(e),
          code: -1,
        });
        return;
      }
    }

    this.lastAdUrl = adUrl;
    // New break — clear the contentComplete latch so a post-roll request after
    // a prior signaled break can still fire its own contentComplete later.
    this.contentCompleteSignaled = false;
    this.hasPostRoll = false;

    const adsRequest = new this.ima.AdsRequest();
    // Stamp a unique correlator so the ad server doesn't dedupe repeat requests
    // (e.g. after a page refresh or a re-mount) and return no ad.
    adsRequest.adTagUrl = withFreshCorrelator(adUrl);
    adsRequest.linearAdSlotWidth = Math.max(width, 1);
    adsRequest.linearAdSlotHeight = Math.max(height, 1);
    adsRequest.nonLinearAdSlotWidth = Math.max(width, 1);
    adsRequest.nonLinearAdSlotHeight = Math.max(Math.floor(height * 0.2), 1);

    this.emit("genuin:ad-requested", { adTagUrl: adUrl });
    try {
      this.adsLoader.requestAds(adsRequest);
    } catch (e) {
      this.events.adError?.({
        message: e instanceof Error ? e.message : String(e),
        code: -1,
      });
    }
  }

  private attachLoaderListeners(loader: ImaAdsLoader, gen: number): void {
    loader.addEventListener(this.ima!.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, (e) => {
      if (gen !== this.loaderGeneration) return;
      this.onAdsManagerLoaded(e as ImaAdsManagerLoadedEvent);
    });
    loader.addEventListener(this.ima!.AdErrorEvent.Type.AD_ERROR, (e) => {
      if (gen !== this.loaderGeneration) return;
      this.onAdError(e as ImaAdErrorEvent);
    });
  }

  private onAdsManagerLoaded(event: ImaAdsManagerLoadedEvent): void {
    if (!this.ima || this.destroyed) return;
    const settings = new this.ima.AdsRenderingSettings();
    settings.restoreCustomPlaybackStateOnAdBreakComplete = false;
    settings.enablePreloading = false;
    settings.loadVideoTimeout = 8000;

    // IMA polls `currentTime` on this object to schedule VMAP mid-roll cue points.
    // Must reflect CONTENT progress, not the ad element (which sits at 0 outside
    // breaks). Proxy (not the element itself) so IMA can't drive play/pause on
    // the content video — registry remains the sole content-side driver.
    const contentVideoEl = this.contentVideoEl;
    const contentPlayhead: ImaContentPlayhead = {
      get currentTime() {
        return contentVideoEl.currentTime;
      },
    };
    const adsManager = event.getAdsManager(contentPlayhead, settings);
    this.adsManager = adsManager;
    this.emit("genuin:ad-response-received", {});
    try {
      this.hasPostRoll = adsManager.getCuePoints().includes(-1);
    } catch {
      this.hasPostRoll = false;
    }

    adsManager.addEventListener(this.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
      this.adActive = true;
      this.events.contentPauseRequested?.();
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
      this.adActive = false;
      this.events.contentResumeRequested?.();
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
      this.adActive = false;
      this.emit("genuin:ad-all-completed", {});
      this.events.allAdsCompleted?.();
    });
    const adDetail = (e: unknown): AdDetail => this.buildAdDetail((e as ImaAdEvent).getAd());
    adsManager.addEventListener(this.ima.AdEvent.Type.LOADED, (e) => {
      this.emit("genuin:ad-rendered", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.STARTED, (e) => {
      this.emit("genuin:ad-started", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.IMPRESSION, (e) => {
      this.emit("genuin:ad-impression", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.FIRST_QUARTILE, (e) => {
      this.emit("genuin:ad-first-quartile", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.PAUSED, (e) => {
      this.emit("genuin:ad-pause", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.CLICK, (e) => {
      this.emit("genuin:ad-clicked", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.SKIPPED, (e) => {
      this.emit("genuin:ad-skipped", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdEvent.Type.COMPLETE, (e) => {
      this.emit("genuin:ad-completed", adDetail(e));
    });
    adsManager.addEventListener(this.ima.AdErrorEvent.Type.AD_ERROR, (e) => this.onAdError(e as ImaAdErrorEvent));

    try {
      adsManager.init(
        Math.max(this.adContainer.clientWidth, 1),
        Math.max(this.adContainer.clientHeight, 1),
        this.ima.ViewMode.NORMAL
      );
      // Apply current desired audio state before the ad starts rendering so
      // the first frame already matches the content video's mute/volume.
      try {
        adsManager.setVolume(this.pendingMuted ? 0 : this.pendingVolume);
      } catch {
        // ignore — older SDK builds may reject setVolume pre-start
      }
      adsManager.start();
    } catch (e) {
      this.events.adError?.({
        message: e instanceof Error ? e.message : String(e),
        code: -1,
      });
    }
  }

  private onAdError(event: ImaAdErrorEvent): void {
    const isPreManagerError = this.adsManager === null;
    let message = "ad error";
    let code = -1;
    try {
      const err = event.getError();
      message = err.getMessage();
      code = err.getErrorCode();
    } catch {
      // Some error events aren't well-formed; fall back to defaults.
    }
    this.adActive = false;
    this.emit("genuin:ad-error", { message, code });
    if (isPreManagerError) this.emit("genuin:ad-request-failed", { message, code });
    this.events.adError?.({ message, code });
    if (this.adsManager) {
      try {
        this.adsManager.destroy();
      } catch {
        // ignore
      }
      this.adsManager = null;
    }
  }

  /**
   * Dispatches a namespaced `CustomEvent` on the content `<video>` element so
   * React consumers (V2) can subscribe via `addEventListener` without coupling
   * to AdsLayer or the registry. Synchronous + cheap. No-op once destroyed.
   */
  private emit(type: string, detail: unknown = {}): void {
    if (this.destroyed) return;
    this.contentVideoEl.dispatchEvent(new CustomEvent(type, { detail }));
  }

  /**
   * Builds a normalized {@link AdDetail} payload from an IMA `Ad` object.
   * IMA's getters throw on partial state — each access is guarded so a single
   * missing field never blocks the entire payload. Returns null fields when
   * the ad object is absent (some events fire with `getAd() === null`).
   */
  private buildAdDetail(ad: ImaAd | null): AdDetail {
    const safe = <T>(fn: () => T, fallback: T): T => {
      try {
        return fn();
      } catch {
        return fallback;
      }
    };
    if (!ad) {
      return {
        adId: null,
        url: null,
        title: null,
        adFormat: null,
        advertiserBrandId: null,
        campaignId: null,
        lineItemId: null,
        creativeId: null,
        mediaType: null,
        totalAds: 0,
        currentAdIndex: 0,
      };
    }
    const pod = safe(() => ad.getAdPodInfo(), null as ImaAdPodInfo | null);
    return {
      adId: safe(() => ad.getAdId(), null),
      url: null,
      title: safe(() => ad.getTitle(), null),
      adFormat: safe(() => ad.getContentType(), null),
      advertiserBrandId: safe(() => ad.getAdvertiserName?.() ?? null, null),
      campaignId: safe(() => ad.getDealId?.() ?? null, null),
      lineItemId: safe(() => ad.getAdSystem?.() ?? null, null),
      creativeId: safe(() => ad.getCreativeId?.() ?? null, null),
      mediaType: safe(() => ad.getContentType(), null),
      totalAds: pod ? safe(() => pod.getTotalAds(), 0) : 0,
      currentAdIndex: pod ? safe(() => pod.getAdPosition(), 0) : 0,
    };
  }

  /**
   * Wipes the dedicated ad `<video>` element's media state — pause, drop src,
   * and reload. IMA reuses the same HTMLMediaElement across `requestAds` calls
   * on a given `AdDisplayContainer`; without this reset, the browser keeps the
   * previous ad creative's buffered media and `currentTime`, so the next ad
   * appears to "resume" from the swipe-away point instead of starting fresh.
   */
  private resetAdVideoEl(): void {
    try {
      this.adVideoEl.pause();
    } catch {
      // ignore
    }
    this.adVideoEl.removeAttribute("src");
    try {
      this.adVideoEl.load();
    } catch {
      // ignore
    }
  }

  resize(width: number, height: number): void {
    if (!this.adsManager || !this.ima) return;
    try {
      this.adsManager.resize(Math.max(width, 1), Math.max(height, 1), this.ima.ViewMode.NORMAL);
    } catch {
      // ignore — pre-init resize calls are expected and harmless
    }
  }

  /**
   * Clears the deduplication guard and tears down the current AdsManager
   * without destroying the AdsLoader or AdDisplayContainer. Call this when
   * the content src changes so the same adUrl triggers a fresh ad request.
   */
  reset(): void {
    this.lastAdUrl = undefined;
    this.hasPostRoll = false;
    this.contentCompleteSignaled = false;
    this.adActive = false;
    if (this.adsManager) {
      try {
        this.adsManager.destroy();
      } catch {
        // ignore partial-state throws
      }
      this.adsManager = null;
    }
    this.resetAdVideoEl();
  }

  /**
   * True once `ADS_MANAGER_LOADED` reports a VMAP cue point of `-1` (post-roll).
   * The registry consults this on the content video's `ended` event to decide
   * whether to signal `contentComplete()` — pre-only / mid-only schedules skip
   * the signal so `postRollPending` state doesn't leak into the next break.
   */
  get postRollScheduled(): boolean {
    return this.hasPostRoll;
  }

  /**
   * Forwards `adsLoader.contentComplete()` so IMA releases any scheduled
   * post-roll from the active VMAP. Idempotent within a single ad break — the
   * `contentCompleteSignaled` latch prevents the double-call IMA spec leaves
   * undefined. Reset on `reset()` / `resetForNewContent()` / new `request()`.
   */
  contentComplete(): void {
    if (this.destroyed || !this.adsLoader || this.contentCompleteSignaled) {
      return;
    }
    try {
      this.adsLoader.contentComplete();
      this.contentCompleteSignaled = true;
    } catch {
      // IMA throws on partial-state loaders; treat as no-op.
    }
  }

  /**
   * Signals to IMA that the previous content ended and new content is starting.
   * Destroys and recreates the `AdsLoader` — `contentComplete()` puts the
   * loader into a terminal state where subsequent `requestAds()` calls are
   * silently ignored, so the only safe way to request an ad for new content is
   * to start with a fresh loader. The `AdDisplayContainer` is reused; it is
   * cheap to keep alive and must not be re-initialized.
   *
   * Call this from the registry when the content src changes and an adUrl is
   * present, instead of `destroy()`.
   */
  resetForNewContent(): void {
    // Bump generation unconditionally — even if the SDK is still loading.
    // This ensures any in-flight request() continuation that awaited
    // ensureInitialized() will see a stale generation and bail, preventing
    // the previous ad from firing on the new loader.
    this.loaderGeneration += 1;

    if (this.adsManager) {
      try {
        this.adsManager.destroy();
      } catch {
        // ignore partial-state throws
      }
      this.adsManager = null;
    }
    // The adVideoEl element is reused across ad breaks. IMA's AdsManager.destroy()
    // releases the SDK's hold on it but doesn't reset the browser's media state —
    // src, buffered ranges, and currentTime persist. Without this reset, the next
    // requestAds reuses the same element and the browser resumes the previous ad
    // creative from where it left off when the user swiped away mid-ad.
    this.resetAdVideoEl();
    // Destroy and recreate the AdsLoader — contentComplete() puts it in a
    // terminal state; requestAds() on a completed loader is a silent no-op.
    // Recreating from the existing ima + adDisplayContainer is cheap.
    if (this.adsLoader && this.ima && this.adDisplayContainer) {
      try {
        this.adsLoader.destroy();
      } catch {
        // ignore
      }
      this.adsLoader = new this.ima.AdsLoader(this.adDisplayContainer);
      this.attachLoaderListeners(this.adsLoader, this.loaderGeneration);
    }
    this.lastAdUrl = undefined;
    this.hasPostRoll = false;
    this.contentCompleteSignaled = false;
    this.adActive = false;
    this.lastContentTime = 0;
  }

  destroy(): void {
    this.destroyed = true;
    this.adActive = false;
    try {
      this.contentVideoEl.removeEventListener("ended", this.onContentEnded);
      this.contentVideoEl.removeEventListener("timeupdate", this.onContentTimeUpdate);
    } catch {
      // ignore — element may already be detached
    }
    this.lastContentTime = 0;
    if (this.adsManager) {
      try {
        this.adsManager.destroy();
      } catch {
        // ignore
      }
      this.adsManager = null;
    }
    if (this.adsLoader) {
      try {
        this.adsLoader.destroy();
      } catch {
        // ignore
      }
      this.adsLoader = null;
    }
    if (this.adDisplayContainer) {
      try {
        this.adDisplayContainer.destroy();
      } catch {
        // ignore
      }
      this.adDisplayContainer = null;
    }
    // Wipe the ad video element's media state so a fresh AdsLayer constructed
    // against the same element on next ad break doesn't inherit a buffered
    // creative from the destroyed layer.
    this.resetAdVideoEl();
    this.lastAdUrl = undefined;
    this.adDisplayContainerInitialized = false;
    this.hasPostRoll = false;
    this.contentCompleteSignaled = false;
  }
}
