import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import {
  validatePaginatedPostsResponse,
  PaginatedPostsParams,
  PaginatedPostsResponse,
} from "./types";
import { getQueryKeyForPaginatedPosts } from "../../keys/video";

export async function fetchPaginatedPosts(
  params: PaginatedPostsParams = {}
): Promise<PaginatedPostsResponse> {
  try {
    const queryParams = {
      limit: params.limit || 10,
      page_no: params.page || 1,
      ...(params.query_string && { query_string: params.query_string }),
      ...(params.status !== undefined && { status: params.status }),
      ...(params.sort_dir && { sort_dir: params.sort_dir }),
    };

    const response = await axiosInstance.get(API_PATHS.PAGINATED_POSTS, {
      params: queryParams,
    });

    return validatePaginatedPostsResponse(response?.data, params);
  } catch (error: any) {
    throw new Error("Something went wrong while fetching posts!");
  }
}

export function usePaginatedPosts(params: PaginatedPostsParams = {}) {
  return useQuery({
    queryKey: getQueryKeyForPaginatedPosts(params),
    queryFn: () => fetchPaginatedPosts(params),
  });
}
