import type { Image } from "@genuin/ui/image";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import type { postTileVariants } from "./post-tile";

export type PostTileDataType = {
  /**
   * Id of the post.
   */
  postId: string;
  /**
   * The URL of the image to display in the post tile.
   */
  imageUrl: string;
  /**
   * If the post tile is pinned.
   */
  isPinned?: boolean;
  // todo: define a types for linkouts.
  /**
   * If the post tile has linkout component.
   *
   */
  linkouts?: any;
  /**
   * Stats to show in the post tile. Leave empty if you don't want to show any stats.
   */
  stats?: Record<"views" | "comments" | "reactions" , number>;
};

export type PostTileProps = {
  postData: PostTileDataType;
  /**
   * Show the hover effect on the post tite.
   * @default true
   */
  showHover?: boolean;
  /**
   * Props for the Image component.
   */
  imageCompProps: Omit<ComponentProps<typeof Image>, "src">;
} & ComponentProps<"div"> &
  VariantProps<typeof postTileVariants>;
