import { FeedVideoType } from '@/type'
import { BasePlayer } from '@/components/player/base'
import { useCallback } from 'react'
import { useBaseContext } from '@/context/base'
import { useGestureOverlayManager } from '../gestures/gesture-overlay-manager'
import { ControlLayer } from '../player/control-layer'

type StandardWallPlayerPropsType = {
  videoDetails: FeedVideoType
  id: string
  index: number
  shouldPlay: boolean
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
}

export function StandardWallPlayer({
  videoDetails,
  id,
  shouldPlay,
  index,
  onSpark,
  onCommentCountChange,
}: StandardWallPlayerPropsType) {
  const { muted, setIsVideoPlaying, isVideoPlaying } = useBaseContext()
  const { showGestureOverlay, hideGestureOverlay, gestureOverlayUI } =
    useGestureOverlayManager()

  const handleTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget
      if (video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100
        if (index === 1 && progress >= 50 && !muted) {
          showGestureOverlay('PLAY_PAUSE')
        }
      }
    },
    [index, muted, showGestureOverlay],
  )

  return (
    <div className='relative h-full w-full shrink-0'>
      <BasePlayer
        id={id}
        shouldPlay={isVideoPlaying && shouldPlay}
        muted={muted}
        src={
          videoDetails.video.media_url_m3u8
            ? videoDetails.video.media_url_m3u8
            : videoDetails.video.media_url
        }
        className='cursor-pointer'
        poster={videoDetails.video.thumbnail_url}
        triggerAnalytics
        index={index}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          showGestureOverlay('SWIPE')
        }}
      />
      <ControlLayer
        videoDetails={videoDetails}
        isVideoPlaying={isVideoPlaying}
        setIsVideoPlaying={setIsVideoPlaying}
        onSpark={onSpark}
        onCommentCountChange={onCommentCountChange}
        index={index}
        hideGestureOverlay={hideGestureOverlay}
      />
      {gestureOverlayUI}
    </div>
  )
}
