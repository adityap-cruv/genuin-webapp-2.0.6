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

const carouselVariant = cva("gencl:bg-secondary-200 gencl:rounded-md", {
  variants: {
    variant: {
      carousel: "",
      feed: "",
    },
    defaultVariants: {
      variant: "carousel",
    },
  },
});

type Props = EmbedProps & VariantProps<typeof carouselVariant>;

export function Embed({ className, ...restProps }: Props) {
  // Use the hook to get all customization values in one place
  const { customization, embedData, embedEventBus } = useEmbedContext();
  const { track, EventName } = useAnalytics();
  const config = useEmbedConfigs();
  const embedVariant = config.view.embedStyle;

  const {
    isLoading,
    data: feedData,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed("HOME", {
    communityIds: customization.community_ids,
    groupIds: customization.community_loop_ids,
    startVideoSlug: embedData.startVideoSlug,
    // startVideoSlug: "the-collab-has-officially-left-the-group-chat-nhl-3vjn",
    isEmbed: true,
  });
  const queryKey = getQueryKeyForFeed("HOME", {
    communityIds: customization.community_ids,
    groupIds: customization.community_loop_ids,
  });
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const embedRef = useRef<HTMLDivElement>(null);

  const videos = useMemo(
    () => feedData?.pages.flatMap((page) => page.feed) || [],
    [feedData]
  );

  // Track EMBED_VIEWED event when embed is visible in viewport
  useEffect(() => {
    if (!embedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track(EventName.EMBED_VIEWED, {
              embedType: embedVariant,
              communityIds: customization.community_ids,
              groupIds: customization.community_loop_ids,
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(embedRef.current);
    return () => observer.disconnect();
  }, []);

  // Track EMBED_INITIALIZED event when component mounts
  useEffect(() => {
    track(EventName.EMBED_INITIALIZED, {
      embedType: embedVariant,
      communityIds: customization.community_ids,
      groupIds: customization.community_loop_ids,
    });
  }, []);

  useEffect(() => {
    function handleActiveIndexChange(context: EmbedEventContextType) {
      if (
        videos.length > 0 &&
        context.activeIndex === videos.length - 3 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    }

    embedEventBus.on("activeIndexChange", handleActiveIndexChange);
    return () => {
      embedEventBus.off("activeIndexChange", handleActiveIndexChange);
    };
  }, [fetchNextPage, isLoading, hasNextPage, isFetchingNextPage, videos]);

  // Use the custom hook
  const {
    containerHeight,
    containerWidth,
    statsHeight,
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
          variant:
            embedVariant === "feed" || embedVariant === "carousel"
              ? embedVariant
              : embedVariant === "standard_wall"
                ? "feed"
                : "carousel",
        }),
        className
      )}
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      {...restProps}
    >
      <EmbedHeader
        variant={
          embedVariant === "standard_wall"
            ? "feed"
            : embedVariant === "feed" || embedVariant === "carousel"
              ? embedVariant
              : undefined
        }
      />
      <EmbedManagerProvider swiper={swiper}>
        <div className="gencl:relative">
          <EmbedSwiper
            forFeed={config.view.isFeed}
            aspectRation={embedData.aspect_ratio}
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
                  <EmbedItem index={idx} postDetails={videoData} />
                </SwiperSlide>
              );
            })}
          </EmbedSwiper>
          <NavigationButtons totalSlides={videos.length} />
        </div>
      </EmbedManagerProvider>
      <EmbedExpandView
        videos={videos}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        queryKey={queryKey}
      />
      <PipView
        videos={videos}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        queryKey={queryKey}
      />
    </div>
  );
}

type EmbedItemProps = Omit<
  ComponentProps<typeof EmbedTile>,
  "onPlayerIterationEnd" | "isActive"
> & {
  index: number;
};

function EmbedItem({ index, ...restProps }: EmbedItemProps) {
  const { updateActiveIndex } = useEmbedManagerContext();
  const config = useEmbedConfigs();
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
      className={cn("gencl:cursor-pointer", {
        "gencl:opacity-50 gencl:transition-opacity":
          activeIndex !== index && config.styling.isOpacityDown,
      })}
      isActive={activeIndex === index && embedIsActive}
      onPlayerIterationEnd={goToNextVideo}
      onMouseEnter={debouncedSetActiveIndex}
      onMouseLeave={handleMouseLeave}
      index={index}
      {...restProps}
    />
  );
}
