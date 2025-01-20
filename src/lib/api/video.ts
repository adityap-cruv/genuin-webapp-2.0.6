import { validateLoopDetails } from '@lib/schemas/loop/details'
import { axiosInstance } from './instance'
import { type LoopVideoType } from '@lib/schemas/loop/videos'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { tryJsonParse } from '@lib/utils'
import { NOT_FOUND_ERROR_CODES } from '../constants'

export async function getVideoDetails(slug: string): Promise<VideoPlayerModalType> {
  const metadata = await fetchVideoMetadata(slug)
  if (!metadata?.chat_id) {
    throw new Error(`Invalid metadata for slug: ${slug}`)
  }

  const [loopDetails, videoDetails] = await Promise.all([
    fetchLoopDetails(metadata.chat_id),
    fetchLoopVideo(metadata.chat_id, metadata.message_id),
  ])

  if (!loopDetails || !videoDetails) {
    throw new Error('Failed to fetch loop details or video details.')
  }
  // console.log('loopDetails', loopDetails, videoDetails)
  return {
    community: {
      handle: loopDetails.community.handle,
      id: loopDetails.community.community_id,
      slug: loopDetails.community.slug,
      name: loopDetails.community.name,
      profileImage: loopDetails.community.dp,
      shareUrl: loopDetails.community.share_url ?? '',
      // TODO: Right now only passing unjoined in due to lack of data.
      userRole: 'UNJOINED',
      brand: loopDetails.community?.brand
        ? {
            brand_id: loopDetails.community.brand.brand_id,
            name: loopDetails.community.brand.name ?? '',
            subdomain: loopDetails.community.brand.subdomain,
            logo: loopDetails.community.brand.logo,
            created_at: loopDetails.community.brand.created_at,
            brand_web_logo: loopDetails.community.brand.brand_web_logo,
            favicon: loopDetails.community.brand.favicon,
            brand_system_user_id: loopDetails.community.brand.brand_system_user_id,
            brand_slug: loopDetails.community.brand.brand_slug,
          }
        : null,
    },
    loop: { id: loopDetails.chat_id, slug: loopDetails.slug, name: loopDetails.group.group_name },
    owner: {
      isAvatar: videoDetails.owner.is_avatar,
      profileImage: videoDetails.owner.profile_image,
      userName: videoDetails.owner.username,
      name: videoDetails.owner.name,
      brand: videoDetails.owner.brand
        ? {
            brand_id: videoDetails.owner.brand.brand_id,
            brand_slug: videoDetails.owner.brand.brand_slug,
            brand_user_logo: videoDetails.owner.brand.brand_user_logo,
          }
        : null,
    },
    video: {
      id: videoDetails.message_id,
      commentCount: videoDetails.no_of_comments ?? 0,
      shareUrl: videoDetails.share_url,
      slug: videoDetails.slug,
      source: videoDetails.media_url_m3u8 ? videoDetails.media_url_m3u8 : videoDetails.media_url,
      sparkCount: videoDetails.no_of_sparks ?? 0,
      thumbnail: videoDetails.thumbnail_url ?? '',
      attachedLink: videoDetails.attached_link,
      createdAt: videoDetails.message_at,
      descriptionArr: tryJsonParse(videoDetails.description_data),
      descriptionText: videoDetails.description_text,
      linkoutId: videoDetails.linkouts_id,
      clickableUrl: videoDetails.clickable_url ? videoDetails.clickable_url : null,
      thumbnailM: videoDetails.thumbnail_url_l,
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.log('error in deep_link/meta_data::', e.response.data)
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.video) {
        throw new Error(e.response.data.code)
      }
    })
}

// TODO: Figure out what is type here.
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

export async function joinCommunity(
  onboardingCommunities: boolean,
  communities: string[],
  users: Array<{ user_id?: string }>
) {
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

/**
 * This api call is used to request to join a community.
 * It will return a code 200 if the request is successful.
 * @param communityId
 * @returns
 */
export async function requestCommunity(communityId: string | undefined) {
  return await axiosInstance
    .post('/api/v3/community/join_request', {
      community_id: communityId,
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

export async function createComment(
  videoId: string,
  loopId: string,
  type: number,
  commentText: string,
  commentData: any
) {
  return await axiosInstance
    .post(
      '/api/v3/comment/create',
      {
        conversation_id: videoId,
        chat_id: loopId,
        type,
        comment_text: commentText,
        comment_data: JSON.stringify(commentData),
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
      return { code: Number(e.response.data.code), data: null }
    })
}

export async function mentionUser(chatId: string, queryString: string, signal: AbortSignal) {
  return await axiosInstance
    .get('/api/v3/mentions', {
      params: {
        query_string: queryString,
        chat_id: chatId,
      },
      signal,
    })
    .then((res) => {
      return { code: res.status, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e.response.data.code), data: [] }
    })
}
