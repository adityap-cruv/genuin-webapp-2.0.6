'use client'
import { abbreviateNumber } from '@lib/utils'
import { type User, useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { DecorativeList } from '@components/custom/decorative-list'
import { Loader } from '@components/ui/loader'
import React, { useEffect, useState } from 'react'
import { Shimmer } from '@components/ui/shimmer'
import Link from 'next/link'
import { getNextPage } from './hook'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type MotionValue, useMotionValueEvent } from 'framer-motion'
import { useCommunityListStore } from './store'
import { type ProfileCommunityType, type ProfileLoopType, type ProfileVideoType } from '@lib/schemas/profile/community'
import { fetchProfileCommunityLoops, getCommunities, fetchProfileVideos, getProfileFeed } from '@lib/api/brand-profile'
import icLock from '@icons/icLock.svg'
import { PlayerModal } from '@components/common/modals/player-modal'
import icPlay from '@icons/player-controls/icPlay.svg'
import { LockIcon } from '@icons/LockIcon'
import { usePathname } from 'next/navigation'
import { EarthIcon } from '@icons/earth-icon'
import { LoopPrivacyInfo } from '@components/common/loop-privacy-info'
import { PrivateModal } from '@components/common/modals/private'
import { IcLoop } from '@icons/ic-loop'
import { BrandCommunityTag } from '@components/common/brand-community-tag'
import { ToggleCommunityJoinState } from '@components/common/toggle-community-join-state'
import { Play } from 'lucide-react'

export function CommunityList({ brandId, scrollYProgress }: { brandId: number; scrollYProgress: MotionValue<number> }) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getCommunities(brandId, 8)
  const communities = data?.pages.flatMap((item) => item.communities)
  const [communityJoinStates, setCommunityJoinStates] = useState<Record<string, string>>({})
  const user = useGenuinOptions().user
  const { addCommunities, currentVideoId } = useCommunityListStore()
  const pathName = usePathname()

  useEffect(() => {
    if (communities) {
      const initialStates: Record<string, string> = {}
      let shouldUpdate = false

      communities.forEach((item) => {
        const userRole = item.userRole ?? ''
        if (communityJoinStates[item.id] !== userRole) {
          initialStates[item.id] = userRole
          shouldUpdate = true
        } else {
          initialStates[item.id] = communityJoinStates[item.id]
        }
      })

      if (shouldUpdate) {
        setCommunityJoinStates(initialStates)
      }
    }
  }, [communities?.length])

  useEffect(() => {
    const newCommunites = data?.pages[data.pages.length - 1].communities
    // if (localCommunities && newCommunites && localCommunities?.length !== communities.length) {
    if (newCommunites) addCommunities(newCommunites)
    // }
  }, [communities?.length])

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  function Inner() {
    if (isLoading)
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader size="md" />
        </div>
      )
    if (!communities || communities.length === 0)
      return (
        <div className="w-full overflow-hidden" style={{ height: `calc(100% - 250px)` }}>
          <div className="flex h-full w-full items-center justify-center bg-tertiary-100 pt-2 text-title-3-bold text-tertiary">
            No posts yet
          </div>
        </div>
      )
    return (
      <div className="h-full w-full overflow-y-visible">
        {communities.map((item, index) => {
          return (
            <div key={index} className="my-6">
              <div className="flex items-center">
                <CustomAvatar
                  className="bg-slate-500 h-11 w-11 bg-red-40"
                  fallbackString={item.name ?? ''}
                  imageUrl={item.profileImage ?? ''}
                  isAvatar={false}
                />
                <div className="flex w-full items-center justify-between">
                  <div className="mx-2">
                    <Link href={{ pathname: PATH_NAME.community(item.slug) }}>
                      <p
                        className="line-clamp-1 text-left"
                        style={{ fontWeight: 600, fontSize: '20px', lineHeight: '24px' }}>
                        {item.name ?? `${item.handle}`}
                      </p>
                    </Link>
                    {item.type === 2 && (
                      <PrivateModal>
                        <div className="flex items-center justify-start rounded-full">
                          <LockIcon className="h-4 w-4 stroke-tertiary" />
                          <p className="text-cap-1-demi text-tertiary">Private</p>
                        </div>
                      </PrivateModal>
                    )}
                    {item.type !== 2 && pathName === PATH_NAME.profile(user?.nickname) && (
                      <div className="mb-2 flex items-center justify-start gap-1 rounded-full">
                        <EarthIcon className="h-4 w-4 stroke-tertiary" />
                        <p className="text-cap-1-demi text-tertiary">Public</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.brand && (
                      <BrandCommunityTag
                        brandSlug={item.brand.brand_slug}
                        brandLogo={item.brand?.logo}
                        brandName={item.brand?.name}
                      />
                    )}
                    {pathName !== PATH_NAME.brand(user?.nickname) && item.isCommunityJoinRequested && (
                      <Button size="custom" className="border border-primary" variant={'outline'}>
                        <p className={`px-4 py-1.5 text-body-1-demi text-monochrome-white text-primary`}>Requested</p>
                      </Button>
                    )}
                    {pathName !== PATH_NAME.brand(user?.nickname) && !item.isCommunityJoinRequested && (
                      <ToggleCommunityJoinState
                        communityJoinStates={communityJoinStates}
                        setCommunityJoinStates={setCommunityJoinStates}
                        handle={item.handle}
                        id={item.id}
                        userRole={item.userRole}
                        isCommunityPrivate={item.type === 2}
                      />
                    )}
                  </div>
                </div>
              </div>
              <DecorativeList>
                <Loops brandId={brandId} community={item} communityId={item.id} user={user} pathName={pathName} />
              </DecorativeList>
            </div>
          )
        })}
        {isFetchingNextPage && (
          <div className="mb-4 flex w-full justify-center">
            <Loader size="md" />
          </div>
        )}
      </div>
    )
  }

  // TODO: Improve return type and add shimmer.
  return (
    <div className="h-full w-full p-4">
      <Inner />
      {currentVideoId && <PlayerModalWrapper brandId={brandId} currentVideoId={currentVideoId} />}
    </div>
  )
}

