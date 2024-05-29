import { validateProfileDetails } from '@lib/schemas/profile/profile'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  parseFeedResponse,
  parseProfileCommunityResponse,
  parseProfileLoopResponse,
  parseProfileVideoResponse,
} from './api-response-parser'
import { axiosInstance } from './instance'

export async function fetchUserData(slug: string) {
  return await axios
    .post(process.env.NEXT_PUBLIC_API_URL + '/api/v3/users/get_profile', {
      brand_slug: slug,
    })
    .then((res) => {
      return validateProfileDetails(res.data.data)
    })
    .catch((e) => {
      throw new Error('Something went wrong in profile details api.')
    })
}

let pageSession: string | undefined
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
      pageSession = resData.page_session
      const communities = parseProfileCommunityResponse(resData?.communities)
      return {
        communities,
        end: resData.end_of_communities,
        pageSession: resData.page_session,
      }
    })
    .catch((e) => {
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
      pageSession = resData.page_session
      return parseProfileVideoResponse(resData.messages)
    })
    .catch((e) => {
      console.log('Error in profile videos api::', e)
      throw new Error('Something went wrong with profile videos api.')
    })
}

export async function fetchProfileFeed(brandId: number, pageParam?: { lastMessageId: string }, fromVideoId?: string) {
  return await axiosInstance
    .get('/api/v3/brand/feed', {
      params: {
        brand_id: brandId,
        page_session: pageSession,
        from_message_id: pageParam?.lastMessageId ? undefined : fromVideoId,
        last_message_id: pageParam?.lastMessageId,
      },
    })
    .then((res) => {
      const resData = res.data.data
      pageSession = resData.page_session
      return { feed: parseFeedResponse(resData.feeds), end: resData.end_of_messages }
    })
    .catch((e) => {
      console.log('error::', e)
      throw new Error('Something went wrong!!')
    })
}

export function getProfileFeed(brandId: number, fromVideoId: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchProfileFeed(brandId, pageParam, fromVideoId),
    queryKey: ['feed', brandId, fromVideoId],
    getNextPageParam(lastPage) {
      if (lastPage.end) return
      return { lastMessageId: lastPage.feed[lastPage.feed.length - 1].video.id }
    },
  })
}
