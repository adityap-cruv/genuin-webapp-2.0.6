'use client'
import { abbreviateNumber, openModal } from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { DecorativeList } from '@components/custom/decorative-list'
import { fetchProfileCommunityLoops, fetchProfileFeed, fetchProfileVideos, getCommunities } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { useEffect, useState } from 'react'
import icSpark from '@icons/player-controls/icBulb.svg'
import { Shimmer } from '@components/ui/shimmer'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type MotionValue, useMotionValueEvent } from 'framer-motion'
import { type CommunityMiniObj, useCommunityListStore, type LoopMiniObj } from './store'
import icLock from '@icons/icLock.svg'
import icLoopDark from '@icons/icLoopDark.svg'
import { joinCommunity } from '@lib/api/video'
import { useSearchParams } from 'next/navigation'

export function CommunityList({ userId, scrollYProgress }: { userId: string; scrollYProgress: MotionValue<number> }) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getCommunities(userId, 3)
  const { addCommunities, communities } = useCommunityListStore((state) => ({
    addCommunities: state.addCommunities,
    communities: state.communities,
  }))
  const [communityJoinStates, setCommunityJoinStates] = useState<Record<string, boolean>>({})
  const user = useGenuinOptions().user
  const searchParams = Object.fromEntries(useSearchParams())

  useEffect(() => {
    const pageLength = data?.pages.length
    if (pageLength) addCommunities(data?.pages[pageLength - 1]?.communities)
  }, [data])

  useMotionValueEvent(scrollYProgress, 'change', (latest: any) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  const toggleCommunityJoinState = async (communityId: string, communityHandle: string) => {
    if (user) {
      const newState = !communityJoinStates[communityId]
      if (newState) {
        await joinCommunity(
          false,
          [communityId],
          [
            {
              user_id: user?.id,
            },
          ]
        ).then((res) => {
          if (res.code === 200) {
            setCommunityJoinStates((prevState) => ({
              ...prevState,
              [communityId]: newState,
            }))
          }
        })
      } else {
        setCommunityJoinStates((prevState) => ({
          ...prevState,
          [communityId]: newState,
        }))
      }
    } else {
      openModal({
        title: 'Get the Genuin app',
        subtitle: (
          <>
            Get the app to join the <br />
            <span className="font-bold">@{communityHandle}</span> community.
          </>
        ),
      })
    }
  }

  // TODO: Improve return type and add shimmer.
  return (
    <div className="h-full w-full p-4">
      {isLoading && <Loader size="md" />}
      {communities && communities?.length === 0 && (
        <div className="w-full overflow-hidden" style={{ height: 'calc(100% - 280px)' }}>
          <div className="flex h-full w-full items-center justify-center bg-tertiary-100 pt-2 text-title-3-bold text-tertiary">
            No posts yet
          </div>
        </div>
      )}
      {communities && communities?.length !== 0 && (
        <div className="h-full">
          {communities?.map((item, index) => (
            <div key={index}>
              <div className="flex items-center">
                <CustomAvatar
                  className="bg-slate-500 h-11 w-11 bg-red-40"
                  fallbackString={item?.name}
                  imageUrl={item.dp ?? ''}
                  isAvatar={false}
                />
                <div className="mx-2 flex w-full items-center justify-between">
                  <Link href={{ pathname: PATH_NAME.community(item.slug) }}>
                    <p className="line-clamp-1 break-all text-left text-body-1-bold">{item.name}</p>
                  </Link>

                  <Button
                    size="custom"
                    className={`${communityJoinStates[item.id] && 'border border-primary '}`}
                    variant={communityJoinStates[item.id] ? 'outline' : 'default'}
                    onClick={async () => {
                      await toggleCommunityJoinState(item.id, item.handle)
                    }}>
                    <p
                      className={`px-4 py-1.5 text-body-1-bold  ${
                        communityJoinStates[item.id] ? 'text-primary' : 'text-monochrome-white'
                      }`}>
                      {communityJoinStates[item.id] ? 'Joined' : 'Join'}
                    </p>
                  </Button>
                </div>
              </div>
              <DecorativeList>
                <CommunityDetails userId={usernickname} community={item} />
              </DecorativeList>
            </div>
          ))}
        </div>
      )}
      {isFetchingNextPage && <Loader size="md" />}
    </div>
  )
}

