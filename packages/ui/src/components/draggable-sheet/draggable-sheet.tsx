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
  default: 20,
  "default-active": 25,
  "expand-view": 40,
  "panel-view": 70,
  "full-view": 100,
};

const DRAG_THRESHOLD = 3;
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
  const dragState = useRef<DragState>({
    initialY: 0,
    initialHeightPx: 0,
    lastY: 0,
    lastTimestamp: 0,
    flickVelocity: 0,
    hasMovedBeyondThreshold: false,
  });

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
      if (!enabledStates.includes(nextState)) return;
      setTransientHeightPx(null);
      setCurrentState(nextState);
      onStateChange?.(nextState);
    },
    [enabledStates, onStateChange],
  );

  const closeSheet = useCallback(() => {
    onClose?.();
    const firstState = enabledStates[0];
    if (firstState) transitionToState(firstState);
  }, [onClose, enabledStates, transitionToState]);

  const markUserInteraction = useCallback(() => {
    setIsUserInteracting(true);

    if (interactionTimerRef.current) {
      clearTimeout(interactionTimerRef.current);
    }

    interactionTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
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
    if (isStateHigherThan(currentState, "expand-view")) return;

    autoExpandTimerRef.current = setTimeout(() => {
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
    isStateHigherThan,
    transitionToState,
  ]);

  const handleDragStart = useCallback(
    (e: ReactPointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const drag = dragState.current;
      drag.initialY = e.clientY;
      drag.initialHeightPx = convertStateHeightToPixels(currentState);
      drag.lastY = e.clientY;
      drag.lastTimestamp = Date.now();
      drag.flickVelocity = 0;
      drag.hasMovedBeyondThreshold = false;

      setIsDragging(true);
      markUserInteraction();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [currentState, convertStateHeightToPixels, markUserInteraction],
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

      if (Math.abs(dragDelta) > DRAG_THRESHOLD) {
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
        potentialState !== currentState
      ) {
        setCurrentState(potentialState);
        onStateChange?.(potentialState);
      }
    };

    const handleDragEnd = () => {
      const drag = dragState.current;
      setIsDragging(false);

      const finalHeightPx = drag.initialHeightPx + (drag.initialY - drag.lastY);
      const targetState = findNearestSnapState(
        finalHeightPx,
        drag.flickVelocity,
        enabledStates,
        convertStateHeightToPixels,
      );

      transitionToState(targetState);
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
    if (
      currentState === "default" &&
      enabledStates.includes("default-active")
    ) {
      transitionToState("default-active");
    }
  }, [currentState, enabledStates, transitionToState, markUserInteraction]);

  const handleTapOrClick = useCallback(
    (e: MouseEvent) => {
      if (dragState.current.hasMovedBeyondThreshold) {
        e.stopPropagation();
        return;
      }

      markUserInteraction();

      if (
        currentState === "expand-view" &&
        enabledStates.includes("panel-view")
      ) {
        transitionToState("panel-view");
      }
    },
    [currentState, enabledStates, transitionToState, markUserInteraction],
  );

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
          isDarkTheme={isDarkTheme}
          overlayClassName={overlayClassName}
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
          <DragIndicator
            isDarkTheme={isDarkTheme}
            onPointerDown={handleDragStart}
          />
        )}

        {showNav && (
          <NavigationBar
            isDarkTheme={isDarkTheme}
            navTitle={navTitle}
            showClose={showClose}
            closeIcon={closeIcon}
            theme={theme}
            navClassName={navClassName}
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
