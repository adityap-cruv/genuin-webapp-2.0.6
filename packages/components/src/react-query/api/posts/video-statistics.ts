import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

import { useAxiosInstance } from "@genuin/components/context/axios";
import { API_PATHS } from "@genuin/components/react-query/paths";

import { getQueryKeyForVideoStatistics } from "../../keys/video";

import type { VideoStatisticsParams, VideoStatisticsResponse } from "./video-statistics-types";
import { validateVideoStatisticsResponse } from "./video-statistics-types";

export async function fetchVideoStatistics(
  params: VideoStatisticsParams,
  axiosInstance: AxiosInstance
): Promise<VideoStatisticsResponse> {
  try {
    // Build query params with array syntax: post_ids[]=id1&post_ids[]=id2
    const queryParams = new URLSearchParams();
    params.post_ids.forEach((postId) => {
      queryParams.append("post_ids[]", postId);
    });

    const response = await axiosInstance.get(API_PATHS.VIDEO_STATISTICS, {
      params: queryParams,
      paramsSerializer: () => queryParams.toString(),
    });

    return validateVideoStatisticsResponse(response?.data);
  } catch (error: any) {
    throw new Error("Something went wrong while fetching video statistics!");
  }
}

export function useVideoStatistics(params: VideoStatisticsParams) {
  const axiosInstance = useAxiosInstance();

  return useQuery({
    queryKey: getQueryKeyForVideoStatistics(params.post_ids),
    queryFn: (context) => fetchVideoStatistics(params, axiosInstance),
    enabled: params.post_ids.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
