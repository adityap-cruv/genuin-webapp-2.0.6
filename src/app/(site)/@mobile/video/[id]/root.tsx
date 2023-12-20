'use client'
import { useVideoSizeBox } from '@hooks/use-video-size-box'
import { type VideoDataType } from '@lib/schemas/video'
import dynamic from 'next/dynamic'
import { TopBar } from '../../top-bar'
import { AnimatedInfinityView } from '@components/common/animated-infinity-view'
const Player = dynamic(async () => await import('@components/common/player').then((comp) => comp.Player.mobile))

export function Root({ videoData }: { videoData: VideoDataType }) {
  const sizeBox = useVideoSizeBox(false)
  if (videoData && sizeBox)
    return (
      <main className="relative h-full w-full">
        <span className="absolute top-0 w-full">
          <TopBar variant="trasparent" />
        </span>
        <span className="relative">
          <Player shouldPlay sizeBox={sizeBox} videoData={videoData} />
          <span className="absolute bottom-0 w-full">
            <AnimatedInfinityView
              community={{
                name: videoData.loop?.name ?? '',
                handle: videoData.loop?.share_string ?? '',
                profileImage: videoData.loop?.profile_image ?? '',
              }}
              loop={{ name: videoData.loop?.name ?? '', shareString: videoData.loop?.share_string ?? '' }}
            />
          </span>
        </span>
      </main>
    )
}
