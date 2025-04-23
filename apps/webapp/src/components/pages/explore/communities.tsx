'use client'
import { JoinCommunityButton } from '@/components/common/join-community-button'
import { abbreviateNumber } from '@lib/utils'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { getFeaturedCommunity } from '@lib/api/community'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Swiper, SwiperSlide } from 'swiper/react'
import Link from 'next/link'
import { CommunityCardShimmer } from './shimmer'
import { type CommunityUserRoleType } from '@/lib/schemas/roles'
import { useCallback, useState } from 'react'
import { useGenuinOptions } from '@/lib/stores/genuin-options'

export function Communities() {
  const { isLoading, data: communities, isError } = getFeaturedCommunity()
  // List of joined communities.
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([])

  // Handle community role change.
  const handleCommunityRoleChange = useCallback(
    (communityId: string, role: CommunityUserRoleType) => {
      // If user is a member of the community, add it to the list.
      if (role === 'MEMBER') {
        setJoinedCommunities((prev) => [...prev, communityId])
      } else {
        // If join is reverted than remove it from the list.
        setJoinedCommunities((prev) => prev.filter((id) => id !== communityId))
      }
    },
    [communities]
  )

  // In case of error, return.
  if (isError) {
    return
  }

  return (
    <>
      <div className="hidden sm:block">
        <p className="pb-2 pt-6 text-title-1-bold">Featured Communities</p>
        {isLoading ? (
          <CommunitiesShimmer />
        ) : (
          <div className="grid h-auto w-full min-w-fit grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
            {communities?.map((community) => {
              return (
                <CommunityItem
                  key={community.community_id}
                  id={community.community_id}
                  memberCount={community.no_of_members}
                  profileImage={community.dp_m ?? community.dp ?? ''}
                  description={community.description ?? ''}
                  name={community.name}
                  slug={community.slug}
                  handle={community.handle}
                  role={joinedCommunities.includes(community.community_id) ? 'MEMBER' : 'UNJOINED'}
                  onCommunityStatusChange={(role) => {
                    handleCommunityRoleChange(community.community_id, role)
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
      <div className="block w-full sm:hidden">
        <p className="pb-2 pt-6 text-title-1-bold">Featured Communities</p>
        {isLoading ? (
          <CommunitiesShimmer />
        ) : (
          <Swiper direction="horizontal" loop spaceBetween={16} centeredSlides slidesPerView={1.2}>
            {communities?.map((community) => (
              <SwiperSlide key={community.community_id}>
                <CommunityItem
                  role={joinedCommunities.includes(community.community_id) ? 'MEMBER' : 'UNJOINED'}
                  id={community.community_id}
                  memberCount={community.no_of_members}
                  profileImage={community.dp ?? ''}
                  description={community.description ?? ''}
                  slug={community.slug}
                  handle={community.handle}
                  onCommunityStatusChange={(role) => {
                    handleCommunityRoleChange(community.community_id, role)
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </>
  )
}

function CommunitiesShimmer() {
  return (
    <div className="flex flex-col gap-4 pt-2 sm:grid sm:grid-cols-2">
      <CommunityCardShimmer />
      <CommunityCardShimmer className="hidden sm:block" />
      <CommunityCardShimmer className="hidden sm:block" />
      <CommunityCardShimmer className="hidden sm:block" />
    </div>
  )
}

type CommunityItemProps = {
  id: string
  name?: string
  profileImage: string
  memberCount: number
  description?: string
  slug: string
  handle: string
  role: CommunityUserRoleType
  onCommunityStatusChange: (role: CommunityUserRoleType) => void
}

function CommunityItem({
  id,
  memberCount,
  handle,
  profileImage,
  description,
  name,
  slug,
  role,
  onCommunityStatusChange,
}: CommunityItemProps) {
  const isMobile = useGenuinOptions().isMobile
  return (
    <div className="min-w[320px] max-w-full rounded-lg border border-tertiary-300 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <CustomAvatar fallbackString={name ?? ''} imageUrl={profileImage} isAvatar={false} className="h-12 w-12" />
          <div>
            <Link href={PATH_NAME.community(slug)}>
              <p className="line-clamp-2 break-words text-body-1-bold">{name}</p>
            </Link>
            <p className="text-body-1-demi text-tertiary">{`${abbreviateNumber(memberCount)} ${
              memberCount === 1 ? 'member' : 'members'
            }`}</p>
          </div>
        </div>
        {/** Handle this case here. */}
        <JoinCommunityButton
          buttonText="Join"
          handle={handle}
          id={id}
          slug={slug}
          type="public"
          role={role}
          communityName={name ?? ''}
          onStatusChange={onCommunityStatusChange}
          isMobile={isMobile}
        />
        {/* <JoinCommunityButton buttonText="Join" handle={handle} id={id} isCommunityPrivate={false} /> */}
      </div>
      <p className="line-clamp-2 h-12 break-all pt-2 text-body-1-demi">{description}</p>
    </div>
  )
}
