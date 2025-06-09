import { baseQueryKey } from "./base";

/**
 * Generates a query key for fetching community details.
 * @returns
 */
export function getQueryKeyForCommunityDetails(slug: string) {
  return [...baseQueryKey, "community", "details", slug];
}

/**
 * Generates a query key for fetching community groups.
 * @param slug
 * @returns
 */
export function getQueryKeyForCommunityGroups(slug: string) {
  return [...baseQueryKey, "community", "groups", slug];
}

/**
 * Generates a query key for fetching community members.
 * @param slug
 * @returns
 */
export function getQueryKeyForCommunityMembers(slug: string) {
  return [...baseQueryKey, "community", "members", slug];
}

/**
 * Generates a query key for fetching community feed.
 * @param slug
 * @returns
 */
export function getQueryKeyForCommunityFeed(slug: string, videoId: string) {
  return [...baseQueryKey, "community", "feed", slug, videoId];
}
