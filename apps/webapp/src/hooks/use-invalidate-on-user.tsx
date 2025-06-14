import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import {
  getQueryKeyForCommunityDetails,
  getQueryKeyForLoopDetails,
  getQueryKeyForProfileCommunities,
} from '@/lib/utils/react-query/keys'

type QueryType = 'group' | 'community' | 'profileCommunities'

const getQueryKeyByType = (type: QueryType, key: string, forBrand?: boolean) => {
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

export const useInvalidateOnUser = (type: QueryType, key: string, forBrand?: boolean) => {
  const { user } = useGenuinOptions()
  const queryClient = useQueryClient()

  useEffect(() => {
    const invalidate = async () => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKeyByType(type, key, forBrand),
        type: 'all',
      })
    }

    if (user) void invalidate()
  }, [user])
}
