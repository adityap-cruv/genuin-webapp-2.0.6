import { DynamicSheet } from "@genuin/ui";
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import type { ComponentProps, RefObject } from "react";

import { OctoPanel } from "@genuin/components/molecules/octo-panel";
import { getOctoSheetConfig } from "@genuin/components/molecules/octo-panel/octo-sheet-config";

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
   * Viewport height for sheet configuration
   */
  viewportHeight: number;
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
   * Handler for expand request from SDK
   */
  onExpandRequest: () => void;
  /**
   * @deprecated Use onThinkingStarted instead.
   */
  onCompactExpand?: () => void;
  /**
   * Handler for when the agent starts thinking (fires once per session).
   */
  onThinkingStarted?: () => void;
  /**
   * Handler for countdown active state
   */
  onCountdownActive: (isActive: boolean) => void;
  /**
   * Handler for GenAI SDK errors
   */
  onError?: () => void;
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
 *   viewportHeight={viewportHeight}
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
  viewportHeight,
  octoRenderMode,
  variant = "expand",
  containerRef,
  onStateChange,
  onClose,
  onExpandRequest,
  onCompactExpand,
  onThinkingStarted,
  onCountdownActive,
  onError,
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
    viewportHeight,
  });

  return (
    <DynamicSheet
      isOpen={isOpen}
      renderMode="container"
      controlledState={octoSheetState}
      config={{
        ...octoConfig,
        onStateChange,
        onClose,
        disableDragAndSwipe: variant === "embed",
        // preventCloseCollapse: true,
        // navTitle: octoSheetState !== "default" ? "Octo GPT" : undefined,
      }}
      className={octoClassName(octoSheetState)}
      contentClassName="gencl:bg-transparent"
      footerClassName={octoFooterClassName(octoSheetState)}
      headerClassName="gencl:text-body-1-semi-bold!">
      <OctoPanel
        videoId={videoId}
        videoSlug={videoSlug}
        variant="sheet"
        open={isOpen}
        panelClassName="gencl:h-full"
        renderMode={octoRenderMode}
        onExpandRequest={onExpandRequest}
        onCompactExpand={onCompactExpand}
        onThinkingStarted={onThinkingStarted}
        onCountdownActive={onCountdownActive}
        onError={onError}
        onClose={onClose}
      />
    </DynamicSheet>
  );
}
