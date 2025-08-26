import React, { useState, useCallback, useRef, useEffect } from "react";
import OpenPlayerJS from "openplayerjs";
import { getVideoPlayerConfigs } from "../utils";
import {
  ButtonActionType,
  ExpandViewProps,
  PlaybackSpeedType,
  // PlaybackSpeedType,
  PlayingStateType,
  VideoTimeStateType,
} from "./types";
import { AdInfoType, PlayerContext, PlayerContextType } from "./context";
import mitt from "mitt";
import { useBaseContext } from "@genuin/components/context/base";
import { useAnalytics } from "@genuin/components/context/analytics";
import { Swiper } from "swiper/types";

type VideoProviderProps = {
  children: React.ReactNode;
  videoId: string;
  /**
   * Function to be called when the player completes it's iteration and is ready to play the next video.
   */
  onPlayerIterationEnd: () => void;
  /**
   * Post list index - used to compare against previous index
   *
   */
  index: number;
  swiper: Swiper;
  /**
   * If player is active or not.
   */
  isActive: boolean;
} & ExpandViewProps;

type PlayerConfigType = ReturnType<typeof getVideoPlayerConfigs>;

function getInitialShouldPlayState(playerConfig: PlayerConfigType) {
  if (playerConfig) {
    if (playerConfig.autoplay) {
      return true;
    }
    if (playerConfig.autoplayAfter) return false;
  }
  return true;
}

