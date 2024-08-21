import { usePlayerControlStore } from '../player-control-store'
import { Actions } from './actions'
import { AnimatedMuteIcon } from './animated-mute-icon'
import Analytics from '@services/analytics'
import { PlayerProgressBar } from './player-progress-bar'
import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { WalletAmountBadge } from '../../wallet/wallet-amount-badge'

type DesktopProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
  videoSlug: string
  attachedLink?: string | null
  description?: string | null
  isSparked?: boolean | null | undefined
}

export const Desktop = memo(function Desktop({
  shareUrl,
  sparkCount,
  videoId,
  videoSlug,
  attachedLink,
  description,
  isSparked,
}: DesktopProps) {
  const { toggleMuted, muted } = usePlayerControlStore(
    useShallow((state) => ({
      toggleMuted: state.toggleMuted,
      muted: state.muted,
    }))
  )

  return (
    <div className="relative h-full w-full">
      {muted && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            toggleMuted()
            void Analytics.track({
              eventName: 'Unmute',
              properties: { video_id: videoId },
            })
          }}
          className="absolute inset-0 h-full w-full">
          <span className="absolute inset-0 left-6 top-6 h-fit w-fit cursor-pointer">
            <AnimatedMuteIcon />
          </span>
        </div>
      )}
      <span className="absolute right-6 top-6 h-fit w-fit cursor-pointer">
        <WalletAmountBadge type="light" />
      </span>
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
