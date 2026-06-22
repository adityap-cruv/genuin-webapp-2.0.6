"use client";

import OpenPlayerJS from "openplayerjs";
import type { MutableRefObject } from "react";

/**
 * Internal helpers extracted from `video-player.tsx`.
 *
 * Behaviour-identical refactor — every helper here used to live inline in
 * `<VideoPlayer>` and is invoked the same way after extraction.
 */

// ─── HLS config ────────────────────────────────────────────────────────────

/**
 * Tuned HLS.js config used by every `OpenPlayerJS` instance. Optimised for
 * fast playback start, conservative ABR, and short-clip workloads.
 */
export const hlsConfigs = {
  // debug: true,
  /**
   * Start with lowest quality level to ensure smooth playback start.
   * ABR will gradually increase quality based on actual bandwidth.
   */
  startLevel: 0,
  /**
   * Disable capLevelToPlayerSize to prevent jumping to high quality based on player dimensions.
   * This ensures startLevel is respected for the first fragment.
   */
  capLevelToPlayerSize: false,
  /**
   * Restrict initial quality - set max to level 1 initially to force low quality start.
   * This can be adjusted dynamically after playback starts.
   */
  maxAutoLevel: 1,
  /**
   * Use worker threads for decoding for better performance.
   */
  enableWorker: true,
  /**
   * Enable Encrypted Media Extensions (EME) if DRM is required.
   */
  emeEnabled: true,
  /**
   * Low latency mode for quicker playback start and adaptation.
   */
  lowLatencyMode: true,
  /**
   * Buffer settings optimized for 2-second fragments.
   */
  maxBufferLength: 10, // Buffer up to 6 fragments (12 seconds).
  maxBufferSize: 40 * 1000 * 1000, // Maximum buffer size in bytes (40MB).
  backBufferLength: 30, // Retain 30 seconds for seamless rewind.
  /**
   * Fragment loading optimization.
   */
  fragLoadingTimeOut: 7000, // Timeout in milliseconds for loading fragments (reduced for faster failure detection).
  startFragPrefetch: true, // Prefetch the next fragment to minimize stutters.
  /**
   * Prevent HLS.js from probing multiple quality levels on startup.
   * This stops unnecessary parallel downloads of the same fragment at different qualities.
   */
  testBandwidth: false, // Disable initial bandwidth test that loads multiple quality levels
  /**
   * Conservative ABR settings to prevent jumping to highest quality immediately.
   */
  abrEwmaDefaultEstimate: 300000, // Lower initial bandwidth estimate (300 kbps) to start conservatively.
  abrBandWidthFactor: 0.8, // More conservative - requires 80% of bandwidth before switching up.
  abrBandWidthUpFactor: 0.5, // Very conservative upscaling - prevents jumping to 1080p immediately.
  abrEwmaFastLive: 3, // Slower adaptation for live content.
  abrEwmaSlowLive: 5, // Even slower for stable quality.
  abrEwmaFastVoD: 3, // Slower adaptation for VOD content.
  abrEwmaSlowVoD: 5, // Gradual quality increases.
  /**
   * Handle live playback smoothly for low-latency streams.
   */
  liveSyncDuration: 2.5, // Keep live playback latency low.
  liveMaxLatencyDuration: 6, // Maximum latency allowed for live streams.
  /**
   * Error recovery and buffer hole handling.
   */
  maxLoadingDelay: 4, // Maximum delay for loading retries (seconds).
  maxBufferHole: 0.5, // Maximum buffer hole tolerance (seconds).
  highBufferWatchdogPeriod: 2, // Period to check for buffer issues (seconds).
};

// ─── Quartile tracking ─────────────────────────────────────────────────────

export type QuartileStateRef = MutableRefObject<{
  firstQuartileFired: boolean;
  midpointFired: boolean;
  thirdQuartileFired: boolean;
  videoWatchedFired: boolean;
  // The remaining VideoPlayer state-ref fields are preserved by callers; only
  // the four flags above are mutated by this helper.
  [key: string]: unknown;
}>;

