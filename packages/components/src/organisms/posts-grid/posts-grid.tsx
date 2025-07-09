import { ErrorIcon, PlayIcon } from "@genuin/ui/icons";
import { InfiniteScroll } from "@genuin/ui/infinite-scroll";
import { cn } from "@genuin/ui/utils";
import { useMemo } from "react";
import { DialogClose } from "@genuin/ui/components/dialog";

import {
  PostTile,
  PostTileSkeleton,
} from "@genuin/components/molecules/post-tile";

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
  shouldCloseModal = false,
  children,
  ...restProps
}: PostsGridProps & { shouldCloseModal?: boolean }) {
  const Posts = useMemo(() => {
    return posts.map((post) => {
      const postTile = (
        <PostTile
          key={post.postId}
          className="gencl:flex-none gencl:w-40 sm:gencl:w-44 md:gencl:w-48"
          postData={post}
          imageCompProps={{ useWebp: false }}
          shouldCloseModal={shouldCloseModal}
        />
      );

      // Wrap with DialogClose if we want to close modal when clicking on posts
      if (shouldCloseModal) {
        return (
          <DialogClose key={post.postId} asChild>
            <div>{postTile}</div>
          </DialogClose>
        );
      }

      return postTile;
    });
  }, [posts, shouldCloseModal]);

  if (isLoading) {
    return (
      <div className={cn("gencl:w-full gencl:h-full", className)}>
        <PostsGridSkeleton noOfPosts={6} />
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
          "gencl:w-full gencl:flex gencl:flex-col gencl:gap-4 gencl:justify-center gencl:items-center gencl:bg-secondary-50 gencl:h-72 gencl:rounded-lg",
          className
        )}
      >
        <PlayIcon variant="stroke-dark" className="gencl:size-8" />
        <div className="gencl:space-y-1 gencl:flex-center gencl:flex-col">
          <p className="gencl:text-body-0-semi-bold">No Posts Yet</p>
          <p className="gencl:text-body-1-medium gencl:text-secondary-600">
            No content available
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
          <div className="gencl:flex gencl:flex-wrap gencl:gap-2">
            {Posts}
            {isFetchingNextPage && <PostsGridLoader noOfPosts={6} />}
          </div>
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
    <div className={cn("gencl:flex gencl:flex-wrap gencl:gap-2", className)}>
      {Array.from({ length: noOfPosts }).map((_, idx) => (
        <PostTileSkeleton key={idx} size={size} />
      ))}
    </div>
  );
}

export function PostsGridLoader({
  noOfPosts = 1,
  className,
  size = "sm",
}: {
  noOfPosts?: number;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <>
      {Array.from({ length: noOfPosts }).map((_, idx) => (
        <PostTileSkeleton key={idx} size={size} />
      ))}
    </>
  );
}
