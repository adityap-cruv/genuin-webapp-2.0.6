'use client'
import { FeedSkeleton } from '@genuin/components/templates/feed'
import dynamic from 'next/dynamic'

const Feed = dynamic(async () => await import('@genuin/components/templates/feed').then((comp) => comp.Feed), {
  loading(_) {
    return <FeedSkeleton />
  },
})

export function Root() {
  // const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = getFeed(2)
  // const videos = useMemo(() => data?.pages.flatMap((item: any) => item.reels) ?? [], [data])

  // if (!isLoading && videos.length === 0) {
  //   return <EmptyView type="feed" />
  // }

  return <Feed feedType="LATEST" />
}