function PlayerModalWrapper({ brandId, currentVideoId }: { brandId: number; currentVideoId: string }) {
  const { data, isLoading, fetchNextPage } = getProfileFeed(brandId, currentVideoId)
  const { close } = useCommunityListStore()
  const videos = data?.pages.flatMap((item) => item.feed)

  return (
    <PlayerModal.mobile
      close={close}
      fetchNextVideos={fetchNextPage}
      isError={false}
      startIndex={0}
      isLoading={isLoading}
      videos={videos}
      isFetchingNextPage={false}
      open={Boolean(currentVideoId)}
    />
  )
}

function Loops({
  brandId,
  community,
  communityId,
  pathName,
  user,
}: {
  brandId: number
  community: ProfileCommunityType
  communityId: string
  pathName: string
  user: User | undefined
}) {
  const addLoops = useCommunityListStore((state) => state.addLoops)
  const { fetchNext, isFetchingNextPage } = getNextPage<ProfileLoopType[]>(
    async () =>
      await fetchProfileCommunityLoops(brandId, 16, communityId, community.loops[community.loops.length - 1].id),
    (data) => {
      addLoops(communityId, data)
    }
  )

  const isPrivateCommunity = false
  if (isPrivateCommunity)
    return (
      <li
        className="profile-loop-li relative mb-4 w-full rounded-lg border border-tertiary-200 p-4"
        style={{ backgroundColor: '#F9F9F9' }}>
        <div className="flex items-center">
          <div className="mr-4 h-14 w-14 shrink-0 rounded-full bg-tertiary-200 p-3">
            <Image src={icLock} alt="share" className=" fill-primary" />
          </div>
          <div>
            <p className="text-title-3-demi">This community is private</p>
            <p className="text-body-1-med">Join this community to see and interact with their posts.</p>
          </div>
        </div>
      </li>
    )
  // TODO: Think about logic of private community.
  // TODO: Loop name should mendantorily be here. or else think about fallback.
  return (
    <>
      {community.loops?.map((item, index) => (
        <li
          className="profile-loop-li relative mb-4 w-full rounded-lg border border-tertiary-200 p-4 pb-2"
          style={{ backgroundColor: '#F9F9F9' }}
          key={index}>
          {item.private ? (
            <div className="mb-2">
              <a href={PATH_NAME.loop(item.slug)}>
                <p className="text-title-3-demi">{item.name}</p>
              </a>
              <div className="my-1 flex items-center gap-1">
                <IcLoop className="h-4 w-4 fill-tertiary" />
                <p className="text-body-1-med text-tertiary">Visible to collaborators only</p>
              </div>
            </div>
          ) : (
            <LoopVideos brandId={brandId} loop={item} communityId={communityId} user={user} pathName={pathName} />
          )}
        </li>
      ))}
      {/** TODO: discus with design team about getting more loops pagination design. */}
      {community.loopCount > community.loops.length && !isFetchingNextPage && (
        <div onClick={fetchNext}>
          <li
            className="profile-loop-li relative w-full rounded-lg border border-tertiary-200 p-2"
            style={{ backgroundColor: '#F9F9F9' }}>
            <p className="text-blue-500 flex w-full cursor-pointer justify-center text-cap-1-demi text-tertiary">
              View more loops
            </p>
          </li>
        </div>
      )}
      {isFetchingNextPage && (
        <div className="h-auto">
          <li className="profile-loop-li relative my-4 w-full rounded-lg border border-tertiary-200 bg-tertiary-100 p-4">
            <Shimmer className="h-6 w-40" />
            <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
                  <Shimmer className="aspect-reel w-full rounded" />
                </div>
              ))}
            </div>
          </li>
        </div>
      )}
    </>
  )
}

