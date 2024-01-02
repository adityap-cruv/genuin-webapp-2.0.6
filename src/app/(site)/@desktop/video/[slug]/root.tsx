'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import { Feed } from '@components/common/feed'

type Props = {
  videoDetails: VideoDataType
}
// TODO: Fix comment component bug. scrolling issue.
export function Root({ videoDetails }: Props) {
  const sizeBox = useVideoSizeBox(true)
  if (sizeBox)
    return (
      <div className="h-full w-full pl-6">
        <Feed.desktop
          sizeBox={sizeBox}
          hasNextPage={false}
          isError={false}
          isFetchingNextPage={false}
          isLoading={false}
          videos={[videoDetails]}
        />
      </div>
    )
}
