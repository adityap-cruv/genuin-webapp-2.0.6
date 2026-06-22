import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { useCallback, useEffect, useRef, useState } from "react";

import type { PhaseView } from "./octo-phase-map";

/**
 * State priority for detecting downward swipes on the Octo sheet. A transition
 * from a higher priority to a lower one (while already open) is treated as a
 * user swipe-down and collapses the sheet.
 */
const OCTO_STATE_PRIORITY: Partial<Record<DynamicSheetState, number>> = {
  default: 0,
  "default-active": 1,
  "expand-view": 2,
  "panel-view": 3,
  "full-view": 4,
};

/** Options for {@link useOctoSheetState}. */
export interface UseOctoSheetStateOptions {
  /** Only the active reel drives the sheet; inactive reels stay collapsed. */
  isActive: boolean;
}

/** Reactive state + handlers returned by {@link useOctoSheetState}. */
export interface UseOctoSheetStateReturn {
  /** Current sheet state for the active reel. */
  octoSheetState: DynamicSheetState;
  /** When true, Octo is collapsed/hidden by the user and won't auto-expand. */
  octoHidden: boolean;
  /** Apply a lifecycle phase from the GenAI SDK. `null` phases are no-ops. */
  applyPhase: (view: PhaseView) => void;
  /** Handle a state change driven by a DynamicSheet drag interaction. */
  handleSheetStateChange: (next: DynamicSheetState) => void;
  /** Handle the sheet's close button / dismiss gesture. */
  handleClose: () => void;
  /** Toggle Octo visibility from an external action button. */
  handleActionToggle: () => void;
}

/**
 * Standalone Octo sheet-state machine for the contextual-reels widget.
 *
 * Replaces the webapp's `useSheetState` (which is backed by the shared
 * `baseEventBus` and tracks multiple content types). Here a single Octo sheet
 * is owned by one reel, so plain component state is sufficient — no global
 * event bus, no content-type registry.
 *
 * Mirrors the transition rules of the webapp's `useOctoSheetManagement`:
 * swipe-down collapses, lifecycle phases drive expansion, close hides until the
 * user re-opens.
 *
 * @param options - {@link UseOctoSheetStateOptions}
 * @returns {@link UseOctoSheetStateReturn}
 */
export function useOctoSheetState({ isActive }: UseOctoSheetStateOptions): UseOctoSheetStateReturn {
  const [octoSheetState, setOctoSheetState] = useState<DynamicSheetState>("default");
  const [octoHidden, setOctoHidden] = useState(false);

  // Previous state, used to distinguish a user swipe-down from a programmatic
  // (phase-driven) change.
  const prevStateRef = useRef<DynamicSheetState>("default");
  const wasActiveRef = useRef(false);

  // Reset tracking when this reel becomes active (a fresh open / video swap).
  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (isActive && !wasActive) {
      prevStateRef.current = "default";
      setOctoSheetState("default");
      setOctoHidden(false);
    }
  }, [isActive]);

  // Keep the swipe-detection ref coherent with external state updates.
  useEffect(() => {
    prevStateRef.current = octoSheetState;
  }, [octoSheetState]);

  const applyPhase = useCallback((view: PhaseView) => {
    if (!view.sheetState) return; // null = leave the sheet untouched (idle/error)
    setOctoHidden(false);
    prevStateRef.current = view.sheetState;
    setOctoSheetState(view.sheetState);
  }, []);

  const handleSheetStateChange = useCallback(
    (next: DynamicSheetState) => {
      if (!isActive) return;

      const prev = prevStateRef.current;
      prevStateRef.current = next;

      const prevPriority = OCTO_STATE_PRIORITY[prev] ?? 0;
      const nextPriority = OCTO_STATE_PRIORITY[next] ?? 0;

      // User swiped down from an expanded state → collapse back to default.
      if (prevPriority > nextPriority && prev !== "default") {
        prevStateRef.current = "default";
        setOctoSheetState("default");
        return;
      }

      setOctoSheetState(next);
    },
    [isActive]
  );

  const handleClose = useCallback(() => {
    prevStateRef.current = "default";
    setOctoHidden(true);
    setOctoSheetState("default");
  }, []);

  const handleActionToggle = useCallback(() => {
    setOctoHidden((hidden) => {
      prevStateRef.current = "default";
      if (!hidden) {
        // Was visible → hide and collapse.
        setOctoSheetState("default");
      }
      return !hidden;
    });
  }, []);

  return {
    octoSheetState,
    octoHidden,
    applyPhase,
    handleSheetStateChange,
    handleClose,
    handleActionToggle,
  };
}
