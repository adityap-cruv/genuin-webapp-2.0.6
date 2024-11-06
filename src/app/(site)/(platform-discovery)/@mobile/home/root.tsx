'use client'
import { getFeed } from '@lib/api/feed'
import { Feed } from '@/components/common/feed'
import dynamic from 'next/dynamic'
const TopBar = dynamic(async () => await import('@components/layouts/mobile/top-bar').then((comp) => comp.TopBar))

export function Root() {
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeed(1)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  return (
    <main className="h-full w-full">
      <TopBar variant="transparent" />
      <span className="absolute inset-0">
        <Feed.mobile
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
}
