import { validateLoopDetails } from '@lib/schemas/loop/details'
import { axiosInstance } from './instance'
import { type LoopVideoType } from '@lib/schemas/loop/videos'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

export async function getVideoDetails(slug: string): Promise<VideoPlayerModalType> {
  const metadata = await fetchVideoMetadata(slug)
  const [loopDetails, videoDetails] = await Promise.all([
    await fetchLoopDetails(metadata.chat_id),
    await fetchLoopVideo(metadata.chat_id, metadata.message_id),
  ])

  return {
    community: {
      handle: loopDetails.community.handle,
      id: loopDetails.community.community_id,
      slug: loopDetails.community.slug,
      name: loopDetails.community.name,
      profileImage: loopDetails.community.dp,
      shareUrl: loopDetails.community.share_url ?? '',
    },
    loop: { id: loopDetails.chat_id, slug: loopDetails.slug, name: loopDetails.group.group_name },
    owner: {
      isAvatar: videoDetails.owner.is_avatar,
      profileImage: videoDetails.owner.profile_image,
      userName: videoDetails.owner.username,
      name: videoDetails.owner.name,
    },
    video: {
      id: videoDetails.message_id,
      commentCount: videoDetails.no_of_comments ?? 0,
      shareUrl: videoDetails.share_url,
      slug: videoDetails.slug,
      source: videoDetails.media_url_m3u8 ?? videoDetails.media_url,
      sparkCount: videoDetails.no_of_sparks ?? 0,
      thumbnail: videoDetails.thumbnail_url ?? '',
      attachedLink: videoDetails.attached_link,
      createdAt: videoDetails.message_at,
      description: '',
    },
  }
}

export async function fetchLoopVideo(loopId: string, videoId: string) {
  return await axiosInstance
    .get('/api/v3/conversation/messages', {
      params: {
        chat_id: loopId,
        from_message_id: videoId,
      },
    })
    .then((res) => {
      return res.data.data.messages[0] as LoopVideoType
    })
    .catch((e) => {
      console.log('error in conversation messages::', e)
      throw new Error('Something went wrong in conversation messages.')
    })
}

export async function fetchLoopDetails(id: string) {
  return await axiosInstance
    .get('/api/v3/conversation/details', {
      params: { chat_id: id },
    })
    .then((res) => {
      return validateLoopDetails(res?.data?.data)
    })
    .catch((e) => {
      throw new Error('Something went wrong!!')
    })
}

export async function fetchVideoMetadata(videoSlug: string) {
  return await axiosInstance
    .get('/api/v3/deep_link/meta_data', {
      params: {
        type: 4,
        slug: videoSlug,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      console.log('error::', e)
    })
}

export async function videoSpark(contentId: string, type: number, spark: boolean) {
  return await axiosInstance
    .post(
      '/api/v3/spark',
      {
        content_id: contentId,
        type,
        spark,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => {
      return { code: res.status, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e.response.data.code) }
    })
}

export async function joinCommunity(onboardingCommunities: boolean, communities: any, users: any) {
  return await axiosInstance
    .post('/api/v3/community/add_users', {
      onboarding_communities: onboardingCommunities,
      communities,
      users,
    })
    .then((res) => {
      return { code: res.status, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e.response.data.code) }
    })
}

export async function leaveCommunity(communityId: string | undefined) {
  return await axiosInstance
    .delete('/api/v3/community/leave', {
      params: {
        community_id: communityId,
      },
    })
    .then((res) => {
      return { code: res.status, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e.response.data.code) }
    })
}

export async function createComment(videoId: string, loopId: string, type: number, commentText: string) {
  return await axiosInstance
    .post(
      '/api/v3/comment/create',
      {
        conversation_id: videoId,
        chat_id: loopId,
        type,
        comment_text: commentText,
        comment_data: JSON.stringify([commentText]),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((res) => {
      return { code: res.status, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e.response.data.code) }
    })
}
