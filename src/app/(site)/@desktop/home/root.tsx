'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getFeed } from '@lib/api/feed'
import dynamic from 'next/dynamic'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

export function Root() {
  const { data, isError, fetchNextPage, isFetchingNextPage, isLoading } = getFeed(1)
  const videos = data?.pages.flatMap((item) => item.reels)
  if (!videos) return <FeedShimmer.desktop />

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
}
