import { useDebounceValue } from "usehooks-ts";

import { useLocations } from "@genuin/components/react-query/api/locations/locations";

export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
} as const;

type LocationDebounceParams = {
  query: string;
  latitude?: number;
  longitude?: number;
};

/**
 * Custom hook for debounced search locations
 * @param query - The search query string
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Object containing locations, loading state, and error
 */
export function useDebouncedLocations(
  { query, latitude, longitude }: LocationDebounceParams,
  debounceMs: number = SEARCH_CONFIG.DEBOUNCE_DELAY
) {
  const [debouncedQuery] = useDebounceValue(query, debounceMs);

  // Only make API call if query has meaningful content
  const shouldFetch = debouncedQuery.trim().length >= SEARCH_CONFIG.MIN_QUERY_LENGTH;

  const locationsQuery = useLocations({
    query: shouldFetch ? debouncedQuery : "",
    latitude,
    longitude,
  });

  // Check if currently debouncing by comparing original query with debounced query
  const isDebouncing = query !== debouncedQuery;

  return {
    locations: locationsQuery.data || [],
    isLoading: shouldFetch ? isDebouncing || locationsQuery.isLoading : false,
    error: locationsQuery.error,
    isDebouncing,
    refetch: locationsQuery.refetch,
  };
}
