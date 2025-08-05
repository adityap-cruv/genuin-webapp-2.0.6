'use client'

import PlaybackSpeedControlSlider from '@/components/playback/speed-control-slider'
import { useBaseContext } from '@/context/base'

export const PlaybackModal = () => {
  const { playbackSpeed } = useBaseContext()

  return (
    <div className='!p-0 text-center sm:max-w-lg md:w-full md:rounded-2xl'>
      <p className='hidden border-b border-tertiary-300 p-4 text-title-1-bold md:block'>
        Playback Speed
      </p>
      <p className='py-6 text-title-2-bold'>{playbackSpeed.speed}x</p>
      <PlaybackSpeedControlSlider />
    </div>
  )
}
