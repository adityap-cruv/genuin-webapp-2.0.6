'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import dynamic from 'next/dynamic'
import { SideBar } from '@components/layouts/desktop/side-bar'
import { type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { getFeedForEmbed } from '@/components/embed/api'
import { useEffect, useMemo } from 'react'
import { useEmbedPlayerState } from '@/components/embed/embed-player-state'
import { useShallow } from 'zustand/react/shallow'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'

const DesktopFeed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop))
const MobileFeed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile))

export function StandardView() {
  const { showMobileView, sizeBox } = useEmbedConfig(
    useShallow((state) => ({ showMobileView: state.showMobileView, sizeBox: state.sizeBox }))
  )
  const { setEmbedType } = useEmbedPlayerState(useShallow((state) => ({ setEmbedType: state.setEmbedType })))

  useEffect(() => {
    setEmbedType('standard_wall')
  }, [])

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
  const { data: videoPages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = getFeedForEmbed(1)
  const videos = useMemo(() => videoPages?.pages.flatMap((item) => item.reels) ?? [], [videoPages])

  return (
    <main className="flex h-full w-full">
      <SideBar />
      <DesktopFeed
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        videos={videos}
        customSizeBox={sizeBox}
        hasNextPage={hasNextPage ?? true}
        isLoading={isLoading}
        startIndex={0}
      />
    </main>
  )
}
