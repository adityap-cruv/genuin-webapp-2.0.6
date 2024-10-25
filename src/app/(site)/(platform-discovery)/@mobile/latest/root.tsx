'use client'
import dynamic from 'next/dynamic'
import { getFeed } from '@lib/api/feed'
import { Feed } from '@/components/common/feed'
const TopBar = dynamic(async () => await import('@components/layouts/mobile/top-bar').then((comp) => comp.TopBar))

export function Root() {
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = getFeed(2)
  const videos = videoPages?.pages.flatMap((item) => item.reels)

  return (
    <main className="h-full w-full">
      <TopBar variant="transparent" />
      <span className="absolute inset-0">
        <Feed.mobile
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
}
