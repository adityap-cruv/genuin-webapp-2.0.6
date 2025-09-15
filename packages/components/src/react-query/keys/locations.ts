import { baseQueryKey } from "./base";

// /**
//  * This function generates a unique query key for the search locations.
//  * @param query
//  * @returns
//  */
export function getQueryKeyForLocations(query: string) {
  return [...baseQueryKey, "search", "locations", query];
}
