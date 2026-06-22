import { DynamicSheet } from "@genuin/ui";
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import type { ComponentProps, RefObject } from "react";

import { OctoPanel } from "@genuin/components/molecules/octo-panel";
import { getOctoSheetConfig } from "@genuin/components/molecules/octo-panel/octo-sheet-config";

import { MOBILE_PHASE_MAP, DESKTOP_PHASE_MAP, type OctoPhase, type PhaseView } from "../octo/octo-phase-map";

type OctoDynamicSheetProps = {
  /**
   * Whether the sheet is open
   */
  isOpen: boolean;
  /**
   * Current video ID for OctoPanel
   */
  videoId: string;
  /**
   * Current video slug for OctoPanel
   */
  videoSlug: string;
  /**
   * Controlled sheet state
   */
  octoSheetState: DynamicSheetState;
  /**
   * Whether on mobile/tablet (< 1024px)
   */
  isMobile: boolean;
  /**
   * Render mode for OctoPanel
   */
  octoRenderMode: "compact" | "full";

  variant?: "expand" | "embed";
  /**
   * Optional container ref used to compute %-based heights (e.g. panel-view 70%)
   * against the current slide/control-layer dimensions.
   */
  containerRef?: RefObject<HTMLDivElement | null>;
  /**
   * Handler for sheet state changes
   */
  onStateChange: (state: DynamicSheetState) => void;
  /**
   * Handler for sheet close
   */
  onClose: () => void;
  /**
   * Applies a lifecycle PhaseView to the sheet (mapped from the GenAI SDK's
   * single octo:lifecycle event upstream).
   */
  applyPhase: (view: PhaseView) => void;
  /**
   * Collapses the sheet back to `default` (without hiding Octo) when the SDK
   * reports the `collapsed` phase — i.e. the chat/panel was closed. Bypasses the
   * expand-only ratchet in `applyPhase` so a close genuinely resets the state.
   */
  onCollapse?: () => void;
  /**
   * Handler for swiper toggle
   */
  onSwiperToggle?: ComponentProps<typeof DynamicSheet>["onSwiperToggle"];
};

/**
 * OctoDynamicSheet Component
 *
 * A specialized wrapper around DynamicSheet that integrates OctoPanel.
 * This component is only loaded when Octo is enabled, reducing bundle size
 * and improving performance for embeds without AI features.
 *
 * Key Features:
 * - Lazy-loaded when Octo is enabled
 * - Manages Octo sheet configuration based on viewport
 * - Handles all Octo-specific event handlers
 * - Prevents video swiping when sheet is in certain states
 *
 * @example
 * ```tsx
 * <OctoDynamicSheet
 *   isOpen={isOpen && hasContentType("octo")}
 *   videoId={video.id}
 *   videoSlug={video.slug}
 *   octoSheetState={getContentTypeState("octo")}
 *   isMobile={!isDesktop}
 *   octoRenderMode="compact"
 *   onStateChange={handleOctoSheetStateChange}
 *   onClose={handleOctoSheetClose}
 *   // ... other handlers
 * />
 * ```
 */
export function OctoDynamicSheet({
  isOpen,
  videoId,
  videoSlug,
  octoSheetState,
  isMobile,
  octoRenderMode,
  variant = "expand",
  containerRef,
  onStateChange,
  onClose,
  applyPhase,
  onCollapse,
  onSwiperToggle,
}: OctoDynamicSheetProps) {
  // Get Octo sheet configuration based on current state and viewport
  const {
    config: octoConfig,
    className: octoClassName,
    footerClassName: octoFooterClassName,
  } = getOctoSheetConfig({
    isMobile,
    octoState: octoSheetState,
  });

  return (
    <DynamicSheet
      isOpen={isOpen}
      renderMode="inline"
      controlledState={octoSheetState}
      config={{
        ...octoConfig,
        onStateChange,
        onClose,
        disableDragAndSwipe: true,
        // preventCloseCollapse: true,
        // navTitle: octoSheetState !== "default" ? "Octo GPT" : undefined,
      }}
      className={octoClassName(octoSheetState)}
      contentClassName="gencl:bg-transparent"
      footerClassName={octoFooterClassName(octoSheetState)}
      headerClassName="gencl:text-body-1-semi-bold! gencl:p-2!">
      <OctoPanel
        videoId={videoId}
        videoSlug={videoSlug}
        variant="sheet"
        open={isOpen}
        panelClassName="gencl:h-full"
        renderMode={octoRenderMode}
        onClose={onClose}
        onLifecyclePhase={(detail) => {
          // `collapsed` = the chat/panel was closed → force the sheet back to
          // default (bypasses applyPhase's expand-only ratchet).
          if ((detail.phase as OctoPhase) === "collapsed" && onCollapse) {
            onCollapse();
            return;
          }
          // const map = isMobile ? MOBILE_PHASE_MAP : DESKTOP_PHASE_MAP;
          const map = MOBILE_PHASE_MAP;
          const view = map[detail.phase as OctoPhase];
          if (view) applyPhase(view);
        }}
      />
    </DynamicSheet>
  );
}
