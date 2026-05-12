import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { useCallback, useEffect, useRef } from "react";

import type { UseSheetStateReturn } from "@genuin/components/hooks/use-sheet-state";

/**
 * State priority for detecting downward swipes on Octo sheet
 */
const OCTO_STATE_PRIORITY: Record<DynamicSheetState, number> = {
  default: 0,
  "default-active": 1,
  "expand-view": 2,
  "panel-view": 3,
  "full-view": 4,
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

  /**
   * Handles expand request from GenAI SDK when agent response is ready.
   * Transitions from default/default-active/expand-view to panel-view.
   */
  const handleOctoExpandRequest = useCallback(() => {
    if (!enabled) return;

    if (octoSheetState === "panel-view" || octoSheetState === "full-view") {
      return;
    }

    setOctoHidden(false);
    // Go directly to panel-view when agent response is ready
    setContentTypeState("octo", "panel-view");
  }, [enabled, octoSheetState, setContentTypeState]);

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
   * Handles thinking started event — fires once per session when agent starts generating.
   * Transitions from default/default-active to expand-view.
   */
  const handleOctoThinkingStarted = useCallback(() => {
    if (!enabled) return;

    setOctoHidden(false);
    if (octoSheetState === "default" || octoSheetState === "default-active") {
      setContentTypeState("octo", "expand-view");
    }
  }, [enabled, octoSheetState, setContentTypeState]);

  /**
   * @deprecated Use handleOctoThinkingStarted instead.
   */
  const handleOctoCompactExpand = handleOctoThinkingStarted;

  /**
   * Handles countdown active state changes from GenAI SDK.
   * Transitions between default and default-active states.
   */
  const handleOctoCountdownActive = useCallback(
    (active: boolean) => {
      if (!enabled) return;

      if (active) {
        setOctoHidden(false);
        // Transition to default-active when countdown starts
        if (octoSheetState === "default") {
          setContentTypeState("octo", "default-active");
        }
      } else {
        // Transition back to default when countdown is cancelled
        if (octoSheetState === "default-active") {
          setContentTypeState("octo", "default");
        }
      }
    },
    [enabled, octoSheetState, setContentTypeState]
  );

  /**
   * Handles error events from GenAI SDK.
   * Hides octo by resetting the sheet.
   */
  const handleOctoError = useCallback(() => {
    if (!enabled) return;

    prevOctoSheetStateRef.current = "default";
    resetSheet();
  }, [enabled, resetSheet]);

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
   */
  const handleOctoActionToggle = useCallback(() => {
    if (!enabled) return;

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
    handleOctoExpandRequest,
    handleOctoSheetStateChange,
    handleOctoSheetClose,
    handleOctoThinkingStarted,
    handleOctoCompactExpand,
    handleOctoCountdownActive,
    handleOctoError,
    handleOctoActionOpen,
    handleOctoActionToggle,
    /** Aliased to `isOctoHidden` to keep the public return shape stable for existing callers. */
    isOctoHidden: octoHidden,
    isOctoVisible,
  };
}
