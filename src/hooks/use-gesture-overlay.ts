import { usePlayerControlStore } from '@/components/common/player/player-control-store'
import { useKsGestureStore } from '@/lib/stores/ks-gestures'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

/**
 * Custom hook to manage gesture overlays based on video playback progress.
 */
export function useGestureOverlay(currentIndex: number) {
  // Get gesture overlay state and setter function from the ks-gesture store.
  const { gestureOverlays, setGestureOverlay } = useKsGestureStore()

  // Get current playback time and total duration from the player control store.
  // Using `useShallow` ensures that the component only re-renders when one of these values changes.
  const { currentTime, duration, muted } = usePlayerControlStore(
    useShallow((state) => ({
      currentTime: state.currentTime,
      duration: state.duration,
      muted: state.muted,
    }))
  )

  /**
   * Effect hook to determine when to show the "Play/Pause" gesture hint.
   *
   * Conditions:
   * - The user is on the second video (index 1).
   * - The video has reached at least 50% of its duration.
   * - The "Play/Pause" hint hasn't been shown before.
   */
  useEffect(() => {
    if (currentIndex === 1 && currentTime >= duration * 0.5 && !gestureOverlays.PLAY_PAUSE.hasShown && !muted) {
      setGestureOverlay('PLAY_PAUSE', true) // Show the Play/Pause gesture hint.
    }
  }, [currentIndex, currentTime, duration, gestureOverlays, setGestureOverlay])

  // Return the gesture overlay state and setter to be used in components.
  return { gestureOverlays, setGestureOverlay }
}
