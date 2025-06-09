import { ErrorIcon, PlayIcon } from "@genuin/ui/icons";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { cn } from "@genuin/ui/utils";
import { useMemo } from "react";

import { PostTile, PostTileSkeleton } from "@molecules/post-tile";

import type { PostsGridProps } from "./posts-grid.types";

export function PostsGrid({
  posts,
  className,
  lazyLoad = "auto",
  isError,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  children,
  onPostTileClick,
  ...restProps
}: PostsGridProps) {
  const Posts = useMemo(() => {
    return posts.map((post) => {
      return (
        <PostTile
          key={post.postId}
          className="gencl:shrink-0"
          postData={post}
          imageCompProps={{ useWebp: false }}
          onClick={() => {
            onPostTileClick?.(post.postId);
          }}
        />
      );
    });
  }, [onPostTileClick, posts]);

  if (isLoading) {
    return (
      <div className={cn("gencl:w-full gencl:h-full ", className)}>
        <PostsGridSkeleton noOfPosts={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          "gencl:w-full gencl:flex gencl:flex-col gencl:gap-4 gencl:justify-center gencl:items-center gencl:h-60",
          className
        )}
      >
        <ErrorIcon className="gencl:size-8" />
        <p className="gencl:text-body-2-medium gencl:text-secondary-600">
          We&apos;re unable to load posts
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className={cn(
          "gencl:w-full gencl:flex gencl:flex-col gencl:gap-4 gencl:justify-center gencl:items-center gencl:h-60",
          className
        )}
      >
        <PlayIcon variant="stroke-dark" />
        <div className="gencl:space-y-1 gencl:flex-center gencl:flex-col">
          <p className="gencl:text-body-0-semi-bold">No Posts Yet</p>
          <p className="gencl:text-body-2-medium gencl:text-secondary-600">
            Be the first to share your thoughts!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("gencl:w-full gencl:h-full ", className)} {...restProps}>
      <div className="gencl:flex gencl:flex-wrap gencl:gap-2">
        {lazyLoad === "auto" ? (
          <InfiniteScroll
            getNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoadingNextPage={isFetchingNextPage}
          >
            {Posts}
          </InfiniteScroll>
        ) : (
          Posts
        )}
      </div>
      {children}
    </div>
  );
}

export function PostsGridSkeleton({
  noOfPosts = 1,
  className,
  size = "sm",
}: {
  noOfPosts?: number;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:w-full gencl:h-full gencl:flex-wrap gencl:gap-4",
        className
      )}
    >
      {Array.from({ length: noOfPosts }).map(() => (
        <PostTileSkeleton size={size} />
      ))}
    </div>
  );
}
