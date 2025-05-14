import { cn } from '@/lib/utils'
import React, { memo, useState, useCallback, type ComponentProps } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'

// Component imports
import { Controls } from './controls'
import { Actions } from './actions/new'
import { PlayingState, handleTapBehavior } from './playing-state'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'
import { Scrubber } from './scrubber'

// Hooks and store imports
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { usePlayerControlStore } from '../player-control-store'
import { useGestureOverlayManager } from '../../gestures/gesture-overlay-manager'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'
import { MobileDetails } from './mobile-details'
import { CommentSheet } from '../comment-sheet'
import { usePlayerContext } from '../context'
import { PlaybackControls } from '../../playback'

type ControlLayerPropsType = ComponentProps<'div'> & {
  videoDetails: VideoPlayerModalType
  isInModal?: boolean
  isActive: boolean
}

export const ControlLayer = memo(function ControlLayer({
  videoDetails,
  isInModal,
  className,
  ...restProps
}: ControlLayerPropsType) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { hideGestureOverlay } = useGestureOverlayManager()
  const { showScrubber, showSeeker } = usePlayerContext()

  // Store values with shallow comparison
  const { tapBehaviour, isMobile } = useGenuinOptions(
    useShallow((state) => ({
      tapBehaviour: state.config.web_configs?.tap_behavior,
      isMobile: state.isMobile,
    }))
  )

  const { setShouldPlay, shouldPlay, muted, toggleMuted, isFullScreen, playbackSpeed } = usePlayerControlStore(
    useShallow((state) => ({
      setShouldPlay: state.setShouldPlay,
      shouldPlay: state.shouldPlay,
      muted: state.muted,
      toggleMuted: state.toggleMuted,
      isFullScreen: state.isFullScreen,
      playbackSpeed: state.playbackSpeed,
    }))
  )

  // Event handlers
  const handleVideoClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      hideGestureOverlay('PLAY_PAUSE', muted)

      if (isExpanded) {
        setIsExpanded(false)
        return
      }

      if (videoDetails.video.clickableUrl) {
        window.open(videoDetails.video.clickableUrl, '_blank')
        return
      }

      handleTapBehavior({
        videoId: videoDetails.video.id,
        tapBehavior: tapBehaviour ?? 3,
        muted,
        shouldPlay,
        toggleMuted,
        setShouldPlay,
      })
    },
    [
      muted,
      toggleMuted,
      shouldPlay,
      setShouldPlay,
      tapBehaviour,
      isExpanded,
      hideGestureOverlay,
      videoDetails.video.clickableUrl,
      videoDetails.video.id,
    ]
  )

  const hideOnMobileByGesture = isMobile && playbackSpeed.isSpeedFromGesture
  const hideOnMobileBySlider = isMobile && playbackSpeed.speed !== 1

  return (
    <>
      <Controls
        videoId={videoDetails.video.id}
        className={cn('z-20', showScrubber || hideOnMobileByGesture ? 'hidden' : 'flex')}
      />
      <div
        onClick={handleVideoClick}
        className={cn(
          'absolute inset-0 z-10 h-full w-full transition-all',
          isExpanded && 'bg-gradient-to-b from-[#11111100] to-[#111111]',
          showSeeker && '-translate-y-4',
          showScrubber ? 'hidden' : 'block',
          className
        )}
        {...restProps}>
        {isInModal && (
          <div
            className={cn(
              'absolute right-2 top-20 h-fit w-fit cursor-pointer md:right-6 md:top-6',
              hideOnMobileByGesture && 'hidden'
            )}>
            <WalletAmountBadge type="light" />
          </div>
        )}

        {(!isFullScreen || (isFullScreen && isMobile)) && (
          <Actions
            className={cn(
              'absolute bottom-10 right-2 z-40 sm:bottom-2',
              (hideOnMobileByGesture || hideOnMobileBySlider) && 'hidden'
            )}
            shareUrl={videoDetails.video.shareUrl}
            sparkCount={videoDetails.video.sparkCount}
            videoId={videoDetails.video.id}
            videoSlug={videoDetails.video.slug}
            attachedLink={videoDetails.video.attachedLink}
            commentCount={videoDetails.video.commentCount}
            description={videoDetails.video.descriptionArr as any}
            isSparked={videoDetails.video.isSparked}
          />
        )}

        {(isMobile || isFullScreen) && playbackSpeed.speed === 1 && (
          <MobileComponents videoDetails={videoDetails} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        )}

        <PlaybackControls />
        <PlayingState />
      </div>

      {/* PlayerProgressBar is outside the main div to keep it visible when showSeeker is true */}
      <Scrubber
        spriteUrl={videoDetails.video.spriteUrl ?? ''}
        className={cn('absolute bottom-0 z-10 transition-all', showSeeker && 'bottom-4')}
      />

      <div className={cn('absolute bottom-0 z-[0] h-24 w-full bg-gradient-to-b from-[#11111100] to-[#111111b3]')} />
    </>
  )
})

type MobileComponentsProps = {
  videoDetails: VideoPlayerModalType
  isExpanded?: boolean
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>
  showSeeker?: boolean
}

function MobileComponents({ videoDetails, isExpanded, showSeeker, setIsExpanded }: MobileComponentsProps) {
  const { renderIn, shouldShowIHeartDemo, isIHeartPlaying } = useIHeartDemoStates()
  const { muted } = usePlayerControlStore(
    useShallow((state) => ({
      muted: state.muted,
    }))
  )
  const showIHeartDemo = renderIn === 'root' && shouldShowIHeartDemo

  return (
    <>
      <MobileDetails videoDetails={videoDetails} isActive isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <CommentSheet videoDetails={videoDetails} />
      {!isIHeartPlaying && showIHeartDemo && !muted && (
        <img
          src="https://media.begenuin.com/iheart_demo/equalizer.gif"
          alt="gif"
          className="absolute right-4 top-20 z-10 h-12 w-12"
        />
      )}
    </>
  )
}
