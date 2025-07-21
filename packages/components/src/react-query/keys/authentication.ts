import { QueryKey } from "@tanstack/react-query";
import { baseQueryKey } from "./base";

/**
 * Generates a query key array for fetching brand guidelines using React Query.
 *
 * This key is used with `useQuery` or `useMutation` to uniquely identify and cache
 * the guidelines data fetched from the backend. It combines the base query key with
 * the "guidelines" identifier and optional brandId.
 *
 * @param brandId - The unique identifier of the brand. If undefined, uses "default"
 * @returns {Array<string>} The query key array for guidelines
 */
export function getQueryKeyForGuidelines(brandId: number): QueryKey {
  return [...baseQueryKey, "guidelines", brandId];
}

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
export function getQueryKeyForCategories(): QueryKey {
  return [...baseQueryKey, "categories"];
}

/**
 * Generates a query key array for fetching interests using React Query.
 *
 * This key is used with `useQuery` to uniquely identify and cache the interests data
 * fetched from the backend. It combines the base query key with the "interests" identifier.
 *
 * @returns {Array<string>} The query key array for interests.
 *
 * @example
 * const queryKey = getQueryKeyForInterests();
 * // Use with useQuery:
 * const { data } = useQuery(queryKey, fetchInterests);
 */

export function getQueryKeyForInterests(): QueryKey {
  return [...baseQueryKey, "interests"];
}
