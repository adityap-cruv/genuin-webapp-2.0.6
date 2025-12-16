import { Mousewheel, Keyboard, Virtual } from "swiper/modules";
import { Swiper } from "swiper/react";
import { useEffect, useRef, useState, useMemo } from "react";

import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { useFeedVideoSizeBox } from "@genuin/components/hooks/use-feed-video-size-box";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { ComponentProps } from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { dialogManager } from "@genuin/ui/lib/dialog-manager/dialog-manager";
import { cn } from "@genuin/ui";

const CONFIG = {
  SCROLL_DELAY: 500,
  THRESHOLD_TIME: 400,
  MOUSE_THRESHOLD: {
    WINDOWS: 30,
    DEFAULT: 20,
  },
  MOUSE_SENSITIVITY: {
    WINDOWS: 0.8,
    DEFAULT: 1,
  },
};

type SwiperImplementationProps = {
  children: React.ReactNode;
  disableScroll?: boolean;
  spaceBetween?: number;
} & ComponentProps<typeof Swiper>;

export function SwiperImplementation({
  children,
  direction = "vertical",
  disableScroll = false,
  className,
  slidesPerView: slidesPerViewProp,
  spaceBetween: spaceBetweenProp,
  ...restProps
}: SwiperImplementationProps) {
  // const { height } = useFeedVideoSizeBox();
  const { showExpandView } = useFeedContext();
  const { isWindows } = useDeviceDetection();
  const { isMobile } = useDeviceDetectMediaQuery();
  const { virtualizeSwiper } = useEmbedConfigs();

  // const swiperHeight = showExpandView ? "100%" : isMobile ? "100%" : height;
  const defaultSpaceBetween = showExpandView || isMobile ? 0 : 16;
  const swiperSpaceBetween = spaceBetweenProp ?? defaultSpaceBetween;
  const defaultSlidesPerView =
    showExpandView || isMobile ? 1 : isWindows ? 1.06 : 1.03;
  const swiperSlidesPerView = slidesPerViewProp ?? defaultSlidesPerView;
  const swiperRef = useRef<any>(null);

  // Track if any modal is open
  const [modalOpen, setModalOpen] = useState(
    dialogManager.getRegisteredDialogs().length > 0
  );

  const modules = useMemo(() => {
    const baseModules = [Mousewheel, Keyboard];
    if (virtualizeSwiper) baseModules.push(Virtual);
    return baseModules;
  }, [virtualizeSwiper]);

  useEffect(() => {
    // Subscribe to modal open/close changes and update swiper controls
    const updateModalState = () => {
      const isOpen = dialogManager.getRegisteredDialogs().length > 0;
      setModalOpen(isOpen);
      if (swiperRef.current) {
        swiperRef.current.allowSlideNext = !isOpen;
        swiperRef.current.allowSlidePrev = !isOpen;
      }
    };
    const unsubscribe = dialogManager.subscribe(updateModalState);
    // Run once on mount to sync swiper state
    updateModalState();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Swiper
      ref={swiperRef}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      className={cn("gencl:h-full gencl:w-full", className)}
      enabled={!disableScroll}
      allowTouchMove={!disableScroll}
      spaceBetween={swiperSpaceBetween}
      direction={direction}
      slidesPerView={swiperSlidesPerView}
      speed={CONFIG.SCROLL_DELAY}
      modules={modules}
      virtual={
        virtualizeSwiper
          ? {
              enabled: true,
              addSlidesBefore: 2,
              addSlidesAfter: 2,
              cache: true,
            }
          : undefined
      }
      keyboard={{
        enabled: true,
        onlyInViewport: false,
      }}
      mousewheel={{
        forceToAxis: true,
        releaseOnEdges: true,
        thresholdDelta: isWindows
          ? CONFIG.MOUSE_THRESHOLD.WINDOWS
          : CONFIG.MOUSE_THRESHOLD.DEFAULT,
        thresholdTime: CONFIG.THRESHOLD_TIME,
        sensitivity: isWindows
          ? CONFIG.MOUSE_SENSITIVITY.WINDOWS
          : CONFIG.MOUSE_SENSITIVITY.DEFAULT,
      }}
      a11y={{
        enabled: true,
        prevSlideMessage: "Previous Highlight. Playing",
        nextSlideMessage: "Next Highlight. Playing",
        scrollOnFocus: true,
      }}
      followFinger
      {...restProps}
    >
      {children}
    </Swiper>
  );
}
