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
import { ComponentProps } from "react";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { cn } from "@genuin/ui/lib/utils";

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
}: PlayerListPropsType) {
  const { value, toggle } = useBoolean(true);
  const { showExpandView, activeIndex } = useFeedContext();
  const { isMobile, isDesktop } = useDeviceDetectMediaQuery();

  return (
    <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-6">
      <SwiperImplementation
        initialSlide={startIndex}
        onActiveIndexChange={(swiper) => {
          onActiveIndexChange?.(swiper.activeIndex);
        }}
      >
        {posts.map((post) => {
          return (
            <SwiperSlide key={post.video.id}>
              <div className="gencl:flex gencl:gap-3 gencl:h-full">
                <Player
                  post={post}
                  onCommunityJoinStatusChange={onCommunityJoinStatusChange}
                  onGroupJoinStatusChange={onGroupJoinStatusChange}
                  onGroupSubscriptionChange={onGroupSubscriptionChange}
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
                        if (!isDesktop)
                          return (
                            <CommentsDialog
                              commentCount={post.video.commentCount}
                              communityId={post.community.id}
                              loopId={post.group.id}
                              videoId={post.video.id}
                              videoSlug={post.video.slug}
                            >
                              {defaultNode}
                            </CommentsDialog>
                          );

                        return (
                          <span
                            onClick={() => {
                              if (showExpandView) toggle();
                            }}
                          >
                            {defaultNode}
                            <p
                              className={cn(
                                "gencl:p-0 gencl:text-center gencl:text-black gencl:text-body-2-medium",
                                showExpandView && "gencl:text-white!"
                              )}
                            >
                              {post.video.commentCount}
                            </p>
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
      {value && showExpandView && posts[activeIndex] && (
        <div className="gencl:max-w-118 gencl:w-full gencl:h-full gencl:hidden gencl:sm:block! gencl:py-6">
          <Comments
            videoId={posts[activeIndex].video.id}
            loopId={posts[activeIndex].group.id}
            communityId={posts[activeIndex].community?.id}
            videoSlug={posts[activeIndex].video.slug}
            className="gencl:h-full"
            showCloseButton={value}
            onClose={toggle}
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
