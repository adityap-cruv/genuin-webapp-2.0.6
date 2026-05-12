"use client";
import { forwardRef, Suspense, useImperativeHandle } from "react";

import { OctoDynamicSheet } from "../expand-view/octo-dynamic-sheet";

import { useOctoExpandSheet } from "./use-octo-expand-sheet";

/** Imperative handle exposed to parent for action-button coordination. */
export type OctoExpandSheetRef = {
  /**
   * Call before opening the sheet via an action button.
   * Resets internal state-tracking so swipe detection starts clean.
   */
  onActionOpen: () => void;
  /**
   * Toggles Octo visibility. If currently visible, hides it and closes the
   * sheet. If currently hidden, shows it and opens via the action flow.
   */
  onActionToggle: () => void;
};

type OctoExpandSheetProps = {
  isActive: boolean;
  videoId: string;
  videoSlug: string;
  isMobile: boolean;
  viewportHeight: number;
};

/**
 * Self-contained Octo expand sheet.
 *
 * Owns all state via `useOctoExpandSheet` internally. Consumers only supply
 * the five minimal props required to identify the current video/viewport and
 * an optional `onStateChange` callback to receive derived state updates.
 *
 * The imperative `onActionOpen` / `onActionToggle` handle is still available
 * via ref for action-button coordination.
 */
export const OctoExpandSheet = forwardRef<OctoExpandSheetRef, OctoExpandSheetProps>(function OctoExpandSheet(
  { isActive, videoId, videoSlug, isMobile, viewportHeight },
  ref
) {
  const {
    isOctoEnabled,
    shouldShowOcto,
    octoSheetState,
    octoRenderMode,
    isOctoHidden,
    handleOctoSheetStateChange,
    handleOctoSheetClose,
    handleOctoExpandRequest,
    handleOctoThinkingStarted,
    handleOctoCountdownActive,
    handleOctoError,
    handleOctoActionOpen,
    handleOctoActionToggle,
  } = useOctoExpandSheet({ isActive });

  useImperativeHandle(ref, () => ({ onActionOpen: handleOctoActionOpen, onActionToggle: handleOctoActionToggle }), [
    handleOctoActionOpen,
    handleOctoActionToggle,
  ]);

  if (!isOctoEnabled || !isActive || !shouldShowOcto) return null;

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full swiper-no-swiping" onClick={(e) => e.stopPropagation()}>
      <Suspense fallback={null}>
        <div>
          <OctoDynamicSheet
            key={videoId}
            isOpen={isActive && !isOctoHidden}
            videoId={videoId}
            videoSlug={videoSlug}
            octoSheetState={octoSheetState ?? "default"}
            isMobile={isMobile}
            viewportHeight={viewportHeight}
            octoRenderMode={octoRenderMode}
            variant="embed"
            onStateChange={handleOctoSheetStateChange}
            onClose={handleOctoSheetClose}
            onExpandRequest={handleOctoExpandRequest}
            onThinkingStarted={handleOctoThinkingStarted}
            onCountdownActive={handleOctoCountdownActive}
            onError={handleOctoError}
          />
        </div>
      </Suspense>
    </div>
  );
});
