import { ForwardIcon } from '@icons/player-controls/forward-icon'
import { usePlayerControlStore } from '../player/player-control-store'
import { useShallow } from 'zustand/react/shallow'
import { CloseIcon } from '@icons/close-icon'
import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'

type PlaybackSpeedCapsuleProps = ComponentProps<'div'>

export const PlaybackSpeedCapsule = ({ className, ...props }: PlaybackSpeedCapsuleProps) => {
  const { playbackSpeed, setPlaybackSpeed } = usePlayerControlStore(
    useShallow((state) => ({
      playbackSpeed: state.playbackSpeed,
      setPlaybackSpeed: state.setPlaybackSpeed,
    }))
  )

  if (playbackSpeed.speed === 1) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        {
          'rounded-xl bg-monochrome-black/40 px-2 py-1': !playbackSpeed.isSpeedFromGesture,
        },
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
      }}
      {...props}>
      <ForwardIcon />
      <span className="text-body-1-demi text-monochrome-white">{playbackSpeed.speed}x speed</span>
      {!playbackSpeed.isSpeedFromGesture && (
        <CloseIcon
          className="h-3.5 w-3.5 cursor-pointer stroke-2"
          variant="light"
          onClick={(e) => {
            e.stopPropagation()
            setPlaybackSpeed(1)
          }}
        />
      )}
    </div>
  )
}
