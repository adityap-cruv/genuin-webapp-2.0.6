'use client'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
import { type VideoDataType } from '@lib/schemas/video'
import { useState, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { usePlayerControlStore } from './player-control-store'
import { Comments } from './comments'

const InnerPlayer = dynamic(async () => await import('./inner-player').then((comp) => comp.InnerPlayer), {
  loading: (_) => {
    return <Loader size="lg" />
  },
})
const ViewportPlayer = dynamic(async () => await import('./inner-player').then((comp) => comp.ViewportPlayer), {
  loading: (_) => {
    return <Loader size="lg" />
  },
})
const ControlLayer = dynamic(async () => await import('./control-layer').then((comp) => comp.ControlLayer.default))
const CommunityControlLayer = dynamic(
  async () => await import('./control-layer').then((comp) => comp.ControlLayer.community)
)

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
   * Sizebox is mandatory. To get sizebox see hooke useVideoSizeBox.
   * Tip: Please don't render withour sizebox
   */
  sizeBox: { height: number; width: number }
  /**
   * If it is enabled video will play if only if video is in viewport.
   */
  playIfInViewPort?: boolean
  /**
   * Default is true, if you want to remove backgroundblur than make it false
   */
  shouldShowBackgroundBlurImage?: boolean
  /**
   * If you are playing reels in list and you want first video to play automatically and next
   * video will be playing once it is in viewport.
   * defaults to false.
   */
  isFirstPlayerInList?: boolean
  /**
   * This flag is only for community videos.
   * @default false
   */
  showCommunityControl?: boolean
  /**
   * Pass true if you want to show comments.
   */
  shouldShowComments?: boolean
}

// todo optimize this component.
export default function Player({
  videoData,
  shouldPlay = true,
  loop = false,
  showControls = true,
  sizeBox,
  playIfInViewPort,
  shouldShowBackgroundBlurImage = true,
  showCommunityControl = false,
  isFirstPlayerInList = false,
}: Props) {
  // todo fix this warning
  const [playerControls, setPlayerControls] = useState({ play: shouldPlay, muted: true, loop })
  const togglePlayPauseStatus = usePlayerControlStore((state) => state.toggleShouldPlay)
  const containerRef = useRef<HTMLDivElement | null>(null)

  if (videoData) {
    return (
      <div className="relative flex h-full w-full snap-start items-center justify-center overflow-clip">
        {shouldShowBackgroundBlurImage && (
          <div
            className="absolute inset-0 z-0 h-full w-full bg-secondary bg-cover bg-center bg-no-repeat blur-2xl"
            style={{ backgroundImage: `url(${videoData.video.thumbnail})` }}
          />
        )}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ width: sizeBox?.width, height: sizeBox?.height }}>
          {playIfInViewPort ? (
            <ViewportPlayer
              videoSource={videoData.video.url}
              poster={videoData.video.thumbnail}
              muted={playerControls.muted}
              loop={playerControls.loop}
              isFirstElement={isFirstPlayerInList}
              // onEnded={() => {
              //   console.log('on Ended called..')
              // }}
              // onPlay={() => {
              //   console.log('on play called..')
              // }}
              // onPlaying={() => {
              //   console.log('on playing')
              // }}
              // onCanPlay={() => {
              //   console.log('can play')
              // }}
              // onPause={() => {
              //   console.log('on pause')
              // }}
              // onError={(e) => {}}
            />
          ) : (
            <InnerPlayer
              videoSource={videoData.video.url}
              poster={videoData.video.thumbnail}
              muted={playerControls.muted}
              loop={playerControls.loop}
              // shouldPlay={playerControls.play}
              // onEnded={() => {
              //   console.log('on Ended called..')
              // }}
              // onPlay={() => {
              //   console.log('on play called..')
              // }}
              // onPlaying={() => {
              //   console.log('on playing')
              // }}
              // onCanPlay={() => {
              //   console.log('can play')
              // }}
              // onPause={() => {
              //   console.log('on pause')
              // }}
              // onError={(e) => {}}
            />
          )}
          <div
            onClick={
              // this action will only execute if end device is mobile
              isMobile
                ? (e) => {
                    togglePlayPauseStatus()
                    e.stopPropagation()
                  }
                : undefined
            }
            className="absolute left-0 top-0 h-full w-full">
            {showControls ? (
              showCommunityControl ? (
                <CommunityControlLayer videoData={videoData} />
              ) : (
                <ControlLayer videoData={videoData} />
              )
            ) : undefined}
          </div>
          <Comments container={containerRef} videoId={videoData.video.share_string} />
        </div>
      </div>
    )
  }
}
