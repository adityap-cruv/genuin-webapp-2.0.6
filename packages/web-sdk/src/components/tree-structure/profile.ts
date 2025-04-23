import {
  CommunityType,
  FetchCommunityPageParamType,
  FetchCommunityReturnType,
  FetchLoopPageParamType,
  FetchLoopReturnType,
  FetchVideosPageParamType,
  FetchVideosReturnType,
  LoopType,
  VideoType,
} from '@/components/tree-structure/types'
import { mapCommunityUserRole } from '@/components/tree-structure/utils'
import { getBaseHeaders } from '@/headers'
import { FeedVideoType } from '@/type'

import { z } from 'zod'

const messageSchema = z.object({
  media_url: z.string(),
  media_url_m3u8: z.string().nullish(),
  slug: z.string(),
  no_of_views: z.number(),
  thumbnail_url: z.string().nullish(),
  thumbnail_url_s: z.string().nullish(),
  thumbnail_url_m: z.string().nullish(),
  thumbnail_url_l: z.string().nullish(),
  message_id: z.string(),
  message_at: z.number().nullish(),
})

const actionsSchema = z.array(
  z.object({
    action_id: z.number(),
    access_type_id: z.number(),
  }),
)

const loopSchema = z.object({
  chat_id: z.string(),
  is_view_allowed: z.boolean(),
  slug: z.string(),
  share_url: z.string().nullish(),
  group: z.object({
    group_id: z.string(),
    group_name: z.string().nullish(),
    group_description: z.string().nullish(),
    no_of_videos: z.number(),
  }),
  messages: z.array(messageSchema),
  actions: actionsSchema,
})

const BrandSchema = z
  .object({
    brand_id: z.number(),
    name: z.string(),
    subdomain: z.string(),
    logo: z.string().url(),
    created_at: z.number(),
    brand_web_logo: z.string().url(),
    favicon: z.string().url(),
    brand_system_user_id: z.string(),
    brand_slug: z.string(),
  })
  .nullish()

const CommunitySchema = z.object({
  brand: BrandSchema.optional(),
  community_id: z.string(),
  type: z.number().nullish(),
  slug: z.string(),
  handle: z.string(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  color_code: z.string().nullish(),
  text_color_code: z.string().nullish(),
  dp: z.string().url().nullish(),
  logged_in_user_role: z.number().nullish(),
  dp_s: z.string().url().nullish(),
  dp_m: z.string().url().nullish(),
  dp_l: z.string().url().nullish(),
  share_url: z.string().url().nullish(),
  role: z.number().nullish(),
  is_community_join_requested: z.boolean().nullish(),
  no_of_loops: z.number(),
  loops: z.array(loopSchema),
})

const CommunityListSchema = z.array(CommunitySchema)

export async function fetchCommunities({
  pageParam,
  brandId,
}: {
  pageParam: FetchCommunityPageParamType
  brandId: string
}): Promise<FetchCommunityReturnType> {
  try {
    const url = new URL(
      'https://api.qa.begenuin.com/goservices/profile/brand/communities',
    )
    url.searchParams.append('brand_id', brandId)
    url.searchParams.append('page_limit_profile_videos', '8')
    if (pageParam?.pageSession)
      url.searchParams.append('page_session', pageParam.pageSession)
    if (pageParam?.lastCommunityId)
      url.searchParams.append('last_community_id', pageParam.lastCommunityId)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch communities')
    }

    const resData = await response.json()
    console.log('resData:::', resData)
    const communities = parseCommunityResponse(resData.data?.communities)
    return {
      communities,
      end: resData.data?.end_of_communities ?? false,
      nextPageParam: {
        lastCommunityId: communities[communities.length - 1].id,
        pageSession: resData.data?.page_session ?? '',
      },
    }
  } catch (error) {
    console.error('::Error fetching communities::', error)
    throw new Error('Something went wrong with the communities API.')
  }
}

export async function fetchLoops({
  pageParams,
  brandId,
  communityId,
}: {
  pageParams: FetchLoopPageParamType
  brandId: string
  communityId: string
}): Promise<FetchLoopReturnType> {
  try {
    const url = new URL(
      'https://api.qa.begenuin.com/goservices/profile/brand/loops',
    )
    url.searchParams.append('brand_id', brandId)
    url.searchParams.append('community_id', communityId)
    url.searchParams.append('page_limit_profile_videos', '8')
    if (pageParams?.lastLoopId)
      url.searchParams.append('last_chat_id', pageParams.lastLoopId)
    if (pageParams?.pageSession)
      url.searchParams.append('page_session', pageParams.pageSession)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true), // Assuming this function returns necessary headers
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile loops')
    }

    const resData = await response.json()
    const loops = parseGroupResponse(resData.data?.loops)
    console.log('resData for loops:::', resData)
    return {
      loops,
      end: resData.data?.end_of_loops ?? false,
      nextPageParam: {
        lastLoopId: loops[loops.length - 1].id,
        pageSession: pageParams?.pageSession ?? '',
      },
    }
  } catch (error) {
    console.error('::Error in api/v3/profile/loops::', error)
    throw new Error('Something went wrong with the profile loops API.')
  }
}

