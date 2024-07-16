import Image from 'next/image'
import { usePlayerControlStore } from '../player-control-store'
import icPlay from '@icons/player-controls/icPlay.svg'
import { Actions } from './actions'
import { cn } from '@lib/utils'
import { AnimatedMuteIcon } from './animated-mute-icon'
import Analytics from '@services/analytics'
import { PlayerProgressBar } from './player-progress-bar'
import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'

type DesktopProps = {
  sparkCount: number
  videoId: string
  shareUrl: string
  attachedLink?: string | null
  description?: string | null
  isSparked?: boolean | null | undefined
}

export const Desktop = memo(function Desktop({
  shareUrl,
  sparkCount,
  videoId,
  attachedLink,
  description,
  isSparked,
}: DesktopProps) {
  const { toggleMuted, muted, shouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      toggleMuted: state.toggleMuted,
      muted: state.muted,
      shouldPlay: state.shouldPlay,
    }))
  )

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex h-full w-full items-center justify-center">
        <div
          className={cn(
            'rounded-full bg-monochrome-black/40 p-2 transition-all duration-300 ',
            !shouldPlay ? 'scale-125 opacity-100 ease-in' : 'scale-100 opacity-0 ease-out'
          )}>
          <Image
            src={icPlay}
            alt="volume-control"
            className={cn('pointer-events-none z-10 cursor-pointer rounded-full')}
          />
        </div>
      </div>
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
      <div className="absolute bottom-0 right-0 pr-2">
        <Actions.desktop
          shareUrl={shareUrl}
          sparkCount={sparkCount}
          videoId={videoId}
          attachedLink={attachedLink}
          description={description}
          isSparked={isSparked}
        />
      </div>
      <PlayerProgressBar />
    </div>
  )
})
