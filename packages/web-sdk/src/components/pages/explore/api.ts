import {
  getQueryKeyForFeaturedCommunities,
  getQueryKeyForFeaturedLoops,
} from '@/utils/constants/keys'
import { useQuery } from '@tanstack/react-query'
import { parseFeaturedCommunityList } from './schema/communities'
import { getApiUrl } from '@/utils'
import { getBaseHeaders } from '@/headers'
import { parseLoopList } from './schema/loop'

async function fetchFeaturedCommunities() {
  try {
    const response = await fetch(getApiUrl('/api/v3/featured_communities'), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong with fetching featured community!')
    }

    const resData = await response.json()
    return parseFeaturedCommunityList(resData.data?.communities)
  } catch (error) {
    console.error('::Error in fetchFeaturedCommunity::', error)
    throw error
  }
}

export function getFeaturedCommunities() {
  return useQuery({
    queryKey: getQueryKeyForFeaturedCommunities(),
    queryFn: () => fetchFeaturedCommunities(),
  })
}

async function fetchFeaturedLoops() {
  try {
    const response = await fetch(getApiUrl('/api/v3/featured_loops'), {
      method: 'GET',
      headers: getBaseHeaders(true),
    })

    if (!response.ok) {
      throw new Error('Something went wrong with fetching featured loops!')
    }

    const resData = await response.json()
    return parseLoopList(resData.data?.loops)
  } catch (error) {
    console.error('::Error in fetchFeaturedLoop::', error)
    throw error
  }
}

export function getFeaturedLoops() {
  return useQuery({
    queryKey: getQueryKeyForFeaturedLoops(),
    queryFn: () => fetchFeaturedLoops(),
  })
}
