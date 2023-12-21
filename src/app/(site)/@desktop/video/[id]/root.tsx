'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import { Feed } from '@components/common/feed'
import { getAllLoopVideos, getPaginatedLoopVideos } from '@lib/api/profile'

type Props = {
  videoDetails: VideoDataType
}
// TODO: Fix comment component bug. scrolling issue.
export function Root({ videoDetails }: Props) {
  const sizeBox = useVideoSizeBox(true)
  const queryFnResult = getPaginatedLoopVideos('kavik')
  if (sizeBox)
    return (
      <div className="flex h-full w-full pl-6">
        <Feed.desktop sizeBox={sizeBox} queryFuncResult={queryFnResult} />
      </div>
    )
}
