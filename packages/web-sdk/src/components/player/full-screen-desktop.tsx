import { FeedVideoType, SizeBoxType } from '@/type'
import { BasePlayer } from './base'
import { cn } from '@/utils'
import { useBaseContext } from '@/context/base'
import { useExpandViewContext } from '@/context/expand-view'
import { ControlLayer } from './control-layer'

type FullScreenPlayerPropsType = {
  videoSizeBox: SizeBoxType
  videoDetails: FeedVideoType
  shouldPlay: boolean
  id: string
  index: number
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
}

export function DesktopModalPlayer({
  videoSizeBox,
  videoDetails,
  shouldPlay,
  id,
  onSpark,
  index,
  onCommentCountChange,
}: FullScreenPlayerPropsType) {
  const { muted, setIsVideoPlaying, isVideoPlaying } = useBaseContext()
  const { isFullScreen } = useExpandViewContext()

  return (
    <div
      className={cn('relative shrink-0', { 'aspect-reel': isFullScreen })}
      style={{
        height: isFullScreen ? '100%' : videoSizeBox.height,
        width: isFullScreen ? undefined : videoSizeBox.width,
      }}>
      <BasePlayer
        id={id}
        shouldPlay={shouldPlay && isVideoPlaying}
        muted={muted}
        src={
          videoDetails.video.media_url_m3u8
            ? videoDetails.video.media_url_m3u8
            : videoDetails.video.media_url
        }
        style={{ cursor: 'pointer' }}
        poster={videoDetails.video.thumbnail_url}
        triggerAnalytics
        index={index}
      />
      <ControlLayer
        videoDetails={videoDetails}
        isVideoPlaying={isVideoPlaying}
        setIsVideoPlaying={setIsVideoPlaying}
        onSpark={onSpark}
        onCommentCountChange={onCommentCountChange}
        index={index}
      />
    </div>
  )
}
