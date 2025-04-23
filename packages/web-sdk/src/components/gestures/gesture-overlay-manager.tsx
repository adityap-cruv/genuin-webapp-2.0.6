import { useCallback, useMemo } from 'react'
import { useBaseContext } from '@/context/base'
import { LazyGestureGuideOverlay } from './gesture-guide-overlay'
import { type GestureOverlayKeysType, useGestureContext } from './context'

/**
 * Hook that manages gesture overlays with automatic disabling when feature is turned off
 */
export function useGestureOverlayMethods() {
  const { gestureOverlays, setGestureOverlay } = useGestureContext()

  // Create the actual functions that will be used
  const showGestureOverlay = useCallback(
    (step: GestureOverlayKeysType) => {
      if (gestureOverlays[step].hasShown) return
      setGestureOverlay(step, true)
    },
    [gestureOverlays, setGestureOverlay],
  )

  const hideGestureOverlay = useCallback(
    (step: GestureOverlayKeysType) => {
      setGestureOverlay(step, false)
    },
    [setGestureOverlay],
  )

  const hasGestureBeenShown = useCallback(
    (step: GestureOverlayKeysType) => gestureOverlays[step].hasShown,
    [gestureOverlays],
  )

  // Only render UI when enabled
  const gestureOverlayUI = useMemo(() => {
    return (
      <>
        {gestureOverlays.SWIPE.isVisible && (
          <LazyGestureGuideOverlay gestureStep='SWIPE' />
        )}
        {gestureOverlays.PLAY_PAUSE.isVisible && (
          <LazyGestureGuideOverlay gestureStep='PLAY_PAUSE' />
        )}
      </>
    )
  }, [gestureOverlays])

  return {
    gestureOverlayUI,
    showGestureOverlay,
    hideGestureOverlay,
    hasGestureBeenShown,
  }
}

/**
 * A wrapper hook that provides a simpler interface by handling the gesture enabled check
 * This allows components to use gesture functionality without checking if it's enabled
 */
export function useGestureOverlayManager() {
  const { brandDetails } = useBaseContext()
  // If gesture guidance is disabled, return no-op functions immediately
  if (!brandDetails?.web_configs?.gesture_guidance) {
    return {
      gestureOverlayUI: null,
      showGestureOverlay: () => {},
      hideGestureOverlay: () => {},
      hasGestureBeenShown: () => false,
    }
  }

  // Only call useGestureOverlayMethods if guidance is enabled
  return useGestureOverlayMethods()
}
