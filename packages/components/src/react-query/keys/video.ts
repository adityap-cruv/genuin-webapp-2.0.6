import { baseQueryKey } from "./base";

/**
 * Generates a query key for fetching video details.
 * @param videoId - The ID of the video for which to generate the query key
 * @returns
 */
export function getQueryKeyForVideoDetails(videoId: string) {
  return [...baseQueryKey, "video", videoId];
}
