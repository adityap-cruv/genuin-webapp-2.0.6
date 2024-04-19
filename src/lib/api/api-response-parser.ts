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
      handle: item.handle,
      id: item.community_id,
      // TODO: Addition from backend required.
      isJoined: false,
      slug: item.slug,
      name: item.name,
      profileImage: item.dp,
      loopCount: item.no_of_loops,
      loops: item.loops.map((item) => {
        return {
          id: item.chat_id,
          slug: item.slug,
          name: item.group.group_name,
          private: !item.is_view_allowed,
          videoCount: item.group.no_of_videos,
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
