import { FeedVideoType, SizeBoxType } from '@/type'
import { BasePlayer } from './base'
import { cn, resolveVideoUrl } from '@/utils'
import { useBaseContext } from '@/context/base'
import { useExpandViewContext } from '@/components/expand-view/context'
import { ControlLayer } from './control-layer'
import { PlayerProvider } from './context'

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
  const { muted, isVideoPlaying, brandDetails } = useBaseContext()
  const { isFullScreen } = useExpandViewContext()

  return (
    <div
      className={cn('relative shrink-0', { 'aspect-reel': isFullScreen })}
      style={{
        height: isFullScreen ? '100%' : videoSizeBox.height,
        width: isFullScreen ? undefined : videoSizeBox.width,
      }}>
      <PlayerProvider>
        <BasePlayer
          id={id}
          shouldPlay={shouldPlay && isVideoPlaying}
          muted={muted}
          src={resolveVideoUrl(
            brandDetails?.brand_id,
            videoDetails.video.media_url_m3u8,
            videoDetails.video.media_url,
          )}
          style={{ cursor: 'pointer' }}
          poster={videoDetails.video.thumbnail_url}
          triggerAnalytics
          index={index}
        />
        <ControlLayer
          videoDetails={videoDetails}
          onSpark={onSpark}
          onCommentCountChange={onCommentCountChange}
          index={index}
        />
      </PlayerProvider>
    </div>
  )
}
