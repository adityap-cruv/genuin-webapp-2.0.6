import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { TopResultsResponseType, validateTopResultsResponse } from "./types";
import { getQueryKeyForTopResults } from "../../keys/search";

export async function fetchTopResults(
  query: string
): Promise<TopResultsResponseType> {
  try {
    const response = await axiosInstance.get(API_PATHS.SEARCH_TOP_RESULTS, {
      params: { query_string: query },
    });

    const validatedData = validateTopResultsResponse(response.data.data);

    return validatedData;
  } catch (error) {
    throw new Error("Something went wrong in top results API.");
  }
}

export function useTopResults(query: string) {
  return useQuery({
    queryKey: getQueryKeyForTopResults(query),
    queryFn: () => fetchTopResults(query),
    enabled: query.trim().length >= 2, // Only fetch when query has meaningful content
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
