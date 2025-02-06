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
}: DesktopProps) {
  const { setShouldPlay, shouldPlay, showMutedLayer, muted, toggleMutedLayer, toggleMuted } = usePlayerControlStore(
    useShallow((state) => ({
      setShouldPlay: state.setShouldPlay,
      shouldPlay: state.shouldPlay,
      muted: state.muted,
      toggleMuted: state.toggleMuted,
      showMutedLayer: state.showMutedLayer,
      toggleMutedLayer: state.toggleMutedLayer,
    }))
  )

  const handleVideoClick = useCallback(
    (e: any) => {
      e.stopPropagation()

      // If the video is paused and muted, unmute and play it
      if (!shouldPlay && muted) {
        toggleMuted()
        setShouldPlay(true)
        return
      }

      // Then, handle the mute/unmute behavior
      if (muted) {
        toggleMuted()
      } else {
        setShouldPlay(!shouldPlay)
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
    <div className="relative h-full w-full">
      <div
        onClick={clickableUrl ? openClickableUrl : handleVideoClick}
        className={cn('absolute inset-0', clickableUrl && 'cursor-pointer')}>
        {muted && showMutedLayer && (
          <div
            className="absolute h-full w-full"
            onClick={(e) => {
              e.stopPropagation()
              toggleMutedLayer()
              toggleMuted()
            }}
          />
        )}
        <div
          style={{
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)',
          }}
          className="absolute top-0 h-20 w-full"
        />
        <div
          className="relative left-4 top-4 flex gap-3"
          style={{
            width: 'calc(100% - 32px)',
          }}>
          {
            <span
              onClick={(e) => {
                e.stopPropagation()
                setShouldPlay(!shouldPlay)
              }}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-monochrome-black/40">
              {!shouldPlay ? <PlayIcon variant="light" /> : <PauseIcon variant="light" />}
            </span>
          }
          <AnimatedMuteIcon videoId={videoId} />
        </div>
      </div>
      {isInModal && (
        <span className="absolute right-6 top-6 h-fit w-fit cursor-pointer">
          <WalletAmountBadge type="light" />
        </span>
      )}
      <div className="absolute bottom-0 right-0 pr-2">
        <Actions.desktop
          shareUrl={shareUrl}
          sparkCount={sparkCount}
          videoId={videoId}
          videoSlug={videoSlug}
          attachedLink={attachedLink}
          description={description}
          isSparked={isSparked}
        />
      </div>
      <PlayerProgressBar />
    </div>
  )
})
