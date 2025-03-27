import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useShallow } from 'zustand/react/shallow'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { type GestureOverlayKeysType, useKsGestureStore } from '@/components/common/gestures/gesture-store'

const LazyGestureGuideOverlay = dynamic(
  async () => await import('./gesture-guide-overlay').then((comp) => comp.LazyGestureGuideOverlay)
)

export function useGestureOverlayManager() {
  const isGuidanceEnabled = useGenuinOptions(useShallow((state) => state.config.web_configs?.gesture_guidance ?? false))

  const { gestureOverlays, setGestureOverlay } = useKsGestureStore(
    useShallow((state) => ({
      gestureOverlays: state.gestureOverlays,
      setGestureOverlay: state.setGestureOverlay,
    }))
  )

  const showGestureOverlay = useCallback(
    (step: GestureOverlayKeysType) => {
      if (!isGuidanceEnabled || gestureOverlays[step].hasShown) return
      setGestureOverlay(step, true)
    },
    [isGuidanceEnabled, gestureOverlays, setGestureOverlay]
  )

  const hideGestureOverlay = useCallback(
    (step: GestureOverlayKeysType) => {
      if (!isGuidanceEnabled) return
      setGestureOverlay(step, false)
    },
    [isGuidanceEnabled, setGestureOverlay]
  )

  const hasGestureBeenShown = useCallback(
    (step: GestureOverlayKeysType) => gestureOverlays[step].hasShown,
    [gestureOverlays]
  )

  const gestureOverlayUI = useMemo(() => {
    if (!isGuidanceEnabled) return null

    return (
      <>
        {gestureOverlays.SWIPE.isVisible && <LazyGestureGuideOverlay gestureStep="SWIPE" />}
        {gestureOverlays.PLAY_PAUSE.isVisible && <LazyGestureGuideOverlay gestureStep="PLAY_PAUSE" />}
      </>
    )
  }, [isGuidanceEnabled, gestureOverlays])

  return { gestureOverlayUI, showGestureOverlay, hideGestureOverlay, hasGestureBeenShown }
}
