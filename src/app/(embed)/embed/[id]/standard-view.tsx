'use client'
import { useSizeStore } from '@components/embed/size-provider'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import dynamic from 'next/dynamic'
import { SideBar } from '@components/layouts/desktop/side-bar'
import { type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { getFeedForEmbed } from '@/components/embed/api'
import { useRef } from 'react'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'

const DesktopFeed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop))
const MobileFeed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile))

export function StandardView() {
  const { showMobileView, sizeBox } = useSizeStore()

  if (showMobileView) {
    return <Mobile sizeBox={sizeBox} />
  }
  return <Desktop sizeBox={sizeBox} />
}
function Mobile({ sizeBox }: { sizeBox: VideoSizeBoxType }) {
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeedForEmbed(1)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  if (videos)
    return (
      <main className="h-full w-full">
        <TopBar variant="transparent" />
        <span className="absolute inset-0">
          <MobileFeed
            startIndex={0}
            fetchNextPage={fetchNextPage}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            videos={videos}
            customSizeBox={sizeBox}
          />
        </span>
      </main>
    )

  return <FeedShimmer.mobile />
}

function Desktop({ sizeBox }: { sizeBox: VideoSizeBoxType }) {
  const { data: videoPages, fetchNextPage, isFetchingNextPage, isLoading } = getFeedForEmbed(1)
  const videosRef = useRef<VideoPlayerModalType[]>([])
  videosRef.current = videoPages?.pages.flatMap((item) => item.reels) ?? []

  if (isLoading) return <FeedShimmer.desktop />
  return (
    <main className="flex h-full w-full">
      <SideBar />
      <DesktopFeed
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        videosRef={videosRef}
        customSizeBox={sizeBox}
      />
    </main>
  )
}
