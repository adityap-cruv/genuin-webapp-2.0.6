"use client";

import { useEffect, useRef } from "react";
import { Swiper } from "swiper/types";
import { useEmbedContext } from "@genuin/components/context/embed";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type FetchNextPageHandlerProps = {
  videos: any[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  swiper: Swiper | null;
};

/**
 * Component to handle fetchNextPage logic using swiper events
 * This component doesn't render anything visible - it only handles pagination logic
 */
export function FetchNextPageHandler({
  videos,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  swiper,
}: FetchNextPageHandlerProps) {
  const lastTriggeredAtProgressRef = useRef<number>(-1);
  const { embedEventBus } = useEmbedContext();
  const { useWindowSwiperMode } = useEmbedConfigs();

  useEffect(() => {
    // TODO: Temporarily enabled this logic to call next page as native-scroll-swiper's progress events are getting stopped after first scroll will fix it later.
    if (!useWindowSwiperMode) return;
    function handleActiveIndexChange() {
      const activeIndex = embedEventBus.getContext().activeIndex;

      if (
        activeIndex >= videos.length - 3 &&
        !isFetchingNextPage &&
        hasNextPage
      ) {
        fetchNextPage();
      }
    }

    embedEventBus.on("activeIndexChange", handleActiveIndexChange);

    return () => {
      embedEventBus.off("activeIndexChange", handleActiveIndexChange);
    };
  }, [embedEventBus, videos, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!swiper) return;

    function checkAndFetchNextPage() {
      const context = embedEventBus.getContext();

      // Early exit conditions
      if (
        !swiper ||
        videos.length === 0 ||
        !hasNextPage ||
        isFetchingNextPage ||
        context.activePlayerType === "expand-view"
      ) {
        return;
      }

      // Calculate trigger point (when 4 slides remain)
      const totalSlides = videos.length;
      const triggerSlideIndex = totalSlides - 4;

      if (triggerSlideIndex <= 0) return; // Need at least 4 slides

      const triggerProgress = 0.7; // Fixed at 70% for simplicity
      const currentProgress = swiper.progress;

      // Check if we've crossed the trigger threshold
      if (
        currentProgress >= triggerProgress &&
        lastTriggeredAtProgressRef.current < triggerProgress
      ) {
        lastTriggeredAtProgressRef.current = currentProgress;
        fetchNextPage();
      }
    }

    // Use progress event for real-time tracking
    const handleProgress = () => {
      checkAndFetchNextPage();
    };

    swiper.on("progress", handleProgress);

    return () => {
      swiper.off("progress", handleProgress);
    };
  }, [swiper, fetchNextPage, hasNextPage, isFetchingNextPage, videos.length]);

  // Reset tracking when videos length changes (new data loaded)
  useEffect(() => {
    if (videos.length > 0) {
      lastTriggeredAtProgressRef.current = -1;
    }
  }, [videos.length]);

  return null; // This component doesn't render anything
}
