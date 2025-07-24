import { NOT_FOUND_ERROR_CODES } from "@genuin/components/lib/constants/errors";
import { axiosInstance } from "@genuin/components/react-query/axios-instance";
import { fetchLoopDetails } from "@genuin/components/react-query/api/group/details";
import { API_PATHS } from "@genuin/components/react-query/paths";
import { PostDetailsType } from "../feed/schema";
import { getQueryKeyForVideoDetails } from "../../keys/video";
import { useQuery } from "@tanstack/react-query";
import { tryJsonParse } from "@genuin/ui/lib/utils";
import { parseVideo } from "./parser";

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
  console.log("metadata in getVideoDetails::", metadata);
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
      membersCount: null,
      groupsCount: null,
      postsCount: null,
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
    enabled: !!slug,
  });

  // Extract video from nested structure for easier access
  const data = query.data?.pages[0]?.feed[0];

  return {
    ...query,
    data,
  };
}
