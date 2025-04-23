'use client'
import { TopBar } from '@components/layouts/mobile/top-bar'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { Feed } from '@components/common/feed'

export function Root({ videoData }: { videoData: VideoPlayerModalType }) {
  return (
    <main className="relative h-full w-full">
      <span className="absolute top-0 w-full">
        <TopBar variant="transparent" />
      </span>
      <Feed.mobile startIndex={0} isError={false} isFetchingNextPage={false} isLoading={false} videos={[videoData]} />
    </main>
  )
}
