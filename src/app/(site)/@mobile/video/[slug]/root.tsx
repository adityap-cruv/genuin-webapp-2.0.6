'use client'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { TopBar } from '@components/layouts/mobile/top-bar'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile))

export function Root({ videoData }: { videoData: VideoDataType }) {
  if (videoData)
    return (
      <main className="relative h-full w-full">
        <span className="absolute top-0 w-full">
          <TopBar variant="trasparent" />
        </span>
        <Feed startIndex={0} isError={false} isFetchingNextPage={false} isLoading={false} videos={[videoData]} />
      </main>
    )
}
