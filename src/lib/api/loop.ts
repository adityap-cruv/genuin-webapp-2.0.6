import { type CommentListType, validateCommentList } from '@lib/schemas/loop/comment'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { axiosInstance } from './instance'
import { validateLoopCohosts } from '@lib/schemas/loop/cohosts'
import { validateLoopSubscribers } from '@lib/schemas/loop/subscribers'
import { parseVideosFromLoop } from './api-response-parser'
import { type VideoPlayerModalCommunityType, type VideoPlayerModalLoopType } from '@lib/schemas/player/video'

export async function fetchLoopDetails(slug: string) {
  return await axiosInstance
    .get('/api/v3/conversation/details', {
      params: { slug },
    })
    .then((res) => {
      return res?.data?.data
    })
    .catch((e) => {
      throw new Error('Something went wrong!!')
    })
}

export function getLoopDetails(slug: string) {
  return useQuery({
    queryKey: ['loop', 'details', slug],
    queryFn: async () => await fetchLoopDetails(slug),
  })
}

async function fetchLoopVideos(
  pageParams: string,
  loop: VideoPlayerModalLoopType,
  community: VideoPlayerModalCommunityType
) {
  return await axiosInstance
    .get('/api/v3/conversation/messages', {
      params: {
        slug: loop.slug,
        last_message_id: pageParams,
      },
    })
    .then((res) => {
      const resData = res.data.data
      const videos = parseVideosFromLoop(resData.messages, loop, community)
      return { videos, end: resData.end_of_messages }
    })
    .catch((e) => {
      throw new Error('Something went wrong with loop videos fetching api.')
    })
}

export function getLoopVideos({
  loop,
  community,
}: {
  loop: VideoPlayerModalLoopType
  community: VideoPlayerModalCommunityType
}) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchLoopVideos(pageParam, loop, community),
    queryKey: ['loop', 'videos', 'paginated', loop.slug],
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.end) {
        return
      }
      return lastPage.videos[lastPage.videos.length - 1].video?.id
    },
  })
}

async function fetchLoopCohosts(slug: string, pageParam: string) {
  return await axiosInstance
    .get('/api/v3/conversation/members', {
      params: {
        slug,
        last_member_id: pageParam,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return { members: validateLoopCohosts(resData?.members), end: resData.end_of_result }
    })
    .catch((e) => {
      throw new Error('Something went wrong in fetching loop cohosts.')
    })
}

export function getLoopCohosts(slug: string) {
  return useInfiniteQuery({
    queryKey: ['cohosts', slug],
    queryFn: async ({ pageParam }) => await fetchLoopCohosts(slug, pageParam),
    getNextPageParam(lastPage, allPages) {
      if (lastPage.end) return
      return lastPage.members[lastPage.members.length - 1].member_id
    },
  })
}

async function fetchLoopSubscribers(slug: string, pageParam: string) {
  return await axiosInstance
    .get('/api/v3/conversation/subscribers', {
      params: {
        slug,
        last_member_id: pageParam,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return { subscribers: validateLoopSubscribers(resData?.subscribers), end: resData.end_of_result }
    })
    .catch((e) => {
      throw new Error('Something went wrong in fetching loop cohosts.')
    })
}

export function getLoopSubscribers(slug: string) {
  return useInfiniteQuery({
    queryKey: ['users', slug],
    queryFn: async ({ pageParam }) => await fetchLoopSubscribers(slug, pageParam),
  })
}

export function getVideosComments(videoId: string) {
  let promise: Promise<{ comments: CommentListType; end: boolean }> | null = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      if (!promise) {
        promise = axios
          .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/comments', {
            params: {
              conversation_id: videoId,
              last_comment_id: pageParam,
            },
          })
          .then((res) => {
            const resData = res.data.data
            return { comments: validateCommentList(resData.comments), end: resData.end_of_result }
          })
          .catch((e) => {
            throw new Error('Something went wrong with comxxxments api!')
          })
          .finally(() => {
            promise = null
          })
      }
      return await promise
    },
    getNextPageParam(lastPage) {
      if (lastPage.end) {
        return
      }
      return lastPage.comments[lastPage.comments.length - 1].comment_id
    },
    queryKey: ['comments', videoId],
  })
}

export async function subscribeLoop(uuid: string, subscribe: boolean) {
  return await axiosInstance
    .post('/api/v3/conversation/subscription', {
      chat_id: uuid,
      subscribe,
    })
    .then((res) => {
      return { code: res.status, data: res.data.data }
    })
    .catch((e) => {
      return { code: Number(e.response.data.code) }
    })
}
