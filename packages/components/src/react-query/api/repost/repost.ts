import { axiosInstance } from "@react-query/axios-instance";
import { validateRepostCommunityListData } from "./schema";
import { API_PATHS } from "@react-query/paths";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQueryKeyForRepostDestinations } from "@react-query/keys/repost";

/**
 * Fetch repost destinations for a given video ID.
 * This function retrieves a list of communities where a video can be reposted.
 * @returns
 */
async function fetchRepostDestinations(videoId: string) {
  return await axiosInstance
    .get(API_PATHS.REPOST_DESTINATIONS, {
      params: { source_video_id: videoId, content_type: 2 },
    })
    .then((res) => {
      return validateRepostCommunityListData(res.data.data.communities);
    })
    .catch((e) => {
      if (e.response.data.code === "5190") return null;
      throw new Error("Something went wrong repost destinations api.");
    });
}

/**
 * Custom hook to get repost destinations for a video.
 */
export function useGetRepostDestinations(videoId: string) {
  return useQuery({
    queryKey: getQueryKeyForRepostDestinations(videoId),
    queryFn: () => fetchRepostDestinations(videoId),
  });
}

/**
 *
 * @param destinationId chat id of loop
 * @param sourceVideoId source video id (self)
 */
async function repostVideo({
  destinationId,
  sourceVideoId,
}: {
  destinationId: string;
  sourceVideoId: string;
}) {
  return await axiosInstance
    .post(API_PATHS.REPOST_VIDEO, {
      chat_id: destinationId,
      source_video_id: sourceVideoId,
      content_type: 2,
    })
    .then((res) => {
      if (res.data.code === 200) return true;
      throw new Error("Something went wrong reposting video.");
    })
    .catch((e) => {
      throw new Error("Something went wrong reposting video.");
    });
}

/**
 * Custom hook to repost a video to a destination.
 * @param destinationId The ID of the destination (community or chat).
 * @param sourceVideoId The ID of the video being reposted.
 */
export function useRepostVideoMutation({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: () => void;
}) {
  return useMutation({
    mutationFn: repostVideo,
    onSuccess,
    onError,
  });
}
