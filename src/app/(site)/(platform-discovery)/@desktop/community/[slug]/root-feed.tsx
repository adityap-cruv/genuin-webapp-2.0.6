'use client'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getCommunityVideos } from '@lib/api/community'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

type Props = {
  slug: string
}

export function RootFeed({ slug }: Props) {
  const { data, fetchNextPage, isFetchingNextPage, isLoading } = getCommunityVideos(slug)
  const videosRef = useRef<VideoPlayerModalType[]>([])
  videosRef.current = data?.pages.flatMap((item) => item.videos) ?? []

  if (isLoading) return <FeedShimmer.desktop />

  return (
    <main className="h-full w-full">
      <Feed isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} videosRef={videosRef} />
    </main>
  )
}
