import { baseQueryKey } from "./base";

/**
 * Generates a query key for fetching community details.
 * @returns
 */
export function getQueryKeyForCommunityDetails(slug: string) {
  return [...baseQueryKey, "community", "details", slug];
}
