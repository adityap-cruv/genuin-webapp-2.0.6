import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useMemo, useRef, lazy, Suspense, type ReactNode } from "react";
import { Swiper } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

import { SWIPER_CONFIG } from "./utils";

import "swiper/css";

// Lazy load NativeFeedScroll
const NativeFeedScroll = lazy(() =>
  import("@genuin/components/molecules/native-feed-scroll").then((m) => ({
    default: m.NativeFeedScroll,
  }))
);

// Lazy load Swiper with modules to defer loading until component renders
const SwiperWithModules = lazy(async () => {
  const [swiperModules] = await Promise.all([import("swiper/modules")]);
  const { Mousewheel, FreeMode, Keyboard, A11y, Virtual } = swiperModules;

  function SwiperBase({
    children,
    freeMode,
    virtualizeSwiper,
    ...props
  }: {
    children: React.ReactNode;
    freeMode?: boolean | object;
    virtualizeSwiper?: boolean;
    [key: string]: unknown;
  }) {
    const modules = useMemo(() => {
      const baseModules = [Mousewheel, Keyboard, A11y];
      if (freeMode) baseModules.push(FreeMode);
      if (virtualizeSwiper) baseModules.push(Virtual);
      return baseModules;
    }, [freeMode, virtualizeSwiper]);

    return (
      <Swiper {...props} modules={modules} freeMode={freeMode}>
        {children}
      </Swiper>
    );
  }

  return { default: SwiperBase };
});

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
  slidesPerView: number;
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
  freeMode = false,
  slidesOffsetBefore,
  isIheartLayout = false,
  customHeightFor,
  virtual,
  threshold,
  touchReleaseOnEdges,
  slidesPerView,
  onActiveIndexChange,
  onInit,
  onSwiper,
  ...restProps
}: EmbedSwiperProps) {
  const { isWindows } = useDeviceDetection();
  const swiperRef = useRef<SwiperType | null>(null);
  const {
    embedSwiperConfigs: { useWindowSwiperMode, virtualizeSwiper, allowGestureScroll },
  } = useEmbedConfigs();

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
          className={cn(className, !allowGestureScroll && "gencl:overflow-hidden")}
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
          ariaLabel="Video feed">
          {children}
        </NativeFeedScroll>
      </Suspense>
    );
  }

  // Use Swiper for carousel mode
  return (
    <Suspense
      fallback={
        <div className={cn("gencl:h-full gencl:w-full gencl:rounded-lg", className)}>
          <div className="gencl:animate-pulse gencl:bg-gray-200 gencl:h-full gencl:w-full gencl:rounded-lg" />
        </div>
      }>
      <SwiperWithModules
        direction={forFeed ? "vertical" : "horizontal"}
        slidesPerView={slidesPerView}
        onActiveIndexChange={(swiper: SwiperType) => {
          onActiveIndexChange?.(swiper);
        }}
        spaceBetween={spaceBetweenVideos}
        speed={SWIPER_CONFIG.SCROLL_DELAY}
        freeMode={freeMode ? SWIPER_CONFIG.FREE_MODE : false}
        virtualizeSwiper={virtualizeSwiper}
        watchOverflow={true}
        snapToSlideEdge
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
        virtual={
          virtualizeSwiper
            ? {
                enabled: true,
                addSlidesBefore: 1,
                addSlidesAfter: 1,
                cache: true,
              }
            : undefined
        }
        allowTouchMove={allowGestureScroll}
        simulateTouch={allowGestureScroll}
        touchReleaseOnEdges={!allowGestureScroll || touchReleaseOnEdges}
        threshold={!allowGestureScroll ? 0 : threshold}
        mousewheel={{
          enabled: allowGestureScroll,
          forceToAxis: true,
          releaseOnEdges: true,
          thresholdDelta: isWindows ? SWIPER_CONFIG.MOUSE_THRESHOLD.WINDOWS : SWIPER_CONFIG.MOUSE_THRESHOLD.DEFAULT,
          thresholdTime: SWIPER_CONFIG.THRESHOLD_TIME,
          sensitivity: isWindows ? SWIPER_CONFIG.MOUSE_SENSITIVITY.WINDOWS : SWIPER_CONFIG.MOUSE_SENSITIVITY.DEFAULT,
        }}
        // role="region"
        // aria-label={forFeed ? "Video feed carousel" : "Video carousel"}
        className={cn(
          "gencl:h-full gencl:w-full gencl:rounded-lg",
          !allowGestureScroll && "swiper-no-swiping",
          className
        )}
        slidesOffsetBefore={slidesOffsetBefore}
        onInit={(swiper: SwiperType) => {
          onInit?.(swiper);
          swiperRef.current = swiper;
        }}
        onSwiper={onSwiper}
        {...restProps}>
        {children}
      </SwiperWithModules>
    </Suspense>
  );
}
