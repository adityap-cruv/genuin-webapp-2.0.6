import { type QueryKey } from "@tanstack/react-query";

import { baseQueryKey } from "./base";

/**
 * This function generates a unique query key for the search suggestion.
 * @param query
 * @returns
 */
export function getQueryKeyForSuggestions(query: string): QueryKey {
  return [...baseQueryKey, "search", "suggestion", query];
}

/**
 * This function generates a unique query key for the search top results.
 * @param query
 * @returns
 */
export function getQueryKeyForTopResults(query: string): QueryKey {
  return [...baseQueryKey, "search", "top-results", query];
}

/**
 * This function generates a unique query key for the recent searches.
 * @returns
 */
export function getQueryKeyForRecents(): QueryKey {
  return [...baseQueryKey, "search", "recents"];
}
