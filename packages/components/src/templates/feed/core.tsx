"use client";
import { cn } from "@genuin/ui/utils";
import { CommunityUserRole } from "@genuin/components/types/post";
import { useCallback, useEffect, memo, useRef } from "react";
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
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { FeedViewPropsType } from "./feed.type";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { setQueryDataForVideoDetails } from "@genuin/components/react-query/api/video";
import { getQueryKeyForVideoDetails } from "@genuin/components/react-query/keys/video";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

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
  const embedDetails = useSafeEmbedContext();
  const {
    view: { brandLayoutType },
  } = useEmbedConfigs();
  const { isDesktop } = useDeviceDetectMediaQuery();
  const showSidePanel = videos[activeIndex] && !showExpandView && isDesktop;

  // Store original URL for iHeart layout URL manipulation
  const originalUrlRef = useRef<string | null>(null);

  // Handle URL manipulation for iHeart brand layout
  useEffect(() => {
    if (brandLayoutType !== "iheart" || !videos) return;

    const currentVideo = videos[activeIndex];
    if (!currentVideo?.video) return;

    if (showExpandView) {
      // Store original URL when entering expand view
      if (originalUrlRef.current === null) {
        originalUrlRef.current = window.location.href;
      }

      const videoSlug = currentVideo.video.slug;
      const videoId = currentVideo.video.id;

      const url = new URL(originalUrlRef.current);
      const videoPath = videoSlug + "_" + videoId;

      // Check if URL already ends with the video path
      if (!url.pathname.endsWith("/" + videoPath)) {
        // Ensure pathname ends with '/' if it doesn't already, then append video path
        const basePath = url.pathname.endsWith("/")
          ? url.pathname
          : url.pathname + "/";
        url.pathname = basePath + videoPath;
      }

      // Update URL without causing page reload
      window.history.replaceState(null, "", url.toString());
    } else {
      // Restore original URL when leaving expand view
      if (originalUrlRef.current) {
        window.history.replaceState(null, "", originalUrlRef.current);
        originalUrlRef.current = null;
      }
    }
  }, [showExpandView, activeIndex, brandLayoutType, videos]);

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
      // If the video is from embed details (i.e., a single video page opened via startVideoSlug),
      // update the video details using its slug as the query key.
      if (embedDetails && embedDetails.embedData.startVideoSlug === videoId) {
        setQueryDataForVideoDetails({
          queryKey: getQueryKeyForVideoDetails(videoId),
          isReacted,
        });
      } else {
        // Otherwise, for videos in the feed, update the reaction state in the feed's cached data.
        setQueryDataForReactionInFeed({
          queryKey,
          videoId,
          isReacted,
        });
      }
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
  };

  if (isLoading) {
    return <FeedSkeleton variant={showExpandView ? "fullscreen" : "default"} />;
  }

  if (videos && videos.length !== 0) {
    return (
      <div
        id="gencl-feed-view"
        className={cn(
          "gencl:flex gencl:w-full gencl:h-full gencl:gap-4",
          {
            "gencl:fixed gencl:top-0 gencl:sm:p-0! gencl:flex gencl:items-center gencl:mt-0 gencl:z-50 gencl:left-0 gencl:h-full gencl:w-full gencl:bg-black":
              showExpandView,
            "gencl:sm:pr-4! gencl:pt-0 gencl:sm:pt-4!": !showExpandView,
          },
          className
        )}
        {...restProps}
      >
        <PlayerList isSectioned={isSectioned} {...playerListProps} />
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
          <AuthenticationModal
            open={shouldShowDialog}
            onOpenChange={() => {
              closeDialog();
            }}
            customStep={dialogType}
          />
        )}
      </div>
    );
  }
});
