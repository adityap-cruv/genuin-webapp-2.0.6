'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { getPaginatedLoopVideos } from '@lib/api/profile'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { TopBar } from '../top-bar'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile))

export function Root() {
  const { data: videoPages, isError, isLoading, isFetchingNextPage, hasNextPage } = getPaginatedLoopVideos('kavik')
  const videos = videoPages?.pages.flatMap((item) => item.videos as VideoDataType[])
  const sizeBox = useVideoSizeBox()

  if (videos && sizeBox)
    return (
      <main className="h-full w-full">
        <TopBar variant="trasparent" />
        <span className="absolute inset-0">
          <Feed
            sizeBox={sizeBox}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            videos={videos}
          />
        </span>
      </main>
    )
}
