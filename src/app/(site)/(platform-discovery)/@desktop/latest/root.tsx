'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getFeed } from '@lib/api/feed'
import dynamic from 'next/dynamic'
import { useMemo, useRef } from 'react'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import EmptyView from '@/components/common/empty-view'

const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

export function Root() {
  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = getFeed(2)
  const videosRef = useRef<VideoPlayerModalType[]>([])
  videosRef.current = useMemo(() => data?.pages.flatMap((item) => item.reels) ?? [], [data])

  if (!isLoading && videosRef.current.length === 0) {
    return <EmptyView type="feed" />
  } else {
    return (
      <Feed
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        videosRef={videosRef}
        startIndex={0}
        hasNextPage={hasNextPage ?? true}
        isLoading={isLoading}
      />
    )
  }
}
