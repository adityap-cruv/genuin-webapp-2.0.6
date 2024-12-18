/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { type FeedResponseFromGoApi, type FeedResponseType } from '@lib/schemas/feed/response'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { type ProfileLoopType, type ProfileCommunityType, type ProfileVideoType } from '@lib/schemas/profile/community'
import {
  type ProfileLoopResponseType,
  type ProfileCommunityResponseType,
  type ProfileVideoResponseType,
} from '@lib/schemas/profile/community-response'
import { tryJsonParse } from '@lib/utils'

// TODO: this function is used by some apis like community-videos, brand-videos removed if we adopt the changes from go-api.
export function parseFeedResponse(videos: FeedResponseType[]) {
  return videos.map<VideoPlayerModalType>(({ video, community, loop, owner }) => {
    return {
      community: {
        handle: community?.handle ?? '',
        id: community?.uuid ?? '',
        slug: community?.slug ?? '',
        name: community?.name ?? '',
        profileImage: community?.dp ?? '',
        type: community?.type ?? null,
        shareUrl: community?.share_url ?? '',
        userRole: mapUserRole(community?.logged_in_user_role), // Mapping logged_in_user_role to userRole

        brand: community?.brand
          ? {
              brand_id: community.brand.brand_id,
              name: community.brand.name,
              subdomain: community.brand.subdomain,
              logo: community.brand.logo,
              created_at: community.brand.created_at,
              brand_web_logo: community.brand.brand_web_logo,
              favicon: community.brand.favicon,
              brand_system_user_id: community.brand.brand_system_user_id,
              brand_slug: community.brand.brand_slug,
            }
          : null,
      },
      loop: {
        id: loop.group_id,
        slug: loop.slug,
        name: loop.group_name,
      },
      owner: {
        isAvatar: owner.is_avatar,
        profileImage: owner.profile_image,
        userName: owner.username,
        name: owner.name,
        brand: owner.brand
          ? {
              brand_id: owner.brand?.brand_id,
              brand_slug: owner.brand?.brand_slug,
            }
          : null,
      },
      video: {
        id: video.uuid,
        commentCount: video.no_of_comments,
        createdAt: video.conversation_at,
        shareUrl: video.share_url,
        slug: video.slug,
        source: video.media_url_m3u8 ?? video.media_url,
        sparkCount: video.no_of_sparks,
        thumbnail: video.thumbnail_url ?? '',
        attachedLink: video.attached_link,
        isSparked: video.is_sparked,
        descriptionArr: video.description_data ? tryJsonParse(video.description_data) : undefined,
        descriptionText: video.description_text,
        linkoutId: video.linkouts_id || null,
        clickableUrl: video.clickable_url ? video.clickable_url : null,
        thumbnailM: video.thumbnail_url_l ? video.thumbnail_url || '' : '',
      },
    }
  })
}

// TODO: check for isCommunityJoinRequested.
/**
 * This api parses only feed response from go-api.
 * And returns the parsed response in the form of VideoPlayerModalType
 */
export function parseFeedResponseFromGoApi(feeds: FeedResponseFromGoApi[]) {
  return feeds.map<VideoPlayerModalType>(({ video, community, loop, uuid, owner }) => ({
    community: {
      handle: community?.handle || '', // Mapping community.handle
      id: community?.uuid || '', // Mapping community.uuid
      slug: community?.slug || '', // Mapping community.slug
      name: community?.name || null, // Mapping community.name
      profileImage: community.dp_s, // Mapping community.dp
      type: community?.type || null, // Mapping community.type
      shareUrl: community?.share_url || '', // Mapping community.share_url
      userRole: mapUserRole(community?.logged_in_user_role), // Mapping logged_in_user_role to userRole
      isJoinRequested: false, // Set default for isJoinRequested, modify if needed
      ...(community.brand && {
        brand: {
          brand_id: community.brand.brand_id, // Mapping brand.brand_id
          name: community.brand.name, // Mapping brand.name
          brand_slug: community.brand.brand_slug, // Mapping brand.brand_slug
          brand_web_logo: community.brand.brand_web_logo,
        },
      }),
    },
    loop: {
      id: loop?.uuid || '', // Mapping loop.uuid
      slug: loop?.slug || '', // Mapping loop.slug
      name: loop?.group_name || null, // Mapping loop.group_name
    },
    owner: {
      isAvatar: owner.is_avatar, // Mapping owner.is_avatar
      profileImage: owner.profile_image_s ?? owner.profile_image_m ?? owner.profile_image,
      userName: owner.username, // Mapping owner.username
      name: owner.name, // Mapping owner.name
      ...(owner.brand && { brand: { brand_id: Number(owner.brand.brand_id), brand_slug: owner.brand.brand_slug } }),
    },
    video: {
      id: uuid, // Using video.uuid as the ID
      commentCount: video.no_of_comments || 0, // Mapping no_of_comments
      createdAt: video.conversation_at, // Mapping message_at to createdAt
      shareUrl: video.share_url || '', // Mapping share_url
      slug: video.slug || '', // Mapping slug
      source: video.media_url_m3u8 ?? video.media_url, // Mapping media_url
      sparkCount: video.no_of_sparks || 0, // Mapping no_of_sparks
      thumbnail: video.thumbnail_url, // Mapping thumbnail_url
      attachedLink: video.attached_link, // Mapping attached_link
      isSparked: video.is_sparked || null, // Mapping is_sparked
      descriptionArr: video.description_data ? tryJsonParse(video.description_data) : undefined, // Parsing descriptionArr
      descriptionText: video.description_text || null, // Mapping description_text
      linkoutId: video.linkouts_id || null, // Mapping linkouts_id
      clickableUrl: video.clickable_url || null, // Mapping clickable_url
      thumbnailM: video.thumbnail_url_l || video.thumbnail_url, // Mapping thumbnail_url_l
      linkouts: video.linkouts,
    },
  }))
}

// Helper function to map logged_in_user_role to enum values
// TODO: handle Moderator in here.
function mapUserRole(role?: number | null, isRequested?: boolean | null): 'LEADER' | 'MEMBER' | 'REQUESTED' | null {
  if (isRequested) return 'REQUESTED'
  switch (role) {
    case 1:
      return 'LEADER'
    case 2:
      return 'MEMBER'
    // case 3:
    //   return 'REQUESTED'
    default:
      return null
  }
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
      // TODO: Addition from backend required.
      isJoined: false,
      userRole: mapUserRole(item.logged_in_user_role, item.is_community_join_requested),
      isCommunityJoinRequested: item.is_community_join_requested,
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
