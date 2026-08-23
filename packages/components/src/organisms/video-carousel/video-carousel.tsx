"use client";

import { useCallback, useEffect, useMemo, useRef, useState, lazy, type CSSProperties } from "react";
import { cn } from "@genuin/ui/lib/utils";
import type { Swiper } from "swiper/types";
import { SwiperSlide } from "swiper/react";

import { useAnalytics } from "@genuin/components/context";
import { useBaseContext } from "@genuin/components/context/base";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import { NavigationButtonsV2 } from "@genuin/components/organisms/embed/navigation-buttons-v2";
import { VideoFeedExpandView } from "@genuin/components/organisms/video-feed/video-feed";
import { attachSwipeIntent, isUserSwipe } from "@genuin/components/organisms/player-swiper/swipe-intent";
import { SwiperImplementation } from "@genuin/components/organisms/player-swiper/swiper-implementation";
import { calculateSlideDimensions } from "@genuin/components/organisms/player-swiper/utils";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { FeedContextProvider, useFeedContext } from "@genuin/components/templates/feed/context";
import { FeedSkeleton } from "@genuin/components/templates/feed/feed-skeleton";
import type { FeedData } from "@genuin/components/templates/feed/feed.type";

import { VideoCarouselCard } from "./video-carousel-card";
import type {
  ActiveVideoDetails,
  VideoCarouselProps,
  VideoCarouselResponsiveConfig,
  VideoCarouselViewProps,
} from "./video-carousel.types";

const ExpandViewLoader = lazy(() =>
  import("@genuin/components/organisms/embed/expand-view/expand-view-loader").then((m) => ({
    default: m.ExpandViewLoader,
  }))
);

import "swiper/css";

const DEFAULT_RESPONSIVE_CONFIG: VideoCarouselResponsiveConfig = {
  mobile: {
    slidesPerView: 1.25,
    slidesPerGroup: 1,
    spaceBetween: 10,
  },
  tablet: {
    slidesPerView: 2.75,
    slidesPerGroup: 2,
    spaceBetween: 12,
  },
  desktop: {
    slidesPerView: 4.5,
    slidesPerGroup: 2,
    spaceBetween: 14,
  },
};

/**
 * Pure presentation view for the Video Carousel.
 * Assumes FeedContextProvider and GestureProvider are in parent scope.
 */
