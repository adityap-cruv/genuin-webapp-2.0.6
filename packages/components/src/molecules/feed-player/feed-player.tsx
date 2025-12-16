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
import { useAnalytics } from "@genuin/components/context/analytics";
import { cn } from "@genuin/ui/lib/utils";
import { BrandType } from "@genuin/components/lib/utils/brand-layout";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

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
  ...props
}: FeedPlayerProps) {
  const { muted, volume, playbackSpeed, baseContextManager } = useBaseContext();
  // const embedDetails = useSafeEmbedContext();
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
  } = usePlayerContext();
  const { track, EventName } = useAnalytics();
  const id = useId();
  const playerRef = useRef<HTMLVideoElement>(null);
  const {
    view: { brandLayoutType },
    video,
    useWindowSwiperMode,
  } = useEmbedConfigs();

  useEffect(() => {
    baseContextManager.registerVideo({
      videoId,
    });

    return () => {
      baseContextManager.unregisterVideo(videoId);
    };
  }, [baseContextManager]);

  useEffect(() => {
    // If brand layout is iheart, do not register video
    // TODO: refactor audio manager befor merging iheart branch in develop, otherwise it will break iheart feed player.
    if (brandLayoutType === "iheart") return;

    audioManager.register(id, () => {
      mute(false);
    });
    return () => {
      audioManager.unregister(id);
    };
  }, [id]);

  useEffect(() => {
    // If brand layout is iheart, do not register video
    // TODO: refactor audio manager befor merging iheart branch in develop, otherwise it will break iheart feed player.
    if (brandLayoutType === "iheart") return;

    // this is the key line — fire unmute when this player unmutes
    if (!muted) {
      audioManager.notifyPlaying(id);
      unmute(false);
    } else {
      mute(false);
    }
  }, [muted]);

  // Handle playback speed changes
  useEffect(() => {
    if (playerRef.current && playbackSpeed?.speed) {
      playerRef.current.playbackRate = playbackSpeed.speed;
    }
  }, [playbackSpeed]);

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
    };
  }, [videoId, totalVideos, src]);

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
      }
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
    [mute, unmute, id]
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
    [baseContextManager]
  );

  const handleEnded = useCallback(
    (e: any) => {
      onEnded?.(e);
      stateHandleEnded?.();
      const target = e?.target as HTMLVideoElement | undefined;
      track(EventName.VIDEO_COMPLETED, {
        ...analyticsEventData,
        video_length: target?.duration,
        video_view_length: target?.currentTime,
      });
    },
    [onEnded, stateHandleEnded, track, EventName, analyticsEventData]
  );

  const handlePlayerLoad = useCallback(
    (player: any) => {
      if (feedPlayerShouldPlay) {
        audioManager.notifyPlaying(id);
        player.play();
        baseContextManager.setVideoWatched({ videoId, isWatched: false });
      }
      setPlayingState("READY");
    },
    [feedPlayerShouldPlay, id, baseContextManager, videoId]
  );

  const handleVideoFirstQuartile = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_FIRST_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData]
  );

  const handleVideoWatched = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_WATCHED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData]
  );

  const handleVideoMidpoint = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_MIDPOINT, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData]
  );

  const handleVideoThirdQuartile = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_THIRD_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [track, EventName, analyticsEventData]
  );

  const handleOpenPlayerReady = useCallback(
    (player: any) => {
      onOpenPlayerReady?.(player);
      setPlayerRef(player);
    },
    [onOpenPlayerReady, setPlayerRef]
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
    [onPlay, setPlayingState, baseContextManager, videoId]
  );

  const handleOnPause = useCallback(
    (event: any) => {
      onPause?.(event);
      setPlayingState("PAUSED");
    },
    [onPause, setPlayingState]
  );

  const handleVideoStart = useCallback(
    (duration: number, currentTime: number) => {
      track(EventName.VIDEO_STARTED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
        // latency: latency,
      });
    },
    [track, EventName.VIDEO_STARTED, analyticsEventData]
  );

  const handleAdStarted = useCallback((event: any) => {
    // Handle ad started event if needed
    console.log("Ad started", event);
    updateAdInfo(true, event);
  }, []);

  const handleAdCompleted = useCallback((event: any) => {
    // Handle ad ended event if needed
    console.log("Ad ended", event);
    updateAdInfo(false, event);
  }, []);

  const handleAdSkipped = useCallback((event: any) => {
    // Handle ad skipped event if needed
    console.log("Ad skipped", event);
    updateAdInfo(false, event);
  }, []);

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
    [updateAdInfo]
  );

  const handleAdClicked = useCallback((event: any) => {
    // Handle ad clicked event if needed
    console.log("Ad clicked", event);
  }, []);

  // Handle video load start - set playing state to LOADING
  const handleVideoLoadStart = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  // Handle video load end - playing state will be updated by onPlay/onPause handlers
  const handleVideoLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  // If the videoid is registered already start it with that start tiime.
  const startTime = useMemo(
    () => baseContextManager.getTimeInfo(videoId).currentTime,
    [baseContextManager]
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
      playbackSpeed={playbackSpeed?.speed || 1}
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
      {...props}
    />
  );
});
