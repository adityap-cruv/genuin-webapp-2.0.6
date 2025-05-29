import type { QueryKey } from "@tanstack/react-query";

/**
 * This function returns a QueryKey for fetching community feed.
 * @param slug
 * @returns
 */
export function getQueryKeyForLoopDetails(slug: string): QueryKey {
  return ["group", "details", slug];
}
