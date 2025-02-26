import { usePlayerControlStore } from '../player-control-store'
import { Actions } from './actions'
import { PlayerProgressBar } from './player-progress-bar'
import { memo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'
import { cn } from '@/lib/utils'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { PauseIcon } from '@icons/player-controls/pause-icon'
import { AnimatedMuteIcon } from './animated-mute-icon'
import { ExpandIcon } from '@icons/player-controls/expand-icon'
import { CollapseIcon } from '@icons/player-controls/collapse-icon'

type DesktopProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
  videoSlug: string
  clickableUrl: string | null
  attachedLink?: string | null
  description?: string | null
  isSparked?: boolean | null | undefined
  isInModal?: boolean
  commentCount?: number
}

export const Desktop = memo(function Desktop({
  shareUrl,
  sparkCount,
  videoId,
  videoSlug,
  attachedLink,
  description,
  isSparked,
  isInModal,
  clickableUrl,
  commentCount,
}: DesktopProps) {
  const { setShouldPlay, shouldPlay, muted, toggleMuted, toggleButtonVisibility, toggleFullScreen, isFullScreen } =
    usePlayerControlStore(
      useShallow((state) => ({
        setShouldPlay: state.setShouldPlay,
        shouldPlay: state.shouldPlay,
        muted: state.muted,
        toggleMuted: state.toggleMuted,
        toggleButtonVisibility: state.toggleButtonVisibility,
        toggleFullScreen: state.toggleFullScreen,
        isFullScreen: state.isFullScreen,
      }))
    )

  const handleVideoClick = useCallback(
    (e: any) => {
      e.stopPropagation()

      // If the video is paused and muted, unmute and play it
      if (!shouldPlay && muted) {
        toggleMuted()
        setShouldPlay(true)
        toggleButtonVisibility('play')
        return
      }

      // Then, handle the mute/unmute behavior
      if (muted) {
        toggleMuted()
        toggleButtonVisibility('unmute')
      } else {
        setShouldPlay(!shouldPlay)
        toggleButtonVisibility(shouldPlay ? 'pause' : 'play')
      }
    },
    [muted, toggleMuted, shouldPlay, setShouldPlay]
  )

  const openClickableUrl = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (clickableUrl) window.open(clickableUrl, '_blank')
    },
    [clickableUrl]
  )

  return (
    <div className="relative z-30 h-full w-full">
      <div
        onClick={clickableUrl ? openClickableUrl : handleVideoClick}
        className={cn('absolute inset-0', clickableUrl && 'cursor-pointer')}>
        <div
          style={{
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)',
          }}
          className="absolute top-0 h-20 w-full"
        />
        <div
          className="relative left-4 top-4 flex justify-between gap-3"
          style={{
            width: 'calc(100% - 32px)',
          }}>
          <div className="flex w-full gap-3">
            <span
              onClick={(e) => {
                e.stopPropagation()
                setShouldPlay(!shouldPlay)
                toggleButtonVisibility(shouldPlay ? 'pause' : 'play')
              }}
              className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-monochrome-black/40">
              {!shouldPlay ? <PlayIcon variant="light" /> : <PauseIcon variant="light" />}
            </span>

            <AnimatedMuteIcon videoId={videoId} />
          </div>

          <span
            onClick={(e) => {
              e.stopPropagation()
              toggleFullScreen()
            }}
            className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-monochrome-black/40">
            {isFullScreen ? <CollapseIcon variant="light" /> : <ExpandIcon variant="light" />}
          </span>
        </div>
      </div>
      {isInModal && (
        <span className="absolute right-6 top-6 h-fit w-fit cursor-pointer">
          <WalletAmountBadge type="light" />
        </span>
      )}
      {!isFullScreen && (
        <div className="absolute bottom-0 right-0 pr-2">
          <Actions.desktop
            shareUrl={shareUrl}
            sparkCount={sparkCount}
            videoId={videoId}
            videoSlug={videoSlug}
            attachedLink={attachedLink}
            description={description}
            isSparked={isSparked}
            commentCount={commentCount}
          />
        </div>
      )}
      <PlayerProgressBar />
    </div>
  )
})
