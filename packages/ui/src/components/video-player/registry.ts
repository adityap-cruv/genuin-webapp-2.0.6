"use client";

import { AdsLayer } from "./ads";

/**
 * Captures a cropped, downscaled freeze-frame via ImageBitmap + bitmaprenderer.
 * Zero pixel copy on the main thread — GPU transfer after async decode.
 *
 * `createImageBitmap` snapshots the source at call-time; the async part is only
 * the decode. Callers can therefore invoke this before releasing/reassigning the
 * video element without losing the frame. If `signal` fires before decode
 * completes the bitmap is closed and the function returns false without touching
 * the canvas.
 *
 * Safe with cross-origin video — canvas becomes tainted but `toDataURL` is never called.
 */
async function captureFrameBitmap(
  videoEl: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  slotW: number,
  slotH: number,
  signal: AbortSignal
): Promise<boolean> {
  if (videoEl.currentTime === 0 || videoEl.videoWidth === 0 || slotW === 0 || slotH === 0) {
    return false;
  }

  const dpr = window.devicePixelRatio ?? 1;
  const cssW = Math.min(slotW, 480);
  const cssH = slotH * (cssW / slotW);
  const targetW = Math.round(cssW * dpr);
  const targetH = Math.round(cssH * dpr);

  // object-fit:cover crop — replicate what the <video> renders at the slot size.
  const srcAspect = videoEl.videoWidth / videoEl.videoHeight;
  const dstAspect = targetW / targetH;
  let sx = 0,
    sy = 0,
    sw = videoEl.videoWidth,
    sh = videoEl.videoHeight;
  if (srcAspect > dstAspect) {
    sw = videoEl.videoHeight * dstAspect;
    sx = (videoEl.videoWidth - sw) / 2;
  } else {
    sh = videoEl.videoWidth / dstAspect;
    sy = (videoEl.videoHeight - sh) / 2;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(videoEl, sx, sy, sw, sh, {
      resizeWidth: targetW,
      resizeHeight: targetH,
      resizeQuality: "medium",
    });
  } catch {
    return false;
  }

  if (signal.aborted) {
    bitmap.close();
    return false;
  }

  const ctx = canvas.getContext("bitmaprenderer");
  if (!ctx) {
    bitmap.close();
    return false;
  }

  // transferFromImageBitmap sets canvas dimensions to match the bitmap and detaches it.
  ctx.transferFromImageBitmap(bitmap);
  return true;
}

/**
 * Long-lived shared `<video>` for the entire feed.
 *
 * Design contract (revised):
 *
 *   ONE `<video>` element exists for the whole subtree under
 *   `<VideoElementProvider>`. Consumers call `claim(src, opts)` on mount
 *   and `release(handle)` on unmount; the registry **reparents** the
 *   single element into the active slot and swaps its `src` instead of
 *   minting a new element per URL. This is what allows an unmute gesture
 *   to carry across all videos — iOS Safari's gesture allowance is per
 *   `<video>`-element, so re-using the same element is the only way to
 *   keep audio playing across src swaps.
 *
 *   `currentTime` per URL is preserved out-of-band: on every `release`
 *   and on every `src` change, the registry stores
 *   `videoEl.currentTime` keyed by the URL that was just playing. When a
 *   subsequent claim or src-swap lands on a previously-seen URL, the
 *   stored time is re-applied via a `loadedmetadata` seek — so swiping
 *   back to a video resumes where you left off.
 *
 *   `userState` (muted / volume / playbackRate) is intrinsic to the
 *   shared element and survives every transition for free.
 *
 * Notes on integrations:
 *   - HLS.js is lazy-loaded once from a CDN (the project's CSP whitelists
 *     `cdn.jsdelivr.net`); Safari uses native HLS via `videoEl.src`.
 *   - This registry intentionally does **not** instantiate OpenPlayerJS.
 *     OpenPlayerJS wraps the `<video>` in its own DOM container and its
 *     `src` setter only appends, never replaces — both make it unsuitable
 *     as the engine behind a shared, src-swapping element. Ad / IMA
 *     support is the open M3 question (see VIDEO_ELEMENT_REUSE_PLAN.md).
 *
 * Simultaneous claims:
 *   The shared model assumes exactly one consumer is on-screen at a
 *   time. If a second consumer claims while the first is still active,
 *   we mint a *transient* element under a synthetic key and tear it down
 *   on its release — the unmute won't transfer to the transient (it's a
 *   different `<video>`). This is a defensive escape hatch; production
 *   feeds should serialize their claims (only render the active card).
 */

// ─── Public types ──────────────────────────────────────────────────────────

export type RegistryUserState = {
  muted: boolean;
  volume: number; // 0–100
  playbackRate: number;
};

