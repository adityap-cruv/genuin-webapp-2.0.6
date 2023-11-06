'use client'
import dynamic from 'next/dynamic'
import { cn } from '@lib/utils'
import { Loader } from '@components/ui/loader'
import { VideoDataType } from '@lib/schemas/video'
import { useEffect, useState } from 'react'
import { usePlayerControlStore } from '@lib/stores/common/player-control-store'
const InnerPlayer = dynamic(() => import('./inner-player').then((comp) => comp.InnerPlayer), {
  loading: (_) => {
    return <Loader size="lg" />
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
  /**
   * If it is enabled video will play if only if video is in viewport.
   */
  playIfInViewPort?: boolean
  /**
   * Default is true, if you want to remove backgroundblur than make it false
   */
  shouldShowBackgroundBlurImage?: boolean
}

export default function Player({
  videoData,
  loop = true,
  shouldPlay = true,
  showControls = true,
  playIfInViewPort,
  shouldShowBackgroundBlurImage = true,
}: Props) {
  const { playerSizeBox, updateSizeBox } = usePlayerControlStore((state) => {
    const updatePlayerSizeBox = state.updatePlayerSizeBox
    if (!shouldPlay) {
      state.pause()
    }
    return {
      playerSizeBox: state.playerSizeBox,
      updateSizeBox: updatePlayerSizeBox,
    }
  })

  useEffect(() => {
    function resizeHandler() {
      updateSizeBox(window.innerHeight, (window.innerHeight * 9) / 16)
    }
    resizeHandler()
    window.addEventListener('resize', resizeHandler)
    return window.removeEventListener('resize', resizeHandler)
  }, [])

  if (playerSizeBox.height && videoData) {
    // const videoWidth = height * (9 / 16)
    return (
      <div
        className={cn('relative flex h-full w-full snap-start snap-always items-center justify-center')}
        style={{ height: playerSizeBox.height }}>
        {shouldShowBackgroundBlurImage && (
          <div
            className="absolute inset-0 z-[-1] h-full w-full bg-secondary bg-cover bg-center bg-no-repeat blur-2xl"
            style={{ backgroundImage: `url(${videoData.video.thumbnail})` }}
          />
        )}
        <div
          className="relative"
          style={{ height: playerSizeBox.height, width: playerSizeBox.width }}
          onClick={(e) => console.log('clicked in inner player.')}>
          <InnerPlayer
            videoSizeBox={{ height: playerSizeBox.height, width: playerSizeBox.width }}
            videoSource={videoData.video.url}
            poster={videoData.video.thumbnail}
            loop={loop}
            playIfInViewport={playIfInViewPort}
            onEnded={() => console.log('on Ended called..')}
            onPlay={() => console.log('on play called..')}
            onPlaying={() => console.log('on playing')}
            onCanPlay={() => console.log('can play')}
            onPause={() => console.log('on pause')}
            onError={(e) => {}}
          />
          <div className="absolute left-0 top-0 h-full w-full">
            {showControls && <ControlLayer videoData={videoData} />}
          </div>
        </div>
      </div>
    )
  }
}
