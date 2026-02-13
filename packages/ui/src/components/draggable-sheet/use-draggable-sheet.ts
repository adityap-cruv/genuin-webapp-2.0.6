"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  convertHeightToPixels,
  filterEnabledStates,
  clamp,
  findNearestSnapState,
} from "./helpers";
import {
  type DraggableSheetState,
  type DraggableSheetConfig,
  type DragState,
  DEFAULT_HEIGHTS,
} from "./types";

const DRAG_THRESHOLD = 3;
const DRAG_TIME_THRESHOLD = 150;
const DEFAULT_EXPAND_DELAY = 3000;
const INTERACTION_RESET_DELAY = 500;

export interface UseDraggableSheetOptions {
  config: DraggableSheetConfig;
  enabledStates: DraggableSheetState[];
  initialState?: DraggableSheetState;
  onStateChange?: (state: DraggableSheetState) => void;
  onClose?: () => void;
}

export function useDraggableSheet({
  config,
  enabledStates: enabledStatesProp,
  initialState = "default",
  onStateChange,
  onClose,
}: UseDraggableSheetOptions) {
  const enabledStates = useMemo(
    () => filterEnabledStates(enabledStatesProp),
    [enabledStatesProp],
  );
  const heights = config.heights ?? DEFAULT_HEIGHTS;
  
  const [currentState, setCurrentState] =
    useState<DraggableSheetState>(initialState);
  const [isDragging, setIsDragging] = useState(false);
  const [transientHeightPx, setTransientHeightPx] = useState<number | null>(
    null,
  );
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const currentStateRef = useRef<DraggableSheetState>(currentState);
  const isPendingTransitionRef = useRef(false);
  const isMountedRef = useRef(true);
  const dragState = useRef<DragState>({
    initialY: 0,
    initialHeightPx: 0,
    lastY: 0,
    lastTimestamp: 0,
    flickVelocity: 0,
    hasMovedBeyondThreshold: false,
  });
  const pointerDownTimeRef = useRef<number>(0);

  // Keep currentStateRef in sync
  useEffect(() => {
    currentStateRef.current = currentState;
  }, [currentState]);

  const convertStateHeightToPixels = useCallback(
    (state: DraggableSheetState) =>
      convertHeightToPixels(heights[state]),
    [heights],
  );

  const getStateIndex = useCallback(
    (state: DraggableSheetState) => enabledStates.indexOf(state),
    [enabledStates],
  );

  const isStateHigherThan = useCallback(
    (stateA: DraggableSheetState, stateB: DraggableSheetState) =>
      getStateIndex(stateA) > getStateIndex(stateB),
    [getStateIndex],
  );

  const heightBounds = useMemo(() => {
    const firstState = enabledStates[0];
    const lastState = enabledStates[enabledStates.length - 1];
    return {
      minHeightPx: firstState ? convertStateHeightToPixels(firstState) : 0,
      maxHeightPx: lastState
        ? convertStateHeightToPixels(lastState)
        : window.innerHeight,
    };
  }, [enabledStates, convertStateHeightToPixels]);

  const transitionToState = useCallback(
    (nextState: DraggableSheetState) => {
      if (!isMountedRef.current) return;
      if (!enabledStates.includes(nextState)) return;
      if (isPendingTransitionRef.current) return;
      if (currentStateRef.current === nextState) return;

      isPendingTransitionRef.current = true;
      setTransientHeightPx(null);
      setCurrentState(nextState);
      onStateChange?.(nextState);

      setTimeout(() => {
        isPendingTransitionRef.current = false;
      }, 100);
    },
    [enabledStates, onStateChange],
  );

  const closeSheet = useCallback(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = null;
    }

    onClose?.();

    const targetState = enabledStates[0];
    if (targetState) transitionToState(targetState);
  }, [onClose, enabledStates, transitionToState]);

  const markUserInteraction = useCallback(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }

    setIsUserInteracting(true);

    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }

    interactionTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsUserInteracting(false);
      }
    }, INTERACTION_RESET_DELAY);
  }, []);

  // Auto-expand logic
  useEffect(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }

    if (currentState !== "default-active") return;
    if (!enabledStates.includes("expand-view")) return;
    if (isUserInteracting) return;
    if (isDragging) return;
    if (isStateHigherThan(currentState, "expand-view")) return;

    autoExpandTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      if (currentStateRef.current !== "default-active") return;
      if (isDragging) return;

      transitionToState("expand-view");
    }, config.expandDelay ?? DEFAULT_EXPAND_DELAY);

    return () => {
      if (autoExpandTimerRef.current) {
        clearTimeout(autoExpandTimerRef.current);
        autoExpandTimerRef.current = null;
      }
    };
  }, [
    currentState,
    config.expandDelay,
    enabledStates,
    isUserInteracting,
    isDragging,
    isStateHigherThan,
    transitionToState,
  ]);

  const handleDragStart = useCallback(
    (e: ReactPointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      markUserInteraction();
      isPendingTransitionRef.current = false;

      const drag = dragState.current;
      const now = Date.now();

      drag.initialY = e.clientY;
      drag.initialHeightPx = convertStateHeightToPixels(
        currentStateRef.current,
      );
      drag.lastY = e.clientY;
      drag.lastTimestamp = now;
      drag.flickVelocity = 0;
      drag.hasMovedBeyondThreshold = false;

      pointerDownTimeRef.current = now;

      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [convertStateHeightToPixels, markUserInteraction],
  );

  // Drag move and end handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e: globalThis.PointerEvent) => {
      const drag = dragState.current;
      const currentTime = Date.now();
      const timeDelta = currentTime - drag.lastTimestamp;

      if (timeDelta > 0) {
        drag.flickVelocity = ((drag.lastY - e.clientY) / timeDelta) * 1000;
      }
      drag.lastY = e.clientY;
      drag.lastTimestamp = currentTime;

      const dragDelta = drag.initialY - e.clientY;
      const timeSincePointerDown = currentTime - pointerDownTimeRef.current;

      if (
        Math.abs(dragDelta) > DRAG_THRESHOLD ||
        timeSincePointerDown > DRAG_TIME_THRESHOLD
      ) {
        drag.hasMovedBeyondThreshold = true;
      }

      const newHeightPx = clamp(
        drag.initialHeightPx + dragDelta,
        heightBounds.minHeightPx,
        heightBounds.maxHeightPx,
      );

      setTransientHeightPx(newHeightPx);

      const potentialState = findNearestSnapState(
        newHeightPx,
        0,
        enabledStates,
        convertStateHeightToPixels,
      );

      const potentialStateHeight = convertStateHeightToPixels(potentialState);
      if (
        Math.abs(newHeightPx - potentialStateHeight) < 10 &&
        potentialState !== currentStateRef.current
      ) {
        currentStateRef.current = potentialState;
        setCurrentState(potentialState);
        onStateChange?.(potentialState);

        drag.initialHeightPx = potentialStateHeight;
        drag.initialY = e.clientY;
      }
    };

    const handleDragEnd = () => {
      const drag = dragState.current;
      const heldDuration = Date.now() - pointerDownTimeRef.current;
      setIsDragging(false);

      if (!isMountedRef.current) return;

      const wasRealDrag =
        drag.hasMovedBeyondThreshold || heldDuration > DRAG_TIME_THRESHOLD;

      if (wasRealDrag) {
        const finalHeightPx =
          drag.initialHeightPx + (drag.initialY - drag.lastY);
        const dragDelta = drag.initialY - drag.lastY;
        const isSwipingDown = dragDelta < 0;

        let targetState: DraggableSheetState;

        if (isSwipingDown) {
          const currentIndex = getStateIndex(currentStateRef.current);

          if (currentIndex === 0) {
            setTransientHeightPx(null);
            closeSheet();
            return;
          }

          if (config.stepByStepSwipeDown) {
            targetState = enabledStates[currentIndex - 1]!;
          } else {
            targetState = enabledStates[0]!;
          }
        } else {
          targetState = findNearestSnapState(
            finalHeightPx,
            drag.flickVelocity,
            enabledStates,
            convertStateHeightToPixels,
          );
        }

        isPendingTransitionRef.current = false;

        if (targetState === currentStateRef.current) {
          setTransientHeightPx(null);
        } else {
          transitionToState(targetState);
        }
      } else {
        setTransientHeightPx(null);
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
    window.addEventListener("pointercancel", handleDragEnd);

    return () => {
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);
      window.removeEventListener("pointercancel", handleDragEnd);
    };
  }, [
    isDragging,
    heightBounds,
    enabledStates,
    convertStateHeightToPixels,
    transitionToState,
    onStateChange,
    config.stepByStepSwipeDown,
    getStateIndex,
    closeSheet,
  ]);

  const handleHoverOrTouch = useCallback(() => {
    markUserInteraction();

    if (
      currentStateRef.current === "default" &&
      enabledStates.includes("default-active") &&
      !isPendingTransitionRef.current
    ) {
      transitionToState("default-active");
    }
  }, [enabledStates, transitionToState, markUserInteraction]);

  const handleTapOrClick = useCallback(() => {
    if (dragState.current.hasMovedBeyondThreshold) {
      return;
    }

    markUserInteraction();

    if (
      currentStateRef.current === "expand-view" &&
      enabledStates.includes("panel-view") &&
      !isPendingTransitionRef.current
    ) {
      transitionToState("panel-view");
    }
  }, [enabledStates, transitionToState, markUserInteraction]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (autoExpandTimerRef.current) {
        clearTimeout(autoExpandTimerRef.current);
        autoExpandTimerRef.current = null;
      }

      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
        interactionTimerRef.current = null;
      }
    };
  }, []);

  return {
    currentState,
    isDragging,
    transientHeightPx,
    handleDragStart,
    handleHoverOrTouch,
    handleTapOrClick,
    closeSheet,
  };
}
