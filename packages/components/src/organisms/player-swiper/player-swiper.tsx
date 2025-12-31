"use client";
import "swiper/css";
import { SwiperSlide } from "swiper/react";
import { useBoolean } from "usehooks-ts";

const Actions = lazy(() =>
  import("@genuin/components/molecules/actions").then((m) => ({
    default: m.Actions,
  }))
);
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";

// Lazy load heavy comment components to split vendor-forms chunk
const Comments = lazy(() =>
  import("../../molecules/comments").then((m) => ({ default: m.Comments }))
);
const CommentsDialog = lazy(() =>
  import("../../molecules/comments").then((m) => ({
    default: m.CommentsDialog,
  }))
);

import { Player } from "./player";
import { SwiperImplementation } from "./swiper-implementation";
import { SectionsTabs } from "./sections-tabs";
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
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

import { Swiper } from "swiper/types";
import { useAnalytics } from "@genuin/components/context";
import { PlayerHeader } from "./player-header";
import { calculateSlideDimensions } from "./utils";
import WatchBoundaryOverlay from "@genuin/components/molecules/feed-player/control-layer/watch-boundary-overlay";
import { useFocusManagement } from "@genuin/components/hooks/use-focus-management";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";
import {
  BackButton,
  CloseButton,
  NavigationButton,
} from "./player-swiper-buttons";

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

  // Render sectioned swiper content
  const renderSectionedContent = () => (
    <SwiperImplementation
      direction="horizontal"
      className={cn(
        "gencl:h-full gencl:aspect-reel",
        isMobile && "gencl:h-full gencl:w-full"
      )}
      onSwiper={setHorizontalSwiper}
      onActiveIndexChange={(swiper) => {
        setActiveHorizontalIndex(swiper.activeIndex);
        if (sectionList) {
          embedDetails?.updateSelectedSection(sectionList[swiper.activeIndex]);
        }
      }}
      disableScroll={disableSwiper}
    >
      {sectionList?.map((item, sectionIdx) => (
        <SwiperSlide key={item?.id || sectionIdx} virtualIndex={sectionIdx}>
          {({ isActive: isHorizontalActive }) => (
            <SwiperImplementation
              className="gencl:h-full"
              initialSlide={startIndex}
              // In the disabled swiper case, we should display only a single clip in the table view.
              slidesPerView={
                slideDimensions?.slidesPerView
                  ? disableSwiper || websiteType === "legacy"
                    ? 1
                    : 1.2
                  : undefined
              }
              spaceBetween={slideDimensions?.slidesPerView ? 16 : undefined}
              onSwiper={(swiper) => {
                setVerticalSwipers((prev) => ({
                  ...prev,
                  [sectionIdx]: swiper,
                }));
              }}
              onActiveIndexChange={(swiper) => {
                onActiveIndexChange?.(swiper.activeIndex);
                // track the event while changing the section by clicking on it
                track(EventName.SECTION_CHANGES, {
                  section_id: item?.id,
                });
              }}
              disableScroll={disableSwiper}
              onReachEnd={() => {
                setEndOfFeedReached(true);
              }}
              onSlideChange={() => {
                if (isEndOfFeedReached) setEndOfFeedReached(false);
              }}
            >
              {filteredPost.map((post, index) => (
                <SwiperSlide
                  key={post.video.id}
                  virtualIndex={index}
                  style={
                    slideDimensions
                      ? {
                          width: `${slideDimensions.slideWidth}px`,
                          height: `${slideDimensions.slideHeight}px`,
                        }
                      : undefined
                  }
                >
                  {({
                    isActive: isVerticalActive,
                    isNext: isVerticalNext,
                    isPrev: isVerticalPrev,
                    isVisible: isVerticalVisible,
                  }) => {
                    // Combine both swiper states to determine true active state
                    const isTrulyActive =
                      isVerticalActive && isHorizontalActive;
                    const isTrulyNext = isVerticalNext && isHorizontalActive;
                    const isTrulyPrev = isVerticalPrev && isHorizontalActive;
                    const isTrulyVisible =
                      isVerticalVisible && isHorizontalActive;

                    return post.video.type === "video" ? (
                      <Player
                        isActive={isTrulyActive}
                        isNext={isTrulyNext}
                        isPrev={isTrulyPrev}
                        isVisible={isTrulyVisible}
                        post={post}
                        isSectioned={isSectioned}
                        onCommunityJoinStatusChange={
                          onCommunityJoinStatusChange
                        }
                        onGroupJoinStatusChange={onGroupJoinStatusChange}
                        onGroupSubscriptionChange={onGroupSubscriptionChange}
                        onReactionStateChange={onReactionStateChange}
                        onCommentCountChange={onCommentCountChange}
                        index={index}
                        totalVideos={totalVideos}
                      />
                    ) : post.video.type === "complete" ? (
                      <WatchBoundaryOverlay
                        videoDetails={post.video}
                        variant="complete"
                      />
                    ) : (
                      <></>
                    );
                  }}
                </SwiperSlide>
              ))}
            </SwiperImplementation>
          )}
        </SwiperSlide>
      ))}
    </SwiperImplementation>
  );

  // Render non-sectioned swiper content
  const renderNonSectionedContent = () => (
    <SwiperImplementation
      initialSlide={startIndex}
      // In the disabled swiper case, we should display only a single clip in the table view.
      slidesPerView={
        slideDimensions?.slidesPerView
          ? disableSwiper || websiteType === "legacy"
            ? 1
            : 1.2
          : undefined
      }
      spaceBetween={slideDimensions?.slidesPerView ? 16 : undefined}
      onSwiper={(swiper) => {
        setVerticalSwipers((prev) => ({
          ...prev,
          [0]: swiper,
        }));
      }}
      onActiveIndexChange={(swiper) => {
        onActiveIndexChange?.(swiper.activeIndex);

        // iHeart desktop layout: Prevent rapid slide changes with 300ms debounce
        // Temporarily disable swiper to ignore additional navigation attempts
        // Button remains visually enabled but swiper interactions are blocked
        if (brandLayoutType === "iheart" && isDesktop) {
          swiper.disable();
          setTimeout(() => {
            swiper.enable();
          }, 300);
        }
      }}
      disableScroll={disableSwiper}
      onReachEnd={() => {
        setEndOfFeedReached(true);
      }}
      onSlideChange={() => {
        if (isEndOfFeedReached) setEndOfFeedReached(false);
      }}
    >
      {filteredPost.map((post, index) => (
        <SwiperSlide
          key={post.video.id}
          virtualIndex={index}
          style={
            slideDimensions
              ? {
                  width: `${slideDimensions.slideWidth}px`,
                  height: `${slideDimensions.slideHeight}px`,
                }
              : undefined
          }
        >
          {({ isActive, isNext, isPrev, isVisible }) => (
            <>
              {post.video.type === "video" ? (
                <Player
                  isActive={isActive}
                  isNext={isNext}
                  isPrev={isPrev}
                  isVisible={isVisible}
                  post={post}
                  totalVideos={totalVideos}
                  isSectioned={isSectioned}
                  onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                  onGroupJoinStatusChange={onGroupJoinStatusChange}
                  onGroupSubscriptionChange={onGroupSubscriptionChange}
                  onReactionStateChange={onReactionStateChange}
                  onCommentCountChange={onCommentCountChange}
                  index={index}
                />
              ) : post.video.type === "complete" ? (
                <WatchBoundaryOverlay
                  videoDetails={post.video}
                  variant="complete"
                />
              ) : (
                <></>
              )}
            </>
          )}
        </SwiperSlide>
      ))}
    </SwiperImplementation>
  );

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
      {brandLayoutType === "iheart" && !isMobile && (
        <div
          className={cn(
            "gencl:absolute gencl:left-8 gencl:z-50",
            websiteType === "legacy" && isAdsEnabledInIheart
              ? "gencl:top-20! gencl:md:top-8!"
              : "gencl:top-8"
          )}
        >
          <BackButton
            websiteType={websiteType}
            onBackClick={changeExpandViewType}
            theme={theme}
          />
        </div>
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
            <PlayerHeader
              isMobile={isMobile}
              title={filteredPost[activeIndex]?.video.attributes?.title ?? ""}
              onBackClick={changeExpandViewType}
            />
          )}

          {isSectioned && (
            <SectionsTabs onSectionSelect={handleSectionSelect} />
          )}
          {slideDimensions && (
            <div className="gencl:h-full gencl:w-full">
              {isSectioned
                ? renderSectionedContent()
                : renderNonSectionedContent()}
            </div>
          )}
        </div>

        {/* Navigation buttons for iheart expand view positioned relative to player */}
        {showExpandView &&
          brandLayoutType === "iheart" &&
          isDesktop &&
          !disableSwiper && (
            <NavigationButton
              swiper={activeSwiper ?? undefined}
              postsLength={filteredPost.length}
              position="relative"
              className={cn("gencl:pl-10 gencl:justify-center")}
              theme={theme}
              size={websiteType === "polaris" ? "lg" : "xl"}
            />
          )}
      </div>

      {showExpandView && isDesktop && (
        <CloseButton theme={theme} onCloseClick={toggleExpandView} />
      )}

      {/* Navigation buttons for expand view (not on mobile) */}
      {showExpandView && brandLayoutType !== "iheart" && !isMobile && (
        <NavigationButton
          swiper={activeSwiper ?? undefined}
          postsLength={filteredPost.length}
          theme={theme}
          size={websiteType === "polaris" ? "lg" : "xl"}
        />
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
