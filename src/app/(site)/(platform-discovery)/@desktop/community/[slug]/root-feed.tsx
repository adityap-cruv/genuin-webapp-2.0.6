'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import dynamic from 'next/dynamic'
import { useMemo, useRef } from 'react'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { getCommunityFeed } from '@/lib/api/community'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

type Props = {
  slug: string
}

export function RootFeed({ slug }: Props) {
  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = getCommunityFeed(slug)
  const videoRef = useRef<VideoPlayerModalType[]>([])
  videoRef.current = useMemo(() => data?.pages.flatMap((item) => item.videos) ?? [], [data])

  return (
    <Feed
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      videosRef={videoRef}
      isLoading={isLoading}
      startIndex={0}
      hasNextPage={hasNextPage ?? true}
    />
  )
}
