import { type LoopVideoListType } from '@lib/schemas/loop/videos'
import {
  type VideoPlayerModalCommunityType,
  type VideoPlayerModalType,
  type VideoPlayerModalLoopType,
} from '@lib/schemas/player/video'

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
