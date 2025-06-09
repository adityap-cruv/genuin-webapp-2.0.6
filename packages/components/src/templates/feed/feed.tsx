import { cn } from "@genuin/ui/utils";
import { useEffect, useMemo, type ComponentProps } from "react";
import "swiper/css";
import { useWindowSize } from "usehooks-ts";

import { useBaseContext } from "@genuin/components/context/base";
import { PostSidePanel } from "@organisms";
import { PlayerList } from "@organisms/player-swiper";
import { useFeed } from "@react-query/api/feed";
import type { PostDetailsType } from "@react-query/api/feed/schema";
import type { FeedType } from "@types/post";

import { FeedContextProvider, useFeedContext } from "./context";

/**
 * Feed data structure containing videos and pagination state
 * @interface FeedData
 */
export type FeedData = {
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
  const { videos, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    feedData;
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

  // TODO: Create a shimmer for feed.
  if (isLoading) {
    return <div>Loading</div>;
  }

  if (videos && videos.length !== 0) {
    return (
      <div
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
          onActiveIndexChange={(newIndex) => {
            setActiveIndex(newIndex);
          }}
        />
        {videos[activeIndex] && !showExpandView && (
          <PostSidePanel
            postDetails={videos?.[activeIndex]}
            style={{ height: feedVideoSizeBox.height }}
          />
        )}
      </div>
    );
  }
}
