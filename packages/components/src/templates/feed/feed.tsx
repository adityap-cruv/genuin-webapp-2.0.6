"use client";
import { useMemo } from "react";
import "swiper/css";

import { useFeed } from "@genuin/components/react-query/api/feed";

import { FeedContextProvider } from "./context";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { FeedViewCore } from "./core";
import {
  FeedData,
  FeedViewPropsType,
  FeedWithDataPropsType,
} from "./feed.type";

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
        <FeedViewCore variant="page" feedData={feedData} {...restProps} />
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
  variant,
  defaultExpandView,
  onCloseExpandView,
  ...restProps
}: FeedViewPropsType) {
  return (
    <FeedContextProvider
      defaultExpandView={defaultExpandView}
      onCloseExpandView={onCloseExpandView}
      variant={variant ?? "expand"}
    >
      <GestureProvider>
        <FeedViewCore feedData={feedData} {...restProps} />
      </GestureProvider>
    </FeedContextProvider>
  );
}
