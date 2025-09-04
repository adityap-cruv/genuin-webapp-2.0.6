"use client";
import "swiper/css";
import { Button } from "@genuin/ui/button";
import { SwiperSlide, useSwiper } from "swiper/react";
import { useBoolean } from "usehooks-ts";

import { Actions } from "@genuin/components/molecules/actions";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";

import { Comments, CommentsDialog } from "../../molecules/comments";

import { Player } from "./player";
import { SwiperImplementation } from "./swiper-implementation";
import { ComponentProps, useState } from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { abbreviateNumber, cn } from "@genuin/ui/lib/utils";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
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
  onCommentCountChange?: ComponentProps<
    typeof Comments
  >["onCommentCountChange"];
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
}: PlayerListPropsType) {
  const { value, toggle } = useBoolean(true);
  const { showExpandView, activeIndex } = useFeedContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();
  const {
    engagement: {
      engagementTools: { comment: showCommentBox },
    },
  } = useEmbedConfigs();
  const embedDetails = useSafeEmbedContext();

  return (
    <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-6">
      <SwiperImplementation
        initialSlide={startIndex}
        onActiveIndexChange={(swiper) => {
          onActiveIndexChange?.(swiper.activeIndex);
        }}
      >
        {posts.map((post, index) => {
          return (
            <SwiperSlide key={post.video.id}>
              {({ isActive, isNext, isPrev, isVisible }) => {
                return (
                  <div className="gencl:flex gencl:gap-3 gencl:h-full">
                    <Player
                      isActive={isActive}
                      isNext={isNext}
                      isPrev={isPrev}
                      isVisible={isVisible}
                      post={post}
                      onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                      onGroupJoinStatusChange={onGroupJoinStatusChange}
                      onGroupSubscriptionChange={onGroupSubscriptionChange}
                      onReactionStateChange={onReactionStateChange}
                      onCommentCountChange={onCommentCountChange}
                      index={index}
                    />
                    {!isMobile && (
                      <Actions
                        shareUrl={post.video.shareUrl}
                        isReacted={post.video.isSparked ?? false}
                        contentId={post.video.id}
                        groupSlug={post.group.slug}
                        slug={post.video.slug}
                        reactionCount={post.video.sparkCount}
                        theme={showExpandView ? "dark" : "light"}
                        className="gencl:shrink-0 gencl:pb-4"
                        isCommentBoxOpen={value}
                        actionWrapper={{
                          COMMENT: (defaultNode) => {
                            const defaultOpen =
                              (embedDetails?.embedData
                                ?.autoUserInteractionToPerform ===
                                "comment-spark" ||
                                embedDetails?.embedData
                                  .autoUserInteractionToPerform ===
                                  "comment") &&
                              post.video.slug ===
                                embedDetails.embedData?.startVideoSlug &&
                              activeIndex === index &&
                              !showExpandView;

                            // Simple ui to show for comment trigger
                            function CommentBox({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) {
                              return (
                                <>
                                  {children}
                                  <p
                                    className={cn(
                                      "gencl:p-0 gencl:text-center gencl:text-black gencl:text-body-2-medium",
                                      showExpandView && "gencl:text-white!"
                                    )}
                                  >
                                    {abbreviateNumber(post.video.commentCount)}
                                  </p>
                                </>
                              );
                            }

                            if (!isDesktop)
                              return (
                                <CommentsDialog
                                  commentCount={post.video.commentCount}
                                  communityId={post.community.id}
                                  loopId={post.group.id}
                                  videoId={post.video.id}
                                  videoSlug={post.video.slug}
                                  shareUrl={post.video.shareUrl}
                                  defaultOpen={defaultOpen}
                                  key={"feed-comment-box" + post.video.id}
                                  onCommentCountChange={onCommentCountChange}
                                >
                                  <CommentBox>{defaultNode}</CommentBox>
                                </CommentsDialog>
                              );
                            return (
                              <span
                                key={"feed-comment-box" + post.video.id}
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
                          onReactionStateChange?.(post.video.id, isReacted);
                        }}
                      />
                    )}
                  </div>
                );
              }}
            </SwiperSlide>
          );
        })}
        {/* in case of expand view show navigation buttons. in case of mobile view don't show navigation. */}
        {showExpandView && !isMobile && <NavigationButton />}
      </SwiperImplementation>
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

function NavigationButton() {
  const swiper = useSwiper();
  return (
    <div className="gencl:z-50 gencl:text-white gencl:space-y-4 gencl:fixed gencl:right-7.5 gencl:top-1/2 gencl:-translate-y-1/2">
      <Button
        theme="navigation"
        disabled={swiper.isBeginning}
        onClick={() => swiper.slidePrev()}
      >
        <ChevronUpIcon />
      </Button>
      <Button
        theme="navigation"
        disabled={swiper.isEnd}
        onClick={() => swiper.slideNext()}
      >
        <ChevronDownIcon />
      </Button>
    </div>
  );
}
