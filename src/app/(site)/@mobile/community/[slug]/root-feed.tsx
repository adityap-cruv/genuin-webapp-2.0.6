'use client'
import dynamic from 'next/dynamic'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { getCommunityVideos } from '@lib/api/community'
import { FeedShimmer } from '@components/common/shimmers/feed-shimmer'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile), {
  loading(loadingProps) {
    return <FeedShimmer.mobile />
  },
})

export function RootFeed({ slug }: { slug: string }) {
  const { data, isError, isLoading, fetchNextPage, isFetchingNextPage } = getCommunityVideos(slug)
  const videos = data?.pages.flatMap((item) => item.videos)
  if (videos)
    return (
      <main className="relative h-full w-full">
        <span className="absolute inset-0">
          <TopBar variant="trasparent" />
        </span>
        <Feed
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