type LoopVideosProps = {
  brandId: number
  loop: ProfileLoopType
  communityId: string
  pathName: string
  user: User | undefined
}

function LoopVideos({ brandId, loop, communityId, pathName, user }: LoopVideosProps) {
  const { addVideos, open } = useCommunityListStore((state) => ({
    addVideos: state.addVideos,
    open: state.open,
  }))

  const { fetchNext, isFetchingNextPage } = getNextPage<ProfileVideoType[]>(
    async () => await fetchProfileVideos(brandId, 16, communityId, loop.id, loop.videos[loop.videos.length - 1].id),
    (data) => {
      addVideos(communityId, loop.id, data)
    }
  )

  // const [videoCount, setVideoCount] = useState(Math.max(0, loop.video_count - 8))

  const handleSeeMoreClick = () => {
    fetchNext()
  }

  function InnerComponent() {
    if (!loop.videos || loop.videos.length === 0)
      return (
        <div className="flex items-center justify-center pt-32 text-title-3-bold text-tertiary">No posts available</div>
      )

    if (loop.videos)
      return (
        <>
          {loop.videos.map((video, index) => (
            <React.Fragment key={index}>
              <div
                onClick={() => {
                  open(video.id)
                }}
                key={video.id}
                className="group/vidcard relative flex aspect-reel min-w-full flex-col items-center hover:cursor-pointer">
                <img src={video.thumbnail ?? ''} className="aspect-reel rounded" />
                <div className="absolute bottom-0 left-0 m-1 flex items-center justify-center gap-0.5">
                  <Play className="h-3 w-3 stroke-monochrome-white" />
                  <p className="text-new-para-2-mobile text-monochrome-white">
                    {abbreviateNumber(video.viewCount) ?? 0}
                  </p>
                </div>
                <div className="absolute inset-0 hidden h-full w-full items-center justify-center rounded bg-monochrome-black/40 group-hover/vidcard:flex">
                  <Image src={icPlay} alt="" />
                </div>
              </div>
            </React.Fragment>
          ))}
        </>
      )
  }

  return (
    <>
      <Link href={PATH_NAME.loop(loop.slug)}>
        <p className="mb-3 text-body-1-bold">{loop.name}</p>
      </Link>
      {pathName === PATH_NAME.brand(user?.brandSlug) && (
        <LoopPrivacyInfo
          actionId={loop?.actions?.[0]?.action_id ?? 0}
          accessTypeId={loop?.actions?.[0]?.access_type_id ?? 0}
        />
      )}
      <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
        <InnerComponent />
        {isFetchingNextPage &&
          [...Array(loop.videoCount < 16 ? loop.videoCount : 16)].map((_, index) => (
            <Shimmer key={index} className="aspect-reel w-full rounded" />
          ))}
      </div>
      {loop.videoCount > loop.videos.length && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center pt-2 text-cap-1-demi text-tertiary"
          onClick={handleSeeMoreClick}>
          See {loop.videoCount - loop.videos.length} More
        </p>
      )}
    </>
  )
}
