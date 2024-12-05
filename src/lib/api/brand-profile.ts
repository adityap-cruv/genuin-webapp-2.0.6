import { validateProfileDetails } from '@lib/schemas/profile/profile'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  parseFeedResponseFromGoApi,
  parseProfileCommunityResponse,
  parseProfileLoopResponse,
  parseProfileVideoResponse,
} from './api-response-parser'
import { axiosInstance } from './instance'
import { NOT_FOUND_ERROR_CODES } from '../constants'

type Headers = Record<string, string>
export async function fetchBrandData(slug: string, headers?: Headers) {
  let parsedHeader
  if (headers)
    parsedHeader = Object.keys(headers).includes('subdomain')
      ? { 'x-brand-subdomain': headers.subdomain }
      : { 'x-brand-domain': headers.domain }
  return await axios
    .post(
      process.env.NEXT_PUBLIC_API_URL + '/api/v3/users/get_profile',
      {
        brand_slug: slug,
      },
      { headers: parsedHeader }
    )
    .then((res) => {
      return validateProfileDetails(res.data.data)
    })
    .catch((e) => {
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.brand) {
        throw new Error(e.response.data.code)
      }
      throw new Error('Something went wrong in profile details api.')
    })
}

async function fetchCommunities(
  brandId: number,
  pageParam: { pageSession: string; lastCommunityId: string },
  limit: number
) {
  return await axiosInstance
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/brand/communities', {
      params: {
        brand_id: brandId,
        // page_session: pageParam?.pageSession ?? undefined,
        last_community_id: pageParam?.lastCommunityId ?? undefined,
        page_limit_profile_videos: limit,
      },
    })
    .then((res) => {
      const resData = res.data.data
      const communities = parseProfileCommunityResponse(resData?.communities)
      return {
        communities,
        end: resData.end_of_communities,
        pageSession: resData.page_session,
      }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('Error:', e)
      throw new Error('Something went wrong with profile community api.')
    })
}

export function getCommunities(brandId: number, limit: number) {
  return useInfiniteQuery({
    queryKey: ['communities', brandId],
    queryFn: async ({ pageParam }) => await fetchCommunities(brandId, pageParam, limit),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) {
        return
      }
      return {
        pageSession: lastPage.pageSession,
        lastCommunityId: lastPage.communities[lastPage.communities.length - 1].id,
      }
    },
  })
}

export async function fetchProfileCommunityLoops(
  brandId: number,
  limit: number,
  communityId: string,
  lastLoopId: string
) {
  return await axiosInstance
    .get('/api/v3/brand/loops', {
      params: {
        brand_id: brandId,
        community_id: communityId,
        last_chat_id: lastLoopId,
        page_limit_profile_videos: limit,
      },
    })
    .then((res) => {
      return parseProfileLoopResponse(res.data.data.loops)
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('e::', e)
      throw new Error('Something went wrong with profile loops api.')
    })
}

export async function fetchProfileVideos(
  brandId: number,
  limit: number,
  communityId: string,
  loopId: string,
  lastVideoId: string
) {
  return await axiosInstance
    .get('/api/v3/brand/loop_videos', {
      params: {
        brand_id: brandId,
        community_id: communityId,
        chat_id: loopId,
        last_message_id: lastVideoId,
        page_limit_profile_videos: limit,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return parseProfileVideoResponse(resData.messages)
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('Error in profile videos api::', e)
      throw new Error('Something went wrong with profile videos api.')
    })
}

export async function fetchBrandFeed(brandId: number, pageParam?: { lastMessageId: string }, fromVideoId?: string) {
  return await axiosInstance
    .get('/goservices/feed/brand', {
      params: {
        brand_id: brandId,
        from_video_id: pageParam?.lastMessageId ? undefined : fromVideoId,
        last_video_id: pageParam?.lastMessageId,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return { feed: parseFeedResponseFromGoApi(resData.feeds), end: resData.end_of_feed }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error::', e)
      throw new Error('Something went wrong!!')
    })
}

export function getBrandFeed(brandId: number, fromVideoId: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchBrandFeed(brandId, pageParam, fromVideoId),
    queryKey: ['feed', brandId, fromVideoId],
    getNextPageParam(lastPage) {
      if (lastPage.end) return
      return { lastMessageId: lastPage.feed[lastPage.feed.length - 1].video.id }
    },
  })
}
