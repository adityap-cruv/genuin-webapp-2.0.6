'use client'
import { type VideoDataType } from '@lib/schemas/video'
import { Feed } from '@components/common/feed'

type Props = {
  videoDetails: VideoDataType
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
