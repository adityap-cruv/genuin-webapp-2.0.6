"use client";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { EmbedProps } from "./embed.types";
import { SdkSkeleton, ShimmerSlide } from "./skeleton";
import { cn } from "@genuin/ui/lib/utils";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { SwiperSlide } from "swiper/react";
import { EmbedManagerProvider } from "./context";

import { Swiper } from "swiper/types";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

import { useEmbedContext } from "@genuin/components/context/embed";
import { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";

import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { getSlidesPerView } from "../../molecules/embed-swiper/utils";

import { SdkErrorState } from "./error-state";
import { SdkEmptyState } from "./empty-state";

import { cva, VariantProps } from "class-variance-authority";

import { AnalyticsService } from "@genuin/components/context/analytics/service";
import { useBaseContext } from "@genuin/components/context";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { isSlideVisible } from "./utils";
import { FetchNextPageHandler } from "./fetch-next-page-handler";

import { PipViewLoader } from "./pip-view/pip-view-loader";
import { ExpandViewLoader } from "./expand-view/expand-view-loader";
import { FeedSkeleton } from "@genuin/components/templates/feed";

const IheartUrlManager = lazy(() =>
  import("./iheart-url-manager.js").then((m) => ({
    default: m.IheartUrlManager,
  })),
);

// Lazy load GridView
const GridView = lazy(() =>
  import("./grid-view/grid-view.js").then((m) => ({ default: m.GridView })),
);

const EmbedExpandView = lazy(() =>
  import("./expand-view/index.js").then((m) => ({
    default: m.EmbedExpandView,
  })),
);

// Lazy load NavigationButtonsWithContext
const NavigationButtonsWithContext = lazy(() =>
  import("./navigation-buttons.js").then((m) => ({
    default: m.NavigationButtonsWithContext,
  })),
);

// Lazy load EmbedSwiper
const EmbedSwiper = lazy(() =>
  import("../../molecules/embed-swiper/index.js").then((m) => ({
    default: m.EmbedSwiper,
  })),
);

// Lazy load EmbedHeader
const EmbedHeader = lazy(() =>
  import("../../molecules/embed-header/index.js").then((m) => ({
    default: m.EmbedHeader,
  })),
);

// Lazy load Toaster
// const Toaster = lazy(() =>
//   import("@genuin/ui").then((m) => ({ default: m.Toaster }))
// );

// Lazy load EmbedItem
const EmbedItem = lazy(() =>
  import("./embed-tile-item.js").then((m) => ({ default: m.EmbedItem })),
);

/** Ad configs used to inject between videos in expand-view only. */
const EXPAND_VIEW_AD_CONFIGS = [
  {
    videoSource:
      "https://vz-8bbc7bbf-a1e.b-cdn.net/07283c40-a199-410c-9d57-6b070d35ab33/play_360p.mp4",
    adUrl: "https://media.begenuin.com/ad-sdk/test-creatives/finance.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/splitero.webp",
    primaryColor: "#F97316",
  },
  {
    videoSource:
      "https://vz-8bbc7bbf-a1e.b-cdn.net/3aa3cdc7-1254-425d-93c0-2d060f19322e/play_360p.mp4",
    adUrl:
      "https://media.begenuin.com/ad-sdk/test-creatives/consumerserivce.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/airtasker.webp",
    primaryColor: "#061257",
  },
  {
    videoSource:
      "https://vz-8bbc7bbf-a1e.b-cdn.net/4f524c6b-153c-4e8e-8630-6b866f937a9a/play_360p.mp4",
    adUrl:
      "https://media.begenuin.com/ad-sdk/test-creatives/foodandgroceryads.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/impossiblefoods.webp",
    primaryColor: "#E10600",
  },
  {
    videoSource:
      "https://vz-8bbc7bbf-a1e.b-cdn.net/684a999f-8e14-4399-93e8-c0bc67f9d51c/play_360p.mp4",
    adUrl: "https://media.begenuin.com/ad-sdk/test-creatives/soda.xml",
    logo: "https://media.begenuin.com/ad-sdk/test-creatives/skypop.webp",
    primaryColor: "#061257",
  },
] as const;

/** Creates a synthetic ad feed item for injection between videos in expand-view. */
function createInjectableAdItem(
  videoSource: string,
  adUrl: string,
  logo: string,
  primaryColor: string,
  idx: number,
): PostDetailsType {
  return {
    type: "ads",
    adTagObject: {
      display_ad: null,
      native_ad: null,
      video_ad: {
        url: adUrl,
        ads_url: adUrl,
        // platform: "aniview",
        cpm: 0.001,
        advertiserDetails: {
          logo,
          primaryColor,
        },
        contentVideo: {
          url: videoSource,
          autoplay: true,
          loop: true,
          muted: true,
          objectFit: "contain",
        },
      },
      order: ["video_ad", "display_ad", "house_ad"],
    },
    video: {
      id: `injected-ad-${idx}`,
      type: "video",
      source: videoSource,
      adUrl,
      adsPlatform: "aniview",
      createdAt: null,
      commentCount: 0,
      viewCount: 0,
      shareUrl: "",
      attachedLink: null,
      isSparked: false,
      isWatched: false,
      sparkCount: 0,
      thumbnail: "",
      thumbnailM: null,
      description: null,
      descritptionText: null,
      slug: `injected-ad-${idx}`,
      linkoutId: null,
      clickableUrl: null,
      linkouts: [],
      isPinned: false,
      thumbnailSprite: null,
      cardLayoutId: null,
      videoLayoutId: null,
      duration: null,
      attributes: null,
      placement_card_layout_id: null,
      placement_video_layout_id: null,
      placement_card_section_layout_id: null,
    },
  } as PostDetailsType;
}

/**
 * Interleaves synthetic ad items between every real video item.
 * Ads are not inserted after existing ad items, overlay slides, or end cards.
 * The ad URL is selected randomly from EXPAND_VIEW_AD_CONFIGS on each call.
 */
function injectAdsForExpandView(feed: PostDetailsType[]): PostDetailsType[] {
  const result: PostDetailsType[] = [];
  let adCounter = 0;

  for (let i = 0; i < feed.length; i++) {
    const item = feed[i]!;
    result.push(item);

    const isAlreadyAd = (item as { type?: string }).type === "ads";
    const isSpecialSlide =
      item.video?.type === "complete" || item.video?.type === "overlay";

    if (!isAlreadyAd && !isSpecialSlide) {
      const config =
        EXPAND_VIEW_AD_CONFIGS[
          Math.floor(Math.random() * EXPAND_VIEW_AD_CONFIGS.length)
        ]!;
      result.push(
        createInjectableAdItem(
          config.videoSource,
          config.adUrl,
          config.logo,
          config.primaryColor,
          adCounter,
        ),
      );
      adCounter++;
    }
  }

  return result;
}

const embedVariants = cva("gencl:rounded-md gencl:overflow-auto", {
  variants: {
    variant: {
      feed: "",
      carousel: "",
      standard_wall: "",
      grid: "",
      dynamic: "",
      expand_only: "",
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
  wasLazilyLoaded,
  isOnlyForExpand,
  ...restProps
}: EmbedProps & VariantProps<typeof embedVariants>) {
  const [swiper, setSwiper] = useState<Swiper | null>(null);
  const [slidesOffsetBefore, setSlidesOffsetBefore] = useState<number>(0);

  const { isInIframe, theme } = useBaseContext();
  const {
    embedData,
    embedEventBus,
    rootElement,
    updateIsSectioned,
    updateSectionList,
    changeActivePlayerType,
  } = useEmbedContext();
  // Local state for isSectioned synced with event bus
  const [isSectioned, setIsSectioned] = useState(
    embedEventBus.getContext().isSectioned,
  );
  // Local state for activePlayerType synced with event bus
  const [activePlayerType, setActivePlayerType] = useState(
    embedEventBus.getContext().activePlayerType,
  );
  // Local state for activeIndex synced with event bus
  const [activeIndex, setActiveIndex] = useState(
    embedEventBus.getContext().activeIndex,
  );
  const { track, EventName } = useAnalytics();
  const config = useEmbedConfigs();
  const embedAspectRatio = config.dimensions.aspectRatio;
  // check that does it is embed or placement
  const isEmbed: boolean = !config.view.isPlacementView;
  const embedVariant = config.embedStyle;
  const isGridLayout = config.view.isGrid;
  // const { renderOnlySingleVideoInEmbed } = config;

  // Data fetching
  const feedType = config.brand.feedType;

  const enrichedContextualParams = useMemo(() => {
    const params = embedData.contextualParams;
    if (!config.brand.autoPageContext || params?.page_context) {
      return params;
    }
    if (typeof document === "undefined") {
      return params;
    }
    const keywords =
      document
        .querySelector('meta[name="keywords"]')
        ?.getAttribute("content") ?? "";
    if (!keywords) {
      return params;
    }
    return { ...params, page_context: keywords };
  }, [config.brand.autoPageContext, embedData.contextualParams]);

  const feedParams = {
    communityIds: config.community.communityIds,
    groupIds: config.community.communityLoopIds,
    startVideoSlug: embedData.startVideoSlug,
    placementId: embedData.placement_id,
    styleId: embedData.style_id,
    contextualParams: enrichedContextualParams,
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
    videoIds: embedData.videoIds,
    initialVideoIds: embedData.initialVideoIds,
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
    [feedData],
  );
  const { isDesktop, isMobile } = useDeviceDetectMediaQuery();
  const totalVideos = feedData?.pages?.[0]?.totalVideos as number;
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
  // For iHeart Polaris on desktop, we exclude overlay-type posts.
  // The overlay card isn't required in this layout, and maintaining index
  // consistency between the embed view and expanded view becomes difficult.
  // Hence, we filter out overlay posts when the conditions match.
  const filteredPost = useMemo(() => {
    return isDesktop && websiteType === "polaris" && isIheartLayout
      ? videos.filter((post) => post.video?.type !== "overlay")
      : videos;
  }, [videos, isDesktop]);

  // Expand-view feed: inject synthetic ads only for the selected placements/embeds.
  // All other embeds pass filteredPost through unchanged.
  const expandViewFeed = useMemo(
    () =>
      config.brand.shouldInjectExpandViewAds
        ? injectAdsForExpandView(filteredPost)
        : filteredPost,
    [filteredPost, config.brand.shouldInjectExpandViewAds],
  );

  // Extract video titles from postDetails
  const sectionList = useMemo(
    () => filteredPost.map((videoData) => videoData.section || null),
    [filteredPost],
  );

  const slidesPerView = useMemo(
    () =>
      getSlidesPerView(
        config.view.isFeed
          ? availableHeight - spaceBetweenVideos
          : availableHeight + spaceBetweenVideos,
        containerWidth,
        config.view.isFeed,
        embedAspectRatio,
        config.embedSwiperConfigs.useWindowSwiperMode,
      ) ?? 1,
    [
      config.view.isFeed,
      embedAspectRatio,
      availableHeight,
      spaceBetweenVideos,
      containerWidth,
      config.embedSwiperConfigs.useWindowSwiperMode,
    ],
  );

  // Compute the pixel dimensions of a single SwiperSlide.
  // Reuses getSlidesPerView (same function EmbedSwiper uses) so aspect-ratio
  // math stays in one place (DRY). Slide size differs by view type:
  //   feed     – vertical scroll, slides are full-width; height is derived from ratio
  //   carousel – horizontal scroll, slides are full-height; width is derived from ratio
  const slideItemSize = useMemo(() => {
    if (config.view.isFeed) {
      const containerHeight = availableHeight - spaceBetweenVideos;
      return {
        height: containerHeight / slidesPerView,
        width: containerWidth,
      };
    }
    return {
      height: availableHeight,
      width: containerWidth / slidesPerView,
    };
  }, [
    config.view.isFeed,
    containerWidth,
    availableHeight,
    spaceBetweenVideos,
    slidesPerView,
  ]);

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
        videoCount: filteredPost.length,
        hasNextPage: hasNextPage ?? false,
        isSectioned: sectioned,
        feedType: feedType,
        thumbnailUrl:
          filteredPost[0]?.video?.thumbnail ||
          filteredPost[0]?.video?.thumbnailM ||
          "",
        videoUrl: filteredPost[0]?.video?.source || "",
      });
    }
    // In embed mode, the sections list does not need to be updated.
    if (isEmbed) return;
    if (sectionList.length > 0 && updateSectionList) {
      updateSectionList(sectionList);
      AnalyticsService.updatePayload(
        "section_name",
        sectionList.filter(
          (section) => section?.title !== null && section?.title !== undefined,
        ),
      );
    } else {
      AnalyticsService.updatePayload("section_name", []);
    }
  }, [filteredPost.length, isEmbed]);

  // Callback ref to know when element is mounted
  // Track EMBED_VIEWED/PLACEMENT_VIEWED event when embed is visible in viewport
  const embedRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Track EMBED_VIEWED/PLACEMENT_VIEWED event when element comes into view
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
                },
              );
            }
          });
        },
        { threshold: 0.01 },
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [
      isEmbed,
      EventName,
      config.community.communityIds,
      config.community.communityLoopIds,
      isSectioned,
      sectionList.length,
    ],
  );

  // Track EMBED_INITIALIZED event when component mounts
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

  // Emit RESIZE event whenever the embed's calculated dimensions change so the
  // host container can update its height to match — eliminating scroll without a
  // fixed hardcoded height on the container element.
  // Grid layouts handle their own RESIZE emission from grid-view.tsx via
  // ResizeObserver on the actual rendered grid element, so we skip here.
  useEffect(() => {
    if (isGridLayout) return;
    if (containerHeight <= 0 || containerWidth <= 0) return;
    SDKEventEmitter.emit(
      SDKEventName.RESIZE,
      {
        height: containerHeight,
        width: containerWidth,
        containerId: rootElement?.id ?? null,
      },
      { debounceTime: 100 },
    );
  }, [containerHeight, containerWidth]);

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

  // Listen for activePlayerType changes to sync local state.
  // When returning from expand-view to embed in single-video mode, reset the
  useEffect(() => {
    function handleActivePlayerTypeChange(
      eventData: any,
      context: EmbedEventContextType,
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
      context: EmbedEventContextType,
    ) {
      setActiveIndex(context.activeIndex);
    }

    embedEventBus.on("activeIndexChange", handleActiveIndexChange);
    return () => {
      embedEventBus.off("activeIndexChange", handleActiveIndexChange);
    };
  }, [
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    videos,
    swiper,
  ]);

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
      ? videos.filter((item) => item.video?.type !== "complete").length
      : videos.filter((item) => item.video?.type === "video").length;
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
      /**
       * Checks whether the "onCaughtOverlay" event has already been fired
       * in the current session. If `isCaughtUpEventFired` is `true`, the event
       * is skipped to prevent duplicate triggers.
       */
      const isCaughtUpEventFired =
        embedEventBus.getContext().isCaughtUpEventFired;
      if (isCaughtUpEventFired) return;

      // Only check end of feed for iheart layout and we have to show toaster for desktop and tablet.
      if (
        config?.view?.brandLayoutType !== "iheart" ||
        !isDesktop ||
        !Array.isArray(filteredPost) ||
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
        embedEventBus.emit(
          "disableCaughtUpEvent",
          undefined,
          (currentContext) => ({
            ...currentContext,
            isCaughtUpEventFired: true,
          }),
        );
        SDKEventEmitter.emit(SDKEventName.CAUGHT_OVERLAY, true);
      }
    },
    [videos, isDesktop, SDKEventEmitter, SDKEventName, embedEventBus],
  );

  if (config.view.isExpandOnly) {
    return (
      <Suspense fallback={<FeedSkeleton variant="fullscreen" />}>
        <EmbedExpandView
          videos={videos}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          queryKey={queryKey}
          totalVideos={totalVideos}
          fetchNextPage={fetchNextPage}
        />
      </Suspense>
    );
  }

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

  if (filteredPost.length === 0 && !isLoading) {
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
        className,
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
        {isIheartLayout && (
          <Suspense fallback={null}>
            <IheartUrlManager
              websiteType={websiteType}
              activePlayerType={activePlayerType}
              activeIndex={activeIndex}
              videos={filteredPost}
            />
          </Suspense>
        )}
        <FetchNextPageHandler
          videos={filteredPost}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          swiper={swiper}
        />
        {isGridLayout ? (
          <GridView
            videos={filteredPost}
            rows={config.view.gridLayout?.row ?? 2}
            cols={config.view.gridLayout?.column ?? 2}
            autoAdjust={config.view.gridLayout?.auto_adjust}
            aspectRatio={embedAspectRatio}
            totalVideos={feedData?.pages?.[0]?.totalVideos}
          />
        ) : (
          !isOnlyForExpand && (
            <div className="gencl:relative">
              <EmbedHeader
                style={{
                  height: headerHeight,
                }}
                variant={embedVariant}
              />
              <EmbedSwiper
                onSwiper={(swiperInstance: any) => setSwiper(swiperInstance)}
                forFeed={config.view.isFeed}
                aspectRatio={embedAspectRatio}
                spaceBetweenVideos={spaceBetweenVideos}
                slidesPerView={slidesPerView}
                isIheartLayout={isIheartLayout}
                allowTouchMove={!config.view.expandOnInteraction}
                onSlideChange={(swiperInstance: any) => {
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
                customHeightFor={{
                  index: filteredPost.findIndex(
                    (feed) => feed.video?.type === "overlay",
                  ),
                  height: 160,
                }}
              >
                {filteredPost?.map((videoData, idx) => {
                  return videoData.video?.type === "complete" ? (
                    <></>
                  ) : videoData.video?.type === "overlay" &&
                    config.view.brandLayoutType === "iheart" &&
                    isDesktop &&
                    websiteType !== "legacy" ? (
                    <></>
                  ) : (
                    <SwiperSlide key={idx} virtualIndex={idx}>
                      <Suspense fallback={<ShimmerSlide />}>
                        <EmbedItem
                          index={idx}
                          postDetails={videoData}
                          totalVideos={feedData?.pages?.[0]?.totalVideos}
                          swiper={swiper}
                          itemSize={slideItemSize}
                        />
                      </Suspense>
                    </SwiperSlide>
                  );
                })}
                {/* Add shimmer slides when fetching next page */}
                {isFetchingNextPage &&
                  Array.from({ length: 3 }).map((_, idx) => (
                    <SwiperSlide
                      key={`shimmer-${idx}`}
                      virtualIndex={filteredPost.length + idx}
                    >
                      <ShimmerSlide />
                    </SwiperSlide>
                  ))}
                {((embedData.style === "carousel" && isIheartLayout) ||
                  !isIheartLayout) && (
                  <NavigationButtonsWithContext
                    totalSlides={totalSlides}
                    theme={theme}
                    embedVariant={embedVariant}
                    setSlidesOffsetBefore={setSlidesOffsetBefore}
                  />
                )}
              </EmbedSwiper>
            </div>
          )
        )}
        {isIheartLayout && embedData.style === "feed" && (
          <NavigationButtonsWithContext
            totalSlides={totalSlides}
            isIheartLayout={true}
            theme={theme}
            embedVariant={embedVariant}
            setSlidesOffsetBefore={setSlidesOffsetBefore}
          />
        )}
      </EmbedManagerProvider>
      {config.expandViewConfig.enable && (
        <ExpandViewLoader
          videos={expandViewFeed}
          isSectioned={isSectioned}
          pageSession={feedData?.pages[0]?.pageSession}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          queryKey={queryKey}
          totalVideos={totalVideos}
          fetchNextPage={fetchNextPage}
        />
      )}
      {config.view.isFloatingView && (
        <PipViewLoader
          totalVideos={feedData?.pages[0]?.totalVideos}
          videos={filteredPost ?? []}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
