'use client'
import { Loader } from '@components/ui/loader'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import dynamic from 'next/dynamic'
const Feed = dynamic(async () => await import('@components/common/feed').then((comp) => comp.Feed.desktop), {
  loading(_) {
    return <Loader size="md" />
  },
})

export function Root() {
  const videoSizeBox = useVideoSizeBox(true)
  if (videoSizeBox)
    return (
      <main className="h-full w-full">
        <Feed sizeBox={videoSizeBox} videoDetailsList={[]} />
      </main>
    )
}