export type QuartileCallbacks = {
  onVideoFirstQuartile?: (duration: number, currentTime: number) => void;
  onVideoMidpoint?: (duration: number, currentTime: number) => void;
  onVideoThirdQuartile?: (duration: number, currentTime: number) => void;
  onVideoWatched?: (duration: number, currentTime: number) => void;
};

/**
 * Attaches a `timeupdate` listener that flips the four quartile flags on
 * `stateRef` and invokes the matching callback once each per playback pass.
 * Returns a teardown that removes the listener.
 *
 * The `videoWatchedFired` flag fires once `currentTime ≥ 3 s`. Quartiles fire
 * at 1/4, 1/2, 3/4 of `duration`. Reset semantics (re-fire after a seek
 * backwards) are owned by the caller via `changePlayerStateRef` — this helper
 * is the forward-tracking half only.
 */
export function attachQuartileTracking(
  videoEl: HTMLVideoElement,
  stateRef: QuartileStateRef,
  callbacks: QuartileCallbacks
): () => void {
  const handleTimeUpdate = () => {
    const duration = videoEl.duration;
    if (!duration || duration === 0 || duration === Infinity) return;
    const { currentTime } = videoEl;
    const state = stateRef.current;

    if (!state.videoWatchedFired && currentTime >= 3) {
      callbacks.onVideoWatched?.(duration, currentTime);
      state.videoWatchedFired = true;
    }

    const firstQuartileTime = duration / 4;
    const midpointTime = duration / 2;
    const thirdQuartileTime = (duration * 3) / 4;

    if (!state.firstQuartileFired && currentTime >= firstQuartileTime) {
      callbacks.onVideoFirstQuartile?.(duration, currentTime);
      state.firstQuartileFired = true;
    }
    if (!state.midpointFired && currentTime >= midpointTime) {
      callbacks.onVideoMidpoint?.(duration, currentTime);
      state.midpointFired = true;
    }
    if (!state.thirdQuartileFired && currentTime >= thirdQuartileTime) {
      callbacks.onVideoThirdQuartile?.(duration, currentTime);
      state.thirdQuartileFired = true;
    }
  };

  videoEl.addEventListener("timeupdate", handleTimeUpdate);
  return () => videoEl.removeEventListener("timeupdate", handleTimeUpdate);
}

// ─── OpenPlayerJS factory ──────────────────────────────────────────────────

export type CreatePlayerOptions = {
  /** Video URL — used to choose between native HLS (Safari) and hls.js. */
  src: string | undefined;
  /** Whether the host browser is Safari; flips OpenPlayerJS into native HLS mode. */
  isSafari: boolean;
  /** Initial currentTime forwarded to OpenPlayerJS. */
  startTime: number;
  /** Initial volume (0–1) — forwarded to OpenPlayerJS as `startVolume`. */
  startVolume?: number;
  /** Optional VAST/IMA ad tag URL. */
  adUrl?: string;
};

/**
 * Builds a configured `OpenPlayerJS` instance bound to `videoEl`. Centralises
 * the constructor config (HLS vs native, optional IMA ad tag, fixed loader
 * settings, the tuned `hlsConfigs`) so both `<VideoPlayer>` today and the
 * future player registry share one factory.
 */
export function createOpenPlayerJS(videoEl: HTMLVideoElement, opts: CreatePlayerOptions): OpenPlayerJS {
  const { src, isSafari, startTime, startVolume, adUrl } = opts;
  return new OpenPlayerJS(videoEl, {
    controls: {
      alwaysVisible: false,
    },
    mode: "responsive",
    forceNative: isSafari ? true : !src?.endsWith(".m3u8"),
    showLoaderOnInit: false,
    hls: hlsConfigs,
    startTime,
    ...(startVolume !== undefined ? { startVolume } : {}),
    ads: adUrl
      ? {
          src: adUrl,
          enablePreloading: false,
        }
      : undefined,
  });
}
