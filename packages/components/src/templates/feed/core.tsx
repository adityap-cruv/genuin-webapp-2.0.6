"use client";
import { cn } from "@genuin/ui/utils";
import { useCallback, useEffect, useState, memo, lazy } from "react";

import { useBaseContext } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { useInterruptionManager } from "@genuin/components/hooks/use-interruption-manager";
import { useRouter } from "@genuin/components/hooks/use-router";
import useViewportHeight from "@genuin/components/hooks/use-screen-height";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { setQueryDataForCommunityRoleChange } from "@genuin/components/react-query/api/community/details/details";
import {
  setQueryDataForReactionInFeed,
  setQueryDataForGroupSubscriptionChangeInFeed,
  setQueryDataForJoinCommunityStatusInFeed,
  setQueryDataForJoinGroupStatusInFeed,
  setQueryDataForCommentCountInFeed,
} from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { setQueryDataForSubscribeGroupInGroupDetails } from "@genuin/components/react-query/api/group/details";
import { getQueryKeyForVideoDetails } from "@genuin/components/react-query/keys/video";
import type { CommunityUserRole } from "@genuin/components/types/post";
import type { GroupUserStatusType } from "@genuin/components/types/roles";

import { useFeedContext } from "./context";
import { useAdInjectedFeed } from "./feed-ads";
import { FeedSkeleton } from "./feed-skeleton";
import type { FeedViewPropsType } from "./feed.type";

import "swiper/css";

const PlayerList = lazy(() =>
  import("@genuin/components/organisms/player-swiper").then((m) => ({
    default: m.PlayerList,
  }))
);

// Lazy load side panel to split comments/forms from core chunk
const PostSidePanel = lazy(() =>
  import("@genuin/components/organisms/post-side-panel").then((m) => ({
    default: m.PostSidePanel,
  }))
);

