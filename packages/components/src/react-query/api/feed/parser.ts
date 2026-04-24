import type z from "zod";

import {
  mapCommunityUserRole,
  mapGroupJoinStatus,
} from "@genuin/components/lib/utils";

import type { PostDetailsSchema, PostDetailsType } from "./schema";
import type {
  AdsFeedItem,
  FeedResponseFromGoApi,
  VideoFeedItem,
} from "./types";
import { VideoTypes } from "@genuin/components/context";

function isRetinaDisplay(): boolean {
  return typeof window !== "undefined" && window.devicePixelRatio >= 2;
}

function appendImageOps(url: string | null | undefined): string | null {
  if (!url) return null;
  const ops = isRetinaDisplay() ? "?ops=fit(128,128)" : "?ops=fit(64,64)";
  return `${url}${ops}`;
}

// TODO: SCRAP THIS.
function tryJsonParse<T>(data: string | undefined): T | null {
  if (!data) {
    return null;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    // console.error("Failed to parse JSON", e);
    return null;
  }
}

function mapVideoItem(item: VideoFeedItem): z.infer<typeof PostDetailsSchema> {
  return {
    video: {
      id: item.video.uuid,
      type: "video",
      adUrl: item.video.ads_config?.ads_url || undefined,
      adsPlatform: item.video.ads_config?.platform || undefined,
      createdAt: item.video.conversation_at,
      commentCount: item.video.no_of_comments || 0,
      shareUrl: item.video.share_url,
      videoType: getVideoType(item.type, item.video.video_layout_id ?? 0),
      attachedLink: item.video.attached_link || null,
      source: item.video.media_url_m3u8 ?? item.video.media_url,
      isSparked: item.video.is_sparked || false,
      isWatched: false,
      sparkCount: item.video.no_of_sparks || 0,
      thumbnail: item.video.thumbnail_url,
      viewCount: item.video.no_of_views || 0,
      thumbnailM: item.video.thumbnail_url_m || null,
      description:
        (tryJsonParse(item.video.description_data) as any) ??
        item.video.description_text,
      descritptionText: item.video.description_text,
      slug: item.video.slug,
      linkoutId: item.video.linkouts_id || null,
      clickableUrl: item.video.clickable_url || null,
      linkouts: item.video.linkouts || [],
      isPinned: item.video.is_pinned || false,
      thumbnailSprite: item.video.sprite_image_url || null,
      cardLayoutId: item.video.card_layout_id || null,
      videoLayoutId: item.video.video_layout_id || null,
      duration: item.video.duration || null,
      attributes:
        item.video.attributes &&
        item.video.attributes.type &&
        (item.video.attributes.type === "station" ||
          item.video.attributes.type === "podcast")
          ? {
              ...(item.video.attributes as {
                type: "station" | "podcast";
                clip_type?: string | null;
                description?: string | null;
                image_url?: string | null;
                timestamp?: number | null;
                title?: string | null;
                bucket_name?: string | null;
                offer_text?: string | null;
                slug?: string | null;
                episode_id?: string | null;
                podcast_id?: string | null;
                station_id?: string | null;
              }),
              image_url: appendImageOps(item.video.attributes.image_url),
            }
          : null,
      placement_card_layout_id: item.video.placement_card_layout_id || null,
      placement_video_layout_id: item.video.placement_video_layout_id || null,
      placement_card_section_layout_id:
        item.video.placement_card_section_layout_id || null,
    },
    group: {
      id: item.loop.uuid || "",
      slug: item.loop.slug || "",
      description: item.loop.group_description || "",
      shareUrl: item.loop.share_url || undefined,
      name: item.loop.group_name || "",
      isSubscribed: item.loop.is_subscriber || false,
      role: mapGroupJoinStatus(item.loop.request_status),
      isPrivate: isGroupPrivate(
        item.loop.actions,
        item.community.logged_in_user_role,
        item.loop.member_info,
      ),
    },
    community: {
      id: item.community.uuid || "",
      shareUrl: item.community.share_url || "",
      slug: item.community.slug || "",
      handle: item.community.handle || "",
      isPrivate: item.community.type === 2,
      userRole: mapCommunityUserRole(item.community.logged_in_user_role),
      type: item.community.type || null,
      name: item.community.name || null,
      profileImage:
        item.community.dp_s || item.community.dp_m || item.community.dp || null,
      membersCount: item.community.no_of_members || 0,
      groupsCount: item.community.no_of_groups || 0,
      postsCount: item.community.no_of_videos || 0,
      ...(item.community.brand && {
        brand: {
          id: item.community.brand.brand_id,
          name: item.community.brand.name,
          slug: item.community.brand.brand_slug,
          webLogo: item.community.brand.brand_web_logo || null,
          userLogo: item.community.brand.brand_user_logo || null,
          handle: item.community.brand.brand_handle ?? undefined,
        },
      }),
    },
    owner: {
      profileImage:
        item.owner.profile_image_s ??
        item.owner.profile_image_m ??
        item.owner.profile_image,
      isAvatar: item.owner.is_avatar,
      userName: item.owner.username,
      name: item.owner.name || null,
      bio: item.owner.bio || null,
      shareUrl: item.owner.share_url || "",
      brand: item.owner.brand
        ? {
            id: Number(item.owner.brand.brand_id),
            slug: item.owner.brand.brand_slug,
            userLogo: item.owner.brand.brand_user_logo || null,
          }
        : null,
    },
    section: {
      id: item.section?._id || null,
      title: item.section?.title || null,
      description: item.section?.sub_title || null,
      position: item.section?.position || null,
      thumbnail_url: item.section?.thumbnail_url || null,
      cover_url: item.section?.cover_url || null,
      no_of_clips: item.section?.no_of_clips || null,
    },
    sponsored: item.sponsored
      ? {
          id: item.sponsored.id,
          title: item.sponsored.title,
          cpm: item.sponsored.cpm,
        }
      : null,
  };
}

