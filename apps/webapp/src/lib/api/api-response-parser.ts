// TODO: scrap this file and move the parsing logic to the respective api files.

 
import { type FeedResponseFromGoApi } from '@lib/schemas/feed/response'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { mapCommunityUserRole, tryJsonParse } from '@lib/utils'

/**
 * This api parses only feed response from go-api.
 * And returns the parsed response in the form of VideoPlayerModalType
 */
export function parseFeedResponseFromGoApi(feeds: FeedResponseFromGoApi[]) {
  return feeds.map<VideoPlayerModalType>(({ video, community, loop, uuid, owner }) => ({
    community: {
      handle: community?.handle || '',
      id: community?.uuid || '',
      slug: community?.slug || '',
      name: community?.name || null,
      profileImage: community.dp_s,
      type: community?.type || null,
      shareUrl: community?.share_url || '',
      // is join requested is false because feed api does not give private community videos.
      userRole: mapCommunityUserRole(community?.logged_in_user_role, false),
      ...(community.brand && {
        brand: {
          brand_id: community.brand.brand_id,
          name: community.brand.name,
          brand_slug: community.brand.brand_slug,
          brand_web_logo: community.brand.brand_web_logo,
        },
      }),
    },
    loop: {
      id: loop?.uuid || '',
      slug: loop?.slug || '',
      name: loop?.group_name || null,
      description: loop?.group_description || '',
      shareUrl: loop?.share_url,
      isSubscribed: loop?.is_loop_subscribe || false,
    },
    owner: {
      isAvatar: owner.is_avatar,
      profileImage: owner.profile_image_s ?? owner.profile_image_m ?? owner.profile_image,
      userName: owner.username,
      name: owner.name,
      ...(owner.brand && {
        brand: {
          brand_id: Number(owner.brand.brand_id),
          brand_slug: owner.brand.brand_slug,
          brand_user_logo: owner.brand?.brand_user_logo || 1,
        },
      }),
    },
    video: {
      id: uuid,
      commentCount: video.no_of_comments || 0,
      createdAt: video.conversation_at,
      shareUrl: video.share_url || '',
      slug: video.slug || '',
      source: video.media_url_m3u8 ?? video.media_url,
      sparkCount: video.no_of_sparks || 0,
      thumbnail: video.thumbnail_url,
      attachedLink: video.attached_link,
      isSparked: video.is_sparked || null,
      descriptionArr: video.description_data ? tryJsonParse(video.description_data) : undefined,
      descriptionText: video.description_text || null,
      linkoutId: video.linkouts_id || null,
      clickableUrl: video.clickable_url || null,
      thumbnailM: video.thumbnail_url_l || video.thumbnail_url,
      linkouts: video.linkouts,
      is_pinned: video.is_pinned || false,
      spriteUrl: video.sprite_image_url,
    },
  }))
}
