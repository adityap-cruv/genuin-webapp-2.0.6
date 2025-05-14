import { lazy, memo } from 'react'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { useShallow } from 'zustand/react/shallow'

const LazySpeedControlSideBars = lazy(
  async () =>
    await import('./speed-control-bars').then((module) => ({
      default: module.SpeedControlSideBars,
    }))
)

const LazyPlaybackSpeedCapsule = lazy(
  async () =>
    await import('./speed-capsule').then((module) => ({
      default: module.PlaybackSpeedCapsule,
    }))
)

export const PlaybackControls = memo(function PlaybackControls() {
  const { config } = useGenuinOptions(
    useShallow((state) => ({
      config: state.config,
    }))
  )

  if (!config.web_configs?.playback_speed_enabled) return

  return (
    <>
      <LazySpeedControlSideBars />
      <LazyPlaybackSpeedCapsule className="absolute bottom-6 left-1/2 h-fit w-fit -translate-x-1/2 transform" />
    </>
  )
})
