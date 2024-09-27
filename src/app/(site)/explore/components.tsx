'use client'
import { abbreviateNumber, cn } from '@lib/utils'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { getFeaturedCommunity, getFeaturedLoops } from '@lib/api/community'
import { PATH_NAME } from '@lib/utils/constants/path'
import { LoopCard } from '@components/common/loop-card'
import { Swiper, SwiperSlide } from 'swiper/react'
import Link from 'next/link'
import { JoinCommunityButton } from '@components/pages/community/join-community-button'

export const Communities = {
  desktop: CommunitiesForDesktop,
  mobile: CommunitiesForMobile,
}

function CommunitiesForDesktop() {
  const { isLoading, data } = getFeaturedCommunity()

  if (isLoading) return null

  if (data?.length !== 0)
    return (
      <>
        <p className="pb-2 pt-6 text-title-1-bold">Featured Communities</p>
        <div className="grid h-auto w-full min-w-fit grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
          {data?.map((item) => {
            return (
              <CommunityItem
                key={item.community_id}
                id={item.community_id}
                memberCount={item.no_of_members}
                profileImage={item.dp ?? ''}
                description={item.description ?? ''}
                name={item.name}
                slug={item.slug}
                handle={item.handle}
              />
            )
          })}
        </div>
      </>
    )
}

function CommunitiesForMobile() {
  const { isLoading, data } = getFeaturedCommunity()

  if (isLoading) return null
  if (data?.length !== 0)
    return (
      <>
        <p className="pb-2 pt-6 text-title-1-bold">Featured Communities</p>
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
      </>
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

export function Loops() {
  const { isLoading, data } = getFeaturedLoops()
  if (isLoading) return
  return (
    <>
      <p className="pb-2 pt-6 text-title-1-bold">Featured Groups</p>
      <div
        className={cn(
          'grid h-auto w-fit min-w-fit grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2',
          isLoading && 'h-[50vh]'
        )}>
        {data?.map((item, index) => {
          return (
            <LoopCard
              key={index}
              className="w-full"
              description={item.group.group_description ?? ''}
              id={item.chat_id}
              isViewAllowed={item.is_view_allowed}
              latestMessages={item.latest_messages.map((item) => ({
                owner: { userName: item.owner.username },
                thumbnail: item.thumbnail_url ?? '',
                createdAt: item.message_at,
              }))}
              loopSlug={item.slug}
              memberCount={item.group.no_of_members}
              members={item.group.members.map((item) => ({
                isAvatar: item.is_avatar,
                name: item.name ?? '',
                profileImage: item.profile_image,
                userName: item.username,
              }))}
              name={item.group.group_name ?? ''}
              onClickOnImage={() => {}}
              linkOnImage={{ pathname: PATH_NAME.video(item.latest_messages[0].slug) }}
              viewCount={item.group.no_of_views}
              noOfVideos={item.group.no_of_videos}
            />
          )
        })}
      </div>
    </>
  )
}
