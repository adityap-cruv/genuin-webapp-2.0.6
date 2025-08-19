import { type QueryKey } from "@tanstack/react-query";

import type { FeedType } from "@genuin/components/types/post";

import { baseQueryKey } from "./base";

/**
 * This function generates a unique query key for the feed based on the feed type and options.
 * @param feedType - Type of feed (HOME, LATEST, POPULAR)
 * @param options - Optional filter options for the feed
 * @returns QueryKey array
 */
export function getQueryKeyForFeed(
  feedType: FeedType,
  options?: {
    communityIds?: string[];
    groupIds?: string[];
    isEmbed?: boolean;
  }
): QueryKey {
  return options
    ? [...baseQueryKey, "feed", feedType, options]
    : [...baseQueryKey, "feed", feedType];
}

/**
 * This function generates a unique query key for the group feed based on the group slug.
 * @param slug
 * @returns
 */
export function getQueryKeyForGroupFeed(slug: string): QueryKey {
  return [...baseQueryKey, "group-feed", slug];
}
