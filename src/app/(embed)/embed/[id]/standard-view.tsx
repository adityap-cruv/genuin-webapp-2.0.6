'use client'
import { useSize } from './size-provider'
import { getFeed } from '@lib/api/feed'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import dynamic from 'next/dynamic'
import { SideBar } from '@components/layouts/desktop/side-bar'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { useEffect } from 'react'
const DesktopFeed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop))
const MobileFeed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile))

export function StandardView({ embedId, embedStyle }: { embedId: string; embedStyle: string }) {
  const { showMobileView, sizeBox } = useSize()
  const { setInitialData } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
  }))
  useEffect(() => {
    setInitialData({ embedId, embedStyle, embedType: '' })
  }, [])

  if (showMobileView) {
    return <Mobile sizeBox={sizeBox} />
  }
  return <Desktop sizeBox={sizeBox} />
}
function Mobile({ sizeBox }: { sizeBox: VideoSizeBoxType }) {
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeed(1)
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
  const { data, isError, fetchNextPage, isFetchingNextPage, isLoading } = getFeed(1)
  const videos = data?.pages.flatMap((item) => item.reels)

  if (isLoading) return <FeedShimmer.desktop />
  return (
    <main className="flex h-full w-full">
      <SideBar />
      <DesktopFeed
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        isLoading={isLoading}
        videos={videos}
        customSizeBox={sizeBox}
      />
    </main>
  )
}
