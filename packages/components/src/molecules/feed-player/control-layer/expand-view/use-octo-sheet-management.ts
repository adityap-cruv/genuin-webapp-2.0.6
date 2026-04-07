import { useCallback, useEffect, useRef } from "react";
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
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
  isActive: boolean;
  octoSheetState: DynamicSheetState;
  setContentTypeState: UseSheetStateReturn["setContentTypeState"];
  resetSheet: UseSheetStateReturn["resetSheet"];
  variant?: "expand" | "embed";
};

/**
 * Custom hook to manage Octo sheet state transitions and user interactions.
 * Handles sheet opening/closing, state changes, and swipe gestures.
 *
 * @param props - Configuration for Octo sheet management
 * @returns Handlers for Octo sheet events
 */
export function useOctoSheetManagement({
  isActive,
  octoSheetState,
  setContentTypeState,
  resetSheet,
  variant = "expand",
}: UseOctoSheetManagementProps) {
  const prevOctoSheetStateRef = useRef<DynamicSheetState>(octoSheetState);
  const isSheetOpenRef = useRef(false);

  /**
   * Handles expand request from GenAI SDK when agent response is ready.
   * Transitions from default/default-active/expand-view to panel-view.
   */
  const handleOctoExpandRequest = useCallback(() => {
    if (octoSheetState === "panel-view" || octoSheetState === "full-view") {
      return;
    }

    // Go directly to panel-view when agent response is ready
    setContentTypeState("octo", "panel-view");
  }, [octoSheetState, setContentTypeState]);

  /**
   * Track when sheet opens/closes to distinguish between video transitions and user swipes.
   * Resets tracking when sheet opens fresh (new video or reopening).
   */
  useEffect(() => {
    const isOpen = isActive;
    const wasOpen = isSheetOpenRef.current;
    isSheetOpenRef.current = isOpen;

    // Reset ref when sheet opens fresh (new video or reopening)
    if (isOpen && !wasOpen) {
      prevOctoSheetStateRef.current = "default";
    }
  }, [isActive]);

  /**
   * Handles Octo sheet state changes from DynamicSheet drag interactions.
   * Detects downward swipes and closes the sheet accordingly.
   */
  const handleOctoSheetStateChange = useCallback(
    (next: DynamicSheetState) => {
      console.log('[octo] handleOctoSheetStateChange:', next);
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
      if (
        prevPriority > nextPriority &&
        prev !== "default" &&
        wasSheetTrackedAsOpen
      ) {
        prevOctoSheetStateRef.current = "default";
        resetSheet();
        return;
      }

      setContentTypeState("octo", next);
    },
    [resetSheet, setContentTypeState, isActive]
  );

  /**
   * Keep ref in sync with external state changes.
   */
  useEffect(() => {
    prevOctoSheetStateRef.current = octoSheetState;
  }, [octoSheetState]);

  /**
   * Handles close from DynamicSheet (close button or dismiss).
   * For embed variant: go back to "default" state (sheet stays visible at compact height).
   * For expand variant: fully reset the sheet.
   */
  const handleOctoSheetClose = useCallback(() => {
    prevOctoSheetStateRef.current = "default";
    resetSheet();
  }, [resetSheet]);

  /**
   * Handles compact expand event when user sends message and agent starts thinking.
   * Transitions from default/default-active to expand-view.
   */
  const handleOctoCompactExpand = useCallback(() => {
    if (octoSheetState === "default" || octoSheetState === "default-active") {
      setContentTypeState("octo", "expand-view");
    }
  }, [octoSheetState, setContentTypeState]);

  /**
   * Handles countdown active state changes from GenAI SDK.
   * Transitions between default and default-active states.
   */
  const handleOctoCountdownActive = useCallback(
    (isActive: boolean) => {
      if (isActive) {
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
    [octoSheetState, setContentTypeState]
  );

  /**
   * Resets ref when Octo action is clicked to ensure proper state tracking.
   * Called before opening the sheet via action button.
   */
  const handleOctoActionOpen = useCallback(() => {
    prevOctoSheetStateRef.current = "default";
  }, []);

  return {
    handleOctoExpandRequest,
    handleOctoSheetStateChange,
    handleOctoSheetClose,
    handleOctoCompactExpand,
    handleOctoCountdownActive,
    handleOctoActionOpen,
  };
}
