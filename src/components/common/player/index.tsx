'use client'
import { useResponsive } from '@hooks/useResponsive'
import { InnerPlayer } from './inner-player'
import { ControlLayer } from './control-layer'
import { z } from 'zod'
import { VideoDataSchema, validateVideoData } from './video-data-schema'

interface Props {
  videoData: z.infer<typeof VideoDataSchema> | null
}

export default function Player({ videoData = null }: Props) {
  const { height } = useResponsive()
  validateVideoData(videoData)

  if (height && videoData) {
    const videoWidth = height * (9 / 16)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div style={{ height: height, width: videoWidth }} className="relative">
          <InnerPlayer videoSizeBox={{ height, width: videoWidth }} videoSource={videoData.video.url} />
          <div className="absolute left-0 top-0 h-full w-full bg-blue-10/25">
            <ControlLayer videoData={videoData} />
          </div>
        </div>
      </div>
    )
  }
}
