"use client";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { EmbedProps } from "./embed.types";
import { SdkSkeleton, ShimmerSlide } from "./skeleton";
import { cn } from "@genuin/ui/lib/utils";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { EmbedSwiper } from "@genuin/components/molecules/embed-swiper/embed-swiper";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { SwiperSlide } from "swiper/react";
import { EmbedManagerProvider } from "./context";
import { Swiper } from "swiper/types";
import { EmbedHeader } from "@genuin/components/molecules/embed-header";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { EmbedExpandSectionedView } from "./embed-expand-sectioned-view";
import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PipView } from "./pip-view";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { SdkErrorState } from "./error-state";
import { SdkEmptyState } from "./empty-state";
import { GridView } from "./grid-view/grid-view";
import { EmbedExpandView } from "./expand-view";
import { cva, VariantProps } from "class-variance-authority";
import { EmbedItem } from "./embed-tile-item";
import { AnalyticsService } from "@genuin/components/context/analytics/service";
import { useBaseContext } from "@genuin/components/context";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";
import { NavigationButtonsWithContext } from "./navigation-buttons";
import { Toaster } from "@genuin/ui";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { useIheartUrlManager } from "@genuin/components/hooks/embed/use-iheart-url-manager";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { isSlideVisible } from "./utils";

