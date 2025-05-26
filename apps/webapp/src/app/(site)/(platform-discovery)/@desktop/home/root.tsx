'use client'
import { getFeed } from '@lib/api/feed'
import { Feed } from '@/components/common/feed'
import { useMemo } from 'react'
import EmptyView from '@/components/common/empty-view'

export function Root() {
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = getFeed(1)
  const videos = useMemo(() => data?.pages.flatMap((item) => item.reels) ?? [], [data])

  if (!isLoading && videos.length === 0) return <EmptyView type="feed" />

  return (
    <>
      <Feed.desktop
        hasNextPage={hasNextPage ?? true}
        isLoading={isLoading}
        startIndex={0}
        videos={videos}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  )
}
