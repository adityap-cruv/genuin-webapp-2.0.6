'use client'

import PlaybackSpeedControlSlider from '@/components/common/playback/speed-control-slider'
import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useShallow } from 'zustand/react/shallow'

export const PlaybackModal = () => {
  const { playbackSpeed } = usePlayerControlStore(
    useShallow((state) => ({
      playbackSpeed: state.playbackSpeed,
    }))
  )

  return (
    <div className="!p-0 text-center sm:max-w-lg sm:px-8 md:w-full md:rounded-2xl">
      <p className="hidden border-b border-tertiary-300 p-4 text-title-1-bold md:block">Playback Speed</p>
      <p className="py-6 text-title-2-bold">{playbackSpeed.speed}x</p>
      <PlaybackSpeedControlSlider />
    </div>
  )
}
