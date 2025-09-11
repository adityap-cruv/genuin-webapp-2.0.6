import { baseQueryKey } from "./base";
import { PaginatedPostsParams } from "../api/posts/types";

/**
 * Generates a query key for fetching video details.
 * @param videoId - The ID of the video for which to generate the query key
 * @returns
 */
export function getQueryKeyForVideoDetails(videoId: string) {
  return [...baseQueryKey, "video", videoId];
}

/**
 * Generates a query key for fetching paginated posts.
 * @param params - The parameters for the paginated posts query
 * @returns
 */
export function getQueryKeyForPaginatedPosts(params: PaginatedPostsParams) {
  return [...baseQueryKey, "posts", "paginated", params];
}

/**
 * Generates a query key for fetching video statistics.
 * @param postIds - Array of post IDs for which to generate the query key
 * @returns
 */
export function getQueryKeyForVideoStatistics(postIds: string[]) {
  return [...baseQueryKey, "video", "statistics", postIds.sort().join(",")];
}
