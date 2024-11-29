'use client'
import { abbreviateNumber } from '@lib/utils'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { getFeaturedCommunity } from '@lib/api/community'
import { PATH_NAME } from '@lib/utils/constants/path'
import { Swiper, SwiperSlide } from 'swiper/react'
import Link from 'next/link'
import { JoinCommunityButton } from '@components/pages/community/join-community-button'
import { CommunityCardShimmer } from './shimmer'

export function Communities() {
  const { isLoading, data, isError } = getFeaturedCommunity()

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
            {data?.map((item) => {
              return (
                <CommunityItem
                  key={item.community_id}
                  id={item.community_id}
                  memberCount={item.no_of_members}
                  profileImage={item.dp_m ?? item.dp ?? ''}
                  description={item.description ?? ''}
                  name={item.name}
                  slug={item.slug}
                  handle={item.handle}
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
            {data?.map((item) => (
              <SwiperSlide key={item.community_id}>
                <CommunityItem
                  id={item.community_id}
                  memberCount={item.no_of_members}
                  profileImage={item.dp ?? ''}
                  description={item.description ?? ''}
                  slug={item.slug}
                  handle={item.handle}
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
}

function CommunityItem({ id, memberCount, handle, profileImage, description, name, slug }: CommunityItemProps) {
  return (
    <div className="min-w[320px] max-w-full rounded-lg border border-tertiary-300 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-x-2">
          <CustomAvatar fallbackString={name ?? ''} imageUrl={profileImage} isAvatar={false} className="h-12 w-12" />
          <span>
            <Link href={PATH_NAME.community(slug)}>
              <p className="line-clamp-1 break-all text-body-1-bold">{name}</p>
            </Link>
            <p className="text-body-1-demi text-tertiary">{`${abbreviateNumber(memberCount)} ${
              memberCount === 1 ? 'member' : 'members'
            }`}</p>
          </span>
        </span>
        <JoinCommunityButton
          buttonText="Join"
          handle={handle}
          id={id}
          isCommunityPrivate={false}
          isJoinRequested={false}
        />
      </div>
      <p className="line-clamp-2 h-12 break-all pt-2 text-body-1-demi">{description}</p>
    </div>
  )
}
