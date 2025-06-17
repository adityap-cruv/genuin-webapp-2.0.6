import { VideoPlayer } from "@genuin/ui/video-player";
import { memo, useCallback, useEffect, useId, type ComponentProps } from "react";
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
    handleEnded: stateHandleEnded,
    mute,
    unmute,
  } = usePlayerContext();
  const { playbackSpeed } = useFeedContext();
  const Analytics = useAnalytics()
    const id = useId();

    useEffect(() => {
    audioManager.register(id, () => {
      mute(true);
    });
    return () => {
      audioManager.unregister(id);
    };
  }, [id]);
  
  useEffect(() => {
    // this is the key line — fire unmute when this player unmutes
    if (!muted) {
      audioManager.notifyPlaying(id);
      unmute(true);
    } else {
      mute(true);
    }
  }, [muted]);

  const handleTimeUpdate = useCallback((event: any) => {
    onTimeUpdate?.(event);
    const target = event.target as HTMLVideoElement;
    if (!target) return;
    setVideoTimeState({
      duration: target.duration,
      currentTime: target.currentTime,
    });
  }, []);

  const handleEnded = useCallback((e: any) => {
    onEnded?.(e);
    stateHandleEnded?.();
    Analytics.track(Analytics.EventName.VIDEO_COMPLETED, {
      content_id: postDetails.video.id,
    });
  }, []);

  const handlePlayerLoad = useCallback(
    (player: any) => {
      if (feedPlayerShouldPlay) {
        audioManager.notifyPlaying(id);
        player.play();
      }
    },
    [feedPlayerShouldPlay]
  );

  const handleVideoFirstQuartile = useCallback(() => {
    Analytics.track(Analytics.EventName.VIDEO_FIRST_QUARTILE, {
      content_id: postDetails.video.id,
    });
  }, []);

  const handleVideoWatched = useCallback(() => {
    Analytics.track(Analytics.EventName.VIDEO_WATCHED, {
      content_id: postDetails.video.id,
    });
  }, []);

  const handleVideoMidpoint = useCallback(() => {
    Analytics.track(Analytics.EventName.VIDEO_MIDPOINT, {
      content_id: postDetails.video.id,
    });
  }, []);

  const handleVideoThirdQuartile = useCallback(() => {
    Analytics.track(Analytics.EventName.VIDEO_THIRD_QUARTILE, {
      content_id: postDetails.video.id,
    });
  }, []);

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

  const handleVideoStart = useCallback(() => {
    Analytics.track(Analytics.EventName.VIDEO_STARTED, {
      content_id: postDetails.video.id,
    });
  }, []);

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
