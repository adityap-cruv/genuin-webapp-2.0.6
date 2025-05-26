import { type QueryKey } from "@tanstack/react-query";

import type { FeedType } from "src/types/post";

import { baseQueryKey } from "./base";

/**
 * This function generates a unique query key for the feed based on the feed type.
 * @param feedType
 * @returns
 */
export function getQueryKeyForFeed(feedType: FeedType): QueryKey {
  return [...baseQueryKey, "feed", feedType];
}
