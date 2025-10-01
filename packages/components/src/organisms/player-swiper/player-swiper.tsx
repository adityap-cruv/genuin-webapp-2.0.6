"use client";
import "swiper/css";
import { Button } from "@genuin/ui/button";
import { SwiperSlide } from "swiper/react";
import { useBoolean } from "usehooks-ts";

import { Actions } from "@genuin/components/molecules/actions";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";

import { Comments, CommentsDialog } from "../../molecules/comments";

import { Player } from "./player";
import { SwiperImplementation } from "./swiper-implementation";
import { SectionsTabs } from "./sections-tabs";
import { ComponentProps, useEffect, useState } from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { ChevronDownIcon, ChevronUpIcon } from "@genuin/ui/icons";
import { Swiper } from "swiper/types";
import { useAnalytics } from "@genuin/components/context";

type PlayerListPropsType = {
  posts: PostDetailsType[];
  startIndex?: number;
  className?: string;
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
  isSectioned?: boolean;
};

// TODO: This component is using feed context, which is not ideal. Remove this dep of FeedContext in future.
export function PlayerList({
  posts,
  startIndex = 0,
  onActiveIndexChange,
  onReactionStateChange,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommentCountChange,
  isSectioned = false,
}: PlayerListPropsType) {
  const { showExpandView, activeIndex } = useFeedContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const { value, toggle, setValue } = useBoolean(isDesktop);
  const { track, EventName } = useAnalytics();
  const {
    engagement: {
      engagementTools: { comment: showCommentBox },
    },
  } = useEmbedConfigs();
  const embedDetails = useSafeEmbedContext();

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

  // Get the active swiper for navigation buttons
  const activeSwiper = isSectioned
    ? verticalSwipers[activeHorizontalIndex]
    : verticalSwipers[0];

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
    >
      {sectionList?.map((item, sectionIdx) => (
        <SwiperSlide key={item?.id || sectionIdx}>
          {({ isActive: isHorizontalActive }) => (
            <SwiperImplementation
              className="gencl:h-full"
              initialSlide={startIndex}
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
            >
              {posts.map((post, index) => (
                <SwiperSlide key={post.video.id}>
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

                    return (
                      <div className="gencl:h-full gencl:w-full">
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
                        />
                      </div>
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
      className={cn(
        "gencl:h-full gencl:aspect-reel",
        isMobile && "gencl:h-full gencl:w-full"
      )}
      onSwiper={(swiper) => {
        setVerticalSwipers((prev) => ({
          ...prev,
          [0]: swiper,
        }));
      }}
      onActiveIndexChange={(swiper) => {
        onActiveIndexChange?.(swiper.activeIndex);
      }}
    >
      {posts.map((post, index) => (
        <SwiperSlide key={post.video.id}>
          {({ isActive, isNext, isPrev, isVisible }) => (
            <div className="gencl:h-full gencl:w-full">
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
            </div>
          )}
        </SwiperSlide>
      ))}
    </SwiperImplementation>
  );

  return (
    <div className="gencl:h-full gencl:w-full gencl:flex gencl:gap-6 gencl:justify-center">
      <div
        className={cn(
          "gencl:flex gencl:justify-center gencl:gap-6 gencl:h-full gencl:w-full gencl:sm:w-fit!"
        )}
      >
        <div
          className={cn(
            "gencl:h-full gencl:aspect-reel gencl:relative",
            isMobile && "gencl:h-full gencl:w-full"
          )}
        >
          {isSectioned && (
            <SectionsTabs onSectionSelect={handleSectionSelect} />
          )}
          {isSectioned ? renderSectionedContent() : renderNonSectionedContent()}
        </div>
      </div>

      {/* Navigation buttons for expand view (not on mobile) */}
      {showExpandView && !isMobile && (
        <NavigationButton
          swiper={activeSwiper ?? undefined}
          postsLength={posts.length}
        />
      )}

      {!isMobile && posts[activeIndex] && (
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
                return (
                  <>
                    {children}
                    <p
                      className={cn(
                        "gencl:p-0 gencl:text-center gencl:text-black gencl:text-body-2-medium",
                        showExpandView && "gencl:text-white!"
                      )}
                    >
                      {abbreviateNumber(
                        posts[activeIndex]?.video.commentCount ?? 0
                      )}
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
}: {
  swiper?: Swiper;
  postsLength?: number;
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

  return (
    <div className="gencl:z-50 gencl:text-white gencl:flex gencl:flex-col gencl:gap-4 gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2">
      <Button
        theme="navigation"
        disabled={swiper.isBeginning}
        onClick={() => swiper.slidePrev()}
      >
        <ChevronUpIcon theme="dark" size="sm" />
      </Button>
      <Button
        theme="navigation"
        disabled={swiper.isEnd}
        onClick={() => swiper.slideNext()}
      >
        <ChevronDownIcon theme="dark" size="sm" />
      </Button>
    </div>
  );
}
