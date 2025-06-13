import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type GestureOverlayKeysType = "SWIPE" | "PLAY_PAUSE";

type GestureOverlayStateType = { isVisible: boolean; hasShown: boolean };

type GestureContextType = {
  setGestureOverlay: (
    gesture: GestureOverlayKeysType,
    isVisible: boolean
  ) => void;
  gestureOverlays: Record<GestureOverlayKeysType, GestureOverlayStateType>;
  resetAllGestures: () => void;
  resetGestureOverlay: (gesture: GestureOverlayKeysType) => void;
};

const DEFAULT_GESTURE_STATE: Record<
  GestureOverlayKeysType,
  GestureOverlayStateType
> = {
  SWIPE: { isVisible: false, hasShown: false },
  PLAY_PAUSE: { isVisible: false, hasShown: false },
};

const GestureContext = createContext<GestureContextType | undefined>(undefined);

export const GestureProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gestureOverlays, setGestureOverlays] = useState(DEFAULT_GESTURE_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("_ks_gestures_");
    if (stored) {
      const parsed = JSON.parse(stored);
      setGestureOverlays(
        parsed.state?.gestureOverlays || DEFAULT_GESTURE_STATE
      );
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(
      "_ks_gestures_",
      JSON.stringify({ state: { gestureOverlays } })
    );
  }, [gestureOverlays]);

  const setGestureOverlay = (
    gesture: GestureOverlayKeysType,
    isVisible: boolean
  ) => {
    setGestureOverlays((prev) => {
      if (prev[gesture].hasShown && isVisible) return prev;
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
      }}
    >
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
