import { Mousewheel, Keyboard } from "swiper/modules";
import { Swiper } from "swiper/react";
import { useEffect, useRef, useState } from "react";

import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { useFeedVideoSizeBox } from "@genuin/components/hooks/use-feed-video-size-box";
import { ComponentProps } from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { dialogManager } from "@genuin/ui/lib/dialog-manager/dialog-manager";

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
} & ComponentProps<typeof Swiper>;

export function SwiperImplementation({
  children,
  ...restProps
}: SwiperImplementationProps) {
  const { height } = useFeedVideoSizeBox();
  const { showExpandView } = useFeedContext();
  const { isWindows } = useDeviceDetection();
  const { isMobile } = useDeviceDetectMediaQuery();

  const swiperHeight = showExpandView ? "100%" : isMobile ? "100%" : height;
  const swiperSpaceBetween = showExpandView || isMobile ? 0 : 16;
  const swiperSlidesPerView =
    showExpandView || isMobile ? 1 : isWindows ? 1.06 : 1.03;
  const swiperRef = useRef<any>(null);

  // Track if any modal is open
  const [modalOpen, setModalOpen] = useState(
    dialogManager.getRegisteredDialogs().length > 0
  );

  useEffect(() => {
    // Subscribe to modal open/close changes
    const unsubscribe = dialogManager.subscribe(() => {
      setModalOpen(dialogManager.getRegisteredDialogs().length > 0);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Disable any swiping event when modal is open
  useEffect(() => {
    if (swiperRef.current) {
      if (modalOpen) {
        swiperRef.current.disable();
      } else {
        swiperRef.current.enable();
      }
    }
  }, [modalOpen]);

  return (
    <Swiper
      ref={swiperRef}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      className="gencl:mx-0!"
      style={{
        height: swiperHeight,
      }}
      enabled
      spaceBetween={swiperSpaceBetween}
      direction="vertical"
      slidesPerView={swiperSlidesPerView}
      speed={CONFIG.SCROLL_DELAY}
      modules={[Mousewheel, Keyboard]}
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
      followFinger={false}
      {...restProps}
    >
      {children}
    </Swiper>
  );
}
