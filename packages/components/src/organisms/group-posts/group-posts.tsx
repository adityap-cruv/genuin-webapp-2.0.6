"use client";
import type { ComponentProps } from "react";
import { Suspense, useCallback, useMemo, useState, lazy } from "react";

import { PostsGrid } from "@genuin/components/organisms/posts-grid";
import { useGetGroupFeed } from "@genuin/components/react-query/api/group/feed";
import { getQueryKeyForGroupFeed } from "@genuin/components/react-query/keys/feed";

// Lazy load the FeedView component
const FeedView = lazy(() =>
  import("@genuin/components/templates/feed").then((module) => ({
    default: module.FeedView,
  }))
);

type GroupPostsPropsType = Omit<
  ComponentProps<typeof PostsGrid>,
  | "posts"
  | "fetchNextPage"
  | "hasNextPage"
  | "isFetchingNextPage"
  | "isError"
  | "isLoading"
> & {
  slug: string;
  /**
   * if you want to enable expand view for group posts, set this to true
   */
  enableFeedView: boolean;
};

export function GroupPosts({
  slug,
  lazyLoad,
  enableFeedView = false,
  onPostTileClick,
  ...restProps
}: GroupPostsPropsType) {
  // State to manage the index of the post to expand
  const [expandViewId, setExpandViewId] = useState<string | null>(null);
  const {
    isError,
    isLoading,
    isFetchingNextPage,
    data: feedData,
    fetchNextPage,
    hasNextPage,
  } = useGetGroupFeed(slug);

  const feed = useMemo(
    () => feedData?.pages.flatMap((page) => page.feed),
    [feedData]
  );

  const handlePostTileClick = useCallback(
    (postId: string) => {
      onPostTileClick?.(postId);
      enableFeedView && setExpandViewId(postId);
    },
    [enableFeedView, onPostTileClick]
  );

  const handleCloseExpandView = useCallback(() => {
    if (!enableFeedView) return;
    setExpandViewId(null);
  }, [enableFeedView]);

  return (
    <>
      <PostsGrid
        posts={
          feed?.map((post) => ({
            imageUrl: post.video.thumbnailM ?? post.video.thumbnail ?? "",
            postId: post.video.id,
            isPinned: post.video.isPinned,
            linkouts: null,
            stats: { comments: post.video.commentCount, shares: 0, views: 0 },
          })) ?? []
        }
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        lazyLoad={lazyLoad}
        onPostTileClick={handlePostTileClick}
        {...restProps}
      >
        {lazyLoad === "manual" && (
          <>
            {hasNextPage && !isFetchingNextPage && (
              <div
                className="gencl:flex-center gencl:pt-4 gencl:text-body-2-bold gencl:text-secondary-600 gencl:cursor-pointer"
                onClick={() => fetchNextPage()}
              >
                View more
              </div>
            )}
          </>
        )}
      </PostsGrid>
      {enableFeedView && feed && expandViewId !== null && (
        <Suspense>
          <FeedView
            startIndex={feed.findIndex(
              (post) => post.video.id === expandViewId
            )}
            defaultExpandView={true}
            feedData={{
              videos: feed,
              isLoading,
              fetchNextPage,
              hasNextPage,
              isFetchingNextPage,
              queryKey: getQueryKeyForGroupFeed(slug),
            }}
            onCloseExpandView={handleCloseExpandView}
          />
        </Suspense>
      )}
    </>
  );
}
