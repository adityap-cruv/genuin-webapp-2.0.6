import type { ComponentProps } from "react";

import type { PostTileDataType } from "src/molecules/post-tile";

export type PostsGridProps = {
  posts: PostTileDataType[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  /**
   * If set to 'auto', the grid will load more posts when the user scrolls to the bottom.
   * If set to 'manual', the grid will not load more posts automatically and will require a manual trigger.
   */
  lazyLoad?: "manual" | "auto";
  /**
   * Callback function to handle click on post tile.
   * @param postId
   */
  onPostTileClick?: (postId: string) => void;
} & ComponentProps<"div">;
