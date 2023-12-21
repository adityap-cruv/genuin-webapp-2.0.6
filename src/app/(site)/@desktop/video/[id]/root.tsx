'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import { Feed } from '@components/common/feed'
import { getPaginatedLoopVideos } from '@lib/api/profile'

type Props = {
  videoDetails: VideoDataType
}
// TODO: Fix comment component bug. scrolling issue.
export function Root({ videoDetails }: Props) {
  const sizeBox = useVideoSizeBox(true)
  const { data, hasNextPage, isError, isFetchingNextPage, isLoading } = getPaginatedLoopVideos('kavik')
  const videos = data?.pages.flatMap((item) => item.videos)

  if (sizeBox && videos)
    return (
      <div className="h-full w-full pl-6">
        <Feed.desktop
          sizeBox={sizeBox}
          hasNextPage={hasNextPage}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          videos={videos}
        />
      </div>
    )
}
