import { type CommentListType, validateCommentList } from '@lib/schemas/loop/comment'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchLoopDetails(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/details', {
      params: { loop_id: { slug } },
    })
    .then((res) => {
      return res?.data?.data
    })
    .catch((e) => {
      console.log(e.response.data)
      throw new Error('Something went wrong!!')
    })
}

async function fetchLoopVideos(slug: string, ref: any) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/videos_v2', {
      params: {
        loop_id: { slug },
        ref,
      },
    })
    .then((res) => {
      return { videos: res.data.data.list, end: res.data.data.end_page ?? false, ref: res.data.data.ref }
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
      return lastPage.ref
    },
  })
}

// TODO: Check for ref and pagination is enabled or not.
type UserType = 'subscribers' | 'members'
async function fetchLoopCohosts(slug: string, type: UserType) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/rt/users', {
      params: {
        type,
        loop_id: { slug },
        ref: undefined,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return { users: resData?.list, ref: resData.ref, end: resData.end_page }
    })
    .catch((e) => {
      throw new Error('Something went wrong in fetching videos.')
    })
}

export function getLoopCohosts(slug: string, type: UserType) {
  return useQuery({
    queryKey: ['cohosts'],
    queryFn: async () => await fetchLoopCohosts(slug, type),
  })
}

export function getLoopSubscribers(slug: string, type: UserType) {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => await fetchLoopCohosts(slug, type),
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
