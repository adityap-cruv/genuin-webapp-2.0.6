import { baseQueryKey } from "./base";

export function getQueryKeyForComments(videoId: string) {
  return [...baseQueryKey, "videos", "comments", videoId];
}
