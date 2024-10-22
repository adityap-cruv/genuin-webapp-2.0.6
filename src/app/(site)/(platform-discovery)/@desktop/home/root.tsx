'use client'
import { getFeed } from '@lib/api/feed'
import { useMemo, useRef } from 'react'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { Feed } from '@/components/common/feed'

export function Root() {
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = getFeed(1)
  const videosRef = useRef<VideoPlayerModalType[]>([])
  videosRef.current = useMemo(() => data?.pages.flatMap((item) => item.reels) ?? [], [data])

  return (
    <Feed.desktop
      hasNextPage={hasNextPage ?? true}
      isLoading={isLoading}
      startIndex={0}
      videosRef={videosRef}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
