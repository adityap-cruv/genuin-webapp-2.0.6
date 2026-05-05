import { type ComponentProps } from "react";
import type { Swiper } from "swiper/types";

import type { PlayerProvider } from "@genuin/components/molecules/feed-player/context";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

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
   * Total number of videos in feed.
   */
  totalVideos?: number;
  /**
   * Function to swipe to the next video in the carousel.
   */
  onPlayerIterationEnd: ComponentProps<typeof PlayerProvider>["onPlayerIterationEnd"];
  /**
   * Swiper instance for the video player.
   */
  swiper: Swiper | null;
  /**
   * Height and width of the video player, used for analytics and ad configuration.
   */
  itemSize: { height: number; width: number };
  /**
   * Feed-session identifier from the first feed API page, forwarded to analytics as `page_session`.
   */
  pageSession?: string | null;
} & ComponentProps<"div">;
