"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Swiper as SwiperType } from "swiper/types";
import {
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
    force?: boolean,
  ) => void;
  /**
   * Function to go to the next video in the embed.
   * @param useAutoScroll Whether to use intelligent auto-scroll positioning (default: false)
   * @param forceNextMove - Forces navigation to the next video (used for next button actions). Defaults to false.
   * @returns void
   */
  goToNextVideo: (useAutoScroll?: boolean, forceNextMove?: boolean) => void;
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
  undefined,
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
      const isVirtualEnabled = swiper.params.virtual && swiper.virtual;
      const totalSlides = isVirtualEnabled
        ? (swiper.virtual?.slides?.length ?? 0)
        : (swiper.slides?.length ?? 0);

      // Calculate the number of slides to jump
      // For slidesPerView like 2.2, we want to jump by 2 (floor of the value)
      // This means we skip the fully visible slides and land on the peeking slide
      const slidesToJump = Math.floor(slidesPerView);

      let targetIndex: number;

      if (direction === "next") {
        // Navigate forward by slidesToJump positions
        targetIndex = Math.min(
          currentActiveIndex + slidesToJump,
          totalSlides - 1,
        );
      } else {
        // Navigate backward by slidesToJump positions
        targetIndex = Math.max(currentActiveIndex - slidesToJump, 0);
      }

      // Slide to the calculated target index
      swiper.slideTo(targetIndex, 300);
      const websiteType = config.view.websiteType;
      if (websiteType === "legacy") return;
      setActiveIndex(targetIndex);
    },
    [swiper],
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

  // Handle slide change events
  // React re-registers this handler when dependencies change, ensuring fresh values
  useEffect(() => {
    if (isGridLayout) return; // Skip for grid layout
    if (!swiper) return;

    function handleSlideChange(swiper: SwiperType) {
      /**
       *  For the iHeart legacy embed layout, we skip updating the activeIndex
          when a slide comes into view. This aligns with the legacy behavior where
          videos can only be played or paused through user interaction.
          This ensures that videos do not auto-play when they enter the viewport
          and require manual user action to start playback.
       */
      if (config.view.websiteType === "legacy") return;

      // If current activeIndex is going out of visible bounds, update it intelligently
      if (!isSlideVisible(swiper, activeIndex)) {
        const newActiveIndex = Math.floor(
          getNewActiveIndexOnSlideChange(
            swiper,
            activeIndex,
            previousVisibleRange,
          ),
        );
        setActiveIndex(newActiveIndex);
      } else if (config.useWindowSwiperMode) {
        setActiveIndex(swiper.activeIndex);
      }
    }

    swiper.on("slideChange", handleSlideChange);
    return () => {
      swiper.off("slideChange", handleSlideChange);
    };
  }, [swiper, isGridLayout, activeIndex, previousVisibleRange]);

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
          if (!config.useWindowSwiperMode && visibilityPercentage < 70) {
            swiper.slideTo(index, 300);
          }
          if (
            config.useWindowSwiperMode &&
            (swiper as any).getVisibilityPercentageByIndex(index) < 70
          ) {
            swiper.slideTo(index);
          }
        }
      }
    },
    [swiper, setActiveIndex, isGridLayout, config.view.isFeed],
  );

  const goToNextVideo = useCallback(
    (useAutoScroll: boolean = false, forceNextMove: boolean = false) => {
      if (isGridLayout) {
        // For grid layout, increment the index and loop back to 0 at the end
        setActiveIndex((prevIndex) => {
          const gridRow = config.view.gridLayout?.row || 1;
          const gridCol = config.view.gridLayout?.column || 1;
          const totalVideos = gridRow * gridCol;
          return (prevIndex + 1) % totalVideos;
        });
        return;
      }

      if (!swiper) return;

      const nextIndex = activeIndex + 1;
      const isVirtualEnabled = swiper.params.virtual && swiper.virtual;
      const totalSlides = isVirtualEnabled
        ? (swiper.virtual?.slides?.length ?? 0)
        : (swiper.slides?.length ?? 0);

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
        // Default behavior: use standard navigation action
        const targetIndex = Math.max(0, activeIndex + 1);
        const visibilityPercentage = getSlideVisibilityPercentage({
          index: activeIndex + 1,
          dir: config.view.isFeed ? "vertical" : "horizontal",
        });
        if (forceNextMove) {
          handleIHeartNavigation("next");
        } else {
          // Always slide to ensure swiper navigation happens
          if (visibilityPercentage < 100) {
            swiper.slideNext();
          }
          setActiveIndex(targetIndex);
        }
      }
    },
    [swiper, activeIndex, isGridLayout, isIHeart, handleIHeartNavigation],
  );

  const goToPreviousVideo = useCallback(() => {
    if (isGridLayout) {
      // For grid layout, just decrement the index
      setActiveIndex((prevIndex) => Math.max(0, prevIndex - 1));
      return;
    }

    if (!swiper) return;

    handleIHeartNavigation("prev");
  }, [swiper, activeIndex, isGridLayout, isIHeart, handleIHeartNavigation]);

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType,
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

  // Handle focus changes via tab navigation
  // useEffect(() => {
  //   if (!swiper) return;

  //   const handleFocusIn = (event: FocusEvent) => {
  //     const focusedElement = event.target as HTMLElement;

  //     // Find the closest slide element
  //     const slideElement = focusedElement.closest(
  //       ".swiper-slide",
  //     ) as HTMLElement;
  //     if (!slideElement) return;

  //     // Get the slide index from the swiper slides array
  //     const slides = Array.from(swiper.slides);
  //     const slideIndex = slides.indexOf(slideElement);

  //     if (slideIndex !== -1 && slideIndex !== activeIndex) {
  //       // Update active index when focus changes to a different slide
  //       setActiveIndex(slideIndex);
  //     }
  //   };

  //   // Add event listener to the swiper container
  //   const swiperContainer = swiper.el;
  //   swiperContainer?.addEventListener("focusin", handleFocusIn);

  //   return () => {
  //     swiperContainer?.removeEventListener("focusin", handleFocusIn);
  //   };
  // }, [swiper, activeIndex]);

  const getSlideVisibilityPercentage = useCallback(
    ({ index, dir }: { index: number; dir: "vertical" | "horizontal" }) => {
      if (!swiper) return 0;

      // Find slide element (handle virtual slides)
      const slide =
        swiper.params.virtual && swiper.virtual
          ? (swiper.el.querySelector(
              `[data-swiper-slide-index="${index}"]`,
            ) as HTMLElement)
          : (swiper.slides[index] as HTMLElement);

      if (!slide) return 0;

      const slideRect = slide.getBoundingClientRect();
      const containerRect = swiper.el.getBoundingClientRect();

      if (dir === "vertical") {
        const visibleTop = Math.max(slideRect.top, containerRect.top, 0);
        const visibleBottom = Math.min(
          slideRect.bottom,
          containerRect.bottom,
          window.innerHeight,
        );
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        return slideRect.height > 0
          ? (visibleHeight / slideRect.height) * 100
          : 0;
      } else {
        const visibleLeft = Math.max(slideRect.left, containerRect.left, 0);
        const visibleRight = Math.min(
          slideRect.right,
          containerRect.right,
          window.innerWidth,
        );
        const visibleWidth = Math.max(0, visibleRight - visibleLeft);
        return slideRect.width > 0 ? (visibleWidth / slideRect.width) * 100 : 0;
      }
    },
    [swiper],
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
      "useEmbedManagerContext must be used within an EmbedManagerProvider",
    );
  }
  return context;
}
