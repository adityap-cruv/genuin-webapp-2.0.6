import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useState } from "react";
import type { Swiper } from "swiper/types";
import { useDebounceCallback } from "usehooks-ts";

import { useBaseContext, useEmbedContext } from "@genuin/components/context";
import type { GenericData } from "@genuin/components/context/base/feed-context-manager";
import type { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";

import { EmbedTile } from "../embed-tile";

import { useEmbedManagerContext } from "./context";
import { isSlideVisible } from "./utils";

type EmbedItemProps = Omit<ComponentProps<typeof EmbedTile>, "onPlayerIterationEnd" | "isActive"> & {
  index: number;
  /**
   * number of total videos in feed.
   */
  totalVideos: number;
  /**
   * Swiper instance for the video player.
   */
  swiper: Swiper | null;
  /**
   * Height and width of the video player, used for analytics and ad configuration.
   */
  itemSize: {
    height: number;
    width: number;
  };
  /** Feed-session identifier from the first feed API page, forwarded to analytics as `page_session`. */
  pageSession?: string | null;
};

export function EmbedItem({
  index,
  postDetails,
  totalVideos,
  swiper,
  itemSize,
  pageSession,
  ...restProps
}: EmbedItemProps) {
  const { updateActiveIndex, goToNextVideo, activeIndex } = useEmbedManagerContext();
  const config = useEmbedConfigs();
  const { isPlaying, baseContextManager } = useBaseContext();
  const { embedEventBus, updateSelectedSection } = useEmbedContext();
  const { isTablet, isMobile } = useDeviceDetection();
  const [isHovering, setIsHovering] = useState(false);
  const [embedIsActive, setEmbedIsActive] = useState(embedEventBus.getContext().activePlayerType === "embed");
  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(
    postDetails.video?.isWatched || (baseContextManager.getVideoState(postDetails.video?.id || "")?.isWatched ?? false)
  );
  const isSectioned = embedEventBus.getContext().isSectioned;
  const moveToNext = !config.video.videoLoop;
  const moveToNextTime = config.video.moveToNextTime;
  const { getContentTypeState } = useSheetState();
  const octoSheetState = getContentTypeState("octo");
  const isOctoVisible = octoSheetState === "panel-view" || octoSheetState === "full-view";

  useEffect(() => {
    if (config.view.brandLayoutType !== "iheart") return;
    function handleVideoWatched(payload: Partial<GenericData>) {
      if (postDetails.video?.id === payload?.videoId) setIsVideoWatched(payload?.isVideoWatched ?? false);
    }

    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, [config]);

  useEffect(() => {
    const handleActivePlayerTypeChange = (eventData: any, context: EmbedEventContextType) => {
      if (context.activePlayerType === "embed") {
        setEmbedIsActive(true);
      } else {
        setEmbedIsActive(false);
      }
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus]);

  const setActiveIndexCallback = useCallback(() => {
    if (config.view.websiteType === "legacy") return;
    updateActiveIndex(index, true);
  }, [config.view.websiteType, updateActiveIndex, index]);

  const debouncedSetActiveIndex = useDebounceCallback(
    setActiveIndexCallback,
    config.video.videoShouldPreview ? 300 : 700
  );

  const handleMouseEnter = useCallback(() => {
    if (isTablet || isMobile) return;
    setIsHovering(true);
    if (swiper && isSlideVisible(swiper, index)) {
      debouncedSetActiveIndex();
    }
  }, [isTablet, isMobile, debouncedSetActiveIndex, index]);

  const handleMouseLeave = useCallback(() => {
    debouncedSetActiveIndex.cancel();
    if (isTablet || isMobile) return;
    setIsHovering(false);
  }, [isTablet, isMobile, debouncedSetActiveIndex]);

  // Handle automatic progression when video ends
  const handlePlayerIterationEnd = useCallback(
    (move?: boolean) => {
      // Use intelligent auto-scroll for placement view when enabled

      if (move) {
        goToNextVideo(true);
        return;
      }

      // Immediate move to next video for grid layout when moveToNextTime(full video complete) is 0
      if (moveToNext && moveToNextTime === 0) {
        goToNextVideo();
        return;
      }

      if ((config.view.isPlacementView && !config.video.autoScrollToNextSlide) || !moveToNext) return;

      const useAutoScroll = config.view.isPlacementView && config.video.autoScrollToNextSlide;
      goToNextVideo(useAutoScroll);
    },
    [goToNextVideo, config, moveToNext, moveToNextTime]
  );

  // Auto-advance logic: Move to next video after moveToNextTime seconds
  useEffect(() => {
    const isGridLayout = config.view.isGrid;
    const isSponsored = postDetails.video?.cardLayoutId === 7; // Sponsored content is determined by cardLayoutId 7

    // Only auto-advance if:
    // 1. This tile is currently active
    // 2. moveToNextTime is greater than 0
    // 3. moveToNext is true (video looping is disabled)
    // 4. activePlayerType is "embed" (not in expand view)
    // 5. user is not hovering over this tile
    // 6. video is in active playing state.
    if (
      activeIndex !== index ||
      moveToNextTime === 0 ||
      !moveToNext ||
      embedEventBus.getContext().activePlayerType !== "embed" ||
      isHovering ||
      postDetails.type === "ads" ||
      isSponsored ||
      isOctoVisible ||
      !isPlaying
    ) {
      return;
    }

    // Determine if we can move to next video based on layout type
    let shouldMove = false;

    if (isGridLayout) {
      // Grid layout: Allowing auto-advance for looping (will loop back to first video)
      shouldMove = true;
    } else {
      // Feed/Carousel layout: Check if swiper exists and has more slides
      if (swiper) {
        const nextIndex = activeIndex + 1;
        const isVirtualEnabled = swiper.params.virtual && swiper.virtual;
        const totalSlides = isVirtualEnabled ? (swiper.virtual?.slides?.length ?? 0) : (swiper.slides?.length ?? 0);
        shouldMove = nextIndex < totalSlides;
      }
    }

    // Only set up auto-advance timer if we can move to next video
    if (!shouldMove) {
      return;
    }

    const timer = setTimeout(() => {
      // Read all three flags from the mutable tracker at fire time — avoids stale
      // closure over the React `isPlaying` state which may not reflect a mid-timer pause.
      const playPauseTracker = baseContextManager.getPlayPauseTracker();
      const shouldeMoveToNextVideo =
        playPauseTracker.isPlaying && playPauseTracker.isFocused && playPauseTracker.isInView;
      if (shouldeMoveToNextVideo) goToNextVideo();
    }, moveToNextTime * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    activeIndex,
    index,
    config,
    moveToNext,
    goToNextVideo,
    embedEventBus,
    swiper,
    isHovering,
    moveToNextTime,
    isPlaying,
    postDetails,
    baseContextManager,
    isOctoVisible,
  ]);

  return (
    <EmbedTile
      className={cn("gencl:cursor-pointer")}
      postDetails={postDetails}
      isActive={activeIndex === index && embedIsActive && (config.view.brandLayoutType !== "iheart" || !isVideoWatched)}
      onPlayerIterationEnd={handlePlayerIterationEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (isSectioned) {
          updateSelectedSection(postDetails.section);
        }
        updateActiveIndex(index);
      }}
      index={index}
      swiper={swiper}
      totalVideos={totalVideos}
      itemSize={itemSize}
      pageSession={pageSession}
      {...restProps}
    />
  );
}
