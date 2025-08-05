import { useCallback, useMemo } from 'react'
import { useBaseContext } from '@/context/base'
import { LazyGestureGuideOverlay } from './gesture-guide-overlay'
import { type GestureOverlayKeysType, useGestureContext } from './context'

/**
 * Hook that manages gesture overlays with automatic disabling when feature is turned off
 */
export function useGestureOverlayMethods({
  tapBehavior,
}: {
  tapBehavior: number
}) {
  const { gestureOverlays, setGestureOverlay } = useGestureContext()

  /**
   * Determines whether play/pause gesture handling should be active based on tap behavior and mute state
   *
   * @param muted - Current mute state of the video player
   * @returns boolean indicating if play/pause gesture should be handled
   *
   * Conditions:
   * - tapBehavior 1 (Mute/Unmute): Always handle
   * - tapBehavior 2 (Play/Pause): Always handle
   * - tapBehavior 3 (Unmute then Play/Pause): Only handle when unmuted
   */
  const shouldHandlePlayPause = (muted?: boolean) => {
    return (
      (tapBehavior === 3 && !muted) || // Handle if unmuted for conditional play/pause
      tapBehavior === 1 || // Always handle for mute/unmute behavior
      tapBehavior === 2 // Always handle for play/pause behavior
    )
  }

  const showGestureOverlay = useCallback(
    (step: GestureOverlayKeysType, muted?: boolean) => {
      if (gestureOverlays[step].hasShown) return

      if (step === 'PLAY_PAUSE' && shouldHandlePlayPause(muted)) {
        setGestureOverlay(step, true)
      }

      if (step === 'SWIPE') {
        setGestureOverlay(step, true)
      }
    },
    [gestureOverlays, setGestureOverlay, tapBehavior],
  )

  const hideGestureOverlay = useCallback(
    (step: GestureOverlayKeysType, muted?: boolean) => {
      if (step === 'PLAY_PAUSE' && shouldHandlePlayPause(muted)) {
        setGestureOverlay(step, false)
      }

      if (step === 'SWIPE') {
        setGestureOverlay(step, false)
      }
    },
    [setGestureOverlay, tapBehavior],
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
          <LazyGestureGuideOverlay
            gestureStep='PLAY_PAUSE'
            tapBehavior={tapBehavior}
          />
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
 *
 * @returns Gesture overlay methods and UI or no-op functions if disabled
 *
 * tapBehavior values:
 * 1: Tap to mute/unmute
 * 2: Tap to play/pause
 * 3: Tap to unmute and then play/pause
 */
const VALID_TAP_BEHAVIORS = [1, 2, 3]
export function useGestureOverlayManager() {
  const { brandDetails } = useBaseContext()
  const tapBehavior = brandDetails?.web_configs.tap_behavior

  const isValidTapBehavior =
    tapBehavior && VALID_TAP_BEHAVIORS.includes(tapBehavior)

  // If gesture guidance is disabled, return no-op functions immediately
  if (!brandDetails?.web_configs?.gesture_guidance || !isValidTapBehavior) {
    return {
      gestureOverlayUI: null,
      showGestureOverlay: () => {},
      hideGestureOverlay: () => {},
      hasGestureBeenShown: () => false,
    }
  }

  // Only call useGestureOverlayMethods if guidance is enabled
  return useGestureOverlayMethods({ tapBehavior })
}