function extractAdTagObject(item: AdsFeedItem) {
  return {
    display_ad: item.display_ad ?? null,
    native_ad: item.native_ad ?? null,
    video_ad: item.video_ad ?? null,
    order: item.order ?? null,
  };
}

function isAdsFeedItem(item: VideoFeedItem | AdsFeedItem): item is AdsFeedItem {
  return item.type === "ads";
}

/**
 * Parses the given response from the Go API into the PostDetailsSchema format.
 * Optionally inserts a special "overlay" type item at the transition point where videos
 * change from unwatched to watched (this transition occurs at most once in the feed).
 *
 * @param data - The response data from the Go API.
 * @param shouldShowMiddlewareOverlay - Flag to enable/disable overlay insertion at watch boundary.
 * @returns Parsed data conforming to PostDetailsSchema with optional overlay inserted at watch boundary.
 */
export function parseFeed(
  data: FeedResponseFromGoApi,
  shouldShowMiddlewareOverlay: boolean = false,
  endOfFeed: boolean = false,
): Array<PostDetailsType> {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const result: Array<PostDetailsType> = [];

  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    if (!item) continue;
    if (item.type === "all_caught_up" && shouldShowMiddlewareOverlay) {
      const mappedItem = {
        video: {
          id: item?.video.uuid + "_overlay",
          type: "overlay",
          video_type: getVideoType(item.type, item.video.video_layout_id ?? 0),
          createdAt: item?.video.conversation_at,
          commentCount: item?.video.no_of_comments || 0,
          shareUrl: item?.video.share_url,
          attachedLink: item?.video.attached_link || null,
          source: item?.video.media_url_m3u8 ?? item?.video.media_url,
          isSparked: item?.video.is_sparked || false,
          isWatched: item?.video.is_watched,
          sparkCount: item?.video.no_of_sparks || 0,
          thumbnail: item?.video.thumbnail_url,
          viewCount: item?.video.no_of_views || 0,
          thumbnailM: item?.video.thumbnail_url_m || null,
          description:
            (tryJsonParse(item?.video.description_data) as any) ??
            item?.video.description_text,
          descritptionText: item?.video.description_text,
          slug: item?.video.slug,
          linkoutId: item?.video.linkouts_id || null,
          clickableUrl: item?.video.clickable_url || null,
          linkouts: item?.video.linkouts || [],
          isPinned: item?.video.is_pinned || false,
          thumbnailSprite: item?.video.sprite_image_url || null,
          cardLayoutId: item?.video.card_layout_id || null,
          videoLayoutId: item?.video.video_layout_id || null,
          duration: item?.video.duration || null,
          attributes:
            item?.video.attributes &&
            item?.video.attributes.type &&
            (item?.video.attributes.type === "station" ||
              item?.video.attributes.type === "podcast")
              ? {
                  ...(item?.video.attributes as {
                    type: "station" | "podcast";
                    clip_type?: string | null;
                    description?: string | null;
                    image_url?: string | null;
                    timestamp?: number | null;
                    title?: string | null;
                    bucket_name?: string | null;
                    offer_text?: string | null;
                    slug?: string | null;
                    episode_id?: string | null;
                    podcast_id?: string | null;
                    station_id?: string | null;
                  }),
                  image_url: appendImageOps(item?.video.attributes.image_url),
                }
              : null,

          placement_card_layout_id:
            item?.video.placement_card_layout_id || null,
          placement_video_layout_id:
            item?.video.placement_video_layout_id || null,
          placement_card_section_layout_id:
            item?.video.placement_card_section_layout_id || null,
        },
        sponsored: item.sponsored
          ? {
              id: item.sponsored.id,
              title: item.sponsored.title,
              cpm: item.sponsored.cpm,
            }
          : null,
      };
      result.push(mappedItem as unknown as PostDetailsType);
    } else if (isAdsFeedItem(item)) {
      const adTagObject = extractAdTagObject(item);
      const houseAdVideo = item.house_ad?.video;
      if (houseAdVideo) {
        houseAdVideo.type = "ads";
        const mapped = mapVideoItem(houseAdVideo);
        result.push({
          type: "ads",
          adTagObject,
          video: mapped.video,
          group: mapped.group,
          community: mapped.community,
          owner: mapped.owner,
          section: mapped.section,
          sponsored: mapped.sponsored,
        } as PostDetailsType);
      } else {
        result.push({ type: "ads", adTagObject } as PostDetailsType);
      }
    } else if (item.type !== "all_caught_up") {
      result.push(mapVideoItem(item));
    }
    // end of feed the caught up overlay
    if (
      endOfFeed &&
      index === data.length - 1 &&
      shouldShowMiddlewareOverlay &&
      !isAdsFeedItem(item)
    ) {
      result.push({
        video: {
          type: "complete",
          video_type: VideoTypes.Content,
          id: item.video.uuid + "_complete",
          videoType: VideoTypes.Content,
          slug: item.video.slug,
        },
      } as unknown as PostDetailsType);
    }
  }
  return result;
}

