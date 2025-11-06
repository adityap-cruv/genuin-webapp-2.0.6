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
   * @param flag if update active index is being called by hover.
   * @param ifInView if we want to update active index only if swiper is in view.
   * @returns void
   */
  updateActiveIndex: (
    index: number,
    byHover?: boolean,
    ifInView?: boolean,
    force?: boolean
  ) => void;
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
  /**
   * The swiper instance.
   */
  swiper: SwiperType | null;
  /**
   * Gets the visibility percentage of a slide at the given index.
   * @param params.index The slide index to check
   * @param params.dir The direction of the layout ('vertical' or 'horizontal')
   * @returns The percentage of the slide that is visible (0-100)
   */
  getSlideVisibilityPercentage: (params: {
    index: number;
    dir: "vertical" | "horizontal";
  }) => number;
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
   * Navigates to the first peeking (partially visible) slide
   * @param direction - The direction to navigate ('next' or 'prev')
   * @returns void
   */
  const handleIHeartNavigation = useCallback(
    (direction: "next" | "prev") => {
      if (!swiper) return;

      const slidesPerView = swiper.params.slidesPerView as number;
      const currentActiveIndex = swiper.activeIndex;
      const totalSlides = swiper.slides?.length || 0;

      // Calculate the number of slides to jump
      // For slidesPerView like 2.2, we want to jump by 2 (floor of the value)
      // This means we skip the fully visible slides and land on the peeking slide
      const slidesToJump = Math.floor(slidesPerView);

      let targetIndex: number;

      if (direction === "next") {
        // Navigate forward by slidesToJump positions
        targetIndex = Math.min(
          currentActiveIndex + slidesToJump,
          totalSlides - 1
        );
      } else {
        // Navigate backward by slidesToJump positions
        targetIndex = Math.max(currentActiveIndex - slidesToJump, 0);
      }

      // Slide to the calculated target index
      swiper.slideTo(targetIndex, 300);
      setActiveIndex(targetIndex);
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
    (index: number, byHover?: boolean, ifInView?: boolean, force?: boolean) => {
      if (force) {
        setActiveIndex(index);
        return;
      }
      // When ifInView flag is set, only update the active index if the slide is currently visible
      // This prevents updating to slides that are off-screen when hover events occur
      if (ifInView && swiper && isSlideVisible(swiper, index)) {
        setActiveIndex(index);
        return;
      }

      if (isGridLayout) {
        // In grid layout, all indices are valid
        setActiveIndex(index);
        return;
      }

      if (!swiper) return;

      // Only update if the index is currently visible
      if (isSlideVisible(swiper, index)) {
        setActiveIndex(index);
      } else {
        if (!byHover) {
          setActiveIndex(index);
          const visibilityPercentage = getSlideVisibilityPercentage({
            index,
            dir: config.view.isFeed ? "vertical" : "horizontal",
          });
          if (visibilityPercentage < 70) {
            swiper.slideTo(index, 300);
          }
        }
      }
    },
    [swiper, setActiveIndex, isGridLayout, config.view.isFeed]
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

  const getSlideVisibilityPercentage = useCallback(
    ({ index, dir }: { index: number; dir: "vertical" | "horizontal" }) => {
      if (!swiper) return 0;
      const slides = swiper.slides;
      const slide = slides[index];
      if (!slide) return 0;

      const slideRect = slide.getBoundingClientRect();
      const containerRect = swiper.el.getBoundingClientRect();

      if (dir === "vertical") {
        // Vertical feed: use height
        const slideTop = Math.max(slideRect.top, containerRect.top);
        const slideBottom = Math.min(slideRect.bottom, containerRect.bottom);
        const visibleHeight = Math.max(0, slideBottom - slideTop);
        const slideHeight = slideRect.height;
        return slideHeight > 0 ? (visibleHeight / slideHeight) * 100 : 0;
      } else {
        // Horizontal carousel: use width
        const slideLeft = Math.max(slideRect.left, containerRect.left);
        const slideRight = Math.min(slideRect.right, containerRect.right);
        const visibleWidth = Math.max(0, slideRight - slideLeft);
        const slideWidth = slideRect.width;
        return slideWidth > 0 ? (visibleWidth / slideWidth) * 100 : 0;
      }
    },
    [swiper]
  );

  return (
    <EmbedManagerContext.Provider
      value={{
        activeIndex,
        updateActiveIndex,
        goToNextVideo,
        goToPreviousVideo,
        swiper,
        getSlideVisibilityPercentage,
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
