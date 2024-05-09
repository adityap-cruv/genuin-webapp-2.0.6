import { type FeedResponseType } from '@lib/schemas/feed/response'
import { type LoopVideoListType } from '@lib/schemas/loop/videos'
import {
  type VideoPlayerModalCommunityType,
  type VideoPlayerModalType,
  type VideoPlayerModalLoopType,
} from '@lib/schemas/player/video'
import { type ProfileLoopType, type ProfileCommunityType, type ProfileVideoType } from '@lib/schemas/profile/community'
import {
  type ProfileLoopResponseType,
  type ProfileCommunityResponseType,
  type ProfileVideoResponseType,
} from '@lib/schemas/profile/community-response'

// TODO: add this file at better location.
export function parseVideosFromLoop(
  data: LoopVideoListType,
  loop: VideoPlayerModalLoopType,
  community: VideoPlayerModalCommunityType
) {
  return data.map<VideoPlayerModalType>((item) => {
    return {
      community,
      loop,
      owner: {
        isAvatar: item.owner.is_avatar,
        profileImage: item.owner.profile_image,
        userName: item.owner.username,
        name: item.owner.name,
      },
      video: {
        commentCount: item.no_of_comments ?? 0,
        createdAt: item.message_at ?? -1,
        id: item.message_id,
        shareUrl: item.share_url,
        source: item.media_url_m3u8 ?? item.media_url,
        sparkCount: item.no_of_sparks ?? 0,
        thumbnail: item.thumbnail_url ?? '',
        attachedLink: item.attached_link,
        // TODO: Description is not being showed in mobile.
        description: null,
        slug: item.slug,
      },
    }
  })
}

export function parseFeedResponse(videos: FeedResponseType) {
  //! Sometime old video which doesn't have community comes into response.
  videos = videos.filter((item, index, arr) => item.feed.community)

  return videos.map<VideoPlayerModalType>((item) => {
    const video = item.feed
    return {
      community: {
        handle: video.community?.handle ?? '',
        id: video.community?.community_id ?? '',
        slug: video.community?.slug ?? '',
        name: video.community?.name ?? '',
        profileImage: video.community?.dp ?? '',
        type: video.type ?? null,
        brand: video.community?.brand
          ? {
              brand_id: video.community.brand.brand_id,
              name: video.community.brand.name,
              subdomain: video.community.brand.subdomain,
              logo: video.community.brand.logo,
              created_at: video.community.brand.created_at,
              brand_web_logo: video.community.brand.brand_web_logo,
              favicon: video.community.brand.favicon,
              brand_system_user_id: video.community.brand.brand_system_user_id,
              brand_slug: video.community.brand.brand_slug,
            }
          : null,
      },
      loop: {
        id: video.chat_id,
        slug: video.slug,
        name: video.group.group_name,
      },
      owner: {
        isAvatar: video.messages[0].owner.is_avatar,
        profileImage: video.messages[0].owner.profile_image,
        userName: video.messages[0].owner.username,
        name: video.messages[0].owner.name,
        brand: video.messages[0]?.owner.brand
          ? {
              brand_id: video.messages[0].owner.brand?.brand_id,
              brand_slug: video.messages[0].owner.brand?.brand_slug,
            }
          : null,
      },
      video: {
        commentCount: video.messages[0].no_of_comments,
        createdAt: video.messages[0].message_at,
        id: video.messages[0].message_id,
        shareUrl: video.messages[0].share_url,
        slug: video.messages[0].slug,
        source: video.messages[0].media_url_m3u8 ?? video.messages[0].media_url,
        sparkCount: video.messages[0].no_of_sparks,
        thumbnail: video.messages[0].thumbnail_url ?? '',
        attachedLink: video.messages[0].attached_link,
        description: '',
        isSparked: video.messages[0].is_sparked,
      },
    }
  })
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
      slug: item.slug,
      name: item.name,
      profileImage: item.dp,
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
              thumbnail: item.thumbnail_url,
              // TODO: Addition from backend.
              sparkCount: 0,
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
        // TODO: Add spark count if needed after discussion with design and backend.
        return { id: item.message_id, sparkCount: 0, viewCount: item.no_of_views, thumbnail: item.thumbnail_url }
      }),
    }
  })
}

export function parseProfileVideoResponse(videos: ProfileVideoResponseType[]) {
  return videos.map<ProfileVideoType>((item) => {
    return {
      id: item.message_id,
      // TODO: Add spark count if needed after discussion with design and backend.
      sparkCount: 0,
      viewCount: item.no_of_views,
      thumbnail: item.thumbnail_url,
    }
  })
}
