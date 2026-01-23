"use client";
import "swiper/css";
import { useBoolean } from "usehooks-ts";
import type { Swiper } from "swiper/types";

import { useFeedContext } from "@genuin/components/templates/feed/context";
import { Player } from "./player";

const Actions = lazy(() =>
  import("../../molecules/actions/index.js").then((m) => ({
    default: m.Actions,
  }))
);
// Using any for now to stop the bleed, will refine if possible

// Lazy load heavy comment components to split vendor-forms chunk
const Comments = lazy(() =>
  import("../../molecules/comments/comments.js").then((m) => ({
    default: m.Comments,
  }))
);
const CommentsDialog = lazy(() =>
  import("../../molecules/comments/comments-dialog.js").then((m) => ({
    default: m.CommentsDialog,
  }))
);

const SectionedContent = lazy(() =>
  import("./sectioned-content.js").then((m) => ({
    default: m.SectionedContent,
  }))
);

const NonSectionedContent = lazy(() =>
  import("./non-sectioned-content.js").then((m) => ({
    default: m.NonSectionedContent,
  }))
);

import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import {
  ComponentProps,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { type PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

import { useAnalytics } from "@genuin/components/context";
import { calculateSlideDimensions } from "./utils";

import { useFocusManagement } from "@genuin/components/hooks/use-focus-management";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

const CloseButton = lazy(() =>
  import("./player-swiper-buttons.js").then((m) => ({ default: m.CloseButton }))
);
const NavigationButton = lazy(() =>
  import("./player-swiper-buttons.js").then((m) => ({
    default: m.NavigationButton,
  }))
);

const PlayerHeader = lazy(() =>
  import("./player-header.js").then((m) => ({ default: m.PlayerHeader }))
);

const IHeartBackButton = lazy(() =>
  import("./iheart/iheart-back-button.js").then((m) => ({
    default: m.IHeartBackButton,
  }))
);

const SectionsTabs = lazy(() =>
  import("./sections-tabs.js").then((m) => ({ default: m.SectionsTabs }))
);

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
  onReactionStateChange?: (
    videoId: string,
    videoSlug: string,
    isReacted: boolean
  ) => void;
  onCommunityJoinStatusChange: ComponentProps<
    typeof Player
  >["onCommunityJoinStatusChange"];
  onGroupJoinStatusChange: ComponentProps<
    typeof Player
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange: ComponentProps<
    typeof Player
  >["onGroupSubscriptionChange"];
  /**
   * @param videoId - The video id
   * @param increment - true to increment, false to decrement
   */
  onCommentCountChange?: ComponentProps<typeof Player>["onCommentCountChange"];
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
}: PlayerListPropsType) {
  const { showExpandView, activeIndex, toggleExpandView } = useFeedContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const { isIpad } = useDeviceDetection();
  const { value, toggle, setValue } = useBoolean(isDesktop && !isIpad);
  const { track, EventName } = useAnalytics();
  const {
    engagement: {
      engagementTools: { comment: showCommentBox },
    },
    view: { brandLayoutType, websiteType, isAdsEnabledInIheart },
  } = useEmbedConfigs();
  const embedDetails = useSafeEmbedContext();
  const [isEndOfFeedReached, setEndOfFeedReached] = useState<boolean>(false);
  // if we use directly isTablet from the hook then for desktop it will be true based on useDeviceDetectMediaQuery implementation
  const isTablet = !isMobile && !isDesktop;

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
    const overlayIndex = posts.findIndex(
      (post) => post.video.type === "overlay"
    );
    const isNotAtEndOfFeed = posts[activeIndex + 1]?.video.type !== "complete";
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
  const selectedSection =
    embedDetails?.embedEventBus.getContext().selectedSection;

  // Swiper state management
  const [horizontalSwiper, setHorizontalSwiper] = useState<Swiper | null>(null);
  const [verticalSwipers, setVerticalSwipers] = useState<
    Record<number, Swiper>
  >({});
  const [activeHorizontalIndex, setActiveHorizontalIndex] = useState(0);

  // Get the active swiper for navigation buttons
  const activeSwiper = isSectioned
    ? verticalSwipers[activeHorizontalIndex]
    : verticalSwipers[0];

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

  /*
We need to filter out these posts because we shouldn't show the overlay middleware
or the full-screen view here, and we cannot simply skip the slide since we're using
a swiper inside another swiper.
*/
  const filteredPost = useMemo(() => {
    return posts.filter((post) => post.video.type !== "overlay");
  }, [posts]);

  // Focus management hook (only for iHeart)
  const {
    containerRef: playerListRef,
    focusableElements,
    currentFocusIndex,
    updateFocusableElements,
    setSlideNavigationDirection,
  } = useFocusManagement({
    isEnabled: showExpandView && brandLayoutType === "iheart",
    activeIndex,
    activeSwiper,
  });

  // Effect to navigate to selected section when it changes (only for sectioned mode)
  useEffect(() => {
    if (isSectioned && horizontalSwiper && selectedSection && sectionList) {
      const selectedSectionIndex = sectionList.findIndex(
        (section: any) => section.id === selectedSection.id
      );
      if (
        selectedSectionIndex !== -1 &&
        selectedSectionIndex !== horizontalSwiper.activeIndex
      ) {
        horizontalSwiper.slideTo(selectedSectionIndex);
      }
    }
  }, [isSectioned, horizontalSwiper, selectedSection, sectionList]);

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
        brandLayoutType === "iheart" && isDesktop && "gencl:sm:py-8!",
        brandLayoutType === "iheart" &&
          isTablet &&
          websiteType === "polaris" &&
          "gencl:sm:pt-8!",
        brandLayoutType === "iheart" &&
          websiteType === "legacy" &&
          isAdsEnabledInIheart &&
          "gencl:pt-[72px]! gencl:md:pt-8!",
        brandLayoutType !== "iheart" && "gencl:gap-6"
      )}
    >
      {/* Back button for iheart expand view (not on mobile) */}
      {(brandLayoutType === "iheart" || isMobile) && (
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
        )}
      >
        <div
          ref={containerRef}
          className={cn(
            "gencl:h-full gencl:aspect-reel gencl:relative",
            isMobile && "gencl:h-full gencl:w-full"
          )}
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
          {brandLayoutType === "iheart" && !isEndOfFeedReached && (
            <Suspense fallback={null}>
              <PlayerHeader
                isMobile={isMobile}
                title={filteredPost[activeIndex]?.video.attributes?.title ?? ""}
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
                    sectionList={sectionList}
                    embedDetails={embedDetails}
                    filteredPost={filteredPost}
                    startIndex={startIndex}
                    slideDimensions={slideDimensions}
                    disableSwiper={disableSwiper}
                    websiteType={websiteType}
                    onActiveIndexChange={onActiveIndexChange}
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
                  />
                </Suspense>
              ) : (
                <Suspense fallback={null}>
                  <NonSectionedContent
                    startIndex={startIndex}
                    slideDimensions={slideDimensions}
                    disableSwiper={disableSwiper}
                    websiteType={websiteType}
                    setVerticalSwipers={setVerticalSwipers}
                    onActiveIndexChange={onActiveIndexChange}
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
                  />
                </Suspense>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons for iheart expand view positioned relative to player */}
        {showExpandView &&
          brandLayoutType === "iheart" &&
          isDesktop &&
          !disableSwiper && (
            <Suspense fallback={null}>
              <NavigationButton
                swiper={activeSwiper ?? undefined}
                postsLength={filteredPost.length}
                position="relative"
                className={cn("gencl:pl-10 gencl:justify-center")}
                theme={theme}
                size={websiteType === "polaris" ? "lg" : "xl"}
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
          />
        </Suspense>
      )}
      {!isMobile &&
        brandLayoutType !== "iheart" &&
        filteredPost[activeIndex] && (
          <Suspense fallback={null}>
            <Actions
              shareUrl={filteredPost[activeIndex]?.video.shareUrl ?? ""}
              isReacted={filteredPost[activeIndex]?.video.isSparked ?? false}
              contentId={filteredPost[activeIndex]?.video.id}
              groupSlug={filteredPost[activeIndex]?.group.slug}
              slug={filteredPost[activeIndex]?.video.slug}
              reactionCount={filteredPost[activeIndex]?.video.sparkCount}
              theme={showExpandView ? "dark" : "light"}
              className={cn(
                "gencl:shrink-0",
                showExpandView ? "gencl:pb-4" : "gencl:pb-7"
              )}
              isCommentBoxOpen={value}
              actionWrapper={{
                COMMENT: (defaultNode) => {
                  if (!showCommentBox) return;
                  //
                  const defaultOpen =
                    (embedDetails?.embedData?.autoUserInteractionToPerform ===
                      "comment-spark" ||
                      embedDetails?.embedData.autoUserInteractionToPerform ===
                        "comment") &&
                    filteredPost[activeIndex]?.video.slug ===
                      embedDetails.embedData?.startVideoSlug &&
                    !embedDetails.embedEventBus.getContext()
                      .autoInteractionActionDone;

                  if (defaultOpen) {
                    embedDetails.markAutoInteractionActionDone();
                  }

                  // Simple ui to show for comment trigger
                  function CommentBox({
                    children,
                  }: {
                    children: React.ReactNode;
                  }) {
                    const commentCount =
                      filteredPost[activeIndex]?.video.commentCount ?? 0;
                    return (
                      <>
                        {children}
                        <p
                          className={cn(
                            "gencl:p-0 gencl:text-center gencl:text-black gencl:text-body-2-medium",
                            showExpandView && "gencl:text-white!"
                          )}
                          aria-label={`${commentCount} ${commentCount === 1 ? "comment" : "comments"}`}
                        >
                          {abbreviateNumber(commentCount)}
                        </p>
                      </>
                    );
                  }

                  if (
                    !isDesktop &&
                    filteredPost[activeIndex] &&
                    (value || defaultOpen)
                  )
                    return (
                      <Suspense fallback={null}>
                        <CommentsDialog
                          commentCount={
                            filteredPost[activeIndex]?.video.commentCount
                          }
                          communityId={filteredPost[activeIndex]?.community.id}
                          loopId={filteredPost[activeIndex]?.group.id}
                          videoId={filteredPost[activeIndex]?.video.id}
                          videoSlug={filteredPost[activeIndex]?.video.slug}
                          shareUrl={filteredPost[activeIndex]?.video.shareUrl}
                          defaultOpen={value}
                          key={
                            "feed-comment-box" +
                            filteredPost[activeIndex]?.video.id
                          }
                          onCommentCountChange={onCommentCountChange}
                          onOpenChange={(value) => {
                            setValue(value);
                          }}
                        >
                          <CommentBox>{defaultNode}</CommentBox>
                        </CommentsDialog>
                      </Suspense>
                    );
                  return (
                    <span
                      key={
                        "feed-comment-box" + filteredPost[activeIndex]?.video.id
                      }
                      onClick={() => {
                        if (showExpandView) toggle();
                      }}
                    >
                      <CommentBox>{defaultNode}</CommentBox>
                    </span>
                  );
                },
              }}
              onReactionStateChange={(isReacted) => {
                onReactionStateChange?.(
                  filteredPost[activeIndex]?.video.id ?? "",
                  filteredPost[activeIndex]?.video.slug ?? "",
                  isReacted
                );
              }}
            />
          </Suspense>
        )}
      {/* show this only if expand view is open  */}
      {value &&
        showExpandView &&
        showCommentBox &&
        filteredPost[activeIndex] &&
        brandLayoutType !== "iheart" &&
        isDesktop && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
            <Suspense fallback={null}>
              <Comments
                videoId={filteredPost[activeIndex].video.id}
                loopId={filteredPost[activeIndex].group.id}
                communityId={filteredPost[activeIndex].community?.id}
                videoSlug={filteredPost[activeIndex].video.slug}
                className="gencl:h-full"
                showCloseButton={value}
                onClose={toggle}
                onCommentCountChange={onCommentCountChange}
                shareUrl={filteredPost[activeIndex].video.shareUrl}
              />
            </Suspense>
          </div>
        )}
    </div>
  );
}
