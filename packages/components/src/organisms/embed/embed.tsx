"use client";
import { cn, getAspectRatio } from "@genuin/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { useMemo, useState, useEffect, useCallback, lazy } from "react";
import { SwiperSlide } from "swiper/react";
import type { Swiper } from "swiper/types";

import { useBaseContext } from "@genuin/components/context";
import { useAnalytics } from "@genuin/components/context/analytics/context";
import { AnalyticsService } from "@genuin/components/context/analytics/service";
import { useEmbedContext } from "@genuin/components/context/embed";
import type { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useEmbedDimensions } from "@genuin/components/hooks/embed/use-embed-dimensions";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { SDKEventEmitter, SDKEventName } from "@genuin/components/lib/sdk-event-emitter";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { attachSwipeIntent, isUserSwipe } from "@genuin/components/organisms/player-swiper/swipe-intent";
import { useFeed } from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { FeedSkeleton } from "@genuin/components/templates/feed";
import { IHeartFeedSkeleton } from "@genuin/components/templates/feed/iheart-feed-skeleton";

import { getSlidesPerView } from "../../molecules/embed-swiper/utils";

import { EmbedManagerProvider } from "./context";
import type { EmbedProps } from "./embed.types";
import { SdkEmptyState } from "./empty-state";
import { SdkErrorState } from "./error-state";
import { ExpandViewLoader } from "./expand-view/expand-view-loader";
import { FetchNextPageHandler } from "./fetch-next-page-handler";
import { PipViewLoader } from "./pip-view/pip-view-loader";
import { SdkSkeleton, ShimmerSlide } from "./skeleton";
import { useAutoExpand } from "./use-auto-expand";
import { isSlideVisible, getFlatActiveIndex } from "./utils";

// TODO(temp): Remove this KFI dummy-data override. Temporary placement-specific
// hardcoding — drop once real attribute/linkout data is served from the API.
/** Placement that receives the KFI station attribute/linkout override. */
const KFI_PLACEMENT_IDS = ["6a2be0e245aec54862efd9a5", "6a312de7a01f8b8ab6edde5a", "6a58b607d38c51231b98e981"];
const KFI_LINKOUT_URL = "https://iheart.com/live/177";
/** CTA text the iHeart listen-live button renders (it reads `linkouts[0].cta_text`). */
const KFI_LINKOUT_CTA_TEXT = "Listen Live";
const KFI_ATTRIBUTE_OVERRIDE = {
  type: "station",
  station_id: "177",
  title: "KFI AM 640",
  description: "KFI AM 640 - More Stimulating Talk",
  image_url:
    "https://i.iheart.com/v3/re/assets.brands/690a88896eecce6af2355242?ops=gravity(%22center%22),contain(360,360)&quality=80",
  // The expand-view CTA (ClipPlayerCTA) only renders when attributes.slug is set.
  // The actual click redirects to cta_link, so this value just unblocks that guard.
  slug: "kfi-am-640",
} as const;

/** Linkout injected when a KFI feed item has none, so the listen-live CTA still renders. */
const KFI_DEFAULT_LINKOUT = {
  cta_link: KFI_LINKOUT_URL,
  cta_text: KFI_LINKOUT_CTA_TEXT,
  links: [],
};

/**
 * For the KFI placement, merge dummy station attributes into every feed item's
 * `video.attributes` and force every linkout to the KFI "Listen Live" CTA
 * (`cta_link` + `cta_text`). The iHeart layout's listen-live button only renders
 * when `linkouts[0].cta_text` is present, so items without linkouts get one injected.
 * Returns the input untouched for any other placement. Clones rather than mutates
 * so cached query data is never edited in place.
 */
