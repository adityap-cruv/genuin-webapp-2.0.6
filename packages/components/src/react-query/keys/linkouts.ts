import { QueryKey } from "@tanstack/react-query";

/**
 * This function generates a unique query key for the group feed based on the group slug.
 * @param linkoutId
 * @returns
 */
export function getQueryKeyForLinkouts(linkoutId: number): QueryKey {
  return ["linkouts", linkoutId];
}
