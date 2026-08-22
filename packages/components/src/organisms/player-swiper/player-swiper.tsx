"use client";

import { Loader } from "@genuin/ui/components/loader";
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useEffect, useState, useRef, useMemo, useCallback, lazy } from "react";
import type { Swiper } from "swiper/types";
import { useBoolean } from "usehooks-ts";

import { useAnalytics, VideoTypes } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useFocusManagement } from "@genuin/components/hooks/use-focus-management";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import type { OctoPanelHandle } from "@genuin/components/molecules/octo-panel/octo-panel";
import { type PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";
import {
  ActionButtonsSkeleton,
  FEED_SKELETON_THEME,
  PlayerSkeleton,
  SidePanelSkeleton,
} from "@genuin/components/templates/feed/feed-skeleton";

import type { Player } from "./player";
import { calculateSlideDimensions } from "./utils";

import "swiper/css";

const CloseButton = lazy(() =>
  import("./player-swiper-buttons").then((m) => ({
    default: m.CloseButton,
  }))
);
const NavigationButton = lazy(() =>
  import("./player-swiper-buttons").then((m) => ({
    default: m.NavigationButton,
  }))
);

const PlayerHeader = lazy(() => import("./player-header").then((m) => ({ default: m.PlayerHeader })));

const IHeartBackButton = lazy(() =>
  import("./iheart/iheart-back-button").then((m) => ({
    default: m.IHeartBackButton,
  }))
);

const Actions = lazy(() =>
  import("@genuin/components/molecules/actions/index").then((m) => ({
    default: m.Actions,
  }))
);
// Using any for now to stop the bleed, will refine if possible

// Lazy load heavy comment components to split vendor-forms chunk
const Comments = lazy(() =>
  import("@genuin/components/molecules/comments/comments").then((m) => ({
    default: m.Comments,
  }))
);
const CommentsDialog = lazy(() =>
  import("@genuin/components/molecules/comments/comments-dialog").then((m) => ({
    default: m.CommentsDialog,
  }))
);

const OctoPanel = lazy(() =>
  // Extensionless path: an explicit `.js` breaks module resolution against
  // `index.ts`. The file is `index.ts`, every other lazy import in this module
  // omits the extension, and Next.js's dev server doesn't auto-rewrite `.js` →
  // `.ts` for an explicitly-specified `.js` path. Surfaced when /home tries to
  // compile this chunk; the stale extension fails module resolution.
  import("../../molecules/octo-panel").then((m) => ({
    default: m.OctoPanel,
  }))
);

// prefetch: CHUNK_LOADERS.sectionedContent mirrors this import (see lib/prefetch/chunk-loaders.ts)
const SectionedContent = lazy(() =>
  import("./sectioned-content").then((m) => ({
    default: m.SectionedContent,
  }))
);

// prefetch: CHUNK_LOADERS.nonSectionedContent mirrors this import (see lib/prefetch/chunk-loaders.ts)
const NonSectionedContent = lazy(() =>
  import("./non-sectioned-content").then((m) => ({
    default: m.NonSectionedContent,
  }))
);

const SectionsTabs = lazy(() => import("./sections-tabs").then((m) => ({ default: m.SectionsTabs })));

const DesktopRightPanels = lazy(() =>
  import("./desktop-right-panels").then((m) => ({ default: m.DesktopRightPanels }))
);

const IntelligenceChatSidePanel = lazy(() =>
  import("./intelligence-chat-side-panel").then((m) => ({ default: m.IntelligenceChatSidePanel }))
);

/**
 * A Suspense fallback that occupies the same positioned box as the lazy component
 * it stands in for, with the spinner centered inside. Bare `<Loader />` collapses to
 * its 16px intrinsic size at the flex start of the container and shifts the layout
 * when the real (absolutely-positioned) chunk swaps in; this keeps the loader where
 * the content will actually appear so there is no jump.
 */
function PositionedLoader({
  className,
  size = "xs",
}: {
  className?: string;
  size?: ComponentProps<typeof Loader>["size"];
}) {
  return (
    <div className={cn("gencl:flex gencl:items-center gencl:justify-center", className)} aria-hidden>
      <Loader size={size} />
    </div>
  );
}

type PlayerListPropsType = {
  posts: PostDetailsType[];
  startIndex?: number;
  className?: string;
  isSectioned?: boolean;
  disableSwiper?: boolean;
  theme?: "light" | "dark";
  totalVideos?: number;
  onActiveIndexChange?: (index: number) => void;
  /**
   * @param isReacted - Whether the post is reacted to
   * @returns void
   */
  onReactionStateChange?: (videoId: string, videoSlug: string, isReacted: boolean) => void;
  onCommunityJoinStatusChange: ComponentProps<typeof Player>["onCommunityJoinStatusChange"];
  onGroupJoinStatusChange: ComponentProps<typeof Player>["onGroupJoinStatusChange"];
  onGroupSubscriptionChange: ComponentProps<typeof Player>["onGroupSubscriptionChange"];
  /**
   * @param videoId - The video id
   * @param increment - true to increment, false to decrement
   */
  onCommentCountChange?: ComponentProps<typeof Player>["onCommentCountChange"];
  /** Feed-session identifier from the first feed API page, forwarded to analytics. */
  pageSession?: string | null;
  isAdFilled?: boolean;
  onAdFilled?: (type: string, index: number) => void;
  onAdPlaybackEnd?: (index: number) => void;
};

// TODO: This component is using feed context, which is not ideal. Remove this dep of FeedContext in future.
export function PlayerList({
  posts,
  startIndex = 0,
  isSectioned = false,
  disableSwiper = false,
  theme,
  totalVideos,
  onActiveIndexChange,
  onReactionStateChange,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommentCountChange,
  pageSession,
  isAdFilled = false,
  onAdFilled,
  onAdPlaybackEnd,
}: PlayerListPropsType) {
  const { showExpandView, activeIndex, toggleExpandView } = useFeedContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const { isIpad } = useDeviceDetection();
  const {
    engagement: {
      engagementTools: { comment: showCommentBox, octo: isOctoToolEnabled },
      showEngagementTools,
    },
    view: { brandLayoutType, websiteType, isAdsEnabledInIheart },
    layoutConfig: { isIheartArticlePage },
    isDesignSystemV2Linkouts,
  } = useEmbedConfigs();

  // Comment panel state - only auto-open if Octo is NOT enabled (Octo takes priority)
  const {
    value: isCommentOpen,
    toggle: toggleComment,
    setValue: setCommentOpen,
  } = useBoolean(isDesktop && !isIpad && !(showEngagementTools && isOctoToolEnabled));

  // OCTO panel state - auto-open on desktop when Octo tool is enabled
  const { value: isOctoOpen, setValue: setOctoOpen } = useBoolean(
    isDesktop && !isIpad && showEngagementTools && isOctoToolEnabled
  );
  // Intelligence chat panel state - opened from the action rail's sparkle icon;
  // mutually exclusive with the comments and OCTO right-rail panels.
  const { value: isIntelligenceOpen, setValue: setIntelligenceOpen } = useBoolean(false);
  const octoPanelRef = useRef<OctoPanelHandle | null>(null);
  const lastOctoVideoIdRef = useRef<string | null>(null);
  const embedDetails = useSafeEmbedContext();
  const {
    sheetState,
    openContentType,
    setContentTypeState,
    hasContentType,
    closeContentType,
    getContentTypeState,
    sheetContentPlacements,
  } = useSheetState();
  const [isEndOfFeedReached, setEndOfFeedReached] = useState<boolean>(false);
  // Colors for the lazy-chunk Suspense fallbacks below. The expand view renders
  // on a dark surface by default, matching the FeedSkeleton default theme.
  const skeletonColors = FEED_SKELETON_THEME[theme === "light" ? "light" : "dark"];
  // Single player shimmer reused by the player-area boundary AND each slide's lazy
  // Player/WatchBoundaryOverlay boundary, so no boundary in the slide tree falls back
  // to null (a null fallback paints a black box while the chunk downloads).
  const playerChunkFallback = (
    <div className="gencl:h-full gencl:w-full">
      <PlayerSkeleton colors={skeletonColors} isMobile={isMobile} />
    </div>
  );
  // if we use directly isTablet from the hook then for desktop it will be true based on useDeviceDetectMediaQuery implementation
  const isTablet = !isMobile && !isDesktop;
  const [adActiveOn, setAdActiveOn] = useState<number>(-1);

  // Container dimensions state. Only the iheart-tablet case needs a measured value
  // (computed in the effect via ResizeObserver); every other layout just needs a
  // truthy object to unblock rendering. Seed that synchronously in the initializer
  // so the player area paints on the FIRST commit — leaving it null until the effect
  // runs left the reel container empty for a frame (longer on heavy host pages),
  // which is the transparent gap seen when entering expand view.
  const containerRef = useRef<HTMLDivElement>(null);
  const needsMeasuredDimensions = brandLayoutType === "iheart" && isTablet;
  const [slideDimensions, setSlideDimensions] = useState<{
    slideWidth: number;
    slideHeight: number;
    slidesPerView: number;
  } | null>(() => (needsMeasuredDimensions ? null : ({} as any)));

  // Calculate slide dimensions on mount and resize (only for iheart brand on specific devices)
  useEffect(() => {
    const shouldCalculateDimensions = brandLayoutType === "iheart" && isTablet;

    if (!shouldCalculateDimensions) {
      // Drop any width measured while we were in the iheart-tablet regime so the
      // aspect-reel CSS governs sizing again. Critical for the iframe tablet→desktop
      // transition: entering browser fullscreen grows the viewport from ~900px
      // (tablet) to the screen width (desktop), which flips isTablet false. Without
      // this reset the stale measured width (e.g. 159px from the collapsed 340px
      // height) would persist as an inline style and collapse the reel to a narrow
      // strip. Only fires when a stale measured value exists, so no extra renders
      // in the common (already-seeded) case.
      setSlideDimensions((prev) => (prev && prev.slideWidth ? ({} as any) : prev));
      return;
    }

    const updateDimensions = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        if (containerHeight > 0) {
          const dimensions = calculateSlideDimensions({
            containerDimension: containerHeight,
            dimensionType: "height",
            aspectRatio: 9 / 16,
            // In the disabled swiper case, we should display only a single clip in the table view.
            slidesPerView: disableSwiper || websiteType === "legacy" ? 1 : 1.2,
          });
          setSlideDimensions(dimensions);
        }
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [brandLayoutType, isMobile, isDesktop]);

  const changeExpandViewType = useCallback(() => {
    if (!embedDetails) return;

    const { activeIndex } = embedDetails.embedEventBus.getContext();

    /*
     * Sync indices when switching from expand view to embed view.
     * Expand view hides the overlay card, so we need to adjust the active index
     * when transitioning to maintain the correct video position.
     */
    const overlayIndex = posts.findIndex((post) => post.video?.type === "overlay");
    const isNotAtEndOfFeed = posts[activeIndex + 1]?.video?.type !== "complete";
    // increment by 1 to account for overlay card that won't be shown in expand view
    if (
      overlayIndex !== -1 &&
      activeIndex >= overlayIndex &&
      isNotAtEndOfFeed &&
      (websiteType === "legacy" || (websiteType === "polaris" && !isDesktop))
    ) {
      onActiveIndexChange?.(activeIndex + 1);
    }
    toggleExpandView();
  }, [posts, embedDetails, onActiveIndexChange, isDesktop]);

  // Section-related state
  const sectionList = embedDetails?.embedEventBus.getContext().sectionList;
  const selectedSection = embedDetails?.embedEventBus.getContext().selectedSection;

  // Swiper state management
  const [horizontalSwiper, setHorizontalSwiper] = useState<Swiper | null>(null);
  const [verticalSwipers, setVerticalSwipers] = useState<Record<number, Swiper>>({});
  const [activeHorizontalIndex, setActiveHorizontalIndex] = useState(0);

  // Get the active swiper for navigation buttons
  const activeSwiper = isSectioned ? verticalSwipers[activeHorizontalIndex] : verticalSwipers[0];

  // Callback to enable/disable swipers when interacting with Pills
  const handleSwiperToggle = useCallback(
    (disable: boolean) => {
      // `.destroyed` guard: on a section switch the old vertical Swiper is torn
      // down but its instance lingers in `verticalSwipers` state. Calling
      // enable()/disable() on a destroyed Swiper dereferences a null `params`
      // (TypeError: Cannot read properties of undefined reading 'grabCursor'),
      // crashing into the error boundary. Same stale-reference guard as the
      // activeIndexChange effect below.
      if (isSectioned && horizontalSwiper && !horizontalSwiper.destroyed) {
        if (disable) {
          horizontalSwiper.disable();
        } else {
          horizontalSwiper.enable();
        }
      }
      // Also disable/enable the active vertical swiper
      if (activeSwiper && !activeSwiper.destroyed) {
        if (disable) {
          activeSwiper.disable();
        } else {
          activeSwiper.enable();
        }
      }
    },
    [isSectioned, horizontalSwiper, activeSwiper]
  );

  useEffect(() => {
    const shouldDisable = sheetState === "full-view" || sheetState === "panel-view";
    handleSwiperToggle(shouldDisable);
  }, [sheetState, handleSwiperToggle]);

  // Drop overlay posts entirely — we can't just skip a slide with a swiper-in-swiper.
  const filteredPost = useMemo(() => {
    // On an iHeart article page the expand view must also drop the "complete"
    // (caught-up) slide, not just the "overlay" slide.
    if (isIheartArticlePage) {
      return posts.filter((post) => post.video?.type !== "overlay" && post.video?.type !== "complete");
    }
    return posts.filter((post) => post.video?.type !== "overlay");
  }, [posts, isIheartArticlePage]);

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      onActiveIndexChange?.(index);
    },
    [adActiveOn, filteredPost, onActiveIndexChange]
  );
  // Focus management hook (only for iHeart)
  const { containerRef: playerListRef } = useFocusManagement({
    isEnabled: showExpandView && brandLayoutType === "iheart" && !isAdFilled,
    activeIndex,
    activeSwiper,
  });

  const activeVideoId = filteredPost[activeIndex]?.video?.id;

  useEffect(() => {
    if (!activeVideoId) {
      lastOctoVideoIdRef.current = null;
      return;
    }

    if (isOctoOpen && lastOctoVideoIdRef.current && lastOctoVideoIdRef.current !== activeVideoId) {
      try {
        octoPanelRef.current?.resetForVideo(activeVideoId);
      } catch (error) {
        console.error("[PlayerList] Failed to reset OctoPanel for video change:", error);
      }
    }

    lastOctoVideoIdRef.current = activeVideoId;
  }, [activeVideoId, isOctoOpen]);

  const shouldAutoOpenOcto = !isDesktop && showEngagementTools && isOctoToolEnabled;
  const shouldShowPlayerHeader = brandLayoutType === "iheart" && !isEndOfFeedReached && !isAdFilled;

  const prevMobileVideoIdRef = useRef<string | null>(null);
  const octoReopenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pendingOctoReopen, setPendingOctoReopen] = useState(false);

  useEffect(() => {
    if (isDesktop) {
      prevMobileVideoIdRef.current = activeVideoId ?? null;
      return;
    }

    if (!shouldAutoOpenOcto) {
      prevMobileVideoIdRef.current = activeVideoId ?? null;
      return;
    }

    const prevId = prevMobileVideoIdRef.current;
    prevMobileVideoIdRef.current = activeVideoId ?? null;

    if (!activeVideoId) {
      return;
    }

    if (!prevId) {
      setPendingOctoReopen(true);
      return;
    }

    if (prevId !== activeVideoId) {
      if (octoReopenTimerRef.current) {
        clearTimeout(octoReopenTimerRef.current);
        octoReopenTimerRef.current = null;
      }

      if (hasContentType("octo")) {
        closeContentType("octo");
      }

      octoReopenTimerRef.current = setTimeout(() => {
        setPendingOctoReopen(true);
        octoReopenTimerRef.current = null;
      }, 400);
    }
  }, [activeVideoId, isDesktop, shouldAutoOpenOcto, hasContentType, closeContentType]);

  useEffect(
    () => () => {
      if (octoReopenTimerRef.current) {
        clearTimeout(octoReopenTimerRef.current);
        octoReopenTimerRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    if (
      !shouldAutoOpenOcto ||
      !showExpandView ||
      !activeVideoId ||
      isAdFilled ||
      !pendingOctoReopen ||
      hasContentType("octo")
    ) {
      return;
    }

    openContentType("octo", "inside", "default");
    setContentTypeState("octo", "default");
    setPendingOctoReopen(false);
  }, [
    shouldAutoOpenOcto,
    showExpandView,
    activeVideoId,
    hasContentType,
    openContentType,
    setContentTypeState,
    isAdFilled,
    pendingOctoReopen,
  ]);

  useEffect(() => {
    const currentPost = filteredPost[activeIndex];
    if (!currentPost?.video) return;

    // Skip while an ad is showing — touching linkout state would close it (no
    // auto-reopen) or leak it under the ad. Re-evaluated via the `isAdFilled` dep.
    if (isAdFilled) return;

    // Match `<Linkouts>`' own render gate: a `linkoutId` OR inline
    // `video.linkouts` both count. Gating on `linkoutId` alone closes
    // inline-only videos and leaves sibling tiles with no sheet underneath.
    const linkoutsList = currentPost?.video.linkouts;
    const hasLinkoutId = currentPost?.video.linkoutId !== null && currentPost?.video.linkoutId !== undefined;
    const hasInlineLinkouts =
      Array.isArray(linkoutsList) && linkoutsList.length > 0 && linkoutsList[0]?.links?.length > 0;
    const hasLinkout = hasLinkoutId || hasInlineLinkouts;
    if (hasLinkout) {
      // "outside" (desktop right rail) only EXISTS for V2 — <DesktopRightPanels> is
      // gated on `isDesignSystemV2Linkouts`. The only host for V1 is the in-player overlay,
      // whose gate requires placement !== "outside". So restrict "outside" to V2;
      // V1 keeps "inside" on desktop too. Otherwise the V1 linkout flips to "outside"
      // with no renderer and disappears whenever the desktop comments panel is shown.
      // Idempotent, so re-firing on `isAdFilled → false` safely reopens after an ad.
      openContentType("linkouts", isDesktop && isDesignSystemV2Linkouts ? "outside" : "inside", "expand-view");
    } else {
      closeContentType("linkouts");
    }
    // `showExpandView` dep re-fires on collapse: adjacent sheets' `resetSheet()`
    // wipes all active content types, so re-open restores the linkout entry.
  }, [
    showExpandView,
    activeIndex,
    filteredPost,
    openContentType,
    closeContentType,
    isDesktop,
    isDesignSystemV2Linkouts,
    isAdFilled,
  ]);

  // Effect to navigate to selected section when it changes (only for sectioned mode)
  useEffect(() => {
    if (isSectioned && horizontalSwiper && selectedSection && sectionList) {
      const selectedSectionIndex = sectionList.findIndex((section: any) => section.id === selectedSection.id);
      if (selectedSectionIndex !== -1 && selectedSectionIndex !== horizontalSwiper.activeIndex) {
        horizontalSwiper.slideTo(selectedSectionIndex);
      }
    }
  }, [isSectioned, horizontalSwiper, selectedSection, sectionList]);

  // Effect to navigate swiper when activeIndex changes programmatically (e.g., from child SDK)
  useEffect(() => {
    if (!embedDetails || !activeSwiper) return;

    const handleContextActiveIndexChange = (event: any, context: any) => {
      const newIndex = context.activeIndex;

      // Guard: skip if this swiper has been destroyed (stale reference)
      if (activeSwiper.destroyed) return;

      // Only navigate if the index actually changed and swiper is not already at that index
      if (activeSwiper.activeIndex !== newIndex && newIndex >= 0) {
        activeSwiper.slideTo(newIndex, 300); // Navigate with animation
      }
    };

    embedDetails.embedEventBus.on("activeIndexChange", handleContextActiveIndexChange);

    return () => {
      embedDetails.embedEventBus.off("activeIndexChange", handleContextActiveIndexChange);
    };
  }, [embedDetails, activeSwiper]);

  // Handler for section tab click
  const handleSectionSelect = (section: any) => {
    if (embedDetails) {
      embedDetails.updateSelectedSection(section);
    }
  };

  return (
    <div
      ref={playerListRef}
      className={cn(
        "gencl:h-full gencl:w-full gencl:flex gencl:justify-center",
        // brandLayoutType === "iheart" && isDesktop && "gencl:sm:py-8!",
        // brandLayoutType === "iheart" && isTablet && websiteType === "polaris" && "gencl:sm:pt-8!",
        brandLayoutType === "iheart" &&
          websiteType === "legacy" &&
          isAdsEnabledInIheart &&
          "gencl:pt-[72px]! gencl:md:pt-8!",
        brandLayoutType !== "iheart" && "gencl:gap-6"
      )}>
      {/* Back button for iheart expand view (not on mobile) */}
      {brandLayoutType === "iheart" && !isMobile && (
        <SafeSuspense fallback={<PositionedLoader className="gencl:absolute gencl:left-8 gencl:z-50 gencl:size-10" />}>
          <IHeartBackButton
            websiteType={websiteType}
            isAdsEnabledInIheart={isAdsEnabledInIheart}
            onBackClick={changeExpandViewType}
            theme={theme}
          />
        </SafeSuspense>
      )}
      <div
        className={cn(
          "gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:sm:w-fit! gencl:relative",
          brandLayoutType !== "iheart" && "gencl:gap-6"
        )}>
        <div
          ref={containerRef}
          className={cn("gencl:h-full gencl:aspect-reel gencl:relative", isMobile && "gencl:h-full gencl:w-full")}
          style={
            // Only pin an explicit width when we actually measured one (iheart-tablet).
            // When slideDimensions is the empty sentinel {} (non-measured / reset after a
            // tablet→desktop transition), emit no inline width so the aspect-reel CSS
            // governs — writing `${undefined}px` would be an invalid value the browser
            // ignores, silently leaving a stale width in place.
            slideDimensions?.slideWidth
              ? {
                  width: `${slideDimensions.slideWidth}px`,
                }
              : undefined
          }
          // role="region"
          // aria-label="Video player"
        >
          {/* Header with back button and centered title */}
          {shouldShowPlayerHeader && (
            <SafeSuspense
              fallback={
                <PositionedLoader className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:z-20 gencl:p-4" />
              }>
              <PlayerHeader
                isMobile={isMobile}
                title={filteredPost[activeIndex]?.video?.attributes?.title ?? ""}
                onBackClick={changeExpandViewType}
                showTitle={!(isSectioned && (sectionList?.length ?? 0) > 0)}
              />
            </SafeSuspense>
          )}

          {isSectioned && (
            <SafeSuspense
              fallback={
                <PositionedLoader className="gencl:absolute gencl:top-0 gencl:left-0 gencl:right-0 gencl:z-50 gencl:p-4" />
              }>
              <SectionsTabs
                onSectionSelect={handleSectionSelect}
                // Clear the back button with left PADDING, not a positional `left-10`
                // offset. The tablist is `absolute w-full`; shifting it right kept its
                // width at 100% and pushed the right ~48px (and the last tabs) off-screen
                // past the viewport edge, so the full list could never be scrolled into
                // view. Padding keeps the strip in-bounds and scrolls with the content
                // while starting the first tab clear of the back button (right edge ~44px).
                leadingInset={shouldShowPlayerHeader && isMobile ? 56 : undefined}
              />
            </SafeSuspense>
          )}
          {/* While slideDimensions is being measured (iheart-tablet only — every
              other layout is seeded synchronously), show the player shimmer instead
              of nothing, so the reel area never renders empty/black for that frame
              (or longer on a slow host page). */}
          {!slideDimensions && playerChunkFallback}
          {slideDimensions && (
            <div className="gencl:h-full gencl:w-full">
              {isSectioned ? (
                // Fallback fills the parent (h-full w-full) so it matches the
                // fixed slideDimensions geometry — no aspect re-derivation, no
                // size flash when the real player chunk swaps in.
                <SafeSuspense fallback={playerChunkFallback}>
                  <SectionedContent
                    playerFallback={playerChunkFallback}
                    sectionList={sectionList ?? []}
                    embedDetails={embedDetails}
                    filteredPost={filteredPost}
                    startIndex={startIndex}
                    slideDimensions={slideDimensions}
                    disableSwiper={disableSwiper || isAdFilled}
                    websiteType={websiteType}
                    onActiveIndexChange={handleActiveIndexChange}
                    setEndOfFeedReached={setEndOfFeedReached}
                    isEndOfFeedReached={isEndOfFeedReached}
                    onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                    onGroupJoinStatusChange={onGroupJoinStatusChange}
                    onGroupSubscriptionChange={onGroupSubscriptionChange}
                    onReactionStateChange={onReactionStateChange}
                    onCommentCountChange={onCommentCountChange}
                    totalVideos={totalVideos}
                    isSectioned={isSectioned}
                    isMobile={isMobile}
                    setHorizontalSwiper={setHorizontalSwiper}
                    setActiveHorizontalIndex={setActiveHorizontalIndex}
                    setVerticalSwipers={setVerticalSwipers}
                    onAdFilled={onAdFilled}
                    onAdPlaybackEnd={onAdPlaybackEnd}
                    pageSession={pageSession}
                  />
                </SafeSuspense>
              ) : (
                <SafeSuspense fallback={playerChunkFallback}>
                  <NonSectionedContent
                    playerFallback={playerChunkFallback}
                    startIndex={startIndex}
                    slideDimensions={slideDimensions}
                    disableSwiper={disableSwiper || isAdFilled}
                    websiteType={websiteType}
                    setVerticalSwipers={setVerticalSwipers}
                    onActiveIndexChange={handleActiveIndexChange}
                    brandLayoutType={brandLayoutType}
                    isDesktop={isDesktop}
                    setEndOfFeedReached={setEndOfFeedReached}
                    isEndOfFeedReached={isEndOfFeedReached}
                    filteredPost={filteredPost}
                    onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                    onGroupJoinStatusChange={onGroupJoinStatusChange}
                    onGroupSubscriptionChange={onGroupSubscriptionChange}
                    onReactionStateChange={onReactionStateChange}
                    onCommentCountChange={onCommentCountChange}
                    totalVideos={totalVideos}
                    isSectioned={isSectioned}
                    onAdFilled={onAdFilled}
                    onAdPlaybackEnd={onAdPlaybackEnd ?? (() => {})}
                    pageSession={pageSession}
                  />
                </SafeSuspense>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons for iheart expand view positioned relative to player */}
        {showExpandView && brandLayoutType === "iheart" && isDesktop && !disableSwiper && (
          <SafeSuspense fallback={<PositionedLoader size="lg" className="gencl:relative gencl:pl-10" />}>
            <NavigationButton
              swiper={activeSwiper ?? undefined}
              postsLength={filteredPost.length}
              position="relative"
              className={cn("gencl:pl-10 gencl:justify-center")}
              theme={theme}
              size={websiteType === "polaris" ? "lg" : "xl"}
              disable={isAdFilled}
              isIheartLayout
            />
          </SafeSuspense>
        )}
      </div>
      {showExpandView && isDesktop && (
        <SafeSuspense
          fallback={<PositionedLoader className="gencl:absolute gencl:right-7.5 gencl:top-6 gencl:size-10" />}>
          <CloseButton theme={theme} onCloseClick={toggleExpandView} />
        </SafeSuspense>
      )}
      {/* Navigation buttons for expand view (not on mobile) */}
      {showExpandView && brandLayoutType !== "iheart" && !isMobile && (
        <SafeSuspense
          fallback={
            <PositionedLoader
              size="lg"
              className="gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2 gencl:size-12"
            />
          }>
          <NavigationButton
            swiper={activeSwiper ?? undefined}
            postsLength={filteredPost.length}
            theme={theme}
            size={websiteType === "polaris" ? "lg" : "xl"}
            disable={isAdFilled}
          />
        </SafeSuspense>
      )}
      {!isMobile && brandLayoutType !== "iheart" && filteredPost[activeIndex] && !isAdFilled && (
        <SafeSuspense fallback={<ActionButtonsSkeleton colors={skeletonColors} />}>
          <Actions
            shareUrl={filteredPost[activeIndex]?.video?.shareUrl ?? ""}
            isReacted={filteredPost[activeIndex]?.video?.isSparked ?? false}
            contentId={filteredPost[activeIndex]?.video?.id ?? ""}
            groupSlug={filteredPost[activeIndex]?.group?.slug ?? ""}
            slug={filteredPost[activeIndex]?.video?.slug ?? ""}
            videoType={filteredPost[activeIndex]?.video?.videoType ?? VideoTypes.Content}
            reactionCount={filteredPost[activeIndex]?.video?.sparkCount ?? 0}
            theme={showExpandView ? "dark" : "light"}
            className={cn("gencl:shrink-0", showExpandView ? "gencl:pb-4" : "gencl:pb-7")}
            isCommentBoxOpen={isCommentOpen}
            // V2 only: action-rail linkout button is the entry point to the
            // right-rail panel (Figma). V1 keeps its legacy in-player overlay.
            showLinkout={Boolean(
              isDesignSystemV2Linkouts &&
                showExpandView &&
                filteredPost[activeIndex]?.video?.linkouts &&
                filteredPost[activeIndex]?.video?.linkouts.length > 0
            )}
            linkoutThumbnail={filteredPost[activeIndex]?.video?.linkouts?.[0]?.links?.[0]?.image ?? null}
            isLinkoutsOpen={hasContentType("linkouts")}
            // Sparkle action: expanded desktop view only — the right rail hosts the panel.
            showIntelligence={showExpandView && isDesktop}
            isIntelligenceOpen={isIntelligenceOpen}
            actionWrapper={{
              INTELLIGENCE: (defaultNode) => (
                <span
                  key={"intelligence-panel-" + filteredPost[activeIndex]?.video?.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextState = !isIntelligenceOpen;
                    if (nextState) {
                      // One right-rail panel at a time (matches comments ⇄ OCTO).
                      if (isCommentOpen) setCommentOpen(false);
                      if (isOctoOpen) setOctoOpen(false);
                    }
                    setIntelligenceOpen(nextState);
                  }}>
                  {defaultNode}
                </span>
              ),
              LINKOUT: (defaultNode) => (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    const isOpen = hasContentType("linkouts");
                    if (isOpen) {
                      closeContentType("linkouts");
                    } else {
                      // Match auto-open placement: "outside" on desktop (right rail),
                      // "inside" on narrower widths where only the in-player overlay hosts it.
                      openContentType("linkouts", isDesktop ? "outside" : "inside", "expand-view");
                    }
                  }}>
                  {defaultNode}
                </span>
              ),
              COMMENT: (defaultNode) => {
                if (!showCommentBox) return;
                //
                const defaultOpen =
                  embedDetails?.embedData.autoUserInteractionToPerform === "comment" &&
                  filteredPost[activeIndex]?.video?.slug === embedDetails.embedData?.startVideoSlug &&
                  !embedDetails.embedEventBus.getContext().autoInteractionActionDone;

                //     if (defaultOpen) {
                //       embedDetails.markAutoInteractionActionDone();
                //     }

                // Simple ui to show for comment trigger
                function CommentBox({ children }: { children: React.ReactNode }) {
                  const commentCount = filteredPost[activeIndex]?.video?.commentCount ?? 0;
                  return (
                    <>
                      {children}
                      <p
                        className={cn(
                          "gencl:p-0 gencl:text-center gencl:text-black gencl:text-body-2-medium",
                          showExpandView && "gencl:text-white!"
                        )}
                        aria-label={`${commentCount} ${commentCount === 1 ? "comment" : "comments"}`}>
                        {abbreviateNumber(commentCount)}
                      </p>
                    </>
                  );
                }

                if (!isDesktop && filteredPost[activeIndex] && (isCommentOpen || defaultOpen))
                  return (
                    <SafeSuspense
                      fallback={<PositionedLoader size="md" className="gencl:fixed gencl:inset-0 gencl:z-50" />}>
                      <CommentsDialog
                        commentCount={filteredPost[activeIndex]?.video?.commentCount ?? 0}
                        communityId={filteredPost[activeIndex]?.community?.id ?? ""}
                        loopId={filteredPost[activeIndex]?.group?.id ?? ""}
                        videoId={filteredPost[activeIndex]?.video?.id ?? ""}
                        videoSlug={filteredPost[activeIndex]?.video?.slug ?? ""}
                        shareUrl={filteredPost[activeIndex]?.video?.shareUrl ?? ""}
                        videoType={filteredPost[activeIndex]?.video?.videoType ?? VideoTypes.Content}
                        defaultOpen={isCommentOpen}
                        key={"feed-comment-box" + filteredPost[activeIndex]?.video?.id}
                        onCommentCountChange={onCommentCountChange}
                        onOpenChange={(open) => {
                          setCommentOpen(open);
                        }}>
                        <CommentBox>{defaultNode}</CommentBox>
                      </CommentsDialog>
                    </SafeSuspense>
                  );
                return (
                  <span
                    key={"feed-comment-box" + filteredPost[activeIndex]?.video?.id}
                    onClick={() => {
                      if (showExpandView) {
                        // Close OCTO / Intelligence if open
                        if (isOctoOpen) setOctoOpen(false);
                        if (!isCommentOpen && isIntelligenceOpen) setIntelligenceOpen(false);
                        // Toggle comments
                        toggleComment();
                      }
                    }}>
                    <CommentBox>{defaultNode}</CommentBox>
                  </span>
                );
              },
              OCTO: (defaultNode) => {
                if (!showExpandView) return defaultNode;

                return (
                  <span
                    key={"octo-panel-" + filteredPost[activeIndex]?.video?.id}
                    onClick={(event) => {
                      event.stopPropagation();

                      const sheetActive = sheetState === "panel-view" || sheetState === "full-view";

                      if (!isDesktop) {
                        if (!sheetActive && isCommentOpen) {
                          setCommentOpen(false);
                        }
                        openContentType("octo", "inside", "default");
                        setContentTypeState("octo", "default");
                        return;
                      }

                      const nextState = !isOctoOpen;
                      if (nextState && isCommentOpen) {
                        setCommentOpen(false);
                      }
                      if (nextState && isIntelligenceOpen) {
                        setIntelligenceOpen(false);
                      }
                      setOctoOpen(nextState);
                    }}>
                    {defaultNode}
                  </span>
                );
              },
            }}
            onReactionStateChange={(isReacted: boolean) => {
              onReactionStateChange?.(
                filteredPost[activeIndex]?.video?.id ?? "",
                filteredPost[activeIndex]?.video?.slug ?? "",
                isReacted
              );
            }}
          />
        </SafeSuspense>
      )}
      {/* V1 keeps its standalone comments column here; V2 hosts comments inside
          <DesktopRightPanels> below. Rendering both would double the comments. */}
      {!isDesignSystemV2Linkouts &&
        isCommentOpen &&
        showExpandView &&
        !isAdFilled &&
        showCommentBox &&
        filteredPost[activeIndex] &&
        brandLayoutType !== "iheart" &&
        isDesktop && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
            <SafeSuspense
              fallback={<SidePanelSkeleton theme={theme === "light" ? "light" : "dark"} showPostDetails={false} />}>
              <Comments
                videoId={filteredPost[activeIndex].video?.id ?? ""}
                loopId={filteredPost[activeIndex].group?.id ?? ""}
                communityId={filteredPost[activeIndex].community?.id ?? ""}
                videoSlug={filteredPost[activeIndex].video?.slug ?? ""}
                videoType={filteredPost[activeIndex].video?.videoType ?? VideoTypes.Content}
                className="gencl:h-full"
                showCloseButton={isCommentOpen}
                onClose={toggleComment}
                onCommentCountChange={onCommentCountChange}
                shareUrl={filteredPost[activeIndex].video?.shareUrl ?? ""}
              />
            </SafeSuspense>
          </div>
        )}

      {isOctoOpen &&
        showExpandView &&
        !isAdFilled &&
        showCommentBox &&
        filteredPost[activeIndex] &&
        brandLayoutType !== "iheart" &&
        isDesktop && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
            <SafeSuspense errorFallback={null} fallback={null}>
              <OctoPanel
                ref={octoPanelRef}
                videoId={filteredPost[activeIndex].video?.id || ""}
                videoSlug={filteredPost[activeIndex].video?.slug}
                open={isOctoOpen}
                onOpenChange={(open) => {
                  if (!open) setOctoOpen(false);
                }}
                onClose={() => setOctoOpen(false)}
                panelClassName="gencl:h-full"
              />
            </SafeSuspense>
          </div>
        )}

      {/* Intelligence chat: opened from the rail's sparkle action. Keyed by video so
          the thread resets when the active video changes. */}
      {isIntelligenceOpen &&
        showExpandView &&
        !isAdFilled &&
        filteredPost[activeIndex] &&
        brandLayoutType !== "iheart" &&
        isDesktop && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
            <SafeSuspense
              errorFallback={null}
              fallback={<SidePanelSkeleton theme={theme === "light" ? "light" : "dark"} showPostDetails={false} />}>
              <IntelligenceChatSidePanel
                key={"intelligence-chat-" + (filteredPost[activeIndex].video?.id ?? "")}
                videoId={filteredPost[activeIndex].video?.id ?? ""}
                onClose={() => setIntelligenceOpen(false)}
                className="gencl:h-full"
              />
            </SafeSuspense>
          </div>
        )}

      {/* Desktop right rail: dynamic linkouts (outside placement) above comments.
          V2 only — v1 keeps its legacy in-player overlay to avoid doubling up. */}
      {isDesktop && isDesignSystemV2Linkouts && (
        <SafeSuspense fallback={null}>
          <DesktopRightPanels
            filteredPost={filteredPost}
            activeIndex={activeIndex}
            totalVideos={totalVideos}
            brandLayoutType={brandLayoutType}
            isLinkoutsPanelVisible={Boolean(
              sheetContentPlacements["linkouts"] === "outside" &&
                showExpandView &&
                filteredPost[activeIndex] &&
                !isAdFilled
            )}
            isCommentsPanelVisible={Boolean(
              isCommentOpen &&
                showExpandView &&
                showCommentBox &&
                !isAdFilled &&
                filteredPost[activeIndex] &&
                brandLayoutType !== "iheart"
            )}
            onCommentCountChange={onCommentCountChange}
            handleSwiperToggle={handleSwiperToggle}
            onCommentClose={() => {
              closeContentType("comments");
              setCommentOpen(false);
              // Don't promote the linkout to "full-view" here: CSS already gives the
              // panel `h-full` when comments hide, and EmbedTile's promote effect
              // would observe "full-view" and swap the expanded video out.
            }}
          />
        </SafeSuspense>
      )}
    </div>
  );
}
