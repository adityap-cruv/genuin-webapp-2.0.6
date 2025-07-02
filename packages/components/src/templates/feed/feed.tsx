"use client";
import { cn } from "@genuin/ui/utils";
import { CommunityUserRole, FeedType } from "@genuin/components/types/post";
import { useCallback, useEffect, useMemo, type ComponentProps } from "react";
import "swiper/css";
import { useWindowSize } from "usehooks-ts";
import dynamic from "next/dynamic";

import { useBaseContext } from "@genuin/components/context/base";
import { PlayerList } from "@genuin/components/organisms/player-swiper";
import { PostSidePanel } from "@genuin/components/organisms/post-side-panel";
import {
  setQueryDataForReactionInFeed,
  useFeed,
  setQueryDataForGroupSubscriptionChangeInFeed,
  setQueryDataForJoinCommunityStatusInFeed,
  setQueryDataForJoinGroupStatusInFeed,
} from "@genuin/components/react-query/api/feed";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { FeedContextProvider, useFeedContext } from "./context";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import { useGestureOverlayManager } from "@genuin/components/molecules/gestures";
import { QueryKey } from "@tanstack/react-query";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { GroupUserStatusType } from "@genuin/components/types/roles";
import { FeedSkeleton } from "./feed-skeleton";
import { useInterruptionManager } from "@genuin/components/hooks/use-interruption-manager";
import type { AuthenticationModalProps } from "@genuin/components/organisms/authentication-modal/authentication-modal";
import { ErrorState } from "@genuin/components/molecules/error-state";

const AuthenticationModal = dynamic<AuthenticationModalProps>(
  () =>
    import("@genuin/components/organisms/authentication-modal").then(
      (mod) => mod.AuthenticationModal
    ),
  { ssr: false, loading: () => null }
);

/**
 * Feed data structure containing videos and pagination state
 * @interface FeedData
 */
export type FeedData = {
  /**
   * Query key for the feed data.
   */
  queryKey: QueryKey;
  /** Array of video posts to display */
  videos: PostDetailsType[];
  /** Whether the feed is currently loading */
  isLoading: boolean;
  /** Whether there are more pages available */
  hasNextPage: boolean;
  /** Whether the next page is currently being fetched */
  isFetchingNextPage: boolean;
  /** Function to fetch the next page of videos */
  fetchNextPage: () => void;
};

type BaseFeedPropsType = {
  /**
   * Enable expand view for the feed.
   * This will allow the user to expand the feed to full screen.
   * @default true
   */
  enableExpandView?: boolean;
  /**
   * Whether to show the expand view by default.
   */
  defaultExpandView?: boolean;
  /**
   * Callback function to handle when the expand view is closed.
   */
  onCloseExpandView?: () => void;
  /**
   * The index of the first video to display in the feed.
   */
  startIndex?: number;
};

/**
 * Props for FeedWithData component
 * @interface FeedWithDataPropsType
 */
type FeedWithDataPropsType = {
  /** Type of feed to display (HOME, POPULAR, LATEST) */
  feedType: FeedType;
} & BaseFeedPropsType &
  ComponentProps<"div">;

/**
 * Props for FeedView component
 * @interface FeedViewPropsType
 */
type FeedViewPropsType = {
  /** Feed data containing videos and state */
  feedData: FeedData;
} & BaseFeedPropsType &
  ComponentProps<"div">;

export type { FeedWithDataPropsType, FeedViewPropsType };

/**
 * Complete feed solution with built-in data fetching and context management.
 * This is the recommended component for most use cases.
 *
 * @param props - Component props including feedType and standard div props
 * @returns Complete feed component with data fetching
 *
 * @example
 * ```tsx
 * <FeedWithData feedType="HOME" className="my-feed" />
 * ```
 */
