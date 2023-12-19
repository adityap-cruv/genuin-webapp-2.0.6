'use client'
import dynamic from 'next/dynamic'
import { Loader } from '@components/ui/loader'
import { type VideoDataType } from '@lib/schemas/video'
import { useState, useRef } from 'react'
import { usePlayerControlStore } from './player-control-store'

const CommentSheet = dynamic(async () => await import('./comments').then((comp) => comp.CommentSheet))
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
const MobileControlLayer = dynamic(async () => await import('./control-layer').then((comp) => comp.ControlLayer.mobile))
const DesktopControlLayer = dynamic(
  async () => await import('./control-layer').then((comp) => comp.ControlLayer.desktop)
)

export const Player = {
  mobile: Mobile,
  desktop: Desktop,
}

type Props = {
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
}

function Mobile({
  videoData,
  shouldPlay = true,
  loop = false,
  showControls = true,
  sizeBox,
  playIfInViewPort,
  shouldShowBackgroundBlurImage = true,
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
            />
          ) : (
            <InnerPlayer
              videoSource={videoData.video.url}
              poster={videoData.video.thumbnail}
              muted={playerControls.muted}
              loop={playerControls.loop}
            />
          )}
          <div className="absolute left-0 top-0 h-full w-full">
            <MobileControlLayer videoData={videoData} />
          </div>
          {/* <div
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
          </div> */}
          <CommentSheet container={containerRef} videoId={videoData.video.share_string} />
        </div>
      </div>
    )
  }
}

function Desktop({
  videoData,
  shouldPlay = true,
  loop = false,
  showControls = true,
  sizeBox,
  playIfInViewPort,
  shouldShowBackgroundBlurImage = true,
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
            />
          ) : (
            <InnerPlayer
              videoSource={videoData.video.url}
              poster={videoData.video.thumbnail}
              muted={playerControls.muted}
              loop={playerControls.loop}
            />
          )}
          <div className="absolute left-0 top-0 h-full w-full">
            <DesktopControlLayer videoData={videoData} />
          </div>
          {/* <div
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
          </div> */}
        </div>
      </div>
    )
  }
}
