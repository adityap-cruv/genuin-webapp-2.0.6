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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { getAllCommunities, getAllLoops, getAllLoopVideos } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { useRef, useState } from 'react'
import icSpark from '@icons/player-controls/icBulb.svg'
import { Shimmer } from '@components/ui/shimmer'
import { useInView } from 'framer-motion'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

interface CompProps {
  profileData: any
}

export function MainComponent({ profileData }: CompProps) {
  const { shareFn } = useAdaptiveShare()
  const { toast } = useToast()

  return (
    <>
      <div className="h-full w-full overflow-auto p-4">
        <div className="w-1/2">
          <CustomAvatar
            className="bg-slate-500 h-20 w-20 bg-red-40"
            fallbackString={profileData?.name}
            imageUrl={profileData?.profile_image}
            isAvatar={profileData?.is_avatar}
          />
          <div className="flex items-center py-1">
            <p className="line-clamp-1 pr-2 text-title-lg">{profileData?.name}</p>
            <p className="line-clamp-1 text-body-sm text-monochrome">@{profileData?.nickname}</p>
          </div>
          <p className="text-new-para-3 py-1">{profileData?.bio}</p>
          <Stats profileData={profileData} />
          <Button
            variant="outline"
            size="sm"
            outlineColor="genuin-blue"
            onClick={async () =>
              await shareFn({
                shareLink: window.location.href,
                toast: () => toast({ title: 'Link Copied!', duration: 1000 }),
              })
            }>
            <Image src={icShare} alt="share" height={22} width={22} />
            <p className="pl-2 text-title-sm text-blue">Share</p>
          </Button>
        </div>
        <CommunityList usernickname={profileData?.nickname} />
      </div>
      <Toaster />
    </>
  )
}

function Stats({ profileData }: { profileData: any }) {
  return (
    <div className="m-1 ml-0 flex max-w-[250px]  justify-between gap-x-6 p-1 pl-0">
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.views) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Views</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.videos) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Posts</p>
      </div>
      <div className="flex items-center">
        <p className="text-title-md">{abbreviateNumber(profileData?.no_of_community) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Communities</p>
      </div>
    </div>
  )
}

function CommunityList({ usernickname }: any) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllCommunities(usernickname)

  const handleSeeMoreClick = () => {
    void fetchNextPage()
  }

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  let itemHandles = data?.pages.flatMap((page) => page.list).map((item) => item.handle);

  const handleAccordionItemClick = (handle: string) => {
    const isSelected = itemHandles?.includes(handle);
  
    if (isSelected) {
      itemHandles = itemHandles?.filter((item) => item !== handle);
    } else {
      itemHandles?.push(handle);
    }
  };

  return (
    <>
      {isLoading && <Loader size="md" />}
      {data && (
        <Accordion type="multiple" value={itemHandles}>
          {data?.pages
            .flatMap((page) => page.list)
            .map((item, index) => (
              <div key={index}>
                &nbsp;
                <AccordionItem
                  value={item.handle}
                  className="border-none"
                  onClick={() => {
                    handleAccordionItemClick(item.handle)
                  }}>
                  <AccordionTrigger className="m-0 p-0">
                    <div className="flex items-center">
                      <CustomAvatar
                        className="bg-slate-500 h-11 w-11 bg-red-40"
                        fallbackString={item?.name}
                        imageUrl={item?.dp}
                        isAvatar={false}
                      />
                      <div className="mx-2">
                        <p className="line-clamp-1 text-left text-title-md">{item.name}</p>
                        <p className="line-clamp-1 text-new-para-2 text-monochrome">Visible to approved members only</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <DecorativeList>
                      <CommunityDetails userId={usernickname} communityId={item.id} />
                    </DecorativeList>
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
        </Accordion>
      )}
      {isFetchingNextPage && <Loader size="md" />}
      {hasNextPage && (
        <p
          className="text-blue-500 flex w-full cursor-pointer justify-center pt-2 text-cap-lg text-monochrome"
          onClick={handleSeeMoreClick}>
          See More Communities
        </p>
      )}
    </>
  )
}

function CommunityDetails({ userId, communityId }: any) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllLoops(userId, communityId)
  const handleSeeMoreClick = () => {
    void fetchNextPage()
  }

  return (
    <>
      &nbsp;
      {isLoading && (
        <li className="profile-loop-li relative my-4 w-full rounded-lg bg-monochrome-9 p-4">
          <Shimmer className="h-6 w-40" />
        </li>
      )}
      {data?.pages
        .flatMap((page) => page.list)
        .map((item: any, index: any) => (
          <li className="profile-loop-li relative my-4 w-full rounded-lg bg-monochrome-9 p-4 pb-2" key={index}>
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

function LoopVideos({ userId, loopDetails }: any) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getAllLoopVideos(
    userId,
    loopDetails.share_string
  )

  const [videoCount, setVideoCount] = useState(Math.max(0, loopDetails.video_count - 10))

  const handleSeeMoreClick = () => {
    void fetchNextPage()
    if (videoCount > 0) {
      setVideoCount((prevVideosCount) => Math.max(0, prevVideosCount - 10))
    }
  }

  return (
    <>
      <Link href={{ pathname: PATH_NAME.loop(loopDetails.share_string) }}>
        <p className="text-title-sm">{loopDetails.name}</p>
      </Link>
      {data?.pages.flatMap((page) => page.list).length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <div key={`shimmer-${index}`} className="relative flex flex-col items-center">
              <Shimmer className="aspect-reel w-full rounded" />
            </div>
          ))}
        {data?.pages
          .flatMap((page) => page.list)
          .map((video, index) => (
            <div key={video.id} className="relative flex flex-col items-center">
              <img src={video.thumbnail} alt={`Video Thumbnail ${index}`} className="aspect-reel rounded" />
              <div className="absolute bottom-0 left-0 m-1 flex items-center justify-center">
                <Image src={icSpark} alt="share" height={15} width={15} />
                <p className="text-new-para-2-mobile text-monochrome-white">
                  {abbreviateNumber(video.no_of_sparks) || 0}
                </p>
              </div>
            </div>
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
