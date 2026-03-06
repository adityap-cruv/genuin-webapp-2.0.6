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
import { useEmbedManagerContext } from "@genuin/components/organisms/embed/context";
import { isSlideVisible } from "@genuin/components/organisms/embed/utils";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";

type VideoProviderProps = {
  children: React.ReactNode;
  isEmbed?: boolean;
  videoId: string;
  videoUrl: string;
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
  swiper?: Swiper | null;
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
   * Total number of videos in feed.
   */
  totalVideos?: number;
  /**
   * A video description to pass data to analytics.
   */
  videoDescription?: string | null;
  /**
   * Function to update active index in embed-manager-provider
   */
  updateActiveIndex?: ReturnType<
    typeof useEmbedManagerContext
  >["updateActiveIndex"];
  /**
   * Represents the index of the currently playing video.
   * Note: This is not the swiper's activeIndex.
   */
  activeIndex?: number;
  /**
   * A callback function that is invoked when an ad starts playing.
   * @param event
   * @returns
   */
  onAdStarted?: (event?: AdInfoType) => void;
  /**
   * A callback function that is invoked when an ad ends.
   * @param event
   * @returns
   */
  onAdEnded?: (event?: AdInfoType) => void;
} & ExpandViewProps;

type PlayerConfigType = ReturnType<typeof getVideoPlayerConfigs>;

function getInitialShouldPlayState(
  playerConfig: PlayerConfigType | undefined,
  explicitAutoPlay?: boolean,
) {
  // If explicit autoplay is provided and set to false, it should override config
  if (explicitAutoPlay === false) return false;

  if (playerConfig) {
    if (playerConfig.autoplay) {
      return true;
    }
    if (playerConfig.autoplayAfter >= 0) return false;
  }
  return true;
}

