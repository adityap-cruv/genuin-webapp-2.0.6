import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { fetchLoopDetails } from "@genuin/components/react-query/api/group/details";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { PostDetailsType } from "../feed/schema";
import { getQueryKeyForVideoDetails } from "../../keys/video";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { tryJsonParse } from "@genuin/ui/lib/utils";
import { parseVideo } from "./parser";
import { queryClient } from "@genuin/components/react-query/client";

async function fetchVideoMetadata(videoSlug: string) {
  return await axiosInstance
    .get(API_PATHS.VIDEO_META_DATA, {
      params: {
        type: 4,
        slug: videoSlug,
      },
    })
    .then((res) => {
      return res.data.data;
    })
    .catch((e) => {
      console.log("error in deep_link/meta_data::", e.response.data);
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.video) {
        throw new Error(e.response.data.code);
      }
    });
}

async function getVideoDetails(slug: string): Promise<PostDetailsType> {
  const metadata = await fetchVideoMetadata(slug);
  if (!metadata?.chat_id) {
    throw new Error(`Invalid metadata for slug: ${slug}`);
  }
  const [loopDetails, videoDetails] = await Promise.all([
    fetchLoopDetails(undefined, metadata.chat_id),
    fetchLoopVideo(metadata.chat_id, metadata.message_id),
  ]);

  if (!loopDetails || !videoDetails) {
    throw new Error("Failed to fetch loop details or video details.");
  }
  return {
    video: {
      id: videoDetails.message_id ?? loopDetails.id ?? null,
      clickableUrl: videoDetails.clickable_url ?? null,
      slug: videoDetails.slug ?? loopDetails.slug ?? null,
      createdAt: videoDetails.message_at ?? -1,
      commentCount: videoDetails.no_of_comments ?? 0,
      shareUrl: videoDetails.share_url ?? loopDetails.shareUrl ?? "",
      attachedLink: videoDetails.attached_link ?? null,
      source: videoDetails.media_url,
      isSparked: videoDetails.is_sparked ?? false,
      sparkCount: videoDetails.no_of_sparks ?? 0,
      thumbnail: videoDetails.thumbnail_url ?? "",
      thumbnailM: videoDetails.thumbnail_url_m ?? null,
      description: videoDetails.description_data
        ? tryJsonParse(videoDetails.description_data)
        : null,
      linkouts: null, // Map if available
      isPinned: videoDetails.is_pinned ?? false,
      thumbnailSprite: null, // Map if available
      viewCount: videoDetails.no_of_views ?? 0,
    },
    group: {
      slug: loopDetails.slug,
      name: loopDetails.name ?? null,
      id: loopDetails.id,
      isSubscribed: loopDetails.isSubscriber ?? false,
      description: loopDetails.description ?? "",
      shareUrl: loopDetails.shareUrl ?? "",
      isPrivate: loopDetails.isPrivate ?? false,
      role: loopDetails.role,
    },
    community: {
      profileImage:
        loopDetails.community.dpM ?? loopDetails.community.dp ?? null,
      name: loopDetails.community.name ?? null,
      slug: loopDetails.community.slug,
      handle: loopDetails.community.handle,
      id: loopDetails.community.id,
      isPrivate: loopDetails.community.type === 2,
      shareUrl: loopDetails.community.shareUrl ?? "",
      userRole: "UNJOINED",
      membersCount: loopDetails.noOfMembers,
      groupsCount: null,
      postsCount: loopDetails.noOfVideos,
      brand: loopDetails.community.brand
        ? {
            slug: loopDetails.community.brand.slug,
            name: loopDetails.community.brand.name ?? "",
            id: loopDetails.community.brand.id,
            logo: loopDetails.community.brand.logo ?? null,
            webLogo: loopDetails.community.brand.webLogo ?? null,
            handle: loopDetails.community.brand.handle ?? "",
          }
        : undefined,
    },
    owner: {
      isAvatar: videoDetails.owner.is_avatar,
      profileImage: videoDetails.owner.profile_image,
      userName: videoDetails.owner.username,
      name: videoDetails.owner.name ?? null,
      brand: videoDetails.owner.brand
        ? {
            id: videoDetails.owner.brand?.id,
            slug: videoDetails.owner.brand?.slug,
            userLogo: videoDetails.owner.brand?.userLogo,
          }
        : undefined,
    },
  };
}

async function fetchLoopVideo(loopId: string, videoId: string) {
  return await axiosInstance
    .get(API_PATHS.LOOP_VIDEO, {
      params: {
        chat_id: loopId,
        from_message_id: videoId,
      },
    })
    .then((res) => {
      return parseVideo(res.data.data.messages[0]);
    })
    .catch((e) => {
      console.log("error in conversation messages::", e);
      throw new Error("Something went wrong in conversation messages.");
    });
}

/**
 * Hook to fetch video details in a format compatible with feed data structure.
 * This ensures that feed-related functions work with single video pages.
 *
 * @param slug - The slug of the video to fetch details for.
 * @returns The video data in a structure matching useFeed's return value
 */
export function useGetVideoDetailsAsFeed(slug: string) {
  const query = useQuery({
    queryKey: getQueryKeyForVideoDetails(slug),
    queryFn: async () => {
      // Only fetch if slug is non-empty
      if (!slug) {
        throw new Error("Slug is required to fetch video details");
      }
      const video = await getVideoDetails(slug);
      return {
        pages: [
          {
            feed: [video],
            pageSession: null,
            endOfFeed: true,
          },
        ],
        pageParams: [null],
      };
    },
    // Don't run the query if slug is empty
    enabled: !!slug && slug !== "",
    retry: 1,
  });

  // Extract video from nested structure for easier access
  const data = query.data?.pages[0]?.feed[0];

  return {
    ...query,
    data,
  };
}

// Type definition for the structure of video details stored in the query cache
type VideoDetailsData = {
  pages: {
    feed: PostDetailsType[];
  }[];
  pageParams: any[];
};

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
  queryClient.setQueryData<VideoDetailsData>(queryKey, (oldData) => {
    // Validate that the cached data exists and contains at least one page with at least one feed item
    if (
      !oldData ||
      !oldData.pages.length ||
      (oldData.pages[0] && !oldData.pages[0].feed.length)
    ) {
      return oldData;
    }

    // Create a new data structure with the updated reaction state
    const updatedData = {
      ...oldData,
      pages: oldData.pages.map((page, pageIndex) => {
        // Only update the first page
        if (pageIndex !== 0) return page;

        return {
          ...page,
          feed: page.feed.map((feedItem, feedIndex) => {
            // Only update the first feed item
            if (feedIndex !== 0) return feedItem;

            return {
              ...feedItem,
              video: {
                ...feedItem.video,
                isSparked: isReacted,
                sparkCount: isReacted
                  ? (feedItem.video.sparkCount ?? 0) + 1
                  : feedItem.video.sparkCount > 0
                    ? feedItem.video.sparkCount - 1
                    : 0,
              },
            };
          }),
        };
      }),
    };

    return updatedData;
  });
}

