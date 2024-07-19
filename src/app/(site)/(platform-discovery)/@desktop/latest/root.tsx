'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getFeed } from '@lib/api/feed'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'

const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

export function Root() {
  const { data, fetchNextPage, isFetchingNextPage, isLoading } = getFeed(2)
  const videosRef = useRef<VideoPlayerModalType[]>([])
  videosRef.current = data?.pages.flatMap((item) => item.reels) ?? []

  if (isLoading) return <FeedShimmer.desktop />

  return (
    <main className="h-full w-full">
      <Feed isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} videosRef={videosRef} />
    </main>
  )
}
