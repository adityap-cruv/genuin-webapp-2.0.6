"use client";

import { useState, useRef, useEffect, useCallback, useMemo, type PointerEvent as ReactPointerEvent } from "react";

import { normalizeHeightToPx, clamp, filterEnabledStates, findNearestSnapState } from "./helpers";
import { DEFAULT_HEIGHTS, type DynamicSheetState, type UseDynamicSheetOptions, type DragTrackingState } from "./types";

const DRAG_THRESHOLD_PX = 8;
const DRAG_TIME_THRESHOLD_MS = 150;
const HOLD_DURATION_MS = 400;
const CLICK_MAX_DURATION_MS = 250;
const SNAP_PROXIMITY_PX = 10;

export function useDynamicSheet({
  enabledStates: enabledStatesProp,
  heights,
  initialState = "default",
  containerHeight,
  stepByStepSwipeDown = true,
  stepByStepSwipeUp = false,
  disableDragAndSwipe = false,
  commitOnDragEnd = false,
  onStateChange,
  onRequestClose,
  autoAdvance,
}: UseDynamicSheetOptions) {
  const enabledStates = useMemo(() => filterEnabledStates(enabledStatesProp), [enabledStatesProp]);

  const stateToPx = useCallback(
    (state: DynamicSheetState): number =>
      normalizeHeightToPx(heights[state] ?? DEFAULT_HEIGHTS[state] ?? 15, containerHeight),
    [heights, containerHeight]
  );

  // Order-agnostic view of `enabledStates`, sorted ascending by
  // pixel height. Consumer configs declare `enabledStates` in
  // arbitrary order (some scenarios list panel/full first as the
  // "primary" states), but the drag clamp math and the step-down
  // swipe target both need a smallest→largest sequence to behave
  // correctly. Sorting here keeps the public config shape free and
  // makes the hook robust to any ordering.
  const enabledStatesByHeight = useMemo(
    () => [...enabledStates].sort((a, b) => stateToPx(a) - stateToPx(b)),
    [enabledStates, stateToPx]
  );

  const validInitialState = useMemo(
    () => (enabledStates.includes(initialState) ? initialState : enabledStates[0] || "default"),
    [enabledStates, initialState]
  );

  const [currentState, setCurrentState] = useState<DynamicSheetState>(validInitialState);
  const [isDragging, setIsDragging] = useState(false);
  const [transientHeightPx, setTransientHeightPx] = useState<number | null>(null);

  const currentStateRef = useRef<DynamicSheetState>(validInitialState);
  const isPendingTransitionRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerDownTimestampRef = useRef(0);
  const holdActivatedRef = useRef(false);
  const dragTracking = useRef<DragTrackingState>({
    initialY: 0,
    initialHeightPx: 0,
    lastY: 0,
    lastTimestamp: 0,
    flickVelocity: 0,
    hasMoved: false,
  });

  useEffect(() => {
    currentStateRef.current = currentState;
  }, [currentState]);

  // Sync `currentState` when the host bumps `initialState` after mount; without
  // this the hook stays at its initial value and the panel never re-resolves its
  // height. Skip when unchanged, not enabled, or a transition is in flight.
  useEffect(() => {
    if (initialState === currentStateRef.current) return;
    if (!enabledStates.includes(initialState)) return;
    if (isPendingTransitionRef.current) return;
    setCurrentState(initialState);
    currentStateRef.current = initialState;
  }, [initialState, enabledStates]);

  // Migrate `currentState` when the host swaps `enabledStates` and the current
  // one is no longer enabled (else the sheet sticks in the old scenario's
  // chrome). Prefer the host's `initialState`, else the smallest enabled state.
  useEffect(() => {
    if (enabledStates.includes(currentStateRef.current)) return;
    const next = enabledStates.includes(initialState) ? initialState : (enabledStates[0] ?? "default");
    setCurrentState(next);
    currentStateRef.current = next;
  }, [enabledStates, initialState]);

  const heightBounds = useMemo(() => {
    const first = enabledStatesByHeight[0];
    const last = enabledStatesByHeight[enabledStatesByHeight.length - 1];
    return {
      min: first ? stateToPx(first) - 60 : 0,
      max: last ? stateToPx(last) : containerHeight,
    };
  }, [enabledStatesByHeight, stateToPx, containerHeight]);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const transitionTo = useCallback(
    (next: DynamicSheetState) => {
      if (!enabledStates.includes(next) || isPendingTransitionRef.current || currentStateRef.current === next) return;

      isPendingTransitionRef.current = true;
      setTransientHeightPx(null);
      setCurrentState(next);
      currentStateRef.current = next;
      onStateChange?.(next);
      setTimeout(() => {
        isPendingTransitionRef.current = false;
      }, 100);
    },
    [enabledStates, onStateChange]
  );

  useEffect(() => {
    if (!autoAdvance?.length) return;

    const rule = autoAdvance.find((r) => r.from === currentState && enabledStates.includes(r.to));
    if (!rule) return;

    const { from, to, delayMs = 3000 } = rule;
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (currentStateRef.current === from) transitionTo(to);
    }, delayMs);
    return clearAutoAdvanceTimer;
  }, [currentState, enabledStates, autoAdvance, transitionTo, clearAutoAdvanceTimer]);

  const handleDragStart = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disableDragAndSwipe || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      pointerDownTimestampRef.current = now;
      holdActivatedRef.current = false;
      dragTracking.current = {
        initialY: e.clientY,
        initialHeightPx: stateToPx(currentStateRef.current),
        lastY: e.clientY,
        lastTimestamp: now,
        flickVelocity: 0,
        hasMoved: false,
      };

      if (
        currentStateRef.current === "default" &&
        enabledStates.includes("default-active") &&
        !isPendingTransitionRef.current
      ) {
        holdTimerRef.current = setTimeout(() => {
          if (currentStateRef.current === "default" && !dragTracking.current.hasMoved) {
            clearAutoAdvanceTimer();
            transitionTo("default-active");
            holdActivatedRef.current = true;
            dragTracking.current.initialHeightPx = stateToPx("default-active");
            dragTracking.current.initialY = dragTracking.current.lastY;
          }
        }, HOLD_DURATION_MS);
      }

      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disableDragAndSwipe, stateToPx, enabledStates, transitionTo, clearAutoAdvanceTimer]
  );

  useEffect(() => {
    if (!isDragging) return;
    const dt = dragTracking.current;

    const onPointerMove = (e: PointerEvent) => {
      const now = Date.now();
      const elapsed = now - dt.lastTimestamp;
      if (elapsed > 0) dt.flickVelocity = ((dt.lastY - e.clientY) / elapsed) * 1000;
      dt.lastY = e.clientY;
      dt.lastTimestamp = now;

      const delta = dt.initialY - e.clientY;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX || now - pointerDownTimestampRef.current > DRAG_TIME_THRESHOLD_MS) {
        if (!holdActivatedRef.current) {
          dt.hasMoved = true;
          clearHoldTimer();
          clearAutoAdvanceTimer();
        } else if (Math.abs(delta) > DRAG_THRESHOLD_PX * 2) {
          dt.hasMoved = true;
        }
      }

      const newHeightPx = clamp(dt.initialHeightPx + delta, heightBounds.min, heightBounds.max);
      setTransientHeightPx(newHeightPx);

      // Mid-drag proximity snap. Skipped under `commitOnDragEnd` so hosts that
      // swap layout per state don't flicker while the user crosses snap points;
      // the final `findNearestSnapState` on pointerup decides the state instead.
      if (!commitOnDragEnd) {
        const nearestState = findNearestSnapState(newHeightPx, 0, enabledStates, stateToPx);
        const nearestPx = stateToPx(nearestState);
        if (Math.abs(newHeightPx - nearestPx) < SNAP_PROXIMITY_PX && nearestState !== currentStateRef.current) {
          currentStateRef.current = nearestState;
          setCurrentState(nearestState);
          onStateChange?.(nearestState);
          dt.initialHeightPx = nearestPx;
          dt.initialY = e.clientY;
        }
      }
    };

    const onPointerEnd = () => {
      const isClick = Date.now() - pointerDownTimestampRef.current < CLICK_MAX_DURATION_MS;
      clearHoldTimer();
      setIsDragging(false);

      if (isClick && !dt.hasMoved) {
        clearAutoAdvanceTimer();
        const state = currentStateRef.current;
        if (
          (state === "default" || state === "default-active" || state === "expand-view") &&
          enabledStates.includes("panel-view")
        ) {
          isPendingTransitionRef.current = false;
          transitionTo("panel-view");
          return;
        }
        setTransientHeightPx(null);
        return;
      }

      if (dt.hasMoved) {
        const isSwipingDown = dt.initialY - dt.lastY < 0;
        if (isSwipingDown) {
          // Step-down targets are computed against the height-sorted
          // view so they work regardless of how the consumer ordered
          // `enabledStates` in its config (some scenarios list the
          // tallest state first).
          const sortedIndex = enabledStatesByHeight.indexOf(currentStateRef.current);
          if (sortedIndex === 0) {
            setTransientHeightPx(null);
            onRequestClose?.();
            return;
          }
          const target = stepByStepSwipeDown ? enabledStatesByHeight[sortedIndex - 1] : enabledStatesByHeight[0];
          isPendingTransitionRef.current = false;
          if (target && target !== currentStateRef.current) {
            transitionTo(target);
          } else {
            setTransientHeightPx(null);
          }
        } else {
          // Swiping up: snap to nearest by default; with `stepByStepSwipeUp`,
          // advance exactly one state so a long drag can't skip the intended stop.
          let target: DynamicSheetState;
          if (stepByStepSwipeUp) {
            // Step along canonical order, not `enabledStatesByHeight`: mid-drag
            // the host layout hasn't switched, so `100%` resolves small and can
            // tie with expand-view's auto height, mis-ordering the chain.
            const canonicalIndex = enabledStates.indexOf(currentStateRef.current);
            target = enabledStates[canonicalIndex + 1] ?? currentStateRef.current;
          } else {
            const finalPx = dt.initialHeightPx + (dt.initialY - dt.lastY);
            target = findNearestSnapState(finalPx, dt.flickVelocity, enabledStates, stateToPx);
          }
          isPendingTransitionRef.current = false;
          if (target === currentStateRef.current) {
            setTransientHeightPx(null);
          } else {
            transitionTo(target);
          }
        }
      } else {
        setTransientHeightPx(null);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [
    isDragging,
    heightBounds,
    enabledStates,
    enabledStatesByHeight,
    stateToPx,
    transitionTo,
    onStateChange,
    stepByStepSwipeDown,
    onRequestClose,
    clearHoldTimer,
    clearAutoAdvanceTimer,
  ]);

  return {
    currentState,
    isDragging,
    transientHeightPx,
    handleDragStart,
    stateToPx,
    transitionTo,
  };
}
