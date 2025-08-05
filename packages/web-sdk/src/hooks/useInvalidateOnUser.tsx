import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getQueryKeyForCommunityDetails,
  getQueryKeyForLoopDetails,
  getQueryKeyForProfileCommunities,
} from '@/utils/constants/keys'
import { useAuth } from '@/context/auth'

type QueryType = 'group' | 'community' | 'profileCommunities'

const getQueryKeyByType = (
  type: QueryType,
  key: string,
  forBrand?: boolean,
) => {
  switch (type) {
    case 'group':
      return getQueryKeyForLoopDetails(key)
    case 'community':
      return getQueryKeyForCommunityDetails(key)
    case 'profileCommunities':
      return getQueryKeyForProfileCommunities(key, forBrand ?? false)
    default:
      throw new Error(`Unknown query type: ${type as string}`)
  }
}

export const useInvalidateOnUser = (
  type: QueryType,
  key: string,
  forBrand?: boolean,
) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const hasInvalidatedRef = useRef(false)

  useEffect(() => {
    if (!user || hasInvalidatedRef.current) return

    const invalidate = async () => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKeyByType(type, key, forBrand),
        type: 'all',
      })
      hasInvalidatedRef.current = true
    }

    void invalidate()
  }, [user])
}
