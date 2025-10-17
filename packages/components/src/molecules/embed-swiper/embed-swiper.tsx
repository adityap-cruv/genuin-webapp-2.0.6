import { ComponentProps, type ReactNode } from "react";
import { Swiper } from "swiper/react";
import { Mousewheel, FreeMode, Keyboard, A11y } from "swiper/modules";
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
  aspectRatio?: string;
  freeMode?: boolean;
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
  aspectRatio,
  freeMode = false,
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
          aspectRatio
        ) ?? 1
      }
      spaceBetween={spaceBetweenVideos}
      speed={SWIPER_CONFIG.SCROLL_DELAY}
      modules={
        freeMode
          ? [Mousewheel, FreeMode, Keyboard, A11y]
          : [Mousewheel, Keyboard, A11y]
      }
      freeMode={freeMode}
      keyboard={{
        enabled: true,
        onlyInViewport: false,
      }}
      a11y={{
        enabled: true,
        prevSlideMessage: forFeed ? "Previous clip" : "Previous slide",
        nextSlideMessage: forFeed ? "Next clip" : "Next slide",
        firstSlideMessage: forFeed
          ? "This is the first clip"
          : "This is the first slide",
        lastSlideMessage: forFeed
          ? "This is the last clip"
          : "This is the last slide",
        slideLabelMessage: forFeed
          ? "Clip {{index}} of {{slidesLength}}"
          : "Slide {{index}} of {{slidesLength}}",
        containerMessage: forFeed
          ? "Clip feed carousel. Use arrow keys to navigate between clips."
          : "Clip carousel. Use arrow keys to navigate between slides.",
        containerRoleDescriptionMessage: forFeed
          ? "Clip feed carousel"
          : "Clip carousel",
        itemRoleDescriptionMessage: forFeed ? "Video" : "Slide",
        slideRole: "group",
        scrollOnFocus: true,
      }}
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
      role="region"
      aria-label={forFeed ? "Video feed carousel" : "Video carousel"}
      className={cn("gencl:h-full gencl:w-full", className)}
      {...restProps}
    >
      {children}
    </Swiper>
  );
}
