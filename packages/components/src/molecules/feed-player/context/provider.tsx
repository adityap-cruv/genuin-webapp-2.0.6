"use client";
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import OpenPlayerJS from "openplayerjs";
import { getVideoPlayerConfigs } from "../utils";
import {
  ButtonActionType,
  ExpandViewProps,
  PlayingStateType,
  VideoTimeStateType,
} from "./types";
import { AdInfoType, PlayerContext, PlayerContextType } from "./context";
import mitt from "mitt";
import { useBaseContext } from "@genuin/components/context/base";
import { useAnalytics } from "@genuin/components/context/analytics";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { Swiper } from "swiper/types";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { BaseEventBusContext } from "@genuin/components/context/base/event-bus";
import { GenericData } from "@genuin/components/context/base/feed-context-manager";

type VideoProviderProps = {
  children: React.ReactNode;
  isEmbed?: boolean;
  videoId: string;
  /**
   * Function to be called when the player completes it's iteration and is ready to play the next video.
   */
  onPlayerIterationEnd: () => void;
  /**
   * Post list index - used to compare against previous index
   *
   */
  index?: number;
  /**
   * Swiper instance for the video player.
   */
  swiper?: Swiper;
  /**
   * If player is active or not.
   */
  isActive: boolean;
  /**
   * Explicit autoplay control that overrides web config autoplay settings
   * When set to false, video will not autoplay regardless of config
   */
  explicitAutoPlay?: boolean;
  /**
   * Explicit loop control that overrides web config repeat settings
   * When set to false, video will not loop regardless of config
   */
  explicitLoop?: boolean;
  /**
   * Function to update ative index in embed-manager-provider
   */
  updateActiveIndex?: (idx: number) => void;
} & ExpandViewProps;

type PlayerConfigType = ReturnType<typeof getVideoPlayerConfigs>;