export const PlayerProvider: React.FC<VideoProviderProps> = ({
  children,
  videoId,
  showExpandView,
  isActive,
  onPlayerIterationEnd,
  toggleExpandView,
  index,
  swiper,
}) => {
  const { brandDetails } = useBaseContext();
  const playerRef = useRef<OpenPlayerJS | null>(null);
  /**
   * Player configuration reference. contains the player configuration.
   */
  const playerConfigRef = useRef<PlayerConfigType>({
    ...getVideoPlayerConfigs(brandDetails?.web_configs),
  });
  /**
   * this state is solely use to show if the user has paused the video or not.
   */
  const [buttonAction, setButtonAction] = useState<ButtonActionType>();
  const [playingState, setPlayingState] = useState<PlayingStateType>("LOADING");

  /**
   * Whether to show seeker for player or not.
   * Shows when user performs PAUSE action, hides when user performs PLAY action.
   */
  const [showSeeker, setShowSeeker] = useState(false);
  /**
   * This state is used to play or pause the video player.
   */
  const [feedPlayerShouldPlay, setFeedPlayerShouldPlay] = useState(
    getInitialShouldPlayState(getVideoPlayerConfigs(brandDetails?.web_configs))
  );
  // event emitter for time updates
  // Use mitt with unknown for browser compatibility and type safety
  const timeUpdateEventEmitterRef = useRef(mitt());
  const [adInfo, setAdInfo] = useState<{
    adInfo?: AdInfoType;
    isAdPlaying: boolean;
  }>({ isAdPlaying: false });

  const { muted, setMuted } = useBaseContext();

  const { track, EventName } = useAnalytics();

  const videoStateRef = useRef<VideoTimeStateType>({
    currentTime: 0,
    duration: 0,
  });

  useEffect(() => {
    const playerConfig = playerConfigRef.current;
    const player = playerRef.current;
    if (!player) return;
    if (isActive) {
      if (playerConfig.unmuteVideo) {
        unmute(false);
      }
      if (playerConfig.autoplay) {
        // autoplay after sometime is true, so play the video after timeout.
        if (playerConfig.autoplayAfter) {
          setTimeout(() => {
            play(false);
            // convert seconds to miliseconds.
          }, playerConfig.autoplayAfter * 1000);
          return;
        }

        // autoplay is true, so play the video.
        play(false);
      }
    } else {
      playerConfigRef.current = {
        ...getVideoPlayerConfigs(brandDetails.web_configs),
      };
    }
  }, [isActive]);

  /**
   * In case of user action only we need to show seeker.
   * If user action is play or pause, we need to show the seeker.
   */
  useEffect(() => {
    if (buttonAction === "PAUSE") {
      setShowSeeker(true);
    } else if (buttonAction === "PLAY") {
      setShowSeeker(false);
    }
  }, [buttonAction]);

  useEffect(() => {
    // Skip if swiper is undefined, current index doesn't match previous index,
    // or if video was viewed for less than 2 seconds
    if (
      !swiper ||
      index !== swiper.previousIndex ||
      videoStateRef.current.duration < 0.2
    )
      return;

    track(EventName.VIDEO_IMPRESSION, {
      content_id: videoId,
      video_length: videoStateRef.current.duration,
      video_view_length: videoStateRef.current.currentTime,
    });
  }, [swiper?.previousIndex]);

  const setVideoTimeState = useCallback((timeState: VideoTimeStateType) => {
    videoStateRef.current = {
      ...videoStateRef.current,
      ...timeState,
    };
    const timeUpdateEmitter = timeUpdateEventEmitterRef.current;
    if (!timeUpdateEmitter) return;
    timeUpdateEmitter.emit("timeUpdate", videoStateRef.current);
  }, []);

  const onVideoTimeStateChange = useCallback(
    (callback: (state: VideoTimeStateType) => void) => {
      // Wrap callback to enforce type safety
      const handler = (event: unknown) => {
        if (
          typeof event === "object" &&
          event !== null &&
          "currentTime" in event &&
          "duration" in event
        ) {
          callback(event as VideoTimeStateType);
        }
      };
      timeUpdateEventEmitterRef.current?.on("timeUpdate", handler);
      return () => {
        timeUpdateEventEmitterRef.current?.off("timeUpdate", handler);
      };
    },
    []
  );

  /**
   * This function is used to toggle the play state of the video player.
   */
  const togglePlay = useCallback(
    (byUser: boolean) => {
      setFeedPlayerShouldPlay((prev) => {
        if (byUser) {
          if (prev) {
            setButtonAction("PAUSE");
          } else {
            setButtonAction("PLAY");
          }
          // Track play/pause events with Analytics only if the video play pause is triggered by user.
          track(prev ? EventName.VIDEO_PAUSED : EventName.VIDEO_PLAY, {
            content_id: videoId,
          });
        }
        return !prev;
      });
    },
    [setFeedPlayerShouldPlay, EventName.VIDEO_PAUSED, EventName.VIDEO_PLAY]
  );

  // setPlayerRef: Sets the player reference to the current OpenPlayerJS instance or null.
  const setPlayerRef = useCallback((player: OpenPlayerJS | null) => {
    playerRef.current = player;
  }, []);

  // play: Sets the feed player to play state.
  const play = useCallback((byUser: boolean, seekTime: number = 0) => {
    if (seekTime && playerRef.current) {
      playerRef.current.getMedia().currentTime = seekTime;
    }
    setFeedPlayerShouldPlay(true);
    if (byUser) {
      setButtonAction("PLAY");
      // Track play event with Analytics only if the video play is triggered by user.
      track(EventName.VIDEO_PLAY, {
        content_id: videoId,
      });
    }
  }, []);

  // pause: Sets the feed player to pause state.
  const pause = useCallback(
    (byUser: boolean) => {
      setFeedPlayerShouldPlay(false);
      if (byUser) {
        setButtonAction("PAUSE");
        // Track pause event with Analytics only if the video pause is triggered by user.
        track(EventName.VIDEO_PAUSED, {
          content_id: videoId,
        });
      }
    },
    [EventName.VIDEO_PAUSED]
  );

  // toggleMuted: Toggles the muted state of the player.
  const toggleMuted = useCallback(
    (byUser: boolean) => {
      setMuted((prev) => {
        if (byUser) {
          if (prev) {
            setButtonAction("UNMUTE");
          } else {
            setButtonAction("MUTE");
          }
          // Track mute/unmute events with Analytics only if the video mute/unmute is triggered by user.
          track(prev ? EventName.VIDEO_UNMUTED : EventName.VIDEO_MUTED, {
            content_id: videoId,
          });
        }
        return !prev;
      });
    },
    [setMuted, EventName.VIDEO_UNMUTED, EventName.VIDEO_MUTED]
  );

  // mute: Mutes the player.
  const mute = useCallback(
    (byUser: boolean) => {
      setMuted(true);
      if (byUser) {
        setButtonAction("MUTE");
      }
    },
    [setMuted]
  );

  // unmute: Unmutes the player.
  const unmute = useCallback(
    (byUser: boolean) => {
      setMuted(false);
      if (byUser) {
        setButtonAction("UNMUTE");
      }
    },
    [setMuted]
  );

  const handleEnded = useCallback(() => {
    const { repeatCount, shouldSwipeNext } = playerConfigRef.current;

    // Check if repeatCount is greater than 0
    // and if so, decrement it and play the video again
    // Otherwise, swipe to the next video
    if (repeatCount > 0) {
      playerConfigRef.current.repeatCount--;
      playerRef.current?.play();
      return;
    }

    // If shouldSwipeNext is true, call the swipeNext function
    // to move to the next video in the feed
    // This is useful for auto-swiping functionality
    if (shouldSwipeNext) {
      onPlayerIterationEnd();
    }
  }, []);

  const updateAdInfo = useCallback(
    (isAdPlaying: boolean, adInfo: AdInfoType) => {
      setAdInfo({ isAdPlaying, adInfo });
    },
    []
  );

  const value: PlayerContextType = {
    setPlayerRef,

    setVideoTimeState,
    onVideoTimeStateChange,

    showSeeker,
    setShowSeeker,

    feedPlayerShouldPlay: isActive && feedPlayerShouldPlay,
    togglePlay,
    play,
    pause,

    muted,
    toggleMuted,
    mute,
    unmute,

    handleEnded,

    // State
    videoId,

    playingState,
    setPlayingState,

    buttonAction,

    playerConfigRef,

    showExpandView,
    toggleExpandView,

    adInfo: adInfo.adInfo,
    isAdPlaying: adInfo.isAdPlaying,
    updateAdInfo,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
