import { cn } from "@genuin/ui/utils";

import { PostTile } from "src/molecules/post-tile";

import type { PostsGridProps } from "./posts-grid.types";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";

export function PostsGrid({
  posts,
  className,
  isError,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  ...restProps
}: PostsGridProps) {
  //TODO: handle loading screen.
  if (isLoading) {
    return (
      <div className="gencl:w-full gencl:h-full gencl:text-center">
        Loading...
      </div>
    );
  }

  // TODO: handle error screen.
  if (isError) {
    return (
      <div className="gencl:w-full gencl:h-full gencl:text-center">
        Error loading posts
      </div>
    );
  }

  // TODO: handle empty state.
  if (posts.length === 0) {
    return <div>No posts available</div>;
  }

  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-wrap gencl:w-full gencl:h-full gencl:gap-4",
        className
      )}
      {...restProps}
    >
      <InfiniteScroll
        getNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoadingNextPage={isFetchingNextPage}
      >
        {posts.map((post) => {
          return (
            <PostTile
              key={post.postId}
              className="gencl:shrink-0"
              postData={post}
              imageCompProps={{ useWebp: false }}
            />
          );
        })}
      </InfiniteScroll>
    </div>
  );
}
