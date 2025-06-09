import type { ComponentProps } from "react";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";

import { PostsGrid } from "@organisms/posts-grid";
import { useGetGroupFeed } from "@react-query/api/group/feed";

// Lazy load the FeedView component
const FeedView = lazy(() =>
  import("@templates/feed/index.js").then((module) => ({
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
> & { slug: string };

export function GroupPosts({
  slug,
  lazyLoad,
  ...restProps
}: GroupPostsPropsType) {
  const [expandViewIndex, setExpandViewIndex] = useState<number>(-1);
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

  const handlePostClick = useCallback(
    (postId: string) => {
      setExpandViewIndex(
        feed?.findIndex((post) => post.video.id === postId) ?? -1
      );
    },
    [feed]
  );

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
        onPostTileClick={handlePostClick}
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
      {feed && expandViewIndex !== -1 && (
        <Suspense>
          <FeedView
            startIndex={expandViewIndex}
            defaultExpandView={true}
            feedData={{
              videos: feed,
              isLoading,
              fetchNextPage,
              hasNextPage,
              isFetchingNextPage,
            }}
            onCloseExpandView={() => {
              setExpandViewIndex(-1);
            }}
          />
        </Suspense>
      )}
    </>
  );
}
