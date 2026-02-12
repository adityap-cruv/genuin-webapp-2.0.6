"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@genuin/ui/lib/utils";

import {
  normalizeHeight,
  convertHeightToPixels,
  filterEnabledStates,
  clamp,
  findNearestSnapState,
} from "./helpers";
import {
  DRAGGABLE_SHEET_STATES,
  type DraggableSheetProps,
  type DraggableSheetState,
  type HeightValue,
  type DraggableSheetHeightConfig,
  type DragState,
} from "./types";
import { DragIndicator } from "./draggable-sheet-drag-indicator";
import { NavigationBar } from "./draggable-sheet-nav-bar";
import { Overlay } from "./draggable-sheet-overlay";

const DEFAULT_HEIGHTS: Record<DraggableSheetState, HeightValue> = {
  default: 15,
  "default-active": 18,
  "expand-view": 40,
  "panel-view": 70,
  "full-view": 100,
};

const DRAG_THRESHOLD = 3;
const DRAG_TIME_THRESHOLD = 150; // ms - minimum time to consider as drag vs click
const DEFAULT_EXPAND_DELAY = 3000;
const INTERACTION_RESET_DELAY = 500;

function DraggableSheet({
  enabledStates: enabledStatesProp,
  initialState = "default",
  expandDelay = DEFAULT_EXPAND_DELAY,
  showOverlay = false,
  showIndicator = true,
  showNav = true,
  navTitle,
  showClose = true,
  closeIcon,
  onStateChange,
  onClose,
  visible = true,
  theme = "light",
  heights: heightsProp,
  overlayClassName,
  contentClassName,
  navClassName,
  transitionDuration = 350,
  closeState,
  swipeDownState,
  swipeDownBehavior = "step",
  className,
  style,
  children,
  ...rest
}: DraggableSheetProps) {
  const isDarkTheme = theme === "dark";

  const heightConfig = useMemo<Record<DraggableSheetState, HeightValue>>(
    () => ({ ...DEFAULT_HEIGHTS, ...heightsProp }),
    [heightsProp],
  );

  const enabledStates = useMemo(
    () => filterEnabledStates(enabledStatesProp ?? [...DRAGGABLE_SHEET_STATES]),
    [enabledStatesProp],
  );

  const [currentState, setCurrentState] =
    useState<DraggableSheetState>(initialState);
  const [isDragging, setIsDragging] = useState(false);
  const [transientHeightPx, setTransientHeightPx] = useState<number | null>(
    null,
  );
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
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
    (state: DraggableSheetState) => convertHeightToPixels(heightConfig[state]),
    [heightConfig],
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

      // Reset pending flag after transition duration
      setTimeout(() => {
        isPendingTransitionRef.current = false;
      }, 100);
    },
    [enabledStates, onStateChange],
  );

  const closeSheet = useCallback(() => {
    // Cancel all pending timers
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }
    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = null;
    }

    onClose?.();

    // Use closeState prop if provided, otherwise use first enabled state
    const targetState =
      closeState && enabledStates.includes(closeState)
        ? closeState
        : enabledStates[0];

    if (targetState) transitionToState(targetState);
  }, [onClose, enabledStates, closeState, transitionToState]);

  const markUserInteraction = useCallback(() => {
    // Cancel auto-expand immediately on user interaction
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

  useEffect(() => {
    if (autoExpandTimerRef.current) {
      clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }

    if (currentState !== "default-active") return;
    if (!enabledStates.includes("expand-view")) return;
    if (isUserInteracting) return;
    if (isDragging) return; // Don't auto-expand during drag
    if (isStateHigherThan(currentState, "expand-view")) return;

    autoExpandTimerRef.current = setTimeout(() => {
      // Double-check conditions before transitioning
      if (!isMountedRef.current) return;
      if (currentStateRef.current !== "default-active") return;
      if (isDragging) return;

      transitionToState("expand-view");
    }, expandDelay);

    return () => {
      if (autoExpandTimerRef.current) {
        clearTimeout(autoExpandTimerRef.current);
        autoExpandTimerRef.current = null;
      }
    };
  }, [
    currentState,
    expandDelay,
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

      // Cancel any pending transitions immediately
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

      // Track when pointer went down
      pointerDownTimeRef.current = now;

      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [convertStateHeightToPixels, markUserInteraction],
  );

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

      // Consider it a drag if moved beyond threshold OR held for minimum time
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
      }
    };

    const handleDragEnd = () => {
      const drag = dragState.current;
      const heldDuration = Date.now() - pointerDownTimeRef.current;
      setIsDragging(false);

      if (!isMountedRef.current) return;

      // Only snap to new state if it was a real drag (moved or held long enough)
      const wasRealDrag =
        drag.hasMovedBeyondThreshold || heldDuration > DRAG_TIME_THRESHOLD;

      if (wasRealDrag) {
        const finalHeightPx =
          drag.initialHeightPx + (drag.initialY - drag.lastY);
        const dragDelta = drag.initialY - drag.lastY;
        const isSwipingDown = dragDelta < 0;

        let targetState: DraggableSheetState;

        // Handle swipe down with custom behavior
        if (
          isSwipingDown &&
          swipeDownState &&
          enabledStates.includes(swipeDownState)
        ) {
          if (swipeDownBehavior === "direct") {
            // Go directly to the specified swipe down state
            targetState = swipeDownState;
          } else {
            // Step-by-step: go one state down
            const currentIndex = getStateIndex(currentStateRef.current);
            const swipeDownIndex = getStateIndex(swipeDownState);

            if (currentIndex > swipeDownIndex) {
              // Move one step down towards swipeDownState
              targetState =
                enabledStates[currentIndex - 1] || currentStateRef.current;
            } else {
              // Already at or below swipeDownState, use normal snap
              targetState = findNearestSnapState(
                finalHeightPx,
                drag.flickVelocity,
                enabledStates,
                convertStateHeightToPixels,
              );
            }
          }
        } else {
          // Normal behavior - find nearest snap state
          targetState = findNearestSnapState(
            finalHeightPx,
            drag.flickVelocity,
            enabledStates,
            convertStateHeightToPixels,
          );
        }

        console.log("targetState", targetState);

        // Reset pending transition flag and transition to target state
        isPendingTransitionRef.current = false;
        transitionToState(targetState);
      } else {
        // Quick tap - just reset transient height without changing state
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
    currentState,
    onStateChange,
  ]);

  const handleHoverOrTouch = useCallback(() => {
    markUserInteraction();

    // Use ref to prevent stale closure and add guard
    if (
      currentStateRef.current === "default" &&
      enabledStates.includes("default-active") &&
      !isPendingTransitionRef.current
    ) {
      transitionToState("default-active");
    }
  }, [enabledStates, transitionToState, markUserInteraction]);

  const handleTapOrClick = useCallback(
    (e: MouseEvent) => {
      if (dragState.current.hasMovedBeyondThreshold) {
        e.stopPropagation();
        return;
      }

      markUserInteraction();

      // Use ref to prevent stale closure
      if (
        currentStateRef.current === "expand-view" &&
        enabledStates.includes("panel-view") &&
        !isPendingTransitionRef.current
      ) {
        transitionToState("panel-view");
      }
    },
    [enabledStates, transitionToState, markUserInteraction],
  );

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

  if (!visible) return null;

  const shouldShowOverlay =
    showOverlay &&
    (currentState === "panel-view" || currentState === "full-view");

  const computedSheetHeight =
    isDragging && transientHeightPx !== null
      ? `${transientHeightPx}px`
      : normalizeHeight(heightConfig[currentState]);

  const heightTransition = isDragging
    ? "none"
    : `height ${transitionDuration}ms cubic-bezier(0.32, 0.72, 0, 1)`;

  return (
    <>
      {shouldShowOverlay && (
        <Overlay
          theme={theme}
          className={overlayClassName}
          onClick={closeSheet}
        />
      )}

      <div
        ref={sheetRef}
        data-slot="draggable-sheet"
        data-state={currentState}
        data-theme={theme}
        className={cn(
          "gencl:w-full gencl:h-auto gencl:pointer-events-auto gencl:flex gencl:flex-col gencl:overflow-hidden",
          isDarkTheme
            ? "gencl:bg-black/50 gencl:backdrop-blur-sm"
            : "gencl:bg-white",
          "gencl:rounded-xl",
          className,
        )}
        style={{
          ...style,
          height: computedSheetHeight,
          transition: heightTransition,
        }}
        onMouseEnter={handleHoverOrTouch}
        onTouchStart={handleHoverOrTouch}
        onClick={handleTapOrClick}
        {...rest}
      >
        {showIndicator && currentState !== "default" && (
          <DragIndicator theme={theme} onPointerDown={handleDragStart} />
        )}

        {showNav && (
          <NavigationBar
            navTitle={navTitle}
            showClose={showClose}
            closeIcon={closeIcon}
            theme={theme}
            className={navClassName}
            onPointerDown={handleDragStart}
            onClose={closeSheet}
          />
        )}

        <div
          data-slot="draggable-sheet-content"
          className={cn(
            "gencl:flex-1 gencl:min-h-0 gencl:overflow-y-auto gencl:overflow-x-hidden gencl:w-full",
            contentClassName,
          )}
          style={{ touchAction: "pan-y" }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export { DraggableSheet, DRAGGABLE_SHEET_STATES, DEFAULT_HEIGHTS };