function applyPlacementAttributeOverride<T extends { pages?: Array<{ feed?: PostDetailsType[] }> } | undefined>(
  data: T,
  placementId: string | undefined
): T {
  if (!data || !placementId || !KFI_PLACEMENT_IDS.includes(placementId) || !data.pages) {
    return data;
  }
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      feed: page.feed?.map((item) => {
        if (!item.video) return item;
        const existingLinkouts = item.video.linkouts;
        const linkouts =
          Array.isArray(existingLinkouts) && existingLinkouts.length > 0
            ? existingLinkouts.map((linkout) => ({
                ...linkout,
                cta_link: KFI_LINKOUT_URL,
                cta_text: KFI_LINKOUT_CTA_TEXT,
              }))
            : [KFI_DEFAULT_LINKOUT];
        return {
          ...item,
          video: {
            ...item.video,
            attributes: { ...item.video.attributes, ...KFI_ATTRIBUTE_OVERRIDE },
            linkouts,
          },
        };
      }),
    })),
  } as T;
}

const IheartUrlManager = lazy(() =>
  import("./iheart-url-manager").then((m) => ({
    default: m.IheartUrlManager,
  }))
);

// Lazy load GridView
const GridView = lazy(() => import("./grid-view/grid-view").then((m) => ({ default: m.GridView })));

const EmbedExpandView = lazy(() =>
  import("./expand-view").then((m) => ({
    default: m.EmbedExpandView,
  }))
);

// Lazy load NavigationButtonsWithContext
const NavigationButtonsWithContext = lazy(() =>
  import("./navigation-buttons").then((m) => ({
    default: m.NavigationButtonsWithContext,
  }))
);

// Lazy load EmbedSwiper
const EmbedSwiper = lazy(() =>
  import("@genuin/components/molecules/embed-swiper").then((m) => ({
    default: m.EmbedSwiper,
  }))
);

// Lazy load EmbedHeader
const EmbedHeader = lazy(() =>
  import("@genuin/components/molecules/embed-header").then((m) => ({
    default: m.EmbedHeader,
  }))
);

// Lazy load Toaster
// const Toaster = lazy(() =>
//   import("@genuin/ui").then((m) => ({ default: m.Toaster }))
// );

