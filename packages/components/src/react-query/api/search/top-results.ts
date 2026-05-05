import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { getQueryKeyForTopResults } from "../../keys/search";

import type { TopResultsResponseType } from "./types";
import { validateTopResultsResponse } from "./types";

export async function fetchTopResults(query: string, axiosInstance: AxiosInstance): Promise<TopResultsResponseType> {
  try {
    const response = await axiosInstance.get(API_PATHS.SEARCH_TOP_RESULTS, {
      params: { query_string: query },
    });

    const validatedData = validateTopResultsResponse(response.data.data);

    return validatedData;
  } catch (_error) {
    throw new Error("Something went wrong in top results API.");
  }
}

export function useTopResults(query: string) {
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: getQueryKeyForTopResults(query),
    queryFn: (_context) => fetchTopResults(query, axiosInstance),
    enabled: query.trim().length >= 2, // Only fetch when query has meaningful content
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
