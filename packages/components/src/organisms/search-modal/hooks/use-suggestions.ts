import { useDebounceValue } from "usehooks-ts";
import { useSuggestions } from "@genuin/components/react-query/api/search";
import { SEARCH_CONFIG } from "../constants";

/**
 * Custom hook for debounced search suggestions
 * @param query - The search query string
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Object containing suggestions, loading state, and error
 */
export function useDebouncedSuggestions(
  query: string,
  debounceMs: number = SEARCH_CONFIG.DEBOUNCE_DELAY
) {
  const [debouncedQuery] = useDebounceValue(query, debounceMs);

  // Only make API call if query has meaningful content
  const shouldFetch =
    debouncedQuery.trim().length >= SEARCH_CONFIG.MIN_QUERY_LENGTH;

  const suggestionsQuery = useSuggestions(shouldFetch ? debouncedQuery : "");

  // Check if currently debouncing by comparing original query with debounced query
  const isDebouncing = query !== debouncedQuery;

  return {
    suggestions: suggestionsQuery.data || [],
    isLoading: shouldFetch ? isDebouncing || suggestionsQuery.isLoading : false,
    error: suggestionsQuery.error,
    isDebouncing,
    refetch: suggestionsQuery.refetch,
  };
}
