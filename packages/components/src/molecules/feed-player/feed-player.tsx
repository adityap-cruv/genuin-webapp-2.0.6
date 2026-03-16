"use client";
import { VideoPlayer } from "@genuin/ui/components/video-player";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ComponentProps,
} from "react";
import { useBaseContext } from "@genuin/components/context/base";
import { audioManager } from "@genuin/components/lib/audio-manager";
import { usePlayerContext } from "./context/context";
import { useAnalytics, VideoTypes } from "@genuin/components/context/analytics";
import { cn } from "@genuin/ui/lib/utils";
import { BrandType } from "@genuin/components/lib/utils/brand-layout";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

type FeedPlayerProps = Omit<
  ComponentProps<typeof VideoPlayer>,
  "volume" | "playbackSpeed" | "shouldPlay"
> & {
  /**
   * The id of the video to passed to analytics.
   */
  videoId: string;
  /**
   * Descritption to pass to analytics.
   */
  videoDescription?: string | null;
  /**
   * Defines the layout style for the embed, used to identify and apply the corresponding brand layout.
   */
  layoutType?: "responsiveness" | BrandType;
  /**
   * Index is needed so passing it.
   */
  index?: number;
  videoType: VideoTypes;
};

/**
 * This is feed player, However this player is used for embed as well, so don't confuse it as it is only used in feed.
 */
