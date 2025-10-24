import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Swiper as SwiperType } from "swiper/types";
import {
  getNavigationAction,
  isSlideVisible,
  getVisibleSlideRange,
  getNewActiveIndexOnSlideChange,
} from "./utils";
import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type EmbedManagerContextType = {
  /**
   * The currently active index of the embed.
   */
  activeIndex: number;
  /**
   * Updates the active index of the embed.
   * @param index The new active index.
   * @returns void
   */
  updateActiveIndex: (index: number) => void;
  /**
   * Function to go to the next video in the embed.
   * @param useAutoScroll Whether to use intelligent auto-scroll positioning (default: false)
   * @returns void
   */
  goToNextVideo: (useAutoScroll?: boolean) => void;
  /**
   * Function to go to the previous video in the embed.
   * @returns void
   */
  goToPreviousVideo: () => void;
};

const EmbedManagerContext = createContext<EmbedManagerContextType | undefined>(
  undefined
);

type EmbedManagerProviderProps = {
  children: React.ReactNode;
  swiper: SwiperType | null;
};

export function EmbedManagerProvider({
  children,
  swiper,
}: EmbedManagerProviderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousVisibleRange, setPreviousVisibleRange] = useState({
    first: 0,
    last: 0,
  });
  const { embedEventBus, changeActiveIndex } = useEmbedContext();
  const config = useEmbedConfigs();
  const isGridLayout = config.view.isGrid;
  const moveToNext = !config.video.videoLoop;
  const moveToNextTime = config.video.moveToNextTime;

  const isIHeart = config.view.brandLayoutType === "iheart";

  /**
   * Handles iHeart-specific slide navigation logic
   * @param direction - The direction to navigate ('next' or 'prev')
   * @param currentIndex - The current active index
   * @returns void
   */
  const handleIHeartNavigation = useCallback(
    (direction: "next" | "prev") => {
      if (!swiper) return;

      // Calculate slide offset - always round to get full viewport scroll
      const slidesPerView = (swiper.params.slidesPerView as number) || 1;
      const slideOffset = Math.round(slidesPerView);
      const currentIndex = swiper.activeIndex;

      // Calculate target slide index based on direction
      let targetSlideIndex =
        direction === "next"
          ? currentIndex + slideOffset
          : currentIndex - slideOffset;

      // Calculate which slide will be first visible after scrolling
      // When centered, the first visible slide is offset by half the viewport
      let newActiveIndex = swiper.params.centeredSlides
        ? targetSlideIndex - Math.floor(slidesPerView / 2)
        : targetSlideIndex;

      // Apply bounds checking to prevent negative indices
      targetSlideIndex = targetSlideIndex < 0 ? 0 : targetSlideIndex;
      newActiveIndex = newActiveIndex < 0 ? 0 : newActiveIndex;

      swiper.slideTo(targetSlideIndex);
      setActiveIndex(newActiveIndex);
    },
    [swiper]
  );

  // Trigger changeActiveIndex whenever activeIndex changes
  useEffect(() => {
    changeActiveIndex(activeIndex);
  }, [activeIndex, changeActiveIndex]);

  // Track visible range changes
  useEffect(() => {
    if (isGridLayout) {
      // For grid layout, all slides are visible
      setPreviousVisibleRange({ first: 0, last: Number.MAX_SAFE_INTEGER });
      return;
    }

    if (!swiper) return;

    const range = getVisibleSlideRange(swiper);
    setPreviousVisibleRange(range);
  }, [swiper?.activeIndex, swiper, isGridLayout]);

  useEffect(() => {
    if (isGridLayout) return; // Skip for grid layout
    if (!swiper) return;

    function handleSlideChange(swiper: SwiperType) {
      // If current activeIndex is going out of visible bounds, update it intelligently
      if (!isSlideVisible(swiper, activeIndex)) {
        const newActiveIndex = getNewActiveIndexOnSlideChange(
          swiper,
          activeIndex,
          previousVisibleRange
        );
        setActiveIndex(newActiveIndex);
      }
    }

    swiper.on("slideChange", handleSlideChange);
    return () => {
      swiper.off("slideChange", handleSlideChange);
    };
  }, [swiper, activeIndex, previousVisibleRange, isGridLayout]);

  const updateActiveIndex = useCallback(
    (index: number) => {
      if (isGridLayout) {
        // In grid layout, all indices are valid
        setActiveIndex(index);
        return;
      }

      if (!swiper) return;

      // Only update if the index is currently visible
      if (isSlideVisible(swiper, index)) {
        setActiveIndex(index);
      }
    },
    [swiper, setActiveIndex, isGridLayout]
  );

  const goToNextVideo = useCallback(
    (useAutoScroll: boolean = false) => {
      if (isGridLayout) {
        // For grid layout, just increment the index
        setActiveIndex((prevIndex) => prevIndex + 1);
        return;
      }

      if (!swiper) return;

      const nextIndex = activeIndex + 1;
      const totalSlides = swiper.slides?.length || 0;

      // Check if we've reached the end
      if (nextIndex >= totalSlides) {
        return;
      }
      if (useAutoScroll) {
        // Use intelligent auto-scroll positioning for placement view
        const isNextVisible = isSlideVisible(swiper, nextIndex);

        // Always scroll to next video to bring it into optimal view
        // This ensures even the last video scrolls into view if viewport is small
        if (!isNextVisible || nextIndex === totalSlides - 1) {
          if (isIHeart) {
            // For iHeart, use the standard navigation logic to handle centeredSlides
            handleIHeartNavigation("next");
          } else {
            swiper.slideTo(nextIndex, 300, true);
            // Always update the active index to next video
            setActiveIndex(nextIndex);
          }
        } else {
          // Next slide is visible, just update the active index
          setActiveIndex(nextIndex);
        }
      } else {
        if (!moveToNext) return;

        // Default behavior: use standard navigation action
        const { shouldSlide, targetIndex } = getNavigationAction(
          swiper,
          activeIndex,
          "next"
        );

        if (isIHeart) {
          handleIHeartNavigation("next");
        } else {
          // Always slide to ensure swiper navigation happens
          if (shouldSlide) {
            swiper.slideNext();
          }
          setActiveIndex(targetIndex);
        }
      }
    },
    [
      swiper,
      activeIndex,
      isGridLayout,
      isIHeart,
      handleIHeartNavigation,
      moveToNext,
    ]
  );

  const goToPreviousVideo = useCallback(() => {
    if (isGridLayout) {
      // For grid layout, just decrement the index
      setActiveIndex((prevIndex) => Math.max(0, prevIndex - 1));
      return;
    }

    if (!swiper) return;

    const { shouldSlide, targetIndex } = getNavigationAction(
      swiper,
      activeIndex,
      "prev"
    );

    if (isIHeart) {
      handleIHeartNavigation("prev");
    } else {
      // Always slide to ensure swiper navigation happens
      if (shouldSlide) {
        swiper.slidePrev();
      }
      setActiveIndex(targetIndex);
    }

    // Only update active index if we shouldn't slide automatically
    // here targetIndex's 0 check is for handling edge case
    // if (!shouldSlide || targetIndex === 0) {
    // }
  }, [swiper, activeIndex, isGridLayout, isIHeart, handleIHeartNavigation]);

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "embed") {
        if (isGridLayout) {
          // For grid layout, just set the active index
          setActiveIndex(context.activeIndex);
        } else if (swiper) {
          if (isSlideVisible(swiper, context.activeIndex)) {
            setActiveIndex(context.activeIndex);
          } else {
            swiper.slideTo(context.activeIndex, 0, false);
            setActiveIndex(context.activeIndex);
          }
        }
      }
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [swiper, isGridLayout]);

  // Auto-advance logic: Move to next video after moveToNextTime seconds
  useEffect(() => {
    // Only auto-advance if:
    // 1. moveToNextTime is greater than 0
    // 2. moveToNext is true (video looping is disabled)
    // 3. activePlayerType is "embed" (not in expand view)
    if (
      moveToNextTime === 0 ||
      !moveToNext ||
      embedEventBus.getContext().activePlayerType !== "embed"
    ) {
      return;
    }

    const timer = setTimeout(() => {
      goToNextVideo();
    }, moveToNextTime * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [activeIndex, moveToNextTime, moveToNext, goToNextVideo, embedEventBus]);

  return (
    <EmbedManagerContext.Provider
      value={{
        activeIndex,
        updateActiveIndex,
        goToNextVideo,
        goToPreviousVideo,
      }}
    >
      {children}
    </EmbedManagerContext.Provider>
  );
}

export function useEmbedManagerContext() {
  const context = useContext(EmbedManagerContext);
  if (!context) {
    throw new Error(
      "useEmbedManagerContext must be used within an EmbedManagerProvider"
    );
  }
  return context;
}
