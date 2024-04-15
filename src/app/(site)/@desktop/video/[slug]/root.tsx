'use client'
import { Feed } from '@components/common/feed'
import { getLoopVideos } from '@lib/api/loop'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'

type Props = {
  fromVideoId: string
  loopId: string
}
// TODO: Fix comment component bug. scrolling issue.
export function Root({ fromVideoId, loopId }: Props) {
  getLoopVideos({})
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
