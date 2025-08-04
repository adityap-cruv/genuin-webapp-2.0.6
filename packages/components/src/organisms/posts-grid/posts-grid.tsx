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
  postTileVariant,
  className,
  gridClassName,
  lazyLoad = "auto",
  isError,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  shouldCloseModal = false,
  children,
  onPostTileClick,
  ...restProps
}: PostsGridProps & { shouldCloseModal?: boolean }) {
  // Default grid styles
  const defaultGridStyles =
    "gencl:grid gencl:gap-2 gencl:grid-cols-4! gencl:lg:grid-cols-5! gencl:xl:grid-cols-6! gencl:2xl:grid-cols-8!";

  // Use custom grid styles if provided, or default if not
  const gridStyles = cn(defaultGridStyles, gridClassName);

  const Posts = useMemo(() => {
    return posts.map((post) => {
      const postTile = (
        <PostTile
          key={post.postId}
          className="gencl:w-full" // Use full width of grid cell
          variant={postTileVariant ?? "responsive"}
          postData={post}
          imageCompProps={{ useWebp: true }}
          shouldCloseModal={shouldCloseModal}
          onClick={() => {
            onPostTileClick?.(post.postId);
          }}
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
  }, [posts, shouldCloseModal, onPostTileClick, postTileVariant]);

  if (isLoading) {
    return (
      <div className={cn("gencl:w-full gencl:h-full", className)}>
        <PostsGridSkeleton
          noOfPosts={6}
          gridClassName={gridClassName}
          className={className}
        />
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
          "gencl:w-full gencl:flex gencl:flex-col gencl:gap-4 gencl:justify-center gencl:items-center gencl:h-45 gencl:sm:!h-60",
          className
        )}
      >
        <PlayIcon theme="light" />
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
    <div className={cn("gencl:w-full gencl:h-full", className)} {...restProps}>
      {lazyLoad === "auto" ? (
        <div className={gridStyles}>
          <InfiniteScroll
            getNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoadingNextPage={isFetchingNextPage}
            loader={<PostsGridLoader noOfPosts={6} />}
          >
            {Posts}
          </InfiniteScroll>
        </div>
      ) : (
        <div className={gridStyles}>
          {Posts}
          {isFetchingNextPage && <PostsGridLoader noOfPosts={6} />}
        </div>
      )}
      {children}
    </div>
  );
}

export function PostsGridSkeleton({
  noOfPosts = 1,
  className,
  gridClassName,
  size = "sm",
}: {
  noOfPosts?: number;
  className?: string;
  gridClassName?: string;
  size?: "sm" | "lg";
}) {
  // Default grid styles
  const defaultGridStyles =
    "gencl:grid gencl:gap-2 gencl:grid-cols-4! gencl:lg:grid-cols-5! gencl:xl:grid-cols-6! gencl:2xl:grid-cols-8!";

  // Use custom grid styles if provided, or default if not
  const gridStyles = cn(defaultGridStyles, gridClassName);

  return (
    <div className={cn(gridStyles, className)}>
      {Array.from({ length: noOfPosts }).map((_, idx) => (
        <PostTileSkeleton key={idx} size={size} className="gencl:w-full" />
      ))}
    </div>
  );
}

export function PostsGridLoader({
  noOfPosts = 1,
  size = "sm",
}: {
  noOfPosts?: number;
  size?: "sm" | "lg";
}) {
  return (
    <>
      {Array.from({ length: noOfPosts }).map((_, idx) => (
        <PostTileSkeleton key={idx} size={size} className="gencl:w-full" />
      ))}
    </>
  );
}
