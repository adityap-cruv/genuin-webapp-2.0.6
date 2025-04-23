import { getFeaturedCommunities } from './api'
import { CommunityTile } from '@/components/community-tile'
import { cn, CommunityPrivacyEnum } from '@/utils'
import { CommunitiesLoader } from './loader'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ComponentProps, useCallback } from 'react'
import {
  CommunityUserRole,
  mapCommunityUserRole,
  reverseMapCommunityUserRole,
} from '@/components/tree-structure'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKeyForFeaturedCommunities } from '@/utils/constants/keys'

type CommunitiesPropsType = ComponentProps<'div'>

export function Communities({ className, ...restProps }: CommunitiesPropsType) {
  const queryClient = useQueryClient()
  const { data: communityList, isLoading, isError } = getFeaturedCommunities()

  const handleCommunityRoleChanged = useCallback(
    (communityId: string, newRole: CommunityUserRole) => {
      type CommunitiesData = ReturnType<typeof getFeaturedCommunities>['data']
      queryClient.setQueryData(
        getQueryKeyForFeaturedCommunities(),
        (oldData: CommunitiesData) => {
          return oldData?.map((community) => {
            if (community.community_id === communityId) {
              return {
                ...community,
                logged_in_user_role: reverseMapCommunityUserRole(newRole).role,
              }
            }
            return community
          })
        },
      )
    },
    [],
  )

  if (isError) {
    return
  }

  return (
    <div
      className={cn('h-auto w-full', className)}
      {...restProps}>
      {/* For desktop */}
      <div className='hidden md:block'>
        <p className='pb-2 text-title-1-bold'>Featured Communities</p>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 '>
          {isLoading ? (
            <CommunitiesLoader />
          ) : (
            communityList?.map((community, index) => {
              return (
                <CommunityTile
                  redirectOnClick
                  key={index}
                  showJoinButton
                  communityDetails={{
                    id: community.community_id,
                    slug: community.slug,
                    /**
                     * Always unjoined communities will be shown in explore page.
                     */
                    userRole: mapCommunityUserRole(
                      community.logged_in_user_role,
                    ),
                    memberCount: community.no_of_members,
                    name: community.name,
                    profileImage: community.dp_m ?? community.dp ?? '',
                    /*
                     * All communities coming from this api will be public by default.
                     */
                    type: CommunityPrivacyEnum.PUBLIC,
                    description: community.description ?? undefined,
                    // TODO: Ask about brand communities.
                    // brand: community.brand ? {logo:}: undefined,
                  }}
                  onCommunityRoleChanged={(newRole) => {
                    handleCommunityRoleChanged(community.community_id, newRole)
                  }}
                />
              )
            })
          )}
        </div>
      </div>
      {/* For Mobile */}
      <div className='block w-full md:hidden'>
        <p className='pb-2 text-title-1-bold'>Featured Communities</p>
        {isLoading ? (
          <CommunitiesLoader />
        ) : (
          <Swiper
            direction='horizontal'
            loop
            spaceBetween={16}
            centeredSlides
            slidesPerView={1.2}>
            {communityList?.map((community, index) => (
              <SwiperSlide key={community.community_id}>
                <CommunityTile
                  redirectOnClick
                  key={index}
                  showJoinButton
                  communityDetails={{
                    id: community.community_id,
                    slug: community.slug,
                    userRole: CommunityUserRole.UNJOINED,
                    memberCount: community.no_of_members,
                    name: community.name,
                    profileImage: community.dp_m ?? community.dp ?? '',
                    /*
                     * All communities coming from this api will be public by default.
                     */
                    type: CommunityPrivacyEnum.PUBLIC,
                    description: community.description ?? undefined,
                    // TODO: Ask about brand communities.
                    // brand: community.brand ? {logo:}: undefined,
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  )
}
