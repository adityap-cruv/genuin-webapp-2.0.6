import type { QueryKey } from "@tanstack/react-query";
import type { ComponentProps } from "react";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import type { FeedType } from "@genuin/components/types/post";

/**
 * Data-selection props. At least one of `videoId`, `videoIds`, `communityId`,
 * `groupId` (or a static `posts` list) is required for the feed to show anything.
 */
export type VideoFeedSourceProps = {
  /** Start with this video. Alone → only this video; with community/group → shown first, then the feed. */
  videoId?: string;
  /** Explicit ordered list of video ids to play (single page, no pagination). */
  videoIds?: string[];
  /** Feed of a community — sent as `community_ids` on `/goservices/feed/v1/home`. */
  communityId?: string;
  /** Feed of a group — sent as `loop_ids` on `/goservices/feed/v1/home`. */
  groupId?: string;
  /**
   * Static posts. When given, no API call is made (stories / tests / server-fetched data).
   */
  posts?: PostDetailsType[];
  /** Set `false` to hold the fetch (e.g. until visible). @default true */
  enabled?: boolean;
};

export type VideoFeedProps = Omit<ComponentProps<"section">, "children"> &
  VideoFeedSourceProps & {
    /** Move to the next video when the current one ends. @default true */
    autoAdvance?: boolean;
    /** Wrap to the first video after the last one (only when `autoAdvance`). @default false */
    loop?: boolean;
    /** Show the mute / play-pause / expand cluster. @default true */
    showControls?: boolean;
    /** Show the bottom "date • duration • description" line. @default true */
    showMeta?: boolean;
    /** Tile width in px (or any CSS width). Defaults to 688 on desktop/tablet, 382 on mobile. */
    width?: number | string;
    /** Tile height in px (or any CSS height). Defaults to 387 on desktop/tablet, 215 on mobile. */
    height?: number | string;
    /**
     * Controlled active video. When it changes to a video present in the feed, the
     * feed scrolls to that video — lets a sibling (e.g. a link list) drive playback.
     */
    activeVideoId?: string;
    /** Called whenever the active (playing) video changes. */
    onActiveVideoChange?: (post: PostDetailsType, index: number) => void;
    /** Called when the expanded (full-view) state toggles. */
    onExpandChange?: (expanded: boolean) => void;
  };

/** Result of `resolveVideoFeedQuery` — the `useFeed` call derived from the source props. */
export type VideoFeedQuery = {
  feedType: FeedType;
  options: {
    isInIframe: boolean;
    videoIds?: string[];
    communityIds?: string[];
    groupIds?: string[];
    initialVideoIds?: string[];
  };
  /** False when no id was given — nothing to fetch. */
  hasSource: boolean;
};

/** What the data layer hands to the feed + expand view. */
export type VideoFeedData = {
  posts: PostDetailsType[];
  /** React Query key of the underlying feed — hand it to `FeedView` so optimistic updates hit the same cache. */
  queryKey: QueryKey;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  totalVideos?: number;
  pageSession?: string | null;
};

/** Props of one `VideoFeedSlide`. */
export type VideoFeedSlideProps = {
  post: PostDetailsType;
  index: number;
  isActive: boolean;
  /** Render the player only for slides near the viewport (active ± 1). */
  shouldRender: boolean;
  totalVideos: number;
  activeIndex: number;
  size: { width: number; height: number };
  showControls: boolean;
  showMeta: boolean;
  /** Loop this single video instead of advancing (only meaningful when it is the sole video). */
  loopSelf: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  /** Player finished its iteration → parent decides whether to advance. */
  onIterationEnd: () => void;
};

/** Props of `VideoFeedExpandView`. */
export type VideoFeedExpandViewProps = {
  data: VideoFeedData;
  /** Slide to open on. */
  startIndex: number;
  onClose: () => void;
  /** Keeps the inline feed in sync while the user scrolls the expanded feed. */
  onActiveIndexChange?: (index: number) => void;
};
