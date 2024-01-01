'use client'
import { Loader } from '@components/ui/loader'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { getCommunityVideos } from '@lib/api/community'
import dynamic from 'next/dynamic'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <Loader size="md" />
  },
})

interface Props {
  handle: string
}

export function RootFeed({ handle }: Props) {
  const videoSizeBox = useVideoSizeBox(true)
  const { data, isError, fetchNextPage, isFetchingNextPage, isLoading } = getCommunityVideos(handle)
  const videos = data?.pages.flatMap((item) => item.videos)

  if (videoSizeBox && videos)
    return (
      <main className="h-full w-full">
        <Feed
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          sizeBox={videoSizeBox}
          videos={videos}
        />
      </main>
    )
}
