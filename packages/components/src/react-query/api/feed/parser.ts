import type z from "zod";

import {
  mapCommunityUserRole,
  mapGroupJoinStatus,
} from "@genuin/components/lib/utils";

import type { PostDetailsSchema } from "./schema";
import type { FeedResponseFromGoApi } from "./types";

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
  endOfFeed: boolean = false
): Array<z.infer<typeof PostDetailsSchema>> {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const result: Array<z.infer<typeof PostDetailsSchema>> = [];

  // Track if we've already found the unwatched -> watched transition
  // Once found, we can skip further checks for optimization
  let watchBoundaryFound = false;

  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    if (!item || item.type === "all_caught_up") continue;

    const currentIsWatched = item.video?.is_watched ?? false;

    // Map the API response to our schema
    const mappedItem: z.infer<typeof PostDetailsSchema> = {
      video: {
        id: item.video.uuid,
        type: "video",
        createdAt: item.video.conversation_at,
        commentCount: item.video.no_of_comments || 0,
        shareUrl: item.video.share_url,
        attachedLink: item.video.attached_link || null,
        source: item.video.media_url_m3u8 ?? item.video.media_url,
        isSparked: item.video.is_sparked || false,
        isWatched: currentIsWatched,
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
        attributes: item.video.attributes || null,

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
          item.loop.member_info
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
          item.community.dp_s ||
          item.community.dp_m ||
          item.community.dp ||
          null,
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
        description: item.section?.description || null,
        position: item.section?.position || null,
      },
    };
    /*
      TODO : iheart phase-2 implementation
    // Check for the unwatched -> watched transition (only if middleware is enabled)
    // When found, insert an overlay marker before the first watched video
    if (shouldShowMiddlewareOverlay && !watchBoundaryFound && index > 0) {
      const previousIsWatched = data[index - 1]?.video?.is_watched || false;

      if (!previousIsWatched && currentIsWatched) {
        // Insert overlay marker at the transition boundary
        result.push({
          ...mappedItem,
          video: {
            ...mappedItem.video,
            type: "overlay",
            id: mappedItem.video.id + "_overlay",
          },
        });

        // Mark boundary as found to skip further checks
        watchBoundaryFound = true;
      }
    } else if (shouldShowMiddlewareOverlay && index === 0 && currentIsWatched) {
      // Insert overlay marker at the transition boundary
      result.push({
        ...mappedItem,
        video: {
          ...mappedItem.video,
          type: "overlay",
          id: mappedItem.video.id + "_overlay",
        },
      });

      // Mark boundary as found to skip further checks
      watchBoundaryFound = true;
    }
    */
    // Add the actual video item
    result.push(mappedItem);

    // end of feed the caught up overlay
    if (endOfFeed && index === data.length - 1) {
      result.push({
        ...mappedItem,
        video: {
          ...mappedItem.video,
          type: "complete",
          id: mappedItem.video.id + "_complete",
        },
      });
    }
  }
  return result;
}

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
  memberInfo: unknown | null | undefined
): boolean {
  // Community role enum values
  const CommunityMemberRole = {
    NONE: 0,
    LEADER: 1,
    MODERATOR: 2,
  };

  const actionModel = actionList?.find(
    (action) => action.actionId === 3 || action.actionId === 4
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
