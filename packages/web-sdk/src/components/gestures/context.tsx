import { useBaseContext } from '@/context/base'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export type GestureOverlayKeysType = 'SWIPE' | 'PLAY_PAUSE'

type GestureOverlayStateType = {
  isVisible: boolean
  hasShown: boolean
}

type GestureContextType = {
  setGestureOverlay: (
    gesture: GestureOverlayKeysType,
    isVisible: boolean,
  ) => void
  gestureOverlays: Record<GestureOverlayKeysType, GestureOverlayStateType>
}

const GestureContext = createContext<GestureContextType | null>(null)

export function GestureProvider({ children }: { children: React.ReactNode }) {
  const { brandDetails } = useBaseContext()

  const getInitialGestureState = useCallback((): Record<
    GestureOverlayKeysType,
    GestureOverlayStateType
  > => {
    try {
      const saved = localStorage.getItem('_ks_gestures_')
      if (saved) {
        const parsed = JSON.parse(saved)
        const gestureOverlays =
          parsed?.gestureOverlays || parsed?.state?.gestureOverlays

        if (gestureOverlays) {
          // Reset any gestures that are visible and have been shown
          const resetState = { ...gestureOverlays }
          Object.entries(gestureOverlays).forEach(
            ([key, gesture]: [string, any]) => {
              if (gesture?.isVisible && gesture?.hasShown) {
                resetState[key as GestureOverlayKeysType] = {
                  isVisible: false,
                  hasShown: false,
                }
              }
            },
          )

          // Update localStorage with reset state
          localStorage.setItem(
            '_ks_gestures_',
            JSON.stringify({ gestureOverlays: resetState }),
          )

          return resetState
        }
      }
    } catch (error) {
      console.error('Failed to parse localStorage:', error)
    }
    return defaultGestureState
  }, [])

  const defaultGestureState = {
    SWIPE: { isVisible: false, hasShown: false },
    PLAY_PAUSE: { isVisible: false, hasShown: false },
  }

  const [gestureState, setGestureState] = useState(getInitialGestureState)

  const setGestureOverlay = useCallback(
    (gesture: GestureOverlayKeysType, isVisible: boolean) => {
      if (!brandDetails?.web_configs?.gesture_guidance) {
        console.warn('Gesture guidance is disabled or brandDetails is missing')
        return
      }

      setGestureState((prev) => {
        if (prev[gesture].hasShown && isVisible) return prev
        return {
          ...prev,
          [gesture]: { isVisible, hasShown: true },
        }
      })
    },
    [brandDetails],
  )

  useEffect(() => {
    try {
      localStorage.setItem(
        '_ks_gestures_',
        JSON.stringify({ gestureOverlays: gestureState }),
      )
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [gestureState])

  useEffect(() => {
    const tapBehavior = brandDetails?.web_configs.tap_behavior
    syncTapBehavior(tapBehavior?.toString())
  }, [brandDetails])

  /**
   * Synchronizes tap behavior between config and localStorage
   * If tap behavior changes, resets PLAY_PAUSE gesture to show new interaction guide
   *
   * @param tapBehavior - The tap behavior value from config
   */
  function syncTapBehavior(tapBehavior: string | undefined) {
    if (!tapBehavior) return

    const localTapBehavior = localStorage.getItem('_tap_behavior_')
    if (localTapBehavior !== tapBehavior) {
      localStorage.setItem('_tap_behavior_', tapBehavior)

      setGestureState((prev) => ({
        ...prev,
        PLAY_PAUSE: { isVisible: false, hasShown: false },
      }))
    }
  }

  return (
    <GestureContext.Provider
      value={{ gestureOverlays: gestureState, setGestureOverlay }}>
      {children}
    </GestureContext.Provider>
  )
}

export function useGestureContext() {
  const context = useContext(GestureContext)
  if (!context) {
    throw new Error('useGestureContext must be used within a GestureProvider')
  }
  return context
}
