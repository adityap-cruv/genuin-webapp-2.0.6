import { cn } from "@genuin/ui/lib/utils";
import { EmbedTile } from "../embed-tile";
import { ComponentProps, useCallback, useEffect, useState } from "react";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedManagerContext } from "./context";
import { useDebounceCallback } from "usehooks-ts";
import { useBaseContext, useEmbedContext } from "@genuin/components/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { GenericData } from "@genuin/components/context/base/feed-context-manager";
import { Swiper } from "swiper/types";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { isSlideVisible } from "./utils";

type EmbedItemProps = Omit<
  ComponentProps<typeof EmbedTile>,
  "onPlayerIterationEnd" | "isActive"
> & {
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
};

export function EmbedItem({
  index,
  postDetails,
  totalVideos,
  swiper,
  itemSize,
  ...restProps
}: EmbedItemProps) {
  const { updateActiveIndex, goToNextVideo, activeIndex } =
    useEmbedManagerContext();
  const config = useEmbedConfigs();
  const { baseContextManager } = useBaseContext();
  const { embedEventBus, updateSelectedSection } = useEmbedContext();
  const { isTablet, isMobile } = useDeviceDetection();
  const [isHovering, setIsHovering] = useState(false);
  const [embedIsActive, setEmbedIsActive] = useState(
    embedEventBus.getContext().activePlayerType === "embed",
  );
  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(
    postDetails.video?.isWatched ||
      (baseContextManager.getVideoState(postDetails.video?.id || "")
        ?.isWatched ??
        false),
  );
  const isSectioned = embedEventBus.getContext().isSectioned;
  const moveToNext = !config.video.videoLoop;
  const moveToNextTime = config.video.moveToNextTime;

  useEffect(() => {
    if (config.view.brandLayoutType !== "iheart") return;
    function handleVideoWatched(payload: Partial<GenericData>) {
      if (postDetails.video?.id === payload?.videoId)
        setIsVideoWatched(payload?.isVideoWatched ?? false);
    }

    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, [config]);

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType,
    ) => {
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
    config.video.videoShouldPreview ? 300 : 700,
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

      if (
        (config.view.isPlacementView && !config.video.autoScrollToNextSlide) ||
        !moveToNext
      )
        return;

      const useAutoScroll =
        config.view.isPlacementView && config.video.autoScrollToNextSlide;
      goToNextVideo(useAutoScroll);
    },
    [goToNextVideo, config, moveToNext, moveToNextTime],
  );

  // Auto-advance logic: Move to next video after moveToNextTime seconds
  useEffect(() => {
    const isGridLayout = config.view.isGrid;

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
      postDetails.type === "ads"
    ) {
      return;
    }

    // Determine if we can move to next video based on layout type
    let shouldMove = false;

    if (isGridLayout) {
      // Grid layout: Check if we have more videos to advance to
      const gridRow = config.view.gridLayout?.row || 1;
      const gridCol = config.view.gridLayout?.column || 1;
      const totalVideos = gridRow * gridCol;
      shouldMove = activeIndex < totalVideos - 1;
    } else {
      // Feed/Carousel layout: Check if swiper exists and has more slides
      if (swiper) {
        const nextIndex = activeIndex + 1;
        const isVirtualEnabled = swiper.params.virtual && swiper.virtual;
        const totalSlides = isVirtualEnabled
          ? (swiper.virtual?.slides?.length ?? 0)
          : (swiper.slides?.length ?? 0);
        shouldMove = nextIndex < totalSlides;
      }
    }

    // Only set up auto-advance timer if we can move to next video
    if (!shouldMove) {
      return;
    }

    const timer = setTimeout(() => {
      const isVideoPlaying = baseContextManager.isAnyVideoPlaying();
      if (isVideoPlaying) goToNextVideo();
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
    baseContextManager,
    postDetails
  ]);

  return (
    <EmbedTile
      className={cn("gencl:cursor-pointer")}
      postDetails={postDetails}
      isActive={
        activeIndex === index &&
        embedIsActive &&
        (config.view.brandLayoutType !== "iheart" || !isVideoWatched)
      }
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
      {...restProps}
    />
  );
}
