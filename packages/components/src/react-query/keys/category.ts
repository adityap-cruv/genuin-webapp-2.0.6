import { baseQueryKey } from "./base";

/**
 * Generates a query key array for fetching categories using React Query.
 *
 * This key is used with `useQuery` to uniquely identify and cache the categories data
 * fetched from the backend. It combines the base query key with the "categories" identifier.
 *
 * @returns {Array<string>} The query key array for categories.
 *
 * @example
 * const queryKey = getQueryKeyForCategories();
 * // Use with useQuery:
 * const { data } = useQuery(queryKey, fetchCategories);
 */
export function getQueryKeyForCategories() {
  return [...baseQueryKey, "categories"];
}
