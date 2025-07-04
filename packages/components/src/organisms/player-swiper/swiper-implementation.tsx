import { Mousewheel, Keyboard } from "swiper/modules";
import { Swiper } from "swiper/react";
import { useEffect, useRef, useState } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import { modalManager } from "@genuin/ui/lib/dialog-manager/dialog-manager";

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
  onActiveIndexChange?: (index: number) => void;
  startIndex: number;
  children: React.ReactNode;
};

export function SwiperImplementation({
  startIndex,
  children,
  onActiveIndexChange,
}: SwiperImplementationProps) {
  const { feedVideoSizeBox } = useBaseContext();
  const { showExpandView } = useFeedContext();
  const { isWindows } = useDeviceDetection();
  const swiperRef = useRef<any>(null);

  // Track if any modal is open
  const [modalOpen, setModalOpen] = useState(
    modalManager.getRegisteredModals().length > 0
  );

  useEffect(() => {
    // Subscribe to modal open/close changes
    const unsubscribe = modalManager.subscribe(() => {
      setModalOpen(modalManager.getRegisteredModals().length > 0);
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
        height: showExpandView ? "100%" : feedVideoSizeBox.height,
      }}
      enabled
      spaceBetween={showExpandView ? 0 : 16}
      direction="vertical"
      slidesPerView={showExpandView ? 1 : isWindows ? 1.06 : 1.03}
      speed={CONFIG.SCROLL_DELAY}
      initialSlide={startIndex}
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
      onActiveIndexChange={(swiper) => {
        onActiveIndexChange?.(swiper.activeIndex);
      }}
    >
      {children}
    </Swiper>
  );
}
