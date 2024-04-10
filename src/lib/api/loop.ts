import { type CommentListType, validateCommentList } from '@lib/schemas/loop/comment'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { axiosInstance } from './instance'
import { validateLoopCohosts } from '@lib/schemas/loop/cohosts'
import { validateLoopSubscribers } from '@lib/schemas/loop/subscribers'
import { validateLoopVideos } from '@lib/schemas/loop/videos'

export async function fetchLoopDetails(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/conversation/details', {
      params: { slug },
    })
    .then((res) => {
      return res?.data?.data
    })
    .catch((e) => {
      throw new Error('Something went wrong!!')
    })
}

async function fetchLoopVideos(slug: string, pageParams: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/conversation/messages', {
      params: {
        slug,
        last_message_id: pageParams,
      },
    })
    .then((res) => {
      const resData = res.data.data
      console.log('res dta:;', resData)
      return { videos: validateLoopVideos(resData.messages), end: resData.end_of_result }
    })
    .catch((e) => {
      throw new Error('Somethig went wrong with loop videos fetching api.')
    })
}

export function getLoopVideos(slug: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchLoopVideos(slug, pageParam),
    queryKey: ['loop', 'videos', 'paginated', slug],
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.end) {
        return
      }
      return lastPage.videos[lastPage.videos.length - 1].message_id
    },
  })
}

// async function fetchLoopCohosts(slug: string, type: UserType) {
//   return await axios
//     .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/users', {
//       params: {
//         type,
//         loop_id: { slug },
//         ref: undefined,
//       },
//     })
//     .then((res) => {
//       const resData = res.data.data
//       return { users: resData?.list, ref: resData.ref, end: resData.end_page }
//     })
//     .catch((e) => {
//       throw new Error('Something went wrong in fetching videos.')
//     })
// }

async function fetchLoopCohosts(slug: string, pageParam: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/conversation/members', {
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
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/conversation/subscribers', {
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

// TODO: check this loop_id or video_id.
export function getLoopVideoComments(videoShareString: string) {
  let promise: Promise<{ comments: CommentListType; ref: any; end: boolean }> | null = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      if (!promise) {
        promise = axios
          .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/page_comments', {
            params: {
              loop_id: { share_string: videoShareString },
              ref: pageParam,
            },
          })
          .then((res) => {
            const resData = res.data.data
            return { comments: validateCommentList(resData.list), ref: resData.ref, end: resData.end_page }
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
      if (lastPage.end) {
        return
      }
      return lastPage.ref
    },
    queryKey: ['comments', videoShareString],
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
