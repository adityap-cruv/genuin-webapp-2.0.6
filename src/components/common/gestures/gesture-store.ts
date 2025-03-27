import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type GestureOverlayStateType = {
  /**
   * Indicates whether the gesture overlay is currently visible.
   * @default false
   */
  isVisible: boolean

  /**
   * Indicates whether the gesture overlay has been shown before.
   * Once true, the overlay will not be shown again.
   * @default false
   */
  hasShown: boolean
}

export type GestureOverlayKeysType = 'SWIPE' | 'PLAY_PAUSE'

type GestureType = {
  /**
   * Updates the visibility of a gesture overlay.
   * Ensures that once an overlay has been shown, it will not be shown again.
   *
   * @param gesture - The gesture overlay key (e.g., 'SWIPE', 'PLAY_PAUSE').
   * @param isVisible - Whether the overlay should be visible.
   */
  setGestureOverlay: (gesture: GestureOverlayKeysType, isVisible: boolean) => void

  /**
   * Stores the visibility state of all gesture overlays.
   */
  gestureOverlays: Record<GestureOverlayKeysType, GestureOverlayStateType>
}

export const useKsGestureStore = create(
  persist<GestureType>(
    (set) => {
      return {
        gestureOverlays: {
          SWIPE: { isVisible: false, hasShown: false },
          PLAY_PAUSE: { isVisible: false, hasShown: false },
        },
        setGestureOverlay: (gesture, isVisible) => {
          // If gestures are disabled, do not change anything
          const { config } = useGenuinOptions.getState()
          if (!config.web_configs?.gesture_guidance) return

          set((state) => {
            if (state.gestureOverlays[gesture].hasShown && isVisible) return state
            return {
              gestureOverlays: {
                ...state.gestureOverlays,
                [gesture]: { isVisible, hasShown: true },
              },
            }
          })
        },
      }
    },
    { name: '_ks_gestures_' }
  )
)
