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
export function getQueryKeyForGuidelines(brandId: number) {
  return [...baseQueryKey, "guidelines", brandId];
}