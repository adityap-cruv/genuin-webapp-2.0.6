'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import dynamic from 'next/dynamic'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { getFeed } from '@lib/api/feed'
import { useLocalStorage } from '@lib/stores/local-storage'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile))

export function Root({ brandId }: { brandId?: string }) {
  const userId = useLocalStorage((state) => state.userId)
  const {
    data: videoPages,
    isError,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = getFeed({ feedType: 'home', userID: userId, brandId })
  const videos = videoPages?.pages.flatMap((item) => item.reels)
  const sizeBox = useVideoSizeBox()

  if (videos && sizeBox)
    return (
      <main className="h-full w-full">
        <TopBar variant="trasparent" />
        <span className="absolute inset-0">
          <Feed
            startIndex={0}
            fetchNextPage={fetchNextPage}
            sizeBox={sizeBox}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            videos={videos}
          />
        </span>
      </main>
    )
}
