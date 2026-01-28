import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import type { Swiper as SwiperType } from "swiper/types";

import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { dialogManager } from "@genuin/ui/lib/dialog-manager/dialog-manager";
import { cn } from "@genuin/ui/lib/utils";
import { Swiper } from "swiper/react";

// Lazy load both Swiper and modules together to avoid separate loading delays
const SwiperWithModules = lazy(async () => {
  const [swiperModules] = await Promise.all([import("swiper/modules")]);

  // Return a wrapper component that has modules baked in
  return {
    default: ({
      children,
      virtualizeSwiper,
      ...props
    }: {
      children: React.ReactNode;
      virtualizeSwiper?: boolean;
      [key: string]: any;
    }) => {
      const { Mousewheel, Keyboard, Virtual } = swiperModules;

      const modules = useMemo(() => {
        const baseModules = [Mousewheel, Keyboard];
        if (virtualizeSwiper) baseModules.push(Virtual);
        return baseModules;
      }, [virtualizeSwiper]);

      return (
        <Swiper {...props} modules={modules}>
          {children}
        </Swiper>
      );
    },
  };
});

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
  direction?: "vertical" | "horizontal";
  slidesPerView?: number | "auto";
  className?: string;
  onSwiper?: (swiper: SwiperType) => void;
  [key: string]: any;
};

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
    <Suspense
      fallback={
        <div className={cn("gencl:h-full gencl:w-full", className)}>
          <div className="gencl:animate-pulse gencl:bg-gray-200 gencl:h-full gencl:w-full" />
        </div>
      }
    >
      <SwiperWithModules
        ref={swiperRef}
        onSwiper={(swiper: SwiperType) => {
          swiperRef.current = swiper;
        }}
        className={cn("gencl:h-full gencl:w-full", className)}
        enabled={!disableScroll}
        allowTouchMove={!disableScroll}
        spaceBetween={swiperSpaceBetween}
        direction={direction}
        slidesPerView={swiperSlidesPerView}
        speed={CONFIG.SCROLL_DELAY}
        virtualizeSwiper={virtualizeSwiper}
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
      </SwiperWithModules>
    </Suspense>
  );
}
