import type { QueryKey } from "@tanstack/react-query";

import { baseQueryKey } from "./base";

/**
 * This function returns a QueryKey for fetching community feed.
 * @param slug - The slug of the group for which the details is being fetched.
 * @returns
 */
export function getQueryKeyForLoopDetails(slug: string): QueryKey {
  return [...baseQueryKey, "group", "details", slug];
}

/**
 * This function returns a QueryKey for fetching group members.
 * @param slug - The slug of the group for which members are being fetched.
 * @returns
 */
export function getQueryKeyForGroupMembers(slug: string): QueryKey {
  return [...baseQueryKey, "group", "members", slug];
}
