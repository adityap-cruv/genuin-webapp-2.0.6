import { Mousewheel, Keyboard } from "swiper/modules";
import { Swiper } from "swiper/react";

import { useBaseContext } from "src/context/base";
import { useDeviceDetection } from "src/hooks/use-device-detection";
import { useFeedContext } from "src/templates/feed/context";

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

  return (
    <Swiper
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