function CommunityDetails({ userId, community }: { userId: string; community: CommunityMiniObj }) {
  const { data, isLoading, isFetchingNextPage } = getAllLoops(userId, community.slug)
  const addLoops = useCommunityListStore((state) => state.addLoops)

  useEffect(() => {
    const pageLength = data?.pages.length
    if (pageLength) addLoops(community, data?.pages[pageLength - 1].loops)
  }, [data])

  return (
    <>
      <div className="h-3"></div>
      {isLoading && (
        <li className="profile-loop-li relative my-4 w-full rounded-lg bg-tertiary-100 p-4">
          <Shimmer className="h-4 w-24" />
          <div className="my-2 grid w-full grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
                <Shimmer className="aspect-reel w-full rounded" />
              </div>
            ))}
          </div>
        </li>
      )}
      {community.loops.map((item: any, index: any) => (
        <li
          className="profile-loop-li relative mb-2 w-full rounded-lg border border-tertiary-200 p-4 pb-2"
          key={index}
          style={{ backgroundColor: '#F9F9F9' }}>
          {item.private ? (
            <div className="mb-2 flex items-center">
              <div className="mr-4 h-10 w-10 shrink-0 rounded-full bg-tertiary-200 p-2">
                <Image src={icLoopDark} alt="share" className=" fill-primary" />
              </div>
              <div>
                <a href={PATH_NAME.loop(item.slug)}>
                  <p className="text-title-3-bold">{item.name}</p>
                </a>
                <p className="text-body-1-med">This Loop is visible to its Collaborators only.</p>
              </div>
            </div>
          ) : (
            <LoopVideos userId={userId} loopDetails={item} community={community} />
          )}
        </li>
      ))}
      {community && community.private && (
        <li
          className="profile-loop-li relative mb-4 w-full rounded-lg border border-tertiary-200 p-4"
          style={{ backgroundColor: '#F9F9F9' }}>
          <div className="flex items-center">
            <div className="mr-4 h-10 w-10 shrink-0 rounded-full bg-tertiary-200 p-2">
              <Image src={icLock} alt="share" className=" fill-primary" />
            </div>
            <div>
              <p className="text-title-3-demi">This community is private</p>
              <p className="text-body-1-med">Join this community to see and interact with their posts.</p>
            </div>
          </div>
        </li>
      )}
      {isFetchingNextPage && <Loader size="md" />}
    </>
  )
}

function LoopVideos({
  userId,
  loopDetails,
  community,
}: {
  userId: string
  loopDetails: LoopMiniObj
  community: CommunityMiniObj
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllLoopVideos(
    userId,
    loopDetails.slug,
    3
  )
  const { addVideos, openModal } = useCommunityListStore((state) => ({
    addVideos: state.addVideos,
    openModal: state.open,
  }))

  useEffect(() => {
    const pageLength = data?.pages.length
    if (pageLength) addVideos(community, loopDetails, data?.pages[pageLength - 1]?.videos)
  }, [data])

  const [videoCount, setVideoCount] = useState(Math.max(0, loopDetails.video_count - 3))

  const handleSeeMoreClick = () => {
    void fetchNextPage()
    setTimeout(() => {
      if (videoCount > 0) {
        setVideoCount((prevVideosCount) => Math.max(0, prevVideosCount - 6))
      }
    }, 500)
  }

  return (
    <>
      <a href={PATH_NAME.loop(loopDetails.slug)}>
        <p className="break-all text-body-1-bold">{loopDetails.name}</p>
      </a>
      {data?.pages.flatMap((page) => page.videos).length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-3-bold text-tertiary">No posts available</div>
      )}
      <div className="my-2 grid w-full grid-cols-3 gap-2">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
              <Shimmer className="aspect-reel w-full rounded" />
            </div>
          ))}
        {loopDetails.videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => {
              openModal(video.share_string)
            }}
            className="relative flex aspect-reel min-w-full flex-col items-center">
            <img src={video.thumbnail} alt={video.slug} className="aspect-reel rounded" />
            <div className="absolute bottom-0 left-0 m-1 flex items-center justify-center">
              <Image src={icSpark} alt="share" height={15} width={15} />
              <p className="text-new-para-2-mobile text-monochrome-white">
                {abbreviateNumber(video.no_of_sparks) ?? 0}
              </p>
            </div>
          </div>
        ))}
        {isFetchingNextPage &&
          [...Array(videoCount < 6 ? videoCount : 6)].map((_, index) => (
            <Shimmer key={index} className="aspect-reel w-full rounded" />
          ))}
      </div>
      {hasNextPage && videoCount !== 0 && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center pt-2 text-cap-1-demi text-tertiary"
          onClick={handleSeeMoreClick}>
          See {videoCount} More
        </p>
      )}
    </>
  )
}
