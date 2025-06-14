import { QueryKey } from "@tanstack/react-query";
import { baseQueryKey } from "./base";

/**
 * Get the query key for repost destinations.
 * @returns QueryKey for repost destinations
 */
export function getQueryKeyForRepostDestinations(videoId: string): QueryKey {
  return [...baseQueryKey, "repostDestinations", videoId];
}
