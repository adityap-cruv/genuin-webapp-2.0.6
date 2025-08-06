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
import {
  useEmbedDimensions,
  getEmbedVariant,
} from "@genuin/components/hooks/embed/use-embed-dimensions";
import { DangerIcon, PlayIcon } from "@genuin/ui/icons";
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

export function Embed({ className, variant, ...restProps }: Props) {
  // Use the hook to get all customization values in one place
  const { customization, embedData, embedEventBus } = useEmbedContext();
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
  });
  const config = useEmbedConfigs();
  const queryKey = getQueryKeyForFeed("HOME", {
    communityIds: customization.community_ids,
    groupIds: customization.community_loop_ids,
  });
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
  const embedHeights = useEmbedDimensions(config, measuredHeaderHeight);

  const videos = useMemo(
    () => feedData?.pages.flatMap((page) => page.feed) || [],
    [feedData]
  );

  useEffect(() => {
    const measureHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        setMeasuredHeaderHeight(height);
      }
    };

    window.addEventListener("resize", measureHeaderHeight);
    return () => {
      window.removeEventListener("resize", measureHeaderHeight);
    };
  }, [
    config.header.heading,
    config.header.subHeading,
    config.header.ctaButton?.url,
  ]);

  useEffect(() => {
    function handleActiveIndexChange(
      eventData: any,
      context: EmbedEventContextType
    ) {
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
  } = useEmbedHeights(config, measuredHeaderHeight);

  // Use the shared utility for embed variant
  const embedVariant = getEmbedVariant(config, variant);

  if (isError) {
    return (
      <SdkErrorState
        containerHeight={containerHeight}
        containerWidth={containerWidth}
      />
    );
  }

  if (isLoading) {
    return <SdkSkeleton />;
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
      className={cn(
        carouselVariant({ variant: variant || embedVariant }),
        className
      )}
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      {...restProps}
    >
      <EmbedHeader ref={headerRef} variant={variant || embedVariant} />
      <EmbedManagerProvider swiper={swiper}>
        <div className="gencl:relative">
          <EmbedSwiper
            forFeed={config.view.isFeed}
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

// Custom hook for calculating embed heights
function useEmbedHeights(
  config: ReturnType<typeof useEmbedConfigs>,
  measuredHeaderHeight: number
) {
  return useMemo(() => {
    const DEFAULT_HEIGHT = 480;
    const DEFAULT_WIDTH = 320;
    const spaceBetweenVideos = 8;
    const MIN_CAROUSEL_HEIGHT = 200;

    const headerHeight =
      measuredHeaderHeight || (config.header.showHeader ? 56 : 0);

    const statsHeight = config.engagement.showSocialInteractionData ? 40 : 0;
    const linkoutHeight = config.links.showLinkOutside ? 108 : 0;

    const containerHeight = config.dimensions.containerHeight ?? DEFAULT_HEIGHT;
    const containerWidth = config.dimensions.containerWidth ?? DEFAULT_WIDTH;

    const availableHeight = Math.max(
      containerHeight - headerHeight - statsHeight - linkoutHeight,
      MIN_CAROUSEL_HEIGHT
    );

    return {
      containerHeight,
      containerWidth,
      headerHeight,
      statsHeight,
      linkoutHeight,
      spaceBetweenVideos,
      availableHeight,
    };
  }, [
    config.dimensions.containerHeight,
    config.dimensions.containerWidth,
    config.header.showHeader,
    config.engagement.showSocialInteractionData,
    config.links.showLinkOutside,
    config.view.isFeed,
    measuredHeaderHeight,
  ]);
}
