import { getBaseHeaders } from '@/headers'
import {
  CommunityLoopListType,
  validateCommunityDetails,
  validateCommunityLoopList,
} from './schema'
import { getApiUrl } from '@/utils'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  getQueryKeyForCommunityDetails,
  getQueryKeyForCommunityFeed,
  getQueryKeyForCommunityLoops,
  getQueryKeyForCommunityMembers,
  getQueryKeyForLoopFeed,
} from '@/utils/constants/keys'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'
import { FeedVideoType, FetchFeedReturnType } from '@/type'

export async function fetchCommunityDetails(slug: string) {
  try {
    const url = new URL(getApiUrl('api/v3/community'))
    url.searchParams.append('slug', slug)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      const errorData = await response.json()

      if (errorData.code === NOT_FOUND_ERROR_CODES.community) {
        throw new Error(errorData.code)
      }
      throw new Error('Something went wrong with community detail!')
    }
    const resData = await response.json()

    return validateCommunityDetails(resData.data)
  } catch (e) {
    console.error('::Error in fetchCommunityDetails::', e)
    throw e
  }
}

export function getCommunityDetails(slug: string) {
  return useQuery({
    queryKey: getQueryKeyForCommunityDetails(slug),
    queryFn: () => fetchCommunityDetails(slug),
  })
}

// TODO: Pagination has not been done.
export async function fetchCommunityLoops(
  slug: string,
): Promise<CommunityLoopListType> {
  try {
    const url = new URL(getApiUrl('api/v3/community/loops'))
    url.searchParams.append('slug', slug)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong with loop community.')
    }

    const resData = await response.json()
    return validateCommunityLoopList(resData.data.conversations)
  } catch (e) {
    console.error('::Error in fetchCommunityLoops::', e)
    throw e
  }
}

export function getCommunityLoops(slug: string) {
  return useQuery({
    queryKey: getQueryKeyForCommunityLoops(slug),
    queryFn: () => fetchCommunityLoops(slug),
  })
}

async function fetchCommunityMembers(slug: string) {
  try {
    const url = new URL(getApiUrl('/api/v3/community/members'))
    url.searchParams.append('slug', slug)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Something went wrong in fetching community members.')
    }

    const resData = await response.json()
    return resData.data?.members
  } catch (e) {
    console.error('::Error in fetchCommunityMembers::', e)
    throw e
  }
}

export function getCommunityMembers(slug: string) {
  return useQuery({
    queryKey: getQueryKeyForCommunityMembers(slug),
    queryFn: () => fetchCommunityMembers(slug),
  })
}

async function fetchLoopFeed(
  slug: string,
  pageParam?: { lastVideoId: string },
): Promise<FetchFeedReturnType> {
  try {
    const url = new URL(getApiUrl('/goservices/feed/loop'))
    url.searchParams.append('slug', slug)
    if (pageParam?.lastVideoId) {
      url.searchParams.append('last_video_id', pageParam.lastVideoId)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong with loop videos fetching API.')
    }

    const resData = await response.json()
    const videos = resData.data?.feeds as FeedVideoType[]

    return { videos, end: resData.data?.end_of_feed }
  } catch (error) {
    console.error('::Error in fetchLoopVideos::', error)
    throw error
  }
}

export function getLoopFeed(slug: string) {
  return useInfiniteQuery({
    queryKey: getQueryKeyForLoopFeed(slug),
    queryFn: ({ pageParam }) => fetchLoopFeed(slug, pageParam),
    initialPageParam: { lastVideoId: '' },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return undefined
      return {
        lastVideoId: lastPage.videos[lastPage.videos.length - 1]?.video.uuid,
      }
    },
  })
}

export type FetchCommunityFeedReturnType = {
  videos: FeedVideoType[]
  end: boolean
}

async function fetchCommunityFeed(
  slug: string,
  pageParam?: { lastVideoId: string },
): Promise<FetchCommunityFeedReturnType> {
  try {
    const url = new URL(getApiUrl('/goservices/feed/community'))
    url.searchParams.append('slug', slug)
    if (pageParam?.lastVideoId) {
      url.searchParams.append('last_video_id', pageParam.lastVideoId)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong with community videos!')
    }

    const resData = await response.json()
    const videos = resData.data?.feeds as FeedVideoType[]

    return { videos, end: resData.data?.end_of_feed as boolean }
  } catch (error) {
    console.error('::Error in fetchCommunityFeed::', error)
    throw error
  }
}

export function getCommunityFeed(slug: string) {
  return useInfiniteQuery({
    queryKey: getQueryKeyForCommunityFeed(slug),
    queryFn: ({ pageParam }) => fetchCommunityFeed(slug, pageParam),
    initialPageParam: { lastVideoId: '' },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return undefined
      return {
        lastVideoId: lastPage.videos[lastPage.videos.length - 1]?.video?.uuid,
      }
    },
  })
}
