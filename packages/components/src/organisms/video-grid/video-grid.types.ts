import type { ComponentProps } from "react";

import type { VideoFeedSourceProps } from "@genuin/components/organisms/video-feed/video-feed.types";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

export type VideoGridProps = Omit<ComponentProps<"section">, "children"> &
  VideoFeedSourceProps & {
    /** How many tiles to show. @default 4 */
    limit?: number;
    /** Move the active tile to the next one when its video ends. @default true */
    autoAdvance?: boolean;
    /** Wrap to the first tile after the last one (only when `autoAdvance`). @default true */
    loop?: boolean;
    /** Show mute · play/pause · expand on the active tile. @default true */
    showControls?: boolean;
    /** Show the "date • duration • description" line. @default true */
    showMeta?: boolean;
    /** Show the linkout CTA bar on tiles that have linkouts. @default true */
    showLinkouts?: boolean;
    /** Show the "Sponsored" pill on sponsored videos. @default true */
    showSponsoredTag?: boolean;
    /** Tile width in px. Defaults to 518 on desktop/tablet, 382 on mobile. */
    tileWidth?: number;
    /** Tile height in px. Defaults to 291 on desktop/tablet, 215 on mobile. */
    tileHeight?: number;
    /** Number of columns. Defaults to 2 on desktop/tablet, 1 on mobile. */
    columns?: number;
    /** Gap between tiles in px. @default 8 */
    gap?: number;
    /** Called whenever the active (playing) tile changes. */
    onActiveVideoChange?: (post: PostDetailsType, index: number) => void;
    /** Called when the expanded (full-view) state toggles. */
    onExpandChange?: (expanded: boolean) => void;
  };

/** Props of one `VideoGridTile`. */
export type VideoGridTileProps = {
  post: PostDetailsType;
  index: number;
  isActive: boolean;
  totalVideos: number;
  activeIndex: number;
  size: { width: number; height: number };
  showControls: boolean;
  showMeta: boolean;
  showLinkouts: boolean;
  showSponsoredTag: boolean;
  /** Loop this single video instead of advancing (only meaningful when it is the sole video). */
  loopSelf: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  /** Player finished its iteration → grid decides which tile becomes active. */
  onIterationEnd: () => void;
  /** Called when the tile is clicked (make it the active one). */
  onSelect?: () => void;
};
