import { cn } from "@genuin/ui/utils";
import { CommunityUserRole, FeedType } from "@genuin/components/types/post";
import { useCallback, useEffect, useMemo, type ComponentProps } from "react";
import "swiper/css";
import { useWindowSize } from "usehooks-ts";

import { useBaseContext } from "@context/base";
import { Skeleton } from "@genuin/ui/skeleton";
import { CommentsItemSkeleton } from "@organisms/comments/comment-item";
import { PlayerList } from "@organisms/player-swiper";
import { PostSidePanel } from "@organisms/post-side-panel";
import {
  setQueryDataForReactionInFeed,
  useFeed,
  setQueryDataForGroupSubscriptionChangeInFeed,
  setQueryDataForJoinCommunityStatusInFeed,
  setQueryDataForJoinGroupStatusInFeed,
} from "@react-query/api/feed";
import type { PostDetailsType } from "@react-query/api/feed/schema";

import { FeedContextProvider, useFeedContext } from "./context";
import { QueryKey } from "@tanstack/react-query";
import { getQueryKeyForFeed } from "@react-query/keys/feed";
import { GroupUserStatusType } from "@types/roles";

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
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed(feedType);

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

  return (
    <FeedContextProvider
      defaultExpandView={defaultExpandView}
      onCloseExpandView={onCloseExpandView}
    >
      <FeedViewCore feedData={feedData} {...restProps} />
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
      <FeedViewCore feedData={feedData} {...restProps} />
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
    },
    [setActiveIndex]
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
          "gencl:grid gencl:mt-4 gencl:w-full gencl:pr-4 gencl:h-full gencl:grid-cols-2 gencl:gap-4",
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
      </div>
    );
  }
}

export function FeedSkeleton() {
  return (
    <div className="gencl:grid gencl:mt-7 gencl:w-full gencl:h-full gencl:grid-cols-2 gencl:pb-7 ">
      <div className="gencl:flex gencl:justify-center gencl:h-full gencl:w-full gencl:gap-2 gencl:pe-4">
        <Skeleton className="gencl:w-100" />
        <div className="gencl:w-100 gencl:flex gencl:gap-4 gencl:flex-col gencl:flex-col-reverse gencl:w-13 gencl:mb-12">
          {Array.from({ length: 5 }).map(() => (
            <Skeleton className="gencl:size-12 gencl:rounded-full gencl:shrink-0" />
          ))}
        </div>
      </div>
      <div className="gencl:w-full gencl:grid gencl:overflow-auto gencl:gap-4 gencl:grid-rows-[auto_minmax(200px,1fr)]">
        <div className="gencl:border gencl:border-secondary-200 gencl:p-4 gencl:rounded-2xl gencl:h-[calc(100%-1px)]">
          <div className="gencl:w-100 gencl:flex gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mb-5 gencl:mt-0">
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0" />
            <div className="gencl:w-full gencl:flex gencl:flex-col gencl:justify-center gencl:gap-2">
              <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md gencl:mt-1.5" />
            </div>
          </div>
          <Skeleton className="gencl:w-full gencl:h-3 gencl:rounded-md" />
          <div className="gencl:w-100 gencl:flex gencl:flex gencl:gap-2 gencl:overflow-hidden gencl:mt-3">
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-9" />
            <Skeleton className="gencl:size-10 gencl:rounded-full gencl:shrink-0 gencl:w-32 gencl:h-9" />
          </div>
        </div>
        <div className="gencl:border gencl:border-secondary-200 gencl:p-4 gencl:rounded-2xl">
          {Array.from({ length: 7 }).map(() => (
            <CommentsItemSkeleton />
          ))}
        </div>
      </div>
    </div>
  );
}
