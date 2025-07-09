import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { validateSuggestionsResponse } from "./types";
import { getQueryKeyForSuggestions } from "../../keys/search";

export async function fetchSuggestions(query: string) {
  try {
    const response = await axiosInstance.get(API_PATHS.SEARCH_SUGGESTIONS, {
      params: { query_string: query },
    });
    return validateSuggestionsResponse(response?.data?.data);
  } catch (error: any) {
    throw new Error("Something went wrong with search suggestions!");
  }
}

export function useSuggestions(query: string) {
  return useQuery({
    queryKey: getQueryKeyForSuggestions(query),
    queryFn: () => fetchSuggestions(query),
    enabled: query.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
