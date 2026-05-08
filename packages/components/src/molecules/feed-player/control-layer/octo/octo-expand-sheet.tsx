"use client";
import { cn } from "@genuin/ui/utils";
import { forwardRef, Suspense, useCallback, useEffect, useImperativeHandle, useState } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";

import { OctoDynamicSheet } from "../expand-view/octo-dynamic-sheet";

import { useOctoSheetManagement } from "./use-octo-sheet-management";

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
  /** Called whenever the Octo sheet should block parent swipe gestures. */
  onSwipeBlockChange?: (blocked: boolean) => void;
  /** Called whenever Octo's rendered visibility changes. */
  onVisibilityChange?: (visible: boolean) => void;
};

/**
 * Self-contained Octo sheet for the expand view.
 *
 * Owns all Octo-specific state (visibility delay, hide-on-close, sheet state
 * transitions) and renders `OctoDynamicSheet` internally. The parent receives
 * no Octo state — only an imperative `onActionOpen` handle via ref.
 */
export const OctoExpandSheet = forwardRef<OctoExpandSheetRef, OctoExpandSheetProps>(function OctoExpandSheet(
  { isActive, videoId, videoSlug, isMobile, viewportHeight, onSwipeBlockChange, onVisibilityChange },
  ref
) {
  const { engagement } = useEmbedConfigs();
  const isOctoEnabled = engagement.engagementTools.octo;

  const { hasContentType, getContentTypeState, setContentTypeState, resetSheet } = useSheetState();
  const octoSheetState = getContentTypeState("octo");

  const isCompactOctoState =
    !octoSheetState ||
    octoSheetState === "default" ||
    octoSheetState === "default-active" ||
    octoSheetState === "expand-view";
  const octoRenderMode: "compact" | "full" = isCompactOctoState ? "compact" : "full";

  const isSwipeBlocked =
    hasContentType("octo") &&
    (octoSheetState === "default" || octoSheetState === "default-active" || octoSheetState === "expand-view");

  useEffect(() => {
    onSwipeBlockChange?.(isSwipeBlocked);
  }, [isSwipeBlocked, onSwipeBlockChange]);

  const {
    handleOctoExpandRequest,
    handleOctoSheetStateChange,
    handleOctoSheetClose,
    handleOctoThinkingStarted,
    handleOctoCountdownActive,
    handleOctoError,
    handleOctoActionOpen,
  } = useOctoSheetManagement({
    isActive,
    octoSheetState,
    setContentTypeState,
    resetSheet,
  });

  const [isOctoHidden, setIsOctoHidden] = useState(false);

  const handleOctoSheetCloseWithHide = useCallback(() => {
    setIsOctoHidden(true);
    handleOctoSheetClose();
  }, [handleOctoSheetClose]);

  const handleOctoThinkingStartedWithShow = useCallback(() => {
    setIsOctoHidden(false);
    handleOctoThinkingStarted();
  }, [handleOctoThinkingStarted]);

  const handleOctoCountdownActiveWithShow = useCallback(
    (active: boolean) => {
      if (active) setIsOctoHidden(false);
      handleOctoCountdownActive(active);
    },
    [handleOctoCountdownActive]
  );

  const handleOctoExpandRequestWithShow = useCallback(() => {
    setIsOctoHidden(false);
    handleOctoExpandRequest();
  }, [handleOctoExpandRequest]);

  // Delay Octo visibility by 5 s after the video becomes active.
  // Resets immediately on slide change so each active slide waits its own 5 s.
  const [shouldShowOcto, setShouldShowOcto] = useState(false);

  useEffect(() => {
    setShouldShowOcto(false);
    if (!isActive) return;
    const timer = setTimeout(() => setShouldShowOcto(true), 100);
    return () => {
      clearTimeout(timer);
      resetSheet();
    };
  }, [isActive, resetSheet]);

  const handleOctoActionToggle = useCallback(() => {
    if (isOctoHidden) {
      setIsOctoHidden(false);
      handleOctoActionOpen();
    } else {
      setIsOctoHidden(true);
      handleOctoSheetClose();
    }
  }, [isOctoHidden, handleOctoActionOpen, handleOctoSheetClose]);

  useImperativeHandle(ref, () => ({ onActionOpen: handleOctoActionOpen, onActionToggle: handleOctoActionToggle }), [
    handleOctoActionOpen,
    handleOctoActionToggle,
  ]);

  const isOctoVisible = isOctoEnabled && isActive && shouldShowOcto && !isOctoHidden;
  useEffect(() => {
    onVisibilityChange?.(isOctoVisible);
  }, [isOctoVisible, onVisibilityChange]);

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
            octoSheetState={octoSheetState}
            isMobile={isMobile}
            viewportHeight={viewportHeight}
            octoRenderMode={octoRenderMode}
            variant="embed"
            onStateChange={handleOctoSheetStateChange}
            onClose={handleOctoSheetCloseWithHide}
            onExpandRequest={handleOctoExpandRequestWithShow}
            onThinkingStarted={handleOctoThinkingStartedWithShow}
            onCountdownActive={handleOctoCountdownActiveWithShow}
            onError={handleOctoError}
          />
        </div>
      </Suspense>
    </div>
  );
});
