/**
 * Returns query key for video comments.
 * @param videoId
 * @returns
 */
export function getQueryKeyForVideoComments(videoId: string) {
  return [videoId, 'comments']
}
