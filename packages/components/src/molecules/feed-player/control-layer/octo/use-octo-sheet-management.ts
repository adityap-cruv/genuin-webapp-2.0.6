import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { useCallback, useEffect, useRef } from "react";

const TOGGLE_DEBOUNCE_MS = 400;

import type { UseSheetStateReturn } from "@genuin/components/hooks/use-sheet-state";

import type { PhaseView } from "./octo-phase-map";

/**
 * State priority for detecting downward swipes on Octo sheet
 */
const OCTO_STATE_PRIORITY: Record<DynamicSheetState, number> = {
  // Linkout chip states sit below `default` (chips never count as
  // "more expanded" than other open content types).
  "pl-xs": -2,
  "pl-sml": -1,
  default: 0,
  "default-active": 1,
  "expand-view": 2,
  "panel-view": 3,
  "full-view": 4,
  // `responsive` is the most-expanded surface a linkout can occupy.
  responsive: 5,
};

type UseOctoSheetManagementProps = {
  enabled?: boolean;
  isActive: boolean;
  isOctoEnabled: boolean;
  shouldShowOcto: boolean;
  octoSheetState: DynamicSheetState;
  setContentTypeState: UseSheetStateReturn["setContentTypeState"];
  resetSheet: UseSheetStateReturn["resetSheet"];
  /** Global octo-hidden flag read from the event bus via `useSheetState`. */
  octoHidden: boolean;
  /** Setter that writes `octoHidden` back to the event bus. */
  setOctoHidden: (hidden: boolean) => void;
  /** Setter that writes `octoVisible` back to the event bus so consumers can read it. */
  setOctoVisible: (visible: boolean) => void;
  variant?: "expand" | "embed";
};

/**
 * Custom hook to manage Octo sheet state transitions and user interactions.
 * Handles sheet opening/closing, state changes, and swipe gestures.
 *
 * @param props - Configuration for Octo sheet management
 * @returns Handlers for Octo sheet events and derived visibility state
 */
