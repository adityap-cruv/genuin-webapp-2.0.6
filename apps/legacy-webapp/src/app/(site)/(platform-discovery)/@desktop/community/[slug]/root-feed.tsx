'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
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
  const videos = useMemo(() => data?.pages.flatMap((item: any) => item.videos) ?? [], [data])

  return (
    <Feed
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      videos={videos}
      isLoading={isLoading}
      startIndex={0}
      hasNextPage={hasNextPage ?? true}
    />
  )
}
