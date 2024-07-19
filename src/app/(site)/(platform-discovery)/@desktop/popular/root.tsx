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
  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = getFeed(3)
  const videos = useMemo(() => data?.pages.flatMap((item) => item.reels) ?? [], [data])

  return (
    <Feed
      hasNextPage={hasNextPage ?? true}
      startIndex={0}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      videos={videos}
    />
  )
}
