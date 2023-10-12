'use client'
import { useResponsive } from '@hooks/useResponsive'
import dynamic from 'next/dynamic'
import { cn } from '@lib/utils'
import { Loader } from '@components/ui/loader'
import { VideoDataType } from '@lib/schemas/video'
import { useEffect, useState } from 'react'
const InnerPlayer = dynamic(() => import('./inner-player').then((comp) => comp.InnerPlayer), {
  loading: (loadingProp) => {
    if (loadingProp.isLoading) return <Loader size="lg" />
    return null
  },
})
const ControlLayer = dynamic(() => import('./control-layer').then((comp) => comp.ControlLayer))

interface Props {
  videoData?: VideoDataType
  /**
   * This field is very mandatory if you want play to stop after rendering
   * then pass false value. Otherwise it will start playing video automatically.
   */
  shouldPlay: boolean
  /**
   * Controls whether video should repeat or not.
   * default: false
   */
  loop?: boolean
  /**
   * default: true
   */
  showControls?: boolean
  /**
   * Uses height and width of sizeBox if passed else it uses
   * size of window.
   */
  sizeBox?: { height: number; width: number }
}

export default function Player({ videoData, shouldPlay = true, loop = false, showControls = true, sizeBox }: Props) {
  const [playerControls, setPlayerControls] = useState({ play: shouldPlay, muted: true, loop })
  let height = 0
  if (sizeBox) {
    height = sizeBox.height
  } else {
    height = useResponsive().height || 0
  }

  useEffect(() => {
    if (playerControls.play !== shouldPlay) {
      setPlayerControls((x) => {
        x.play = shouldPlay
        return { ...x }
      })
    }
  }, [shouldPlay])

  if (height && videoData) {
    const videoWidth = height * (9 / 16)
    return (
      <div
        className={cn('relative flex h-full w-full snap-start snap-always items-center justify-center')}
        style={{ height }}>
        <div
          className="absolute inset-0 z-[-1] h-full w-full bg-secondary bg-cover bg-center bg-no-repeat blur-2xl"
          style={{ backgroundImage: `url(${videoData.video.thumbnail})` }}
        />
        <div style={{ height: height, width: videoWidth }} onClick={(e) => console.log('clicked in inner player.')}>
          <InnerPlayer
            videoSizeBox={{ height, width: videoWidth }}
            videoSource={videoData.video.url}
            poster={videoData.video.thumbnail}
            muted={playerControls.muted}
            loop={playerControls.loop}
            shouldPlay={playerControls.play}
            onEnded={() => console.log('on Ended called..')}
            onPlay={() => console.log('on play called..')}
            onPlaying={() => console.log('on playing')}
            onCanPlay={() => console.log('can play')}
            onPause={() => console.log('on pause')}
            onError={(e) => console.log('on error', e)}
          />
          <div className="absolute left-0 top-0 h-full w-full">
            {showControls && <ControlLayer videoData={videoData} />}
          </div>
        </div>
      </div>
    )
  }
}
