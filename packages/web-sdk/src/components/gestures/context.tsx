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

        // Try both shapes: with and without `state`
        if (parsed?.gestureOverlays) {
          return parsed.gestureOverlays
        } else if (parsed?.state?.gestureOverlays) {
          return parsed.state.gestureOverlays
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
