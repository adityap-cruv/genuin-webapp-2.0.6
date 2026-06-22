"use client";

import { memo, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";

import { useBrowserDetect } from "@genuin/ui/hooks";
import { cn, encodeVideoSourceUrl } from "@genuin/ui/lib/utils";

import { attachQuartileTracking } from "./internals";
import type { ClaimHandle, ClaimOptions } from "./registry";
import { useVideoRegistry } from "./video-element-provider";

type V2State = {
  firstQuartileFired: boolean;
  midpointFired: boolean;
  thirdQuartileFired: boolean;
  videoWatchedFired: boolean;
};

type EndState = {
  contentEnded: boolean;
  adsCompleted: boolean;
};

export type VideoPlayerV2Props = {
  src: string | undefined;
  id?: string;
  poster?: string;
  className?: string;
  style?: CSSProperties;
  startTime?: number;
  ref?: (el: HTMLVideoElement | null) => void;
  playsInline?: boolean;
  volume?: number;
  muted?: boolean;
  playbackSpeed?: number;
  play?: boolean;
  loop?: boolean;
  adUrl?: string;
  isActive?: boolean;
  enableLazyLoading?: boolean;
  /**
   * When `true` (default), `genuin:content-ended` dispatch is gated on the
   * post-roll completing (waits for `genuin:ad-all-completed` before firing).
   * Pass `false` to fire on every raw `ended` event regardless of post-roll.
   */
  useStrictEndCoordination?: boolean;
  /**
   * Prop-style native event callbacks. Provided for parity with `<VideoPlayer>`
   * (V1) so consumers can pass `onPlay`/`onPause`/`onEnded` directly instead of
   * attaching listeners to the imperative ref. Fire alongside (not instead of)
   * the underlying DOM events on the `<video>` element.
   *
   * `onEnded` is gated the same way as `genuin:content-ended` — it fires after
   * any scheduled post-roll completes, never on the raw `ended` event. Shape
   * matches V1's `onEnded` (`{ target }`) so call sites are interchangeable.
   */
  onPlay?: (event: Event) => void;
  onPause?: (event: Event) => void;
  onEnded?: (payload: { target: HTMLVideoElement | null }) => void;
};

/**
 * Registry-backed `<video>` view. On mount it claims a long-lived `<video>`
 * from the {@link VideoRegistry}, reparents the element into a slot wrapper,
 * and forwards command props on every render. On unmount it releases the
 * handle so the entry parks for reuse.
 *
 * **Hybrid event surface.** V2 exposes both DOM events on the underlying
 * `<video>` element and a small set of prop callbacks for parity with V1
 * (`onPlay`, `onPause`, `onEnded`). Consumers can pick whichever fits.
 * `onEnded` rides the gated `genuin:content-ended` event (fires after any
 * scheduled post-roll completes) — never on the raw `ended` event.
 *
 * Native events (`play`, `pause`,
 * `timeupdate`, `seeked`, `volumechange`, `loadstart`, `playing`, `ended`)
 * fire on the element directly. V2 synthesizes the following CustomEvents:
 *
 * - `genuin:player-ready` — registry claim completed.
 * - `genuin:video-start` — first `playing` after `play`; detail `{ duration, currentTime, latency }`.
 * - `genuin:quartile-first` / `-mid` / `-third` / `-watched` — detail `{ duration, currentTime }`.
 * - `genuin:content-ended` — post-roll-gated end of stream. Strictly fires once per
 *   playback pass (controlled by `useStrictEndCoordination`).
 * - `genuin:mute-change` — `volumechange`-derived; detail `{ muted }`.
 *
 * Ad-related `genuin:ad-*` events are dispatched directly by `AdsLayer` on the
 * same element. V2 listens internally only for `genuin:ad-all-completed` to
 * drive the post-roll gate.
 */
export const VideoPlayerV2 = memo(function VideoPlayerV2({
  src,
  id,
  poster,
  className,
  style,
  startTime = 0,
  ref,
  playsInline = true,
  volume = 100,
  muted,
  playbackSpeed = 1,
  play = true,
  loop = false,
  adUrl,
  isActive = true,
  enableLazyLoading = false,
  useStrictEndCoordination = true,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerV2Props) {
  // Pin the latest callback values in refs so the subscribing effect doesn't
  // re-run (and detach/reattach listeners) every render. Listeners read the
  // current value at fire time.
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  onPlayRef.current = onPlay;
  onPauseRef.current = onPause;
  onEndedRef.current = onEnded;
  const slotRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ClaimHandle | null>(null);
  const registry = useVideoRegistry();
  const { isSafari } = useBrowserDetect();
  // Quartile state. Shape satisfies QuartileStateRef from internals.ts.
  const playerStateRef = useRef<V2State>({
    firstQuartileFired: false,
    midpointFired: false,
    thirdQuartileFired: false,
    videoWatchedFired: false,
  });

  // End-of-stream coordination. Tracks whether content `ended` fired and whether
  // a scheduled post-roll's ALL_ADS_COMPLETED fired, so `genuin:content-ended`
  // is dispatched exactly once per playback pass even when a post-roll trails
  // the content.
  const endStateRef = useRef<EndState>({ contentEnded: false, adsCompleted: false });

  const srcStr = typeof src === "string" ? src : undefined;

  const buildOpts = (): ClaimOptions => ({
    src: srcStr ? encodeVideoSourceUrl(srcStr) : undefined,
    isSafari,
    poster,
    playsInline,
    loop,
    muted,
    volume,
    playbackRate: playbackSpeed,
    play,
    startTime,
    adUrl,
    enableLazyLoading,
  });

  // Claim on mount / when src or active state changes; release on cleanup.
  // useLayoutEffect required so registry.release detaches containerEl before
  // React's mutation phase removes the slot (iOS Safari NotFoundError fix).
  useLayoutEffect(() => {
    if (!srcStr || !isActive) return;
    const claimKey = encodeVideoSourceUrl(srcStr);
    const handle = registry.claim(claimKey, buildOpts(), slotRef.current);
    handleRef.current = handle;
    handle.entry.videoEl.dispatchEvent(new CustomEvent("genuin:player-ready"));
    ref?.(handle.entry.videoEl);
    return () => {
      // Detach the registry's container from the slot ourselves so the
      // slot is empty by the time React tears it down. `release` will
      // move it into the parking div anyway, but doing it here removes
      // the timing dependency on React's effect-vs-mutation order
      // (which on iOS Safari triggered NotFoundError during
      // commitDeletionEffectsOnFiber when the slot still held a child).
      handle.entry.containerEl.parentNode?.removeChild(handle.entry.containerEl);
      registry.release(handle);
      if (handleRef.current === handle) {
        handleRef.current = null;
        ref?.(null);
      }
    };
  }, [src, isActive]);

  // Forward command props on every render. `apply` is a no-op when nothing
  // changed (it diffs against the entry's current state).
  useEffect(() => {
    if (handleRef.current) registry.apply(handleRef.current, buildOpts());
  }, [muted, volume, playbackSpeed, play, startTime, adUrl, loop, playsInline]);

  // Keep the IMA AdsManager's container in sync with the slot's rendered
  // size. IMA does not observe the ad container itself — without this the
  // ad creative stays at whatever dimensions it had when `AdsManager.init`
  // ran, even if the host resizes the player (slider, drag, layout flow,
  // theatre/fullscreen toggle, etc.). `AdsLayer.resize` is a guarded no-op
  // when no ad is currently running, so calling it on every slot mutation
  // is safe regardless of ad lifecycle state.
  useEffect(() => {
    const slotEl = slotRef.current;
    if (!slotEl) return;
    const apply = () => {
      handleRef.current?.entry.adsLayer?.resize(slotEl.offsetWidth, slotEl.offsetHeight);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(slotEl);
    return () => observer.disconnect();
  }, []);

  // Synthesized event dispatch — listeners that derive non-native signals
  // (latency-aware video-start, quartile-flag reset on backward seek,
  // post-roll-gated content-ended, mute-only change) and re-emit as DOM
  // CustomEvents. Re-runs on src/adUrl change so per-claim state resets and
  // closures over the latest `adUrl` and `useStrictEndCoordination` flag.
  useEffect(() => {
    const videoEl = handleRef.current?.entry.videoEl;
    if (!videoEl) return;

    playerStateRef.current = {
      firstQuartileFired: false,
      midpointFired: false,
      thirdQuartileFired: false,
      videoWatchedFired: false,
    };
    endStateRef.current = { contentEnded: false, adsCompleted: false };

    let playStartTime = -1;
    let videoStartFired = false;

    const fireEndedIfReady = () => {
      if (!useStrictEndCoordination) {
        videoEl.dispatchEvent(new CustomEvent("genuin:content-ended"));
        return;
      }
      const { contentEnded, adsCompleted } = endStateRef.current;
      if (!contentEnded) return;
      const postRollScheduled = handleRef.current?.entry.adsLayer?.postRollScheduled ?? false;
      if (postRollScheduled && !adsCompleted) return;
      endStateRef.current.contentEnded = false;
      endStateRef.current.adsCompleted = false;
      videoEl.dispatchEvent(new CustomEvent("genuin:content-ended"));
    };

    const handlePlay = (event: Event) => {
      playStartTime = performance.now();
      onPlayRef.current?.(event);
    };
    const handlePause = (event: Event) => {
      onPauseRef.current?.(event);
    };
    const handleContentEndedProp = () => {
      onEndedRef.current?.({ target: videoEl });
    };
    const handlePlaying = () => {
      if (videoStartFired) return;
      videoStartFired = true;
      const latency = playStartTime !== -1 ? Math.floor(performance.now() - playStartTime) : 0;
      videoEl.dispatchEvent(
        new CustomEvent("genuin:video-start", {
          detail: { duration: videoEl.duration ?? 0, currentTime: videoEl.currentTime, latency },
        })
      );
    };
    const handleSeeked = () => {
      // Reset quartile flags when seeking backward so they re-fire correctly.
      const { duration, currentTime } = videoEl;
      if (!duration) return;
      const s = playerStateRef.current;
      if (currentTime < duration / 4 && s.firstQuartileFired) s.firstQuartileFired = false;
      if (currentTime < duration / 2 && s.midpointFired) s.midpointFired = false;
      if (currentTime < (duration * 3) / 4 && s.thirdQuartileFired) s.thirdQuartileFired = false;
      if (currentTime < 3 && s.videoWatchedFired) s.videoWatchedFired = false;
    };
    const handleVolumeChange = () => {
      videoEl.dispatchEvent(new CustomEvent("genuin:mute-change", { detail: { muted: videoEl.muted } }));
    };
    const handleEnded = () => {
      endStateRef.current.contentEnded = true;
      fireEndedIfReady();
    };
    const handleAllAdsCompleted = () => {
      endStateRef.current.adsCompleted = true;
      fireEndedIfReady();
    };

    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("pause", handlePause);
    videoEl.addEventListener("playing", handlePlaying);
    videoEl.addEventListener("seeked", handleSeeked);
    videoEl.addEventListener("volumechange", handleVolumeChange);
    videoEl.addEventListener("ended", handleEnded);
    videoEl.addEventListener("genuin:ad-all-completed", handleAllAdsCompleted);
    videoEl.addEventListener("genuin:content-ended", handleContentEndedProp);

    return () => {
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("pause", handlePause);
      videoEl.removeEventListener("playing", handlePlaying);
      videoEl.removeEventListener("seeked", handleSeeked);
      videoEl.removeEventListener("volumechange", handleVolumeChange);
      videoEl.removeEventListener("ended", handleEnded);
      videoEl.removeEventListener("genuin:ad-all-completed", handleAllAdsCompleted);
      videoEl.removeEventListener("genuin:content-ended", handleContentEndedProp);
    };
  }, [src, adUrl, useStrictEndCoordination]);

  // Quartile tracking via shared utility. Dispatches namespaced CustomEvents
  // so the helper stays framework-agnostic (it never owns event names).
  useEffect(() => {
    const videoEl = handleRef.current?.entry.videoEl;
    if (!videoEl) return;
    return attachQuartileTracking(videoEl, playerStateRef, {
      onVideoFirstQuartile: (duration, currentTime) =>
        videoEl.dispatchEvent(new CustomEvent("genuin:quartile-first", { detail: { duration, currentTime } })),
      onVideoMidpoint: (duration, currentTime) =>
        videoEl.dispatchEvent(new CustomEvent("genuin:quartile-mid", { detail: { duration, currentTime } })),
      onVideoThirdQuartile: (duration, currentTime) =>
        videoEl.dispatchEvent(new CustomEvent("genuin:quartile-third", { detail: { duration, currentTime } })),
      onVideoWatched: (duration, currentTime) =>
        videoEl.dispatchEvent(new CustomEvent("genuin:quartile-watched", { detail: { duration, currentTime } })),
    });
  }, [src]);

  const slotStyle: CSSProperties = {
    backgroundImage: poster ? `url(${poster})` : undefined,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    ...style,
  };

  return (
    <div
      id={id}
      ref={slotRef}
      className={cn("gencl:relative gencl:h-full gencl:w-full", className)}
      style={slotStyle}
    />
  );
});
