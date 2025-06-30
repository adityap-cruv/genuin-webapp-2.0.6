import { baseQueryKey } from "./base";

export function getQueryKeyForComments(videoId: string) {
  return [...baseQueryKey, "videos", "comments", videoId];
}

export function getQueryKeyForMentions(chatId: string, queryString: string) {
  return [...baseQueryKey, 'mentions', chatId, queryString];
}