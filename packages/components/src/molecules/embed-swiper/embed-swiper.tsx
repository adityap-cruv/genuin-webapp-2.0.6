import { ComponentProps, useMemo, useRef, type ReactNode } from "react";
import { Swiper } from "swiper/react";
import { Swiper as SwiperType } from "swiper/types";
import { Mousewheel, FreeMode, Keyboard, A11y } from "swiper/modules";
import { getSlidesPerView, SWIPER_CONFIG } from "./utils";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import "swiper/css";
import { cn } from "@genuin/ui/lib/utils";
import { NativeFeedScroll } from "../native-feed-scroll";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

type EmbedSwiperProps = {
  forFeed?: boolean;
  children: ReactNode;
  spaceBetweenVideos: number;
  containerDimensions?: {
    width: number;
    height?: number;
  };
  aspectRatio?: string;
  freeMode?: boolean;
  slidesOffsetBefore?: number;
  isIheartLayout?: boolean;
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
  slidesOffsetBefore,
  onActiveIndexChange,
  onInit,
  onSwiper,
  isIheartLayout = false,
  ...restProps
}: EmbedSwiperProps) {
  const { isWindows } = useDeviceDetection();
  const swiperRef = useRef<SwiperType | null>(null);
  const { useWindowSwiperMode } = useEmbedConfigs();

  const slidesPerView = useMemo(
    () =>
      getSlidesPerView(
        containerDimensions?.height ?? 0,
        containerDimensions?.width ?? 0,
        forFeed,
        aspectRatio,
        useWindowSwiperMode
      ) ?? 1,
    [forFeed, aspectRatio, containerDimensions, useWindowSwiperMode]
  );

  // Use native scroll for feed mode
  if (useWindowSwiperMode) {
    return (
      <NativeFeedScroll
        // containerHeight={containerDimensions?.height ?? 0}
        containerWidth={containerDimensions?.width ?? 0}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetweenVideos}
        slidesOffsetBefore={slidesOffsetBefore}
        className={className}
        onActiveIndexChange={(instance) => {
          // Controller instance is passed directly, no wrapper needed!
          // Cast to SwiperType for compatibility with existing code
          const swiperCompatibleInstance = instance as unknown as SwiperType;
          onActiveIndexChange?.(swiperCompatibleInstance);
        }}
        onSlideChange={(instance) => {
          // Controller instance is passed directly, no wrapper needed!
          // Cast to SwiperType for compatibility with existing code
          const swiperCompatibleInstance = instance as unknown as SwiperType;
          onActiveIndexChange?.(swiperCompatibleInstance);
        }}
        onInit={(instance) => {
          // Controller instance is passed directly, no wrapper needed!
          // Cast to SwiperType for compatibility with existing code
          const swiperCompatibleInstance = instance as unknown as SwiperType;

          // Store ref for compatibility
          swiperRef.current = swiperCompatibleInstance;
          onInit?.(swiperCompatibleInstance);
          onSwiper?.(swiperCompatibleInstance);
        }}
        keyboardEnabled={true}
        ariaLabel="Video feed"
      >
        {children}
      </NativeFeedScroll>
    );
  }

  // Use Swiper for carousel mode
  return (
    <Swiper
      direction={forFeed ? "vertical" : "horizontal"}
      slidesPerView={slidesPerView}
      onActiveIndexChange={(swiper) => {
        onActiveIndexChange?.(swiper);
      }}
      spaceBetween={spaceBetweenVideos}
      speed={SWIPER_CONFIG.SCROLL_DELAY}
      modules={
        freeMode
          ? [Mousewheel, FreeMode, Keyboard, A11y]
          : [Mousewheel, Keyboard, A11y]
      }
      freeMode={freeMode}
      keyboard={{
        enabled: !isIheartLayout,
        onlyInViewport: false,
      }}
      // a11y={{
      //   enabled: true,
      //   prevSlideMessage: "Previous clip",
      //   nextSlideMessage: "Next clip",
      //   // firstSlideMessage: "This is the first clip",
      //   // lastSlideMessage: "This is the last clip",
      //   // slideLabelMessage: "Clip {{index}} of {{slidesLength}}",
      //   // containerMessage:
      //   //   "Clip carousel. Use arrow keys to navigate between clips.",
      //   // containerRoleDescriptionMessage: "Clip carousel",
      //   itemRoleDescriptionMessage: "video clip",
      //   scrollOnFocus: true,
      // }}
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
      // role="region"
      // aria-label={forFeed ? "Video feed carousel" : "Video carousel"}
      className={cn("gencl:h-full gencl:w-full gencl:rounded-lg", className)}
      slidesOffsetBefore={slidesOffsetBefore}
      onInit={(swiper) => {
        onInit?.(swiper);
        swiperRef.current = swiper;
      }}
      onSwiper={onSwiper}
      {...restProps}
    >
      {children}
    </Swiper>
  );
}
