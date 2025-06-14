import { type QueryKey } from "@tanstack/react-query";

import type { FeedType } from "@genuin/components/types/post";

import { baseQueryKey } from "./base";

/**
 * This function generates a unique query key for the feed based on the feed type.
 * @param feedType
 * @returns
 */
export function getQueryKeyForFeed(feedType: FeedType): QueryKey {
  return [...baseQueryKey, "feed", feedType];
}

/**
 * This function generates a unique query key for the group feed based on the group slug.
 * @param slug
 * @returns
 */
export function getQueryKeyForGroupFeed(slug: string): QueryKey {
  return [...baseQueryKey, "group-feed", slug];
}