export const PlayerProvider: React.FC<VideoProviderProps> = ({
  children,
  videoId,
  videoUrl,
  showExpandView,
  isActive,
  index,
  swiper,
  isEmbed,
  explicitAutoPlay,
  explicitLoop,
  totalVideos,
  videoDescription,
  activeIndex,
  onPlayerIterationEnd,
  toggleExpandView,
  updateActiveIndex,
  onAdStarted,
  onAdEnded,
}) => {
  const { brandDetails, baseEventBus, baseContextManager, muted, setMuted } =
    useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const {
    view: { brandLayoutType, websiteType, isExpandOnly },
    video,
  } = useEmbedConfigs();
  // For iHeart brand layout, use shared state from BaseContext
  const isIHeartLayout = brandLayoutType === "iheart";
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const playerRef = useRef<OpenPlayerJS | null>(null);
  /**
   * Player configuration reference. contains the player configuration.
   */
  const playerConfigRef = useRef<PlayerConfigType>({
    ...getVideoPlayerConfigs(brandDetails?.web_configs),
  });
  /**
   * Ref to track the previous active player type for resumePlaybackFrom logic
   */
  const previousActivePlayerTypeRef = useRef<string | null>(null);
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
    getInitialShouldPlayState(playerConfigRef.current, explicitAutoPlay),
  );

  // To check whether video is fully watched or not..
  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(
    isEmbed
      ? (baseContextManager.getVideoState(videoId)?.isWatched ?? false)
      : false,
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

  // Memoized base analytics data
  const baseAnalyticsData = useMemo(
    () => ({
      content_id: videoId,
      total_videos: totalVideos,
      title: videoDescription,
      video_id: videoId,
      video_url: videoUrl,
    }),
    [videoId, totalVideos, videoDescription],
  );

  // Track globalPlayState from baseEventBus - controls if ANY player can play based on user action
  const [globalPlayState, setGlobalPlayState] = useState(
    baseEventBus.getContext().globalPlayingState,
  );

  const videoStateRef = useRef<VideoTimeStateType>({
    currentTime: 0,
    duration: 0,
  });

  /**
   * Disables preview mode for the current video when user takes explicit control.
   *
   * Preview mode enables hover-triggered looping behavior. This function stops that behavior
   * when the user manually interacts with playback controls (play/pause), ensuring manual
   * control takes precedence over automatic preview functionality.
   *
   * @remarks
   * Called when user explicitly toggles play/pause to prevent preview mode from interfering
   * with user-initiated playback control.
   */
  const disablePreviewMode = useCallback(() => {
    if (videoId && index !== undefined && video.videoShouldPreview) {
      baseContextManager.setShouldPreview({
        shouldPreview: false,
        videoId,
        index,
      });
    }
  }, [baseContextManager, videoId, index]);

  // To check whether player should play or not, based on all the conditions.
  // For iHeart layout, also check globalPlayState to sync all players
  const playerPlayFlag = useMemo(() => {
    const activePlayerType =
      embedDetails?.embedEventBus?.getContext().activePlayerType;
    const baseConditions =
      feedPlayerShouldPlay &&
      (isEmbed ? !isVideoWatched : true) &&
      isActive &&
      focusState.isFocused &&
      // Determine if player should be visible based on view mode:
      // - isExpandOnly: Always visible in expand-only mode (no container visibility check needed)
      // - activePlayerType === "pip": Always visible in picture-in-picture mode (floats above content)
      // - activePlayerType === "expand-view": Always visible in expanded/fullscreen mode
      // - Otherwise: Only visible when container is in viewport
      (isExpandOnly ||
      activePlayerType === "pip" ||
      activePlayerType === "expand-view"
        ? true
        : focusState.containerInView);

    const videoShouldPreview = baseContextManager.checkIfVideoShouldPreview({
      videoId,
    });

    // Disable preview mode when all of the following conditions are met:
    // 1. isActive: The current player instance is active/playing
    // 2. activePlayerType === "expand-view": The player is in expanded/fullscreen view mode
    // 3. baseConditions: Other required base conditions are satisfied (e.g., feedPlayerShouldPlay, not watched, active state)
    // This ensures preview mode is disabled when the user has played video in expanded player,
    // preventing any preview-related UI or behavior from interfering with the embed experience when user comes back to embed from full-screen view.
    if (
      isActive &&
      video.videoShouldPreview &&
      baseConditions &&
      videoShouldPreview
    ) {
      disablePreviewMode();
    }

    if (isIHeartLayout) {
      // For iHeart layout, add globalPlayState check to sync play state across all players
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
    isEmbed,
    isExpandOnly,
  ]);

  const handleVideoImpression = useCallback(
    ({
      videoId: triggeredVideoId,
      previousActiveIndex,
      impressionSource,
    }: {
      videoId: string;
      previousActiveIndex?: number;
      impressionSource: string;
    }) => {
      if (
        index === undefined ||
        triggeredVideoId !== videoId ||
        previousActiveIndex === undefined ||
        !impressionSource ||
        !swiper
      ) {
        return;
      }

      // The `impressionSource` determines which logic to follow.
      /*
        - If the impression is triggered at the end of the video, record the impression for the current video.
        - If the impression is triggered due to scroll behavior, record the impression for the previous video.
      */
      const isActiveVideo =
        impressionSource === "end"
          ? index === previousActiveIndex
          : index - 1 === previousActiveIndex;

      if (!isActiveVideo) return;

      const prevSlide = swiper?.slides?.[previousActiveIndex];
      const videoRef = prevSlide?.querySelector(
        "video",
      ) as HTMLVideoElement | null;
      if (!videoRef) return;

      const { currentTime, duration } = videoRef;

      const isInvalid =
        !duration || Number.isNaN(duration) || Number.isNaN(currentTime);

      if (isInvalid) return;

      track(EventName.VIDEO_IMPRESSION, {
        ...baseAnalyticsData,
        content_category: "loop",
        event_record_screen: "feed",
        event_target_screen: "none",
        video_length: duration,
        video_view_length: currentTime,
      });
    },
    [videoId, index, swiper, track],
  );

  useEffect(() => {
    const playerConfig = playerConfigRef.current;
    // const player = playerRef.current;
    // if (!player) return;
    if (isActive && !isVideoWatched) {
      // Check if explicit unmute is set to false - if so, don't unmute
      if (playerConfig.unmuteVideo) {
        unmute(false);
      }

      // if (isIHeartLayout) {
      //   const globalPlayState = baseEventBus.getContext().globalPlayingState;
      //   console.log("[gen]: global play state:;", { globalPlayState });
      //   setFeedPlayerShouldPlay(globalPlayState);
      //   return;
      // }

      if (
        isIHeartLayout &&
        websiteType === "polaris" &&
        index === 0 &&
        baseContextManager.checkIfVideoShouldPreview({ videoId })
      ) {
        disablePreviewMode();
      }

      if (explicitAutoPlay === false && websiteType !== "legacy") {
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
    globalPlayState,
    videoId,
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
      const currentActivePlayerType =
        embedEventBus.getContext().activePlayerType;

      // This case is for handling if the player comes back from another state to back here.
      // Let's say, embed -> expand -> embed,
      // In that case we need to change currentTime same as the previous player type.
      if (embedEventBus.getContext().skipTimeOffsetOnce) {
        playerRef.current.getMedia().currentTime = timeInfo.currentTime;
        embedEventBus.updateContext({
          ...embedEventBus.getContext(),
          skipTimeOffsetOnce: false,
        });
        previousActivePlayerTypeRef.current = currentActivePlayerType;
        return;
      }

      // If the player is ended no need to change the current time.
      if (timeInfo.duration === timeInfo.currentTime) {
        previousActivePlayerTypeRef.current = currentActivePlayerType;
        return;
      }

      const resumePlaybackFrom = video.resumePlaybackFrom;

      // in case resumePlaybackFrom is -1, start it from beginning.
      if (resumePlaybackFrom === -1) {
        playerRef.current.getElement().currentTime = 0;
        previousActivePlayerTypeRef.current = currentActivePlayerType;
        return;
      }

      // Only apply resumePlaybackFrom if activePlayerType hasn't changed or is first time
      if (
        previousActivePlayerTypeRef.current === null ||
        currentActivePlayerType === previousActivePlayerTypeRef.current
      ) {
        // calculate new current time
        let newCurrentTime = timeInfo.currentTime - video.resumePlaybackFrom;
        // if less than 0 than 0 or else, same value.
        newCurrentTime = newCurrentTime < 0 ? 0 : newCurrentTime;

        // reset the player.
        playerRef.current.getMedia().currentTime = newCurrentTime;
      }

      // Update previous active player type
      previousActivePlayerTypeRef.current = currentActivePlayerType;
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
    // Used to trigger a video impression event in the full-screen or clip player.
    if (!swiper || !index) return;
    function handleSwiperActiveIndexChange() {
      // In full-screen or clip-player modes, `isEmbed` is undefined.
      // In the clip card / embed outer view, `isEmbed` is true.
      // This condition helps us distinguish between these two contexts.
      if (index === undefined || index - 1 !== activeIndex || isEmbed) return;
      if (globalPlayState) {
        handleVideoImpression({
          videoId,
          previousActiveIndex: swiper?.previousIndex,
          impressionSource: "scroll",
        });
      }
    }

    swiper.on("activeIndexChange", handleSwiperActiveIndexChange);

    return () => {
      swiper.off("activeIndexChange", handleSwiperActiveIndexChange);
    };
  }, [swiper, isEmbed, globalPlayState, activeIndex, handleVideoImpression]);

  useEffect(() => {
    /**
     * Handles playback behavior for the iHeart legacy layout.
     *
     * In this layout:
     * - Videos can only be played or paused through user interaction.
     * - Videos do NOT auto-play when they enter the viewport.
     * - When the currently playing video goes out of view, set the global play state as false.
     */
    if (!swiper || !isIHeartLayout || websiteType !== "legacy") return;

    // Checks if the currently playing video remains in view.
    // If it goes out of view, pause the video and update the global play state.
    function handleSlideChange() {
      if (
        !swiper ||
        !globalPlayState ||
        activeIndex === undefined ||
        embedDetails?.embedEventBus.getContext().activePlayerType ===
          "expand-view"
      ) {
        return;
      }

      const isActiveVideoVisible = isSlideVisible(swiper, activeIndex);
      if (!isActiveVideoVisible) {
        setButtonAction("PAUSE");
        setGlobalPlayState(false);
        if (isEmbed) {
          // In the clip-card (embed/feed) view—specifically for the legacy edge case—
          // if a video is playing and scrolls out of view while still being the active video,
          // this logic will trigger the impression event.
          handleVideoImpression({
            videoId,
            previousActiveIndex: activeIndex ?? 0,
            impressionSource: "scroll",
          });
        }
      }
    }

    swiper.on("slideChange", handleSlideChange);

    return () => {
      swiper.off("slideChange", handleSlideChange);
    };
  }, [
    swiper,
    globalPlayState,
    activeIndex,
    isEmbed,
    videoId,
    handleVideoImpression,
  ]);

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
      setFeedPlayerShouldPlay(context.globalPlayingState);
    }

    function handleUserFocusChange() {
      const context = baseEventBus.getContext();
      setFocusState((prev) => ({ ...prev, isFocused: context.userIsFocused }));
    }

    function handleVideoWatched(payload: Partial<GenericData>) {
      if (videoId === payload?.videoId)
        setIsVideoWatched(payload?.isVideoWatched ?? false);
    }

    // Used in the embed/feed clip-card view to fire the video impression event.
    function handleActiveIndexChange(
      eventData: any,
      context: EmbedEventContextType,
    ) {
      const prevIndex = context.previousActiveIndex;
      /*
        The embed’s `activeIndexChange` event is listened to by both providers:
        the embed player provider and the full-screen player provider.
        To differentiate between them, we added the active player type condition,
        since this logic should run only for the relevant player.
      */
      if (
        prevIndex === -1 ||
        index === undefined ||
        index - 1 !== prevIndex ||
        context.activePlayerType !== "embed" ||
        !context.shouldTrackImpression
      ) {
        return;
      }
      // Only fire the event if the video was previously played.
      if (globalPlayState) {
        handleVideoImpression({
          videoId,
          previousActiveIndex: prevIndex,
          impressionSource: "scroll",
        });
      }
    }

    // Used when the user switches from the clip card/embed view to the clip player/full-screen player.
    function handleActivePlayerChange(
      eventData: any,
      context: EmbedEventContextType,
    ) {
      const prevIndex = context.previousActiveIndex;
      if (!context.shouldTrackImpression) {
        return;
      }
      if (globalPlayState) {
        handleVideoImpression({
          videoId,
          previousActiveIndex: prevIndex,
          impressionSource: "scroll",
        });
      }
    }

    embedEventBus.on("containerInViewChange", handleContainerInViewChange);
    baseEventBus.on("userFocusChange", handleUserFocusChange);
    baseEventBus.on("globalPlayingStateChange", handlePlayingStateChange);
    embedEventBus.on("activeIndexChange", handleActiveIndexChange);
    embedEventBus.on("activePlayerTypeChange", handleActivePlayerChange);
    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      embedEventBus.off("containerInViewChange", handleContainerInViewChange);
      baseEventBus.off("userFocusChange", handleUserFocusChange);
      baseEventBus.off("globalPlayingStateChange", handlePlayingStateChange);
      embedEventBus.off("activeIndexChange", handleActiveIndexChange);
      embedEventBus.on("activePlayerTypeChange", handleActivePlayerChange);
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, [
    videoId,
    baseEventBus,
    baseContextManager,
    globalPlayState,
    isEmbed,
    handleVideoImpression,
  ]);

  useEffect(() => {
    if (
      (buttonAction === "PLAY" || buttonAction === "PAUSE") &&
      isIHeartLayout
    ) {
      baseEventBus.emit(
        "globalPlayingStateChange",
        undefined,
        (currentContext) => ({
          ...currentContext,
          globalPlayingState: buttonAction === "PLAY",
        }),
      );
    }
  }, [buttonAction, baseEventBus, isIHeartLayout]);

  /**
   * Handles video preview playback when hovering over feed items.
   * Listens to "onPreviewIndexChanged" events and manages a looping 3-second preview.
   *
   * Behavior:
   * - When preview index matches this video's index: starts playing from beginning and loops every 3 seconds
   * - When preview index changes to another video: pauses playback
   * - Clears any existing preview intervals before starting new ones
   *
   * The media element reference is cached once per preview to avoid redundant getMedia() calls.
   */
  useEffect(() => {
    // active player type should be embed than an than only this feature should work.
    if (!video.videoShouldPreview) return;
    let previewInterval: NodeJS.Timeout | null = null;

    function handlePreviewIndexChange({ previewIndex }: any) {
      const player = playerRef.current;
      const media = player?.getMedia();
      // Clear any existing preview interval before handling new preview state
      if (previewInterval) {
        clearInterval(previewInterval);
        previewInterval = null;
      }

      if (!media) return;

      // If preview index matches current index, start preview playback
      if (previewIndex === index) {
        // Start playing from beginning
        media.currentTime = 0;
        media.play();
        media.muted = true;

        // Set up loop with 3 second max length - resets to beginning when limit is reached
        previewInterval = setInterval(() => {
          if (
            media.currentTime >= video.previewSeconds ||
            media.currentTime >= media.duration
          ) {
            media.currentTime = 0;
          }
        }, 100); // Check every 100ms for smooth looping
      } else {
        if (baseContextManager.checkIfVideoShouldPreview({ videoId })) {
          media.pause();
          media.muted = muted;
        }
      }
    }

    baseContextManager.on("onPreviewIndexChanged", handlePreviewIndexChange);
    return () => {
      // Cleanup: clear interval and remove event listener
      if (previewInterval) {
        clearInterval(previewInterval);
      }
      baseContextManager.off("onPreviewIndexChanged", handlePreviewIndexChange);
    };
  }, [index, baseContextManager, muted]);

  /**
   * Handles resuming playback of the last known preview index.
   * When the "playLastKnownIndex" event is triggered, this checks if the preview index
   * matches the current video index and if playback is enabled, then plays the video.
   * This is typically used to restore playback state after preview interactions.
   */
  // useEffect(() => {
  //   // only listen to event if videoshouldpreview is false.
  //   if (!video.videoShouldPreview) return;

  //   function playLastKnownIndex(payload: Partial<GenericData>) {
  //     // Only play if the preview index matches this video and playback is enabled
  //     if (
  //       payload.previewIndex === index &&
  //       typeof index === "number" &&
  //       embedDetails?.embedEventBus.getContext().activePlayerType === "embed"
  //     ) {
  //       if (!isActive) {
  //         updateActiveIndex?.(index, undefined, true);
  //       } else {
  //         if (feedPlayerShouldPlay) {
  //           const media = playerRef.current?.getMedia();
  //           if (media?.paused) media?.play();
  //         }
  //       }
  //     }
  //   }

  //   baseContextManager.on("playLastKnownIndex", playLastKnownIndex);
  //   return () => {
  //     baseContextManager.off("playLastKnownIndex", playLastKnownIndex);
  //   };
  // }, [isActive, video, feedPlayerShouldPlay]);

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
    [],
  );

  // TODO: This function takes very heavy logical decision, refactor it with more maintainable code, If you want to do any changed contact himanshu@begenuin.com first.
  /**
   * This function is used to toggle the play state of the video player.
   */
  const togglePlay = useCallback(
    (byUser: boolean) => {
      // If the player is still loading, ignore toggle requests.
      if (isLoading) return;
      if (byUser && video.videoShouldPreview && typeof index === "number") {
        disablePreviewMode();
      }

      // Whenever user clicks on play/pause button, to mostly play/pause
      // If the user clicks on video which is not active or in view and feedPlayerShouldPlay is true
      // updateActiveIndex will take it into view and will start playing based on feed player shoud play
      //! Note: this is only done for iheart. Once we do re-write of this provider this function will be cleaned.
      if (
        byUser &&
        websiteType === "polaris" &&
        isIHeartLayout &&
        feedPlayerShouldPlay &&
        !isActive &&
        index !== undefined
      ) {
        updateActiveIndex?.(index, undefined, true);
        return;
      }

      if (
        byUser &&
        video.videoShouldPreview &&
        websiteType === "polaris" &&
        !isActive &&
        index !== undefined
      ) {
        updateActiveIndex?.(index, undefined, undefined, true);
        setFeedPlayerShouldPlay((prev) => {
          if (prev && !isActive) {
            return true;
          }
          const newPlayingState = !prev;
          if (byUser) {
            baseContextManager.setPlayPauseTracker({
              isPlaying: newPlayingState,
            });

            setButtonAction(prev ? "PAUSE" : "PLAY");

            // Track play/pause events with Analytics only if the video play pause is triggered by user.
            track(prev ? EventName.VIDEO_PAUSED : EventName.VIDEO_PLAY, {
              ...baseAnalyticsData,
              position_index: index,
              by_user: true,
            });
          }
          return newPlayingState;
        });
        return;
      }

      if (
        byUser &&
        !video.videoShouldPreview &&
        websiteType === "legacy" &&
        !isActive &&
        index !== undefined
      ) {
        updateActiveIndex?.(index);
        setFeedPlayerShouldPlay((prev) => {
          if (prev && !isActive) {
            return true;
          }
          const newPlayingState = !prev;
          if (byUser) {
            baseContextManager.setPlayPauseTracker({
              isPlaying: newPlayingState,
            });

            setButtonAction(prev ? "PAUSE" : "PLAY");

            // Track play/pause events with Analytics only if the video play pause is triggered by user.
            track(prev ? EventName.VIDEO_PAUSED : EventName.VIDEO_PLAY, {
              ...baseAnalyticsData,
              position_index: index,
              by_user: true,
            });
          }
          return newPlayingState;
        });
        return;
      }

      /**
       * TODO: This is temporary patch work for the time being
       * Handles edge case where legacy website needs to sync global play state
       */
      if (
        !baseEventBus.getContext().globalPlayingState &&
        feedPlayerShouldPlay
      ) {
        baseEventBus.emit("globalPlayingStateChange", undefined, (context) => ({
          ...context,
          globalPlayingState: true,
        }));
        baseContextManager.setPlayPauseTracker({
          isPlaying: feedPlayerShouldPlay,
        });
        return;
      }

      setFeedPlayerShouldPlay((prev) => {
        if (!isActive && index !== undefined) {
          updateActiveIndex?.(index);
        }
        const newPlayingState = !prev;
        if (byUser) {
          baseContextManager.setPlayPauseTracker({
            isPlaying: newPlayingState,
          });
          setButtonAction(prev ? "PAUSE" : "PLAY");

          // Track play/pause events with Analytics only if the video play pause is triggered by user.
          track(prev ? EventName.VIDEO_PAUSED : EventName.VIDEO_PLAY, {
            ...baseAnalyticsData,
            position_index: index,
            by_user: true,
          });
        }
        return newPlayingState;
      });
    },
    [
      setFeedPlayerShouldPlay,
      EventName.VIDEO_PAUSED,
      EventName.VIDEO_PLAY,
      baseContextManager,
      track,
      updateActiveIndex,
      isActive,
      index,
      baseAnalyticsData,
      feedPlayerShouldPlay,
      isLoading,
    ],
  );

  // setPlayerRef: Sets the player reference to the current OpenPlayerJS instance or null.
  const setPlayerRef = useCallback((player: OpenPlayerJS | null) => {
    playerRef.current = player;
  }, []);

  const seek = useCallback((seekTime: number) => {
    if (!playerRef.current) return;
    playerRef.current.getMedia().currentTime = seekTime;
  }, []);

  // play: Sets the feed player to play state.
  const play = useCallback(
    (byUser: boolean, seekTime: number = 0) => {
      // If the player is still loading, ignore play requests.
      if (isLoading) return;
      if (seekTime && playerRef.current) {
        playerRef.current.getMedia().currentTime = seekTime;
      }

      setFeedPlayerShouldPlay(true);
      if (byUser) {
        setButtonAction("PLAY");
        // Track play event with Analytics only if the video play is triggered by user.
        track(EventName.VIDEO_PLAY, {
          ...baseAnalyticsData,
          by_user: true,
        });
      }
    },
    [
      track,
      EventName.VIDEO_PLAY,
      baseAnalyticsData,
      baseContextManager,
      isLoading,
    ],
  );

  // pause: Sets the feed player to pause state.
  const pause = useCallback(
    (byUser: boolean) => {
      // If the player is still loading, ignore pause requests.
      if (isLoading) return;
      setFeedPlayerShouldPlay(false);
      if (byUser) {
        baseContextManager.setPlayPauseTracker({ isPlaying: false });
        setButtonAction("PAUSE");
        // Track pause event with Analytics only if the video pause is triggered by user.
        track(EventName.VIDEO_PAUSED, {
          ...baseAnalyticsData,
          by_user: true,
        });
      }
    },
    [
      EventName.VIDEO_PAUSED,
      baseEventBus,
      baseContextManager,
      track,
      baseAnalyticsData,
      isLoading,
    ],
  );

  // toggleMuted: Toggles the muted state of the player.
  const toggleMuted = useCallback(
    (byUser: boolean, bypassMuteChange?: boolean) => {
      // Special handling for video preview mode (hover-to-play feature)
      // if (video.videoShouldPreview && byUser) {
      //   // When a video is in preview mode and user clicks mute/unmute button:
      //   // 1. Check if this video is actually in an active preview state
      //   // 2. If yes, convert the preview into a full playback by toggling play
      //   // This ensures that clicking mute/unmute during hover transitions from preview to actual play
      //   // if (
      //   //   byUser &&
      //   //   video.videoShouldPreview &&
      //   //   typeof index === "number" &&
      //   //   // Verify the video is actively previewing before triggering play
      //   //   // This prevents unwanted play toggles when video is not in hover/preview state
      //   //   baseContextManager.checkIfVideoPreviewActive({ index })
      //   // ) {
      //   //   togglePlay(byUser);
      //   // }

      //   // If preview mode is active and user is trying to unmute video and video is paused than play it.
      //   // if (
      //   //   byUser &&
      //   //   video.videoShouldPreview &&
      //   //   muted &&
      //   //   !baseEventBus.getContext().globalPlayingState
      //   // ) {
      //   //   baseEventBus.emit("globalPlayingStateChange", undefined, {
      //   //     ...baseEventBus.getContext(),
      //   //     globalPlayingState: true,
      //   //   });
      //   // }

      //   // Conditionally update the mute state based on bypassMuteChange flag
      //   // bypassMuteChange=true: Skip mute state change (used when showing custom mute UI during preview)
      //   // bypassMuteChange=false/undefined: Normal behavior - toggle the mute state
      //   // This allows the UI to show a muted icon during preview without actually muting the player
      //   if (!bypassMuteChange) {
      //     setMuted((oldMuted) => !oldMuted);
      //   }
      //   return;
      // }
      if (byUser) {
        if (muted) {
          setButtonAction("UNMUTE");
          track(EventName.VIDEO_UNMUTED, {
            ...baseAnalyticsData,
            by_user: true,
          });
        } else {
          setButtonAction("MUTE");
          track(EventName.VIDEO_MUTED, {
            ...baseAnalyticsData,
            by_user: true,
          });
        }
      }
      setMuted((oldMuted) => !oldMuted);
    },
    [setMuted, muted, track, EventName, baseAnalyticsData],
  );

  // mute: Mutes the player.
  const mute = useCallback(
    (byUser: boolean) => {
      setMuted(true);
      if (byUser) {
        setButtonAction("MUTE");
        track(EventName.VIDEO_MUTED, {
          ...baseAnalyticsData,
        });
      }
    },
    [setMuted, track, EventName.VIDEO_MUTED, baseAnalyticsData],
  );

  // unmute: Unmutes the player.
  const unmute = useCallback(
    (byUser: boolean) => {
      setMuted(false);
      if (byUser) {
        setButtonAction("UNMUTE");
      }
    },
    [setMuted],
  );

  /*
  Note: We only fire the impression event here when the video ends—either by user stop or auto-loop.
  In all other cases, scrolling will trigger the impression event automatically.
*/
  const handleEnded = useCallback(() => {
    console.log("[feed-player]: handleEnded called", {
      isEmbed,
      explicitLoop,
      isIHeartLayout,
      websiteType,
      repeatCount: playerConfigRef.current.repeatCount,
      shouldSwipeNext: playerConfigRef.current.shouldSwipeNext,
    });
    // If explicit loop is set to true, just replay the video indefinitely
    if (explicitLoop) {
      playerRef.current?.play();
      if (globalPlayState) {
        handleVideoImpression({
          videoId,
          previousActiveIndex: activeIndex,
          impressionSource: "end",
        });
      }
      return;
    }
    if (isIHeartLayout)
      baseContextManager.setVideoWatched({ videoId, isWatched: true });

    if (isIHeartLayout && websiteType === "legacy") {
      if (globalPlayState) {
        handleVideoImpression({
          videoId,
          previousActiveIndex: activeIndex,
          impressionSource: "end",
        });
      }
      if (
        embedDetails?.embedEventBus.getContext().activePlayerType ===
        "expand-view"
      ) {
        swiper?.slideNext();
      } else {
        setButtonAction("PAUSE");
        setFeedPlayerShouldPlay(false);
      }
      return;
    }

    // In case of embed regardless of shouldSwipeNext it should go to next
    if (isEmbed) {
      onPlayerIterationEnd();
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
    // Only do this if the video actually reached its natural end
    // (not due to an ad error that might cause premature ending)
    if (repeatCount > 0) {
      playerConfigRef.current.repeatCount--;
      playerRef.current?.play();
      baseContextManager.setVideoWatched({ videoId, isWatched: false });
      handleVideoImpression({
        videoId,
        previousActiveIndex: activeIndex,
        impressionSource: "end",
      });
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
    explicitLoop,
    isIHeartLayout,
    swiper,
    websiteType,
    onPlayerIterationEnd,
    handleVideoImpression,
    globalPlayState,
  ]);

  const updateAdInfo = useCallback(
    (isAdPlaying: boolean, adInfo: AdInfoType) => {
      setAdInfo({ isAdPlaying, adInfo });
      if (isAdPlaying) {
        onAdStarted?.(adInfo);
      } else {
        onAdEnded?.(adInfo);
      }
    },
    [onAdEnded, onAdStarted],
  );

  /**
   * Middleware wrapper for setPlayingState to add custom conditions/logic
   * before updating the playing state.
   */
  const setPlayingStateMiddleware = useCallback(
    (
      newState:
        | PlayingStateType
        | ((prevState: PlayingStateType) => PlayingStateType),
    ) => {
      const isPreviewActive =
        index !== undefined
          ? baseContextManager.checkIfVideoPreviewActive({
              index,
            })
          : false;

      // If preview is active don't change the play/pause status of video.
      if (isPreviewActive) {
        return;
      }

      // Call the original setPlayingState
      setPlayingState(newState);
    },
    [baseContextManager, index],
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
    seek,
    muted,
    toggleMuted,
    mute,
    unmute,

    handleEnded,

    // State
    videoId,

    playingState,
    setPlayingState: setPlayingStateMiddleware,

    buttonAction,

    playerConfigRef,

    showExpandView,
    toggleExpandView,

    adInfo: adInfo.adInfo,
    isAdPlaying: adInfo.isAdPlaying,
    updateAdInfo,
    positionIndex: index,
    totalVideos,
    setIsLoading,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
