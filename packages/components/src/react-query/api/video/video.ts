import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { PostDetailsType } from "../feed/schema";
import { getQueryKeyForVideoDetails } from "../../keys/video";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { queryClient } from "@genuin/components/react-query/client";
import { parseFeed } from "../feed/parser";

async function fetchVideoDetails(slug: string, embedId?: string) {
  try {
    const response = await axiosInstance.get(API_PATHS.VIDEO_DETAILS, {
      params: {
        slug,
        embed_id: embedId,
      },
    });
    return parseFeed(response.data?.data?.feeds);
  } catch (e: any) {
    if (e.response?.data?.code === NOT_FOUND_ERROR_CODES.video) {
      throw new Error(e.response.data.code);
    }
  }
}

/**
 * Hook to fetch video details in a format compatible with feed data structure.
 * This ensures that feed-related functions work with single video pages.
 *
 * @param slug - The slug of the video to fetch details for.
 * @returns The video data in a structure matching useFeed's return value
 */
export function useGetVideoDetailsAsFeed(slug: string, embedId?: string) {
  return useQuery({
    queryKey: getQueryKeyForVideoDetails(slug),
    queryFn: async () => {
      // Only fetch if slug is non-empty
      if (!slug) {
        throw new Error("Slug is required to fetch video details");
      }
      return await fetchVideoDetails(slug, embedId);
    },
    // Don't run the query if slug is empty
    enabled: !!slug && slug !== "",
    retry: 1,
  });
}

/**
 * Updates the video reaction state (spark/un-spark) for a single video in the video details cache.
 *
 * This is used when displaying a single video page (like when a video is opened via a startVideoSlug),
 * where the video details are cached in the same structure as the feed data.
 * It ensures that reaction-related updates (isSparked and sparkCount) are reflected correctly in the cache.
 *
 * @param queryKey - The query key associated with this video's details in the cache.
 * @param isReacted - The new reaction state (true if reacted/sparked, false if un-reacted/unsparked).
 */
export function setQueryDataForVideoDetails({
  queryKey,
  isReacted,
}: {
  queryKey: QueryKey;
  isReacted: boolean;
}) {
  queryClient.setQueryData<PostDetailsType[]>(queryKey, (oldData) => {
    if (!oldData?.[0]?.video) {
      // Nothing to update
      return oldData;
    }
    const firstVideo = oldData[0].video;

    // Return updated data with first video's reaction updated
    return [
      {
        ...oldData[0],
        video: {
          ...firstVideo,
          isSparked: isReacted,
          sparkCount: isReacted
            ? (firstVideo.sparkCount ?? 0) + 1
            : Math.max((firstVideo.sparkCount ?? 0) - 1, 0),
        },
      },
    ];
  });
}
