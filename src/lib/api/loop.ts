import { type CommentListType, validateCommentList } from '@lib/schemas/loop/comment'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchLoopDetails(loopId: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/details', { params: { chat_id: loopId } })
    .then((res) => {
      return res?.data?.data
    })
    .catch((e) => {
      throw new Error('Something went wrong!!')
    })
}

async function fetchLoopVideos(loopId: string, pageNo = 0) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/videos_v2', {
      params: {
        share_string: loopId,
        page: pageNo,
      },
    })
    .then((res) => {
      return { videos: res.data.data.videos, end: res.data.data.end_of_videos ?? false }
    })
    .catch((e) => {
      throw new Error('Somethig went wrong with loop videos fetching api.')
    })
}

export function getLoopVideos(loopId: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchLoopVideos(loopId, pageParam),
    queryKey: ['loop', 'videos', 'paginated'],
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.end) {
        return
      }
      return pages.length
    },
  })
}

async function fetchLoopCohosts(chatId: string, type: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/users', {
      params: {
        type,
        chat_id: chatId,
      },
    })
    .then((res) => {
      return res.data.data
    })
    .catch((e) => {
      throw new Error('Something went wrong in fetching videos.')
    })
}

export function getLoopCohosts(chatId: string, type: string) {
  return useQuery({
    queryKey: ['loop', 'cohosts', 'users'],
    queryFn: async () => await fetchLoopCohosts(chatId, type),
  })
}

export function getLoopVideoComments(videoShareString: string) {
  let promise: Promise<{ comments: CommentListType; page: number }> | null = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      if (!promise) {
        const nextPage = pageParam ?? 0
        promise = axios
          .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/page_comments', {
            params: {
              loop_video_ss: videoShareString,
              page: nextPage,
            },
          })
          .then((res) => {
            return { comments: validateCommentList(res.data.data), page: nextPage + 1 }
          })
          .catch((e) => {
            throw new Error('Something went wrong with comments api!')
          })
          .finally(() => {
            promise = null
          })
      }
      return await promise
    },
    getNextPageParam(lastPage) {
      if (lastPage.comments.length === 0) {
        return undefined
      }
      return lastPage.page
    },
    queryKey: ['comments', videoShareString],
  })
}
