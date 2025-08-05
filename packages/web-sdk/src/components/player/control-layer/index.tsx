import { useBaseContext } from '@/context/base'
import { useSizeContext } from '@/context/size'
import { FeedVideoType } from '@/type'
import { ComponentProps, memo, useCallback, useState } from 'react'
import { handleTapBehavior, PlayingState } from '../playing-state'
import { cn, isCheckFifthVideoType } from '@/utils'
import { useExpandViewContext } from '@/components/expand-view/context'
import { Actions } from '@/components/actions'
import { MobileDetails } from '../full-screen-mobile/mobile-details'
import { Loader } from '@/components/loader'
import { Controls } from './controls'
import { GestureOverlayKeysType } from '@/components/gestures/context'
import { Scrubber } from './scrubber'
import { usePlayerContext } from '../context'
import { PlaybackControls } from '@/components/playback'

type ControlLayerPropsType = ComponentProps<'div'> & {
  videoDetails: FeedVideoType
  onCloseExpandView?: () => void
  onSpark?: (videoId: string, isSparked: boolean) => void
  onCommentCountChange?: (videoId: string, count: number) => void
  index: number
  hideGestureOverlay?: (action: GestureOverlayKeysType, muted: boolean) => void
}

export const ControlLayer = memo(function ControlLayer({
  videoDetails,
  className,
  onCloseExpandView,
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
    isVideoPlaying,
    setIsVideoPlaying,
    playingState,
    playbackSpeed,
    customizations,
  } = useBaseContext()
  const { isFullScreen } = useExpandViewContext()
  const { showScrubber, showSeeker } = usePlayerContext()
  const { isMobile } = useSizeContext()
  const clickableUrl = videoDetails.video.clickable_url
  // const [isExpanded, setIsExpanded] = useState(false)
  const tapBehavior = brandDetails?.web_configs.tap_behavior ?? 3
  const [isCommentBoxOpen, setCommentBoxOpen] = useState(false)

  const handleVideoClick = useCallback(
    (e: any) => {
      try {
        e.stopPropagation()
        if (hideGestureOverlay) hideGestureOverlay('PLAY_PAUSE', muted)

        // if (isFullScreen) {
        //   // setIsExpanded(false)
        //   toggleFullScreen()
        //   return
        // }

        if (clickableUrl) {
          window.open(clickableUrl, '_blank')
          return
        }

        handleTapBehavior({
          tapBehavior,
          muted,
          shouldPlay: isVideoPlaying,
          toggleMuted: () => updateMuted(!muted),
          setShouldPlay: setIsVideoPlaying,
          handlePlayerAction,
        })
      } catch (error) {
        console.error('Error handling video click:', error)
      }
    },
    [
      muted,
      updateMuted,
      brandDetails?.web_configs.tap_behavior,
      isFullScreen,
      isVideoPlaying,
    ],
  )

  const hideOnMobileByGesture = isMobile && playbackSpeed.isSpeedFromGesture
  const hideOnMobileBySlider = isMobile && playbackSpeed.speed !== 1
  const baseShareUrl = videoDetails?.video.share_url
    ? videoDetails?.video.share_url.split('/video')
    : []
  const shareUrl =
    baseShareUrl.length === 2
      ? `${brandDetails?.brand_id === 2357 ? `${window.location.href}?video=${baseShareUrl[1].slice(1).replace('?', '&')}` : `${baseShareUrl[0]}?video=${baseShareUrl[1].slice(1).replace('?', '&')}`}`
      : videoDetails?.video.share_url || ''

  return (
    <>
      <Controls
        className={cn(
          'z-20',
          showScrubber || hideOnMobileByGesture ? 'hidden' : 'flex',
          {
            'top-4 p-0 px-4':
              isCheckFifthVideoType(brandDetails?.brand_id) &&
              customizations?.view === 'carousel' &&
              isMobile,
          },
        )}
        index={index}
        onCloseExpandView={onCloseExpandView}
      />
      <div
        onClick={handleVideoClick}
        className={cn(
          'absolute inset-0 z-10 h-full w-full transition-all',
          showSeeker && '-translate-y-4',
          showScrubber ? 'hidden' : 'block',
          className,
        )}
        {...restProps}>
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

        {(!isFullScreen || (isFullScreen && isMobile)) &&
          customizations?.is_enable_engagement_tools && (
            <Actions
              className={cn(
                'absolute right-0 z-40 sm:bottom-2 bottom-12 flex gap-2 flex-col mr-2',
                (hideOnMobileByGesture || hideOnMobileBySlider) && 'hidden',
              )}
              videoId={videoDetails.uuid}
              videoSlug={videoDetails.video.slug}
              shareUrl={shareUrl}
              videoShareUrl={videoDetails.video.share_url}
              noOfSparks={videoDetails.video.no_of_sparks}
              noOfComments={videoDetails.video.no_of_comments}
              isSparked={videoDetails.video.is_sparked}
              onSpark={onSpark}
              onCommentClick={() => {
                setCommentBoxOpen(!isCommentBoxOpen)
              }}
              showComment
            />
          )}

        {(isMobile || isFullScreen) && playbackSpeed.speed === 1 && (
          <MobileDetails
            index={index}
            className='z-30'
            videoData={videoDetails}
            onClick={handleVideoClick}
            viewType='STANDARD_WALL'
            onSpark={onSpark}
            isMobile={isMobile}
            onCommentCountChange={onCommentCountChange}
            isCommentBoxOpen={isCommentBoxOpen}
            setCommentBox={setCommentBoxOpen}
          />
        )}

        <PlaybackControls />
      </div>
      <Scrubber
        className={cn('absolute bottom-0 z-20', showSeeker && 'bottom-1')}
        spriteUrl={videoDetails.video.sprite_image_url ?? ''}
      />
      <div
        className={cn(
          'absolute bottom-0 z-[0] h-24 w-full bg-gradient-to-b from-[#11111100] to-[#111111b3]',
        )}
      />
    </>
  )
})
