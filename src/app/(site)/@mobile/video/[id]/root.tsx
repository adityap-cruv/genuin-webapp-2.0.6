'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { TopBar } from '../../top-bar'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.mobile))

export function Root({ videoData }: { videoData: VideoDataType }) {
  const sizeBox = useVideoSizeBox(false)
  if (videoData && sizeBox)
    return (
      <main className="relative h-full w-full">
        <span className="absolute top-0 w-full">
          <TopBar variant="trasparent" />
        </span>
        <Feed isError={false} isFetchingNextPage={false} isLoading={false} sizeBox={sizeBox} videos={[videoData]} />
      </main>
    )
}
