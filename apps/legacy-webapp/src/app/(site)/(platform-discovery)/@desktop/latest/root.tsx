'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getFeed } from '@lib/api/feed'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import EmptyView from '@/components/common/empty-view'

const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

export function Root() {
  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = getFeed(2)
  const videos = useMemo(() => data?.pages.flatMap((item: any) => item.reels) ?? [], [data])

  if (!isLoading && videos.length === 0) {
    return <EmptyView type="feed" />
  }

  return (
    <Feed
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      videos={videos}
      startIndex={0}
      hasNextPage={hasNextPage ?? true}
      isLoading={isLoading}
    />
  )
}
