import { MuteIcon } from '@icons/player-controls/mute-icon'
import { UnmuteIcon } from '@icons/player-controls/unmute-icon'
import { Loader } from '@/components/ui/loader'
import { type PlayerControlStoreType, usePlayerControlStore } from '../player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { PlayIcon } from '@icons/player-controls/play-icon'
import { PauseIcon } from '@icons/player-controls/pause-icon'

export function PlayingState() {
  const { playingState, buttonAction } = usePlayerControlStore(
    useShallow((state) => ({
      playingState: state.playingState,
      buttonAction: state.buttonAction,
    }))
  )

  if (playingState === 'loading') {
    return (
      <div className="absolute left-1/2 top-1/2 flex h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-monochrome-black/40 align-middle opacity-100 backdrop-blur-sm transition-all duration-100">
        <Loader size="md" />
      </div>
    )
  }

  if (buttonAction)
    return (
      <div
        key={buttonAction}
        className={cn(
          'absolute left-1/2 top-1/2 flex h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 transform animate-fade-out-delay items-center justify-center rounded-full bg-monochrome-black/40 align-middle backdrop-blur-sm'
        )}>
        {buttonAction === 'play' && <PlayIcon variant="light" className="h-8 w-8" />}
        {buttonAction === 'pause' && <PauseIcon variant="light" className="h-8 w-8" />}
        {buttonAction === 'mute' && <MuteIcon variant="light" className="h-8 w-8" />}
        {buttonAction === 'unmute' && <UnmuteIcon variant="light" className="h-8 w-8" />}
      </div>
    )
}

type TapBehaviorParams = {
  tapBehavior: number
  muted: boolean
  shouldPlay: boolean
  toggleMuted: PlayerControlStoreType['toggleMuted']
  setShouldPlay: PlayerControlStoreType['setShouldPlay']
}

// this is the tap behavior for the player
export const handleTapBehavior = ({
  tapBehavior,
  muted,
  shouldPlay,
  toggleMuted,
  setShouldPlay,
}: TapBehaviorParams) => {
  switch (tapBehavior) {
    case 1: // Tap to mute/unmute
      toggleMuted(true)
      break

    case 2: // Tap to play/pause
      setShouldPlay(!shouldPlay, true)
      break

    case 3: // Tap to unmute and then play/pause
      // If muted or paused than unmute and play.
      if (muted || !shouldPlay) {
        // If muted then unmute.
        if (muted) {
          toggleMuted(true)
        }
        // If not playing then play.
        if (!shouldPlay) {
          setShouldPlay(true, true)
        }
        // If playing then pause.
      } else {
        setShouldPlay(!shouldPlay, true)
      }
      break
  }
}
