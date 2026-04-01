"use client";
import { cn } from "@genuin/ui/utils";
import { CommunityUserRole } from "@genuin/components/types/post";
import { useCallback, useEffect, memo, lazy, Suspense } from "react";
import "swiper/css";

const PlayerList = lazy(() =>
  import("../../organisms/player-swiper/index.js").then((m) => ({
    default: m.PlayerList,
  })),
);

// Lazy load side panel to split comments/forms from core chunk
const PostSidePanel = lazy(() =>
  import("../../organisms/post-side-panel/index.js").then((m) => ({
    default: m.PostSidePanel,
  })),
);

import {
  setQueryDataForReactionInFeed,
  setQueryDataForGroupSubscriptionChangeInFeed,
  setQueryDataForJoinCommunityStatusInFeed,
  setQueryDataForJoinGroupStatusInFeed,
  setQueryDataForCommentCountInFeed,
} from "@genuin/components/react-query/api/feed";
import { setQueryDataForCommunityRoleChange } from "@genuin/components/react-query/api/community/details/details";
import { setQueryDataForSubscribeGroupInGroupDetails } from "@genuin/components/react-query/api/group/details";

import { useFeedContext } from "./context";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";

import { GroupUserStatusType } from "@genuin/components/types/roles";
import { FeedSkeleton } from "./feed-skeleton";
import { useInterruptionManager } from "@genuin/components/hooks/use-interruption-manager";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
const AuthenticationModal = lazy(() =>
  import("../../organisms/authentication-modal/index.js").then((m) => ({
    default: m.AuthenticationModal,
  })),
) as React.ComponentType<any>;

import { FeedViewPropsType } from "./feed.type";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { getQueryKeyForVideoDetails } from "@genuin/components/react-query/keys/video";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useBaseContext } from "@genuin/components/context";
import useViewportHeight from "@genuin/components/hooks/use-screen-height";
import { useRouter } from "@genuin/components/hooks/use-router";

/**
 * Internal component to conditionally wrap feed content based on brand layout type.
 * Uses IheartFullscreenContainer only for iHeart brand to follow DRY principle.
 */
const FeedContentWrapper = memo(function FeedContentWrapper({
  isIHeart,
  children,
}: {
  isIHeart: boolean;
  children: React.ReactNode;
}) {
  const IheartFullscreenContainerLazy = lazy(() =>
    import(
      "@genuin/components/molecules/iheart-full-screen-contaner/index.js"
    ).then((m) => ({
      default: m.IheartFullscreenContainer,
    })),
  );

  if (isIHeart) {
    return (
      <Suspense fallback={null}>
        <IheartFullscreenContainerLazy>
          {children}
        </IheartFullscreenContainerLazy>
      </Suspense>
    );
  }
  return <>{children}</>;
});

/**
 * Internal core presentation component for displaying feed data.
 * This component requires FeedContextProvider to be wrapped by a parent component.
 * Use FeedView instead for automatic context management.
 *
 * @internal
 */
