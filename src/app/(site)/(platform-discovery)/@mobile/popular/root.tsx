'use client'
import dynamic from 'next/dynamic'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { getFeed } from '@lib/api/feed'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile), {
  loading(loadingProps) {
    return <FeedShimmer.mobile />
  },
})

export function Root() {
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeed(3)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  if (videos)
    return (
      <main className="h-full w-full">
        <TopBar variant="transparent" />
        <span className="absolute inset-0">
          <Feed
            startIndex={0}
            fetchNextPage={fetchNextPage}
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
