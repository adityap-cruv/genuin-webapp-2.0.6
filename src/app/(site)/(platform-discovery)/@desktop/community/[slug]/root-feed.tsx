'use client'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
import { getCommunityVideos } from '@lib/api/community'
import dynamic from 'next/dynamic'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <FeedShimmer.desktop />
  },
})

type Props = {
  slug: string
}

export function RootFeed({ slug }: Props) {
  const { data, isError, fetchNextPage, isFetchingNextPage, isLoading } = getCommunityVideos(slug)
  const videos = data?.pages.flatMap((item) => item.videos)

  if (videos)
    return (
      <main className="h-full w-full">
        <Feed
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          videos={videos}
        />
      </main>
    )
}
