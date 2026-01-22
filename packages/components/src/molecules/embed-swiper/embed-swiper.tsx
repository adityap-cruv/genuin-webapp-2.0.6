import {
  ComponentProps,
  useMemo,
  useRef,
  lazy,
  Suspense,
  type ReactNode,
} from "react";
import { Swiper } from "swiper/react";
import { Swiper as SwiperType } from "swiper/types";
import { Mousewheel, FreeMode, Keyboard, A11y, Virtual } from "swiper/modules";
import { getSlidesPerView, SWIPER_CONFIG } from "./utils";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import "swiper/css";
import { cn } from "@genuin/ui/lib/utils";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

// Lazy load NativeFeedScroll
const NativeFeedScroll = lazy(() =>
  import("../native-feed-scroll/index.js").then((m) => ({
    default: m.NativeFeedScroll,
  }))
);

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
  customHeightFor?: {
    index: number;
    height: number;
  };
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
  isIheartLayout = false,
  customHeightFor,
  virtual,
  threshold,
  touchReleaseOnEdges,
  onActiveIndexChange,
  onInit,
  onSwiper,
  ...restProps
}: EmbedSwiperProps) {
  const { isWindows } = useDeviceDetection();
  const swiperRef = useRef<SwiperType | null>(null);
  const {
    embedSwiperConfigs: {
      useWindowSwiperMode,
      virtualizeSwiper,
      allowGestureScroll,
    },
  } = useEmbedConfigs();

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

  const modules = useMemo(() => {
    const baseModules = [Mousewheel, Keyboard, A11y];
    if (freeMode) baseModules.push(FreeMode);
    if (virtualizeSwiper) baseModules.push(Virtual);
    return baseModules;
  }, [freeMode, virtualizeSwiper]);

  // Use native scroll for feed mode
  if (useWindowSwiperMode) {
    return (
      <Suspense fallback={null}>
        <NativeFeedScroll
          // containerHeight={containerDimensions?.height ?? 0}
          containerWidth={containerDimensions?.width ?? 0}
          slidesPerView={slidesPerView}
          spaceBetween={spaceBetweenVideos}
          slidesOffsetBefore={slidesOffsetBefore}
          className={cn(
            className,
            !allowGestureScroll && "gencl:overflow-hidden"
          )}
          customHeightFor={customHeightFor}
          onActiveIndexChange={(instance: unknown) => {
            // Controller instance is passed directly, no wrapper needed!
            // Cast to SwiperType for compatibility with existing code
            const swiperCompatibleInstance = instance as unknown as SwiperType;
            onActiveIndexChange?.(swiperCompatibleInstance);
          }}
          onSlideChange={(instance: unknown) => {
            // Controller instance is passed directly, no wrapper needed!
            // Cast to SwiperType for compatibility with existing code
            const swiperCompatibleInstance = instance as unknown as SwiperType;
            onActiveIndexChange?.(swiperCompatibleInstance);
          }}
          onInit={(instance: unknown) => {
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
      </Suspense>
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
      modules={modules}
      freeMode={freeMode}
      watchOverflow={true}
      keyboard={{
        enabled: !isIheartLayout,
        onlyInViewport: false,
      }}
      // a11y={{
      //   enabled: true,
      //   prevSlideMessage: "Previous Highlight",
      //   nextSlideMessage: "Next Highlight",
      //   // firstSlideMessage: "This is the first clip",
      //   // lastSlideMessage: "This is the last clip",
      //   // slideLabelMessage: "Clip {{index}} of {{slidesLength}}",
      //   // containerMessage:
      //   //   "Clip carousel. Use arrow keys to navigate between clips.",
      //   // containerRoleDescriptionMessage: "Clip carousel",
      //   itemRoleDescriptionMessage: "video clip",
      //   scrollOnFocus: true,
      // }}
      virtual={virtualizeSwiper}
      allowTouchMove={allowGestureScroll}
      simulateTouch={allowGestureScroll}
      touchReleaseOnEdges={!allowGestureScroll || touchReleaseOnEdges}
      threshold={!allowGestureScroll ? 0 : threshold}
      mousewheel={{
        enabled: allowGestureScroll,
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
      className={cn(
        "gencl:h-full gencl:w-full gencl:rounded-lg",
        !allowGestureScroll && "swiper-no-swiping",
        className
      )}
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
