'use client'
import dynamic from 'next/dynamic'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { Loader } from '@components/ui/loader'
import { getCommunityVideos } from '@lib/api/community'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile), {
  loading(loadingProps) {
    return <Loader size="md" />
  },
})

export function RootFeed({ slug }: { slug: string }) {
  const { data, isFetching, isError, isLoading, fetchNextPage, isFetchingNextPage } = getCommunityVideos(slug)
  const videoSizeBox = useVideoSizeBox(false)
  const videos = data?.pages.flatMap((item) => item.videos)
  if (videos && videoSizeBox)
    return (
      <main className="relative h-full w-full">
        <span className="absolute inset-0">
          <TopBar variant="trasparent" />
        </span>
        <Feed
          videos={videos}
          sizeBox={videoSizeBox}
          isError={isError}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </main>
    )
}
