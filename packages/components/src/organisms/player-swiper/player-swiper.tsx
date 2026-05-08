"use client";

import { Loader } from "@genuin/ui/components/loader";
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { useEffect, useState, useRef, useMemo, useCallback, lazy, Suspense } from "react";
import type { Swiper } from "swiper/types";
import { useBoolean } from "usehooks-ts";

import { useAnalytics, VideoTypes } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useFocusManagement } from "@genuin/components/hooks/use-focus-management";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import type { OctoPanelHandle } from "@genuin/components/molecules/octo-panel/octo-panel";
import { type PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";

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
  import("../../molecules/octo-panel/index.js").then((m) => ({
    default: m.OctoPanel,
  }))
);

const SectionedContent = lazy(() =>
  import("./sectioned-content").then((m) => ({
    default: m.SectionedContent,
  }))
);

const NonSectionedContent = lazy(() =>
  import("./non-sectioned-content").then((m) => ({
    default: m.NonSectionedContent,
  }))
);

const SectionsTabs = lazy(() => import("./sections-tabs").then((m) => ({ default: m.SectionsTabs })));

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
}: PlayerListPropsType) {
  const { showExpandView, activeIndex, toggleExpandView } = useFeedContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const { isIpad } = useDeviceDetection();
  const { track, EventName } = useAnalytics();
  const {
    engagement: {
      engagementTools: { comment: showCommentBox, octo: isOctoToolEnabled },
      showEngagementTools,
    },
    view: { brandLayoutType, websiteType, isAdsEnabledInIheart },
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
  const octoPanelRef = useRef<OctoPanelHandle | null>(null);
  const lastOctoVideoIdRef = useRef<string | null>(null);
  const embedDetails = useSafeEmbedContext();
  const { sheetState, openContentType, setContentTypeState, hasContentType, closeContentType, getContentTypeState } =
    useSheetState();
  const [isEndOfFeedReached, setEndOfFeedReached] = useState<boolean>(false);
  // if we use directly isTablet from the hook then for desktop it will be true based on useDeviceDetectMediaQuery implementation
  const isTablet = !isMobile && !isDesktop;
  const [adActiveOn, setAdActiveOn] = useState<number>(-1);
  const isAdFilled = adActiveOn !== -1 && activeIndex === adActiveOn;

  // Container dimensions state
  const containerRef = useRef<HTMLDivElement>(null);
  const [slideDimensions, setSlideDimensions] = useState<{
    slideWidth: number;
    slideHeight: number;
    slidesPerView: number;
  } | null>(null);

  // Calculate slide dimensions on mount and resize (only for iheart brand on specific devices)
  useEffect(() => {
    const shouldCalculateDimensions = brandLayoutType === "iheart" && isTablet;

    if (!shouldCalculateDimensions) {
      // Set dimensions immediately for non-iheart or non-tablet to allow rendering
      setSlideDimensions({} as any);
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
      if (isSectioned && horizontalSwiper) {
        if (disable) {
          horizontalSwiper.disable();
        } else {
          horizontalSwiper.enable();
        }
      }
      // Also disable/enable the active vertical swiper
      if (activeSwiper) {
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

  /*
We need to filter out these posts because we shouldn't show the overlay middleware
or the full-screen view here, and we cannot simply skip the slide since we're using
a swiper inside another swiper.
*/
  const filteredPost = useMemo(() => {
    return posts.filter((post) => post.video?.type !== "overlay");
  }, [posts]);

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

  const handleAdFilled = useCallback((type: string, index: number) => {
    setAdActiveOn(index);
  }, []);

  const handleAdPlaybackEnd = useCallback((index: number) => {
    setAdActiveOn(-1);
  }, []);

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

    const hasLinkout = currentPost?.video.linkoutId !== null && currentPost?.video.linkoutId !== undefined;
    if (hasLinkout) {
      openContentType("linkouts", "outside", "expand-view");
    } else {
      closeContentType("linkouts");
    }
  }, [activeIndex, filteredPost, openContentType, closeContentType]);

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
        <Suspense fallback={null}>
          <IHeartBackButton
            websiteType={websiteType}
            isAdsEnabledInIheart={isAdsEnabledInIheart}
            onBackClick={changeExpandViewType}
            theme={theme}
          />
        </Suspense>
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
            slideDimensions
              ? {
                  width: `${slideDimensions.slideWidth}px`,
                }
              : undefined
          }
          // role="region"
          // aria-label="Video player"
        >
          {/* Header with back button and centered title */}
          {brandLayoutType === "iheart" && !isEndOfFeedReached && !isAdFilled && (
            <Suspense fallback={null}>
              <PlayerHeader
                isMobile={isMobile}
                title={filteredPost[activeIndex]?.video?.attributes?.title ?? ""}
                onBackClick={changeExpandViewType}
              />
            </Suspense>
          )}

          {isSectioned && (
            <Suspense fallback={null}>
              <SectionsTabs onSectionSelect={handleSectionSelect} />
            </Suspense>
          )}
          {slideDimensions && (
            <div className="gencl:h-full gencl:w-full">
              {isSectioned ? (
                <Suspense fallback={null}>
                  <SectionedContent
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
                    onAdFilled={handleAdFilled}
                    onAdPlaybackEnd={handleAdPlaybackEnd}
                    pageSession={pageSession}
                  />
                </Suspense>
              ) : (
                <Suspense fallback={null}>
                  <NonSectionedContent
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
                    onAdFilled={handleAdFilled}
                    onAdPlaybackEnd={handleAdPlaybackEnd}
                    pageSession={pageSession}
                  />
                </Suspense>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons for iheart expand view positioned relative to player */}
        {showExpandView && brandLayoutType === "iheart" && isDesktop && !disableSwiper && (
          <Suspense fallback={null}>
            <NavigationButton
              swiper={activeSwiper ?? undefined}
              postsLength={filteredPost.length}
              position="relative"
              className={cn("gencl:pl-10 gencl:justify-center")}
              theme={theme}
              size={websiteType === "polaris" ? "lg" : "xl"}
              disable={isAdFilled}
            />
          </Suspense>
        )}
      </div>
      {showExpandView && isDesktop && (
        <Suspense fallback={null}>
          <CloseButton theme={theme} onCloseClick={toggleExpandView} />
        </Suspense>
      )}
      {/* Navigation buttons for expand view (not on mobile) */}
      {showExpandView && brandLayoutType !== "iheart" && !isMobile && (
        <Suspense fallback={null}>
          <NavigationButton
            swiper={activeSwiper ?? undefined}
            postsLength={filteredPost.length}
            theme={theme}
            size={websiteType === "polaris" ? "lg" : "xl"}
            disable={isAdFilled}
          />
        </Suspense>
      )}
      {!isMobile && brandLayoutType !== "iheart" && filteredPost[activeIndex] && !isAdFilled && (
        <Suspense fallback={null}>
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
            actionWrapper={{
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
                    <Suspense fallback={null}>
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
                    </Suspense>
                  );
                return (
                  <span
                    key={"feed-comment-box" + filteredPost[activeIndex]?.video?.id}
                    onClick={() => {
                      if (showExpandView) {
                        // Close OCTO if open
                        if (isOctoOpen) setOctoOpen(false);
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
                      setOctoOpen(nextState);
                    }}>
                    {defaultNode}
                  </span>
                );
              },
            }}
            onReactionStateChange={(isReacted) => {
              onReactionStateChange?.(
                filteredPost[activeIndex]?.video?.id ?? "",
                filteredPost[activeIndex]?.video?.slug ?? "",
                isReacted
              );
            }}
          />
        </Suspense>
      )}
      {/* Comment panel - show this only if expand view is open  */}
      {isCommentOpen &&
        showExpandView &&
        !isAdFilled &&
        showCommentBox &&
        filteredPost[activeIndex] &&
        brandLayoutType !== "iheart" &&
        isDesktop && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
            <Suspense fallback={null}>
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
            </Suspense>
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
            <Suspense fallback={null}>
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
            </Suspense>
          </div>
        )}

      {/* COMMENTED THIS AS WE DONT HAVE TO USE DYNAMIC SHEET for 2.0.5  */}
      {/* Right panel container*/}
      {/* {isDesktop && (
        <DesktopRightPanels
          filteredPost={filteredPost}
          activeIndex={activeIndex}
          totalVideos={totalVideos}
          brandLayoutType={brandLayoutType}
          isLinkoutsPanelVisible={
            sheetContentPlacements["linkouts"] === "outside" &&
            showExpandView &&
            filteredPost[activeIndex] &&
            !isAdFilled
          }
          isCommentsPanelVisible={
            hasContentType("comments") &&
            showExpandView &&
            showCommentBox &&
            !isAdFilled &&
            filteredPost[activeIndex] &&
            brandLayoutType !== "iheart"
          }
          onCommentCountChange={onCommentCountChange}
          handleSwiperToggle={handleSwiperToggle}
          onCommentClose={() => {
            closeContentType("comments");
            setValue(false);
            if (sheetContentPlacements["linkouts"] === "outside") {
              setContentTypeState("linkouts", "full-view");
            }
          }}
        />
      )} */}
    </div>
  );
}
