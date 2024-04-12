import { validateCommunityDetails } from '@lib/schemas/community'
import { validateCommunityLoopList, type CommunityLoopListType } from '@lib/schemas/community/loops'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { parseFeedResponse } from './api-response-parser'

export async function fetchCommunityDetails(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/community', {
      params: {
        slug,
      },
    })
    .then((res) => validateCommunityDetails(res.data.data))
    .catch((e) => {
      // TODO:
      /**
       * Here in this api one request is being made undexpectedly.
       * Which is "/api/v3/public/community/details?community_id[handle]=cow_face"
       * Figure out why this error happening and solve the issue.
       * @example Community handle: @kvkic
       */
      console.log('error::', e)
      throw new Error('Something went wrong with community detail!')
    })
}

export function getCommunityVideos(slug: string) {
  let promise: null | Promise<{ videos: any; end?: boolean }> = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      if (!promise) {
        promise = axios
          .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/home/community_videos', {
            params: {
              slug,
              last_video_id: pageParam,
            },
          })
          .then((res) => {
            const resData = res.data.data
            const videos = parseFeedResponse(resData.feeds)
            return { videos, end: resData.end_of_videos }
          })
          .catch((e) => {
            throw new Error('Something went wrong with community videos!')
          })
          .finally(() => {
            promise = null
          })
      }
      return await promise
    },
    queryKey: ['community', 'videos', slug],
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return
      return lastPage.videos
    },
  })
}

export async function fetchCommunityLoops(slug: string): Promise<{ loops: CommunityLoopListType }> {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/community/loops', {
      params: {
        slug,
      },
    })
    .then((res) => {
      return { loops: validateCommunityLoopList(res.data.data.conversations) }
    })
    .catch((e) => {
      throw new Error('Something went wrong with loop detail!')
    })
}

export function getCommunityLoops(slug: string) {
  return useQuery({ queryFn: async () => await fetchCommunityLoops(slug), queryKey: ['community', 'loops', slug] })
}

// async function fetchVideoComments(handle: string) {
//   return await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/')
// }

async function fetchCommunityMembers(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/community/members', {
      params: {
        slug,
      },
    })
    .then((res) => {
      const resData = res.data.data
      return { members: resData?.members }
    })
    .catch((e) => {
      throw new Error('Something went wrong in fetching community members.')
    })
}

export function getCommunityMembers(slug: string) {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => await fetchCommunityMembers(slug),
  })
}