export const FeedViewCore = memo(function FeedViewCore({
  feedData,
  className,
  startIndex = 0,
  style,
  variant,
  onActiveIndexChange,
  embedOptions,
  isSectioned,
  ...restProps
}: FeedViewPropsType) {
  const viewportHeight = useViewportHeight();
  const {
    videos,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    queryKey,
    totalVideos,
  } = feedData;
  const { setActiveIndex, activeIndex, showExpandView } = useFeedContext();
  const { hideGestureOverlay } = useGestureOverlayManager();
  const { handleSwipeCount, dialogType, shouldShowDialog, closeDialog } =
    useInterruptionManager();
  const { canGoBack } = useRouter();
  const embedDetails = useSafeEmbedContext();
  const { theme = "dark" } = useBaseContext();
  const {
    view: { brandLayoutType },
    engagement: {
      engagementTools: { comment: showCommentBox },
    },
  } = useEmbedConfigs();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const showSidePanel =
    videos[activeIndex] &&
    !showExpandView &&
    isDesktop &&
    (!embedDetails || embedDetails.embedData.style === "standard_wall");

  const isIHeart = brandLayoutType === "iheart";
  // Get disableSwiper flag from embed context (only applies to expand view)
  const disableSwiper = showExpandView
    ? (embedDetails?.embedEventBus.getContext().disableSwiper ?? false)
    : false;

  // Find the index of the video that matches startVideoSlug, fallback to parent's startIndex
  // const resolvedStartIndex = (() => {
  //   if (embedDetails?.embedData.startVideoSlug && videos) {
  //     const foundIndex = videos.findIndex((video) =>
  //       isUuid(embedDetails.embedData.startVideoSlug ?? "")
  //         ? video.video?.id === embedDetails.embedData.startVideoSlug
  //         : video.video?.slug === embedDetails.embedData.startVideoSlug
  //     );
  //     return foundIndex !== -1 ? foundIndex : startIndex;
  //   }
  //   return startIndex;
  // })();

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

      setQueryDataForCommunityRoleChange(
        videos[activeIndex].community.slug,
        newRole,
      );
    },
    [videos, activeIndex, queryKey],
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
    [videos, activeIndex, queryKey],
  );

  const handleGroupSubscriptionChange = useCallback(
    (isSubscribed: boolean) => {
      if (!videos[activeIndex]?.group) return;
      setQueryDataForGroupSubscriptionChangeInFeed({
        queryKey,
        groupId: videos[activeIndex].group.id,
        isSubscribed,
      });

      setQueryDataForSubscribeGroupInGroupDetails(
        videos[activeIndex].group.slug,
        isSubscribed,
      );
    },
    [videos, activeIndex, queryKey],
  );

  const handleReactionStateChange = useCallback(
    (videoId: string, videoSlug: string, isReacted: boolean) => {
      setQueryDataForReactionInFeed({
        queryKey,
        videoId,
        isReacted,
      });
    },
    [queryKey, getQueryKeyForVideoDetails],
  );

  const handleCommentCountChange = useCallback(
    (videoId: string, increment: boolean = true) => {
      setQueryDataForCommentCountInFeed({
        queryKey,
        videoId,
        increment,
      });
    },
    [queryKey],
  );

  const handleActiveIndexChange = useCallback(
    (newIndex: number) => {
      onActiveIndexChange?.(newIndex);
      setActiveIndex(newIndex);
      hideGestureOverlay("SWIPE");
      handleSwipeCount(newIndex);

      // // CHECK ANY BETTER APPROACH
      // // Ensure video plays in expand view
      // if (showExpandView && videos && videos[newIndex]) {
      //   // Give a small delay to allow DOM to update
      //   setTimeout(() => {
      //     const videoId = videos[newIndex]?.video?.id;
      //     if (videoId) {
      //       const playerElement = document.getElementById(
      //         `feed-player--${videoId}`
      //       );
      //       if (
      //         playerElement &&
      //         playerElement instanceof HTMLVideoElement &&
      //         playerElement.paused
      //       ) {
      //         playerElement
      //           .play()
      //           .catch((err) => console.warn("Could not autoplay video:", err));
      //       }
      //     }
      //   }, 100);
      // }
    },
    [setActiveIndex, hideGestureOverlay, showExpandView, videos],
  );

  const playerListProps = {
    startIndex,
    posts: videos,
    onActiveIndexChange: handleActiveIndexChange,
    onReactionStateChange: handleReactionStateChange,
    onCommunityJoinStatusChange: handleCommunityJoinStatusChange,
    onGroupJoinStatusChange: handleGroupJoinStatusChange,
    onGroupSubscriptionChange: handleGroupSubscriptionChange,
    onCommentCountChange: handleCommentCountChange,
    disableSwiper,
    theme,
  };

  const skeletonTheme = variant === "page" ? "light" : theme;
  if (isLoading && !isIHeart) {
    return (
      <FeedSkeleton
        theme={skeletonTheme}
        variant={showExpandView ? "fullscreen" : "default"}
        showCommentsSkeleton={showCommentBox && isDesktop}
      />
    );
  }

  if (videos && videos.length !== 0) {
    return (
      <div
        id="gencl-feed-view"
        className={cn(
          "gencl:flex gencl:gap-4",
          {
            [` gencl:sm:p-0! gencl:flex gencl:items-center gencl:mt-0 gencl:z-50 gencl:left-0 gencl:w-full`]:
              showExpandView,
            "gencl:sm:pr-4! gencl:pt-0 gencl:sm:pt-4!": !showExpandView,
            // Apply fixed positioning from top for non-iHeart layouts in expand view
            "gencl:fixed gencl:top-0": !isIHeart && showExpandView,
            // Apply fixed positioning from top 48px, if it's mobile and iheart(brand)
            "gencl:fixed gencl:top-12": isIHeart && !isDesktop,
          },
          {
            [theme === "dark" ? "gencl:bg-black" : "gencl:bg-white"]:
              showExpandView &&
              (embedDetails == null || // null OR undefined
                (embedDetails && canGoBack())),
          },
          variant === "expand" ? "gencl:w-screen" : "gencl:w-full gencl:h-full",
          className,
        )}
        style={{
          height: variant === "expand" ? `${viewportHeight}px` : "100%",
        }}
        {...restProps}
      >
        <FeedContentWrapper isIHeart={isIHeart}>
          <Suspense
            fallback={
              <FeedSkeleton variant="player-list" theme={skeletonTheme} />
            }
          >
            <PlayerList
              isSectioned={isSectioned}
              totalVideos={totalVideos}
              {...playerListProps}
            />
          </Suspense>
          {showSidePanel && (
            <Suspense
              fallback={
                <FeedSkeleton variant="side-panel" theme={skeletonTheme} />
              }
            >
              <PostSidePanel
                onGroupJoinStatusChange={handleGroupJoinStatusChange}
                onGroupSubscriptionChange={handleGroupSubscriptionChange}
                onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
                onCommentCountChange={handleCommentCountChange}
                postDetails={videos?.[activeIndex] as PostDetailsType}
              />
            </Suspense>
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
        </FeedContentWrapper>
      </div>
    );
  }
});
