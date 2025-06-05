import type z from "zod";

import { mapCommunityUserRole } from "src/lib/utils";

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
    console.error("Failed to parse JSON", e);
    return null;
  }
}

/**
 * Parses the given response from the Go API into the PostDetailsSchema format.
 * @param data - The response data from the Go API.
 * @returns Parsed data conforming to PostDetailsSchema.
 */
export function parseFeed(
  data: FeedResponseFromGoApi
): Array<z.infer<typeof PostDetailsSchema>> {
  return data.map((item) => ({
    video: {
      id: item.video.uuid,
      createdAt: item.video.conversation_at,
      commentCount: item.video.no_of_comments || 0,
      shareUrl: item.video.share_url,
      attachedLink: item.video.attached_link || null,
      source: item.video.media_url_m3u8 ?? item.video.media_url,
      isSparked: item.video.is_sparked || false,
      sparkCount: item.video.no_of_sparks || 0,
      thumbnail: item.video.thumbnail_url,
      thumbnailM: item.video.thumbnail_url_m || null,
      description:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tryJsonParse(item.video.description_data) as any) ??
        item.video.description_text,
      slug: item.video.slug,
      linkoutId: item.video.linkouts_id || null,
      clickableUrl: item.video.clickable_url || null,
      linkouts: item.video.linkouts || [],
      isPinned: item.video.is_pinned || false,
      thumbnailSprite: item.video.sprite_image_url || null,
    },
    group: {
      id: item.loop.group_id,
      slug: item.loop.uuid,
      description: item.loop.group_description || "",
      shareUrl: item.loop.share_url || undefined,
      name: item.loop.group_name || "",
      isSubscribed: item.loop.is_loop_subscribe || false,
    },
    community: {
      id: item.community.uuid || "",
      shareUrl: item.community.share_url || "",
      slug: item.community.slug || "",
      handle: item.community.handle || "",
      // Check privacy info if type === 1 then it is public, type === 2 then it is private.
      isPrivate: item.community.type === 2,
      // is join requested is false because feed api does not give private community videos.
      userRole: mapCommunityUserRole(item.community.logged_in_user_role),
      type: item.community.type || null,
      name: item.community.name || null,
      profileImage: item.community.dp_m || null,
      ...(item.community.brand && {
        brand: {
          id: item.community.brand.brand_id,
          name: item.community.brand.name,
          slug: item.community.brand.brand_slug,
          webLogo: item.community.brand.brand_web_logo || null,
        },
      }),
    },
    owner: {
      profileImage: item.owner.profile_image,
      isAvatar: item.owner.is_avatar,
      userName: item.owner.username,
      name: item.owner.name || null,
      brand: item.owner.brand
        ? {
            id: Number(item.owner.brand.brand_id),
            slug: item.owner.brand.brand_slug,
            userLogo: item.owner.brand.brand_user_logo || null,
          }
        : null,
    },
  }));
}