const getVideoType = (type: string, videoLayoutId: number): VideoTypes => {
  if (type === "ads") {
    return VideoTypes.HouseAd;
  }

  if (videoLayoutId === 6) {
    return VideoTypes.Sponsored;
  }

  return VideoTypes.Content;
};

/**
 * Determines if a user can see group posts based on actions, community role, and membership.
 * Converted from Kotlin implementation.
 *
 * @param actionList - List of actions associated with the group
 * @param communityRole - The user's role in the community (0: none, 1: leader, 2: moderator)
 * @param memberInfo - User's membership information for the group
 * @returns Boolean indicating whether the user can see group posts
 */
function isGroupPrivate(
  actionList:
    | Array<{ actionId: number; accessTypeId: number }>
    | null
    | undefined,
  communityRole: number | undefined,
  memberInfo: unknown | null | undefined,
): boolean {
  // Community role enum values
  const CommunityMemberRole = {
    NONE: 0,
    LEADER: 1,
    MODERATOR: 2,
  };

  const actionModel = actionList?.find(
    (action) => action.actionId === 3 || action.actionId === 4,
  );

  switch (actionModel?.actionId) {
    case 3:
      // Community is public
      if (actionModel.accessTypeId === 5) {
        // Everyone can see
        return true;
      } else {
        // Only Group Members or Community Admins
        return (
          memberInfo != null ||
          communityRole === CommunityMemberRole.LEADER ||
          communityRole === CommunityMemberRole.MODERATOR
        );
      }

    case 4:
      // Community is private
      if (actionModel.accessTypeId === 7) {
        // All Community members
        return communityRole !== CommunityMemberRole.NONE;
      } else {
        // Only Group Members or Community Admins
        return (
          memberInfo != null ||
          communityRole === CommunityMemberRole.LEADER ||
          communityRole === CommunityMemberRole.MODERATOR
        );
      }

    default:
      return false;
  }
}
