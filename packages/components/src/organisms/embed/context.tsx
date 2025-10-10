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
   * @returns void
   */
  goToNextVideo: () => void;
  /**
   * Function to go to the previous video in the embed.
   * @returns void
   */
  goToPreviousVideo: () => void;
  /**
   * Whether to automatically move to the next video.
   * When false, videos will loop but manual navigation is still allowed.
   */
  moveToNext: boolean;
};

const EmbedManagerContext = createContext<EmbedManagerContextType | undefined>(
  undefined
);

type EmbedManagerProviderProps = {
  children: React.ReactNode;
  swiper: SwiperType | null;
  isGridLayout?: boolean;
  moveToNext?: boolean;
  moveToNextTime?: number;
};

export function EmbedManagerProvider({
  children,
  swiper,
  isGridLayout = false,
  moveToNext = true,
  moveToNextTime = 0,
}: EmbedManagerProviderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousVisibleRange, setPreviousVisibleRange] = useState({
    first: 0,
    last: 0,
  });
  const { embedEventBus, changeActiveIndex } = useEmbedContext();

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

  const goToNextVideo = useCallback(() => {
    if (isGridLayout) {
      // For grid layout, just increment the index
      setActiveIndex((prevIndex) => prevIndex + 1);
      return;
    }

    if (!swiper) return;

    const { shouldSlide, targetIndex } = getNavigationAction(
      swiper,
      activeIndex,
      "next"
    );

    // Always slide to ensure swiper navigation happens
    swiper.slideNext();

    // Only update active index if we shouldn't slide automatically
    if (!shouldSlide) {
      setActiveIndex(targetIndex);
    }
  }, [swiper, activeIndex, isGridLayout]);

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

    // Always slide to ensure swiper navigation happens
    swiper.slidePrev();

    // Only update active index if we shouldn't slide automatically
    if (!shouldSlide) {
      setActiveIndex(targetIndex);
    }
  }, [swiper, activeIndex, isGridLayout]);

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
  }, [
    activeIndex,
    moveToNextTime,
    moveToNext,
    goToNextVideo,
    embedEventBus,
  ]);

  return (
    <EmbedManagerContext.Provider
      value={{
        activeIndex,
        updateActiveIndex,
        goToNextVideo,
        goToPreviousVideo,
        moveToNext,
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
