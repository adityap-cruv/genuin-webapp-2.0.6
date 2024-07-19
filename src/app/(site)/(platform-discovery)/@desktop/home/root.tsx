'use client'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getFeed } from '@lib/api/feed'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

export function Root() {
  const { data, fetchNextPage, isLoading, isFetchingNextPage } = getFeed(1)
  const videosRef = useRef<VideoPlayerModalType[]>([])
  videosRef.current = data?.pages.flatMap((item) => item.reels) ?? []

  if (!data || isLoading) return <FeedShimmer.desktop />
  return (
    <main className="h-full w-full">
      <Feed videosRef={videosRef} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} />
    </main>
  )
}
