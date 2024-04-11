import { validateCommunityDetails } from '@lib/schemas/community'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'

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
  let promise: null | Promise<{ videos: any; ref: any; end?: boolean }> = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      if (!promise) {
        promise = axios
          .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/videos', {
            params: {
              community_id: { slug },
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
    queryKey: ['community', 'videos', slug],
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return
      return lastPage.ref
    },
  })
}

//  TODO: Add Pagination.
// TODO: Check for pagination
export async function fetchCommunityLoops(slug: string) {
  return await axios
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/public/community/loops', {
      params: {
        community_id: { slug },
      },
    })
    .then((res) => {
      return res.data.data?.list
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
