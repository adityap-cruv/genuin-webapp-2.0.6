'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getFeed } from '@lib/api/feed'
import { useGenuinOptions } from '@lib/stores/genuin-options'
import { useLocalStorage } from '@lib/stores/local-storage'
import dynamic from 'next/dynamic'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

export function Root() {
  const userId = useLocalStorage((state) => state.userId)
  const brandId = useGenuinOptions().brandId
  const { data, isError, fetchNextPage, isFetchingNextPage, isLoading } = getFeed({
    feedType: 'home',
    userID: userId,
    brandId,
  })
  const videos = data?.pages.flatMap((item) => item.reels)

  if (videos)
    return (
      <main className="h-full w-full">
        <Feed
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          videos={videos}
        />
      </main>
    )
  return <FeedShimmer.desktop />
}
