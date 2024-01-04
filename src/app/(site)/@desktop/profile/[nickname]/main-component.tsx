'use client'
import { abbreviateNumber } from '@lib/utils'
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
import { useRef, useState } from 'react'
import icSpark from '@icons/player-controls/icBulb.svg'
import { Shimmer } from '@components/ui/shimmer'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import { TopBar } from './top-bar'
import { PlayerModal } from '@components/common/player-modal'

interface CompProps {
  profileData: any
}

// TODO: separate this component.
export function MainComponent({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })

  return (
    <>
      <TopBar
        defaultOpen={false}
        isOpen={!detailsInView}
        profileImage={profileData?.profile_image}
        profileName={profileData?.name}
        profileNickname={profileData?.nickname}
        isAvatar={profileData?.is_avatar}
      />
      <div className="hide-scrollbar absolute inset-0 h-full w-full overflow-auto px-4">
        <div className="mt-4 w-1/2">
          <CustomAvatar
            className="bg-slate-500 h-20 w-20 bg-red-40"
            fallbackString={profileData?.name}
            imageUrl={profileData?.profile_image}
            isAvatar={profileData?.is_avatar}
          />
          <div className="flex items-center py-1" ref={detailsDivRef}>
            {profileData?.name ? (
              <>
                <p className="line-clamp-1 pr-2 text-title-1-bold">{profileData?.name}</p>
                <p className="line-clamp-1 text-body-sm text-monochrome" style={{ fontWeight: 500 }}>
                  @{profileData?.nickname}
                </p>
              </>
            ) : (
              <>
                <p className="line-clamp-1 pr-2 text-title-1-bold">@{profileData?.nickname}</p>
              </>
            )}
          </div>
          <p className="my-1 line-clamp-2 break-all text-body-sm" style={{ fontWeight: 500, lineHeight: '24px' }}>
            {profileData?.bio}
          </p>
          <Stats profileData={profileData} />
          <Button
            variant="outline"
            size="custom"
            outlineColor="genuin-blue"
            className="my-1"
            onClick={async () =>
              await shareFn({
                shareLink: window.location.href + '?utm_source=app_web',
                toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
              })
            }>
            <span className="flex items-center p-1">
              <Image src={icShare} alt="share" height={24} width={24} />
            </span>
          </Button>
        </div>
        <div className="w-full overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
          <CommunityList usernickname={profileData?.nickname} />
        </div>
      </div>
      <Toaster />
    </>
  )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-6 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-body-lg" style={{ fontWeight: 700 }}>
          {abbreviateNumber(profileData?.views) || 0}
        </p>
        <p className="px-1 text-body-sm text-secondary" style={{ fontWeight: 500 }}>
          Views
        </p>
      </div>
      <div className="flex items-center">
        <p className="text-body-lg" style={{ fontWeight: 700 }}>
          {abbreviateNumber(profileData?.videos) || 0}
        </p>
        <p className="px-1 text-body-sm text-secondary" style={{ fontWeight: 500 }}>
          Posts
        </p>
      </div>
      <div className="flex items-center">
        <p className="text-body-lg" style={{ fontWeight: 700 }}>
          {abbreviateNumber(profileData?.no_of_community) || 0}
        </p>
        <p className="px-1 text-body-sm text-secondary" style={{ fontWeight: 500 }}>
          Communities
        </p>
      </div>
    </div>
  )
}

