import type {
  FetchCommunityPageParamType,
  FetchCommunityReturnType,
  FetchLoopPageParamType,
  FetchLoopReturnType,
  FetchVideosPageParamType,
  FetchVideosReturnType,
} from '@/components/tree-structure/types'
import { getBaseHeaders } from '@/headers'
import { FeedVideoType, FetchFeedReturnType } from '@/type'
import {
  parseCommunityResponse,
  parseGroupResponse,
  parseVideoResponse,
} from '../schema/posts'
import { getApiUrl } from '@/utils'

/**
 * Pass the page param type in input.
 */
type BaseFunctionPropsType<P = unknown, Others = object> = {
  pageParam: P
  profileId: string
  videosLimit: number
  forBrand: boolean
} & Others

/**
 * This will prepare api url for brand or profile as both gives same response and brand page is same as profile page.
 * @param endpoint -> Url which contains the brand.By default pass the url which contains the brand.
 * @param param1
 * @returns
 */
function prepareApiUrl(
  endpoint: string,
  {
    forBrand,
    profileId,
    videosLimit,
  }: { forBrand: boolean; profileId: string; videosLimit?: number },
) {
  const url = new URL(
    getApiUrl(forBrand ? endpoint : endpoint.replace('/brand', '')),
  )
  url.searchParams.append(forBrand ? 'brand_id' : 'user_id', profileId)
  if (videosLimit)
    url.searchParams.append('page_limit_profile_videos', videosLimit.toString())
  return url
}

/**
 * Fetches the communities for the profile or brand.
 * @param param0
 * @returns
 */
export async function fetchProfileCommunities({
  pageParam,
  profileId,
  videosLimit,
  forBrand,
}: BaseFunctionPropsType<FetchCommunityPageParamType>): Promise<FetchCommunityReturnType> {
  try {
    const url = prepareApiUrl('goservices/profile/brand/communities', {
      forBrand,
      profileId,
      videosLimit,
    })
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
    const communities = parseCommunityResponse(resData.data?.communities)
    return {
      communities,
      end: resData.data?.end_of_communities ?? false,
      nextPageParam: {
        lastCommunityId: communities[communities.length - 1]?.id,
        pageSession: resData.data?.page_session ?? '',
      },
    }
  } catch (error) {
    console.error('::Error fetching communities::', error)
    throw new Error('Something went wrong with the communities API.')
  }
}

/**
 * Fetches the loops for the profile or brand.
 * @param param0
 * @returns
 */
export async function fetchProfileLoops({
  pageParam,
  profileId,
  communityId,
  videosLimit,
  forBrand,
}: BaseFunctionPropsType<
  FetchLoopPageParamType,
  { communityId: string }
>): Promise<FetchLoopReturnType> {
  try {
    const url = prepareApiUrl('goservices/profile/brand/loops', {
      forBrand,
      profileId,
      videosLimit,
    })

    url.searchParams.append('community_id', communityId)
    if (pageParam?.lastLoopId)
      url.searchParams.append('last_chat_id', pageParam.lastLoopId)
    if (pageParam?.pageSession)
      url.searchParams.append('page_session', pageParam.pageSession)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true), // Assuming this function returns necessary headers
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile loops')
    }

    const resData = await response.json()
    const loops = parseGroupResponse(resData.data?.loops)
    return {
      loops,
      end: resData.data?.end_of_loops ?? false,
      nextPageParam: {
        lastLoopId: loops[loops.length - 1].id,
        pageSession: pageParam?.pageSession ?? '',
      },
    }
  } catch (error) {
    console.error('::Error in api/v3/profile/loops::', error)
    throw new Error('Something went wrong with the profile loops API.')
  }
}

/**
 * Fetches the videosList for the profile or brand.
 * @param param0
 * @returns
 */
export async function fetchProfileVideos({
  profileId,
  communityId,
  loopId,
  pageParam,
  videosLimit,
  forBrand,
}: BaseFunctionPropsType<
  FetchVideosPageParamType,
  { communityId: string; loopId: string }
>): Promise<FetchVideosReturnType> {
  try {
    const url = prepareApiUrl('goservices/profile/brand/videos', {
      forBrand,
      profileId,
      videosLimit,
    })

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

/**
 *
 * @param profileId
 * @param forBrand
 * @param pageParam
 * @param fromVideoId
 * @returns
 */
export async function fetchProfileFeed(
  profileId: string,
  forBrand: boolean,
  pageParam?: { lastMessageId?: string },
  fromVideoId?: string,
): Promise<FetchFeedReturnType> {
  try {
    const url = prepareApiUrl(
      `goservices${!forBrand ? '/profile' : ''}/feed${forBrand ? '/brand' : ''}`,
      { forBrand, profileId },
    )

    if (pageParam?.lastMessageId) {
      url.searchParams.append('last_video_id', pageParam.lastMessageId)
    }
    if (!pageParam?.lastMessageId && fromVideoId) {
      url.searchParams.append('from_video_id', fromVideoId)
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...getBaseHeaders(true) },
    })

    if (!response.ok) {
      console.error('Error fetching brand feed:', response)
      throw new Error('Something went wrong!!')
    }
    const data = await response.json()

    return {
      videos: data.data.feeds as FeedVideoType[],
      end: data.data.end_of_feed as boolean,
    }
  } catch (e) {
    console.error('Error in fetchBrandFeed:', e)
    throw new Error('Something went wrong!!')
  }
}
