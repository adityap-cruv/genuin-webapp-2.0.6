import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { PostDetailsType } from "../feed/schema";
import { getQueryKeyForVideoDetails } from "../../keys/video";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { queryClient } from "@genuin/components/react-query/client";
import { parseFeed } from "../feed/parser";
import { isUuid } from "@genuin/components/lib/utils";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";

async function fetchVideoDetails(slug: string, embedId?: string, placementId?: string,shouldShowMiddlewareOverlay?:boolean) {
  try {
    const response = await axiosInstance.get(API_PATHS.VIDEO_DETAILS, {
      params: {
        ...(isUuid(slug) ? { uuid: slug } : { slug }),
        ...(embedId && { embed_id: embedId }),
        ...(placementId && { placement_id: placementId }),
      },
    });
    const feeds = response.data?.data?.feeds;
    if (!feeds || feeds.length === 0) {
      // Emit SDK video not found event when no feeds are returned
      SDKEventEmitter.emit(SDKEventName.VIDEO_NOT_FOUND, {
        slug,
        errorCode: "NO_FEEDS_RETURNED",
      });

      return [];
    }
    return parseFeed(feeds,shouldShowMiddlewareOverlay);
  } catch (e: any) {
    if (e.response?.data?.code === NOT_FOUND_ERROR_CODES.video) {
      // Emit SDK video not found event
      SDKEventEmitter.emit(SDKEventName.VIDEO_NOT_FOUND, {
        slug,
        errorCode: e.response.data.code,
      });
      throw new Error(e.response.data.code);
    }
    // Re-throw other errors
    throw e;
  }
}

/**
 * Hook to fetch video details in a format compatible with feed data structure.
 * This ensures that feed-related functions work with single video pages.
 *
 * @param slug - The slug of the video to fetch details for.
 * @returns The video data in a structure matching useFeed's return value
 */
export function useGetVideoDetailsAsFeed(slug: string, embedId?: string, placementId?: string,shouldShowMiddlewareOverlay? : boolean) {
  return useQuery({
    queryKey: getQueryKeyForVideoDetails(slug),
    queryFn: async () => {
      // Only fetch if slug is non-empty
      if (!slug) {
        throw new Error("Slug is required to fetch video details");
      }
      return await fetchVideoDetails(slug, embedId, placementId,shouldShowMiddlewareOverlay);
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
