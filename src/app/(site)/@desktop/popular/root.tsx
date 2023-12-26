'use client'
import { Loader } from '@components/ui/loader'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { getFeed } from '@lib/api/feed'
import { useLocalStorage } from '@lib/stores/local-storage'
import dynamic from 'next/dynamic'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <Loader size="md" />
  },
})

export function Root({ brandId }: { brandId?: string }) {
  const videoSizeBox = useVideoSizeBox(true)
  const userId = useLocalStorage((state) => state.userId)
  const { data, isError, fetchNextPage, isFetchingNextPage, isLoading } = getFeed({
    feedType: 'popular',
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
