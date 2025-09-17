"use client";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { EmbedProps } from "./embed.types";
import { SdkSkeleton } from "./skeleton";
import { cn } from "@genuin/ui/lib/utils";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { EmbedSwiper } from "@genuin/components/molecules/embed-swiper/embed-swiper";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { SwiperSlide } from "swiper/react";
import { EmbedManagerProvider } from "./context";
import { Swiper } from "swiper/types";
import { EmbedHeader } from "@genuin/components/molecules/embed-header";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { NavigationButtons } from "./navigation-buttons";
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
  const { embedData, embedEventBus, updateIsSectioned, updateSectionList } =
    useEmbedContext();
  // Local state for isSectioned synced with event bus
  const [isSectioned, setIsSectioned] = useState(
    embedEventBus.getContext().isSectioned
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

  useEffect(() => {
    function handleActiveIndexChange(
      eventData: any,
      context: EmbedEventContextType
    ) {
      if (
        videos.length > 0 &&
        context.activeIndex === videos.length - 3 &&
        hasNextPage &&
        !isFetchingNextPage &&
        context.activePlayerType !== "expand-view"
      ) {
        fetchNextPage();
      }
    }

    embedEventBus.on("activeIndexChange", handleActiveIndexChange);
    return () => {
      embedEventBus.off("activeIndexChange", handleActiveIndexChange);
    };
  }, [fetchNextPage, isLoading, hasNextPage, isFetchingNextPage, videos]);

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

  if (isError) {
    return (
      <SdkErrorState
        containerHeight={containerHeight}
        containerWidth={containerWidth}
      />
    );
  }

  const isActivePlayerTypeEmbed =
    embedEventBus.getContext().activePlayerType === "embed";
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
      className={cn(embedVariants({ variant: embedVariant }), className)}
      style={{
        height: containerHeight,
        width: containerWidth,
        ...style,
      }}
      {...restProps}
    >
      <EmbedManagerProvider swiper={swiper} isGridLayout={isGridLayout}>
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
              forFeed={config.view.isFeed}
              aspectRatio={embedData.aspect_ratio}
              spaceBetweenVideos={spaceBetweenVideos}
              containerDimensions={{
                height: config.view.isFeed
                  ? availableHeight - spaceBetweenVideos
                  : availableHeight + spaceBetweenVideos,
                width: containerWidth,
              }}
              style={{
                height: availableHeight + linkoutHeight + statsHeight,
              }}
              onSwiper={(swiperInstance) => setSwiper(swiperInstance)}
            >
              {videos?.map((videoData, idx) => {
                return (
                  <SwiperSlide key={idx}>
                    <EmbedItem index={idx} postDetails={videoData} />
                  </SwiperSlide>
                );
              })}
            </EmbedSwiper>
            <NavigationButtons totalSlides={videos?.length} />
          </div>
        )}
      </EmbedManagerProvider>

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
        />
      )}

      <PipView videos={videos ?? []} isLoading={isLoading} />
    </div>
  );
}
