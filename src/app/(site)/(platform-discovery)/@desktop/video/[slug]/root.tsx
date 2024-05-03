'use client'
import { Feed } from '@components/common/feed'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

type Props = {
  videoDetails: VideoPlayerModalType
}
// TODO: Fix comment component bug. scrolling issue.
export function Root({ videoDetails }: Props) {
  return (
    <div className="h-full w-full pl-6">
      <Feed.desktop
        hasNextPage={false}
        isError={false}
        isFetchingNextPage={false}
        isLoading={false}
        videos={[videoDetails]}
      />
    </div>
  )
}