export type RegistryEntry = {
  /** Stable key. The shared entry's key is `"@shared"`; transient
   *  duplicates use synthetic keys like `"@shared::dup-N"`. */
  key: string;
  /** The element consumers reparent into their slot. Wraps `videoEl`
   *  and `adContainerEl` so the IMA ad layer travels with the video on
   *  every reparent. Always non-null after `claim`. */
  containerEl: HTMLDivElement;
  /** The actual `<video>` element. Inside `containerEl`. The
   *  `useImperativeHandle` ref returned to consumers points here. */
  videoEl: HTMLVideoElement;
  /** Overlay where the IMA SDK renders ads. Inside `containerEl`,
   *  positioned over the video. */
  adContainerEl: HTMLDivElement;
  /** Dedicated `<video>` element IMA uses for ad playback. Lives inside
   *  `adContainerEl`, hidden until `contentPauseRequested` fires. Keeping
   *  it separate from `videoEl` eliminates the play/pause race — IMA
   *  drives this element; the registry drives `videoEl`. */
  adVideoEl: HTMLVideoElement;
  /** Lazy IMA ad layer — created on the first claim that supplies an
   *  `adUrl`. Persists across src swaps until evict. */
  adsLayer: AdsLayer | null;
  /** Last `adTagUrl` we asked the IMA layer to load — suppresses
   *  duplicate requests when src is stable but renders re-fire. */
  currentAdUrl: string | undefined;
  /**
   * Whether the shared `<video>` element is currently held by a consumer.
   *
   * - `0` — free. No card is using this entry. `claim()` will hand it out
   *   directly (sequential reuse — the common case on every swipe).
   * - `1` — occupied. A card already holds this entry. A second simultaneous
   *   `claim()` cannot share it, so the registry mints a transient instead.
   *
   * Never exceeds `1`. The registry assumes exactly one active consumer at a
   * time. `release()` resets this to `0` via `park()`, making the entry
   * available for the next card.
   */
  refCount: 0 | 1;
  parked: boolean;
  lastClaimedAt: number;
  userState: RegistryUserState;
  /** URL currently set on this `<video>`. Distinct from the
   *  `currentSrc` HTMLMediaElement property (which can resolve to a
   *  different absolute URL after browser normalization). */
  currentSrc: string | undefined;
  /** True for the long-lived shared entry; false for transient duplicates. */
  shared: boolean;
  /** True while IMA is driving an ad break. Prevents `playVideoEl` from
   *  restarting the content `<video>` while IMA holds the element. Reset
   *  to `false` in `resumeContent` before handing control back. */
  adIsPlaying: boolean;
  /** Set when content `ended` fires with `adsLayer.postRollScheduled === true`
   *  — the registry then calls `adsLayer.contentComplete()` to release the
   *  post-roll break. `resumeContent` reads this flag to decide between the
   *  normal play() path and the loop-aware end-of-stream path, and clears it.
   *  Reset defensively on `swapSrc`, `park`, `destroyEntry`. */
  postRollPending: boolean;
  /** Set when an external `play=false` arrives while `adIsPlaying` is true —
   *  the ad <video> is paused and content must NOT auto-resume when the ad
   *  break ends. `resumeContent` reads and clears it. Reset defensively on
   *  swapSrc / park / destroyEntry. */
  pendingPause: boolean;
  /** Re-entrancy guard for the unsupported-source recovery in `playVideoEl`.
   *  When IMA leaves the content element wedged after a pre-roll, the resume
   *  `play()` rejects with `NotSupportedError`; recovery resets the source and
   *  retries `play()` once. This flag prevents a failed retry from re-entering
   *  the recovery branch and looping. Set before the retry, cleared once the
   *  retry settles. */
  recoveringSrc: boolean;
};

export type ClaimHandle = {
  key: string;
  entry: RegistryEntry;
  /** Registry-created canvas placed in `slotEl` on release to show the
   *  freeze frame. Persists in the slot after release; cleared on the
   *  next claim of the same slot. */
  canvasEl: HTMLCanvasElement;
  /** The slot element this handle was claimed into. Used by `release` to
   *  read dimensions and insert the freeze-frame canvas. */
  slotEl: HTMLElement | null;
  /** Removes the pending one-time `play` listener that defers freeze-frame
   *  removal. Called by `release` and `evict` to prevent the listener from
   *  running against a stale slot after the handle is discarded. */
  cancelFreezeRemoval: (() => void) | null;
};

export type ClaimOptions = {
  src: string | undefined;
  isSafari: boolean;
  poster?: string;
  playsInline?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: number;
  play?: boolean;
  startTime?: number;
  /** VAST / VMAP ad tag URL. When supplied, the registry's IMA layer
   *  (lazy-loaded `ima3.js`) plays an ad break against the shared
   *  `<video>` — pre-roll on each new content src, plus any mid/post-roll
   *  the VMAP wrapper schedules. Set to `undefined` (or omit) to skip
   *  ads. The layer recycles its `AdsManager` per request, so changing
   *  `adUrl` between claims triggers a new request. */
  adUrl?: string;
  /** Reserved. The shared element is created lazily on first claim
   *  regardless. Accepted for compat. */
  enableLazyLoading?: boolean;
};

export type VideoRegistry = {
  /**
   * Claims the shared video element and wires it into `slotEl`.
   *
   * The registry appends `containerEl` to `slotEl` and removes any freeze-frame
   * canvas left from the prior cycle. On `release` it will create a new canvas,
   * insert it into `slotEl`, and capture the current frame — the consumer never
   * has to touch canvas elements.
   */
  claim(src: string, opts: ClaimOptions, slotEl: HTMLElement | null): ClaimHandle;
  /** Detaches `containerEl` from the slot, captures a freeze-frame canvas into
   *  the slot, then parks the entry for reuse. All DOM ops are synchronous so
   *  iOS Safari's `commitDeletionEffectsOnFiber` never sees a child in a slot
   *  that React is about to remove. */
  release(handle: ClaimHandle): void;
  /** Forwards command props to the live entry — per-render no-op when
   *  nothing changed. */
  apply(handle: ClaimHandle, opts: ClaimOptions): void;
  /** Tears down a specific handle. For transient duplicates, fully
   *  destroys the element. For the shared entry, resets it to a clean
   *  slate (drops src, clears stored times). */
  evict(handle: ClaimHandle): void;
  evictAll(): void;
  getStats(): {
    total: number;
    parked: number;
    entries: ReadonlyArray<RegistryEntry>;
    maxEntries: number;
    /** Per-URL `currentTime` cache size. Useful in the test page debug
     *  panel — proves swipe-back resume isn't re-fetching from zero. */
    storedTimes: number;
  };
};

export type CreateRegistryOptions = {
  /** Vestigial — the shared model has at most one long-lived element
   *  plus zero or more transient duplicates that auto-destroy. Kept on
   *  the type so old callers compile. */
  maxEntries?: number;
};

export const DEFAULT_MAX_ENTRIES = 1;

const SHARED_KEY = "@shared";

// HLS.js types — we lazy-load from a CDN, no `import` so we don't pull
// it into the bundle.
type HlsCtor = new (config?: Record<string, unknown>) => HlsLike;
/** Listener for the narrow set of hls.js events the registry observes.
 *  We only subscribe to `hlsManifestParsed` and ignore its payload. */
type HlsEventListener = () => void;
interface HlsLike {
  attachMedia(el: HTMLMediaElement): void;
  loadSource(url: string): void;
  /** Starts the fragment loader. When given a position, hls.js requests
   *  segments at/just-before that timestamp instead of segment 0 — the
   *  swipe-back resume optimization (IMPROVEMENT-002). */
  startLoad(startPosition?: number): void;
  /** Halts the fragment loader without tearing down the MediaSource so
   *  partial segments near the swap-away point stay in the buffer. */
  stopLoad(): void;
  /** Event subscription. The string-keyed signature matches the public
   *  events hls.js dispatches under (e.g. `'hlsManifestParsed'`). */
  on(event: string, listener: HlsEventListener): void;
  off(event: string, listener: HlsEventListener): void;
  destroy(): void;
  /** Live hls.js config. We mutate `startPosition` defensively (some hls.js
   *  versions also consult it at MANIFEST_PARSED), but the authoritative
   *  control is `autoStartLoad: false` at construction + a manual
   *  `startLoad(pos)` registered via `on('hlsManifestParsed', …)` — this
   *  prevents any segment fetch until we explicitly start the loader. */
  config: { startPosition?: number };
}