const AuthenticationModal = lazy(() =>
  import("@genuin/components/organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
);

const IheartFullscreenContainerLazy = lazy(() =>
  import("@genuin/components/molecules/iheart-full-screen-contaner").then((m) => ({
    default: m.IheartFullscreenContainer,
  }))
);

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
  if (isIHeart) {
    // Not null: this wraps the primary feed content (PlayerList etc). A null fallback
    // would blank the whole feed while the iheart-container chunk downloads. The
    // fullscreen shimmer holds the screen until it mounts.
    return (
      <SafeSuspense fallback={<FeedSkeleton variant="fullscreen" />}>
        <IheartFullscreenContainerLazy>{children}</IheartFullscreenContainerLazy>
      </SafeSuspense>
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
  style: _style,
  variant,
  onActiveIndexChange,
  embedOptions: _embedOptions,
  isSectioned,
  platform,
  ...restProps
}: FeedViewPropsType) {
  const viewportHeight = useViewportHeight();
  const {
    videos: rawVideos,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    queryKey,
    totalVideos,
    pageSession,
  } = feedData;
  const { setActiveIndex, activeIndex, showExpandView } = useFeedContext();
  const [adActiveOn, setAdActiveOn] = useState<number>(-1);
  const isAdFilled = adActiveOn !== -1 && activeIndex === adActiveOn;
  const { hideGestureOverlay } = useGestureOverlayManager();
  const { handleSwipeCount, dialogType, shouldShowDialog, closeDialog } = useInterruptionManager();
  const { canGoBack } = useRouter();
  const embedDetails = useSafeEmbedContext();
  const { theme = "dark", brandDetails } = useBaseContext();

  const {
    view: { brandLayoutType },
    engagement: {
      engagementTools: { comment: showCommentBox },
    },
    brand: { shouldInjectExpandViewAds, shouldAttachStaticExpandViewAd },
  } = useEmbedConfigs();

  const videos = useAdInjectedFeed(
    rawVideos,
    brandDetails.brand_id ?? undefined,
    showExpandView,
    platform ?? "webapp",
    shouldInjectExpandViewAds,
    shouldAttachStaticExpandViewAd
  );
  const { isDesktop } = useDeviceDetectMediaQuery();
  const showSidePanel =
    videos[activeIndex] &&
    !showExpandView &&
    isDesktop &&
    (!embedDetails || embedDetails.embedData.style === "standard_wall");

  const isIHeart = brandLayoutType === "iheart";
  // Get disableSwiper flag from embed context (only applies to expand view)
  const disableSwiper = showExpandView ? (embedDetails?.embedEventBus.getContext().disableSwiper ?? false) : false;

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
    if (hasNextPage && !isFetchingNextPage && videos?.length - 3 === activeIndex) {
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

      setQueryDataForCommunityRoleChange(videos[activeIndex].community.slug, newRole);
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

      setQueryDataForSubscribeGroupInGroupDetails(videos[activeIndex].group.slug, isSubscribed);
    },
    [videos, activeIndex, queryKey]
  );

  const handleReactionStateChange = useCallback(
    (videoId: string, videoSlug: string, isReacted: boolean) => {
      setQueryDataForReactionInFeed({
        queryKey,
        videoId,
        isReacted,
      });
    },
    [queryKey, getQueryKeyForVideoDetails]
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

  const handleAdFilled = useCallback((_type: string, index: number) => {
    setAdActiveOn(index);
  }, []);

  const handleAdPlaybackEnd = useCallback((_index: number) => {
    setAdActiveOn(-1);
  }, []);

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
    [setActiveIndex, hideGestureOverlay, showExpandView, videos]
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
    pageSession,
    isAdFilled,
    onAdFilled: handleAdFilled,
    onAdPlaybackEnd: handleAdPlaybackEnd,
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
            [`gencl:sm:p-0! gencl:flex gencl:items-center gencl:mt-0 gencl:z-50 gencl:left-0 gencl:w-full`]:
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
                (embedDetails && canGoBack()) ||
                embedDetails?.embedData.style === "standard_wall"),
          },
          variant === "expand" ? "gencl:w-screen" : "gencl:w-full gencl:h-full",
          className
        )}
        style={{
          // TODO NEED TO CHECK WHY WE HAVE USED VIEWPORT HEIGHT FOR EXPAND VARIANT, SHOULD WE USE IT FOR PAGE ALSO
          // height: variant === "expand" ? `${viewportHeight}px` : "100%",
          height: "100%",
        }}
        {...restProps}>
        <FeedContentWrapper isIHeart={isIHeart}>
          <SafeSuspense fallback={<FeedSkeleton variant="player-list" theme={skeletonTheme} />}>
            <PlayerList isSectioned={isSectioned} totalVideos={totalVideos} {...playerListProps} />
          </SafeSuspense>
          {showSidePanel && (
            <div className={cn("gencl:contents", { "gencl:invisible gencl:pointer-events-none": isAdFilled })}>
              <SafeSuspense fallback={<FeedSkeleton variant="side-panel" theme={skeletonTheme} />}>
                <PostSidePanel
                  onGroupJoinStatusChange={handleGroupJoinStatusChange}
                  onGroupSubscriptionChange={handleGroupSubscriptionChange}
                  onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
                  onCommentCountChange={handleCommentCountChange}
                  postDetails={videos?.[activeIndex] as PostDetailsType}
                />
              </SafeSuspense>
            </div>
          )}
          {/* For Interruption */}
          {shouldShowDialog && (
            // null fallback is correct: this is a modal dialog rendered on top of the
            // fully-painted feed; the feed stays visible while the modal chunk loads.
            <SafeSuspense fallback={null} errorFallback={null}>
              <AuthenticationModal
                open={shouldShowDialog}
                onOpenChange={() => {
                  closeDialog();
                }}
                customStep={dialogType}
              />
            </SafeSuspense>
          )}
        </FeedContentWrapper>
      </div>
    );
  }
});
