'use client'
import { useResponsive } from '@hooks/useResponsive'
import dynamic from 'next/dynamic'
import { z } from 'zod'
import { VideoDataSchema } from '@lib/schemas/video'
import { cn } from '@lib/utils'
import { Loader } from '@components/ui/loader'
const InnerPlayer = dynamic(() => import('./inner-player').then((comp) => comp.InnerPlayer), {
  loading: (loadingProp) => {
    if (loadingProp.isLoading) return <Loader size="lg" />
    return null
  },
})
const ControlLayer = dynamic(() => import('./control-layer').then((comp) => comp.ControlLayer))

interface Props {
  videoData: z.infer<typeof VideoDataSchema> | null
}

export default function Player({ videoData = null }: Props) {
  const { height } = useResponsive()
  if (height && videoData) {
    const videoWidth = height * (9 / 16)
    return (
      <div className={cn('flex h-full w-full items-center justify-center')}>
        <div
          className="absolute inset-0 h-full w-full bg-secondary bg-cover bg-center bg-no-repeat blur-2xl"
          style={{ backgroundImage: `url(${videoData.video.thumbnail})` }}
        />
        <div
          style={{ height: height, width: videoWidth }}
          className="relative"
          onClick={(e) => console.log('clicked in inner player.')}>
          <InnerPlayer
            videoSizeBox={{ height, width: videoWidth }}
            videoSource={videoData.video.url}
            poster={videoData.video.thumbnail}
            autoPlay
            muted
          />
          <div className="absolute left-0 top-0 h-full w-full">
            <ControlLayer videoData={videoData} />
          </div>
        </div>
      </div>
    )
  }
}