/** The hls.js event key the registry listens to. Public string form rather
 *  than `Hls.Events.MANIFEST_PARSED` — we lazy-load Hls and have no static
 *  handle to its enum, and this is the format hls.js dispatches under. */
const HLS_EVENT_MANIFEST_PARSED = "hlsManifestParsed";

let hlsCtorPromise: Promise<HlsCtor | null> | null = null;
function loadHlsCtor(): Promise<HlsCtor | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  // Already loaded by a prior provider, by another consumer, or on a
  // page that ships hls.js directly.

  const existing = (window as any).Hls as HlsCtor | undefined;
  if (existing) return Promise.resolve(existing);
  if (hlsCtorPromise) return hlsCtorPromise;
  hlsCtorPromise = new Promise<HlsCtor | null>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
    script.async = true;
    script.onload = () => {
      const Hls = (window as any).Hls as HlsCtor | undefined;
      resolve(Hls ?? null);
    };
    script.onerror = () => {
      // CDN blocked or offline — fall back to native HLS only. Safari
      // already has it; non-Safari browsers will fail to play HLS, which
      // is the same failure mode they'd have had before this work.
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return hlsCtorPromise;
}

const hlsConfig = {
  // CRITICAL (IMPROVEMENT-002 race-fix): suppress hls.js's automatic
  // `startLoad(-1)` that `attachMedia` would otherwise queue on
  // MANIFEST_PARSED. With autoStartLoad enabled, some hls.js versions
  // fetch segments 0/1 during manifest parse — BEFORE `config.startPosition`
  // is read — and only then jump to the resume offset, wasting two segment
  // downloads on every swipe-back. We instead pair every `loadSource()` with
  // a manual `startLoad(pos)` registered on `hlsManifestParsed`, which is
  // the only deterministic way to stop the pre-fetch.
  autoStartLoad: false,
  startLevel: 0,
  capLevelToPlayerSize: false,
  maxAutoLevel: 1,
  enableWorker: true,
  emeEnabled: true,
  lowLatencyMode: true,
  maxBufferLength: 10,
  maxBufferSize: 40 * 1000 * 1000,
  // IMPROVEMENT-002 (back-buffer pre-fill fix): keep back-buffer at zero so
  // hls.js never fetches segments BEHIND the playhead. On swap-back the
  // resume position can be deep into the stream (e.g. 10s); a non-zero
  // back-buffer would cause hls.js to backfill segments 0/1 to support
  // backward seeks before resuming forward play — wasting two segment
  // downloads we already had decoded in the previous session.
  backBufferLength: 0,
  fragLoadingTimeOut: 7000,
  // IMPROVEMENT-002: also explicit-off to lock behaviour against any future
  // hls.js default flip. Pre-fetch of the first fragment can otherwise race
  // ahead of our manual `startLoad(pos)` and re-pull segment 0.
  startFragPrefetch: false,
  testBandwidth: false,
  abrEwmaDefaultEstimate: 300000,
  abrBandWidthFactor: 0.8,
  abrBandWidthUpFactor: 0.5,
  abrEwmaFastLive: 3,
  abrEwmaSlowLive: 5,
  abrEwmaFastVoD: 3,
  abrEwmaSlowVoD: 5,
  liveSyncDuration: 2.5,
  liveMaxLatencyDuration: 6,
  maxLoadingDelay: 4,
  maxBufferHole: 0.5,
  highBufferWatchdogPeriod: 2,
};

// ─── Implementation ────────────────────────────────────────────────────────

