"use client";
import "swiper/css";
import { Button } from "@genuin/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  onCommentCountChange?: (videoId: string, increment?: boolean) => void;
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
  const [selectedBucketIndex, setSelectedBucketIndex] = useState(0);

  const embedDetails = useSafeEmbedContext();

  return (
    <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-6">
      <SwiperImplementation
        initialSlide={startIndex}
        onActiveIndexChange={(swiper) => {
          onActiveIndexChange?.(swiper.activeIndex);
        }}
      >
        {embedDetails?.embedData.card_layout_id === 6 && (
          <div className="gencl:absolute gencl:top-0 gencl:z-50 gencl:flex gencl:h-13 gencl:sm:h-16! gencl:w-full gencl:sm:w-[calc(100%-60px)]! gencl:gap-2 gencl:overflow-x-auto gencl:scrollbar-none gencl:p-4 gencl:pb-0!">
            {/* <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="gencl:flex gencl:h-9 gencl:w-9 gencl:sm:h-12! gencl:sm:w-12! gencl:cursor-pointer gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-black/40 gencl:border gencl:border-[#FFFFFF66]"
            >
              <SearchIcon theme="dark" size="lg" />
            </div> */}
            {embedDetails?.bucketList?.map((bucket, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBucketIndex(index);
                }}
                className={cn(
                  "gencl:text-body-0-semi-bold gencl:h-9 gencl:sm:h-12! gencl:flex gencl:border gencl:items-center gencl:justify-center gencl:px-3.5 gencl:rounded-full gencl:text-white gencl:transition-colors gencl:cursor-pointer gencl:whitespace-nowrap",
                  selectedBucketIndex === index
                    ? "gencl:bg-white gencl:text-black gencl:border-white"
                    : "gencl:bg-black/40 gencl:border-[#FFFFFF66]"
                )}
              >
                {bucket}
              </button>
            ))}
          </div>
        )}

        {posts.map((post, index) => {
          return (
            <SwiperSlide key={post.video.id}>
              <div className="gencl:flex gencl:gap-3 gencl:h-full">
                <Player
                  post={post}
                  onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                  onGroupJoinStatusChange={onGroupJoinStatusChange}
                  onGroupSubscriptionChange={onGroupSubscriptionChange}
                  onReactionStateChange={(_, isReacted) => {
                    onReactionStateChange?.(post.video.id, isReacted);
                  }}
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
                          embedDetails?.embedData
                            ?.autoUserInteractionToPerform ===
                            "comment-spark" &&
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

                        if (isMobile)
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
        <ChevronUp className="gencl:stroke-white gencl:size-5" />
      </Button>
      <Button
        theme="navigation"
        disabled={swiper.isEnd}
        onClick={() => swiper.slideNext()}
      >
        <ChevronDown className="gencl:stroke-white gencl:size-5" />
      </Button>
    </div>
  );
}
