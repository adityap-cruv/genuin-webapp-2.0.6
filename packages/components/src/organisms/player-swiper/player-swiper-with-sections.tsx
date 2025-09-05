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
import { ComponentProps, useMemo, useState, useEffect } from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { SectionsTabs } from "./sections-tabs";
import { Swiper } from "swiper/types";
import { ChevronDownIcon, ChevronUpIcon } from "@genuin/ui/icons";

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

export function PlayerListWithSection({
  posts,
  startIndex = 0,
  onActiveIndexChange,
  onReactionStateChange,
  onCommunityJoinStatusChange,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommentCountChange,
  isSectioned,
}: PlayerListPropsType) {
  const { showExpandView, activeIndex } = useFeedContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const { value, toggle, setValue } = useBoolean(isDesktop);
  const {
    engagement: {
      engagementTools: { comment: showCommentBox },
    },
  } = useEmbedConfigs();
  const embedDetails = useSafeEmbedContext();
  const sectionList = embedDetails?.embedEventBus.getContext().sectionList;

  // Ref for outer swiper
  const [outerSwiper, setOuterSwiper] = useState<Swiper | null>(null);

  // State to track vertical swipers for each section
  const [verticalSwipers, setVerticalSwipers] = useState<
    Record<number, Swiper>
  >({});
  const [activeHorizontalIndex, setActiveHorizontalIndex] = useState(0);

  // Handler for section tab click
  const handleSectionSelect = (section: any) => {
    if (!sectionList) return;
    const sectionIndex = sectionList.findIndex((s: any) => s.id === section.id);
    if (outerSwiper && sectionIndex !== -1) {
      outerSwiper.slideTo(sectionIndex);
    }
    // Also update selectedSection in embed context
    if (embedDetails) {
      embedDetails.updateSelectedSection(section);
    }
  };

  return (
    <div className="gencl:h-full gencl:w-full gencl:flex gencl:gap-6 gencl:justify-center">
      <div
        className={cn(
          "gencl:flex gencl:justify-center gencl:gap-6",
          isMobile && "gencl:h-full gencl:w-full"
        )}
      >
        <div
          className={cn(
            "gencl:h-full gencl:aspect-reel gencl:absolute",
            isMobile && "gencl:h-full gencl:w-full"
          )}
        >
          {isSectioned && (
            <SectionsTabs onSectionSelect={handleSectionSelect} />
          )}
        </div>
        <SwiperImplementation
          direction="horizontal"
          className={cn(
            "gencl:h-full gencl:aspect-reel",
            isMobile && "gencl:h-full gencl:w-full"
          )}
          onSwiper={setOuterSwiper}
          onActiveIndexChange={(swiper) => {
            setActiveHorizontalIndex(swiper.activeIndex);
            if (sectionList) {
              embedDetails?.updateSelectedSection(
                sectionList[swiper.activeIndex]
              );
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
                  }}
                >
                  {posts.map((post, index) => {
                    return (
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
                          const isTrulyNext =
                            isVerticalNext && isHorizontalActive;
                          const isTrulyPrev =
                            isVerticalPrev && isHorizontalActive;
                          const isTrulyVisible =
                            isVerticalVisible && isHorizontalActive;

                          return (
                            <div className="gencl:flex gencl:gap-3 gencl:h-full">
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
                                onGroupJoinStatusChange={
                                  onGroupJoinStatusChange
                                }
                                onGroupSubscriptionChange={
                                  onGroupSubscriptionChange
                                }
                                onReactionStateChange={onReactionStateChange}
                                onCommentCountChange={onCommentCountChange}
                                index={index}
                              />
                            </div>
                          );
                        }}
                      </SwiperSlide>
                    );
                  })}
                </SwiperImplementation>
              )}
            </SwiperSlide>
          ))}
        </SwiperImplementation>
      </div>

      {!isMobile && posts[activeIndex] && (
        <Actions
          shareUrl={posts[activeIndex]?.video.shareUrl ?? ""}
          isReacted={posts[activeIndex]?.video.isSparked ?? false}
          contentId={posts[activeIndex]?.video.id}
          groupSlug={posts[activeIndex]?.group.slug}
          slug={posts[activeIndex]?.video.slug}
          reactionCount={posts[activeIndex]?.video.sparkCount}
          theme={showExpandView ? "dark" : "light"}
          className="gencl:shrink-0 gencl:pb-4"
          isCommentBoxOpen={value}
          actionWrapper={{
            COMMENT: (defaultNode) => {
              if (!showCommentBox) return;
              //
              const defaultOpen =
                embedDetails?.embedData?.autoUserInteractionToPerform ===
                  "comment-spark" &&
                posts[activeIndex]?.video.slug ===
                  embedDetails.embedData?.startVideoSlug;

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
            const videoId = posts[activeIndex]?.video.id;
            if (videoId) {
              onReactionStateChange?.(videoId, isReacted);
            }
          }}
        />
      )}

      {/* in case of expand view show navigation buttons. in case of mobile view don't show navigation. */}
      {showExpandView && !isMobile && (
        <NavigationButton
          verticalSwiper={verticalSwipers[activeHorizontalIndex]}
          postsLength={posts.length}
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
  verticalSwiper,
  postsLength,
}: {
  verticalSwiper?: Swiper;
  postsLength?: number;
}) {
  const swiper = verticalSwiper;

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
    <div className="gencl:z-50 gencl:text-white gencl:space-y-4 gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2">
      <Button
        theme="navigation"
        disabled={swiper.isBeginning}
        onClick={() => swiper.slidePrev()}
      >
        <ChevronUpIcon theme="dark" size="xs" />
      </Button>
      <Button
        theme="navigation"
        disabled={swiper.isEnd}
        onClick={() => swiper.slideNext()}
      >
        <ChevronDownIcon theme="dark" size="xs" />
      </Button>
    </div>
  );
}
