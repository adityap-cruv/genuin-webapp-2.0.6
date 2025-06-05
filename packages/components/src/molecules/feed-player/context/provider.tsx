import React, { useState, useCallback, useRef, useEffect } from "react";
import OpenPlayerJS from "openplayerjs";
import { getVideoPlayerConfigs } from "../utils";
import {
  ButtonActionType,
  ExpandViewProps,
  PlayingStateType,
  VideoTimeStateType,
} from "./types";
import { PlayerContext, PlayerContextType } from "./context";
import mitt from "mitt";
import type { MittEmitter } from "./mitt";
import { useBaseContext } from "src/context/base";

type VideoProviderProps = {
  children: React.ReactNode;
  videoId: string;
  /**
   * Function to be called when the player completes it's iteration and is ready to play the next video.
   */
  swipeNext: () => void;
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
  swipeNext,
  toggleExpandView,
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
   * This state is used to play or pause the video player.
   */
  const [feedPlayerShouldPlay, setFeedPlayerShouldPlay] = useState(
    getInitialShouldPlayState(getVideoPlayerConfigs(brandDetails?.web_configs))
  );
  // event emitter for time updates
  // Use mitt with unknown for browser compatibility and type safety
  const timeUpdateEventEmitterRef = useRef(mitt());

  const { muted, setMuted } = useBaseContext();

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
        }
        return !prev;
      });
    },
    [setFeedPlayerShouldPlay]
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
    }
  }, []);

  // pause: Sets the feed player to pause state.
  const pause = useCallback((byUser: boolean) => {
    setFeedPlayerShouldPlay(false);
    if (byUser) {
      setButtonAction("PAUSE");
    }
  }, []);

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
        }
        return !prev;
      });
    },
    [setMuted]
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
      swipeNext();
    }
  }, []);

  const value: PlayerContextType = {
    setPlayerRef,

    setVideoTimeState,
    onVideoTimeStateChange,

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
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
