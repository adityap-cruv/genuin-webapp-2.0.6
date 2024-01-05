'use client'
import { abbreviateNumber, checkAndAppendHttps, generateDeepLink, openGeneratedLink } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { DecorativeList } from '@components/custom/decorative-list'
import { getAllCommunities, getAllLoops, getAllLoopVideos } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { useRef, useState } from 'react'
import icSpark from '@icons/player-controls/icBulb.svg'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { Shimmer } from '@components/ui/shimmer'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { PlayerModal } from '@components/common/player-modal'
import { useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import { TopStickyBar } from '../../../@desktop/profile/[nickname]/top-bar'
import icInstagram from '@icons/icInstagramBlack.svg'
import icLinkedIn from '@icons/icLinkedIn.svg'
import icTwitter from '@icons/icTwitterBlack.svg'
import icShare from '@icons/icShareBlue.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import icTiktok from '@icons/icTiktok.svg'

interface CompProps {
  profileData: any
}

export function MainComponent({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()
  const detailsDivRef = useRef<HTMLDivElement>(null)
  const detailsInView = useInView(detailsDivRef, { amount: 0.6 })
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
      <div className="hide-scrollbar absolute inset-0 mt-navbar w-full overflow-auto" style={{ height: 'calc(100% - 74px)' }}>
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
                <p className="text-title-sm text-blue">Edit Profile</p>
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                outlineColor="genuin-blue"
                onClick={async () =>
                  await shareFn({
                    shareLink: window.location.href + '?utm_source=app_web',
                    toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
                  })
                }>
                <Image src={icShare} alt="share" height={22} width={22} />
              </Button>
            </div>
          </div>
          <div ref={detailsDivRef} className="mt-2 flex items-center">
            {profileData?.name ? (
              <>
                <p className="line-clamp-1 pr-2 text-title-md">{profileData?.name}</p>
                <p className="line-clamp-1 text-body-sm text-monochrome" style={{ fontWeight: 500 }}>
                  @{profileData?.nickname}
                </p>
              </>
            ) : (
              <>
                <p className="line-clamp-1 pr-2 text-title-md">@{profileData?.nickname}</p>
              </>
            )}
          </div>
          <p className="my-1 line-clamp-2 text-body-sm" style={{ lineHeight: '24px' }}>
            {profileData?.bio}
          </p>
          <Stats profileData={profileData} />
          <Links profileData={profileData} />
        </div>
        <hr className="my-1 border-t border-monochrome-9" />
        <CommunityList usernickname={profileData?.nickname} />
      </div>
    </>
  )
}

function Links({ profileData }: CompProps) {
  const links = profileData?.social_links
  if (links?.facebook ?? links?.instagram ?? links?.linkedin ?? links?.tiktok ?? links?.twitter)
    return (
      <div className="mt-2 flex">
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
      </div>
    )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-2 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.no_of_views) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.no_of_videos) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.no_of_communities) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Communities</p>
      </div>
    </div>
  )
}

function CommunityList({ usernickname }: any) {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = getAllCommunities(usernickname)
  const communities = data?.pages.flatMap((item) => item.communities)

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
      <div ref={scrollDivRef} className="h-full w-full p-4">
        <div>
          {communities?.map((item, index) => (
            <div key={index}>
              <div className="flex items-center">
                <CustomAvatar
                  className="bg-slate-500 h-11 w-11 bg-red-40"
                  fallbackString={item?.name}
                  imageUrl={item?.dp}
                  isAvatar={false}
                />
                <div className="mx-2 flex w-full items-center justify-between">
                  <Link href={{ pathname: PATH_NAME.community(item.slug) }}>
                    <p className="line-clamp-1 text-left text-title-sm">{item.name}</p>
                  </Link>

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
                        sourceId: item.handle,
                        utmCampaign: 'share',
                        utmMedium: 'web',
                        utmSource: window.location.hostname,
                      })
                        .then((generatedLink) => {
                          openGeneratedLink(generatedLink)
                        })
                        .catch((e) => window.open(process.env.NEXT_PUBLIC_HOST_URL))
                    }}>
                    <p className="px-4 py-1.5 text-title-sm">Join</p>
                  </Button>
                </div>
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
  const { data, isLoading, isFetchingNextPage } = getAllLoops(userId, communityHandle)

  return (
    <>
      <div className="h-3"></div>
      {isLoading && (
        <li
          className="profile-loop-li relative my-4 w-full rounded-lg bg-monochrome-9 p-4"
          style={{ backgroundColor: '#F9F9F9' }}>
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
      {data?.pages
        .flatMap((page) => page.loops)
        .map((item: any, index: any) => (
          <li
            className="profile-loop-li relative mb-2 w-full rounded-lg border border-monochrome-9 p-4 pb-2"
            key={index}
            style={{ backgroundColor: '#F9F9F9' }}>
            <LoopVideos userId={userId} loopDetails={item} />
          </li>
        ))}
      {isFetchingNextPage && <Loader size="md" />}
    </>
  )
}

function LoopVideos({ userId, loopDetails }: any) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllLoopVideos(userId, loopDetails.slug)

  const [videoCount, setVideoCount] = useState(Math.max(0, loopDetails.video_count - 3))

  const handleSeeMoreClick = () => {
    void fetchNextPage()
    if (videoCount > 0) {
      setVideoCount((prevVideosCount) => Math.max(0, prevVideosCount - 6))
    }
  }

  return (
    <>
      <a href={PATH_NAME.loop(loopDetails.slug)}>
        <p className="text-title-sm">{loopDetails.name}</p>
      </a>
      {data?.pages.flatMap((page) => page.videos).length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-2 grid w-full grid-cols-3 gap-2">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
              <Shimmer className="aspect-reel w-full rounded" />
            </div>
          ))}
        {data?.pages
          .flatMap((page) => page.videos)
          .map((video, index) => (
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
