'use client'
import { abbreviateNumber, checkAndAppendHttps } from '@lib/utils'
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
import { DownloadDialog } from '@components/common/download-dialog'

interface CompProps {
  profileData: any
}

// TODO: separate this component.
export function MainComponent({ profileData }: CompProps) {
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })

  const divRef = useRef<HTMLDivElement>(null)
  // const [divHeight, setDivHeight] = useState(0)

  // useEffect(() => {
  //   const updateHeight = () => {
  //     if (divRef.current) {
  //       const height = divRef.current.getBoundingClientRect().height
  //       setDivHeight(height)
  //     }
  //   }
  //   updateHeight()
  //   window.addEventListener('resize', updateHeight)
  //   return () => {
  //     window.removeEventListener('resize', updateHeight)
  //   }
  // }, [divRef])

  // console.log(divHeight)

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
  if (links?.facebook ?? links?.instagram ?? links?.linkedin ?? links?.tiktok ?? links?.twitter)
    return (
      <div className="my-2 flex">
        {links?.linkedin && (
          <div className="mr-2 flex items-center rounded-md bg-monochrome-9 p-1">
            <Link href={checkAndAppendHttps(links.linkedin)} target="_blank">
              <Image src={icLinkedIn} alt="linkedin" />
            </Link>
          </div>
        )}
        {links?.instagram && (
          <div className="mr-2 flex items-center rounded-md bg-monochrome-9 p-1">
            <Link href={checkAndAppendHttps(links.instagram)} target="_blank">
              <Image src={icInstagram} alt="instagram" />
            </Link>
          </div>
        )}
        {links?.twitter && (
          <div className="mr-2 flex items-center rounded-md bg-monochrome-9 p-1">
            <Link href={checkAndAppendHttps(links.twitter)} target="_blank">
              <Image src={icTwitter} alt="twitter" />
            </Link>
          </div>
        )}
        {links?.tiktok && (
          <div className="mr-2 flex items-center rounded-md bg-monochrome-9 p-1 px-2">
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
              shareLink: window.location.href + '?utm_source=app_web',
              toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
            })
          }>
          <span className="flex items-center p-1">
            <Image src={icShare} alt="share" height={24} width={24} />
          </span>
        </Button>
      </div>
    )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-6 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-body-lg" style={{ fontWeight: 700 }}>
          {abbreviateNumber(profileData?.no_of_views) ?? 0}
        </p>
        <p className="px-1 text-body-sm text-secondary" style={{ fontWeight: 500 }}>
          Views
        </p>
      </div>
      <div className="flex items-center">
        <p className="text-body-lg" style={{ fontWeight: 700 }}>
          {abbreviateNumber(profileData?.no_of_videos) ?? 0}
        </p>
        <p className="px-1 text-body-sm text-secondary" style={{ fontWeight: 500 }}>
          Posts
        </p>
      </div>
      <div className="flex items-center">
        <p className="text-body-lg" style={{ fontWeight: 700 }}>
          {abbreviateNumber(profileData?.no_of_communities) ?? 0}
        </p>
        <p className="px-1 text-body-sm text-secondary" style={{ fontWeight: 500 }}>
          Communities
        </p>
      </div>
    </div>
  )
}

function CommunityList({ usernickname }: any) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getAllCommunities(usernickname)
  const communities = data?.pages.flatMap((page) => page.communities)
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollDivRef, layoutEffect: false })
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (Number(latest.toFixed(1)) > 0.8 && !isFetchingNextPage) {
      void fetchNextPage()
    }
  })

  if (isLoading) return <Loader size="md" />

  if (communities && communities?.length === 0)
    return (
      <div className="w-full overflow-hidden" style={{ height: `calc(100% - 250px)` }}>
        <div
          className="flex h-full w-full items-center justify-center pt-2 text-title-3-bold text-monochrome"
          style={{ backgroundColor: '#F9F9F9' }}>
          No posts yet
        </div>
      </div>
    )

  if (communities && communities?.length !== 0)
    return (
      <div className="w-full overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
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
                  <div className="flex w-full items-center justify-between">
                    <Link href={{ pathname: PATH_NAME.community(item.slug) }}>
                      <div className="mx-2">
                        <p
                          className="line-clamp-1 text-left"
                          style={{ fontWeight: 600, fontSize: '20px', lineHeight: '24px' }}>
                          {item.name}
                        </p>
                      </div>
                    </Link>
                    <DownloadDialog
                      title="Get the Genuin app"
                      subtitle={
                        <>
                          Get the app to join the <br />
                          <span className="font-bold">@{item.handle}</span> community.
                        </>
                      }
                      asChild>
                      <Button size="custom" variant="default">
                        <p className="px-4 py-1.5 text-title-sm">Join</p>
                      </Button>
                    </DownloadDialog>
                  </div>
                </div>
                <DecorativeList>
                  <CommunityDetails userId={usernickname} communitySlug={item.slug} />
                </DecorativeList>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
}

function CommunityDetails({ userId, communitySlug }: { userId: string; communitySlug: string }) {
  const { data, isLoading, isFetchingNextPage } = getAllLoops(userId, communitySlug)
  return (
    <>
      <div className="h-3"></div>
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

  const [videoCount, setVideoCount] = useState(Math.max(0, loopDetails.video_count - 8))

  const handleSeeMoreClick = () => {
    void fetchNextPage()
    if (videoCount > 0) {
      setVideoCount((prevVideosCount) => Math.max(0, prevVideosCount - 16))
    }
  }

  function InnerComponent() {
    if (isLoading)
      return Array.from({ length: 8 }).map((_, index) => (
        <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
          <Shimmer className="aspect-reel w-full rounded" />
        </div>
      ))

    if (videos && videos.length === 0)
      return (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )
    if (videos)
      return videos?.map((video, index) => (
        <>
          <div
            key={video.id}
            className="group/vidcard relative flex aspect-reel min-w-full flex-col items-center bg-secondary hover:cursor-pointer">
            <img src={video.thumbnail} alt={video.description} className="aspect-reel rounded" />
            <div className="absolute bottom-0 left-0 m-1 flex items-center justify-center">
              <Image src={icSpark} alt="share" height={15} width={15} />
              <p className="text-new-para-2-mobile text-monochrome-white">
                {abbreviateNumber(video.no_of_sparks) ?? 0}
              </p>
            </div>
            <div className="absolute inset-0 hidden h-full w-full items-center justify-center bg-monochrome-black/40 group-hover/vidcard:flex">
              <Image src={icPlay} alt="" />
            </div>
          </div>
          {isFetchingNextPage &&
            Array.from({ length: Math.max(0, loopDetails.video_count - videoCount) }).map((_, index) => (
              <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
                <Shimmer className="aspect-reel h-full rounded" />
              </div>
            ))}
        </>
      ))
  }

  // TODO: replace <a></a> with <Link></Link>
  return (
    <>
      <a href={PATH_NAME.loop(loopDetails.slug)}>
        <p className="mb-3 text-title-sm" style={{ lineHeight: '24px' }}>
          {loopDetails.name}
        </p>
      </a>
      {videos?.length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
        <InnerComponent />
      </div>
      {hasNextPage && videoCount !== 0 && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center pt-2 text-cap-lg text-monochrome"
          onClick={handleSeeMoreClick}>
          See {videoCount} More
        </p>
      )}
    </>
  )
}