export const FeedPlayer = memo(function FeedPlayer({
  src,
  videoId,
  adUrl,
  poster,
  className,
  layoutType,
  videoDescription,
  index,
  onOpenPlayerReady,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  onLoadStart,
  videoType,
  ...props
}: FeedPlayerProps) {
  // adUrl = undefined;
  const { muted, volume, playbackSpeed, baseContextManager } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const {
    feedPlayerShouldPlay,
    setVideoTimeState,
    setPlayingState,
    setPlayerRef,
    mute,
    unmute,
    handleEnded: stateHandleEnded,
    updateAdInfo,
    totalVideos,
    positionIndex,
    setIsLoading,
    showExpandView,
  } = usePlayerContext();
  const { track, EventName } = useAnalytics();
  const id = useId();
  const playerRef = useRef<HTMLVideoElement>(null);
  const {
    view: { brandLayoutType },
    video,
    useWindowSwiperMode,
  } = useEmbedConfigs();

  // TODO: this is temporary code for qa-testing, need to remove once qa is done.
  adUrl = useMemo(
    () => embedDetails?.rootElement?.getAttribute("data-ad-url") ?? adUrl,
    [adUrl],
  );

  useEffect(() => {
    baseContextManager.registerVideo({
      videoId,
    });

    return () => {
      baseContextManager.unregisterVideo(videoId);
    };
  }, [baseContextManager]);

  useEffect(() => {
    // this is the key line — fire unmute when this player unmutes
    if (!muted) {
      audioManager.notifyPlaying(id);
      //  unmute(false);
    }
  }, [muted]);

  // DRY: Common analytics event data (memoized)
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
      video_id: videoId,
      video_url: src,
      video_type: videoType,
    };
  }, [videoId, totalVideos, src, videoType]);

  // Track when video comes into view using IntersectionObserver
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
      {
        threshold: 0.5,
      },
    );

    observer.observe(playerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [videoId, analyticsEventData]);

  const handleMutedChange = useCallback(
    (isMuted: boolean) => {
      if (isMuted) {
        mute(false);
      } else {
        unmute(false);
        audioManager.notifyPlaying(id);
      }
    },
    [mute, unmute, id],
  );

  const handleTimeUpdate = useCallback(
    (event: any) => {
      onTimeUpdate?.(event);
      const target = event.target as HTMLVideoElement;
      if (!target) return;
      setVideoTimeState({
        duration: target.duration,
        currentTime: target.currentTime,
      });
      baseContextManager.setTimeInfo({
        duration: target.duration,
        currentTime: target.currentTime,
        videoId,
      });
    },
    [baseContextManager],
  );

  const handleEnded = useCallback(
    (e: any) => {
      onEnded?.({ target: e?.target });
      stateHandleEnded?.();
      const target = e?.target as HTMLVideoElement | undefined;
      track(EventName.VIDEO_COMPLETED, {
        ...analyticsEventData,
        video_length: target?.duration,
        video_view_length: target?.currentTime,
      });
    },
    [onEnded, stateHandleEnded, track, EventName, analyticsEventData],
  );

  const handlePlayerLoad = useCallback(
    (player: any) => {
      if (feedPlayerShouldPlay) {
        player.play();
        baseContextManager.setVideoWatched({ videoId, isWatched: false });
      }
      setPlayingState("READY");
    },
    [feedPlayerShouldPlay, id, baseContextManager, videoId],
  );

  const handleVideoFirstQuartile = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_FIRST_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleVideoWatched = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_WATCHED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleVideoMidpoint = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_MIDPOINT, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleVideoThirdQuartile = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_THIRD_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData],
  );

  const handleOpenPlayerReady = useCallback(
    (player: any) => {
      onOpenPlayerReady?.(player);
      setPlayerRef(player);
    },
    [onOpenPlayerReady, setPlayerRef],
  );

  const handleOnPlay = useCallback(
    (event: any) => {
      onPlay?.(event);
      setPlayingState("PLAYING");
      if (
        index !== undefined &&
        !baseContextManager.checkIfVideoPreviewActive({ index })
      ) {
        baseContextManager.setPlayPauseTracker({ isPlaying: true });
      }
      baseContextManager.setVideoWatched({ isWatched: false, videoId });
    },
    [onPlay, setPlayingState, baseContextManager, videoId],
  );

  const handleOnPause = useCallback(
    (event: any) => {
      onPause?.(event);
      setPlayingState("PAUSED");
    },
    [onPause, setPlayingState],
  );
  const handleVideoStart = useCallback(
    (duration: number, currentTime: number, latency: number) => {
      track(EventName.VIDEO_STARTED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
        latency: latency,
      });
    },
    [track, EventName.VIDEO_STARTED, analyticsEventData],
  );

  const handleAdStarted = useCallback(
    (event: any) => {
      track(EventName.AD_STARTED, {
        ad_id: event?.adId,
        video_id: videoId,
        cta_url: event?.url,
        cta_name: event?.title,
      });
      // Handle ad started event if needed
      updateAdInfo(true, event);
    },
    [updateAdInfo, track],
  );

  const handleAdCompleted = useCallback(
    (event: any) => {
      track(EventName.AD_COMPLETED, {
        ad_id: event?.adId,
        video_id: videoId,
        cta_url: event?.url,
        cta_name: event?.title,
      });
      // Handle ad ended event if needed
      updateAdInfo(false, event);
    },
    [updateAdInfo, track, videoId],
  );

  const handleAdSkipped = useCallback(
    (event: any) => {
      // Handle ad skipped event if needed
      updateAdInfo(false, event);
    },
    [updateAdInfo],
  );

  const handleAdError = useCallback(
    (error: any) => {
      // Handle ad error event - ensure playback continues
      console.error("Feed Player - Ad error occurred:", {
        errorType: error?.getType?.(),
        errorCode: error?.getErrorCode?.(),
        message: error?.getMessage?.(),
      });

      // Update ad info to reflect error state
      updateAdInfo(false, error);

      // We could track ad errors here with a custom event when needed
      // For now, we just log and continue playback gracefully

      // Note: The VideoPlayer component now handles error recovery internally
      // using discardAdBreak() for individual ad failures or destroy() for fatal errors
    },
    [updateAdInfo],
  );

  const handleAdClicked = useCallback(
    (event: any) => {
      // Handle ad clicked event if needed
      track(EventName.AD_CTA_CLICKED, {
        ad_id: event?.adId,
        video_id: videoId,
        cta_url: event?.url,
        cta_name: event?.title,
      });
    },
    [track, videoId],
  );

  // Handle video load start - set playing state to LOADING
  const handleVideoLoadStart = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  // Handle video load end - playing state will be updated by onPlay/onPause handlers
  const handleVideoLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleAdPaused = useCallback(
    (event: any) => {
      track(EventName.AD_PAUSED, {
        ad_id: event?.adId,
        video_id: videoId,
        cta_url: event?.url,
        cta_name: event?.title,
      });
    },
    [track, videoId],
  );

  // If the videoid is registered already start it with that start tiime.
  const startTime = useMemo(
    () => baseContextManager.getTimeInfo(videoId).currentTime,
    [baseContextManager],
  );

  return (
    <VideoPlayer
      ref={playerRef}
      poster={poster}
      muted={muted}
      adUrl={adUrl}
      // adUrl="https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator="
      src={src}
      startTime={startTime}
      playsInline
      enableLazyLoading={useWindowSwiperMode}
      className={cn("gencl:m-auto", className)}
      volume={volume}
      play={feedPlayerShouldPlay}
      playbackSpeed={playbackSpeed?.speed}
      isInExpandView={showExpandView}
      onPlayerLoad={handlePlayerLoad}
      onOpenPlayerReady={handleOpenPlayerReady}
      onPlay={handleOnPlay}
      onPause={handleOnPause}
      onEnded={handleEnded}
      onTimeUpdate={handleTimeUpdate}
      onVideoFirstQuartile={handleVideoFirstQuartile}
      onVideoMidpoint={handleVideoMidpoint}
      onVideoThirdQuartile={handleVideoThirdQuartile}
      onVideoWatched={handleVideoWatched}
      onVideoStart={handleVideoStart}
      onAdStarted={handleAdStarted}
      onAdCompleted={handleAdCompleted}
      onAdSkipped={handleAdSkipped}
      onAdError={handleAdError}
      onAdClicked={handleAdClicked}
      onMutedChange={handleMutedChange}
      onVideoLoadStart={handleVideoLoadStart}
      onVideoLoadEnd={handleVideoLoadEnd}
      onAdPause={handleAdPaused}
      {...props}
    />
  );
});
