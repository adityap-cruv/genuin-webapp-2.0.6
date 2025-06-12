'use client'
import dynamic from 'next/dynamic'
import { Feed } from '@components/common/feed'
import { getCommunityFeed } from '@/lib/api/community'
const TopBar = dynamic(async () => await import('@components/layouts/mobile/top-bar').then((comp) => comp.TopBar))

export function RootFeed({ slug }: { slug: string }) {
  const { data, isError, isLoading, fetchNextPage, isFetchingNextPage } = getCommunityFeed(slug)
  const videos = data?.pages.flatMap((item: any) => item.videos)
  return (
    <main className="relative h-full w-full">
      <TopBar variant="transparent" className="absolute" />
      <Feed.mobile
        videos={videos}
        isError={isError}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        startIndex={0}
      />
    </main>
  )
}
