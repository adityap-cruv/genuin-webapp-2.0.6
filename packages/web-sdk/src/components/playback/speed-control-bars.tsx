import { useBaseContext } from '@/context/base'
import { useSizeContext } from '@/context/size'
import { cn } from '@/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

const LONG_PRESS_DURATION = 500 // 500ms for long press

export const SpeedControlSideBars = () => {
  const { setPlaybackSpeed, playbackSpeed } = useBaseContext()
  const { isMobile } = useSizeContext()
  const [activeBar, setActiveBar] = useState<'left' | 'right' | null>(null)
  const speedControlRef = useRef<{
    previousSpeed: number
    longPressTimer?: NodeJS.Timeout
  }>({
    previousSpeed: playbackSpeed.speed,
  })

  useEffect(() => {
    const playbackSpeedElement = document.querySelector('.playback-speed-class')
    if (playbackSpeedElement) {
      playbackSpeedElement.classList.toggle(
        'invisible',
        playbackSpeed.isSpeedFromGesture,
      )
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
    [playbackSpeed],
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
          'absolute left-0 top-0 z-30 h-full w-14 opacity-0 transition-opacity',
          activeBar === 'left' && 'bg-white ',
        )}
        onTouchStart={(e) => {
          handleTouchStart(e, 'left')
        }}
        onTouchEnd={handleTouchEnd}
      />

      {/* Right speed control bar */}
      <div
        className={cn(
          'absolute right-0 top-0 z-30 h-full w-14 opacity-0 transition-opacity',
          activeBar === 'right' && 'bg-white ',
        )}
        onTouchStart={(e) => {
          handleTouchStart(e, 'right')
        }}
        onTouchEnd={handleTouchEnd}
      />
    </>
  )
}
