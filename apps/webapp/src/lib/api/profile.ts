import { parseCommunityResponse, parseGroupResponse, parseVideoResponse } from '@/components/tree-structure/profile'
import type {
  FetchCommunityPageParamType,
  FetchCommunityReturnType,
  FetchLoopPageParamType,
  FetchLoopReturnType,
  FetchVideosPageParamType,
  FetchVideosReturnType,
} from '@/components/tree-structure/types'
import { type FeedVideoType } from '../utils/react-query/type'
import { axiosInstance } from '@/lib/api/instance'
import { validateProfileDetails } from '@lib/schemas/profile/profile'
import axios from 'axios'
import { NOT_FOUND_ERROR_CODES } from '../constants'
import { getApiUrl, mapCommunityUserRole, tryJsonParse } from '../utils'
import { type VideoPlayerModalType } from '../schemas/player/video'

/**
 * Pass the page param type in input.
 */
type BaseFunctionPropsType<P = unknown, Others = object> = {
  pageParam: P
  profileId: string
  videosLimit: number
  forBrand: boolean
} & Others

type Headers = Record<string, string>

export async function fetchUserData(nickname: string, headers?: Headers, forBrand?: boolean) {
  let parsedHeader
  if (headers)
    parsedHeader = Object.keys(headers).includes('subdomain')
      ? { 'x-brand-subdomain': headers.subdomain }
      : { 'x-brand-domain': headers.domain }

  const payload = forBrand ? { brand_slug: nickname } : { nickname }

  return await axios
    .create({ baseURL: process.env.NEXT_PUBLIC_API_URL })
    .post('/goservices/profile/info', payload, { headers: parsedHeader })
    .then((res) => {
      return validateProfileDetails(res.data.data)
    })
    .catch((e) => {
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.user || e.response.data.code === NOT_FOUND_ERROR_CODES.brand) {
        throw new Error(e.response.data.code)
      }
      throw new Error('Something went wrong in profile details api.')
    })
}

/**
 * This will prepare api url for brand or profile as both gives same response and brand page is same as profile page.
 * @param endpoint -> Url which contains the brand.By default pass the url which contains the brand.
 * @param param1
 * @returns
 */
function prepareApiUrl(
  endpoint: string,
  { forBrand, profileId, videosLimit }: { forBrand: boolean; profileId: string; videosLimit?: number }
) {
  const url = new URL(getApiUrl(forBrand ? endpoint : endpoint.replace('/brand', '')))
  url.searchParams.append(forBrand ? 'brand_id' : 'user_id', profileId)
  if (videosLimit) url.searchParams.append('page_limit_profile_videos', videosLimit.toString())
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

    if (pageParam?.pageSession) url.searchParams.append('page_session', pageParam.pageSession)
    if (pageParam?.lastCommunityId) url.searchParams.append('last_community_id', pageParam.lastCommunityId)

    const response = await axiosInstance.get(url.toString())

    const resData = response.data
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
}: BaseFunctionPropsType<FetchLoopPageParamType, { communityId: string }>): Promise<FetchLoopReturnType> {
  try {
    const url = prepareApiUrl('goservices/profile/brand/loops', {
      forBrand,
      profileId,
      videosLimit,
    })

    url.searchParams.append('community_id', communityId)
    if (pageParam?.lastLoopId) url.searchParams.append('last_chat_id', pageParam.lastLoopId)
    if (pageParam?.pageSession) url.searchParams.append('page_session', pageParam.pageSession)

    const response = await axiosInstance.get(url.toString())

    const resData = response.data
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

    const response = await axiosInstance.get(url.toString())

    const resData = response.data
    const videos = parseVideoResponse(resData.data?.messages)

    return {
      videos,
      end: false, // Assuming this stays hardcoded like your original
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
  fromVideoId?: string
) {
  try {
    const url = prepareApiUrl(`goservices${!forBrand ? '/profile' : ''}/feed${forBrand ? '/brand' : ''}`, {
      forBrand,
      profileId,
    })

    if (pageParam?.lastMessageId) {
      url.searchParams.append('last_video_id', pageParam.lastMessageId)
    }

    if (!pageParam?.lastMessageId && fromVideoId) {
      url.searchParams.append('from_video_id', fromVideoId)
    }

    const response = await axiosInstance.get(url.toString())

    const data = response.data
    const feeds = parseFeedResponse(data.data.feeds)

    return {
      videos: feeds,
      end: data.data.end_of_feed as boolean,
    }
  } catch (e) {
    console.error('Error in fetchBrandFeed:', e)
    throw new Error('Something went wrong!!')
  }
}

function parseFeedResponse(feeds: FeedVideoType[]) {
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
      description: loop?.group_description,
    },
    owner: {
      isAvatar: owner.is_avatar ?? false,
      profileImage: owner.profile_image_s ?? owner.profile_image_m ?? owner.profile_image,
      userName: owner.username,
      name: owner.name,
      ...(owner.brand && {
        brand: {
          brand_id: Number(owner.brand.brand_id),
          brand_slug: owner.brand.brand_slug,
          brand_user_logo: owner.brand?.brand_user_logo || 1,
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
      isSparked: video.is_sparked ?? null,
      descriptionArr: video.description_data ? tryJsonParse(video.description_data) : undefined,
      descriptionText: video.description_text ?? null,
      linkoutId: video.linkouts_id ? Number(video.linkouts_id) || null : null,
      clickableUrl: video.clickable_url ?? null,
      thumbnailM: video.thumbnail_url_l || video.thumbnail_url,
      linkouts: video.linkouts,
      is_pinned: video.is_pinned ?? false,
    },
  }))
}
