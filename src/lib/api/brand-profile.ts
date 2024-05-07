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
import { useGenuinOptions } from '@lib/stores/genuin-options'

export async function fetchUserData(slug: string) {
  return await axios
    .post(process.env.NEXT_PUBLIC_API_URL + '/api/v3/users/get_profile', {
      brand_slug : slug,
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
  userId: string,
  pageParam: { pageSession: string; lastCommunityId: string },
  limit: number
) {
  console.log("Brand Id:",useGenuinOptions.getState().brandId)
  return await axiosInstance
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/brand/communities', {
      params: {
        brand_id: useGenuinOptions.getState().brandId,
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
      console.log("Error:", e)
      throw new Error('Something went wrong with profile community api.')
    })
}

export function getCommunities(userId: string, limit: number) {
  return useInfiniteQuery({
    queryKey: ['communities', userId],
    queryFn: async ({ pageParam }) => await fetchCommunities(userId, pageParam, limit),
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
  userId: string,
  limit: number,
  communityId: string,
  lastLoopId: string
) {
  return await axiosInstance
    .get('/api/v3/brand/loops', {
      params: {
        brand_id: useGenuinOptions.getState().brandId,
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
  userId: string,
  limit: number,
  communityId: string,
  loopId: string,
  lastVideoId: string
) {
  return await axiosInstance
    .get('/api/v3/brand/loop_videos', {
      params: {
        brand_id: useGenuinOptions.getState().brandId,       
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

export async function fetchProfileFeed(userId: string, pageParam?: { lastMessageId: string }, fromVideoId?: string) {
  return await axiosInstance
    .get('/api/v3/brand/feed', {
      params: {
        brand_id: useGenuinOptions.getState().brandId,       
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

export function getProfileFeed(userId: string, fromVideoId: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchProfileFeed(userId, pageParam, fromVideoId),
    queryKey: ['feed', userId, fromVideoId],
    getNextPageParam(lastPage) {
      if (lastPage.end) return
      return { lastMessageId: lastPage.feed[lastPage.feed.length - 1].video.id }
    },
  })
}