export function useOctoSheetManagement({
  enabled = true,
  isActive,
  isOctoEnabled,
  shouldShowOcto,
  octoSheetState,
  setContentTypeState,
  resetSheet,
  octoHidden,
  setOctoHidden,
  setOctoVisible,
  variant = "expand",
}: UseOctoSheetManagementProps) {
  const prevOctoSheetStateRef = useRef<DynamicSheetState>(octoSheetState);
  const isSheetOpenRef = useRef(false);
  const toggleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Track when sheet opens/closes to distinguish between video transitions and user swipes.
   * Resets tracking when sheet opens fresh (new video or reopening).
   */
  useEffect(() => {
    if (!enabled) return;

    const isOpen = isActive;
    const wasOpen = isSheetOpenRef.current;
    isSheetOpenRef.current = isOpen;

    // Reset ref when sheet opens fresh (new video or reopening)
    if (isOpen && !wasOpen) {
      prevOctoSheetStateRef.current = "default";
    }
  }, [enabled, isActive]);

  // Clear pending debounce on unmount to avoid stale state updates.
  useEffect(() => {
    return () => {
      if (toggleDebounceRef.current) clearTimeout(toggleDebounceRef.current);
    };
  }, []);

  /**
   * Handles Octo sheet state changes from DynamicSheet drag interactions.
   * Detects downward swipes and closes the sheet accordingly.
   */
  const handleOctoSheetStateChange = useCallback(
    (next: DynamicSheetState) => {
      if (!enabled) return;

      // Only process state changes for the active video
      if (!isActive) {
        return;
      }

      // Check if the sheet was not previously tracked as open
      // This indicates the sheet is freshly opening (first state change after open)
      // In this case, skip swipe-down detection to prevent false positives
      const wasSheetTrackedAsOpen = isSheetOpenRef.current;

      const prev = prevOctoSheetStateRef.current;
      prevOctoSheetStateRef.current = next;

      // Get priorities for prev and next states
      const prevPriority = OCTO_STATE_PRIORITY[prev] || 0;
      const nextPriority = OCTO_STATE_PRIORITY[next] || 0;

      // Close sheet when user swipes down (going from higher state to lower state)
      // Only treat as user swipe-down if:
      // 1. We're actually going down from a higher state
      // 2. It's not the initial open (which also triggers with "default")
      // 3. The sheet was already tracked as open (not a fresh open where ref might be stale)
      if (prevPriority > nextPriority && prev !== "default" && wasSheetTrackedAsOpen) {
        prevOctoSheetStateRef.current = "default";
        // if (variant === "embed") {
        //   // Embed variant: go back to default (keep octo visible at compact height)
        //   setContentTypeState("octo", "default");
        // } else {
        //   resetSheet();
        // }
        setContentTypeState("octo", "default");
        resetSheet();
        return;
      }

      setContentTypeState("octo", next);
    },
    [enabled, resetSheet, setContentTypeState, isActive, variant]
  );

  /**
   * Keep ref in sync with external state changes.
   */
  useEffect(() => {
    if (!enabled) return;
    prevOctoSheetStateRef.current = octoSheetState;
  }, [enabled, octoSheetState]);

  /**
   * Handles close from DynamicSheet (close button or dismiss).
   * Resets the sheet to default state and hides the Octo widget.
   */
  const handleOctoSheetClose = useCallback(() => {
    if (!enabled) return;

    prevOctoSheetStateRef.current = "default";
    setOctoHidden(true);
    setContentTypeState("octo", "default");
    resetSheet();
  }, [enabled, setContentTypeState, resetSheet]);

  /**
   * Collapses the Octo sheet back to its default (compact) state without hiding it.
   *
   * Used when the GenAI SDK reports the `collapsed` phase (chat closed / post-close
   * idle). Unlike `applyPhase`, this bypasses the expand-only ratchet so a close
   * genuinely returns the sheet to `default`, and unlike `handleOctoSheetClose` it
   * keeps Octo visible (no `octoHidden`) so the compact widget stays on screen.
   */
  const handleOctoCollapse = useCallback(() => {
    if (!enabled) return;

    prevOctoSheetStateRef.current = "default";
    setOctoHidden(false);
    setContentTypeState("octo", "default");
  }, [enabled, setContentTypeState, setOctoHidden]);

  /**
   * Single reducer for the Octo lifecycle. Applies a PhaseView (from the phase map)
   * to the sheet. Replaces the per-event handlers (expand/thinking/countdown/error/auto-close).
   * Never hides Octo — null sheetState means leave the sheet untouched (idle/error phases).
   * Never switches the active content type, so an open comments/linkouts sheet is never stolen.
   */
  const applyPhase = useCallback(
    (view: PhaseView) => {
      if (!enabled) return;
      if (!view.sheetState) return; // null = leave the sheet untouched (idle/error)

      // Ratchet: a lifecycle phase may only expand the sheet, never shrink it.
      // Once the user is in a larger view (e.g. panel-view), a later lower-priority
      // phase (thinking → expand-view, collapsed → default) must not auto-collapse it.
      // Only explicit user actions (swipe-down, close) reduce the sheet.
      const current = prevOctoSheetStateRef.current;
      const currentPriority = OCTO_STATE_PRIORITY[current] ?? 0;
      const nextPriority = OCTO_STATE_PRIORITY[view.sheetState] ?? 0;
      if (nextPriority < currentPriority) {
        setOctoHidden(false);
        return;
      }

      setOctoHidden(false);
      prevOctoSheetStateRef.current = view.sheetState; // keep swipe-detection coherent
      setContentTypeState("octo", view.sheetState);
    },
    [enabled, setContentTypeState, setOctoHidden]
  );

  /**
   * Resets ref and shows Octo when action button is used to open the sheet.
   */
  const handleOctoActionOpen = useCallback(() => {
    if (!enabled) return;

    setOctoHidden(false);
    prevOctoSheetStateRef.current = "default";
  }, [enabled]);

  /**
   * Toggles Octo visibility via the action button.
   * If currently hidden, shows it and resets tracking. If visible, hides it and closes the sheet.
   * Debounced to prevent flicker and duplicate inits on rapid taps.
   */
  const handleOctoActionToggle = useCallback(() => {
    if (!enabled) return;

    if (toggleDebounceRef.current) return;

    toggleDebounceRef.current = setTimeout(() => {
      toggleDebounceRef.current = null;
    }, TOGGLE_DEBOUNCE_MS);

    if (octoHidden) {
      setOctoHidden(false);
      prevOctoSheetStateRef.current = "default";
    } else {
      setOctoHidden(true);
      prevOctoSheetStateRef.current = "default";
      setContentTypeState("octo", "default");
      resetSheet();
    }
  }, [enabled, octoHidden, setContentTypeState, resetSheet]);

  /** True when Octo should be rendered and visible to the user. */
  const isOctoVisible = isOctoEnabled && isActive && shouldShowOcto && !octoHidden;

  useEffect(() => {
    setOctoVisible(isOctoVisible);
  }, [isOctoVisible, setOctoVisible]);

  return {
    applyPhase,
    handleOctoCollapse,
    handleOctoSheetStateChange,
    handleOctoSheetClose,
    handleOctoActionOpen,
    handleOctoActionToggle,
    /** Aliased to `isOctoHidden` to keep the public return shape stable for existing callers. */
    isOctoHidden: octoHidden,
    isOctoVisible,
  };
}
