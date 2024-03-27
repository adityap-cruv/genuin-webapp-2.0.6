'use client'
import { abbreviateNumber, checkAndAppendHttps, getCurrentShareUrl, openModal } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { DecorativeList } from '@components/custom/decorative-list'
import { getAllCommunities, getAllLoops, getAllLoopVideos } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import React, { useEffect, useRef, useState } from 'react'
import icSpark from '@icons/player-controls/icBulb.svg'
import icLock from '@icons/icLock.svg'
import icLoopDark from '@icons/icLoopDark.svg'
import icInstagram from '@icons/icInstagramBlack.svg'
import icTiktok from '@icons/icTiktok.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import { Shimmer } from '@components/ui/shimmer'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import { TopStickyBar } from './top-bar'
import icPlay from '@icons/player-controls/icPlay.svg'
import { type CommunityMiniObj, useCommunityListStore, type LoopMiniObj, type VideoMiniObj } from './store'
import { PlayerModal } from '@components/common/modals/player-modal'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { joinCommunity } from '@lib/api/video'
import { ShareIcon } from '@icons/share-icon'

interface CompProps {
  profileData: any
}

// TODO: separate this component.
export function MainComponent({ profileData }: CompProps) {
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const { reset: resetData } = useCommunityListStore((state) => ({ reset: state.reset }))
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      resetData()
    }
  }, [])

  return (
    <>
      <TopStickyBar.desktop
        defaultOpen={false}
        isOpen={!detailsInView}
        profileImage={profileData?.profile_image}
        profileName={profileData?.name}
        profileNickname={profileData?.nickname}
        isAvatar={profileData?.is_avatar}
      />
      <div className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto px-4">
        <div className="mt-4 w-1/2" ref={divRef}>
          <CustomAvatar
            className="bg-slate-500 h-20 w-20 bg-red-40"
            fallbackString={profileData?.name}
            imageUrl={profileData?.profile_image}
            isAvatar={profileData?.is_avatar}
          />
          <div className="flex items-center py-1" ref={detailsDivRef}>
            {profileData?.name ? (
              <>
                <p className="line-clamp-1 pr-2 text-title-1-bold text-secondary">{profileData?.name}</p>
                <p className="line-clamp-1 text-body-1-med text-tertiary">@{profileData?.nickname}</p>
              </>
            ) : (
              <>
                <p className="line-clamp-1 pr-2 text-title-1-bold text-tertiary">@{profileData?.nickname}</p>
              </>
            )}
          </div>
          <p className="my-1 line-clamp-2 break-all text-body-1-med text-secondary">{profileData?.bio}</p>
          <Stats profileData={profileData} />
          <Links profileData={profileData} />
        </div>
        <CommunityList usernickname={profileData?.nickname} />
      </div>
      <Toaster />
    </>
  )
}

function Links({ profileData }: CompProps) {
  const links = profileData?.social_links
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const { isEmbed, parentUrl } = useGenuinOptions((state) => ({ isEmbed: state.embed, parentUrl: state.parentUrl }))

  return (
    <div className="my-2 flex">
      {links?.linkedin && (
        <div className="mr-2 flex items-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.linkedin)} target="_blank">
            <Image src={icLinkedIn} alt="linkedin" />
          </Link>
        </div>
      )}
      {links?.instagram && (
        <div className="mr-2 flex items-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.instagram)} target="_blank">
            <Image src={icInstagram} alt="instagram" />
          </Link>
        </div>
      )}
      {links?.twitter && (
        <div className="mr-2 flex items-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.twitter)} target="_blank">
            <Image src={icTwitter} alt="twitter" />
          </Link>
        </div>
      )}
      {links?.tiktok && (
        <div className="mr-2 flex items-center rounded-md bg-tertiary-200 p-1 px-2">
          <Link href={checkAndAppendHttps(links.tiktok)} target="_blank">
            <Image src={icTiktok} alt="linkedin" />
          </Link>
        </div>
      )}
      <Button
        variant="outline"
        size="custom"
        outlineColor="genuin-blue"
        className="mx-1"
        onClick={async () =>
          await shareFn({
            shareLink: getCurrentShareUrl({ isEmbed, parentUrl }),
            toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
          })
        }>
        <span className="flex items-center p-1">
          <ShareIcon className="h-6 w-6 fill-primary" />{' '}
        </span>
      </Button>
    </div>
  )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-6 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-3-bold text-secondary">{abbreviateNumber(profileData?.no_of_views) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold text-secondary">{abbreviateNumber(profileData?.no_of_videos) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold text-secondary">{abbreviateNumber(profileData?.no_of_communities) ?? 0}</p>
        <p className="px-1 text-body-1-med text-tertiary">Communities</p>
      </div>
    </div>
  )
}

