export interface VideoStatisticsParams {
  post_ids: string[];
}

export interface VideoStats {
  no_of_shares: number;
  no_of_views: number;
  no_of_sparks: number;
  no_of_comments: number;
}

export interface VideoStatisticsApiResponse {
  code: number;
  message: string;
  data: Record<string, VideoStats>;
}

export interface VideoStatisticsResponse {
  data: Record<string, VideoStats>;
}

export function validateVideoStatisticsResponse(apiResponse: any): VideoStatisticsResponse {
  if (!apiResponse || typeof apiResponse !== "object") {
    throw new Error("Invalid response data");
  }

  if (apiResponse.code !== 200) {
    throw new Error(`API error: ${apiResponse.message || "Unknown error"}`);
  }

  if (!apiResponse.data || typeof apiResponse.data !== "object") {
    throw new Error("Invalid response data structure");
  }

  return {
    data: apiResponse.data,
  };
}
