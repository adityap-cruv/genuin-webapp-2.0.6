import icSpark from '@icons/player-controls/icBulb.svg'
import icLock from '@icons/icLock.svg'
import icLoopDark from '@icons/icLoopDark.svg'
import { DecorativeList } from '@components/custom/decorative-list'
import { fetchProfileCommunityLoops, fetchProfileVideos, getCommunities, getProfileFeed } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { Shimmer } from '@components/ui/shimmer'
import { joinCommunity } from '@lib/api/video'
import { PlayerModal } from '@components/common/modals/player-modal'
import { PATH_NAME } from '@lib/utils/constants/path'
import icPlay from '@icons/player-controls/icPlay.svg'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import React, { useState, useEffect, useRef } from 'react'
import { useCommunityListStore } from './store'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { Button } from '@components/ui/button'
import Link from 'next/link'
import { openModal, abbreviateNumber } from '@lib/utils'
import Image from 'next/image'
import { type ProfileLoopType, type ProfileCommunityType, type ProfileVideoType } from '@lib/schemas/profile/community'
import { getNextPage } from './hook'

export function CommunityList({ userId }: { userId: string }) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getCommunities(userId, 8)
  const communities = data?.pages.flatMap((item) => item.communities)
  const [communityJoinStates, setCommunityJoinStates] = useState<Record<string, boolean>>({})
  const user = useGenuinOptions().user

  const { addCommunities, currentVideoId } = useCommunityListStore()

  useEffect(() => {
    const newCommunites = data?.pages[data.pages.length - 1].communities
    // if (localCommunities && newCommunites && localCommunities?.length !== communities.length) {
    if (newCommunites) addCommunities(newCommunites)
    // }
  }, [communities?.length])

  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })
  // TODO: Manage it in better way
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

  function Inner() {
    if (isLoading) return <Loader size="md" />
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
                  <Link href={{ pathname: PATH_NAME.community(item.slug) }}>
                    <div className="mx-2">
                      <p
                        className="line-clamp-1 text-left"
                        style={{ fontWeight: 600, fontSize: '20px', lineHeight: '24px' }}>
                        {item.name ?? `${item.handle}`}
                      </p>
                    </div>
                  </Link>
                  <Button
                    size="custom"
                    className={`${communityJoinStates[item.id] && 'border border-primary '}`}
                    variant={communityJoinStates[item.id] ? 'outline' : 'default'}
                    onClick={async () => {
                      await toggleCommunityJoinState(item.id, item.handle)
                    }}>
                    <p
                      className={`px-4 py-1.5 text-title-3-demi text-monochrome-white ${
                        communityJoinStates[item.id] && 'text-primary'
                      }`}>
                      {communityJoinStates[item.id] ? 'Joined' : 'Join'}
                    </p>
                  </Button>
                </div>
              </div>
              <DecorativeList>
                <Loops userId={userId} community={item} communityId={item.id} />
              </DecorativeList>
            </div>
          )
        })}
        {isFetchingNextPage && <Loader size="md" />}
      </div>
    )
  }

  return (
    <div ref={scrollDivRef} className="w-full overflow-scroll" style={{ height: 'calc(100% - 56px)' }}>
      <Inner />
      {currentVideoId && <PlayerModalWrapper userId={userId} currentVideoId={currentVideoId} />}
    </div>
  )
}

function PlayerModalWrapper({ userId, currentVideoId }: { userId: string; currentVideoId: string }) {
  const { data, isLoading, fetchNextPage } = getProfileFeed(userId, currentVideoId)
  const { close } = useCommunityListStore()
  const videos = data?.pages.flatMap((item) => item.feed)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!videos) return
    if (activeIndex === videos?.length - 2) {
      void fetchNextPage()
    }
  }, [activeIndex])

  return (
    <PlayerModal.profile
      video={videos?.[activeIndex]}
      hasNextVideo={(videos?.length ?? 0) - 1 !== activeIndex}
      hasPreviousVideo={activeIndex !== 0}
      getNextVideo={() => {
        setActiveIndex(activeIndex + 1)
      }}
      getPreviousVideo={() => {
        setActiveIndex(activeIndex - 1)
      }}
      close={close}
      open={Boolean(currentVideoId)}
      isLoading={isLoading}
    />
  )
}

function Loops({
  userId,
  community,
  communityId,
}: {
  userId: string
  community: ProfileCommunityType
  communityId: string
}) {
  const addLoops = useCommunityListStore((state) => state.addLoops)
  const { fetchNext, isFetchingNextPage } = getNextPage<ProfileLoopType[]>(
    async () =>
      await fetchProfileCommunityLoops(userId, 16, communityId, community.loops[community.loops.length - 1].id),
    (data) => {
      addLoops(communityId, data)
    }
  )

  // TODO: think about this private community with backend.
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
            <div className="mb-2 flex items-center">
              <div className="mr-4 h-14 w-14 shrink-0 rounded-full bg-tertiary-200 p-3">
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
            <LoopVideos userId={userId} loop={item} communityId={communityId} />
          )}
        </li>
      ))}
      {/** TODO: discus with design team about getting more loops pagination design. */}
      {community.loopCount > community.loops.length && !isFetchingNextPage && <div onClick={fetchNext}>more</div>}
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
  userId: string
  loop: ProfileLoopType
  communityId: string
}

function LoopVideos({ userId, loop, communityId }: LoopVideosProps) {
  const { addVideos, open } = useCommunityListStore((state) => ({
    addVideos: state.addVideos,
    open: state.open,
  }))

  const { fetchNext, isFetchingNextPage } = getNextPage<ProfileVideoType[]>(
    async () => await fetchProfileVideos(userId, 16, communityId, loop.id, loop.videos[loop.videos.length - 1].id),
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
                <div className="absolute bottom-0 left-0 m-1 flex items-center justify-center">
                  <Image src={icSpark} alt="share" height={15} width={15} />
                  <p className="text-new-para-2-mobile text-monochrome-white">
                    {abbreviateNumber(video.sparkCount) ?? 0}
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
