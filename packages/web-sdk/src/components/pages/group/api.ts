import { getBaseHeaders } from '@/headers'
import { getApiUrl } from '@/utils'
import {
  getQueryKeyForLoopDetails,
  getQueryKeyForLoopMembers,
  getQueryKeyForLoopPosts,
} from '@/utils/constants/keys'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { validateMembers, type LoopDetailsType } from './schema'
import { FeedVideoType, FetchFeedReturnType } from '@/type'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'

export async function fetchLoopDetails(slug: string) {
  try {
    const url = new URL(getApiUrl('/api/v3/conversation/details'))
    url.searchParams.append('slug', slug)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (errorData?.code === NOT_FOUND_ERROR_CODES.group) {
        throw new Error(NOT_FOUND_ERROR_CODES.group)
      }
      throw new Error('Something went wrong!!')
    }

    const resData = await response.json()
    // TODO: Validate the response data here.
    return resData?.data as LoopDetailsType
  } catch (error) {
    console.error('::Error in fetchLoopDetails::', error)
    throw error
  }
}

export function getLoopDetails(slug: string) {
  return useQuery({
    queryKey: getQueryKeyForLoopDetails(slug),
    queryFn: () => fetchLoopDetails(slug),
  })
}

async function fetchPosts(
  slug: string,
  pageParams?: { lastVideoId?: string },
): Promise<FetchFeedReturnType> {
  try {
    const url = new URL(getApiUrl('/goservices/feed/loop'))
    url.searchParams.append('slug', slug)
    if (pageParams?.lastVideoId) {
      url.searchParams.append('last_video_id', pageParams.lastVideoId)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong with loop videos fetching API.')
    }

    const resData = await response.json()
    // TODO: Do the validation here.
    const videos = resData.data.feeds as FeedVideoType[]
    return { videos, end: resData.data.end_of_feed as boolean }
  } catch (error) {
    console.error('::Error in fetchLoopVideos::', error)
    throw error
  }
}

export function getPosts(slug: string) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => await fetchPosts(slug, pageParam),
    queryKey: getQueryKeyForLoopPosts(slug),
    initialPageParam: { lastVideoId: '' },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) {
        return
      }
      return {
        lastVideoId: lastPage.videos[lastPage.videos.length - 1]?.video?.uuid,
      }
    },
  })
}

async function fetchMembers(slug: string, pageParam: string) {
  try {
    const url = new URL(getApiUrl('api/v3/conversation/members'))
    url.searchParams.append('slug', slug)
    if (pageParam) {
      url.searchParams.append('last_member_id', pageParam)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong in fetching loop cohosts.')
    }

    const resData = await response.json()
    return {
      members: validateMembers(resData.data?.members),
      end: resData.data?.end_of_result,
    }
  } catch (error) {
    console.error('::Error in fetchLoopCohosts::', error)
    throw error
  }
}

export function getMembers(slug: string) {
  return useInfiniteQuery({
    queryKey: getQueryKeyForLoopMembers(slug),
    initialPageParam: '',
    queryFn: async ({ pageParam }) => await fetchMembers(slug, pageParam),
    getNextPageParam(lastPage) {
      if (lastPage.end) return
      return lastPage.members[lastPage.members.length - 1]?.member_id
    },
  })
}

export async function subscribeLoop(uuid: string, subscribe: boolean) {
  try {
    const response = await fetch(
      getApiUrl('/api/v3/conversation/subscription'),
      {
        method: 'POST',
        headers: getBaseHeaders(true),
        body: JSON.stringify({
          chat_id: uuid,
          subscribe,
        }),
      },
    )

    const resData = await response.json()

    return {
      code: response.status,
      data: resData.data,
    }
  } catch (e: any) {
    console.error('::Error in subscribeLoop::', e)

    return {
      code: e?.response?.data?.code ? Number(e.response.data.code) : 500, // Default to 500 if code is unavailable
    }
  }
}