function CommunityList({ usernickname }: any) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllCommunities(usernickname)
  const communities = data?.pages.flatMap((page) => page.communities)
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  if (isLoading || isFetchingNextPage) return <Loader size="md" />

  if (communities && communities?.length === 0)
    return (
      <div
        className="flex h-full w-full items-center justify-center pt-2 text-title-3-bold text-monochrome"
        style={{ backgroundColor: '#F9F9F9' }}>
        No posts yet
      </div>
    )

  if (communities && communities?.length !== 0)
    return (
      <div ref={scrollDivRef} className="h-full w-full overflow-y-auto">
        <div>
          {communities?.map((item, index) => (
            <div key={index} className="my-6">
              <div className="flex items-center">
                <CustomAvatar
                  className="bg-slate-500 h-11 w-11 bg-red-40"
                  fallbackString={item?.name}
                  imageUrl={item?.dp}
                  isAvatar={false}
                />
                <Link href={{ pathname: PATH_NAME.community(item.slug) }}>
                  <div className="mx-2">
                    <p
                      className="line-clamp-1 text-left"
                      style={{ fontWeight: 600, fontSize: '20px', lineHeight: '24px' }}>
                      {item.name}
                    </p>
                  </div>
                </Link>
              </div>
              <DecorativeList>
                <CommunityDetails userId={usernickname} communityHandle={item.handle} />
              </DecorativeList>
            </div>
          ))}
        </div>
      </div>
    )
}

function CommunityDetails({ userId, communityHandle }: { userId: string; communityHandle: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllLoops(userId, communityHandle)
  const handleSeeMoreClick = () => {
    void fetchNextPage()
  }
  return (
    <>
      {isLoading && (
        <li
          className="profile-loop-li relative my-4 w-full rounded-lg border border-monochrome-9 p-4"
          style={{ backgroundColor: '#F9F9F9' }}>
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
      {data?.pages
        .flatMap((page) => page.loops)
        .map((item: any, index: any) => (
          <li
            className="profile-loop-li relative mb-4 w-full rounded-lg border border-monochrome-9 p-4 pb-2"
            style={{ backgroundColor: '#F9F9F9' }}
            key={index}>
            <LoopVideos userId={userId} loopDetails={item} />
          </li>
        ))}
      {isFetchingNextPage && <Loader size="md" />}
      {hasNextPage && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center pt-2 text-cap-lg text-monochrome"
          onClick={handleSeeMoreClick}>
          See More Loops
        </p>
      )}
    </>
  )
}

type LoopVideosProps = {
  userId: string
  loopDetails: any
}
function LoopVideos({ userId, loopDetails }: LoopVideosProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllLoopVideos(userId, loopDetails.slug)
  const videos = data?.pages.flatMap((item) => item.videos)

  const [videoCount, setVideoCount] = useState(Math.max(0, loopDetails.video_count - 10))

  const handleSeeMoreClick = () => {
    void fetchNextPage()
    if (videoCount > 0) {
      setVideoCount((prevVideosCount) => Math.max(0, prevVideosCount - 10))
    }
  }

  return (
    <>
      <Link href={{ pathname: PATH_NAME.loop(loopDetails.slug) }}>
        <p className="mb-3 text-title-sm" style={{ lineHeight: '24px' }}>
          {loopDetails.name}
        </p>
      </Link>
      {videos?.length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
              <Shimmer className="aspect-reel w-full rounded" />
            </div>
          ))}
        {videos?.map((video, index) => (
          <PlayerModal videoDetails={video} key={index}>
            <div key={video.id} className="relative flex aspect-reel min-w-full flex-col items-center">
              <img src={video.thumbnail} alt={`Video Thumbnail ${index}`} className="aspect-reel rounded" />
              <div className="absolute bottom-0 left-0 m-1 flex items-center justify-center">
                <Image src={icSpark} alt="share" height={15} width={15} />
                <p className="text-new-para-2-mobile text-monochrome-white">
                  {abbreviateNumber(video.no_of_sparks) || 0}
                </p>
              </div>
            </div>
          </PlayerModal>
        ))}
        {isFetchingNextPage &&
          Array.from({ length: Math.max(0, loopDetails.video_count - videoCount) }).map((_, index) => (
            <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
              <Shimmer className="aspect-reel h-full rounded" />
            </div>
          ))}
      </div>
      {hasNextPage && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center pt-2 text-cap-lg text-monochrome"
          onClick={handleSeeMoreClick}>
          See {videoCount} More
        </p>
      )}
    </>
  )
}
