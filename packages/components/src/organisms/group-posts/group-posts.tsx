import type { ComponentProps } from "react";
import { useMemo } from "react";

import { PostsGrid } from "src/organisms/posts-grid";
import { useGetGroupFeed } from "src/react-query/api/group/feed";

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
        {...restProps}
      />
      {lazyLoad === "manual" && (
        <>
          {isFetchingNextPage && <div>Loading...</div>}
          {hasNextPage && !isFetchingNextPage && (
            <div onClick={() => fetchNextPage()}>Load more</div>
          )}
        </>
      )}
    </>
  );
}
