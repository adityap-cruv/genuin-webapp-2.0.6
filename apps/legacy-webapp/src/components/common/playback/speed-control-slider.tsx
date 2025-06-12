'use client'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { usePlayerControlStore } from '../player/player-control-store'
import { useCallback } from 'react'

const PLAYBACK_SPEEDS = [0.25, 1, 1.25, 1.5, 2]

export default function PlaybackSpeedControlSlider() {
  const { playbackSpeed, setPlaybackSpeed } = usePlayerControlStore((state) => ({
    playbackSpeed: state.playbackSpeed,
    setPlaybackSpeed: state.setPlaybackSpeed,
  }))

  const decreaseSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed.speed)
    if (currentIndex > 0) setPlaybackSpeed(PLAYBACK_SPEEDS[currentIndex - 1])
  }, [playbackSpeed.speed, setPlaybackSpeed])

  const increaseSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed.speed)
    if (currentIndex < PLAYBACK_SPEEDS.length - 1) setPlaybackSpeed(PLAYBACK_SPEEDS[currentIndex + 1])
  }, [playbackSpeed.speed, setPlaybackSpeed])

  return (
    <div className="bg-white/80 rounded-2xl p-6 pt-0 shadow-xl backdrop-blur-md">
      <div className="flex items-center space-x-4">
        <Button
          variant="default"
          onClick={decreaseSpeed}
          disabled={playbackSpeed.speed === PLAYBACK_SPEEDS[0]}
          className="h-10 w-10 rounded-full bg-tertiary-200 hover:bg-tertiary-400">
          <span className="text-monochrome-black">−</span>
        </Button>

        <Slider
          value={[playbackSpeed.speed]}
          onValueChange={(val) => {
            const closestSpeed = PLAYBACK_SPEEDS.reduce((prev, curr) => {
              return Math.abs(curr - val[0]) < Math.abs(prev - val[0]) ? curr : prev
            })
            setPlaybackSpeed(closestSpeed)
          }}
          min={PLAYBACK_SPEEDS[0]}
          max={PLAYBACK_SPEEDS[PLAYBACK_SPEEDS.length - 1]}
          step={0.25}
          className="flex-1"
        />

        <Button
          variant="default"
          onClick={increaseSpeed}
          disabled={playbackSpeed.speed === PLAYBACK_SPEEDS[PLAYBACK_SPEEDS.length - 1]}
          className="h-10 w-10 rounded-full bg-tertiary-200 hover:bg-tertiary-400">
          <span className="text-monochrome-black">+</span>
        </Button>
      </div>

      <div className="mt-6 flex justify-between gap-4">
        {PLAYBACK_SPEEDS.map((s) => (
          <Button
            key={s}
            onClick={() => {
              setPlaybackSpeed(s)
            }}
            className={`w-16 rounded-full px-4 py-2 text-title-3-demi hover:text-monochrome-white sm:hover:bg-tertiary-400 ${
              playbackSpeed.speed === s ? 'bg-primary text-monochrome-white' : 'text-black bg-tertiary-200'
            }`}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  )
}
