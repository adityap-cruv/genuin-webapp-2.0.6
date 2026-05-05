import type { QueryKey } from "@tanstack/react-query";

import { baseQueryKey } from "./base";

/**
 * This function generates a unique query key for the group feed based on the group slug.
 * @param linkoutId
 * @returns
 */
export function getQueryKeyForLinkouts(linkoutId?: number | null): QueryKey {
  return [...baseQueryKey, "linkouts", linkoutId];
}
