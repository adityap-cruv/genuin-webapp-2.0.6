import { cn } from '@/utils'
import { type ComponentProps } from 'react'
import { CloseIcon } from '../icons/close-icon'
import { useBaseContext } from '@/context/base'
import { ForwardIcon } from '../icons/forward-icon'

type PlaybackSpeedCapsuleProps = ComponentProps<'div'>

export const PlaybackSpeedCapsule = ({
  className,
  ...props
}: PlaybackSpeedCapsuleProps) => {
  const { playbackSpeed, setPlaybackSpeed } = useBaseContext()

  if (playbackSpeed.speed === 1) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        {
          'rounded-xl bg-black/40 px-2 py-1': !playbackSpeed.isSpeedFromGesture,
        },
        className,
      )}
      onClick={(e) => {
        e.stopPropagation()
      }}
      {...props}>
      <ForwardIcon />
      <span className='text-body-1-demi text-white'>
        {playbackSpeed.speed}x speed
      </span>
      {!playbackSpeed.isSpeedFromGesture && (
        <CloseIcon
          className='h-3.5 w-3.5 cursor-pointer stroke-white'
          variant='light'
          onClick={(e) => {
            e.stopPropagation()
            setPlaybackSpeed(1)
          }}
        />
      )}
    </div>
  )
}
