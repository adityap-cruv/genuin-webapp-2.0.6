// TODO: scrap this file and move the parsing logic to the respective api files.

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { type FeedResponseFromGoApi } from '@lib/schemas/feed/response'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { type ProfileLoopType, type ProfileCommunityType, type ProfileVideoType } from '@lib/schemas/profile/community'
import {
  type ProfileLoopResponseType,
  type ProfileCommunityResponseType,
  type ProfileVideoResponseType,
} from '@lib/schemas/profile/community-response'
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
          brand_user_logo: community.brand?.brand_user_logo || 1,
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
    },
  }))
}

export function parseProfileCommunityResponse(communities: ProfileCommunityResponseType[]) {
  return communities.map<ProfileCommunityType>((item) => {
    return {
      brand: item?.brand
        ? {
            brand_id: item.brand.brand_id,
            name: item.brand.name,
            subdomain: item.brand.subdomain,
            logo: item.brand.logo,
            created_at: item.brand.created_at,
            brand_web_logo: item.brand.brand_web_logo,
            favicon: item.brand.favicon,
            brand_system_user_id: item.brand.brand_system_user_id,
            brand_slug: item.brand.brand_slug,
          }
        : null,
      handle: item.handle,
      id: item.community_id,
      userRole: mapCommunityUserRole(item.logged_in_user_role, item.is_community_join_requested),
      slug: item.slug,
      name: item.name,
      profileImage: item.dp_m ?? item.dp,
      loopCount: item.no_of_loops,
      type: item.type ?? null,
      loops: item.loops.map((item) => {
        return {
          id: item.chat_id,
          slug: item.slug,
          name: item.group.group_name,
          private: !item.is_view_allowed,
          videoCount: item.group.no_of_videos,
          actions: item.actions
            ? item.actions.map((item) => {
                return { action_id: item.action_id, access_type_id: item.access_type_id }
              })
            : null,
          videos: item.messages.map((item) => {
            return {
              id: item.message_id,
              thumbnail: item.thumbnail_url_m ? item.thumbnail_url_m : item.thumbnail_url_l ?? item.thumbnail_url,
              viewCount: item.no_of_views,
            }
          }),
        }
      }),
    }
  })
}

export function parseProfileLoopResponse(loops: ProfileLoopResponseType[]) {
  return loops.map<ProfileLoopType>((item) => {
    return {
      id: item.chat_id,
      private: !item.is_view_allowed,
      slug: item.slug,
      videoCount: item.group.no_of_videos,
      name: item.group.group_name,
      actions: item.actions
        ? item.actions.map((item) => {
            return { action_id: item.action_id, access_type_id: item.access_type_id }
          })
        : null,
      videos: item.messages.map((item) => {
        return {
          id: item.message_id,
          viewCount: item.no_of_views,
          thumbnail: item.thumbnail_url_m ? item.thumbnail_url_m : item.thumbnail_url_l ?? item.thumbnail_url,
        }
      }),
    }
  })
}

export function parseProfileVideoResponse(videos: ProfileVideoResponseType[]) {
  return videos.map<ProfileVideoType>((item) => {
    return {
      id: item.message_id,
      viewCount: item.no_of_views,
      thumbnail: item.thumbnail_url_l ?? item.thumbnail_url,
    }
  })
}