function getInitialShouldPlayState(
  playerConfig: PlayerConfigType | undefined,
  explicitAutoPlay?: boolean
) {
  // If explicit autoplay is provided and set to false, it should override config
  if (explicitAutoPlay === false) return false;

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
  isEmbed,
  explicitAutoPlay,
  explicitLoop,
  updateActiveIndex,
}) => {
  const { brandDetails, baseEventBus, baseContextManager, muted, setMuted } =
    useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const {
    view: { brandLayoutType },
    video,
  } = useEmbedConfigs();

  // For iHeart brand layout, use shared state from BaseContext
  const isIHeartLayout = brandLayoutType === "iheart";

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
   * Whether the user is actively scrubbing/seeking through the video.
   * True when user starts dragging the scrubber, false when released.
   */
  const [showScrubber, setShowScrubber] = useState(false);
  /**
   * This state is used to play or pause the video player.
   */
  const [feedPlayerShouldPlay, setFeedPlayerShouldPlay] = useState(
    getInitialShouldPlayState(
      getVideoPlayerConfigs(brandDetails?.web_configs),
      explicitAutoPlay
    )
  );
  // To check whether video is fully watched or not..
  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(
    isEmbed
      ? (baseContextManager.getVideoState(videoId)?.isWatched ?? false)
      : false
  );

  // State to track user focus and container visibility for controlling video playback
  // isFocused: whether the user is actively focused on the page/tab
  // containerInView: whether the video container is visible (for embed scenarios)
  const [focusState, setFocusState] = useState({
    isFocused: baseEventBus.getContext().userIsFocused,
    containerInView: embedDetails
      ? !!embedDetails.embedData.startVideoSlug
        ? true // If there's a start video slug, assume container is in view
        : embedDetails?.embedEventBus.getContext().containerInView
      : true, // For non-embed, always consider in view
  });
  // event emitter for time updates
  // Use mitt with unknown for browser compatibility and type safety
  const timeUpdateEventEmitterRef = useRef(mitt());
  const [adInfo, setAdInfo] = useState<{
    adInfo?: AdInfoType;
    isAdPlaying: boolean;
  }>({ isAdPlaying: false });

  const { track, EventName } = useAnalytics();

  // Track globalPlayState from baseEventBus - controls if ANY player can play based on user action
  const [globalPlayState, setGlobalPlayState] = useState(
    baseEventBus.getContext().globalPlayingState
  );

  // To check whether player should play or not, based on all the conditions.
  // For iHeart layout, also check globalPlayState to sync all players
  const playerPlayFlag = useMemo(() => {
    const baseConditions =
      feedPlayerShouldPlay &&
      !isVideoWatched &&
      isActive &&
      focusState.isFocused &&
      focusState.containerInView;

    // For iHeart layout, add globalPlayState check to sync play state across all players
    if (isIHeartLayout) {
      return baseConditions && globalPlayState;
    }

    return baseConditions;
  }, [
    feedPlayerShouldPlay,
    isVideoWatched,
    isActive,
    focusState.isFocused,
    focusState.containerInView,
    isIHeartLayout,
    globalPlayState,
  ]);

  const videoStateRef = useRef<VideoTimeStateType>({
    currentTime: 0,
    duration: 0,
  });

  useEffect(() => {
    const playerConfig = playerConfigRef.current;
    const player = playerRef.current;
    if (!player) return;
    if (isActive && !isVideoWatched) {
      // Check if explicit unmute is set to false - if so, don't unmute
      if (playerConfig.unmuteVideo) {
        unmute(false);
      }

      if (isIHeartLayout) {
        const globalPlayState = baseEventBus.getContext().globalPlayingState;
        setFeedPlayerShouldPlay(globalPlayState);
        return;
      }

      if (explicitAutoPlay === false) {
        setFeedPlayerShouldPlay(false);
        return;
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
      // For iHeart layout, don't reset player config to maintain shared state
      if (!isIHeartLayout) {
        playerConfigRef.current = {
          ...getVideoPlayerConfigs(brandDetails.web_configs),
        };
      }
    }
  }, [
    isActive,
    explicitAutoPlay,
    isVideoWatched,
    isIHeartLayout,
    baseContextManager,
    baseEventBus,
  ]);

  // specifically for iheart to maintain the -n sec player replay.
  useEffect(() => {
    if (
      brandLayoutType !== "iheart" ||
      !playerRef.current ||
      !embedDetails?.embedEventBus
    )
      return;

    const embedEventBus = embedDetails.embedEventBus;

    // This flag checks only if the player is active or not.
    if (isActive) {
      // time info of new active player
      const timeInfo = baseContextManager.getTimeInfo(videoId);

      // This case is for handling if the player comes back from another state to back here.
      // Let's say, embed -> expand -> embed,
      // In that case we need to change currentTime same as the previous player type.
      if (embedEventBus.getContext().skipTimeOffsetOnce) {
        playerRef.current.getMedia().currentTime = timeInfo.currentTime;
        embedEventBus.updateContext({
          ...embedEventBus.getContext(),
          skipTimeOffsetOnce: false,
        });
        return;
      }

      // If the player is ended no need to change the current time.
      if (timeInfo.duration === timeInfo.currentTime) {
        return;
      }

      const resumePlaybackFrom = video.resumePlaybackFrom;

      // in case resumePlaybackFrom is -1, start it from beginning.
      if (resumePlaybackFrom === -1) {
        playerRef.current.getElement().currentTime = 0;
        return;
      }

      // calculate new current time
      let newCurrentTime = timeInfo.currentTime - video.resumePlaybackFrom;
      // if less than 0 than 0 or else, same value.
      newCurrentTime = newCurrentTime < 0 ? 0 : newCurrentTime;

      // reset the player.
      playerRef.current.getMedia().currentTime = newCurrentTime;
    }
  }, [brandLayoutType, isActive, embedDetails?.embedEventBus]);

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
    // Skip if current index doesn't match previous index
    // Skip impression event if video was viewed for less than 2 seconds
    if (!swiper || !index) return;

    if (index !== swiper.previousIndex) return;

    track(EventName.VIDEO_IMPRESSION, {
      content_category: "loop",
      content_id: videoId,
      event_record_screen: "feed",
      event_target_screen: "none",
      video_length: videoStateRef.current.duration,
      video_view_length: videoStateRef.current.currentTime,
    });
  }, [swiper]);

  useEffect(() => {
    if (!embedDetails) return;
    const { embedEventBus } = embedDetails;

    function handleContainerInViewChange() {
      const context = embedEventBus.getContext();
      setFocusState((prev) => ({
        ...prev,
        containerInView: context.containerInView,
      }));
    }

    // Listen to global playing state changes from baseEventBus
    // This ensures all players respect user's play/pause actions across the embed
    function handlePlayingStateChange(_: any, context: BaseEventBusContext) {
      setGlobalPlayState(context.globalPlayingState);
    }

    function handleUserFocusChange() {
      const context = baseEventBus.getContext();
      setFocusState((prev) => ({ ...prev, isFocused: context.userIsFocused }));
    }

    function handleVideoWatched(payload: Partial<GenericData>) {
      if (videoId === payload.videoId)
        setIsVideoWatched(payload.isVideoWatched ?? false);
    }

    embedEventBus.on("containerInViewChange", handleContainerInViewChange);
    baseEventBus.on("userFocusChange", handleUserFocusChange);
    baseEventBus.on("globalPlayingStateChange", handlePlayingStateChange);
    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      embedEventBus.off("containerInViewChange", handleContainerInViewChange);
      baseEventBus.off("userFocusChange", handleUserFocusChange);
      baseEventBus.off("globalPlayingStateChange", handlePlayingStateChange);
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, [videoId, baseEventBus]);

  useEffect(() => {
    if (buttonAction === "PLAY" || buttonAction === "PAUSE") {
      baseEventBus.emit(
        "globalPlayingStateChange",
        undefined,
        (currentContext) => ({
          ...currentContext,
          globalPlayingState: buttonAction === "PLAY",
        })
      );
    }
  }, [buttonAction, baseEventBus]);

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
        if (byUser && !isActive && index !== undefined) {
          // If user is trying to play while inactive, activate this item
          updateActiveIndex?.(index);
          return prev; // Set to play after activation
        }
        const newPlayingState = !prev;
        if (byUser) {
          baseContextManager.setPlayPauseTracker({
            isPlaying: newPlayingState,
          });

          setButtonAction(prev ? "PAUSE" : "PLAY");
          // Track play/pause events with Analytics only if the video play pause is triggered by user.
          track(prev ? EventName.VIDEO_PAUSED : EventName.VIDEO_PLAY, {
            content_id: videoId,
          });
        }
        return newPlayingState;
      });
    },
    [
      setFeedPlayerShouldPlay,
      EventName.VIDEO_PAUSED,
      EventName.VIDEO_PLAY,
      baseEventBus,
      baseContextManager,
      track,
      videoId,
      updateActiveIndex,
      isActive,
    ]
  );

  // setPlayerRef: Sets the player reference to the current OpenPlayerJS instance or null.
  const setPlayerRef = useCallback((player: OpenPlayerJS | null) => {
    playerRef.current = player;
  }, []);

  // play: Sets the feed player to play state.
  const play = useCallback(
    (byUser: boolean, seekTime: number = 0) => {
      if (seekTime >= 0 && playerRef.current) {
        playerRef.current.getMedia().currentTime = seekTime;
      }
      setFeedPlayerShouldPlay(true);
      baseContextManager.setVideoWatched({ videoId, isWatched: false });
      if (byUser) {
        baseContextManager.setPlayPauseTracker({ isPlaying: true });

        setButtonAction("PLAY");
        // Track play event with Analytics only if the video play is triggered by user.
        track(EventName.VIDEO_PLAY, {
          content_id: videoId,
        });
      }
    },
    [baseEventBus, baseContextManager, EventName.VIDEO_PLAY, track, videoId]
  );

  // pause: Sets the feed player to pause state.
  const pause = useCallback(
    (byUser: boolean) => {
      setFeedPlayerShouldPlay(false);
      if (byUser) {
        baseContextManager.setPlayPauseTracker({ isPlaying: false });

        setButtonAction("PAUSE");
        // Track pause event with Analytics only if the video pause is triggered by user.
        track(EventName.VIDEO_PAUSED, {
          content_id: videoId,
        });
      }
    },
    [EventName.VIDEO_PAUSED, baseEventBus, baseContextManager, track, videoId]
  );

  // toggleMuted: Toggles the muted state of the player.
  const toggleMuted = useCallback(
    (byUser: boolean) => {
      if (byUser) {
        if (muted) {
          setButtonAction("UNMUTE");
          track(EventName.VIDEO_UNMUTED, {
            content_id: videoId,
          });
        } else {
          setButtonAction("MUTE");
          track(EventName.VIDEO_MUTED, {
            content_id: videoId,
          });
        }
      }
      setMuted((oldMuted) => !oldMuted);
    },
    [setMuted, muted, videoId, track, EventName]
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
    // If explicit loop is set to true, just replay the video indefinitely
    if (explicitLoop) {
      playerRef.current?.play();
      return;
    }

    // In case of embed regardless of shouldSwipeNext it should go to next
    if (isEmbed) {
      onPlayerIterationEnd();
      baseContextManager.setVideoWatched({ videoId, isWatched: true });
      return;
    }

    // For iHeart layout, ignore playerConfig and just go to next
    if (isIHeartLayout) {
      swiper?.slideNext();
      return;
    }

    const { repeatCount, shouldSwipeNext } = playerConfigRef.current;

    // Check if repeatCount is greater than 0
    // and if so, decrement it and play the video again
    // Otherwise, swipe to the next video
    if (repeatCount > 0) {
      playerConfigRef.current.repeatCount--;
      playerRef.current?.play();
      baseContextManager.setVideoWatched({ videoId, isWatched: false });
      return;
    }

    // If shouldSwipeNext is true, call the swipeNext function
    // to move to the next video in the feed
    // This is useful for auto-swiping functionality
    if (shouldSwipeNext) {
      onPlayerIterationEnd();
      return;
    }

    // set isplaying paused, no swipe next had happened.
    baseContextManager.setPlayPauseTracker({ isPlaying: false });
  }, [
    isEmbed,
    baseContextManager,
    videoId,
    onPlayerIterationEnd,
    explicitLoop,
    isIHeartLayout,
    swiper,
  ]);

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

    showScrubber,
    setShowScrubber,

    feedPlayerShouldPlay: playerPlayFlag,
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
