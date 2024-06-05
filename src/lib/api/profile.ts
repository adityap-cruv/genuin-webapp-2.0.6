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

type Headers = Record<string, string>

export async function fetchUserData(nickname: string, headers?: Headers) {
  let parsedHeader
  if (headers)
    parsedHeader = Object.keys(headers).includes('subdomain')
      ? { 'x-brand-subdomain': headers.subdomain }
      : { 'x-brand-domain': headers.domain }

  return await axios
    .post(
      process.env.NEXT_PUBLIC_API_URL + '/api/v3/users/get_profile',
      {
        nickname,
      },
      { headers: parsedHeader }
    )
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
  return await axiosInstance
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/profile/communities', {
      params: {
        user_id: userId,
        page_session: pageParam?.pageSession ?? undefined,
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
    .get('/api/v3/profile/loops', {
      params: {
        user_id: userId,
        page_session: pageSession,
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
    .get('/api/v3/profile/loop_videos', {
      params: {
        user_id: userId,
        community_id: communityId,
        chat_id: loopId,
        last_message_id: lastVideoId,
        page_limit_profile_videos: limit,
        page_session: pageSession,
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
    .get('/api/v3/profile/feed', {
      params: {
        user_id: userId,
        page_session: pageSession,
        from_message_id: pageParam?.lastMessageId ? undefined : fromVideoId,
        last_message_id: pageParam?.lastMessageId,
      },
    })
    .then((res) => {
      const resData = res.data.data
      pageSession = resData.page_session
      console.log('resData', resData)
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
