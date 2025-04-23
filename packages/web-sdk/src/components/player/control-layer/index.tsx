import { useBaseContext } from '@/context/base'
import { useSizeContext } from '@/context/size'
import { FeedVideoType } from '@/type'
import { ComponentProps, memo, useCallback, useState } from 'react'
import { handleTapBehavior, PlayingState } from '../playing-state'
import { cn } from '@/utils'
import { useExpandViewContext } from '@/context/expand-view'
import { Actions } from '@/components/actions'
import { MobileDetails } from '../full-screen-mobile/mobile-details'
import FullScreenEsc from '@/components/expand-view/full-screen-esc'
import { Loader } from '@/components/loader'
import { Controls } from './controls'
import { GestureOverlayKeysType } from '@/components/gestures/context'

type ControlLayerPropsType = ComponentProps<'div'> & {
  videoDetails: FeedVideoType
  isVideoPlaying: boolean
  setIsVideoPlaying: (value: boolean) => void
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
  index: number
  hideGestureOverlay?: (action: GestureOverlayKeysType) => void
}

export const ControlLayer = memo(function ControlLayer({
  videoDetails,
  className,
  setIsVideoPlaying,
  isVideoPlaying,
  onSpark,
  onCommentCountChange,
  index,
  hideGestureOverlay,
  ...restProps
}: ControlLayerPropsType) {
  const {
    brandDetails,
    handlePlayerAction,
    updateMuted,
    muted,
    buttonAction,
    playingState,
  } = useBaseContext()
  const { isFullScreen, toggleFullScreen } = useExpandViewContext()
  const { isMobile } = useSizeContext()
  const clickableUrl = videoDetails.video.clickable_url
  const [isExpanded, setIsExpanded] = useState(false)

  const handleVideoClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (isExpanded) {
        setIsExpanded(false)
        return
      }

      if (clickableUrl) {
        window.open(clickableUrl, '_blank')
        return
      }

      handleTapBehavior({
        tapBehavior: brandDetails?.web_configs.tap_behavior ?? 3,
        muted,
        shouldPlay: isVideoPlaying,
        toggleMuted: () => updateMuted(!muted),
        setShouldPlay: setIsVideoPlaying,
        handlePlayerAction,
        hideGestureOverlay,
      })
    },
    [muted, updateMuted, brandDetails?.web_configs.tap_behavior, isExpanded],
  )

  return (
    <div
      onClick={handleVideoClick}
      className={cn(
        'absolute inset-0 h-full w-full',
        isExpanded &&
          'bg-gradient-to-b from-[#11111100] to-[#111111] transition-all',
        className,
      )}
      {...restProps}>
      <Controls className={`${isMobile && 'top-16'}`} />

      {playingState === 'loading' && (
        <div
          className={cn(
            'flex items-center h-16 w-16 justify-center absolute top-1/2 left-1/2 bg-black/40 p-2 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-100 cursor-pointer align-middle backdrop-blur-sm transition-all duration-1000',
          )}>
          <Loader className='fill-primary' />
        </div>
      )}

      {buttonAction && playingState !== 'loading' && (
        <PlayingState
          buttonAction={buttonAction}
          onClick={handleVideoClick}
        />
      )}

      {!isMobile && !isFullScreen && (
        <Actions
          className='absolute right-0 bottom-2 flex gap-2 flex-col mr-2'
          videoId={videoDetails.uuid}
          shareUrl={videoDetails.video.share_url}
          noOfSparks={videoDetails.video.no_of_sparks}
          isSparked={videoDetails.video.is_sparked}
          onSpark={onSpark}
        />
      )}

      {(isMobile || isFullScreen) && (
        <MobileDetails
          index={index}
          videoData={videoDetails}
          onClick={handleVideoClick}
          viewType='STANDARD_WALL'
          onSpark={onSpark}
          onCommentCountChange={onCommentCountChange}
        />
      )}

      {isFullScreen && (
        <FullScreenEsc
          isFullScreen
          toggleFullScreen={toggleFullScreen}
          videoId={videoDetails.video.uuid}
        />
      )}
    </div>
  )
})
