"use client";
import type { AdDataType } from "@genuin/ui/components/video-player/ad-controls/use-ad-player";
import { VideoPlayer } from "@genuin/ui/components/video-player/video-player";
import { VideoPlayerV2 } from "@genuin/ui/components/video-player/video-player-v2";
import { cn } from "@genuin/ui/lib/utils";
import { lazy, memo, useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentProps } from "react";

import { useUrlParams } from "@genuin/components/context";
import { useAnalytics, VideoTypes } from "@genuin/components/context/analytics";
import { useBaseContext } from "@genuin/components/context/base";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { audioManager } from "@genuin/components/lib/audio-manager";
import type { BrandType } from "@genuin/components/lib/utils/brand-layout";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import type { AdTagObjectType, PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { usePlayerContext } from "./context/context";
import { buildGenAdConfigFromAdTagObject } from "./gen-ad-container";
import type { GenAdConfig } from "./gen-ad-container";
import type { GenAdContainer as GenAdContainerComponent } from "./gen-ad-container/gen-ad-container";
import { usePlayerImplOverride } from "./player-impl-context";

const GenAdContainer = lazy(() =>
  import("./gen-ad-container/gen-ad-container")
    .then((m) => ({ default: m.GenAdContainer }))
    .catch((error): { default: typeof GenAdContainerComponent } => {
      // Ads are non-critical. If the gen-ad-container chunk fails to load
      // (network error, blocked by an ad-blocker, CDN hiccup), a rejected
      // lazy() promise throws as a RENDER error — Suspense only catches the
      // pending state, not rejection — which would unmount the whole player
      // tree and stop the SDK from rendering. Swallow it and resolve to a
      // no-op component so the video still plays without the ad overlay.
      console.error("Failed to load GenAdContainer chunk; rendering without ad overlay:", error);
      // Cast: GenAdContainer's type declares a non-null Element return, but
      // rendering nothing on chunk failure is intentional.
      return { default: (() => null) as unknown as typeof GenAdContainerComponent };
    })
);

type FeedPlayerProps = Omit<ComponentProps<typeof VideoPlayerV2>, "volume" | "playbackSpeed" | "shouldPlay"> & {
  videoId: string;
  /** Clip caption — forwarded to analytics as `title` (iHeart `station.asset.name`). */
  videoDescription?: string | null;
  /** Section title — forwarded to analytics as `section_title` (iHeart `station.asset.sub.name`). */
  sectionTitle?: string | null;
  /** Section subtitle — forwarded to analytics as `section_subtitle`. */
  sectionSubtitle?: string | null;
  /** Section id — forwarded to analytics as `section_id` (iHeart `view.item.asset.id`). */
  sectionId?: string | null;
  /** Podcast id — forwarded to analytics as `podcast_id` (iHeart `station.asset.sub.id` = `podcast|<id>`). */
  podcastId?: string | null;
  /** Station id — forwarded to analytics as `station_id` (iHeart `station.asset.sub.id` = `live|<id>`). */
  stationId?: string | null;
  layoutType?: "responsiveness" | BrandType;
  index?: number;
  adConfig?: GenAdConfig;
  adTagObject?: AdTagObjectType | null;
  isActive?: boolean;
  playerSize?: { height: number; width: number };
  onAdStateChange?: (isFilled: boolean) => void;
  onAdFilled?: (type: string) => void;
  onAdPlaybackEnd?: () => void;
  videoType?: VideoTypes;
  adsPlatform?: string | null;
  isSponsored?: boolean;
  sponsorshipInfo: NonNullable<PostDetailsType>["sponsored"];
  /**
   * Outer event forwarding to FeedPlayer's own parent. V2 has no callback props,
   * so these are wired via DOM listeners on the imperative ref and re-emitted
   * to the parent here.
   */
  onPlay?: (event: Event) => void;
  onPause?: (event: Event) => void;
  onTimeUpdate?: (event: Event) => void;
  onEnded?: (event: { target: HTMLVideoElement | null }) => void;
  onLoadStart?: () => void;
  /**
   * Pick which underlying player to mount.
   * - `"v2"` (default) — `<VideoPlayerV2>`, registry-backed shared `<video>`.
   *   Production path since the M3 migration in `VIDEO_ELEMENT_REUSE_PLAN.md`.
   * - `"v1"` — legacy `<VideoPlayer>` with OpenPlayerJS + per-instance
   *   `<video>`. Kept for side-by-side QA and as an escape hatch while
   *   V1 still ships in comments / animated-tile call sites. Slated for
   *   removal in M4.
   */
  playerImpl?: "v1" | "v2";
};

/**
 * Feed/embed player. Wraps VideoPlayerV2 (DOM-only event surface), subscribing
 * to native + `genuin:*` CustomEvents on the imperative ref and translating
 * them to analytics tracks + player-context state transitions.
 */
export const FeedPlayer = memo(function FeedPlayer({
  src,
  videoId,
  adUrl,
  poster,
  className,
  videoDescription,
  sectionTitle,
  sectionSubtitle,
  sectionId,
  podcastId,
  stationId,
  adConfig,
  adTagObject,
  isActive,
  videoType,
  adsPlatform,
  isSponsored,
  playerSize,
  sponsorshipInfo,
  onAdStateChange,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  onAdPlaybackEnd,
  onAdFilled,
  playerImpl,
  // Drained from `...props` so it doesn't fall through onto the
  // underlying VideoPlayer / VideoPlayerV2 → `<video>` element, where
  // React would warn that `layoutType` isn't a recognised DOM attribute.
  // `layoutType` is FeedPlayer's prop for picking brand chrome variants
  // and isn't relevant to the player atom itself.
  layoutType: _layoutType,
  ...props
}: FeedPlayerProps) {
  // Resolution order: explicit prop wins, then any ancestor `PlayerImplProvider`,
  // then the `design_system=v2` URL param (`isDesignSystemV2`) selects v2,
  // otherwise v1. Lets the components Storybook flip V1/V2 from a toolbar global
  // without re-threading the prop through Embed → EmbedTile → FeedPlayer.
  const playerImplOverride = usePlayerImplOverride();
  const { video, useWindowSwiperMode, isDesignSystemV2 } = useEmbedConfigs();
  const resolvedPlayerImpl = playerImpl ?? playerImplOverride ?? (isDesignSystemV2 ? "v1" : "v1");
  const { muted, volume, playbackSpeed, baseContextManager, brandDetails } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const {
    feedPlayerShouldPlay,
    setPlayerRef,
    setVideoTimeState,
    setPlayingState,
    pauseBySystem,
    mute,
    unmute,
    handleEnded: stateHandleEnded,
    updateAdInfo,
    updateAdSkippable,
    totalVideos,
    positionIndex,
    setIsLoading,
    moveToNextVideo,
  } = usePlayerContext();
  const { track, EventName } = useAnalytics();
  const id = useId();
  const playerRef = useRef<HTMLVideoElement | null>(null);
  // State mirror of the imperative ref so the listener-effect below re-runs
  // (and re-subscribes its native + `genuin:*` listeners) when V1/V2 attach
  // their `<video>` element via this callback ref — a plain ref write would
  // not retrigger the effect.
  const [videoElState, setVideoElState] = useState<HTMLVideoElement | null>(null);
  const handlePlayerRef = useCallback(
    (el: HTMLVideoElement | null) => {
      playerRef.current = el;
      setVideoElState(el);
      // Register the live element with the provider so context actions
      // (seek/play-with-seek/focus/replay) can drive it imperatively. Without
      // this the provider's playerRef stays null and seeking is a silent no-op.
      setPlayerRef(el);
    },
    [setPlayerRef]
  );
  const [isAdFilled, setIsAdFilled] = useState(false);
  const [waterfallFailed, setWaterfallFailed] = useState(false);

  const { appendParamsToUrl, setPlayerSize } = useUrlParams();

  // TODO(qa): temporary qa-testing helper; remove once qa is done.
  adUrl = useMemo(() => {
    const dataAdUrl = embedDetails?.rootElement?.getAttribute("data-ad-url");
    if (playerSize) setPlayerSize(playerSize);
    if (dataAdUrl) return appendParamsToUrl(dataAdUrl);
    if (adUrl) return appendParamsToUrl(adUrl);
  }, [adUrl, adTagObject]);

  const resolvedAdConfig = useMemo(() => {
    if (playerSize) setPlayerSize(playerSize);
    if (adTagObject?.video_ad) {
      if (Array.isArray(adTagObject.video_ad)) {
        adTagObject.video_ad.forEach((item) => {
          if (item.ads_url) item.ads_url = appendParamsToUrl(item.ads_url);
        });
      } else if (adTagObject.video_ad.ads_url) {
        adTagObject.video_ad.ads_url = appendParamsToUrl(adTagObject.video_ad.ads_url);
      }
    }
    // Caller-supplied `adConfig` takes precedence: the schema-derived path
    // (mapBannerAdItem) hardcodes banner size to 300×250, so any consumer
    // that needs a different size (e.g. 300×600 half-page, 160×600 wide
    // skyscraper) supplies a built `GenAdConfig` directly. The
    // `adTagObject` branch stays the production default.
    if (adConfig) return adConfig;
    return adTagObject ? buildGenAdConfigFromAdTagObject(adTagObject, videoId, brandDetails?.brand_id) : undefined;
  }, [adConfig, adTagObject, videoId, brandDetails?.brand_id]);

  const videoPlayerAdUrl = useMemo(() => {
    return resolvedAdConfig && !waterfallFailed ? undefined : adUrl ? appendParamsToUrl(adUrl) : undefined;
  }, [adUrl, resolvedAdConfig, waterfallFailed]);
  useEffect(() => {
    baseContextManager.registerVideo({ videoId });
    return () => {
      baseContextManager.unregisterVideo(videoId);
    };
  }, [baseContextManager]);

  useEffect(() => {
    if (!muted) {
      audioManager.notifyPlaying(id);
    }
  }, [muted]);

  const analyticsEventData = useMemo(() => {
    return {
      content_category: "loop",
      content_id: videoId,
      event_record_screen: "feed",
      event_target_screen: "none",
      total_videos: totalVideos,
      position_index: positionIndex,
      autoplay: video.videoAutoplay,
      title: videoDescription,
      section_title: sectionTitle,
      section_subtitle: sectionSubtitle,
      section_id: sectionId,
      podcast_id: podcastId,
      station_id: stationId,
      video_id: videoId,
      video_url: src,
      video_type: videoType ?? VideoTypes.Content,
      ...(isSponsored && {
        ad_type: "sponsored_post",
        cpm_rate: sponsorshipInfo?.cpm,
        sponsorship_id: sponsorshipInfo?.id,
      }),
    };
  }, [
    videoId,
    totalVideos,
    src,
    isSponsored,
    sectionTitle,
    sectionSubtitle,
    sectionId,
    podcastId,
    stationId,
  ]);

  const adAnalyticsData = useMemo(
    () => ({
      video_id: videoId,
      ad_source: adsPlatform,
      ad_type: "in_stream",
      video_type: videoType,
    }),
    [videoId, adsPlatform, videoType]
  );

  useEffect(() => {
    if (!playerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track(EventName.VIDEO_INVIEW, analyticsEventData);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(playerRef.current);
    return () => observer.disconnect();
  }, [videoId, analyticsEventData]);

  useEffect(() => {
    if (!isActive && isAdFilled) {
      setIsAdFilled(false);
    }
  }, [isActive, isAdFilled]);

  // Single subscription on V2's imperative <video> ref. Replaces 27 callback
  // props (Phase 5: V2 went DOM-only). Re-attaches when analytics deps change
  // so closures stay current. The ref itself is stable across V2 src swaps —
  // VideoRegistry hands out the same long-lived element.
  useEffect(() => {
    const videoEl = videoElState ?? playerRef.current;
    if (!videoEl) return;

    let playStartTime = -1;

    const buildAdEventData = (detail: any) => ({
      ad_id: detail?.adId,
      cta_url: detail?.url,
      cta_name: detail?.title,
      ad_source: adsPlatform,
      ad_format: detail?.adFormat,
      advertiser_brand_id: detail?.advertiserBrandId,
      campaign_id: detail?.campaignId,
      line_item_id: detail?.lineItemId,
      creative_id: detail?.creativeId,
      media_type: detail?.mediaType,
    });

    const handlePlay = (event: Event) => {
      console.warn("[FeedPlayer] handlePlay", { videoId, event });
      playStartTime = performance.now();
      onPlay?.(event);
      setPlayingState("PLAYING");
      baseContextManager.setVideoWatched({ isWatched: false, videoId });
    };

    const handlePause = (event: Event) => {
      console.warn("[FeedPlayer] handlePause", { videoId, event });
      onPause?.(event);
      setPlayingState("PAUSED");
    };

    const handleTimeUpdate = (event: Event) => {
      onTimeUpdate?.(event);
      const target = event.target as HTMLVideoElement | null;
      if (!target) return;
      setVideoTimeState({ duration: target.duration, currentTime: target.currentTime });
      baseContextManager.setTimeInfo({
        duration: target.duration,
        currentTime: target.currentTime,
        videoId,
      });
    };

    const handleLoadStart = () => {
      console.warn("[FeedPlayer] handleLoadStart", { videoId });
      setIsLoading(true);
    };

    const handlePlaying = () => {
      console.warn("[FeedPlayer] handlePlaying", { videoId });
      setIsLoading(false);
    };

    // `loadstart` sets isLoading=true, but `playing` only fires when the video
    // actually starts decoding frames. A video that loads while paused
    // (autoplay blocked, or paused before first play) never fires `playing`,
    // leaving isLoading stuck true and dead-locking togglePlay. Clear the flag
    // as soon as the element is ready/can't progress so the toggle works.
    const handleLoadingResolved = () => {
      setIsLoading(false);
    };

    const handleMuteChange = (e: Event) => {
      console.warn("[FeedPlayer] handleMuteChange", { videoId, detail: (e as CustomEvent).detail });
      const isMuted = (e as CustomEvent<{ muted: boolean }>).detail.muted;
      if (isMuted) {
        mute(false);
      } else {
        unmute(false);
        audioManager.notifyPlaying(id);
      }
    };

    const handlePlayerReady = () => {
      console.warn("[FeedPlayer] handlePlayerReady", { videoId });
      setPlayingState("READY");
      if (feedPlayerShouldPlay) {
        baseContextManager.setVideoWatched({ videoId, isWatched: false });
      }
    };

    const handleVideoStart = (e: Event) => {
      console.warn("[FeedPlayer] handleVideoStart", { videoId, detail: (e as CustomEvent).detail });
      const { duration, currentTime, latency } = (
        e as CustomEvent<{ duration: number; currentTime: number; latency: number }>
      ).detail;
      track(EventName.VIDEO_STARTED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
        start_position: currentTime,
        latency,
      });
      // playStartTime is captured locally for symmetry; V2 already computed latency.
      void playStartTime;
    };

    const handleQuartile =
      (
        eventName:
          | typeof EventName.VIDEO_FIRST_QUARTILE
          | typeof EventName.VIDEO_MIDPOINT
          | typeof EventName.VIDEO_THIRD_QUARTILE
          | typeof EventName.VIDEO_WATCHED
      ) =>
      (e: Event) => {
        console.warn("[FeedPlayer] handleQuartile", { videoId, eventName, detail: (e as CustomEvent).detail });
        const { duration, currentTime } = (e as CustomEvent<{ duration: number; currentTime: number }>).detail;
        track(eventName, {
          ...analyticsEventData,
          video_length: duration,
          video_view_length: currentTime,
        });
      };
    const handleQuartileFirst = handleQuartile(EventName.VIDEO_FIRST_QUARTILE);
    const handleQuartileMid = handleQuartile(EventName.VIDEO_MIDPOINT);
    const handleQuartileThird = handleQuartile(EventName.VIDEO_THIRD_QUARTILE);
    const handleQuartileWatched = handleQuartile(EventName.VIDEO_WATCHED);

    const handleContentEnded = () => {
      console.warn("[FeedPlayer] handleContentEnded", { videoId });
      const target = playerRef.current;
      onEnded?.({ target });
      stateHandleEnded?.();
      track(EventName.VIDEO_COMPLETED, {
        ...analyticsEventData,
        video_length: target?.duration,
        video_view_length: target?.currentTime,
      });
      // Match V1's `tryCallingEnd` auto-replay so V2 also loops on natural
      // end. V1's own loop already ran via its internal `tryCallingEnd`
      // (seek currentTime to 0 → V1's [play] effect retriggers
      // playThePlayer) before this listener fires; the `play()` below
      // is a redundant no-op there (V1 is already playing again).
      // For V2 there's no built-in loop, so without this an isolated
      // tile would freeze at the last frame whenever the consumer's
      // `stateHandleEnded` doesn't advance to a new slide.
      // When a real feed consumer DOES advance, this FeedPlayer instance
      // unmounts before `play()` resolves and the call dies on the
      // detached element — also a no-op.
      // Browser-native: calling `play()` on an `ended` element implicitly
      // seeks to 0, so no explicit `currentTime = 0` needed.
      if (target) {
        void target.play().catch(() => {
          // Autoplay policy may block the replay without a user gesture
          // (e.g. muted video unmuted just before end). Nothing to do —
          // the next user interaction will resume.
        });
      }
    };

    const handleAdRequested = () => {
      console.warn("[FeedPlayer] handleAdRequested", { videoId });
      track(EventName.AD_REQUESTED, { ...adAnalyticsData });
    };
    const handleAdResponseReceived = () => {
      console.warn("[FeedPlayer] handleAdResponseReceived", { videoId });
      track(EventName.AD_RESPONSE_RECEIVED, { ...adAnalyticsData });
    };
    const handleAdRequestFailed = () => {
      console.warn("[FeedPlayer] handleAdRequestFailed", { videoId });
      track(EventName.AD_REQUEST_FAILED, { ...adAnalyticsData });
    };
    const handleAdRendered = (e: Event) => {
      console.warn("[FeedPlayer] handleAdRendered", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      track(EventName.AD_RENDERED, {
        ...adAnalyticsData,
        ...buildAdEventData(detail),
        video_id: videoId,
      });
    };
    const handleAdImpression = (e: Event) => {
      console.warn("[FeedPlayer] handleAdImpression", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      track(EventName.AD_IMPRESSION, { ...adAnalyticsData, ...buildAdEventData(detail) });
    };
    const handleAdStarted = (e: Event) => {
      console.warn("[FeedPlayer] handleAdStarted", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      track(EventName.AD_STARTED, { ...adAnalyticsData, ...buildAdEventData(detail) });
      track(EventName.AD_MEDIA_PLAY, {
        ...buildAdEventData(detail),
        video_id: videoId,
        cta_url: detail?.url,
        cta_name: detail?.title,
        video_type: videoType,
      });
      onAdFilled?.("video");
      updateAdInfo(true, detail);
    };
    const handleAdFirstQuartile = (e: Event) => {
      console.warn("[FeedPlayer] handleAdFirstQuartile", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      track(EventName.AD_MEDIA_QUARTILE, { ...adAnalyticsData, ...buildAdEventData(detail) });
    };
    const handleAdPause = (e: Event) => {
      console.warn("[FeedPlayer] handleAdPause", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      track(EventName.AD_PAUSED, { ...adAnalyticsData, ...buildAdEventData(detail) });
    };
    const handleAdClicked = (e: Event) => {
      console.warn("[FeedPlayer] handleAdClicked", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      track(EventName.AD_CTA_CLICKED, { ...adAnalyticsData, ...buildAdEventData(detail) });
    };
    const handleAdSkipped = (e: Event) => {
      console.warn("[FeedPlayer] handleAdSkipped", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      updateAdInfo(false, detail);
      onAdPlaybackEnd?.();
      track(EventName.AD_SKIPPED, {
        ...adAnalyticsData,
        ...buildAdEventData(detail),
        video_id: videoId,
      });
    };

    const handleAdCompleted = (e: Event) => {
      console.warn("[FeedPlayer] handleAdCompleted", { videoId, detail: (e as CustomEvent).detail });
      const detail = (e as CustomEvent).detail;
      track(EventName.AD_COMPLETED, { ...adAnalyticsData, ...buildAdEventData(detail) });
      onAdPlaybackEnd?.();
      updateAdInfo(false, detail);
    };

    const handleAdError = (error: any) => {
      console.error("Ad error for videoId:", videoId, "Error:", error);
      // Update ad info to reflect error state
      updateAdInfo(false, error);
      track(EventName.AD_ERROR, { ...adAnalyticsData, video_id: videoId });
    };

    const handleAdSkippableChanged = (e: Event) => {
      const { isSkippable } = (e as CustomEvent<{ isSkippable: boolean }>).detail ?? { isSkippable: false };
      updateAdSkippable(!!isSkippable);
    };

    const handleBrowserRestrictionPause = () => {
      console.warn("[FeedPlayer] handleBrowserRestrictionPause", { videoId });
      pauseBySystem();
    };

    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("pause", handlePause);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    videoEl.addEventListener("loadstart", handleLoadStart);
    videoEl.addEventListener("playing", handlePlaying);
    videoEl.addEventListener("canplay", handleLoadingResolved);
    videoEl.addEventListener("error", handleLoadingResolved);
    videoEl.addEventListener("abort", handleLoadingResolved);
    videoEl.addEventListener("emptied", handleLoadingResolved);
    videoEl.addEventListener("genuin:mute-change", handleMuteChange);
    videoEl.addEventListener("genuin:player-ready", handlePlayerReady);
    videoEl.addEventListener("genuin:video-start", handleVideoStart);
    videoEl.addEventListener("genuin:quartile-first", handleQuartileFirst);
    videoEl.addEventListener("genuin:quartile-mid", handleQuartileMid);
    videoEl.addEventListener("genuin:quartile-third", handleQuartileThird);
    videoEl.addEventListener("genuin:quartile-watched", handleQuartileWatched);
    videoEl.addEventListener("genuin:content-ended", handleContentEnded);
    videoEl.addEventListener("genuin:ad-requested", handleAdRequested);
    videoEl.addEventListener("genuin:ad-response-received", handleAdResponseReceived);
    videoEl.addEventListener("genuin:ad-request-failed", handleAdRequestFailed);
    videoEl.addEventListener("genuin:ad-rendered", handleAdRendered);
    videoEl.addEventListener("genuin:ad-impression", handleAdImpression);
    videoEl.addEventListener("genuin:ad-started", handleAdStarted);
    videoEl.addEventListener("genuin:ad-first-quartile", handleAdFirstQuartile);
    videoEl.addEventListener("genuin:ad-pause", handleAdPause);
    videoEl.addEventListener("genuin:ad-clicked", handleAdClicked);
    videoEl.addEventListener("genuin:ad-skipped", handleAdSkipped);
    videoEl.addEventListener("genuin:ad-completed", handleAdCompleted);
    videoEl.addEventListener("genuin:ad-error", handleAdError);
    videoEl.addEventListener("genuin:ad-skippable-changed", handleAdSkippableChanged);
    videoEl.addEventListener("videoPausedByBrowserRestriction", handleBrowserRestrictionPause);

    return () => {
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("pause", handlePause);
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
      videoEl.removeEventListener("loadstart", handleLoadStart);
      videoEl.removeEventListener("playing", handlePlaying);
      videoEl.removeEventListener("canplay", handleLoadingResolved);
      videoEl.removeEventListener("error", handleLoadingResolved);
      videoEl.removeEventListener("abort", handleLoadingResolved);
      videoEl.removeEventListener("emptied", handleLoadingResolved);
      videoEl.removeEventListener("genuin:mute-change", handleMuteChange);
      videoEl.removeEventListener("genuin:player-ready", handlePlayerReady);
      videoEl.removeEventListener("genuin:video-start", handleVideoStart);
      videoEl.removeEventListener("genuin:quartile-first", handleQuartileFirst);
      videoEl.removeEventListener("genuin:quartile-mid", handleQuartileMid);
      videoEl.removeEventListener("genuin:quartile-third", handleQuartileThird);
      videoEl.removeEventListener("genuin:quartile-watched", handleQuartileWatched);
      videoEl.removeEventListener("genuin:content-ended", handleContentEnded);
      videoEl.removeEventListener("genuin:ad-requested", handleAdRequested);
      videoEl.removeEventListener("genuin:ad-response-received", handleAdResponseReceived);
      videoEl.removeEventListener("genuin:ad-request-failed", handleAdRequestFailed);
      videoEl.removeEventListener("genuin:ad-rendered", handleAdRendered);
      videoEl.removeEventListener("genuin:ad-impression", handleAdImpression);
      videoEl.removeEventListener("genuin:ad-started", handleAdStarted);
      videoEl.removeEventListener("genuin:ad-first-quartile", handleAdFirstQuartile);
      videoEl.removeEventListener("genuin:ad-pause", handleAdPause);
      videoEl.removeEventListener("genuin:ad-clicked", handleAdClicked);
      videoEl.removeEventListener("genuin:ad-skipped", handleAdSkipped);
      videoEl.removeEventListener("genuin:ad-completed", handleAdCompleted);
      videoEl.removeEventListener("genuin:ad-error", handleAdError);
      videoEl.removeEventListener("genuin:ad-skippable-changed", handleAdSkippableChanged);
      videoEl.removeEventListener("videoPausedByBrowserRestriction", handleBrowserRestrictionPause);
    };
  }, [
    videoElState,
    analyticsEventData,
    adAnalyticsData,
    adsPlatform,
    videoId,
    videoType,
    baseContextManager,
    feedPlayerShouldPlay,
    id,
    mute,
    unmute,
    onAdFilled,
    onAdPlaybackEnd,
    onEnded,
    onPause,
    onPlay,
    onTimeUpdate,
    pauseBySystem,
    setIsLoading,
    setPlayingState,
    setVideoTimeState,
    stateHandleEnded,
    track,
    EventName,
    updateAdInfo,
    updateAdSkippable,
  ]);

  const startTime = useMemo(() => baseContextManager.getTimeInfo(videoId).currentTime, [baseContextManager]);

  return (
    <>
      {resolvedAdConfig && (
        // null fallback is correct: the ad overlays the already-painted VideoPlayer
        // below, so there is no blank/black screen while the ad chunk loads.
        <SafeSuspense fallback={null} errorFallback={null}>
          <GenAdContainer
            config={resolvedAdConfig}
            muted={muted}
            isActive={isActive ?? false}
            isVisible={isAdFilled}
            moveToNextVideo={moveToNextVideo}
            videoId={videoId}
            videoType={videoType}
            onAdInit={() => {
              // `onAdInit` fires when the SDK STARTS the waterfall — before any
              // ad is actually filled (see gen-ad.types: "before waterfall
              // resolves"). It is NOT proof an ad will show, so it must NOT
              // change any "ad is present" state. Previously it set
              // isAdFilled/isAdPlaying (and onAdStateChange(true)) here, which
              // unmounts the tile/PiP ControlLayer — and the expand-view
              // control — for the entire waterfall window. When every stage
              // then fails (`[GenAd] stage fail`) and the SDK emits no terminal
              // `onWaterfallFail`, the control stays dead permanently. The real
              // "ad present" signals are `onAdFilled` (stage success) and the
              // `genuin:ad-started` playback event; recovery is `onAdFillFailed`
              // / `genuin:ad-error`. Keep this a no-op so a failing waterfall
              // never disables expand.
            }}
            onAdFilled={(provider) => {
              setIsAdFilled(true);
              onAdStateChange?.(true);
              onAdFilled?.(provider);
              updateAdInfo(true, {
                adId: provider,
                url: null,
                title: null,
                totalAds: 1,
                currentAdIndex: 1,
              });
            }}
            onAdFillFailed={() => {
              setIsAdFilled(false);
              setWaterfallFailed(true);
              onAdStateChange?.(false);
              updateAdInfo(false, {
                adId: null,
                url: null,
                title: null,
                totalAds: 0,
                currentAdIndex: 0,
              });
            }}
            onAdCompleted={() => {
              setIsAdFilled(false);
              onAdPlaybackEnd?.();
            }}
            onSystemMuteChange={(isMuted) => {
              if (isMuted) {
                mute(false);
              } else {
                unmute(false);
              }
            }}
          />
        </SafeSuspense>
      )}
      {!isAdFilled &&
        (resolvedPlayerImpl === "v1" ? (
          /*
           * V1 path — legacy `<VideoPlayer>` (OpenPlayerJS, per-instance
           * `<video>`). We translate V1's React callbacks back into the same
           * `CustomEvent`-shaped objects the V2 listener-effect already
           * consumes, then forward them via `dispatchEvent` on the imperative
           * video ref. That way every analytics / PlayerContext side-effect
           * stays in one place (the V2 useEffect above) instead of being
           * duplicated per-impl.
           */
          <VideoPlayer
            ref={handlePlayerRef}
            poster={poster ?? ""}
            muted={muted}
            adUrl={videoPlayerAdUrl}
            // NB: `adPlatform` and `isActive` are declared in V1's
            // PlayerProps type but V1 doesn't destructure them
            // ([video-player.tsx:69-114]) — they'd fall into V1's
            // internal `...props` and spread onto `<video>`, producing
            // React DOM-attribute warnings. Pass them only if V1 ever
            // starts consuming them.
            src={src}
            startTime={startTime}
            playsInline
            isInFeed
            enableLazyLoading={useWindowSwiperMode}
            className={cn(
              "gencl:m-auto",
              resolvedAdConfig && isAdFilled && "gencl:opacity-0 gencl:pointer-events-none",
              className
            )}
            volume={volume}
            play={feedPlayerShouldPlay}
            playbackSpeed={playbackSpeed?.speed}
            onPlay={(e) => onPlay?.(e.nativeEvent)}
            onPause={(e) => onPause?.(e.nativeEvent)}
            onTimeUpdate={(e) => onTimeUpdate?.(e.nativeEvent)}
            onEnded={(payload) => {
              // Re-emit V2's `genuin:content-ended` synthetic event on the
              // ref so the listener-effect's `handleContentEnded` runs.
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:content-ended"));
              // Also forward the parent-level onEnded callback for callers
              // that prefer the V1-style `{ target }` payload directly.
              // V1's `onEnded` can hand either a React SyntheticEvent or
              // `{ target }` depending on the call path inside `<VideoPlayer>`;
              // normalise to the FeedPlayer prop shape.
              const target =
                payload && "target" in payload
                  ? (payload.target as HTMLVideoElement | null)
                  : (playerRef.current ?? null);
              onEnded?.({ target });
            }}
            onPlayerLoad={() => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:player-ready"));
            }}
            onVideoStart={(duration, currentTime, latency) => {
              const el = playerRef.current;
              if (el)
                el.dispatchEvent(new CustomEvent("genuin:video-start", { detail: { duration, currentTime, latency } }));
            }}
            onMutedChange={(isMuted) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:mute-change", { detail: { muted: isMuted } }));
            }}
            // NB: deliberately no `onVideoLoadStart` / `onVideoLoadEnd`
            // bridges. V1's `<video>` element fires `loadstart` and
            // `playing` events natively, and FeedPlayer's listener-effect
            // above already subscribes to those native event names on the
            // imperative ref. Dispatching synthetic copies inside V1's
            // onVideoLoadStart/onVideoLoadEnd would loop V1's own
            // `handlePlaying` / load handlers back through the same
            // callbacks (the handler that fires them) — instant
            // RangeError "Maximum call stack size exceeded" on the first
            // playback after a toggle.
            onVideoFirstQuartile={(duration, currentTime) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:quartile-first", { detail: { duration, currentTime } }));
            }}
            onVideoMidpoint={(duration, currentTime) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:quartile-mid", { detail: { duration, currentTime } }));
            }}
            onVideoThirdQuartile={(duration, currentTime) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:quartile-third", { detail: { duration, currentTime } }));
            }}
            onVideoWatched={(duration, currentTime) => {
              const el = playerRef.current;
              if (el)
                el.dispatchEvent(new CustomEvent("genuin:quartile-watched", { detail: { duration, currentTime } }));
            }}
            onAdRequested={() => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-requested"));
            }}
            onAdResponseReceived={() => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-response-received"));
            }}
            onAdRequestFailed={() => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-request-failed"));
            }}
            onAdRendered={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-rendered", { detail: adData }));
            }}
            onAdImpression={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-impression", { detail: adData }));
            }}
            onAdStarted={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-started", { detail: adData }));
            }}
            onAdFirstQuartile={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-first-quartile", { detail: adData }));
            }}
            onAdPause={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-pause", { detail: adData }));
            }}
            onAdClicked={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-clicked", { detail: adData }));
            }}
            onAdSkipped={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-skipped", { detail: adData }));
            }}
            onAdCompleted={(adData: AdDataType) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-completed", { detail: adData }));
            }}
            onAdError={(err) => {
              const el = playerRef.current;
              if (el) el.dispatchEvent(new CustomEvent("genuin:ad-error", { detail: err }));
            }}
            {...props}
          />
        ) : (
          <VideoPlayerV2
            ref={handlePlayerRef}
            poster={poster}
            muted={muted}
            adUrl={videoPlayerAdUrl}
            isActive={isActive}
            src={src}
            startTime={startTime}
            playsInline
            enableLazyLoading={useWindowSwiperMode}
            className={cn(
              "gencl:m-auto",
              resolvedAdConfig && isAdFilled && "gencl:opacity-0 gencl:pointer-events-none",
              className
            )}
            volume={volume}
            play={feedPlayerShouldPlay}
            playbackSpeed={playbackSpeed?.speed}
            {...props}
          />
        ))}
    </>
  );
});