export function VideoCarouselView({
  feedData,
  startIndex = 0,
  activeVideoId,
  isSectioned = false,
  responsiveConfig,
  cardWidth,
  cardHeight,
  cardAspectRatio = 9 / 16,
  controlSize = "sm",
  ctaText,
  playOnHover = true,
  autoAdvanceOnEnd = true,
  showNavigation = true,
  defaultExpandView = false,
  onCloseExpandView,
  onCtaClick,
  onActiveIndexChange,
  onActiveVideoChange,
  className,
  style,
}: VideoCarouselViewProps) {
  const { setActiveIndex, activeIndex } = useFeedContext();
  const embedDetails = useSafeEmbedContext();
  const { track, EventName } = useAnalytics();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();

  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const [slideDimensions, setSlideDimensions] = useState<{
    slideWidth: number;
    slideHeight: number;
    slidesPerView: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Expand view — mirrors VideoFeed: a local `expanded` flag drives a portalled
  // full-screen FeedView (no native fullscreen). `expandIndexRef` tracks the slide
  // the user leaves the expanded feed on, applied back to the inline carousel on close.
  const [expanded, setExpanded] = useState(defaultExpandView);
  const expandIndexRef = useRef(startIndex);

  const mergedConfig = useMemo(
    () => ({
      mobile: { ...DEFAULT_RESPONSIVE_CONFIG.mobile, ...responsiveConfig?.mobile },
      tablet: { ...DEFAULT_RESPONSIVE_CONFIG.tablet, ...responsiveConfig?.tablet },
      desktop: { ...DEFAULT_RESPONSIVE_CONFIG.desktop, ...responsiveConfig?.desktop },
    }),
    [responsiveConfig]
  );

  const activeDeviceConfig = isMobile
    ? mergedConfig.mobile
    : isDesktop
      ? mergedConfig.desktop
      : mergedConfig.tablet;

  const responsiveSlidesPerView = activeDeviceConfig.slidesPerView;
  const slidesPerGroup = activeDeviceConfig.slidesPerGroup;
  const spaceBetween = activeDeviceConfig.spaceBetween;

  const posts = useMemo(
    () => feedData.videos.filter((post) => post.video?.type === "video" || post.video?.source),
    [feedData.videos]
  );
  const hasContent = posts.length > 0;

  // Responsive slide dimension calculation
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const node = containerRef.current;
    if (!node) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (!width) return;

      if (cardWidth && cardHeight) {
        setSlideDimensions({
          slideWidth: typeof cardWidth === "number" ? cardWidth : parseFloat(cardWidth),
          slideHeight: typeof cardHeight === "number" ? cardHeight : parseFloat(cardHeight),
          slidesPerView: responsiveSlidesPerView,
        });
        return;
      }

      if (height > 0) {
        // Height-constrained 9:16 portrait dimension calculation
        const calculatedWidth = height * cardAspectRatio;
        const slides = width / (calculatedWidth + spaceBetween);
        setSlideDimensions({
          slideWidth: calculatedWidth,
          slideHeight: height,
          slidesPerView: Math.max(1, slides),
        });
        return;
      }

      const dimensions = calculateSlideDimensions({
        containerDimension: width,
        dimensionType: "width",
        aspectRatio: cardAspectRatio,
        slidesPerView: responsiveSlidesPerView,
      });

      setSlideDimensions(dimensions);
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(node);
    return () => observer.disconnect();
  }, [responsiveSlidesPerView, cardAspectRatio, cardWidth, cardHeight, spaceBetween]);

  // Controlled active video: slide to `activeVideoId` when it changes. activeIndex
  // is read through a ref so this effect does NOT re-run on the carousel's own
  // index changes (which would yank a user swipe back).
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  useEffect(() => {
    if (!activeVideoId || !swiper || swiper.destroyed) return;
    const targetIndex = posts.findIndex((post) => post.video?.id === activeVideoId);
    if (targetIndex < 0 || targetIndex === activeIndexRef.current) return;
    swiper.slideTo(targetIndex);
  }, [activeVideoId, swiper, posts]);

  // Infinite feed prefetching
  useEffect(() => {
    if (!feedData.hasNextPage || feedData.isFetchingNextPage || posts.length === 0) {
      return;
    }

    if (posts.length - 3 <= activeIndex) {
      feedData.fetchNextPage();
    }
  }, [activeIndex, feedData, posts.length]);

  const emitActiveVideoChange = useCallback(
    (targetIndex: number) => {
      const post = posts[targetIndex];
      if (post) {
        onActiveVideoChange?.({
          videoId: post.video?.id ?? "",
          communityId: post.community?.id,
          groupId: post.group?.id,
          index: targetIndex,
          post,
        });
      }
    },
    [onActiveVideoChange, posts]
  );

  const handleSwiperInit = useCallback(
    (instance: Swiper) => {
      attachSwipeIntent(instance);
      setSwiper(instance);
      setIsPrevDisabled(instance.isBeginning);
      setIsNextDisabled(instance.isEnd);
      const initialIndex = Math.min(
        startIndex,
        instance.slides?.length ? instance.slides.length - 1 : startIndex
      );
      setActiveIndex(initialIndex);
      emitActiveVideoChange(initialIndex);
    },
    [setActiveIndex, startIndex, emitActiveVideoChange]
  );

  const handleSlideChange = useCallback(
    (instance: Swiper) => {
      const newIndex = instance.activeIndex;
      setActiveIndex(newIndex);
      onActiveIndexChange?.(newIndex);
      emitActiveVideoChange(newIndex);
      setIsPrevDisabled(instance.isBeginning);
      setIsNextDisabled(instance.isEnd);
    },
    [setActiveIndex, onActiveIndexChange, emitActiveVideoChange]
  );

  const handleCardHover = useCallback(
    (targetIndex: number) => {
      setActiveIndex(targetIndex);
      onActiveIndexChange?.(targetIndex);
      emitActiveVideoChange(targetIndex);
    },
    [onActiveIndexChange, emitActiveVideoChange, setActiveIndex]
  );

  const handleCardClick = useCallback(
    (targetIndex: number) => {
      if (targetIndex !== activeIndex) {
        setActiveIndex(targetIndex);
        onActiveIndexChange?.(targetIndex);
        emitActiveVideoChange(targetIndex);
      }
    },
    [activeIndex, onActiveIndexChange, emitActiveVideoChange, setActiveIndex]
  );

  // Auto-advance to next video when current video finishes
  const handlePlayerIterationEnd = useCallback(
    (endedIndex: number) => {
      if (!autoAdvanceOnEnd) return;
      const nextIndex = endedIndex + 1 < posts.length ? endedIndex + 1 : 0;
      setActiveIndex(nextIndex);
      onActiveIndexChange?.(nextIndex);
      emitActiveVideoChange(nextIndex);

      if (swiper && !swiper.destroyed) {
        const slidesPerView = Math.floor((swiper.params.slidesPerView as number) || 4);
        if (nextIndex < swiper.activeIndex || nextIndex >= swiper.activeIndex + slidesPerView) {
          swiper.slideTo(nextIndex);
        }
      }
    },
    [autoAdvanceOnEnd, emitActiveVideoChange, onActiveIndexChange, posts.length, setActiveIndex, swiper]
  );

  const handleGoPrev = useCallback(() => {
    if (!swiper) return;
    const targetIndex = Math.max(swiper.activeIndex - slidesPerGroup, 0);
    swiper.slideTo(targetIndex);
  }, [slidesPerGroup, swiper]);

  const handleGoNext = useCallback(() => {
    if (!swiper) return;
    const targetIndex = Math.min(swiper.activeIndex + slidesPerGroup, swiper.slides.length - 1);
    swiper.slideTo(targetIndex);
  }, [slidesPerGroup, swiper]);

  // Open on the currently active slide; snapshot it so close can restore the inline
  // carousel to wherever the user navigated inside the expanded feed.
  const openExpand = useCallback(() => {
    expandIndexRef.current = swiper?.activeIndex ?? activeIndex;
    setExpanded(true);
  }, [swiper, activeIndex]);

  const closeExpand = useCallback(() => {
    setExpanded(false);
    onCloseExpandView?.();
    // Restore the inline carousel to the slide the user left the expanded feed on.
    // `slideTo` drives `handleSlideChange`, which updates `activeIndex` and fires the
    // active-index / active-video callbacks — no need to set them here as well.
    const target = expandIndexRef.current;
    if (swiper && !swiper.destroyed && swiper.activeIndex !== target) {
      swiper.slideTo(target, 0);
    }
  }, [swiper, onCloseExpandView]);

  const toggleExpand = useCallback(() => {
    if (expanded) closeExpand();
    else openExpand();
  }, [expanded, openExpand, closeExpand]);

  // Keeps `expandIndexRef` in sync while the user scrolls the expanded feed
  // (applied to the inline carousel by `closeExpand`).
  const handleExpandIndexChange = useCallback((index: number) => {
    expandIndexRef.current = index;
  }, []);

  if (isPrevDisabled && isNextDisabled && !hasContent) {
    return <ErrorState type="NO_CONTENT" />;
  }

  return (
    <div
      data-slot="video-carousel"
      className={cn("gencl:relative gencl:h-full gencl:w-full gencl:select-none", className)}
      style={style}>
      <div className="gencl:h-full gencl:w-full" ref={containerRef}>
        {!slideDimensions ? (
          <FeedSkeleton variant="player-list" theme="dark" />
        ) : (
          <SwiperImplementation
            direction="horizontal"
            className="gencl:h-full gencl:w-full"
            initialSlide={startIndex}
            slidesPerView={slideDimensions.slidesPerView}
            spaceBetween={spaceBetween}
            slidesPerGroup={slidesPerGroup}
            freeMode={{ enabled: true, sticky: false }}
            onSwiper={handleSwiperInit}
            onActiveIndexChange={handleSlideChange}
            disableScroll={isSectioned}
            onSlidePrevTransitionStart={(instance: Swiper) =>
              track(EventName.SWIPE_PREVIOUS, { auto_swipe: !isUserSwipe(instance) })
            }
            onSlideNextTransitionStart={(instance: Swiper) =>
              track(EventName.SWIPE_NEXT, { auto_swipe: !isUserSwipe(instance) })
            }>
            {posts.map((post, index) => (
              <SwiperSlide
                key={post.video?.id ?? `carousel-video-${index}`}
                virtualIndex={index}
                style={{
                  width: `${slideDimensions.slideWidth}px`,
                  height: `${slideDimensions.slideHeight}px`,
                }}>
                {({ isNext, isPrev, isVisible }) => (
                  <VideoCarouselCard
                    post={post}
                    index={index}
                    isActive={index === activeIndex && !expanded}
                    isNext={isNext}
                    isPrev={isPrev}
                    isVisible={isVisible}
                    isInitialSlide={index === startIndex}
                    isSectioned={isSectioned}
                    totalVideos={feedData.totalVideos}
                    controlSize={controlSize}
                    ctaText={ctaText}
                    playOnHover={playOnHover}
                    expanded={expanded}
                    onToggleExpand={toggleExpand}
                    onCardHover={handleCardHover}
                    onCardClick={handleCardClick}
                    onPlayerIterationEnd={handlePlayerIterationEnd}
                    onCtaClick={onCtaClick}
                    onActiveIndexChange={onActiveIndexChange}
                    pageSession={feedData.pageSession}
                  />
                )}
              </SwiperSlide>
            ))}
          </SwiperImplementation>
        )}
      </div>

      {/* Navigation Arrows for non-mobile viewports */}
      {showNavigation && !isMobile && posts.length > 0 && (
        <NavigationButtonsV2
          embedVariant="carousel"
          onPrev={handleGoPrev}
          onNext={handleGoNext}
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          theme="dark"
        />
      )}

      {/* Standalone Expand View — reuses the VideoFeed expand implementation
          (its own portalled full-screen FeedView), the same mechanism VideoFeed
          uses: a local `expanded` flag, no native fullscreen. */}
      {!embedDetails && expanded && (
        <VideoFeedExpandView
          data={{
            posts: feedData.videos,
            queryKey: feedData.queryKey,
            isLoading: feedData.isLoading,
            isError: false,
            hasNextPage: feedData.hasNextPage,
            isFetchingNextPage: feedData.isFetchingNextPage,
            fetchNextPage: feedData.fetchNextPage,
            totalVideos: feedData.totalVideos,
            pageSession: feedData.pageSession,
          }}
          startIndex={expandIndexRef.current}
          onClose={closeExpand}
          onActiveIndexChange={handleExpandIndexChange}
        />
      )}

      {feedData.isLoading && <div className="gencl:sr-only">Loading video carousel</div>}
    </div>
  );
}

