"use client";
import { useMemo } from "react";

import { useBaseContext } from "@genuin/components/context";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { isMiddlewareOverlayEnabled } from "@genuin/components/lib/utils";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { GestureProvider } from "@genuin/components/molecules/gestures/context";
import { useFeed } from "@genuin/components/react-query/api/feed";
import { getQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";

import { FeedContextProvider } from "./context";
import { FeedViewCore } from "./core";
import type { FeedData, FeedViewPropsType, FeedWithDataPropsType } from "./feed.type";

import "swiper/css";

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
  isSectioned,
  ...restProps
}: FeedWithDataPropsType) {
  const embedDetails = useSafeEmbedContext();
  const { isInIframe, brandDetails } = useBaseContext();
  const queryOptions = useMemo(
    () => ({
      communityIds: embedDetails?.embedData?.customization.community_ids,
      groupIds: embedDetails?.embedData?.customization.community_loop_ids?.map((item) => item.loop_id),
      startVideoSlug: embedDetails?.embedData?.startVideoSlug,
      contextualParams: embedDetails?.embedData?.contextualParams,
      embedId: embedDetails?.embedData?.embed_id,
      isInIframe,
      shouldShowMiddlewareOverlay: isMiddlewareOverlayEnabled({
        videoLayoutId: embedDetails?.embedData.placement_video_layout_id,
        cardLayoutId: embedDetails?.embedData.placement_card_layout_id,
      }),
      brandId: brandDetails.brand_id ?? undefined,
    }),
    [embedDetails, isInIframe, brandDetails.brand_id]
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, isError } = useFeed(feedType, queryOptions);

  const videos = useMemo(() => data?.pages.flatMap((page) => page.feed) ?? [], [data]);

  const feedData: FeedData = {
    queryKey: getQueryKeyForFeed(feedType, queryOptions),
    videos,
    isLoading,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
    totalVideos: data?.pages[0]?.totalVideos,
    pageSession: data?.pages[0]?.pageSession,
  };

  if (isError) {
    return <ErrorState type="ERROR" />;
  }

  if (videos.length === 0 && !isLoading && !isFetchingNextPage) {
    return <ErrorState type="NO_CONTENT" />;
  }

  return (
    <FeedContextProvider defaultExpandView={defaultExpandView} onCloseExpandView={onCloseExpandView}>
      <GestureProvider isInIframe={isInIframe}>
        <FeedViewCore isSectioned={isSectioned} variant="page" feedData={feedData} {...restProps} />
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
  disableNativeFullscreenApi,
  onCloseExpandView,
  isSectioned,
  isInIframe,
  platform,
  ...restProps
}: FeedViewPropsType) {
  return (
    <FeedContextProvider
      defaultExpandView={defaultExpandView}
      onCloseExpandView={onCloseExpandView}
      variant={variant ?? "expand"}
      disableNativeFullscreenApi={disableNativeFullscreenApi}>
      <GestureProvider isInIframe={isInIframe ?? false}>
        <FeedViewCore
          isSectioned={isSectioned}
          feedData={feedData}
          variant={variant}
          platform={platform}
          {...restProps}
        />
      </GestureProvider>
    </FeedContextProvider>
  );
}
