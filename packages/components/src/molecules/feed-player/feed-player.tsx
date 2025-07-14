import { VideoPlayer } from "@genuin/ui/video-player";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  type ComponentProps,
} from "react";
import { useBaseContext } from "@genuin/components/context/base";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { audioManager } from "@genuin/components/lib/audio-manager";
import { usePlayerContext } from "./context/context";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { useAnalytics } from "@genuin/components/context/analytics";

type Props = Omit<
  ComponentProps<typeof VideoPlayer>,
  "volume" | "playbackSpeed" | "shouldPlay"
> & {
  postDetails: PostDetailsType;
};

const EVENT_DURATION_PROPERTY_NAME = "video_length";
const EVENT_VIEW_LENGTH_PROPERTY_NAME = "video_view_length";

export const FeedPlayer = memo(function FeedPlayer({
  src,
  poster,
  postDetails,
  onOpenPlayerReady,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPause,
  onLoadStart,
  ...props
}: Props) {
  const { muted, volume } = useBaseContext();
  const {
    feedPlayerShouldPlay,
    setVideoTimeState,
    setPlayingState,
    setPlayerRef,
    mute,
    unmute,
    handleEnded: stateHandleEnded,
  } = usePlayerContext();
  const Analytics = useAnalytics();
  const { playbackSpeed } = useFeedContext();
  const id = useId();

  useEffect(() => {
    audioManager.register(id, () => {
      mute(false);
    });
    return () => {
      audioManager.unregister(id);
    };
  }, [id]);

  useEffect(() => {
    // this is the key line — fire unmute when this player unmutes
    if (!muted) {
      audioManager.notifyPlaying(id);
      unmute(false);
    } else {
      mute(false);
    }
  }, [muted]);

  // DRY: Common analytics event data (memoized)
  const analyticsEventData = useMemo(
    () => ({
      content_category: "loop",
      content_id: postDetails.video.id,
      event_record_screen: "feed",
      event_target_screen: "none",
    }),
    [postDetails.video.id]
  );

  const handleTimeUpdate = useCallback((event: any) => {
    onTimeUpdate?.(event);
    const target = event.target as HTMLVideoElement;
    if (!target) return;
    setVideoTimeState({
      duration: target.duration,
      currentTime: target.currentTime,
    });
  }, []);

  const handleEnded = useCallback(
    (e: any) => {
      onEnded?.(e);
      stateHandleEnded?.();
      const target = e?.target as HTMLVideoElement | undefined;
      Analytics.track(Analytics.EventName.VIDEO_COMPLETED, {
        ...analyticsEventData,
        video_length: target?.duration,
        video_view_length: target?.currentTime,
      });
    },
    [onEnded, stateHandleEnded, Analytics, analyticsEventData]
  );

  const handlePlayerLoad = useCallback(
    (player: any) => {
      if (feedPlayerShouldPlay) {
        audioManager.notifyPlaying(id);
        player.play();
      }
    },
    [feedPlayerShouldPlay]
  );

  const handleVideoFirstQuartile = useCallback(
    (duration: number, currentTime: number) => {
      Analytics.track(Analytics.EventName.VIDEO_FIRST_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [Analytics, analyticsEventData]
  );

  const handleVideoWatched = useCallback(
    (duration: number, currentTime: number) => {
      Analytics.track(Analytics.EventName.VIDEO_WATCHED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [Analytics, analyticsEventData]
  );

  const handleVideoMidpoint = useCallback(
    (duration: number, currentTime: number) => {
      Analytics.track(Analytics.EventName.VIDEO_MIDPOINT, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [Analytics, analyticsEventData]
  );

  const handleVideoThirdQuartile = useCallback(
    (duration: number, currentTime: number) => {
      Analytics.track(Analytics.EventName.VIDEO_THIRD_QUARTILE, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [Analytics, analyticsEventData]
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
    },
    [onPlay, setPlayingState]
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
      Analytics.track(Analytics.EventName.VIDEO_STARTED, {
        ...analyticsEventData,
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [Analytics, analyticsEventData]
  );

  return (
    <VideoPlayer
      poster={poster}
      muted={muted}
      src={src}
      playsInline
      loop={false}
      volume={volume}
      play={feedPlayerShouldPlay}
      playbackSpeed={playbackSpeed.speed}
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
      {...props}
    />
  );
});
