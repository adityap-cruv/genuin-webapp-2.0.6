'use client'
import {
  abbreviateNumber,
  checkAndAppendHttps,
  generateDeepLink,
  getCurrentShareUrl,
  openGeneratedLink,
  openModal,
} from '@lib/utils'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { DecorativeList } from '@components/custom/decorative-list'
import { getAllCommunities, getAllLoops, getAllLoopVideos } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { useEffect, useRef, useState } from 'react'
import icSpark from '@icons/player-controls/icBulb.svg'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { Shimmer } from '@components/ui/shimmer'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import { TopStickyBar } from '../../../@desktop/profile/[nickname]/top-bar'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import icTiktok from '@icons/icTiktok.svg'
import { type CommunityMiniObj, useCommunityListStore, type LoopMiniObj } from './store'
import { PlayerModal } from '@components/common/modals/player-modal'
import { type VideoDataType } from '@lib/schemas/video'
import icLock from '@icons/icLock.svg'
import icLoopDark from '@icons/icLoopDark.svg'
import { joinCommunity } from '@lib/api/video'
import { ShareIcon } from '@icons/share-icon'

interface CompProps {
  profileData: any
}

// TODO: separate this component.
export function MainComponent({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })
  const resetData = useCommunityListStore((state) => state.reset)
  const { isEmbed, parentUrl } = useGenuinOptions((state) => ({ isEmbed: state.embed, parentUrl: state.parentUrl }))

  useEffect(() => {
    return () => {
      resetData()
    }
  }, [])

  return (
    <>
      <TopBar variant={'light'} />
      <TopStickyBar.mobile
        defaultOpen={false}
        isOpen={!detailsInView}
        profileImage={profileData?.profile_image}
        profileName={profileData?.name}
        profileNickname={profileData?.nickname}
        isAvatar={profileData?.is_avatar}
      />
      <div
        ref={scrollDivRef}
        className="hide-scrollbar absolute inset-0 mt-navbar w-full overflow-auto"
        style={{ height: 'calc(100% - 74px)' }}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <CustomAvatar
              className="bg-slate-500 h-20 w-20 bg-red-40"
              fallbackString={profileData?.name}
              imageUrl={profileData?.profile_image}
              isAvatar={profileData?.is_avatar}
            />
            <div className="flex">
              {/* <Button
                className="mr-2"
                variant="outline"
                size="sm"
                outlineColor="genuin-blue"
                onClick={async () =>
                  await shareFn({
                    shareLink: window.location.href,
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <p className="text-body-1-bold text-blue">Edit Profile</p>
              </Button> */}
              <Button
                variant="outline"
                size="custom"
                outlineColor="genuin-blue"
                className="p-1.5"
                onClick={async () =>
                  await shareFn({
                    shareLink: getCurrentShareUrl({ isEmbed, parentUrl }),
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <ShareIcon className="h-6 w-6 fill-primary" />
              </Button>
            </div>
          </div>
          <div ref={detailsDivRef} className="mt-2 flex items-center">
            {profileData?.name ? (
              <>
                <p className="line-clamp-1 pr-2 text-title-3-bold text-secondary">{profileData?.name}</p>
                <p className="line-clamp-1 text-body-1-med text-tertiary">@{profileData?.nickname}</p>
              </>
            ) : (
              <>
                <p className="line-clamp-1 pr-2 text-title-3-bold text-tertiary">@{profileData?.nickname}</p>
              </>
            )}
          </div>
          <p className="my-1 line-clamp-2 text-body-1-demi text-secondary">{profileData?.bio}</p>
          <Stats profileData={profileData} />
          <Links profileData={profileData} />
        </div>
        <hr className="my-1 border-t border-tertiary-200" />
        <CommunityList usernickname={profileData?.nickname} scrollYProgress={scrollYProgress} />
      </div>
      <PlayerModalWrapper />
    </>
  )
}

function PlayerModalWrapper() {
  const [feedState, setFeedState] = useState<{
    isLoading: boolean
    feedList: VideoDataType[]
    feedStartIndex: number
  }>({
    isLoading: true,
    feedList: [],
    feedStartIndex: 0,
  })

  const { close, currentVideoShareString, videoList, setCurrentIndex, startIndex, endIndex } = useCommunityListStore(
    (state) => ({
      close: state.close,
      currentVideoShareString: state.currentVideoShareString,
      videoList: state.videoList,
      setCurrentIndex: state.setCurrentIndex,
      startIndex: state.startIndex,
      endIndex: state.endIndex,
    })
  )

  useEffect(() => {
    if (currentVideoShareString) {
      const shareStrings = videoList.flatMap((item) => item.shareString)
      setFeedState((x) => {
        x.isLoading = true
        return { ...x }
      })
      setCurrentIndex(shareStrings.indexOf(currentVideoShareString))
    }
  }, [currentVideoShareString])

  useEffect(() => {
    const list = videoList.slice(startIndex, endIndex)
    setFeedState((x) => {
      x.feedStartIndex = list.findIndex((item) => item.shareString === currentVideoShareString)
      x.isLoading = !list.every((item) => Boolean(item.details))
      x.feedList = list.map((item) => item.details as VideoDataType)
      return { ...x }
    })
  }, [videoList])

  //  TODO: this code is causing many issues fix it.
  return (
    <PlayerModal.mobile
      close={close}
      fetchNextVideos={() => {}}
      isError={false}
      isLoading={feedState.isLoading}
      startIndex={feedState.feedStartIndex}
      videos={feedState.feedList}
      isFetchingNextPage={false}
      open={Boolean(currentVideoShareString)}
    />
  )
}

function Links({ profileData }: CompProps) {
  const links = profileData?.social_links
  return (
    <div className="mt-2 flex">
      {links?.linkedin && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.linkedin)} target="_blank">
            <Image src={icLinkedIn} alt="linkedin" />
          </Link>
        </div>
      )}
      {links?.instagram && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.instagram)} target="_blank">
            <Image src={icInstagram} alt="instagram" />
          </Link>
        </div>
      )}
      {links?.twitter && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1">
          <Link href={checkAndAppendHttps(links.twitter)} target="_blank">
            <Image src={icTwitter} alt="twitter" />
          </Link>
        </div>
      )}
      {links?.tiktok && (
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-200 p-1 px-2">
          <Link href={checkAndAppendHttps(links.tiktok)} target="_blank">
            <Image src={icTiktok} alt="linkedin" />
          </Link>
        </div>
      )}
    </div>
  )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-2 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-3-bold text-secondary">{abbreviateNumber(profileData?.no_of_views) ?? 0}</p>
        <p className="px-1 text-cap-1-demi text-tertiary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold text-secondary">{abbreviateNumber(profileData?.no_of_videos) ?? 0}</p>
        <p className="px-1 text-cap-1-demi text-tertiary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-3-bold text-secondary">{abbreviateNumber(profileData?.no_of_communities) ?? 0}</p>
        <p className="px-1 text-cap-1-demi text-tertiary">Communities</p>
      </div>
    </div>
  )
}

