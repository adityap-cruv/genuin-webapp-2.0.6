import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchCommunityDetails(handle: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/details', {
      params: {
        community_handle: handle,
      },
    })
    .then((res) => res.data.data)
    .catch((e) => {
      throw new Error('Something went wrong with community detail!')
    })
}

export function getCommunityVideos(handle: string) {
  let promise: null | Promise<{ videos: any; ref: any }> = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
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
            throw new Error('Something went wrong with community videos!')
          })
          .finally(() => {
            promise = null
          })
      }
      return await promise
    },
    queryKey: ['community', 'videos'],
    getNextPageParam: (lastPage) => {
      if (!lastPage.videos?.length || !lastPage.ref) return
      return lastPage.ref
    },
  })
}

//  TODO Add Pagination.
export async function fetchCommunityLoops(handle: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/loops', {
      params: {
        community_handle: handle,
      },
    })
    .then((res) => {
      return res.data.data?.loops
    })
    .catch((e) => {
      throw new Error('Something went wrong with loop detail!')
    })
}

export function getCommunityLoops(handle: string) {
  return useQuery({ queryFn: async () => await fetchCommunityLoops(handle), queryKey: ['community', 'loops'] })
}

// async function fetchVideoComments(handle: string) {
//   return await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/')
// }
