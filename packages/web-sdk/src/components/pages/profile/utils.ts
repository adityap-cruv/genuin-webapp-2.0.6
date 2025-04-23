import { CommunityUserRole } from '@/components/tree-structure'
import { getQueryKeyForProfileCommunities } from '@/utils/constants/keys'
import { queryClient } from '@/context/react-query'
import { InfiniteData } from '@tanstack/react-query'
import { FetchCommunityReturnType } from '@/components/tree-structure'

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
  newRole: CommunityUserRole,
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
    },
  )
}
