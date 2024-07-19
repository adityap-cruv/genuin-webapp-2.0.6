'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getFeed } from '@lib/api/feed'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

export function Root() {
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = getFeed(1)
  const videos = useMemo(() => data?.pages.flatMap((item) => item.reels) ?? [], [data])

  return (
    <Feed
      hasNextPage={hasNextPage ?? true}
      isLoading={isLoading}
      startIndex={0}
      videos={videos}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
