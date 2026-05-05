"use client";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from "react";

import internalStorage from "@genuin/components/lib/utils/internal-storage-manager";

export type GestureOverlayKeysType = "SWIPE" | "PLAY_PAUSE";

type GestureOverlayStateType = { isVisible: boolean; hasShown: boolean };

type GestureContextType = {
  setGestureOverlay: (gesture: GestureOverlayKeysType, isVisible: boolean) => void;
  gestureOverlays: Record<GestureOverlayKeysType, GestureOverlayStateType>;
  resetAllGestures: () => void;
  resetGestureOverlay: (gesture: GestureOverlayKeysType) => void;
};

const DEFAULT_GESTURE_STATE: Record<GestureOverlayKeysType, GestureOverlayStateType> = {
  SWIPE: { isVisible: false, hasShown: false },
  PLAY_PAUSE: { isVisible: false, hasShown: false },
};

const GestureContext = createContext<GestureContextType | undefined>(undefined);

export const GestureProvider: React.FC<{
  children: ReactNode;
  isInIframe: boolean;
}> = ({ children, isInIframe }) => {
  const [gestureOverlays, setGestureOverlays] = useState(DEFAULT_GESTURE_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = isInIframe ? internalStorage.getItem("_ks_gestures_") : localStorage.getItem("_ks_gestures_");
    if (stored) {
      const parsed = JSON.parse(stored);
      setGestureOverlays(parsed.state?.gestureOverlays || DEFAULT_GESTURE_STATE);
    }
  }, [isInIframe]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isInIframe) {
      internalStorage.setItem("_ks_gestures_", JSON.stringify({ state: { gestureOverlays } }));
    } else {
      localStorage.setItem("_ks_gestures_", JSON.stringify({ state: { gestureOverlays } }));
    }
  }, [gestureOverlays, isInIframe]);

  const setGestureOverlay = (gesture: GestureOverlayKeysType, isVisible: boolean) => {
    setGestureOverlays((prev) => {
      if (prev[gesture].hasShown && isVisible) return prev;

      // If showing a new gesture, hide all other gestures first
      if (isVisible) {
        const newState = { ...DEFAULT_GESTURE_STATE };
        // Set all gestures to not visible but preserve hasShown state
        Object.keys(prev).forEach((key) => {
          const gestureKey = key as GestureOverlayKeysType;
          newState[gestureKey] = {
            isVisible: false,
            hasShown: prev[gestureKey].hasShown,
          };
        });
        // Now show only the requested gesture
        newState[gesture] = { isVisible: true, hasShown: true };
        return newState;
      }

      // If hiding a gesture, just update that specific gesture
      return { ...prev, [gesture]: { isVisible, hasShown: true } };
    });
  };

  const resetAllGestures = () => {
    setGestureOverlays({ ...DEFAULT_GESTURE_STATE });
  };

  const resetGestureOverlay = (gesture: GestureOverlayKeysType) => {
    setGestureOverlays((prev) => ({
      ...prev,
      [gesture]: { isVisible: false, hasShown: false },
    }));
  };

  return (
    <GestureContext.Provider
      value={{
        gestureOverlays,
        setGestureOverlay,
        resetAllGestures,
        resetGestureOverlay,
      }}>
      {children}
    </GestureContext.Provider>
  );
};

export const useGestureContext = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error("useGestureContext must be used within a GestureProvider");
  }
  return context;
};