// Component to handle fetchNextPage logic using swiper events
function FetchNextPageHandler({
  videos,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  swiper,
  embedEventBus,
}: {
  videos: any[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  swiper: Swiper | null;
  embedEventBus: any;
}) {
  const lastTriggeredAtProgressRef = useRef<number>(-1);

  useEffect(() => {
    if (!swiper) return;

    function checkAndFetchNextPage() {
      const context = embedEventBus.getContext();

      // Early exit conditions
      if (
        !swiper ||
        videos.length === 0 ||
        !hasNextPage ||
        isFetchingNextPage ||
        context.activePlayerType === "expand-view"
      ) {
        return;
      }

      // Calculate trigger point (when 4 slides remain)
      const totalSlides = videos.length;
      const triggerSlideIndex = totalSlides - 4;

      if (triggerSlideIndex <= 0) return; // Need at least 4 slides

      const triggerProgress = 0.7; // Fixed at 70% for simplicity
      const currentProgress = swiper.progress;

      // Check if we've crossed the trigger threshold
      if (
        currentProgress >= triggerProgress &&
        lastTriggeredAtProgressRef.current < triggerProgress
      ) {
        lastTriggeredAtProgressRef.current = currentProgress;
        fetchNextPage();
      }
    }

    // Use progress event for real-time tracking
    const handleProgress = () => {
      checkAndFetchNextPage();
    };

    swiper.on("progress", handleProgress);

    return () => {
      swiper.off("progress", handleProgress);
    };
  }, [
    swiper,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    videos.length,
    embedEventBus,
  ]);

  // Reset tracking when videos length changes (new data loaded)
  useEffect(() => {
    if (videos.length > 0) {
      lastTriggeredAtProgressRef.current = -1;
    }
  }, [videos.length]);

  return null; // This component doesn't render anything
}

const embedVariants = cva("gencl:rounded-md gencl:overflow-auto", {
  variants: {
    variant: {
      feed: "",
      carousel: "",
      standard_wall: "",
      grid: "",
      dynamic: "",
    },
  },
  defaultVariants: {
    variant: "carousel",
  },
});

export function Embed({
  className,
  style,
  feedData: externalFeedData,
  ...restProps
}: EmbedProps & VariantProps<typeof embedVariants>) {
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const [slidesOffsetBefore, setSlidesOffsetBefore] = useState<number>(0);
  const { isInIframe, theme } = useBaseContext();
  const { embedData, embedEventBus, updateIsSectioned, updateSectionList } =
    useEmbedContext();
  // Local state for isSectioned synced with event bus
  const [isSectioned, setIsSectioned] = useState(
    embedEventBus.getContext().isSectioned
  );
  // Local state for activePlayerType synced with event bus
  const [activePlayerType, setActivePlayerType] = useState(
    embedEventBus.getContext().activePlayerType
  );
  // Local state for activeIndex synced with event bus
  const [activeIndex, setActiveIndex] = useState(
    embedEventBus.getContext().activeIndex
  );
  const { track, EventName } = useAnalytics();
  const config = useEmbedConfigs();
  // check that does it is embed or placement
  const isEmbed: boolean = !config.view.isPlacementView;
  const embedVariant = config.embedStyle;
  const isGridLayout = config.view.isGrid;

  // Data fetching
  const feedType = embedData.placement_id ? "PLACEMENT_SECTIONS" : "EMBED_HOME";
  const feedParams = {
    communityIds: config.community.communityIds,
    groupIds: config.community.communityLoopIds,
    startVideoSlug: embedData.startVideoSlug,
    placementId: embedData.placement_id,
    styleId: embedData.style_id,
    contextualParams: embedData.contextualParams,
    embedId: embedData.embed_id,
    isInIframe,
    shouldShowMiddlewareOverlay: isMiddlewareOverlayEnabled({
      videoLayoutId: embedData.placement_video_layout_id,
      cardLayoutId: embedData.placement_card_layout_id,
    }),
    brandContext: embedData.brand_context?.map(({ id, type }) => ({
      id,
      type,
    })),
  };

  const {
    isLoading,
    data: apiFeedData,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(feedType, feedParams);
  const queryKey = getQueryKeyForFeed(feedType, feedParams);
  const feedData = externalFeedData ?? apiFeedData;
  const videos = useMemo(
    () => feedData?.pages?.flatMap((page) => page.feed) || [],
    [feedData]
  );
  const { isDesktop, isMobile } = useDeviceDetectMediaQuery();
  const totalVideos = feedData?.pages?.[0]?.totalVideos as number;

  // Extract video titles from postDetails
  const sectionList = useMemo(
    () => videos.map((videoData) => videoData.section || null),
    [videos]
  );

  // Extract sectioned property from feedData and update the context
  useEffect(() => {
    if (feedData?.pages && feedData.pages.length > 0) {
      const sectioned = feedData.pages[0]?.hasSection || false;
      if (updateIsSectioned) {
        updateIsSectioned(sectioned);
        setIsSectioned(sectioned);
      }

      // Emit SDK event when feed is loaded
      SDKEventEmitter.emit(SDKEventName.FEED_LOADED, {
        videoCount: videos.length,
        hasNextPage: hasNextPage ?? false,
        isSectioned: sectioned,
        feedType: feedType,
      });
    }
    if (sectionList.length > 0 && updateSectionList) {
      updateSectionList(sectionList);
      AnalyticsService.updatePayload(
        "section_name",
        sectionList.filter(
          (section) => section?.title !== null && section?.title !== undefined
        )
      );
    } else {
      AnalyticsService.updatePayload("section_name", []);
    }
  }, [videos.length]);

  // Callback ref to know when element is mounted
  // Track EMBED_VIEWED/PLACEMENT_VIEWED event when embed is visible in viewport
  const embedRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track(
              isEmbed ? EventName.EMBED_VIEWED : EventName.PLACEMENT_VIEWED,
              {
                community_id: config.community.communityIds,
                group_id: config.community.communityLoopIds,
                ...(!isEmbed && {
                  has_sections: isSectioned,
                  section_count: sectionList.length,
                }),
                activeIndex: 10,
              }
            );
            observer.disconnect();
          }
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Track EMBED_INITIALIZED or PLACEMENT_INITIALIZED event when component mounts
  useEffect(() => {
    if (isEmbed) {
      track(EventName.EMBED_INITIALIZED, {
        community_id: config.community.communityIds,
        group_id: config.community.communityLoopIds,
      });
    }
  }, [isEmbed]);

  // Track PLACEMENT_INITIALIZED event when component mounts
  useEffect(() => {
    if (!isEmbed && !isLoading) {
      track(EventName.PLACEMENT_INITIALIZED, {
        community_id: config.community.communityIds,
        group_id: config.community.communityLoopIds,
        has_sections: isSectioned,
        section_count: sectionList.length,
      });
    }
  }, [isEmbed, isLoading]);

  // Listen for centerActiveSlide event to center the swiper when exiting expand view
  useEffect(() => {
    function handleCenterActiveSlide() {
      if (swiper) {
        const activeIndex = embedEventBus.getContext().activeIndex;
        swiper.slideTo(activeIndex, 300); // Center the active slide with smooth animation
      }
    }

    embedEventBus.on("centerActiveSlide", handleCenterActiveSlide);
    return () => {
      embedEventBus.off("centerActiveSlide", handleCenterActiveSlide);
    };
  }, [swiper, embedEventBus]);

  // Listen for activePlayerType changes to sync local state
  useEffect(() => {
    function handleActivePlayerTypeChange(
      eventData: any,
      context: EmbedEventContextType
    ) {
      setActivePlayerType(context.activePlayerType);
    }

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus]);

  // Listen for activeIndex changes to sync local state
  useEffect(() => {
    function handleActiveIndexChange(
      eventData: any,
      context: EmbedEventContextType
    ) {
      setActiveIndex(context.activeIndex);
    }

    embedEventBus.on("activeIndexChange", handleActiveIndexChange);
    return () => {
      embedEventBus.off("activeIndexChange", handleActiveIndexChange);
    };
  }, [embedEventBus]);

  // Use the custom hook with style prop to prioritize parent styles
  const {
    containerHeight,
    containerWidth,
    statsHeight,
    headerHeight,
    linkoutHeight,
    spaceBetweenVideos,
    availableHeight,
  } = useEmbedDimensions();

  // Check for iheart brand layout for navigation button positioning
  const isIheartLayout = config.view.brandLayoutType === "iheart";
  const websiteType = config.view.websiteType;

  /**
   * Calculates the total number of slides to display based on the device type.
   *
   * Logic:
   * - On mobile devices → Exclude "complete" videos (final overlays or end cards).
   * - On desktop/tablet → Include only actual video slides (exclude overlays or non-video types).
   *
   * Dependencies:
   * - `videos`: The list of all video feed items.
   * - `isMobile`: Determines which filtering logic to apply.
   */
  const totalSlides = useMemo(() => {
    const conditions = websiteType === "legacy" ? true : !isDesktop;
    return conditions
      ? videos.filter((item) => item.video.type !== "complete").length
      : videos.filter((item) => item.video.type === "video").length;
  }, [videos, isDesktop]);

  /**
   * Handles slide change events in the Swiper carousel.
   *
   * Behavior:
   * - Only active for iHeart layout on desktop/tablet views.
   * - Detects when the user reaches the "end of feed" overlay slide.
   * - Emits the `CAUGHT_OVERLAY` event via the SDK event emitter when the overlay is reached.
   *
   * Logic:
   * 1. Skip execution for non-iHeart layouts or mobile devices.
   * 2. Validate the Swiper indices (`activeIndex`, `previousIndex`).
   * 3. Check if the current or traversed slides contain an overlay-type video.
   * 4. If yes → emit the end-of-feed event.
   *
   */
  const onFeedSlideChange = useCallback(
    (swiperInstance: Swiper) => {
      // Only check end of feed for iheart layout and we have to show toaster for desktop and tablet.
      if (
        config?.view?.brandLayoutType !== "iheart" ||
        !isDesktop ||
        !Array.isArray(videos) ||
        websiteType === "legacy"
      )
        return;

      const activeIndex = swiperInstance.activeIndex ?? 0;
      const previousIndex = swiperInstance.previousIndex ?? 0;

      // Validate indices
      if (activeIndex < 0 || activeIndex >= videos.length) return;

      // Check if current video is overlay
      let isReachedEndOfFeed = videos[activeIndex]?.video?.type === "overlay";

      // If not overlay, check the range between previous and active
      if (!isReachedEndOfFeed) {
        // Handle both forward and backward swipes
        const startIndex = Math.max(0, Math.min(previousIndex, activeIndex));
        const endIndex = isSlideVisible(swiperInstance, totalSlides - 1)
          ? totalSlides - 1
          : Math.min(totalSlides - 1, Math.max(previousIndex, activeIndex));
        // Ensure we have a valid range
        if (startIndex < endIndex) {
          isReachedEndOfFeed = videos
            .slice(startIndex, endIndex + 1)
            .some((feed) => feed?.video?.type === "overlay");
        }
      }

      // Emit event if overlay detected
      if (isReachedEndOfFeed) {
        SDKEventEmitter.emit(SDKEventName.CAUGHT_OVERLAY, true);
      }
    },
    [videos, isDesktop, SDKEventEmitter, SDKEventName]
  );

  // Handle URL manipulation for iHeart brand layout
  useIheartUrlManager({
    isIheartLayout,
    websiteType,
    activePlayerType,
    activeIndex,
    videos,
  });

  if (isError) {
    return (
      <SdkErrorState
        containerHeight={containerHeight}
        containerWidth={containerWidth}
      />
    );
  }

  const isActivePlayerTypeEmbed = activePlayerType === "embed";
  if (isLoading && isActivePlayerTypeEmbed) {
    return (
      <SdkSkeleton
        containerHeight={containerHeight}
        containerWidth={containerWidth}
        statsHeight={statsHeight}
        linkoutHeight={linkoutHeight}
        spaceBetweenVideos={spaceBetweenVideos}
        availableHeight={availableHeight}
      />
    );
  }

  if (videos.length === 0 && !isLoading) {
    return (
      <SdkEmptyState
        containerHeight={containerHeight}
        containerWidth={containerWidth}
      />
    );
  }

  return (
    <div
      ref={embedRefCallback}
      className={cn(
        "gen-sdk-embed",
        embedVariants({ variant: embedVariant }),
        className
      )}
      style={{
        ...(!config.useWindowSwiperMode && {
          height: containerHeight,
          width: containerWidth,
        }),
        ...style,
      }}
      {...restProps}
    >
      <EmbedManagerProvider swiper={swiper}>
        <FetchNextPageHandler
          videos={videos}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          swiper={swiper}
          embedEventBus={embedEventBus}
        />
        {isGridLayout ? (
          <GridView
            videos={videos}
            rows={config.view.gridLayout?.row ?? 2}
            cols={config.view.gridLayout?.column ?? 2}
            autoAdjust={config.view.gridLayout?.auto_adjust}
            aspectRatio={embedData.aspect_ratio}
            moveToNext={!config.video.videoLoop}
            moveToNextTime={config.video.moveToNextTime}
          />
        ) : (
          <div className="gencl:relative">
            <EmbedHeader
              style={{
                height: headerHeight,
              }}
              variant={embedVariant}
            />
            <EmbedSwiper
              onSwiper={(swiperInstance) => setSwiper(swiperInstance)}
              forFeed={config.view.isFeed}
              aspectRatio={embedData.aspect_ratio}
              spaceBetweenVideos={spaceBetweenVideos}
              isIheartLayout={isIheartLayout}
              onSlideChange={(swiperInstance) => {
                // Early safety check
                if (!swiperInstance) return;

                // Handle slides offset
                if (swiperInstance.isBeginning) {
                  setSlidesOffsetBefore(0);
                } else {
                  setSlidesOffsetBefore(48);
                }
                onFeedSlideChange(swiperInstance);
              }}
              onReachBeginning={() => {
                setSlidesOffsetBefore(0);
              }}
              containerDimensions={{
                height: config.view.isFeed
                  ? availableHeight - spaceBetweenVideos
                  : availableHeight + spaceBetweenVideos,
                width: containerWidth,
              }}
              style={{
                height: availableHeight,
              }}
              freeMode={config.view.scrollBehavior === "free_scroll"}
              centeredSlides={config.view.centeredSlides}
              centeredSlidesBounds={config.view.centeredSlides}
              slidesOffsetBefore={
                config.view.isCarousel && isIheartLayout && !isMobile
                  ? slidesOffsetBefore
                  : 0
              }
            >
              {videos?.map((videoData, idx) => {
                return videoData.video.type === "complete" ? (
                  <></>
                ) : videoData.video.type === "overlay" &&
                  config.view.brandLayoutType === "iheart" &&
                  isDesktop &&
                  websiteType !== "legacy" ? (
                  <></>
                ) : (
                  <SwiperSlide key={idx}>
                    <EmbedItem
                      index={idx}
                      postDetails={videoData}
                      totalVideos={feedData?.pages?.[0]?.totalVideos}
                      swiper={swiper}
                    />
                  </SwiperSlide>
                );
              })}
              {/* Add shimmer slides when fetching next page */}
              {isFetchingNextPage &&
                Array.from({ length: 3 }).map((_, idx) => (
                  <SwiperSlide key={`shimmer-${idx}`}>
                    <ShimmerSlide />
                  </SwiperSlide>
                ))}
            </EmbedSwiper>
            {!isIheartLayout && (
              <NavigationButtonsWithContext
                totalSlides={totalSlides}
                theme={theme}
              />
            )}
          </div>
        )}
        {isIheartLayout && config.view.isCarousel && (
          <NavigationButtonsWithContext
            totalSlides={totalSlides}
            isIheartLayout={true}
            theme={theme}
          />
        )}
      </EmbedManagerProvider>

      {config.expandViewConfig.enable && (
        <>
          {isSectioned ? (
            <EmbedExpandSectionedView
              videos={videos}
              pageSession={feedData?.pages[0]?.pageSession}
            />
          ) : (
            <EmbedExpandView
              videos={videos}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoading}
              queryKey={queryKey}
              totalVideos={totalVideos}
            />
          )}
        </>
      )}

      <PipView videos={videos ?? []} isLoading={isLoading} />

      {activePlayerType === "embed" && isIheartLayout && (
        <Toaster
          position="bottom-center"
          style={{
            width: "280px",
            bottom: "88px",
          }}
          toastOptions={{
            style: {
              width: "100%",
            },
          }}
        />
      )}
    </div>
  );
}
