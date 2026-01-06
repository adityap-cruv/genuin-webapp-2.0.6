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
};

export function EmbedItem({
  index,
  postDetails,
  totalVideos,
  swiper,
  ...restProps
}: EmbedItemProps) {
  const { updateActiveIndex, goToNextVideo, activeIndex } =
    useEmbedManagerContext();
  const config = useEmbedConfigs();
  const { baseContextManager } = useBaseContext();
  const { embedEventBus, updateSelectedSection } = useEmbedContext();
  const { isTablet, isMobile } = useDeviceDetection();
  const [embedIsActive, setEmbedIsActive] = useState(
    embedEventBus.getContext().activePlayerType === "embed"
  );
  const [isVideoWatched, setIsVideoWatched] = useState<boolean>(
    postDetails.video.isWatched ||
      (baseContextManager.getVideoState(postDetails.video.id)?.isWatched ??
        false)
  );
  const isSectioned = embedEventBus.getContext().isSectioned;
  const moveToNext = !config.video.videoLoop;

  useEffect(() => {
    if (config.view.brandLayoutType !== "iheart") return;
    function handleVideoWatched(payload: Partial<GenericData>) {
      if (postDetails.video.id === payload?.videoId)
        setIsVideoWatched(payload.isVideoWatched ?? false);
    }

    baseContextManager.on("onVideoWatchedChanged", handleVideoWatched);
    return () => {
      baseContextManager.off("onVideoWatchedChanged", handleVideoWatched);
    };
  }, [config]);

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
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

  const debouncedSetActiveIndex = useDebounceCallback(
    () => {
      if (config.view.websiteType === "legacy") return;
      // TODO: This is patch work - needs refactoring for better clarity and maintainability
      // For iheart layout, disable default hover behavior to activate video.
      // iHeart uses its own hover preview system instead of activating the video on hover.
      if (config.video.videoShouldPreview) {
        // Check if this specific video should be allowed to preview
        // if (
        //   !baseContextManager.checkIfVideoShouldPreview({
        //     videoId: postDetails.video.id,
        //   })
        // ) {
        //   // Video should not preview - handle index updates
        //   // if (activeIndex !== index) {
        //   //   // Update to this index if it's not already active
        //   //   updateActiveIndex(index, true);
        //   // } else {
        //   //   // If already active, emit event to play from last known position
        //   //   baseContextManager.emit("playLastKnownIndex", {
        //   //     isVideoWatched: false,
        //   //     videoId: postDetails.video.id,
        //   //     previewIndex: index,
        //   //   });
        //   // }
        //   // baseContextManager.updateLastActiveIndex({ index });
        // }
        // Video should preview - exit early without further action
        return;
      }

      updateActiveIndex(index, true);
    },
    config.video.videoShouldPreview ? 300 : 700
  );

  const handleMouseEnter = useCallback(() => {
    if (isTablet || isMobile) return;
    debouncedSetActiveIndex();
  }, [debouncedSetActiveIndex]);

  const handleMouseLeave = useCallback(() => {
    if (isTablet || isMobile) return;
    debouncedSetActiveIndex.cancel();
  }, [debouncedSetActiveIndex]);

  // Handle automatic progression when video ends
  const handlePlayerIterationEnd = useCallback(() => {
    // Use intelligent auto-scroll for placement view when enabled
    if (
      (config.view.isPlacementView && !config.video.autoScrollToNextSlide) ||
      !moveToNext
    )
      return;

    const useAutoScroll =
      config.view.isPlacementView && config.video.autoScrollToNextSlide;
    goToNextVideo(useAutoScroll);
  }, [goToNextVideo, config, moveToNext]);
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
      {...restProps}
    />
  );
}
