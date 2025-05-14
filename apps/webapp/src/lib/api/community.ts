import { validateCommunityDetails } from '@lib/schemas/community'
import { validateCommunityLoopList, type CommunityLoopListType } from '@lib/schemas/community/loops'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { parseFeedResponseFromGoApi } from './api-response-parser'
import { axiosInstance } from './instance'
import { parseFeaturedCommunityList } from '@lib/schemas/community/featured-community'
import { type VideoPlayerModalType } from '../schemas/player/video'
import { NOT_FOUND_ERROR_CODES } from '../constants'

export async function fetchCommunityDetails(slug: string) {
  return await axiosInstance
    .get('/api/v3/community', {
      params: {
        slug,
      },
    })
    .then((res) => {
      return validateCommunityDetails(res.data.data)
    })
    .catch((e) => {
      // TODO:
      /**
       * Here in this api one request is being made undexpectedly.
       * Which is "/api/v3/community/details?community_id[handle]=cow_face"
       * Figure out why this error happening and solve the issue.
       * @example Community handle: @kvkic
       */
      // eslint-disable-next-line no-console
      if (e.response.data.code === NOT_FOUND_ERROR_CODES.community) {
        throw new Error(e.response.data.code)
      }
      throw new Error('Something went wrong with community detail!')
    })
}

export function getCommunityDetails(slug: string) {
  return useQuery({
    queryKey: ['community', 'details', slug],
    queryFn: async () => await fetchCommunityDetails(slug),
  })
}

export function getCommunityFeed(slug: string) {
  let promise: null | Promise<{ videos: VideoPlayerModalType[]; end?: boolean }> = null
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      // Used axios because this API used in embed and we don't have to pass auth-token in case of embed
      if (!promise) {
        promise = axiosInstance
          .get('/goservices/feed/community', {
            params: {
              slug,
              last_video_id: pageParam,
            },
          })
          .then((res) => {
            const resData = res.data.data
            const videos = parseFeedResponseFromGoApi(resData.feeds)
            return { videos, end: resData.end_of_feed }
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
      return lastPage.videos[lastPage.videos.length - 1].video.id
    },
  })
}

export async function fetchCommunityLoops(slug: string): Promise<{ loops: CommunityLoopListType }> {
  return await axiosInstance
    .get(process.env.NEXT_PUBLIC_API_URL + '/api/v3/community/loops', {
      params: {
        slug,
        position: true,
      },
    })
    .then((res) => {
      return { loops: validateCommunityLoopList(res.data.data.conversations) }
    })
    .catch((e) => {
      throw new Error('Something went wrong with loop community.!')
    })
}

export function getCommunityLoops(slug: string) {
  return useQuery({ queryFn: async () => await fetchCommunityLoops(slug), queryKey: ['community', 'loops', slug] })
}

async function fetchCommunityMembers(slug: string) {
  return await axiosInstance
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

async function fetchFeaturedCommunity() {
  return await axiosInstance
    .get('/api/v3/featured_communities')
    .then((res) => {
      return parseFeaturedCommunityList(res.data.data.communities)
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error in featured api::', e)
      throw new Error('Something went wrong with fetching featured community!')
    })
}

export function getFeaturedCommunity() {
  return useQuery({
    queryKey: ['featured', 'community'],
    queryFn: async () => await fetchFeaturedCommunity(),
    refetchOnWindowFocus: false,
  })
}

async function fetchFeaturedLoop() {
  return await axiosInstance
    .get('/api/v3/featured_loops')
    .then((res) => {
      return validateCommunityLoopList(res.data.data.loops)
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log('error in featured api::', e)
      throw new Error('Something went wrong with fetching featured community!')
    })
}

export function getFeaturedLoops() {
  return useQuery({ queryKey: ['featured_loops'], queryFn: async () => await fetchFeaturedLoop() })
}
