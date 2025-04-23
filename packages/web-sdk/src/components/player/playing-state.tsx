import { cn } from '@/utils'
import { PlayIcon } from '../icons/play-icon'
import { PauseIcon } from '../icons/pause-icon'
import { MuteIcon } from '../icons/mute-icon'
import { UnmuteIcon } from '../icons/unmute-icon'
import { ActionButtonType } from '@/context/base'
import type { ComponentProps } from 'react'
import { GestureOverlayKeysType } from '../gestures/context'

type PlayingStateProps = {
  buttonAction: ActionButtonType
} & ComponentProps<'div'>

export function PlayingState({
  buttonAction,
  className,
  ...restProps
}: PlayingStateProps) {
  return (
    <div
      key={buttonAction}
      className={cn(
        'flex items-center h-16 w-16 justify-center animate-fade-out-delay absolute top-1/2 left-1/2 bg-black/40 p-2 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer align-middle backdrop-blur-sm transition-all duration-1000',
        className,
      )}
      {...restProps}>
      {buttonAction === 'play' && (
        <PlayIcon
          variant='light'
          className='h-8 w-8'
        />
      )}
      {buttonAction === 'pause' && (
        <PauseIcon
          variant='light'
          className='h-8 w-8'
        />
      )}
      {buttonAction === 'mute' && (
        <MuteIcon
          variant='light'
          className='h-8 w-8'
        />
      )}
      {buttonAction === 'unmute' && (
        <UnmuteIcon
          variant='light'
          className='h-8 w-8'
        />
      )}
    </div>
  )
}

type TapBehaviorParams = {
  tapBehavior: number
  muted: boolean
  shouldPlay: boolean
  toggleMuted: () => void
  setShouldPlay: (value: boolean) => void
  handlePlayerAction: (action: ActionButtonType) => void
  hideGestureOverlay?: (action: GestureOverlayKeysType) => void
}

// this is the tap behavior for the player
export const handleTapBehavior = ({
  tapBehavior,
  muted,
  shouldPlay,
  toggleMuted,
  setShouldPlay,
  handlePlayerAction,
  hideGestureOverlay,
}: TapBehaviorParams) => {
  switch (tapBehavior) {
    case 1: // Tap to mute/unmute
      handlePlayerAction(muted ? 'unmute' : 'mute')
      toggleMuted()
      break

    case 2: // Tap to play/pause
      if (hideGestureOverlay) hideGestureOverlay('PLAY_PAUSE')
      handlePlayerAction(shouldPlay ? 'pause' : 'play')
      setShouldPlay(!shouldPlay)
      break

    case 3: // Tap to unmute and then play/pause
      // If muted or paused, unmute and play
      if (muted || !shouldPlay) {
        // If muted, unmute
        if (muted) {
          handlePlayerAction('unmute')
          toggleMuted()
        }
        // If not playing, play
        if (!shouldPlay) {
          setShouldPlay(true)
          handlePlayerAction('play')
        }
      } else {
        // If playing/paused, pause/play
        handlePlayerAction(shouldPlay ? 'pause' : 'play')
        setShouldPlay(!shouldPlay)
      }
      break
  }
}