/**
 * Complete horizontal Video Carousel component with data fetching, context management,
 * responsive multi-card layout, video playback, and custom card overlays.
 *
 * @example
 * ```tsx
 * <VideoCarousel feedType="HOME" />
 * ```
 */
export function VideoCarousel({
  feedType = "HOME",
  defaultExpandView,
  onCloseExpandView,
  isSectioned,
  externalFeedData,
  startIndex = 0,
  activeVideoId,
  responsiveConfig,
  cardWidth,
  cardHeight,
  cardAspectRatio = 9 / 16,
  controlSize,
  ctaText,
  playOnHover = true,
  autoAdvanceOnEnd = true,
  showNavigation = true,
  onCtaClick,
  onActiveIndexChange,
  onActiveVideoChange,
  className,
  containerClassName,
  style,
  ...restProps
}: VideoCarouselProps) {
  const { isInIframe, brandDetails } = useBaseContext();
  const embedDetails = useSafeEmbedContext();

  const feedQueryOptions = useMemo(
    () => ({
      communityIds: embedDetails?.embedData?.customization.community_ids,
      groupIds: embedDetails?.embedData?.customization.community_loop_ids?.map((item) => item.loop_id),
      startVideoSlug: embedDetails?.embedData?.startVideoSlug,
      contextualParams: embedDetails?.embedData?.contextualParams,
      embedId: embedDetails?.embedData?.embed_id,
      placementId: embedDetails?.embedData?.placement_id,
      styleId: embedDetails?.embedData?.style_id,
      sponsorship_id: embedDetails?.embedData?.sponsorship_id,
      isInIframe,
      shouldShowMiddlewareOverlay: isMiddlewareOverlayEnabled({
        videoLayoutId: embedDetails?.embedData?.placement_video_layout_id,
        cardLayoutId: embedDetails?.embedData?.placement_card_layout_id,
      }),
      brandId: brandDetails.brand_id ?? undefined,
      enabled: externalFeedData ? false : undefined,
    }),
    [embedDetails, isInIframe, brandDetails.brand_id, externalFeedData]
  );

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useFeed(feedType, feedQueryOptions);

  const apiVideos = useMemo(() => data?.pages.flatMap((page) => page.feed) ?? [], [data]);

  const feedData: FeedData = externalFeedData ?? {
    queryKey: getQueryKeyForFeed(feedType, feedQueryOptions),
    videos: apiVideos,
    isLoading,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
    totalVideos: data?.pages[0]?.totalVideos,
    pageSession: data?.pages[0]?.pageSession,
  };

  if (isError && !externalFeedData) {
    return <ErrorState type="ERROR" />;
  }

  if (feedData.videos.length === 0 && !feedData.isLoading && !feedData.isFetchingNextPage) {
    return <ErrorState type="NO_CONTENT" />;
  }

  return (
    // Expand view is managed locally by VideoCarouselView (like VideoFeed) — the
    // FeedContextProvider here only supplies the shared `activeIndex`, so its native
    // fullscreen behaviour is disabled to avoid it fighting the portalled expand view.
    <FeedContextProvider variant="page" disableNativeFullscreenApi>
      <GestureProvider isInIframe={isInIframe}>
        <div className={cn("gencl:relative gencl:h-full gencl:w-full", containerClassName)}>
          <VideoCarouselView
            feedData={feedData}
            startIndex={startIndex}
            activeVideoId={activeVideoId}
            isSectioned={isSectioned}
            responsiveConfig={responsiveConfig}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            cardAspectRatio={cardAspectRatio}
            controlSize={controlSize}
            ctaText={ctaText}
            playOnHover={playOnHover}
            autoAdvanceOnEnd={autoAdvanceOnEnd}
            showNavigation={showNavigation}
            defaultExpandView={defaultExpandView}
            onCloseExpandView={onCloseExpandView}
            onCtaClick={onCtaClick}
            onActiveIndexChange={onActiveIndexChange}
            onActiveVideoChange={onActiveVideoChange}
            className={className}
            style={style}
            {...restProps}
          />
        </div>
      </GestureProvider>

      {/* Embed Expand View Loader when inside EmbedContext */}
      {embedDetails && (
        <SafeSuspense fallback={null} errorFallback={null}>
          <ExpandViewLoader
            videos={apiVideos.length > 0 ? apiVideos : feedData.videos}
            isSectioned={!!isSectioned}
            pageSession={feedData.pageSession ?? undefined}
            hasNextPage={!!feedData.hasNextPage}
            isFetchingNextPage={!!feedData.isFetchingNextPage}
            isLoading={feedData.isLoading}
            queryKey={feedData.queryKey}
            totalVideos={feedData.totalVideos ?? feedData.videos.length}
            fetchNextPage={feedData.fetchNextPage}
          />
        </SafeSuspense>
      )}
    </FeedContextProvider>
  );
}

// Backward compatibility / alternate naming alias
export const VideoCarouselWithData = VideoCarousel;
export const FeedCarousel = VideoCarousel;
