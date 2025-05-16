import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/utils'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'
import { getBaseHeaders } from '@/headers'
import { FeedVideoType } from '@/type'
import { LoopVideoType } from './videos'
import { validateLinkouts } from './linkout-schema'
import { validateLoopDetails } from '../group/schema'

async function fetchVideoMetadata(videoSlug: string) {
  const url = new URL(getApiUrl('api/v3/deep_link/meta_data'))
  url.searchParams.append('type', '4')
  url.searchParams.append('slug', videoSlug)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { ...getBaseHeaders(true) },
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('Error in deep_link/meta_data::', errorData)

    if (errorData.code === NOT_FOUND_ERROR_CODES.video) {
      throw new Error(errorData.code)
    }

    throw new Error('Something went wrong!!')
  }

  const data = await response.json()
  return data.data
}

async function fetchLoopVideo(
  loopId: string,
  videoId: string,
): Promise<LoopVideoType> {
  const url = new URL(getApiUrl('api/v3/conversation/messages'))
  url.searchParams.append('chat_id', loopId)
  url.searchParams.append('from_message_id', videoId)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { ...getBaseHeaders(true) },
  })

  if (!response.ok) {
    console.error('Error fetching conversation messages:', response)
    throw new Error('Something went wrong in conversation messages.')
  }

  const data = await response.json()
  return data.data.messages[0] as LoopVideoType
}

async function fetchLoopDetails(id: string) {
  const url = new URL(getApiUrl('api/v3/conversation/details'))
  url.searchParams.append('chat_id', id)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { ...getBaseHeaders(true) },
  })

  if (!response.ok) {
    console.error('Error fetching loop details:', response)
    throw new Error('Something went wrong!!')
  }

  const data = await response.json()

  return validateLoopDetails(data?.data)
}

export async function fetchLinkouts(id: number) {
  const url = new URL(getApiUrl('/api/v3/linkouts'))
  url.searchParams.append('linkouts_ids', id.toString())

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { ...getBaseHeaders(true) },
  })

  if (!response.ok) {
    console.error('Error fetching linkouts:', response)
    throw new Error('Something went wrong while fetching linkouts.')
  }

  const data = await response.json()
  return validateLinkouts(data?.data?.[0]?.linkouts)
}

export function getLinkouts(id: number) {
  return useQuery({
    queryFn: async () => await fetchLinkouts(id),
    queryKey: ['linkouts', id],
    refetchOnWindowFocus: false,
    retry: 0,
  })
}

async function getVideoDetails(slug: string): Promise<FeedVideoType> {
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

  return {
    uuid: videoDetails.message_id,
    community: {
      brand_id: loopDetails.community.brand?.brand_id ?? 0,
      color_code: loopDetails.community.color_code ?? '',
      description: loopDetails.community.description ?? '',
      handle: loopDetails.community.handle,
      name: loopDetails.community.name ?? '',
      share_string: loopDetails.community.slug,
      share_url: loopDetails.community.share_url ?? '',
      slug: loopDetails.community.slug,
      text_color_code: loopDetails.community.text_color_code ?? '',
      type: loopDetails.community.type ?? 0,
      uuid: loopDetails.community.community_id,
      dp: loopDetails.community.dp ?? '',
      dp_l: loopDetails.community.dp_l ?? '',
      dp_m: loopDetails.community.dp_m ?? '',
      dp_s: loopDetails.community.dp_s ?? '',
      logged_in_user_role:
        loopDetails.community.logged_in_user_role ?? undefined,
      is_join_requested: false,
      brand: {
        brand_id: loopDetails.community.brand?.brand_id ?? 0,
        brand_slug: loopDetails.community.brand?.brand_slug ?? '',
        brand_user_logo:
          typeof loopDetails.community.brand?.logo === 'string'
            ? parseInt(loopDetails.community.brand.logo, 10)
            : (loopDetails.community.brand?.logo ?? 0),
        brand_web_logo: loopDetails.community.brand?.brand_web_logo ?? '',
        name: loopDetails.community.brand?.name ?? '',
      },
    },
    loop: {
      color_code: loopDetails.group.color_code ?? '',
      group_description: loopDetails.group.group_description ?? '',
      group_id: loopDetails.group.group_id,
      group_name: loopDetails.group.group_name ?? '',
      settings: {
        discoverable: loopDetails.settings.discoverable,
      },
      share_string: loopDetails.slug,
      share_url: loopDetails.share_url,
      slug: loopDetails.slug,
      type: loopDetails.type,
      uuid: loopDetails.group.group_id,
    },
    owner: {
      bio: videoDetails.owner.bio ?? '',
      brand: {
        brand_id: videoDetails.owner.brand?.brand_id ?? 0,
        brand_slug: videoDetails.owner.brand?.brand_slug ?? '',
        brand_user_logo: videoDetails.owner.brand?.brand_user_logo ?? 0,
      },
      is_avatar: videoDetails.owner.is_avatar,
      name: videoDetails.owner.name ?? '',
      profile_image: videoDetails.owner.profile_image,
      profile_image_s: videoDetails.owner.profile_image_s ?? '',
      profile_image_m: videoDetails.owner.profile_image_m ?? '',
      profile_image_l: videoDetails.owner.profile_image_l ?? '',
      share_url: videoDetails.share_url,
      username: videoDetails.owner.username,
      uuid: videoDetails.owner.member_id,
    },
    video: {
      clickable_url: videoDetails.clickable_url ?? null,
      attached_link: videoDetails.attached_link ?? null,
      conversation_at: videoDetails.message_at ?? 0,
      description_data: videoDetails.description_data ?? null,
      description_text: videoDetails.description_text ?? null,
      linkouts: null,
      linkouts_id: videoDetails.linkouts_id
        ? String(videoDetails.linkouts_id)
        : '',
      linkouts_inappbrowser: false,
      media_url: videoDetails.media_url ?? '',
      media_url_m3u8: videoDetails.media_url_m3u8 ?? '',
      meta_data: {
        aspect_ratio: videoDetails.meta_data?.aspect_ratio ?? '',
        contains_external_videos:
          videoDetails.meta_data?.contains_external_videos ?? false,
        duration: videoDetails.meta_data?.duration ?? '',
        media_type: videoDetails.meta_data?.media_type ?? '',
        resolution: videoDetails.meta_data?.resolution ?? '',
        size: videoDetails.meta_data?.size ?? '',
      },
      no_of_comments: videoDetails.no_of_comments ?? 0,
      no_of_shares: 0,
      no_of_sparks: videoDetails.no_of_sparks ?? 0,
      no_of_views: videoDetails.no_of_views ?? 0,
      share_url: videoDetails.share_url ?? '',
      slug: videoDetails.slug ?? '',
      sprite_image_url: videoDetails.thumbnail_url ?? null,
      thumbnail_url: videoDetails.thumbnail_url ?? '',
      thumbnail_url_l: videoDetails.thumbnail_url_l ?? '',
      thumbnail_url_s: videoDetails.thumbnail_url_s ?? '',
      uuid: videoDetails.message_id ?? '',
      video_summary: videoDetails.message_summary ?? null,
      is_sparked: videoDetails.is_sparked ?? false,
      is_read: videoDetails.is_read ?? false,
    },
  }
}

export function useVideoDetails(slug: string) {
  return useQuery({
    queryKey: ['videoDetails', slug],
    queryFn: () => getVideoDetails(slug),
    retry: 1,
  })
}