function CommunityList({ usernickname }: any) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getAllCommunities(usernickname)
  const [isCommunityJoined, setIsCommunityJoined] = useState(false)
  const user = useGenuinOptions().user
  const { addCommunities, communities } = useCommunityListStore((state) => ({
    addCommunities: state.addCommunities,
    communities: state.communities,
  }))

  useEffect(() => {
    const pageLength = data?.pages.length
    if (pageLength) addCommunities(data?.pages[pageLength - 1]?.communities as CommunityMiniObj[])
  }, [data])

  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  // TODO: Improve this component return type.
  return (
    <div className="w-full overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
      <div ref={scrollDivRef} className="h-full w-full overflow-y-auto">
        {isLoading && <Loader size="md" />}
        {communities && communities?.length === 0 && (
          <div className="w-full overflow-hidden" style={{ height: `calc(100% - 250px)` }}>
            <div className="flex h-full w-full items-center justify-center bg-tertiary-100 pt-2 text-title-3-bold text-tertiary">
              No posts yet
            </div>
          </div>
        )}
        {communities && communities?.length !== 0 && (
          <div>
            {communities?.map((item: CommunityMiniObj, index) => (
              <div key={index} className="my-6">
                <div className="flex items-center">
                  <CustomAvatar
                    className="bg-slate-500 h-11 w-11 bg-red-40"
                    fallbackString={item.name}
                    imageUrl={item.dp ?? ''}
                    isAvatar={false}
                  />
                  <div className="flex w-full items-center justify-between">
                    <Link href={{ pathname: PATH_NAME.community(item.slug) }}>
                      <div className="mx-2">
                        <p
                          className="line-clamp-1 text-left text-secondary"
                          style={{ fontWeight: 600, fontSize: '20px', lineHeight: '24px' }}>
                          {item.name}
                        </p>
                      </div>
                    </Link>
                    <Button
                      size="custom"
                      className={`${isCommunityJoined && 'border border-primary '}`}
                      variant={isCommunityJoined ? 'outline' : 'default'}
                      onClick={
                        user
                          ? async () => {
                              !isCommunityJoined &&
                                (await joinCommunity(
                                  false,
                                  [item.id],
                                  [
                                    {
                                      user_id: user?.id,
                                    },
                                  ]
                                ))
                              setIsCommunityJoined((prev) => !prev)
                            }
                          : () => {
                              openModal({
                                title: 'Get the Genuin app',
                                subtitle: (
                                  <>
                                    Get the app to join the <br />
                                    <span className="font-bold">@{item.handle}</span> community.
                                  </>
                                ),
                              })
                            }
                      }>
                      <p
                        className={`px-4 py-1.5 text-title-3-demi text-monochrome-white ${
                          isCommunityJoined && 'text-primary'
                        }`}>
                        {isCommunityJoined ? 'Joined' : 'Join'}
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
      <PlayerModalWrapper />
    </div>
  )
}

function PlayerModalWrapper() {
  const { close, currentVideoShareString, videoList, activeIndex, setActiveIndex } = useCommunityListStore((state) => ({
    close: state.close,
    currentVideoShareString: state.currentVideoShareString,
    videoList: state.videoList,
    activeIndex: state.activeIndex,
    setActiveIndex: state.setActiveIndex,
  }))

  if (videoList.length > 0)
    return (
      <PlayerModal.profile
        video={videoList[activeIndex].details ?? undefined}
        hasNextVideo={activeIndex < videoList.length - 1}
        hasPreviousVideo={activeIndex > 0}
        getNextVideo={() => {
          setActiveIndex(activeIndex + 1)
        }}
        getPreviousVideo={() => {
          setActiveIndex(activeIndex - 1)
        }}
        close={close}
        open={Boolean(currentVideoShareString)}
      />
    )
}

function CommunityDetails({ userId, community }: { userId: string; community: CommunityMiniObj }) {
  const { data, isLoading, isFetchingNextPage } = getAllLoops(userId, community.slug)
  const addLoops = useCommunityListStore((state) => state.addLoops)

  useEffect(() => {
    const pageLength = data?.pages.length
    if (pageLength) addLoops(community, data?.pages[pageLength - 1].loops as LoopMiniObj[])
  }, [data])

  return (
    <>
      <div className="h-3"></div>
      {isLoading && (
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
      )}
      {!community.private &&
        community.loops?.map((item: any, index: any) => (
          <li
            className="profile-loop-li relative mb-4 w-full rounded-lg border border-tertiary-200 p-4 pb-2"
            style={{ backgroundColor: '#F9F9F9' }}
            key={index}>
            <>
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
                <LoopVideos userId={userId} loop={item} community={community} />
              )}
            </>
          </li>
        ))}

      {community?.private && (
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
      )}
      {isFetchingNextPage && <Loader size="md" />}
    </>
  )
}

type LoopVideosProps = {
  userId: string
  loop: LoopMiniObj
  community: CommunityMiniObj
}

function LoopVideos({ userId, loop, community }: LoopVideosProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllLoopVideos(userId, loop.slug, 8)

  const { addVideos, open } = useCommunityListStore((state) => ({
    addVideos: state.addVideos,
    open: state.open,
  }))

  useEffect(() => {
    const pageLength = data?.pages.length
    if (pageLength) addVideos(community, loop, data?.pages[pageLength - 1]?.videos as VideoMiniObj[])
  }, [data])

  const [videoCount, setVideoCount] = useState(Math.max(0, loop.video_count - 8))

  const handleSeeMoreClick = () => {
    void fetchNextPage()
    setTimeout(() => {
      if (videoCount > 0) {
        setVideoCount((prevVideosCount) => Math.max(0, prevVideosCount - 16))
      }
    }, 500)
  }

  function InnerComponent() {
    if (isLoading)
      return Array.from({ length: 8 }).map((_, index) => (
        <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
          <Shimmer className="aspect-reel w-full rounded" />
        </div>
      ))

    if (loop.videos && loop.videos.length === 0)
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
                  open(video.share_string)
                }}
                key={video.id}
                className="group/vidcard relative flex aspect-reel min-w-full flex-col items-center hover:cursor-pointer">
                <img src={video.thumbnail} className="aspect-reel rounded" />
                <div className="absolute bottom-0 left-0 m-1 flex items-center justify-center">
                  <Image src={icSpark} alt="share" height={15} width={15} />
                  <p className="text-new-para-2-mobile text-monochrome-white">
                    {abbreviateNumber(video.no_of_sparks) ?? 0}
                  </p>
                </div>
                <div className="absolute inset-0 hidden h-full w-full items-center justify-center rounded bg-tertiary-400 group-hover/vidcard:flex">
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
        <p className="mb-3 text-body-1-bold text-secondary">{loop.name}</p>
      </Link>
      <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
        <InnerComponent />
        {isFetchingNextPage &&
          [...Array(videoCount < 16 ? videoCount : 16)].map((_, index) => (
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
