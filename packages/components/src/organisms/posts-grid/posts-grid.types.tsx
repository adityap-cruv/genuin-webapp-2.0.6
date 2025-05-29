import type { ComponentProps } from "react";

import type { PostTileDataType } from "src/molecules/post-tile";

export type PostsGridProps = {
  posts: PostTileDataType[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
} & ComponentProps<"div">;
