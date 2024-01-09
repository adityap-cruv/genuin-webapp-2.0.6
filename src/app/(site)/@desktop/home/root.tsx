'use client'
import { Loader } from '@components/ui/loader'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { getFeed } from '@lib/api/feed'
import { useEffect } from 'react'
import { useLocalStorage } from '@lib/stores/local-storage'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <Loader size="md" />
  },
})

export function Root({ brandId }: { brandId?: string }) {
  // TODO: Remove this line of code.
  const showTopbar = useSearchParams().get('embed') !== '1'
  const videoSizeBox = useVideoSizeBox(showTopbar)
  const userId = useLocalStorage((state) => state.userId)
  const { data, isError, fetchNextPage, isFetchingNextPage, isLoading } = getFeed({
    feedType: 'home',
    userID: userId,
    brandId,
  })
  const videos = data?.pages.flatMap((item) => item.reels)

  if (videoSizeBox && videos)
    return (
      <main className="h-full w-full">
        <Feed
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          sizeBox={videoSizeBox}
          videos={videos}
        />
      </main>
    )
}
