import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePlayerControlStore } from '../player/player-control-store'
import { useGenuinOptions } from '@/lib/stores/genuin-options'

const LONG_PRESS_DURATION = 500 // 500ms for long press

export const SpeedControlSideBars = () => {
  const { setPlaybackSpeed, playbackSpeed } = usePlayerControlStore()
  const { isMobile } = useGenuinOptions((state) => ({
    isMobile: state.isMobile,
  }))
  const [activeBar, setActiveBar] = useState<'left' | 'right' | null>(null)

  // Merge refs into a single object
  const speedControlRef = useRef<{
    previousSpeed: number
    longPressTimer?: NodeJS.Timeout
  }>({
    previousSpeed: playbackSpeed.speed,
  })

  useEffect(() => {
    const playbackSpeedElement = document.querySelector('.playback-speed-class')
    if (playbackSpeedElement) {
      playbackSpeedElement.classList.toggle('invisible', playbackSpeed.isSpeedFromGesture)
    }
  }, [playbackSpeed.isSpeedFromGesture])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, side: 'left' | 'right') => {
      setActiveBar(side)
      speedControlRef.current.previousSpeed = playbackSpeed.speed

      // Start long press timer
      speedControlRef.current.longPressTimer = setTimeout(() => {
        setPlaybackSpeed(2, true) // Set to 2x speed on long press
      }, LONG_PRESS_DURATION)
    },
    [playbackSpeed]
  )

  const handleTouchEnd = useCallback(() => {
    // Clear long press timer
    if (speedControlRef.current.longPressTimer) {
      clearTimeout(speedControlRef.current.longPressTimer)
    }

    // If we were at 2x speed (from long press), return to previous speed
    if (playbackSpeed.speed === 2) {
      setPlaybackSpeed(speedControlRef.current.previousSpeed, false)
    }

    setActiveBar(null)
  }, [playbackSpeed, setPlaybackSpeed])

  if (!isMobile) return

  return (
    <>
      {/* Left speed control bar */}
      <div
        className={cn(
          'absolute left-0 top-0 z-20 h-full w-14 opacity-0 transition-opacity',
          activeBar === 'left' && 'bg-white '
        )}
        onTouchStart={(e) => {
          handleTouchStart(e, 'left')
        }}
        onTouchEnd={handleTouchEnd}
      />

      {/* Right speed control bar */}
      <div
        className={cn(
          'absolute right-0 top-0 z-20 h-full w-14 opacity-0 transition-opacity',
          activeBar === 'right' && 'bg-white '
        )}
        onTouchStart={(e) => {
          handleTouchStart(e, 'right')
        }}
        onTouchEnd={handleTouchEnd}
      />
    </>
  )
}
