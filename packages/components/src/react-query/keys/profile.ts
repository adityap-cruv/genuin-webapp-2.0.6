import type { QueryKey } from "@tanstack/react-query";

import { baseQueryKey } from "./base";

/**
 * Generates a query key for fetching profile details by username.
 * @param userName - The username for which to get the profile details query key.
 * @returns
 */
export function getQueryKeyForProfileDetails(userName: string): QueryKey {
  return [...baseQueryKey, "profile", "details", userName];
}