// Lazy load EmbedItem
const EmbedItem = lazy(() => import("./embed-tile-item").then((m) => ({ default: m.EmbedItem })));

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

  const [swiperKey, setSwiperKey] = useState(0);
  // Flat index the remounted swiper should start at (sectioned: restore correct section).
  const [swiperInitialSlide, setSwiperInitialSlide] = useState(0);

  const { isInIframe, theme } = useBaseContext();
  const { embedData, embedEventBus, rootElement, updateIsSectioned, updateSectionList, changeActivePlayerType } =
    useEmbedContext();
  // Local state for isSectioned synced with event bus
  const [isSectioned, setIsSectioned] = useState(embedEventBus.getContext().isSectioned);
  // Local state for activePlayerType synced with event bus
  const [activePlayerType, setActivePlayerType] = useState(embedEventBus.getContext().activePlayerType);
  // Local state for activeIndex synced with event bus
  const [activeIndex, setActiveIndex] = useState(embedEventBus.getContext().activeIndex);
  const { track, EventName } = useAnalytics();
  const config = useEmbedConfigs();

  useAutoExpand(
    rootElement,
    config.brand.shouldAutoExpand,
    () => changeActivePlayerType("expand-view"),
    config.expandViewConfig.enable
  );

  const embedAspectRatio = config.dimensions.aspectRatio;
  // Landscape (e.g. 16:9) carousels must not show the previous-slide peek,
  // so the slide offset stays at zero for horizontal videos.
  const { width: aspectWidth, height: aspectHeight } = getAspectRatio(embedAspectRatio);
  const isLandscapeVideo = aspectWidth > aspectHeight;
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
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute("content") ?? "";
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
    configuration: embedData.configuration,
    embedId: embedData.embed_id,
    sponsorship_id: embedData.sponsorship_id,
    isInIframe,
    shouldShowMiddlewareOverlay: isMiddlewareOverlayEnabled({
      videoLayoutId: embedData.placement_video_layout_id,
      cardLayoutId: embedData.placement_card_layout_id,
    }),
    brandContext: embedData.brand_context?.map(({ id, type, value }) => ({
      id,
      type,
      value,
    })),
    videoIds: embedData.videoIds,
    initialVideoIds: embedData.initialVideoIds,
  };

  // Single options object shared by both useFeed and getQueryKeyForFeed.
  // getQueryKeyForFeed serializes EVERY option key into the cache key, so the
  // key must be derived from the exact same options useFeed registers under —
  // including `enabled`. Deriving the standalone queryKey from `feedParams`
  // (without `enabled`) produced a key missing the "enabled-undefined" element,
  // so optimistic updates via setQueryData (exact match) silently no-oped and
  // the spark/reaction UI never updated despite a 200 API response.
  const feedQueryOptions = {
    ...feedParams,
    // Skip the API call entirely when a caller (storybook fixture,
    // SSR-hydrated host) supplies its own feed data — the response
    // would 4xx without a valid JWT and `isError` below would short-
    // circuit to `<SdkErrorState>` even though the fixture is valid.
    enabled: externalFeedData ? false : undefined,
  };
  const {
    isLoading,
    data: apiFeedData,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(feedType, feedParams);
  const queryKey = getQueryKeyForFeed(feedType, feedQueryOptions);
  const rawFeedData = externalFeedData ?? apiFeedData;
  // For a specific placement, override each feed item's attributes/linkouts with
  // station-specific dummy data. Existing attributes are merged, not overwritten.
  const feedData = useMemo(
    () => applyPlacementAttributeOverride(rawFeedData, embedData.placement_id),
    [rawFeedData, embedData.placement_id]
  );
  const videos = useMemo(() => feedData?.pages?.flatMap((page) => page.feed) || [], [feedData]);
  const pageSession = feedData?.pages[0]?.pageSession;
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
  const isIheartArticlePage = config.layoutConfig.isIheartArticlePage;
  const filteredPost = useMemo(() => {
    // On an iHeart article page, the embed/expand view must not surface the
    // "complete" (caught-up) or "overlay" special slides.
    if (isIheartArticlePage) {
      return videos.filter((post) => post.video?.type !== "overlay" && post.video?.type !== "complete");
    }
    return isSectioned
      ? videos.filter((post) => post.video?.type !== "overlay" && !(isSectioned && post.video?.type === "complete"))
      : isDesktop && websiteType === "polaris" && isIheartLayout
        ? videos.filter((post) => post.video?.type !== "overlay")
        : videos;
  }, [videos, isDesktop, isSectioned, websiteType, isIheartLayout, isIheartArticlePage]);

  // Extract video titles from postDetails
  const sectionList = useMemo(() => filteredPost.map((videoData) => videoData.section || null), [filteredPost]);

  const slidesPerView = useMemo(
    () =>
      getSlidesPerView(
        config.view.isFeed ? availableHeight - spaceBetweenVideos : availableHeight + spaceBetweenVideos,
        containerWidth,
        config.view.isFeed,
        embedAspectRatio,
        config.embedSwiperConfigs.useWindowSwiperMode,
        isIheartArticlePage
      ) ?? 1,
    [
      config.view.isFeed,
      embedAspectRatio,
      availableHeight,
      spaceBetweenVideos,
      containerWidth,
      config.embedSwiperConfigs.useWindowSwiperMode,
      isIheartArticlePage,
    ]
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
  }, [config.view.isFeed, containerWidth, availableHeight, spaceBetweenVideos, slidesPerView]);

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
        thumbnailUrl: filteredPost[0]?.video?.thumbnail || filteredPost[0]?.video?.thumbnailM || "",
        videoUrl: filteredPost[0]?.video?.source || "",
      });
    }
    // In embed mode, the sections list does not need to be updated.
    if (isEmbed) return;
    if (sectionList.length > 0 && updateSectionList) {
      updateSectionList(sectionList);
      AnalyticsService.updatePayload(
        "section_name",
        sectionList.filter((section) => section?.title !== null && section?.title !== undefined)
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
              track(isEmbed ? EventName.EMBED_VIEWED : EventName.PLACEMENT_VIEWED, {
                community_id: config.community.communityIds,
                group_id: config.community.communityLoopIds,
                // iHeart screen_view: show/section identity (view.item.asset.id/name) + page URL.
                section_title: filteredPost[0]?.video?.attributes?.title ?? filteredPost[0]?.section?.title,
                section_id: filteredPost[0]?.section?.id,
                content_id: filteredPost[0]?.video?.id,
                podcast_id: filteredPost[0]?.video?.attributes?.podcast_id,
                station_id: filteredPost[0]?.video?.attributes?.station_id,
                page_name: "show_title_clips_feed",
                url: typeof window !== "undefined" ? window.location.href : undefined,
                ...(!isEmbed && {
                  has_sections: isSectioned,
                  section_count: sectionList.length,
                }),
                activeIndex: 10,
              });
            }
          });
        },
        { threshold: 0.01 }
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
      filteredPost,
    ]
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
      { debounceTime: 100 }
    );
  }, [containerHeight, containerWidth]);

  // Listen for centerActiveSlide event to center the swiper when exiting expand view
  useEffect(() => {
    function handleCenterActiveSlide() {
      if (swiper) {
        const targetIndex = getFlatActiveIndex(embedEventBus.getContext());
        swiper.slideTo(targetIndex, 300); // Center the active slide with smooth animation
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
    function handleActivePlayerTypeChange(_eventData: unknown, context: EmbedEventContextType) {
      setActivePlayerType(context.activePlayerType);
      if (isSectioned ? context.activePlayerType !== "expand-view" : undefined) {
        // Seed initialSlide with the flat index of the selected section before remounting.
        setSwiperInitialSlide(getFlatActiveIndex(context));
        setSwiperKey((k) => k + 1);
      }
    }

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus, isSectioned]);

  // Listen for activeIndex changes to sync local state
  useEffect(() => {
    function handleActiveIndexChange(eventData: any, context: EmbedEventContextType) {
      setActiveIndex(context.activeIndex);
    }

    embedEventBus.on("activeIndexChange", handleActiveIndexChange);
    return () => {
      embedEventBus.off("activeIndexChange", handleActiveIndexChange);
    };
  }, [fetchNextPage, isLoading, hasNextPage, isFetchingNextPage, videos, swiper]);

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
      const isCaughtUpEventFired = embedEventBus.getContext().isCaughtUpEventFired;
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
          isReachedEndOfFeed = videos.slice(startIndex, endIndex + 1).some((feed) => feed?.video?.type === "overlay");
        }
      }

      // Emit event if overlay detected
      if (isReachedEndOfFeed) {
        embedEventBus.emit("disableCaughtUpEvent", undefined, (currentContext) => ({
          ...currentContext,
          isCaughtUpEventFired: true,
        }));
        SDKEventEmitter.emit(SDKEventName.CAUGHT_OVERLAY, true);
      }
    },
    [videos, isDesktop, SDKEventEmitter, SDKEventName, embedEventBus]
  );

  if (config.view.isExpandOnly) {
    return (
      <SafeSuspense fallback={isIheartLayout ? <IHeartFeedSkeleton /> : <FeedSkeleton variant="fullscreen" />}>
        <EmbedExpandView
          videos={videos}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          queryKey={queryKey}
          totalVideos={totalVideos}
          fetchNextPage={fetchNextPage}
        />
      </SafeSuspense>
    );
  }

  if (isError && !externalFeedData) {
    return <SdkErrorState containerHeight={containerHeight} containerWidth={containerWidth} />;
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
    return <SdkEmptyState containerHeight={containerHeight} containerWidth={containerWidth} />;
  }

  return (
    <div
      ref={embedRefCallback}
      className={cn("gen-sdk-embed", embedVariants({ variant: embedVariant }), className)}
      style={{
        ...(!config.useWindowSwiperMode && {
          height: containerHeight,
          width: containerWidth,
        }),
        ...style,
      }}
      {...restProps}>
      <EmbedManagerProvider swiper={swiper}>
        {isIheartLayout && (
          <SafeSuspense fallback={null} errorFallback={null}>
            <IheartUrlManager
              websiteType={websiteType}
              activePlayerType={activePlayerType}
              activeIndex={activeIndex}
              videos={filteredPost}
            />
          </SafeSuspense>
        )}
        <FetchNextPageHandler
          videos={filteredPost}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          swiper={swiper}
        />
        {isGridLayout ? (
          <SafeSuspense
            fallback={
              <SdkSkeleton
                containerHeight={containerHeight}
                containerWidth={containerWidth}
                statsHeight={statsHeight}
                linkoutHeight={linkoutHeight}
                spaceBetweenVideos={spaceBetweenVideos}
                availableHeight={availableHeight}
              />
            }
            errorFallback={null}>
            <GridView
              videos={filteredPost}
              rows={config.view.gridLayout?.row ?? 2}
              cols={config.view.gridLayout?.column ?? 2}
              autoAdjust={config.view.gridLayout?.auto_adjust}
              aspectRatio={embedAspectRatio}
              totalVideos={feedData?.pages?.[0]?.totalVideos}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          </SafeSuspense>
        ) : (
          !isOnlyForExpand && (
            <div className="gencl:relative">
              <SafeSuspense fallback={null} errorFallback={null}>
                <EmbedHeader
                  style={{
                    height: headerHeight,
                  }}
                  variant={embedVariant}
                />
              </SafeSuspense>
              <SafeSuspense
                fallback={
                  <div style={{ height: availableHeight }} className="gencl:flex gencl:gap-2 gencl:overflow-hidden">
                    {Array.from({ length: Math.max(1, Math.ceil(slidesPerView)) }).map((_, idx) => (
                      <ShimmerSlide key={`swiper-fallback-${idx}`} />
                    ))}
                  </div>
                }
                errorFallback={null}>
                <EmbedSwiper
                  key={swiperKey}
                  initialSlide={swiperInitialSlide}
                  onSwiper={(swiperInstance: any) => {
                    attachSwipeIntent(swiperInstance);
                    setSwiper(swiperInstance);
                  }}
                  forFeed={config.view.isFeed}
                  aspectRatio={embedAspectRatio}
                  spaceBetweenVideos={spaceBetweenVideos}
                  slidesPerView={slidesPerView}
                  isIheartLayout={isIheartLayout}
                  allowTouchMove={!config.brand.expandOnInteraction}
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
                  onSlidePrevTransitionStart={(swiper: any) =>
                    track(EventName.SWIPE_PREVIOUS, { auto_swipe: !isUserSwipe(swiper) })
                  }
                  onSlideNextTransitionStart={(swiper: any) =>
                    track(EventName.SWIPE_NEXT, { auto_swipe: !isUserSwipe(swiper) })
                  }
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
                    config.view.isCarousel && isIheartLayout && !isMobile && !isLandscapeVideo ? slidesOffsetBefore : 0
                  }
                  customHeightFor={{
                    index: filteredPost.findIndex((feed) => feed.video?.type === "overlay"),
                    height: 160,
                  }}>
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
                        <SafeSuspense fallback={<ShimmerSlide />} errorFallback={null}>
                          <EmbedItem
                            index={idx}
                            postDetails={videoData}
                            totalVideos={feedData?.pages?.[0]?.totalVideos}
                            swiper={swiper}
                            itemSize={slideItemSize}
                            pageSession={pageSession}
                          />
                        </SafeSuspense>
                      </SwiperSlide>
                    );
                  })}
                  {/* Add shimmer slides when fetching next page */}
                  {isFetchingNextPage &&
                    Array.from({ length: 3 }).map((_, idx) => (
                      <SwiperSlide key={`shimmer-${idx}`} virtualIndex={filteredPost.length + idx}>
                        <ShimmerSlide />
                      </SwiperSlide>
                    ))}
                  {!isIheartLayout && (
                    <NavigationButtonsWithContext
                      totalSlides={totalSlides}
                      isIheartLayout={isIheartLayout}
                      theme={theme}
                      embedVariant={embedVariant}
                      setSlidesOffsetBefore={setSlidesOffsetBefore}
                      v2Size={embedVariant === "feed" ? "md" : undefined}
                    />
                  )}
                </EmbedSwiper>
              </SafeSuspense>
            </div>
          )
        )}
        {isIheartLayout && (
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
          videos={filteredPost}
          isSectioned={isSectioned}
          pageSession={pageSession}
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
