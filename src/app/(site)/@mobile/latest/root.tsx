'use client'
import dynamic from 'next/dynamic'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { getFeed } from '@lib/api/feed'
import { useLocalStorage } from '@lib/stores/local-storage'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { useGenuinOptions } from '@lib/stores/genuin-options'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile), {
  loading(loadingProps) {
    return <FeedShimmer.mobile />
  },
})

export function Root() {
  const userId = useLocalStorage((state) => state.userId)
  const brandId = useGenuinOptions().brandId
  const {
    data: videoPages,
    isError,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = getFeed({ feedType: 'lattest', userID: userId, brandId })
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  if (videos)
    return (
      <main className="h-full w-full">
        <TopBar variant="trasparent" />
        <span className="absolute inset-0">
          <Feed
            fetchNextPage={fetchNextPage}
            startIndex={0}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            videos={videos}
          />
        </span>
      </main>
    )

  return <FeedShimmer.mobile />
}
