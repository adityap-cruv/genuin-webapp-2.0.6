import { validateCommunityDetails } from '@lib/schemas/community'
import { validateVideoListData } from '@lib/schemas/video'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchCommunityDetails(handle: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/details', {
      params: {
        community_handle: handle,
      },
    })
    .then((res) => res.data.data)
    .catch((e) => {
      console.log(e)
      throw new Error('Something went wrong with community detail!')
    })
}

export function getCommunityVideos(handle: string) {
  let promise: null | Promise<{ videos: any; ref: any }> = null
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => {
      if (!promise) {
        promise = axios
          .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/videos', {
            params: {
              community_handle: handle,
              ref: pageParam,
            },
          })
          .then((res) => {
            return { videos: res.data.data.feed, ref: res.data.data.ref }
          })
          .catch((e) => {
            console.log(e)
            throw new Error('Something went wrong with community videos!')
          })
          .finally(() => {
            promise = null
          })
      }
      return promise
    },
    queryKey: ['community', 'videos'],
    getNextPageParam: (lastPage) => {
      if (!lastPage.videos?.length || !lastPage.ref) return
      return lastPage.ref
    },
  })
}

export async function fetchCommunityLoops(handle: string) {
  return axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/loops', {
      params: {
        community_handle: handle,
      },
    })
    .then((res) => {
      console.log('res:', res)
      return res.data.data?.loops
    })
    .catch((e) => {
      throw new Error('Something went wrong with loop detail!')
    })
}

export function getCommunityLoops(handle: string) {
  return useQuery({ queryFn: () => fetchCommunityLoops(handle), queryKey: ['community', 'loops'] })
}

async function fetchVideoComments(handle: string) {
  return axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/')
}
