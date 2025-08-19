import { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { type ComponentProps } from "react";

export type EmbedTileProps = {
  isActive: boolean;
  /**
   * The type of embed tile.
   */
  embedType?: 0 | 1 | 2;
  /**
   * The details of the post to be displayed in the embed tile.
   */
  postDetails: PostDetailsType;
  /**
   * Position of the embed tile in the carousel.
   */
  index: number;
  /**
   * Function to swipe to the next video in the carousel.
   */
  onPlayerIterationEnd: ComponentProps<
    typeof PlayerProvider
  >["onPlayerIterationEnd"];
  /**
   * Array of video titles for all videos in the grid
   */
  bucketList?: string[];
} & ComponentProps<"div">;