export async function fetchProfileVideos({
  brandId,
  communityId,
  loopId,
  pageParam,
}: {
  brandId: string
  communityId: string
  loopId: string
  pageParam: FetchVideosPageParamType
}): Promise<FetchVideosReturnType> {
  try {
    const url = new URL(
      'https://api.qa.begenuin.com/goservices/profile/brand/videos',
    )
    url.searchParams.append('brand_id', brandId)
    url.searchParams.append('page_limit_profile_videos', '8')
    url.searchParams.append('community_id', communityId)
    url.searchParams.append('chat_id', loopId)
    if (pageParam?.lastVideoId) {
      url.searchParams.append('last_message_id', pageParam.lastVideoId)
    }
    if (pageParam?.pageSession) {
      url.searchParams.append('page_session', pageParam.pageSession)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true), // Ensure necessary headers are included
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile videos')
    }

    const resData = await response.json()
    const videos = parseVideoResponse(resData.data?.messages)
    return {
      videos,
      end: false,
      nextPageParam: {
        lastVideoId: videos[videos.length - 1].id,
        pageSession: resData.data?.page_session ?? '',
      },
    }
  } catch (error) {
    console.error('::Error in profile videos API::', error)
    throw new Error('Something went wrong with the profile videos API.')
  }
}

export async function fetchBrandFeed(
  brandId: string,
  pageParam?: { lastMessageId?: string },
  fromVideoId?: string,
): Promise<{ feed: FeedVideoType[]; end: boolean }> {
  try {
    const url = new URL('https://api.qa.begenuin.com/goservices/feed/brand')
    url.searchParams.append('brand_id', brandId)

    if (pageParam?.lastMessageId) {
      url.searchParams.append('last_video_id', pageParam.lastMessageId)
    }
    if (!pageParam?.lastMessageId && fromVideoId) {
      url.searchParams.append('from_video_id', fromVideoId)
    }
    console.log('url:::', url.toString(), pageParam, fromVideoId)
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...getBaseHeaders(true) },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error fetching brand feed:', data)
      throw new Error('Something went wrong!!')
    }

    return {
      feed: data.data.feeds as FeedVideoType[],
      end: data.data.end_of_feed as boolean,
    }
  } catch (e) {
    console.error('Error in fetchBrandFeed:', e)
    throw new Error('Something went wrong!!')
  }
}

function parseCommunityResponse(
  input: z.infer<typeof CommunityListSchema>,
): CommunityType[] {
  return input.map<CommunityType>((community) => {
    return {
      id: community.community_id,
      isPrivate: community.type === 2,
      name: community.name ?? '',
      profileImage: community.dp_m ?? '',
      totalLoops: community.no_of_loops,
      slug: community.slug,
      brand: community.brand
        ? {
            name: community.brand.name,
            logo: community.brand.logo,
            slug: community.brand.brand_slug,
          }
        : undefined,
      role: mapCommunityUserRole(
        community.logged_in_user_role,
        community.is_community_join_requested,
      ),
      loops: parseGroupResponse(community.loops),
    }
  })
}

function parseGroupResponse(loops: z.infer<typeof loopSchema>[]): LoopType[] {
  return loops.map((loop) => {
    return {
      id: loop.chat_id,
      name: loop.group.group_name ?? '',
      slug: loop.slug,
      totalVideoCount: loop.group.no_of_videos,
      videos: parseVideoResponse(loop.messages),
      isPrivate: !loop.is_view_allowed,
      privacyInfo: loop.actions.map((action) => ({
        actionId: action.action_id,
        accessTypeId: action.access_type_id,
      })),
    }
  })
}

function parseVideoResponse(
  messages: z.infer<typeof messageSchema>[],
): VideoType[] {
  return messages.map((message) => {
    return {
      id: message.message_id,
      sparkCount: message.no_of_views,
      thumbnail: message.thumbnail_url_s ?? '',
    }
  })
}

export default {}
