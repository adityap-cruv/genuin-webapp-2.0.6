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

  // Trigger changeActiveIndex whenever activeIndex changes
  useEffect(() => {
    changeActiveIndex(activeIndex);
  }, [activeIndex, changeActiveIndex]);

  // Track visible range changes
  useEffect(() => {
    if (!swiper) return;

    const range = getVisibleSlideRange(swiper);
    setPreviousVisibleRange(range);
  }, [swiper?.activeIndex, swiper]);

  useEffect(() => {
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
  }, [swiper, activeIndex, previousVisibleRange]);

  const updateActiveIndex = useCallback(
    (index: number) => {
      if (!swiper) return;

      // Only update if the index is currently visible
      if (isSlideVisible(swiper, index)) {
        setActiveIndex(index);
      }
    },
    [swiper]
  );

  const goToNextVideo = useCallback(() => {
    if (!swiper) return;

    const { shouldSlide, targetIndex } = getNavigationAction(
      swiper,
      activeIndex,
      "next"
    );

    if (shouldSlide) {
      swiper.slideNext();
    } else {
      setActiveIndex(targetIndex);
    }
  }, [swiper, activeIndex]);

  const goToPreviousVideo = useCallback(() => {
    if (!swiper) return;

    const { shouldSlide, targetIndex } = getNavigationAction(
      swiper,
      activeIndex,
      "prev"
    );

    if (shouldSlide) {
      swiper.slidePrev();
    } else {
      setActiveIndex(targetIndex);
    }
  }, [swiper, activeIndex]);

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "embed") {
        if (swiper) {
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
  }, [swiper]);

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
