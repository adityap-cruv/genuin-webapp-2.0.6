"use client";
import { cn } from "@genuin/ui/utils";
import { CommunityUserRole } from "@genuin/components/types/post";
import { useCallback, useEffect, lazy, Suspense } from "react";
import "swiper/css";

import { PlayerList } from "@genuin/components/organisms/player-swiper";
import { PostSidePanel } from "@genuin/components/organisms/post-side-panel";
import {
  setQueryDataForReactionInFeed,
  setQueryDataForGroupSubscriptionChangeInFeed,
  setQueryDataForJoinCommunityStatusInFeed,
  setQueryDataForJoinGroupStatusInFeed,
  setQueryDataForCommentCountInFeed,
} from "@genuin/components/react-query/api/feed";

import { useFeedContext } from "./context";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { GroupUserStatusType } from "@genuin/components/types/roles";
import { FeedSkeleton } from "./feed-skeleton";
import { useInterruptionManager } from "@genuin/components/hooks/use-interruption-manager";
// import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { FeedViewPropsType } from "./feed.type";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

const AuthenticationModal = lazy(
  () =>
    import("@genuin/components/organisms/authentication-modal").then((mod) => ({
      default: mod.AuthenticationModal,
    })) as Promise<{
      default: typeof import("@genuin/components/organisms/authentication-modal").AuthenticationModal;
    }>
);

/**
 * Internal core presentation component for displaying feed data.
 * This component requires FeedContextProvider to be wrapped by a parent component.
 * Use FeedView instead for automatic context management.
 *
 * @internal
 */
export function FeedViewCore({
  feedData,
  className,
  startIndex = 0,
  style,
  variant,
  ...restProps
}: FeedViewPropsType) {
  const {
    videos,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    queryKey,
  } = feedData;
  const { setActiveIndex, activeIndex, showExpandView } = useFeedContext();
  const { hideGestureOverlay } = useGestureOverlayManager();
  const { handleSwipeCount, dialogType, shouldShowDialog, closeDialog } =
    useInterruptionManager();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const showSidePanel = videos[activeIndex] && !showExpandView && isDesktop;

  // this useEffect is used to fetch the next page of videos when the user scrolls to the end of the list.
  // it checks if there is a next page and if the user is not already fetching the next page.
  // if there is a next page and the user is not already fetching the next page, it fetches the next page.
  // it also checks if the user is at the end of the list (3 videos from the end) and if so, it fetches the next page.
  // this is done to avoid fetching too many pages at once and to improve performance.
  useEffect(() => {
    if (!videos) return;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      videos?.length - 3 === activeIndex
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, videos, activeIndex, fetchNextPage]);

  // Extract common callback handlers to follow DRY principle
  const handleCommunityJoinStatusChange = useCallback(
    (newRole: CommunityUserRole) => {
      if (!videos[activeIndex]?.community) return;
      setQueryDataForJoinCommunityStatusInFeed({
        queryKey,
        communityId: videos[activeIndex].community.id,
        newRole,
      });
    },
    [videos, activeIndex, queryKey]
  );

  const handleGroupJoinStatusChange = useCallback(
    (newRole: GroupUserStatusType) => {
      if (!videos[activeIndex]?.group) return;
      setQueryDataForJoinGroupStatusInFeed({
        queryKey,
        groupId: videos[activeIndex].group.id,
        newRole,
      });
    },
    [videos, activeIndex, queryKey]
  );

  const handleGroupSubscriptionChange = useCallback(
    (isSubscribed: boolean) => {
      if (!videos[activeIndex]?.group) return;
      setQueryDataForGroupSubscriptionChangeInFeed({
        queryKey,
        groupId: videos[activeIndex].group.id,
        isSubscribed,
      });
    },
    [videos, activeIndex, queryKey]
  );

  const handleReactionStateChange = useCallback(
    (videoId: string, isReacted: boolean) => {
      setQueryDataForReactionInFeed({
        queryKey,
        videoId,
        isReacted,
      });
    },
    [queryKey]
  );

  const handleCommentCountChange = useCallback(
    (videoId: string, increment: boolean = true) => {
      setQueryDataForCommentCountInFeed({
        queryKey,
        videoId,
        increment,
      });
    },
    [queryKey]
  );

  const handleActiveIndexChange = useCallback(
    (newIndex: number) => {
      setActiveIndex(newIndex);
      hideGestureOverlay("SWIPE");
      handleSwipeCount(newIndex);
    },
    [setActiveIndex, hideGestureOverlay]
  );

  if (isLoading) {
    return <FeedSkeleton variant={showExpandView ? "fullscreen" : "default"} />;
  }

  if (videos && videos.length !== 0) {
    return (
      <div
        id="gencl-feed-view"
        className={cn(
          "gencl:flex gencl:w-full gencl:sm:py-4 gencl:sm:pr-4 gencl:h-full gencl:gap-4",
          {
            "gencl:fixed gencl:top-0 gencl:py-0! gencl:flex gencl:items-center gencl:mt-0 gencl:z-50 gencl:left-0 gencl:h-full gencl:w-full gencl:bg-black":
              showExpandView,
          },
          className
        )}
        {...restProps}
      >
        <PlayerList
          startIndex={startIndex}
          posts={videos}
          onActiveIndexChange={handleActiveIndexChange}
          onReactionStateChange={handleReactionStateChange}
          onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
          onGroupJoinStatusChange={handleGroupJoinStatusChange}
          onGroupSubscriptionChange={handleGroupSubscriptionChange}
          onCommentCountChange={handleCommentCountChange}
        />
        {showSidePanel && (
          <PostSidePanel
            onGroupJoinStatusChange={handleGroupJoinStatusChange}
            onGroupSubscriptionChange={handleGroupSubscriptionChange}
            onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
            onCommentCountChange={handleCommentCountChange}
            postDetails={videos?.[activeIndex] as PostDetailsType}
          />
        )}
        {/* For Interruption */}
        {shouldShowDialog && (
          <Suspense fallback={null}>
            <AuthenticationModal
              open={shouldShowDialog}
              onOpenChange={() => {
                closeDialog();
              }}
              customStep={dialogType}
            />
          </Suspense>
        )}
      </div>
    );
  }
}