function CommunityList({ usernickname, scrollYProgress }: any) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getAllCommunities(usernickname)
  const { addCommunities, communities } = useCommunityListStore((state) => ({
    addCommunities: state.addCommunities,
    communities: state.communities,
  }))
  const [isCommunityJoined, setIsCommunityJoined] = useState(false)
  const user = useGenuinOptions().user
  const embed = useGenuinOptions().embed

  useEffect(() => {
    const pageLength = data?.pages.length
    if (pageLength) addCommunities(data?.pages[pageLength - 1]?.communities)
  }, [data])

  useMotionValueEvent(scrollYProgress, 'change', (latest: any) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

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
                    <p className="line-clamp-1 break-all text-left text-body-1-bold text-secondary">{item.name}</p>
                  </Link>

                  {embed ? (
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
                        className={`px-4 py-1.5 text-body-1-bold  ${
                          isCommunityJoined ? 'text-primary' : 'text-monochrome-white'
                        }`}>
                        {isCommunityJoined ? 'Joined' : 'Join'}
                      </p>
                    </Button>
                  ) : (
                    <Button
                      size="custom"
                      variant="default"
                      onClick={() => {
                        generateDeepLink({
                          action: 'join',
                          contentType: 'community',
                          description: `Find your people. Find what you love. | Join ${item.name} to talk about it`,
                          title: `join ${item.name}`,
                          previewImage: null,
                          fromUserName: null,
                          pathName: PATH_NAME.community(item.slug),
                          // sourceId: item.handle,
                          utmCampaign: 'share',
                          utmMedium: 'web',
                          utmSource: window.location.hostname,
                        })
                          .then((generatedLink) => {
                            openGeneratedLink(generatedLink)
                          })
                          .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                      }}>
                      <p className="px-4 py-1.5 text-body-1-bold text-monochrome-white">Join</p>
                    </Button>
                  )}
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
        <p className="break-all text-body-1-bold text-secondary">{loopDetails.name}</p>
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