export function createVideoRegistry(_options: CreateRegistryOptions = {}): VideoRegistry {
  let shared: RegistryEntry | null = null;
  let hls: HlsLike | null = null;
  let nativeHls = false;
  /** `currentTime` per URL — populated on src swap and on release. */
  const storedTimes = new Map<string, number>();
  /** Pending loadedmetadata seek targets — we may swap src again before
   *  metadata fires; this map lets the listener pick the latest. */
  const pendingSeeks = new Map<string, number>();
  /** Transient duplicate entries minted on simultaneous claims. */
  const transients = new Map<string, RegistryEntry>();
  let dupeCounter = 0;
  let parkingDiv: HTMLDivElement | null = null;

  // ── Freeze-frame state ────────────────────────────────────────────────────
  /** In-flight capture per handle — aborted when the handle is superseded. */
  const pendingCaptures = new Map<ClaimHandle, AbortController>();

  function fireFreezeCapture(handle: ClaimHandle, slotW: number, slotH: number): void {
    const { canvasEl, entry } = handle;
    const abortCtrl = new AbortController();
    pendingCaptures.set(handle, abortCtrl);
    captureFrameBitmap(entry.videoEl, canvasEl, slotW, slotH, abortCtrl.signal).then((captured) => {
      pendingCaptures.delete(handle);
      if (!abortCtrl.signal.aborted) {
        canvasEl.style.display = captured ? "block" : "none";
      }
    });
  }

  function ensureParkingDiv(): HTMLDivElement {
    if (parkingDiv && parkingDiv.isConnected) return parkingDiv;
    if (typeof document === "undefined") {
      throw new Error("createVideoRegistry: DOM unavailable. Registry methods must be called on the client.");
    }
    parkingDiv = document.createElement("div");
    parkingDiv.style.display = "none";
    parkingDiv.setAttribute("data-video-registry-parking", "");
    document.body.appendChild(parkingDiv);
    return parkingDiv;
  }

  function ensureShared(opts: ClaimOptions): RegistryEntry {
    if (shared) return shared;
    const { videoEl, containerEl, adContainerEl, adVideoEl } = createElementTrio(opts);

    // Mirror native volumechange / ratechange into userState so reuse
    // surfaces accurate values to consumers and the debug panel.
    videoEl.addEventListener("volumechange", () => {
      if (!shared) return;
      shared.userState.muted = videoEl.muted;
      shared.userState.volume = Math.round(videoEl.volume * 100);
      // Mirror to the active ad break so an in-ad mute toggle takes effect
      // live rather than waiting for the next break.
      shared.adsLayer?.setMuted(videoEl.muted);
      shared.adsLayer?.setVolume(videoEl.volume);
    });
    videoEl.addEventListener("ratechange", () => {
      if (!shared) return;
      shared.userState.playbackRate = videoEl.playbackRate;
    });

    // Save currentTime on every pause so we don't need a release before
    // a fresh swap to capture the latest position.
    videoEl.addEventListener("timeupdate", () => {
      if (!shared || !shared.currentSrc) return;
      storedTimes.set(shared.currentSrc, videoEl.currentTime);
    });

    // Post-roll signaling lives inside AdsLayer — it owns the `ended` listener
    // on this videoEl and calls `contentComplete()` itself, firing the
    // `postRollPending` event so the registry can set `entry.postRollPending`.

    // Apply pending seek when metadata is ready for the just-loaded src.
    videoEl.addEventListener("loadedmetadata", () => {
      if (!shared || !shared.currentSrc) return;
      const target = pendingSeeks.get(shared.currentSrc);
      if (target !== undefined && target > 0) {
        try {
          videoEl.currentTime = target;
        } catch {
          // Some browsers throw if the seek lands outside seekable
          // ranges; ignore — we'll be at 0, which is fine.
        }
        pendingSeeks.delete(shared.currentSrc);
      }
    });

    // Decide HLS strategy once. Safari (or any browser claiming native
    // HLS) plays the manifest URL via `videoEl.src` directly. Otherwise
    // attach hls.js when it lands.
    nativeHls = opts.isSafari || videoEl.canPlayType("application/vnd.apple.mpegurl") !== "";
    if (!nativeHls) {
      void loadHlsCtor().then((Hls) => {
        if (!Hls || hls) return;
        hls = new Hls(hlsConfig);
        hls.attachMedia(videoEl);
        // If a src landed before hls.js arrived, reload it through
        // hls.js now so the manifest actually plays. Route through
        // `loadSource` so `config.startPosition` is set authoritatively
        // (same race-fix as the main swap path — IMPROVEMENT-002).
        if (shared?.currentSrc) loadSource(shared, shared.currentSrc);
      });
    }

    const entry: RegistryEntry = {
      key: SHARED_KEY,
      containerEl,
      videoEl,
      adContainerEl,
      adVideoEl,
      adsLayer: null,
      currentAdUrl: undefined,
      refCount: 0,
      parked: false,
      lastClaimedAt: Date.now(),
      userState: {
        muted: videoEl.muted,
        volume: Math.round(videoEl.volume * 100),
        playbackRate: videoEl.playbackRate,
      },
      currentSrc: undefined,
      shared: true,
      adIsPlaying: false,
      postRollPending: false,
      pendingPause: false,
      recoveringSrc: false,
    };
    shared = entry;
    return entry;
  }

  function createElementTrio(opts: ClaimOptions): {
    videoEl: HTMLVideoElement;
    containerEl: HTMLDivElement;
    adContainerEl: HTMLDivElement;
    adVideoEl: HTMLVideoElement;
  } {
    const videoEl = document.createElement("video");
    // Critical attribute order on iOS: muted + playsinline must be set
    // BEFORE any src so the autoplay decision picks them up. Mirrors
    // `video.html` in the genuin/grid reference.
    videoEl.muted = opts.muted ?? true;
    videoEl.playsInline = opts.playsInline ?? true;
    videoEl.setAttribute("playsinline", "");
    videoEl.setAttribute("webkit-playsinline", "");
    videoEl.preload = "none";
    if (opts.loop) videoEl.loop = true;
    if (opts.volume !== undefined) videoEl.volume = clampVolume(opts.volume);
    if (opts.playbackRate !== undefined) {
      videoEl.playbackRate = opts.playbackRate;
    }
    videoEl.style.width = "100%";
    videoEl.style.height = "100%";
    videoEl.style.objectFit = "cover";

    // The ad container overlays the video at full bleed. `pointer-events:
    // none` lets touches pass through to the video by default; the IMA
    // SDK enables pointer events on its own UI subtree (skip button,
    // click-through area) when ads are active.
    const adContainerEl = document.createElement("div");
    adContainerEl.setAttribute("data-video-registry-ads", "");
    adContainerEl.style.position = "absolute";
    adContainerEl.style.inset = "0";
    adContainerEl.style.pointerEvents = "none";
    adContainerEl.style.display = "none";
    // Opaque backdrop so the content video underneath is hidden when the ad
    // creative's intrinsic aspect doesn't fully fill the slot. iOS Safari
    // letterboxes the ad <video>; without this the content bleeds through.
    adContainerEl.style.backgroundColor = "#000";

    // IMA-owned video element for ad playback — keeps it separate from the
    // content videoEl so IMA and the registry never fight over play/pause.
    // Initial mute/volume mirror the claim's content-side intent so the very
    // first ad frame already matches user state; AdsLayer.setMuted/setVolume
    // keep them in sync on every later toggle.
    const adVideoEl = document.createElement("video");
    adVideoEl.muted = opts.muted ?? true;
    adVideoEl.volume = clampVolume(opts.volume ?? 100);
    adVideoEl.playsInline = true;
    adVideoEl.setAttribute("playsinline", "");
    adVideoEl.setAttribute("webkit-playsinline", "");
    adVideoEl.style.position = "absolute";
    adVideoEl.style.inset = "0";
    adVideoEl.style.width = "100%";
    adVideoEl.style.height = "100%";
    adVideoEl.style.display = "none";
    // IMA drives this element programmatically — no user clicks needed on the
    // video itself. Without this, adVideoEl intercepts clicks before IMA's
    // overlay divs (skip button, click-through) which are appended after it.
    adVideoEl.style.pointerEvents = "none";
    adContainerEl.appendChild(adVideoEl);

    const containerEl = document.createElement("div");
    containerEl.setAttribute("data-video-registry-container", "");
    containerEl.style.position = "relative";
    containerEl.style.width = "100%";
    containerEl.style.height = "100%";
    containerEl.appendChild(videoEl);
    containerEl.appendChild(adContainerEl);

    return { videoEl, containerEl, adContainerEl, adVideoEl };
  }

  /** Creates a freeze-frame canvas positioned to fill its parent slot. */
  function createFreezeCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-video-registry-freeze", "");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.display = "none";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    return canvas;
  }

  /** Registers a one-shot `hlsManifestParsed` listener that starts the
   *  fragment loader at `startAt`. Because we construct hls.js with
   *  `autoStartLoad: false`, this is the ONLY path that triggers segment
   *  fetching — nothing loads until the manifest resolves and this handler
   *  fires. The listener self-removes after running so it doesn't accumulate
   *  across swaps. */
  function startLoadOnManifestParsed(hlsInst: HlsLike, startAt: number): void {
    const onParsed: HlsEventListener = () => {
      hlsInst.off(HLS_EVENT_MANIFEST_PARSED, onParsed);
      hlsInst.startLoad(startAt);
    };
    hlsInst.on(HLS_EVENT_MANIFEST_PARSED, onParsed);
  }

  function loadSource(entry: RegistryEntry, src: string): void {
    if (!entry.shared) {
      // Transients use raw native HLS; no hls.js instance to share.
      entry.videoEl.src = src;
      return;
    }
    if (nativeHls || !hls) {
      // Either Safari, or hls.js hasn't loaded yet. The pending-load
      // branch in ensureShared will replay the src once Hls arrives.
      entry.videoEl.src = src;
    } else {
      // Tell hls.js where to start fetching BEFORE the manifest resolves and
      // the fragment loader fires its first segment request. Without this,
      // hls.loadSource() defaults to position 0 and re-downloads segments
      // from the start of the stream even though the <video> currentTime
      // will be re-seeked via the loadedmetadata handler — wasted bandwidth
      // + resume stutter (IMPROVEMENT-002). The pending-seek is populated by
      // swapSrc before this runs, so it's authoritative.
      //
      // The authoritative control is `autoStartLoad: false` at construction
      // + the manual `startLoad(startAt)` we register here on
      // `hlsManifestParsed`. Setting `config.startPosition` is defense-in-
      // depth for builds that read it independently of `startLoad()`.
      const startAt = pendingSeeks.get(src);
      const hasResume = typeof startAt === "number" && startAt > 0;
      const startPos = hasResume ? startAt : -1;
      hls.config.startPosition = startPos;
      // Register the start-load BEFORE loadSource() so the listener is in
      // place by the time hls.js dispatches MANIFEST_PARSED.
      startLoadOnManifestParsed(hls, startPos);
      hls.loadSource(src);
    }
  }

  function swapSrc(entry: RegistryEntry, newSrc: string): void {
    const v = entry.videoEl;

    // Save the current src's currentTime before we lose it.
    if (entry.currentSrc && entry.currentSrc !== newSrc) {
      storedTimes.set(entry.currentSrc, v.currentTime);
    }
    if (entry.currentSrc === newSrc) return;

    // Halt hls.js's fragment loader for the prior src on the swap-away path
    // (IMPROVEMENT-002). stopLoad() — unlike destroy() — leaves the MediaSource
    // and the already-buffered segments intact, so swapping back later finds
    // useful buffer near the resume point. Only meaningful on the hls.js
    // branch (shared entry, non-native, hls attached) and only when actually
    // switching to a different src.
    if (entry.shared && !nativeHls && hls && entry.currentSrc && entry.currentSrc !== newSrc) {
      try {
        hls.stopLoad();
      } catch {
        // Older hls.js builds may throw if the loader is already idle; ignore.
      }
    }

    // **Do not pause before swapping.** iOS Safari binds the un-muted
    // playback gesture allowance to a video element that is continuously
    // *playing*; the moment we pause, that allowance is dropped and the
    // next `play()` after the src swap is treated as a fresh autoplay
    // attempt, which iOS demotes to muted. Keeping the element in the
    // playing state across the src change preserves the unmute. Mirrors
    // `loadSource` in Downloads/genuin/grid/video.html.
    entry.currentSrc = newSrc;
    // New content invalidates any pending post-roll context from the prior src.
    entry.postRollPending = false;
    entry.pendingPause = false;
    const seekTo = storedTimes.get(newSrc) ?? 0;
    if (seekTo > 0) pendingSeeks.set(newSrc, seekTo);
    else pendingSeeks.delete(newSrc);

    loadSource(entry, newSrc);
  }

  /**
   * Whether a `play()` rejection / element state indicates IMA left the content
   * element wedged in the unsupported-source state after a pre-roll: the next
   * resource-selection pass fails with `NotSupportedError` /
   * `MEDIA_ERR_SRC_NOT_SUPPORTED` / `NETWORK_NO_SOURCE`. This is the only failure
   * class that warrants a full source reset; autoplay (`NotAllowedError`) and
   * arbitrary decode/abort rejections must NOT take this path.
   */
  function isUnsupportedSourceFailure(err: unknown, v: HTMLVideoElement): boolean {
    if (err instanceof DOMException && err.name === "NotSupportedError") return true;
    // MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED === 4. Reference the numeric code
    // directly rather than the `MediaError` global, which is not present as a
    // bare global in every JS runtime (e.g. the jsdom test env exposes it only
    // on `window`); `v.error.code` is always a plain number when set.
    return v.error?.code === 4 || v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
  }

  /**
   * One-time source reset + retry for the wedged-after-pre-roll case. IMA ran
   * resource selection against the content element and failed it, so the resume
   * `play()` rejects. A full reset forces a fresh resource-selection pass: native
   * path clears `src` + load() (abort/empty → error cleared) then re-assigns the
   * src + load() again; hls.js path re-feeds the manifest through `loadSource`
   * (touching native `src`/load() would tear down its MediaSource). The pending
   * seek is preserved via `pendingSeeks` + the `loadedmetadata` listener.
   *
   * Re-entrancy is guarded by `entry.recoveringSrc` so a retry that also rejects
   * does not loop — it just warns once and gives up.
   */
  function recoverUnsupportedSource(entry: RegistryEntry): void {
    const v = entry.videoEl;
    entry.recoveringSrc = true;

    const resumeFrom = v.currentTime;
    if (entry.currentSrc && resumeFrom > 0) pendingSeeks.set(entry.currentSrc, resumeFrom);

    if (nativeHls || !hls) {
      // Native path (Safari / no-hls.js). Full reset → fresh resource selection.
      // IMA's ad flow can leave `srcObject` and/or `crossorigin` attached to the
      // content element (srcObject for ad-stitching coordination, crossorigin
      // anonymous so IMA can read content frames). `srcObject` wins resource
      // selection over `src` per spec, and a stale `crossorigin` mismatched
      // against the actual response can fail resource selection synchronously
      // (manifests as networkState=2 → 3 with error.code=4 in the same tick).
      // Clear both before re-asserting `src` so the fresh resource-selection
      // pass actually picks up the URL we just set.
      if (v.srcObject) v.srcObject = null;
      // `removeAttribute('crossorigin')` is the only safe clear: assigning
      // `crossOrigin = null` coerces to the string "null" per WHATWG spec
      // (the IDL reflection treats null as the empty-string default that then
      // round-trips through `String()`), which leaves a stale CORS hint.
      v.removeAttribute("crossorigin");
      v.removeAttribute("src");
      try {
        v.load(); // abort + clear: networkState → EMPTY, error cleared.
      } catch {
        /* some environments throw if load() races a teardown; ignore */
      }
      // entry.currentSrc is guaranteed set by the caller's guard.
      v.src = entry.currentSrc as string;
      try {
        v.load();
      } catch {
        /* ignore — play() below still triggers resource selection */
      }
    } else {
      // hls.js path. Re-attach the manifest through hls.js, which re-feeds its
      // MediaSource. Do not touch `src`/native load() — that would break it.
      // Because hls.js was constructed with `autoStartLoad: false`, we must
      // also register a `hlsManifestParsed → startLoad(...)` listener here;
      // otherwise the fragment loader would sit idle and the retry `play()`
      // below would never produce any decoded frames. The stored seek
      // (set above when `resumeFrom > 0`) drives the start position.
      const startAt = pendingSeeks.get(entry.currentSrc as string);
      const startPos = typeof startAt === "number" && startAt > 0 ? startAt : -1;
      hls.config.startPosition = startPos;
      startLoadOnManifestParsed(hls, startPos);
      hls.loadSource(entry.currentSrc as string);
    }

    const retry = v.play();
    if (retry && typeof retry.catch === "function") {
      retry
        .catch(() => {
          // Retry also failed — give up. Do NOT recover again (would loop).
          console.warn("[video-registry] source reset retry failed; awaiting user gesture");
        })
        .finally(() => {
          entry.recoveringSrc = false;
        });
    } else {
      entry.recoveringSrc = false;
    }
  }

  function playVideoEl(entry: RegistryEntry): void {
    // IMA is currently driving an ad break — do not restart the content video.
    if (entry.adIsPlaying) return;
    const v = entry.videoEl;
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch((err: unknown) => {
        // Wedged-after-pre-roll recovery. IMA left the content element in the
        // unsupported-source state, so this resume play() rejected. Reset the
        // source and retry play() once — but only when we actually have a src to
        // restore and we are not already mid-recovery (re-entrancy guard).
        if (!entry.recoveringSrc && entry.currentSrc && isUnsupportedSourceFailure(err, v)) {
          recoverUnsupportedSource(entry);
          return;
        }
        // Only fall back to muted playback for NotAllowedError — that's the only
        // rejection caused by the browser's autoplay policy. Other rejections
        // (NotSupportedError, AbortError, decode/network failures) are unrelated
        // to mute state; forcing muted=true on those erases the user's unmute
        // choice and persists via the volumechange listener into userState.muted,
        // causing the "re-mute after 3-4 swipes" regression.
        const isNotAllowed = err instanceof DOMException && err.name === "NotAllowedError";
        if (!isNotAllowed) {
          console.warn("[video-registry] play() rejected:", err);
          return;
        }
        // User has explicitly unmuted — retry once at current mute state,
        // then warn and leave element paused awaiting a user gesture.
        if (entry.userState.muted === false) {
          v.play().catch(() => {
            console.warn("[video-registry] autoplay blocked while unmuted; awaiting user gesture");
          });
          return;
        }
        // Cold-start / user-muted path: muted retry is the legitimate fallback.
        if (!v.muted) {
          v.muted = true;
          v.play().catch(() => {
            // Still failing — give up and let the consumer decide.
          });
        }
      });
    }
  }

  function resumeContent(entry: RegistryEntry): void {
    entry.adIsPlaying = false;
    // Explicitly pause the ad <video>; hiding via display:none does not stop decode.
    try {
      entry.adVideoEl.pause();
    } catch {
      /* ignore */
    }
    entry.adContainerEl.style.display = "none";
    // Restore pointer-events:none so touches pass through to the content video
    // when no ad is active.
    entry.adContainerEl.style.pointerEvents = "none";
    entry.adVideoEl.style.display = "none";
    entry.videoEl.muted = entry.userState.muted;

    // An external play=false arrived during the ad break — honor it: leave
    // content paused and clear the flag.
    const wantsPause = entry.pendingPause;
    entry.pendingPause = false;

    // Post-roll path: content already reached end-of-stream. Only restart the
    // <video> when the consumer wants looping playback; otherwise leave it
    // paused at duration so the consumer's `ended` handler stays authoritative.
    if (entry.postRollPending) {
      entry.postRollPending = false;
      if (!wantsPause && entry.videoEl.loop) {
        playVideoEl(entry);
      }
      return;
    }
    if (wantsPause) return;

    // Pre-roll recovery is NOT done here. The content <video> is created with
    // preload="none"; on a pre-roll, IMA's ad break runs resource selection
    // against the content element and fails it, but the element only wedges into
    // `error.code=4 (MEDIA_ERR_SRC_NOT_SUPPORTED)` + `networkState=3
    // (NETWORK_NO_SOURCE)` *as a result of* the resume `play()` itself. At this
    // point `videoEl.error` is still null and `networkState` is not yet
    // NETWORK_NO_SOURCE, so a pre-play wedge check is structurally impossible — it
    // never fires. Recovery is instead driven by the `play()` rejection in
    // `playVideoEl` (`recoverUnsupportedSource`), which performs the full source
    // reset + one-time retry. The pending-seek mechanism preserves resume position.
    playVideoEl(entry);
  }

  function applyOpts(entry: RegistryEntry, opts: ClaimOptions): void {
    const v = entry.videoEl;
    const srcChanged = opts.src !== undefined && opts.src !== entry.currentSrc;

    if (srcChanged) {
      // Stop ad audio FIRST before any other work — IMA destroy can throw on
      // partial state, and we must not leave the ad <video> decoding while the
      // new content src starts playing. Hiding via display:none does not pause.
      try {
        entry.adVideoEl.pause();
      } catch {
        /* ignore */
      }
      entry.adIsPlaying = false;
      entry.pendingPause = false;
      entry.adContainerEl.style.display = "none";
      entry.adContainerEl.style.pointerEvents = "none";
      entry.adVideoEl.style.display = "none";

      swapSrc(entry, opts.src as string);
      // A new content src invalidates the prior ad request entirely.
      // Fully destroy the AdsLayer (AdsManager + AdsLoader + AdDisplayContainer
      // + adVideoEl media state) so the next requestAd() rebuilds from scratch.
      // Partial resets (resetForNewContent) leaked previous ad creative state
      // into the new break — the new ad resumed from the swipe-away currentTime
      // instead of starting at 0. Full rebuild is the only reliable teardown.
      entry.currentAdUrl = undefined;
      if (entry.adsLayer) {
        entry.adsLayer.destroy();
        entry.adsLayer = null;
      }
    }

    // Transient entries have no adsLayer by construction — adsLayer?. is a
    // no-op for them, so the same branch works for shared + transient.
    if (opts.muted !== undefined && v.muted !== opts.muted) {
      v.muted = opts.muted;
      entry.userState.muted = opts.muted;
      entry.adsLayer?.setMuted(opts.muted);
    }
    if (opts.volume !== undefined) {
      const vol = clampVolume(opts.volume);
      if (v.volume !== vol) v.volume = vol;
      entry.adsLayer?.setVolume(vol);
    }
    if (opts.playbackRate !== undefined && v.playbackRate !== opts.playbackRate) {
      v.playbackRate = opts.playbackRate;
    }

    if (opts.loop !== undefined && v.loop !== opts.loop) v.loop = opts.loop;
    if (opts.playsInline !== undefined && v.playsInline !== opts.playsInline) {
      v.playsInline = opts.playsInline;
    }

    if (opts.play !== undefined) {
      if (entry.adIsPlaying) {
        // During an ad break IMA drives the ad through its AdsManager — NOT
        // the raw adVideoEl. Pausing adVideoEl directly does not stop an IMA
        // ad (the SDK keeps its own playback timer and re-asserts control), so
        // route the external play/pause through AdsLayer.pause()/resume() which
        // call AdsManager.pause()/resume(). Remember a pause so resumeContent()
        // doesn't auto-resume content against the caller's wishes when the
        // break ends. (This supersedes the IMPROVEMENT-003 note that claimed
        // adVideoEl.pause() was sufficient — it controls the wrong layer.)
        if (opts.play) {
          entry.pendingPause = false;
          entry.adsLayer?.resume();
        } else {
          entry.pendingPause = true;
          entry.adsLayer?.pause();
        }
      } else if (opts.play) {
        playVideoEl(entry);
      } else {
        v.pause();
      }
    }

    // Ad layer wiring — only on the shared entry. Transients run bare.
    if (entry.shared && opts.adUrl !== entry.currentAdUrl) {
      requestAd(entry, opts.adUrl);
    }
  }

  function requestAd(entry: RegistryEntry, adUrl: string | undefined): void {
    if (!entry.shared) return;
    entry.currentAdUrl = adUrl;
    if (!adUrl) {
      entry.adsLayer?.destroy();
      entry.adsLayer = null;
      return;
    }

    if (!entry.adsLayer) {
      entry.adsLayer = new AdsLayer(
        entry.adContainerEl,
        entry.adVideoEl,
        entry.videoEl,
        {
          postRollPending: () => {
            entry.postRollPending = true;
          },
          contentPauseRequested: () => {
            entry.adIsPlaying = true;
            // Re-show the ad container here (not just in requestAd) so post-roll
            // works: a prior resumeContent() — fired on CONTENT_RESUME_REQUESTED
            // or ALL_ADS_COMPLETED after pre/mid-roll — sets the container to
            // display:none, and IMA's later post-roll CONTENT_PAUSE_REQUESTED
            // would otherwise render the creative inside a hidden subtree.
            entry.adContainerEl.style.display = "block";
            // Enable pointer events so IMA's click-through overlay and skip button
            // are interactive. pointer-events:none on the parent overrides any
            // child-level pointer-events set by the IMA SDK.
            entry.adContainerEl.style.pointerEvents = "auto";
            entry.adVideoEl.style.display = "block";
            try {
              entry.videoEl.pause();
            } catch {
              // ignore
            }
          },
          contentResumeRequested: () => {
            resumeContent(entry);
          },
          allAdsCompleted: () => {
            resumeContent(entry);
          },
          adError: (err) => {
            resumeContent(entry);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("video-registry:ad-error", { detail: err }));
            }
          },
        },
        {
          // userState.volume is 0–100; AdsLayer expects 0–1.
          initialMuted: entry.userState.muted,
          initialVolume: entry.userState.volume / 100,
        }
      );
    }

    // adContainerEl must be visible before reading clientWidth/Height —
    // a hidden element returns 0, causing IMA to receive 1×1 slot dimensions
    // and render the ad invisibly. adVideoEl stays hidden until IMA fires
    // contentPauseRequested so there's no premature flash.
    // Note: the durable show for an active ad break is handled in the
    // contentPauseRequested handler. This line only ensures non-zero slot
    // dimensions for the requestAds() call below.
    entry.adContainerEl.style.display = "block";

    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        if (entry.currentAdUrl !== adUrl) return;
        const w = entry.adContainerEl.clientWidth;
        const h = entry.adContainerEl.clientHeight;
        entry.adsLayer?.request(adUrl, w, h);
      });
    } else {
      // Test environment fallback (jsdom).
      entry.adsLayer.request(adUrl, entry.adContainerEl.clientWidth, entry.adContainerEl.clientHeight);
    }
  }

  function destroyEntry(entry: RegistryEntry): void {
    try {
      entry.adVideoEl.pause();
    } catch {
      // ignore
    }
    entry.adVideoEl.removeAttribute("src");
    try {
      entry.adVideoEl.load();
    } catch {
      /* ignore */
    }
    try {
      entry.videoEl.pause();
    } catch {
      // ignore
    }
    entry.adsLayer?.destroy();
    entry.adsLayer = null;
    entry.postRollPending = false;
    entry.pendingPause = false;
    entry.videoEl.removeAttribute("src");
    try {
      entry.videoEl.load();
    } catch {
      // ignore
    }
    entry.containerEl.parentNode?.removeChild(entry.containerEl);
    if (entry.shared) {
      shared = null;
      if (hls) {
        try {
          hls.destroy();
        } catch {
          // ignore
        }
        hls = null;
      }
      storedTimes.clear();
      pendingSeeks.clear();
    } else {
      transients.delete(entry.key);
    }
  }

  function park(entry: RegistryEntry): void {
    entry.parked = true;

    // Mark free so the next card's claim() hits Branch 1 (sequential reuse)
    // instead of minting a transient.
    entry.refCount = 0;
    entry.postRollPending = false;
    entry.pendingPause = false;
    entry.lastClaimedAt = Date.now();
    // Snapshot currentTime so swipe-back resumes from the exact swipe
    // point even if the next claim's loadedmetadata arrives before any
    // timeupdate fires.
    if (entry.currentSrc) {
      storedTimes.set(entry.currentSrc, entry.videoEl.currentTime);
    }
    // **Do not pause.** Pausing drops iOS Safari's user-activation token
    // for un-muted playback, so the next claim's `play()` (after a src
    // swap) gets treated as fresh autoplay and demoted to muted —
    // killing the unmute-once-applies-to-all behaviour. Sequential
    // claim/release happens within a single React commit, so the
    // element only lives in the parking div for sub-millisecond windows
    // before the next claim re-attaches it. The audio leak is bounded
    // by the time between unmount and the next mount; for the
    // active-card-only feed pattern that's effectively zero.
    const dest = ensureParkingDiv();
    if (entry.containerEl.parentNode !== dest) {
      dest.appendChild(entry.containerEl);
    }
  }

  return {
    claim(src, opts, slotEl) {
      ensureParkingDiv();

      // Create a fresh canvas for this claim cycle. Inserted into the slot
      // on release so the freeze frame is visible after the video moves out.
      const canvasEl = createFreezeCanvas();

      function makeHandle(entry: RegistryEntry): ClaimHandle {
        let cancelFreezeRemoval: (() => void) | null = null;

        if (slotEl) {
          slotEl.appendChild(entry.containerEl);

          const removeFreezeFrames = () => {
            slotEl!.querySelectorAll("[data-video-registry-freeze]").forEach((el) => el.remove());
          };

          // requestVideoFrameCallback fires when a decoded frame is actually
          // painted — the most accurate signal that the video is showing the
          // correct frame (after any pending seek).
          const rVFCId = entry.videoEl.requestVideoFrameCallback(removeFreezeFrames);
          cancelFreezeRemoval = () => {
            entry.videoEl.cancelVideoFrameCallback(rVFCId);
          };
        }

        return { key: entry.key, entry, canvasEl, slotEl, cancelFreezeRemoval };
      }

      // Branch 1 — sequential reuse (normal swipe path).
      // shared exists and was released by the previous card (refCount=0, parked).
      // Take it directly: mark occupied, un-park, swap src via applyOpts.
      // This is the only branch that runs in a healthy single-active-card feed.
      if (shared && shared.refCount === 0) {
        shared.refCount = 1;
        shared.parked = false;
        shared.lastClaimedAt = Date.now();
        applyOpts(shared, opts);
        return makeHandle(shared);
      }

      // Branch 2 — simultaneous claim (defensive escape hatch).
      // shared exists but refCount=1, meaning another card hasn't released yet.
      // This should not happen in production (feed renders one active card at a
      // time), but can occur during React transitions where old and new cards
      // briefly overlap. Mint a throwaway <video> so the second consumer renders
      // something — it won't inherit the unmute gesture, HLS instance, stored
      // seek times, or ad layer. Destroyed immediately on release (not parked).
      if (shared && shared.refCount === 1) {
        const transientKey = `${SHARED_KEY}::dup-${dupeCounter++}`;
        const { videoEl, containerEl, adContainerEl, adVideoEl } = createElementTrio(opts);
        const transient: RegistryEntry = {
          key: transientKey,
          containerEl,
          videoEl,
          adContainerEl,
          adVideoEl,
          adsLayer: null,
          currentAdUrl: undefined,
          refCount: 1,
          parked: false,
          lastClaimedAt: Date.now(),
          userState: {
            muted: videoEl.muted,
            volume: Math.round(videoEl.volume * 100),
            playbackRate: videoEl.playbackRate,
          },
          currentSrc: opts.src,
          shared: false,
          adIsPlaying: false,
          postRollPending: false,
          pendingPause: false,
          recoveringSrc: false,
        };
        transients.set(transientKey, transient);
        if (opts.src) videoEl.src = opts.src;
        applyOpts(transient, opts);
        return makeHandle(transient);
      }

      // Branch 3 — cold start (first claim ever in this registry instance).
      // shared is null; create it now. ensureShared wires up event listeners
      // (volumechange, ratechange, timeupdate, loadedmetadata) and decides the
      // HLS strategy (native on Safari, hls.js on all other browsers).
      const entry = ensureShared(opts);
      entry.refCount = 1;
      entry.parked = false;
      entry.lastClaimedAt = Date.now();
      if (opts.src) swapSrc(entry, opts.src);
      applyOpts(entry, opts);
      return makeHandle(entry);
    },

    release(handle) {
      handle.cancelFreezeRemoval?.();
      const { entry, canvasEl, slotEl } = handle;

      // Read slot dimensions while containerEl is still attached, then detach.
      const slotW = entry.containerEl.parentElement?.clientWidth ?? 0;
      const slotH = entry.containerEl.parentElement?.clientHeight ?? 0;
      entry.containerEl.parentNode?.removeChild(entry.containerEl);

      // Place the canvas into the slot so the freeze frame shows after the
      // video moves out. Fire the async capture — createImageBitmap has already
      // snapshotted the frame; decode finishes in the background.
      if (slotEl && slotW > 0 && slotH > 0) {
        slotEl.appendChild(canvasEl);
        fireFreezeCapture(handle, slotW, slotH);
      }

      if (entry.shared) {
        if (!shared || shared !== entry) return;
        if (shared.refCount === 0) return;
        park(shared);
      } else {
        // Transients evict on release — they're a fallback, not a pool.
        const t = transients.get(handle.key);
        if (!t) return;
        destroyEntry(t);
      }
    },

    apply(handle, opts) {
      const entry = handle.entry.shared ? shared : (transients.get(handle.key) ?? null);
      if (!entry) return;
      applyOpts(entry, opts);
    },

    evict(handle) {
      handle.cancelFreezeRemoval?.();
      const entry = handle.entry.shared ? shared : (transients.get(handle.key) ?? null);
      if (!entry) return;
      destroyEntry(entry);
    },

    evictAll() {
      for (const t of [...transients.values()]) destroyEntry(t);
      if (shared) destroyEntry(shared);
      if (parkingDiv?.parentNode) {
        parkingDiv.parentNode.removeChild(parkingDiv);
      }
      parkingDiv = null;
    },

    getStats() {
      const all: RegistryEntry[] = [];
      if (shared) all.push(shared);
      all.push(...transients.values());
      return {
        total: all.length,
        parked: all.filter((e) => e.parked).length,
        entries: all,
        maxEntries: 1, // Vestigial — the shared model is one element.
        storedTimes: storedTimes.size,
      };
    },
  };
}

function clampVolume(volume: number): number {
  if (volume <= 0) return 0;
  if (volume >= 100) return 1;
  return volume / 100;
}
