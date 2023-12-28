import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

export async function fetchCommunityDetails(handle: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/details', {
      params: {
        community_id: { handle },
      },
    })
    .then((res) => res.data.data)
    .catch((e) => {
      throw new Error('Something went wrong with community detail!')
    })
}

export function getCommunityVideos(handle: string) {
  let promise: null | Promise<{ videos: any; ref: any; end?: boolean }> = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      if (!promise) {
        promise = axios
          .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/videos', {
            params: {
              community_id: { handle },
              ref: pageParam,
            },
          })
          .then((res) => {
            return { videos: res.data.data.list, ref: res.data.data.ref, end: res.data.data.end_page }
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
    queryKey: ['community', 'videos', handle],
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return
      return lastPage.ref
    },
  })
}

//  TODO: Add Pagination.
// TODO: Check for pagination
export async function fetchCommunityLoops(handle: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/loops', {
      params: {
        community_id: { handle },
      },
    })
    .then((res) => {
      return res.data.data?.list
    })
    .catch((e) => {
      throw new Error('Something went wrong with loop detail!')
    })
}

export function getCommunityLoops(handle: string) {
  return useQuery({ queryFn: async () => await fetchCommunityLoops(handle), queryKey: ['community', 'loops', handle] })
}

// async function fetchVideoComments(handle: string) {
//   return await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/')
// }
