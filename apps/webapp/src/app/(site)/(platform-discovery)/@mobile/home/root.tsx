'use client'
import { useMemo } from 'react'
import { getFeed } from '@lib/api/feed'
import { Feed } from '@/components/common/feed'
import EmptyView from '@/components/common/empty-view'
import { TopBar } from '@components/layouts/mobile/top-bar'

export function Root() {
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeed(1)
  const videos = useMemo(() => videoPages?.pages.flatMap((item) => item.reels), [videoPages])
  console.log('videos', videos)
  if (!isLoading && videos?.length === 0) return <EmptyView type="feed" />

  return (
    <main className="h-full w-full">
      <TopBar variant="transparent" />
      <div className="absolute inset-0 h-full w-full">
        <Feed.mobile
          startIndex={0}
          fetchNextPage={fetchNextPage}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          videos={videos}
        />
      </div>
    </main>
  )
}
