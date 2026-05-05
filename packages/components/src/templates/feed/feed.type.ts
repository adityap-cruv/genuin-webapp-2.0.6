"use client";
import type { QueryKey } from "@tanstack/react-query";
import { type ComponentProps } from "react";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import type { FeedType } from "@genuin/components/types/post";

import "swiper/css";

/**
 * Feed data structure containing videos and pagination state
 * @interface FeedData
 */
export type FeedData = {
  /**
   * Query key for the feed data.
   */
  queryKey: QueryKey;
  /** Array of video posts to display */
  videos: PostDetailsType[];
  /** Whether the feed is currently loading */
  isLoading: boolean;
  /** Whether there are more pages available */
  hasNextPage: boolean;
  /** Whether the next page is currently being fetched */
  isFetchingNextPage: boolean;
  /** Function to fetch the next page of videos */
  fetchNextPage: () => void;
  /**
   * Total videos in feed.
   */
  totalVideos?: number;
  /**
   * Feed-session identifier from the first page of the feed API response.
   * Threaded down to analytics events as `page_session`.
   */
  pageSession?: string | null;
};

type BaseFeedPropsType = {
  /**
   * Enable expand view for the feed.
   * This will allow the user to expand the feed to full screen.
   * @default true
   */
  enableExpandView?: boolean;
  /**
   * Whether to show the expand view by default.
   */
  defaultExpandView?: boolean;
  /**
   * Callback function to handle when the expand view is closed.
   */
  onCloseExpandView?: () => void;
  /**
   * The index of the first video to display in the feed.
   */
  startIndex?: number;
};

/**
 * Props for FeedWithData component
 * @interface FeedWithDataPropsType
 */
type FeedWithDataPropsType = {
  /** Type of feed to display (HOME, POPULAR, LATEST) */
  feedType: FeedType;
  isSectioned?: boolean;
} & BaseFeedPropsType &
  ComponentProps<"div">;

/**
 * Props for FeedView component
 * @interface FeedViewPropsType
 */
type FeedViewPropsType = {
  /** Feed data containing videos and state */
  feedData: FeedData;
  /**
   * Feed variant to use for styling and layout.
   * - "page": Full page feed layout
   * - "expand": Expandable feed layout that can be toggled
   * @default "page"
   */
  variant?: "page" | "expand";
  /**
   * Embed options for the feed.
   */
  embedOptions?: {
    /**
     * Which actions of the video-slide to show.
     */
    actions?: {
      comments?: boolean;
      share?: boolean;
      reaction?: boolean;
      repost?: boolean;
    };
  };

  /**
   * A flag to indicate if you want to disable the native fullscreen API.
   */
  disableNativeFullscreenApi?: boolean;
  /**
   * Callback function to handle when the active index changes.
   * @param index - The index of the active video in the feed.
   * @returns
   */
  onActiveIndexChange?: (index: number) => void;
  isSectioned?: boolean;
  isInIframe?: boolean;
  /**
   * Which platform is rendering the feed.
   * Controls ad-injection behaviour: in sdk mode ads are only injected when expand view is open.
   * @default "webapp"
   */
  platform?: "webapp" | "sdk";
} & BaseFeedPropsType &
  ComponentProps<"div">;

export type { FeedWithDataPropsType, FeedViewPropsType };
