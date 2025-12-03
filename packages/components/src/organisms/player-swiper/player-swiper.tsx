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
import { ComponentProps, useEffect, useState, useRef, useMemo } from "react";
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
              {filteredPost.map((post, index) => (
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
              title={filteredPost[activeIndex]?.video.attributes?.title ?? ""}
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
              postsLength={filteredPost.length}
              position="relative"
              className={cn("gencl:pl-10 gencl:justify-center")}
              theme={theme}
              size={websiteType === "polaris" ? "lg" : "xl"}
            />
          )}
      </div>

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
                        "feed-comment-box" + filteredPost[activeIndex]?.video.id
                      }
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
        )}

      {/* show this only if expand view is open  */}
      {value &&
        showExpandView &&
        showCommentBox &&
        filteredPost[activeIndex] &&
        brandLayoutType !== "iheart" &&
        isDesktop && (
          <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
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
  const [prevHovered, setPrevHovered] = useState(false);
  const [nextHovered, setNextHovered] = useState(false);

  useEffect(() => {
    if (swiper && swiper.update) {
      swiper.update();
      forceUpdate({});
    }
  }, [postsLength, swiper]);

  if (!swiper) return null;

  const currentSlide = swiper.activeIndex + 1;
  const totalSlides = postsLength ?? swiper.slides.length;

  // Define theme colors consistent with navigation-buttons.tsx
  const isDarkTheme = theme === "dark";

  // Dark theme colors
  const darkTheme = {
    disabled: { button: "#3F4447", icon: "#717277" },
    default: { button: "#F6F8F9", icon: "#27292D" },
    hover: { button: "#A9AFB2", icon: "#27292D" },
  };

  // Light theme colors
  const lightTheme = {
    disabled: { button: "#E6EAED", icon: "#A9AFB2" },
    default: { button: "#27292D", icon: "#FFFFFF" },
    hover: { button: "#717277", icon: "#FFFFFF" },
  };

  const colors = isDarkTheme ? darkTheme : lightTheme;

  // Helper function to get button styles
  const getButtonStyles = (disabled: boolean, isHovered: boolean) => {
    const buttonBg = disabled
      ? colors.disabled.button
      : isHovered
        ? colors.hover.button
        : colors.default.button;

    const iconFill = disabled
      ? colors.disabled.icon
      : isHovered
        ? colors.hover.icon
        : colors.default.icon;

    return { buttonBg, iconFill };
  };

  const prevStyles = getButtonStyles(swiper.isBeginning, prevHovered);
  const nextStyles = getButtonStyles(swiper.isEnd, nextHovered);

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
      <div
        onMouseEnter={() => !swiper.isBeginning && setPrevHovered(true)}
        onMouseLeave={() => setPrevHovered(false)}
      >
        <Button
          variant="icon"
          shape="circle"
          size={size}
          theme="custom"
          className={cn(
            "gencl:transition-all gencl:duration-200",
            swiper.isBeginning && "gencl:cursor-not-allowed!"
          )}
          style={{
            background: prevStyles.buttonBg,
          }}
          disabled={swiper.isBeginning}
          onClick={() => {
            setPrevHovered(false);
            swiper.slidePrev();
          }}
          aria-label={`Previous video (${currentSlide - 1} of ${totalSlides})`}
          aria-disabled={swiper.isBeginning}
          tabIndex={0}
        >
          <ChevronUpIcon
            theme={theme === "light" ? "dark" : "light"}
            size="lg"
            aria-hidden="true"
            className="gencl:transition-colors gencl:duration-200"
            style={{ fill: prevStyles.iconFill }}
          />
        </Button>
      </div>
      <div
        onMouseEnter={() => !swiper.isEnd && setNextHovered(true)}
        onMouseLeave={() => setNextHovered(false)}
      >
        <Button
          variant="icon"
          shape="circle"
          size={size}
          theme="custom"
          className={cn(
            "gencl:transition-all gencl:duration-200",
            swiper.isEnd && "gencl:cursor-not-allowed!"
          )}
          style={{
            background: nextStyles.buttonBg,
          }}
          disabled={swiper.isEnd}
          onClick={() => {
            setNextHovered(false);
            swiper.slideNext();
          }}
          aria-label={`Next video (${currentSlide + 1} of ${totalSlides})`}
          aria-disabled={swiper.isEnd}
          tabIndex={0}
        >
          <ChevronDownIcon
            theme={theme === "light" ? "dark" : "light"}
            size="lg"
            aria-hidden="true"
            className="gencl:transition-colors gencl:duration-200"
            style={{ fill: nextStyles.iconFill }}
          />
        </Button>
      </div>
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
              ? "gencl:bg-white gencl:hover:bg-white/90"
              : "gencl:bg-[#D9D9D9] gencl:hover:bg-[#D9D9D9]/90"
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