export function FeedWithData({
  feedType,
  defaultExpandView,
  onCloseExpandView,
  ...restProps
}: FeedWithDataPropsType) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useFeed(feedType);

  const videos = useMemo(
    () => data?.pages.flatMap((page) => page.feed) ?? [],
    [data]
  );

  const feedData: FeedData = {
    queryKey: getQueryKeyForFeed(feedType),
    videos,
    isLoading,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  };

  if (isError) {
    // const errorCode = (error as any)?.code;
    return <ErrorState type="ERROR" />;
  }

  if (videos.length === 0 && !isLoading && !isFetchingNextPage) {
    return <ErrorState type="NO_CONTENT" />;
  }

  return (
    <FeedContextProvider
      defaultExpandView={defaultExpandView}
      onCloseExpandView={onCloseExpandView}
    >
      <GestureProvider>
        <FeedViewCore feedData={feedData} {...restProps} />
      </GestureProvider>
    </FeedContextProvider>
  );
}

// Backward compatibility alias
export const Feed = FeedWithData;

/**
 * Pure presentation component for displaying feed data with automatic context management.
 * Use this when you need custom data fetching logic but want the convenience of automatic context setup.
 *
 * @param props - Component props including feedData and standard div props
 * @returns Feed presentation component wrapped with context provider
 *
 * @example
 * ```tsx
 * <FeedView feedData={myCustomFeedData} className="my-feed" />
 * ```
 */
export function FeedView({
  feedData,
  defaultExpandView,
  onCloseExpandView,
  ...restProps
}: FeedViewPropsType) {
  return (
    <FeedContextProvider
      defaultExpandView={defaultExpandView}
      onCloseExpandView={onCloseExpandView}
    >
      <GestureProvider>
        <FeedViewCore feedData={feedData} {...restProps} />
      </GestureProvider>
    </FeedContextProvider>
  );
}

/**
 * Internal core presentation component for displaying feed data.
 * This component requires FeedContextProvider to be wrapped by a parent component.
 * Use FeedView instead for automatic context management.
 *
 * @internal
 */
function FeedViewCore({
  feedData,
  className,
  startIndex = 0,
  style,
  ...restProps
}: FeedViewPropsType) {
  const { height } = useWindowSize();
  const { feedVideoSizeBox } = useBaseContext();
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

  const handleActiveIndexChange = useCallback(
    (newIndex: number) => {
      setActiveIndex(newIndex);
      hideGestureOverlay("SWIPE");
      handleSwipeCount(newIndex);
    },
    [setActiveIndex, hideGestureOverlay]
  );

  // TODO: Create a shimmer for feed.
  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (videos && videos.length !== 0) {
    return (
      <div
        id="gencl-feed-view"
        className={cn(
          "gencl:flex gencl:mt-4 gencl:w-full gencl:pr-4 gencl:h-full gencl:gap-4 ",
          {
            "gencl:fixed gencl:top-0 gencl:flex gencl:items-center gencl:mt-0 gencl:z-50 gencl:left-0 gencl:h-full gencl:w-full gencl:bg-black":
              showExpandView,
          },
          className
        )}
        style={{
          height: showExpandView ? height : feedVideoSizeBox.height,
          ...style,
        }}
        {...restProps}
      >
        <PlayerList
          className="gencl:flex-grow"
          startIndex={startIndex}
          posts={videos}
          onActiveIndexChange={handleActiveIndexChange}
          onReactionStateChange={handleReactionStateChange}
          onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
          onGroupJoinStatusChange={handleGroupJoinStatusChange}
          onGroupSubscriptionChange={handleGroupSubscriptionChange}
        />
        {videos[activeIndex] && !showExpandView && (
          <PostSidePanel
            onGroupJoinStatusChange={handleGroupJoinStatusChange}
            onGroupSubscriptionChange={handleGroupSubscriptionChange}
            onCommunityJoinStatusChange={handleCommunityJoinStatusChange}
            postDetails={videos?.[activeIndex]}
            style={{ height: feedVideoSizeBox.height }}
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
}
