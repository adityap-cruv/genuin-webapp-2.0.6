import { usePlayerControlStore } from '../player-control-store'
import { Actions } from './actions'
import { PlayerProgressBar } from './player-progress-bar'
import { memo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'
import { cn } from '@/lib/utils'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { PauseIcon } from '@icons/player-controls/pause-icon'
import { MuteUnmuteButton } from './mute-unmute-button'

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
  const { setShouldPlay, shouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      setShouldPlay: state.setShouldPlay,
      shouldPlay: state.shouldPlay,
    }))
  )

  function openClickableUrl(e: any) {
    e.stopPropagation()
    if (clickableUrl) window.open(clickableUrl, '_blank')
  }

  const handlePlayPause = useCallback(
    (e: any) => {
      e.stopPropagation()
      setShouldPlay(!shouldPlay)
    },
    [shouldPlay]
  )
  return (
    <div className="relative h-full w-full">
      <div
        onClick={clickableUrl ? openClickableUrl : undefined}
        className={cn('absolute inset-0', clickableUrl && 'cursor-pointer')}>
        <div className="relative left-6 top-6 flex w-fit gap-2">
          {clickableUrl && (
            <span onClick={handlePlayPause} className="rounded-lg bg-monochrome-white p-2">
              {!shouldPlay ? <PlayIcon className="stroke-secondary" /> : <PauseIcon className="stroke-secondary" />}
            </span>
          )}
          <MuteUnmuteButton videoId={videoId} />
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
