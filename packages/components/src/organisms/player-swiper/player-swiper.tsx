"use client";
import "swiper/css";
import { Button, ButtonProps } from "@genuin/ui/button";
import { SwiperSlide } from "swiper/react";
import { useBoolean } from "usehooks-ts";

import { Actions } from "@genuin/components/molecules/actions";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";

import { Comments, CommentsDialog } from "../../molecules/comments";

import { Player } from "./player";
import { SwiperImplementation } from "./swiper-implementation";
import { SectionsTabs } from "./sections-tabs";
import { ComponentProps, useEffect, useState, useRef } from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
} from "@genuin/ui/icons";
import { Swiper } from "swiper/types";
import { useAnalytics } from "@genuin/components/context";
import { PlayerHeader } from "./player-header";
import { calculateSlideDimensions } from "./utils";
import WatchBoundaryOverlay from "@genuin/components/molecules/feed-player/control-layer/watch-boundary-overlay";
import { useFocusManagement } from "@genuin/components/hooks/use-focus-management";

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
  onReactionStateChange?: (videoId: string, isReacted: boolean) => void;
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
  const { value, toggle, setValue } = useBoolean(isDesktop);
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
      setSlideDimensions(null);
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

  // Focus management hook
  const {
    containerRef: playerListRef,
    focusableElements,
    currentFocusIndex,
    updateFocusableElements,
    setSlideNavigationDirection,
  } = useFocusManagement({
    isEnabled: showExpandView,
    activeIndex,
    activeSwiper,
    onToggleExpandView: toggleExpandView,
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
        <SwiperSlide key={item?.id || sectionIdx}>
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
              {posts.map((post, index) => (
                <SwiperSlide
                  key={post.video.id}
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
                    ) : (
                      <WatchBoundaryOverlay variant="complete" />
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
      {posts.map((post, index) => (
        <SwiperSlide
          key={post.video.id}
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
                  isSectioned={isSectioned}
                  onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                  onGroupJoinStatusChange={onGroupJoinStatusChange}
                  onGroupSubscriptionChange={onGroupSubscriptionChange}
                  onReactionStateChange={onReactionStateChange}
                  onCommentCountChange={onCommentCountChange}
                  index={index}
                />
              ) : (
                <WatchBoundaryOverlay variant="complete" />
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
            onBackClick={toggleExpandView}
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
              title={posts[activeIndex]?.video.attributes?.title ?? ""}
              onBackClick={toggleExpandView}
            />
          )}

          {isSectioned && (
            <SectionsTabs onSectionSelect={handleSectionSelect} />
          )}
          <div className="gencl:h-full gencl:w-full">
            {isSectioned
              ? renderSectionedContent()
              : renderNonSectionedContent()}
          </div>
        </div>

        {/* Navigation buttons for iheart expand view positioned relative to player */}
        {showExpandView &&
          brandLayoutType === "iheart" &&
          isDesktop &&
          !disableSwiper && (
            <NavigationButton
              swiper={activeSwiper ?? undefined}
              postsLength={posts.length}
              position="relative"
              className={cn(
                "gencl:pl-10",
                websiteType === "polaris"
                  ? "gencl:justify-end"
                  : "gencl:justify-center"
              )}
              theme={theme}
              size={websiteType === "polaris" ? "lg" : "xl"}
            />
          )}
      </div>

      {/* Navigation buttons for expand view (not on mobile) */}
      {showExpandView && brandLayoutType !== "iheart" && !isMobile && (
        <NavigationButton
          swiper={activeSwiper ?? undefined}
          postsLength={posts.length}
          theme={theme}
          size={websiteType === "polaris" ? "lg" : "xl"}
        />
      )}

      {!isMobile && brandLayoutType !== "iheart" && posts[activeIndex] && (
        <Actions
          shareUrl={posts[activeIndex]?.video.shareUrl ?? ""}
          isReacted={posts[activeIndex]?.video.isSparked ?? false}
          contentId={posts[activeIndex]?.video.id}
          groupSlug={posts[activeIndex]?.group.slug}
          slug={posts[activeIndex]?.video.slug}
          reactionCount={posts[activeIndex]?.video.sparkCount}
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
                posts[activeIndex]?.video.slug ===
                  embedDetails.embedData?.startVideoSlug &&
                !embedDetails.embedEventBus.getContext()
                  .autoInteractionActionDone;

              if (defaultOpen) {
                embedDetails.markAutoInteractionActionDone();
              }

              // Simple ui to show for comment trigger
              function CommentBox({ children }: { children: React.ReactNode }) {
                const commentCount =
                  posts[activeIndex]?.video.commentCount ?? 0;
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

              if (!isDesktop && posts[activeIndex] && (value || defaultOpen))
                return (
                  <CommentsDialog
                    commentCount={posts[activeIndex]?.video.commentCount}
                    communityId={posts[activeIndex]?.community.id}
                    loopId={posts[activeIndex]?.group.id}
                    videoId={posts[activeIndex]?.video.id}
                    videoSlug={posts[activeIndex]?.video.slug}
                    shareUrl={posts[activeIndex]?.video.shareUrl}
                    defaultOpen={value}
                    key={"feed-comment-box" + posts[activeIndex]?.video.id}
                    onCommentCountChange={onCommentCountChange}
                    onOpenChange={(value) => {
                      setValue(value);
                    }}
                  >
                    <CommentBox>{defaultNode}</CommentBox>
                  </CommentsDialog>
                );
              return (
                <span
                  key={"feed-comment-box" + posts[activeIndex]?.video.id}
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
            const videoId =
              posts[activeIndex]?.video.slug ===
              embedDetails?.embedData.startVideoSlug
                ? posts[activeIndex]?.video.slug
                : posts[activeIndex]?.video.id;
            if (videoId) {
              onReactionStateChange?.(videoId, isReacted);
            }
          }}
        />
      )}

      {/* show this only if expand view is open  */}
      {value &&
        showExpandView &&
        showCommentBox &&
        posts[activeIndex] &&
        brandLayoutType !== "iheart" &&
        isDesktop && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
            <Comments
              videoId={posts[activeIndex].video.id}
              loopId={posts[activeIndex].group.id}
              communityId={posts[activeIndex].community?.id}
              videoSlug={posts[activeIndex].video.slug}
              className="gencl:h-full"
              showCloseButton={value}
              onClose={toggle}
              onCommentCountChange={onCommentCountChange}
              shareUrl={posts[activeIndex].video.shareUrl}
            />
          </div>
        )}
    </div>
  );
}

function NavigationButton({
  swiper,
  postsLength,
  position = "fixed",
  className,
  theme,
  size,
}: {
  swiper?: Swiper;
  postsLength?: number;
  position?: "fixed" | "absolute" | "relative";
  className?: string;
  theme?: "light" | "dark";
  size: ButtonProps["size"];
}) {
  // State to force re-render when swiper state changes
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (swiper && swiper.update) {
      swiper.update();
      forceUpdate({});
    }
  }, [postsLength, swiper]);

  if (!swiper) return null;

  const currentSlide = swiper.activeIndex + 1;
  const totalSlides = postsLength ?? swiper.slides.length;

  return (
    <div
      className={cn(
        "gencl:z-50 gencl:text-white gencl:flex gencl:flex-col gencl:gap-4",
        position === "fixed" &&
          "gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2",
        position === "absolute" &&
          "gencl:absolute gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2",
        position === "relative" && "gencl:relative",
        className
      )}
      role="navigation"
      aria-label="Video navigation"
    >
      <Button
        variant="icon"
        shape="circle"
        size={size}
        theme="custom"
        className={cn(
          theme === "dark"
            ? "gencl:bg-white gencl:hover:bg-white/90 [&_svg]:gencl:stroke-[#27292D]"
            : "gencl:bg-[#D9D9D9] gencl:hover:bg-[#D9D9D9]/90 [&_svg]:gencl:stroke-[#27292D]"
        )}
        disabled={swiper.isBeginning}
        onClick={() => swiper.slidePrev()}
        aria-label={`Previous video (${currentSlide - 1} of ${totalSlides})`}
        aria-disabled={swiper.isBeginning}
        tabIndex={0}
      >
        <ChevronUpIcon
          theme={theme === "light" ? "dark" : "light"}
          size="lg"
          aria-hidden="true"
        />
      </Button>
      <Button
        variant="icon"
        shape="circle"
        size={size}
        theme="custom"
        className={cn(
          theme === "dark"
            ? "gencl:bg-white gencl:hover:bg-white/90 [&_svg]:gencl:stroke-[#27292D]"
            : "gencl:bg-[#D9D9D9] gencl:hover:bg-[#D9D9D9]/90 [&_svg]:gencl:stroke-[#27292D]"
        )}
        disabled={swiper.isEnd}
        onClick={() => swiper.slideNext()}
        aria-label={`Next video (${currentSlide + 1} of ${totalSlides})`}
        aria-disabled={swiper.isEnd}
        tabIndex={0}
      >
        <ChevronDownIcon
          theme={theme === "light" ? "dark" : "light"}
          size="lg"
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}

function BackButton({
  onBackClick,
  theme,
  websiteType,
}: {
  onBackClick?: () => void;
  theme?: "light" | "dark";
  websiteType?: "legacy" | "polaris" | undefined;
}) {
  return (
    <>
      {websiteType === "polaris" && (
        <Button
          variant="icon"
          shape="circle"
          size="lg"
          theme="custom"
          aria-label="Back"
          role="button"
          onClick={onBackClick}
          className={cn(
            "gencl:hidden! gencl:lg:flex!",
            theme === "dark"
              ? "gencl:bg-white gencl:hover:bg-white/90 [&_svg]:gencl:stroke-[#27292D]"
              : "gencl:bg-[#D9D9D9] gencl:hover:bg-[#D9D9D9]/90 [&_svg]:gencl:stroke-[#27292D]"
          )}
        >
          <ArrowLeftIcon
            theme={theme === "dark" ? "light" : "light"}
            size="md"
          />
        </Button>
      )}

      <Button
        id="player-header-back-button"
        variant="icon"
        theme="overlay"
        onClick={(e) => {
          e.stopPropagation();
          onBackClick?.();
        }}
        className={cn(
          "gencl:flex!",
          websiteType === "polaris" && "gencl:lg:hidden!"
        )}
        aria-label="Back"
        role="button"
        tabIndex={0}
      >
        <ChevronLeftIcon
          theme={theme === "dark" ? "dark" : "light"}
          size="lg"
          aria-hidden="true"
        />
      </Button>
    </>
  );
}
