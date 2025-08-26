"use client";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { EmbedProps } from "./embed.types";
import { SdkSkeleton } from "./skeleton";
import { cn } from "@genuin/ui/lib/utils";
import {
  ComponentProps,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { EmbedSwiper } from "@genuin/components/molecules/embed-swiper/embed-swiper";
import { EmbedTile } from "../embed-tile";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { SwiperSlide } from "swiper/react";
import { cva, VariantProps } from "class-variance-authority";
import { EmbedManagerProvider, useEmbedManagerContext } from "./context";
import { Swiper } from "swiper/types";
import { useDebounceCallback } from "usehooks-ts";
import { EmbedHeader } from "@genuin/components/molecules/embed-header";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { NavigationButtons } from "./navigation-buttons";
import { EmbedExpandView } from "./expand-view";
import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { PipView } from "./pip-view";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { SdkErrorState } from "./error-state";
import { SdkEmptyState } from "./empty-state";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

const carouselVariant = cva("gencl:rounded-md", {
  variants: {
    variant: {
      carousel: "",
      feed: "",
      standard_wall: "",
    },
    defaultVariants: {
      variant: "carousel",
    },
  },
});

type Props = EmbedProps & VariantProps<typeof carouselVariant>;

export function Embed({ className, style, ...restProps }: Props) {
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const embedRef = useRef<HTMLDivElement>(null);

  const { embedData, embedEventBus } = useEmbedContext();
  const { track, EventName } = useAnalytics();
  const config = useEmbedConfigs();
  const embedVariant = config.embedStyle;

  const {
    isLoading,
    data: feedData,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed("HOME", {
    communityIds: config.community.communityIds,
    groupIds: config.community.communityLoopIds,
    startVideoSlug: embedData.startVideoSlug,
    isEmbed: true,
    // startVideoSlug: "the-collab-has-officially-left-the-group-chat-nhl-3vjn",
  });
  const queryKey = getQueryKeyForFeed("HOME", {
    communityIds: config.community.communityIds,
    groupIds: config.community.communityLoopIds,
    isEmbed: true,
  });

  const videos = useMemo(
    () => feedData?.pages.flatMap((page) => page.feed) || [],
    [feedData]
  );

  // Extract video titles from postDetails
  const bucketList = useMemo(
    () =>
      videos.map((videoData) => videoData.video?.attributes?.bucket_name || ""),
    [videos]
  );

  const isWalmart = embedData.card_layout_id === 6;

  // Store bucketList in the embed context for use elsewhere
  const { updateBucketList } = useEmbedContext();
  useEffect(() => {
    if (bucketList.length > 0) {
      updateBucketList(bucketList);
    }
  }, [videos.length]);

  // Track EMBED_VIEWED event when embed is visible in viewport
  useEffect(() => {
    if (!embedRef.current) return;
    console.log("Setting up IntersectionObserver for embed view tracking");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track(EventName.EMBED_VIEWED, {
              embedType: embedVariant,
              communityIds: config.community.communityIds,
              groupIds: config.community.communityLoopIds,
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(embedRef.current);
    return () => observer.disconnect();
  }, [embedRef.current]);

  // Track EMBED_INITIALIZED event when component mounts
  useEffect(() => {
    track(EventName.EMBED_INITIALIZED, {
      embedType: embedVariant,
      communityIds: config.community.communityIds,
      groupIds: config.community.communityLoopIds,
    });
  }, []);

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
  } = useEmbedDimensions(config);

  if (isError) {
    return (
      <SdkErrorState
        containerHeight={containerHeight}
        containerWidth={containerWidth}
      />
    );
  }

  if (isLoading) {
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
      ref={embedRef}
      className={cn(
        carouselVariant({
          variant: embedVariant,
        }),
        className
      )}
      style={{
        height: containerHeight,
        width: containerWidth,
        ...style,
      }}
      {...restProps}
    >
      <EmbedHeader
        style={{
          height: headerHeight,
        }}
        variant={
          embedVariant === "standard_wall"
            ? "feed"
            : embedVariant === "feed" || embedVariant === "carousel"
              ? embedVariant
              : undefined
        }
      />
      <EmbedManagerProvider swiper={swiper} isGridLayout={isWalmart}>
        {isWalmart ? (
          <GridLayout videos={videos} embedEventBus={embedEventBus} />
        ) : (
          <div className="gencl:relative">
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
              {videos.map((videoData, idx) => {
                return (
                  <SwiperSlide key={idx}>
                    <EmbedItem
                      index={idx}
                      postDetails={videoData}
                      bucketList={bucketList}
                    />
                  </SwiperSlide>
                );
              })}
            </EmbedSwiper>
            <NavigationButtons totalSlides={videos.length} />
          </div>
        )}
      </EmbedManagerProvider>
      <EmbedExpandView
        videos={videos}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        queryKey={queryKey}
      />
      <PipView videos={videos} isLoading={isLoading} />
    </div>
  );
}

type EmbedItemProps = Omit<
  ComponentProps<typeof EmbedTile>,
  "onPlayerIterationEnd" | "isActive"
> & {
  index: number;
};

// GridLayout component that safely accesses the context
function GridLayout({
  videos,
  embedEventBus,
}: {
  videos: any[];
  embedEventBus: any;
}) {
  const { updateActiveIndex } = useEmbedManagerContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  const [isHovering, setIsHovering] = useState(false);

  // Auto-update active index every 3 seconds, but pause when hovering or in expand view
  useEffect(() => {
    if (videos.length === 0) return;

    // Don't auto-rotate if user is hovering
    if (isHovering) return;

    const interval = setInterval(() => {
      const context = embedEventBus.getContext();
      // Skip auto-rotation if we're in expand view
      if (context.activePlayerType === "expand-view") return;

      const currentIndex = context.activeIndex || 0;
      const nextIndex = (currentIndex + 1) % videos.length;

      // Use the updateActiveIndex function from context instead of directly emitting events
      updateActiveIndex(nextIndex);
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [videos.length, embedEventBus, updateActiveIndex, isHovering]);

  // Initial update of the context with the total number of videos
  useEffect(() => {
    if (videos.length > 0) {
      // Initialize with index 0 if not already set
      const currentIndex = embedEventBus.getContext().activeIndex || 0;
      updateActiveIndex(currentIndex);
    }
  }, [videos.length, embedEventBus, updateActiveIndex]);

  return (
    <div
      className="gencl:h-full gencl:w-full gencl:overflow-auto"
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      <div className="gencl:grid gencl:grid-cols-2 gencl:w-full gencl:gap-2">
        {videos.map((videoData, index) => (
          <div
            key={index}
            className={cn(
              "gencl:aspect-reel gencl:relative gencl:overflow-hidden gencl:rounded-md",
              "gencl:transition-all gencl:duration-300 gencl:ease-in-out",
              "gencl:cursor-pointer"
            )}
            onClick={() => {
              updateActiveIndex(index);
              // Open expand view with this index
              embedEventBus.emit(
                "activePlayerTypeChange",
                {},
                {
                  activePlayerType: "expand-view",
                  activeIndex: index,
                }
              );
            }}
          >
            <EmbedItem index={index} postDetails={videoData} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmbedItem({ index, ...restProps }: EmbedItemProps) {
  const { updateActiveIndex } = useEmbedManagerContext();
  const { embedEventBus } = useEmbedContext();
  const [embedIsActive, setEmbedIsActive] = useState(
    embedEventBus.getContext().activePlayerType === "embed"
  );

  const debouncedSetActiveIndex = useDebounceCallback(() => {
    updateActiveIndex(index);
  }, 700);

  // Attach to onMouseEnter
  const { goToNextVideo, activeIndex } = useEmbedManagerContext();

  useEffect(() => {
    const handleActivePlayerTypeChange = (
      eventData: any,
      context: EmbedEventContextType
    ) => {
      if (context.activePlayerType === "embed") {
        setEmbedIsActive(true);
      } else {
        setEmbedIsActive(false);
      }
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    debouncedSetActiveIndex.cancel();
  }, [debouncedSetActiveIndex]);

  return (
    <EmbedTile
      className={cn("gencl:cursor-pointer")}
      isActive={activeIndex === index && embedIsActive}
      onPlayerIterationEnd={goToNextVideo}
      onMouseEnter={debouncedSetActiveIndex}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        updateActiveIndex(index);

        // CHECK ANY BETTER APPROACH
        // First update the active index
        embedEventBus.emit(
          "activeIndexChange",
          {},
          {
            activePlayerType: embedEventBus.getContext().activePlayerType,
            activeIndex: index,
          }
        );

        // Then after a small delay to allow the video to start, change to expand view
        setTimeout(() => {
          embedEventBus.emit(
            "activePlayerTypeChange",
            {},
            {
              activePlayerType: "expand-view",
              activeIndex: index,
            }
          );
        }, 50);
      }}
      index={index}
      {...restProps}
    />
  );
}
