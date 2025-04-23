import { type InfiniteData } from '@tanstack/react-query'
import { type CommunityUserRole, type FetchCommunityReturnType } from '../tree-structure'
import { queryClient } from '../providers/query-client-provider'
import { getQueryKeyForProfileCommunities } from '../../lib/utils/react-query/keys'

/**
 * This func updates community user role for profile communities.
 * @param profileId
 * @param forBrand
 * @param communityId
 * @param newRole
 */
export function updateCommunityUserRoleForProfileCommunities(
  profileId: string,
  forBrand: boolean,
  communityId: string,
  newRole: CommunityUserRole
) {
  queryClient.setQueryData<InfiniteData<FetchCommunityReturnType>>(
    getQueryKeyForProfileCommunities(profileId, forBrand),
    (oldData): InfiniteData<FetchCommunityReturnType> | undefined => {
      if (!oldData) return oldData
      return {
        ...oldData,
        pages: oldData.pages.map((page) => {
          return {
            ...page,
            communities: page.communities.map((community) => {
              if (community.id === communityId) {
                return {
                  ...community,
                  role: newRole,
                }
              }
              return community
            }),
          }
        }),
      }
    }
  )
}
