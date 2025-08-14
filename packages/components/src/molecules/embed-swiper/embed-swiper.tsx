import { ComponentProps, type ReactNode } from "react";
import { Swiper } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import { getSlidesPerView, SWIPER_CONFIG } from "./utils";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import "swiper/css";
import { cn } from "@genuin/ui/lib/utils";

type EmbedSwiperProps = {
  forFeed?: boolean;
  children: ReactNode;
  spaceBetweenVideos: number;
  containerDimensions?: {
    width: number;
    height: number;
  };
  aspectRation?: string;
} & ComponentProps<typeof Swiper>;

/**
 * EmbedSwiper component is a wrapper around Swiper component.
 * Which will specially used for embeds(carousel and feed).
 * @param param EmbedSwiperProps
 * @returns
 */
export function EmbedSwiper({
  forFeed = false,
  children,
  spaceBetweenVideos,
  containerDimensions,
  className,
  aspectRation,
  ...restProps
}: EmbedSwiperProps) {
  const { isWindows } = useDeviceDetection();

  return (
    <Swiper
      direction={forFeed ? "vertical" : "horizontal"}
      slidesPerView={
        getSlidesPerView(
          containerDimensions?.height ?? 0,
          containerDimensions?.width ?? 0,
          forFeed,
          aspectRation
        ) ?? 1
      }
      spaceBetween={spaceBetweenVideos}
      speed={SWIPER_CONFIG.SCROLL_DELAY}
      modules={[Mousewheel]}
      mousewheel={{
        forceToAxis: true,
        releaseOnEdges: true,
        thresholdDelta: isWindows
          ? SWIPER_CONFIG.MOUSE_THRESHOLD.WINDOWS
          : SWIPER_CONFIG.MOUSE_THRESHOLD.DEFAULT,
        thresholdTime: SWIPER_CONFIG.THRESHOLD_TIME,
        sensitivity: isWindows
          ? SWIPER_CONFIG.MOUSE_SENSITIVITY.WINDOWS
          : SWIPER_CONFIG.MOUSE_SENSITIVITY.DEFAULT,
      }}
      className={cn("gencl:h-full gencl:w-full", className)}
      {...restProps}
    >
      {children}
    </Swiper>
  );
}
