import { cn } from '@/lib/utils'
import React, { memo, useState, type ComponentProps } from 'react'
import { Actions } from './actions/new'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { Controls } from './controls'
import { PlayingState, handleTapBehavior } from './playing-state'
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { usePlayerControlStore } from '../player-control-store'
import { PlayerProgressBar } from './player-progress-bar'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'
import { MobileDetails } from './mobile-details'
import { CommentSheet } from '../comment-sheet'
import { useIHeartDemoStates } from '@/components/providers/iheart-demo-provider'

type ControlLayerPropsType = ComponentProps<'div'> & { videoDetails: VideoPlayerModalType; isInModal?: boolean }

export const ControlLayer = memo(function ControlLayer({
  videoDetails,
  isInModal,
  className,
  ...restProps
}: ControlLayerPropsType) {
  const { tapBehaviour, isMobile } = useGenuinOptions(
    useShallow((state) => ({ tapBehaviour: state.config.web_configs?.tap_behavior, isMobile: state.isMobile }))
  )
  const clickableUrl = videoDetails.video.clickableUrl
  const [isExpanded, setIsExpanded] = useState(false)

  const { setShouldPlay, shouldPlay, muted, toggleMuted, isFullScreen } = usePlayerControlStore(
    useShallow((state) => ({
      setShouldPlay: state.setShouldPlay,
      shouldPlay: state.shouldPlay,
      muted: state.muted,
      toggleMuted: state.toggleMuted,
      toggleFullScreen: state.toggleFullScreen,
      isFullScreen: state.isFullScreen,
    }))
  )

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
        videoId: videoDetails.video.id,
        tapBehavior: tapBehaviour ?? 3,
        muted,
        shouldPlay,
        toggleMuted,
        setShouldPlay,
      })
    },
    [muted, toggleMuted, shouldPlay, setShouldPlay, tapBehaviour, isExpanded]
  )

  return (
    <div
      onClick={handleVideoClick}
      className={cn(
        'absolute inset-0 h-full w-full',
        isExpanded && 'bg-gradient-to-b from-[#11111100] to-[#111111] transition-all',
        className
      )}
      {...restProps}>
      <Controls videoId={videoDetails.video.id} />
      {isInModal && (
        <div className="absolute right-2 top-20 h-fit w-fit  cursor-pointer md:right-6 md:top-6">
          <WalletAmountBadge type="light" />
        </div>
      )}
      {/** kept it for reference only. need to remove it. */}
      {/* <div className="absolute  z-20 h-fit w-fit cursor-pointer">
        <WalletAmountBadge type="light" />
      </div> */}
      <PlayingState />
      {!isFullScreen && (
        <Actions
          className="absolute bottom-2 right-2 z-10"
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
      {isMobile && (
        <MobileComponents videoDetails={videoDetails} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      )}
      <PlayerProgressBar />
    </div>
  )
})

type MobileComponentsProps = {
  videoDetails: VideoPlayerModalType
  isExpanded?: boolean
  setIsExpanded?: React.Dispatch<React.SetStateAction<boolean>>
}

function MobileComponents({ videoDetails, isExpanded, setIsExpanded }: MobileComponentsProps) {
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
