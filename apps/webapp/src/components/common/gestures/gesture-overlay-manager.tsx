import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useShallow } from 'zustand/react/shallow'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { type GestureOverlayKeysType, useKsGestureStore } from '@/components/common/gestures/gesture-store'

const LazyGestureGuideOverlay = dynamic(
  async () => await import('./gesture-guide-overlay').then((comp) => comp.LazyGestureGuideOverlay)
)

export function useGestureOverlayMethods({ tapBehavior }: { tapBehavior: number }) {
  const { gestureOverlays, setGestureOverlay, resetAllGestures, resetGestureOverlay } = useKsGestureStore(
    useShallow((state) => ({
      gestureOverlays: state.gestureOverlays,
      setGestureOverlay: state.setGestureOverlay,
      resetAllGestures: state.resetAllGestures,
      resetGestureOverlay: state.resetGestureOverlay,
    }))
  )

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
    [gestureOverlays, setGestureOverlay, tapBehavior]
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
    [setGestureOverlay, tapBehavior]
  )

  const hasGestureBeenShown = useCallback(
    (step: GestureOverlayKeysType) => gestureOverlays[step].hasShown,
    [gestureOverlays]
  )

  const gestureOverlayUI = useMemo(() => {
    return (
      <>
        {gestureOverlays.SWIPE.isVisible && <LazyGestureGuideOverlay gestureStep="SWIPE" />}
        {gestureOverlays.PLAY_PAUSE.isVisible && (
          <LazyGestureGuideOverlay gestureStep="PLAY_PAUSE" tapBehavior={tapBehavior} />
        )}
      </>
    )
  }, [gestureOverlays, tapBehavior])

  const checkAndResetGestures = useCallback(() => {
    try {
      const storedGestures = localStorage.getItem('_ks_gestures_')
      if (!storedGestures) return

      const parsed = JSON.parse(storedGestures)
      const storedOverlays = parsed?.state?.gestureOverlays

      if (!storedOverlays) return

      // Check each gesture in the store
      Object.entries(storedOverlays).forEach(([gestureKey, gesture]: [string, any]) => {
        if (gesture?.isVisible && gesture?.hasShown) {
          resetGestureOverlay(gestureKey as GestureOverlayKeysType)
        }
      })
    } catch (error) {
      console.error('Failed to parse _ks_gestures_:', error)
    }
  }, [resetGestureOverlay])

  return {
    gestureOverlayUI,
    showGestureOverlay,
    hideGestureOverlay,
    hasGestureBeenShown,
    resetAllGestures,
    resetGestureOverlay,
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
export function useGestureOverlayManager(gestureGuidance?: boolean) {
  const { isGuidanceEnabled, tapBehavior } = useGenuinOptions(
    useShallow((state) => ({
      isGuidanceEnabled: gestureGuidance ?? state.config.web_configs?.gesture_guidance,
      tapBehavior: state.config.web_configs?.tap_behavior,
    }))
  )
  const isValidTapBehavior = tapBehavior && VALID_TAP_BEHAVIORS.includes(tapBehavior)

  // Return no-op functions if guidance is disabled or tap behavior is invalid
  if (!isGuidanceEnabled || !isValidTapBehavior) {
    return {
      gestureOverlayUI: null,
      showGestureOverlay: () => {},
      hideGestureOverlay: () => {},
      hasGestureBeenShown: () => false,
      resetGestureOverlay: () => {},
      resetAllGestures: () => {},
    }
  }

  // Only call useGestureOverlayMethods if guidance is enabled and tap behavior is valid
  return useGestureOverlayMethods({ tapBehavior })
}
