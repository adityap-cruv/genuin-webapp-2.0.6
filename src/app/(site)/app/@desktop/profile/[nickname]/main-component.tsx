'use client'
import { abbreviateNumber } from '@lib/utils'
import { Button } from '@components/ui/button'
import Image from 'next/image'
import icShare from '@icons/icShareBlue.svg'
import { useAdaptiveShare } from '@hooks/use-adaptive-share'
import { useToast } from '@components/ui/use-toast'
import { Toaster } from '@components/ui/toaster'
import { CustomAvatar } from '@components/custom/custom-avatar'
import CustomDecorativeList from '@components/custom/custom-decorative-list'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion'
import { getAllCommunities, getAllLoops, getPaginatedLoopVideos } from '@lib/api/profile'
import { Loader } from '@components/ui/loader'
import { useState } from 'react'

interface CompProps {
  profileData: any
}

export function MainComponent({ profileData }: CompProps) {
  const { data, isLoading, isError } = getAllCommunities(profileData?.nickname)
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
        {isLoading && <Loader size="md" />}
        {isError && <div>Something went wrong...</div>}
        {data && data.length !== 0 && (
          <>
            <Accordion type="single" defaultValue="connect" collapsible>
              {data.map((item: any, index: any) => (
                <div key={index}>
                  &nbsp;
                  <AccordionItem value={item.handle} className="border-none ">
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
                          <p className="line-clamp-1 text-new-para-2 text-monochrome">
                            Visible to approved members only
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CustomDecorativeList>
                        <CommunityDetails userId={profileData?.nickname} communityId={item.id} />
                      </CustomDecorativeList>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </>
        )}
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
        <p className="text-title-md">{abbreviateNumber(profileData?.replies) || 0}</p>
        <p className="px-1 text-cap-lg text-secondary">Communities</p>
      </div>
    </div>
  )
}

function CommunityDetails({ userId, communityId }: any) {
  const { data, isLoading, isError } = getAllLoops(userId, communityId)

  return (
    <>
      &nbsp;
      {isLoading && <Loader size="md" />}
      {isError && <div>Something went wrong...</div>}
      {data && data.length === 0 && <>No items</>}
      {data && data.length !== 0 && (
        <>
          {data.map((item: any, index: any) => (
            <li className="relative my-4 w-full rounded-lg bg-monochrome-9 p-4 pb-2" key={index}>
              <LoopDetails userId={userId} loopDetails={item} />
            </li>
          ))}
        </>
      )}
    </>
  )
}

function LoopDetails({ userId, loopDetails }: any) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getPaginatedLoopVideos(
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
      <p className="text-title-sm">{loopDetails.name}</p>
      {isLoading && <Loader size="md" />}
      {data?.pages.flatMap((page) => page.videos).length === 0 && (
        <div className="flex items-center justify-center pt-32 text-title-md text-secondary">No videos available</div>
      )}
      <div className="my-2 grid w-full grid-cols-4 gap-2 md:grid-cols-8">
        {data?.pages
          .flatMap((page) => page)
          .map((video, index) => (
            <div key={video.id} className="flex flex-col items-center">
              <img src={video.thumbnail} alt={`Video Thumbnail ${index}`} className="aspect-reel rounded" />
            </div>
          ))}
      </div>
      {isFetchingNextPage && <Loader size="md" />}
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
