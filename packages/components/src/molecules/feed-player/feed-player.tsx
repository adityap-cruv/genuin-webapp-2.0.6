import { VideoPlayer } from "@genuin/ui/video-player";
import { memo, useCallback, type ComponentProps } from "react";
import { useBaseContext } from "@genuin/components/context/base";
import type { PostDetailsType } from "@react-query/api/feed/schema";

import { usePlayerContext } from "./context/context";
// import { useSwiper } from "swiper/react";

// import { usePlayerContext } from "./context";

type Props = Omit<
  ComponentProps<typeof VideoPlayer>,
  "volume" | "playbackSpeed" | "shouldPlay"
> & {
  postDetails: PostDetailsType;
};

// This function is now only referenced - implementation moved to singleVideoContext
// function triggerAnalyticsForVideoPause(videoId: string) {
//   void Analytics.track({
//     eventName: "Video Paused",
//     properties: {
//       content_category: "loop",
//       content_id: videoId,
//       event_record_screen: "feed",
//       event_target_screen: "none",
//     },
//   });
// }

export const FeedPlayer = memo(function FeedPlayer({
  src,
  poster,
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
  } = usePlayerContext();

  // const { brandId } = useGenuinOptions(
  //   useShallow((state) => ({
  //     brandId: state.brandId,
  //   }))
  // );
  // const {
  //   playerRef,
  //   videoRef,
  //   setTimeState: singleVideoSetTimeState,
  //   playerConfigRef,
  //   resetPlayerConfig,
  //   play: contextPlay,
  // } = usePlayerContext();
  // const {
  //   shouldPlay,
  //   muted,
  //   setTimeState,
  //   volume,
  //   setPlayingState,
  //   setShouldPlay,
  //   playbackSpeed,
  // } = usePlayerControlStore(
  //   useShallow((state) => ({
  //     shouldPlay: state.shouldPlay,
  //     muted: state.muted,
  //     setTimeState: state.setTimeState,
  //     volume: state.volume,
  //     setPlayingState: state.setPlayingState,
  //     toggleMuted: state.toggleMuted,
  //     setShouldPlay: state.setShouldPlay,
  //     playbackSpeed: state.playbackSpeed,
  //   }))
  // );
  // const { showGestureOverlay } = useGestureOverlayManager();
  // const { currentIndex } = useFeedListContext();
  // const swiper = useSwiper();
  // const webConfigs = useGenuinOptions((state) => state.config.web_configs);

  // let encodedVideoSourceUrl = videoSource;
  // if (brandId && brandId.toString() === "1729") {
  //   // Replace the video source URL with the OCITest URL
  //   encodedVideoSourceUrl = encodedVideoSourceUrl.replace(
  //     "media.begenuin.com",
  //     "ocitest.begenuin.com"
  //   );
  // }
  // // Create a URL object to easily access query parameters
  // const videoUrl = new URL(videoSource);
  // // If there are no query parameters meaning either it's m3u8 without query params or mp4 file
  // if (videoUrl.search) {
  //   const { appendParamsToUrl } = useUrlParams();
  //   const macrosUpdatedVideoSource = appendParamsToUrl(videoSource);
  //   encodedVideoSourceUrl = encodeVideoSourceUrl(macrosUpdatedVideoSource);
  // }

  // const initializePlayer = useCallback(
  //   async (player: OpenPlayerJS, playAfterInit: boolean) => {
  //     await player.init();
  //     await player.load();
  //     // setPlayingState(undefined);
  //     if (playAfterInit) {
  //       await contextPlay(player).catch(async (error) => {
  //         console.log("error in player", error);
  //       });
  //     }
  //     return player;
  //   },
  //   [contextPlay, setPlayingState]
  // );

  // useEffect(() => {
  //   // Reset hasStarted when video source changes
  //   // resetPlayerConfig(webConfigs);

  //   if (!videoRef.current) return;
  //   const player = new OpenPlayerJS(videoRef.current, {
  //     controls: {
  //       alwaysVisible: false,
  //     },
  //     mode: "responsive",
  //     forceNative: true,
  //     showLoaderOnInit: true,
  //     onError: (e) => {
  //       console.error(e, "error");
  //     },
  //     hls: hlsConfigs,
  //   });

  //   // Set initial playback speed for the new video
  //   videoRef.current.playbackRate = playbackSpeed.speed;

  //   void initializePlayer(
  //     player,
  //     isActive && playerConfigRef.current.autoplay
  //   ).then((initializedPlayer) => {
  //     playerRef.current = initializedPlayer;

  //     // Ensure playback speed is set after initialization
  //     if (videoRef.current) {
  //       videoRef.current.playbackRate = playbackSpeed.speed;
  //     }
  //   });

  //   if (isActive && !playerConfigRef.current.autoplay) {
  //     setShouldPlay(false);
  //   }
  // }, [videoSource]);

  // useEffect(() => {
  //   const player = playerRef.current;
  //   if (!player) return;

  //   if (isActive) {
  //     if (shouldPlay) {
  //       void contextPlay(player);
  //     } else {
  //       player.pause();
  //     }
  //   } else {
  //     player.pause();
  //   }
  // }, [isActive, shouldPlay, contextPlay]);

  // useEffect(() => {
  //   if (isActive && !playerConfigRef.current.autoplay) {
  //     setShouldPlay(false);
  //   }
  // }, [isActive]);

  // const onTimeUpdateEventHandler: ReactEventHandler<HTMLVideoElement> =
  //   useCallback(
  //     (event: React.SyntheticEvent<HTMLVideoElement>) => {
  //       const video = event.currentTarget;

  //       // setTimeState(video.currentTime, video.duration, id);
  //       singleVideoSetTimeState(video.currentTime, video.duration);

  //       if (video.duration > 0) {
  //         const progress = (video.currentTime / video.duration) * 100;
  //         // if (currentIndex === 1 && progress >= 50) {
  //         //   showGestureOverlay("PLAY_PAUSE", muted);
  //         // }
  //       }
  //     },
  //     []
  //   );

  // const handlePlaying: ReactEventHandler<HTMLVideoElement> = useCallback(
  //   (ev) => {
  //     onPlaying?.(ev);
  //     setPlayingState("playing");
  //   },
  //   [onPlaying, setPlayingState]
  // );

  // const handleError: ReactEventHandler<HTMLVideoElement> = useCallback(
  //   (ev) => {
  //     onError?.(ev);
  //     setPlayingState("paused");
  //   },
  //   [onError, setPlayingState]
  // );

  // const handlePause: ReactEventHandler<HTMLVideoElement> = useCallback(
  //   (ev) => {
  //     onPause?.(ev);
  //     setPlayingState("paused");
  //     triggerAnalyticsForVideoPause(id);
  //   },
  //   [onPause, setPlayingState, id]
  // );

  // const handleEnded: ReactEventHandler<HTMLVideoElement> = useCallback(
  //   (ev) => {
  //     onEnded?.(ev);
  //     const { repeatCount, shouldSwipeNext } = playerConfigRef.current;
  //     if (repeatCount > 0 && playerRef.current) {
  //       playerConfigRef.current.repeatCount--;
  //       void playerRef.current.play();
  //       return;
  //     } else {
  //       resetPlayerConfig(webConfigs);
  //       setShouldPlay(false);
  //     }

  //     if (shouldSwipeNext && swiper) {
  //       resetPlayerConfig(webConfigs);
  //       swiper.slideNext();
  //     }
  //   },
  //   [
  //     onEnded,
  //     playerConfigRef,
  //     resetPlayerConfig,
  //     playerRef,
  //     setShouldPlay,
  //     swiper,
  //     webConfigs,
  //   ]
  // );

  // const handleLoadStart: ReactEventHandler<HTMLVideoElement> = useCallback(
  //   (ev) => {
  //     onLoadStart?.(ev);
  //   },
  //   [onLoadStart]
  // );

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
  }, []);

  const handlePlayerLoad = useCallback(
    (player: any) => {
      if (feedPlayerShouldPlay) {
        player.play();
      }
    },
    [feedPlayerShouldPlay]
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
      playbackSpeed={1}
      onPlayerLoad={handlePlayerLoad}
      onOpenPlayerReady={(player) => {
        onOpenPlayerReady?.(player);
        setPlayerRef(player);
      }}
      onPlay={(event) => {
        // console.log("onPlay::", event);
        onPlay?.(event);
        setPlayingState("PLAYING");
      }}
      onPause={(event) => {
        onPause?.(event);
        setPlayingState("PAUSED");
      }}
      onEnded={handleEnded}
      onTimeUpdate={handleTimeUpdate}
      {...props}
    />
  );
});
