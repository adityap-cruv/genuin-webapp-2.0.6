import { memo } from 'react'
import { SpeedControlSideBars } from './speed-control-bars'
import { PlaybackSpeedCapsule } from './speed-capsule'
import { useBaseContext } from '@/context/base'

export const PlaybackControls = memo(function PlaybackControls() {
  const { brandDetails } = useBaseContext()

  if (!brandDetails?.web_configs.playback_speed_enabled) return

  return (
    <>
      <SpeedControlSideBars />
      <PlaybackSpeedCapsule className='absolute bottom-6 left-1/2 h-fit w-fit -translate-x-1/2 transform' />
    </>
  )
})
