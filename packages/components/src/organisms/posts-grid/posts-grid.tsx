import { cn } from "@genuin/ui/utils";

import { PostTile } from "src/molecules/post-tile";

import type { PostsGridProps } from "./posts-grid.types";

export function PostsGrid({ posts, className, ...restProps }: PostsGridProps) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:flex-wrap gencl:w-full gencl:h-full gencl:gap-4",
        className
      )}
      {...restProps}
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
    </div>
  );
}
