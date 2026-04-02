import { DynamicSheet } from "@genuin/ui";
import type { DynamicSheetState } from "@genuin/ui/dynamic-sheet";
import { OctoPanel } from "@genuin/components/molecules/octo-panel";
import { getOctoSheetConfig } from "@genuin/components/molecules/octo-panel/octo-sheet-config";
import type { ComponentProps } from "react";

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
   * Handler for compact expand event
   */
  onCompactExpand: () => void;
  /**
   * Handler for countdown active state
   */
  onCountdownActive: (isActive: boolean) => void;
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
  onStateChange,
  onClose,
  onExpandRequest,
  onCompactExpand,
  onCountdownActive,
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
      renderMode="inline"
      controlledState={octoSheetState}
          config={{
        ...octoConfig,
        onStateChange,
        onClose,
      }}
      {...(onSwiperToggle && { onSwiperToggle })}
      className={octoClassName(octoSheetState)}
      contentClassName="gencl:bg-transparent"
      footerClassName={octoFooterClassName(octoSheetState)}
    >
      <OctoPanel
        videoId={videoId}
        videoSlug={videoSlug}
        variant="sheet"
        open={isOpen}
        panelClassName="gencl:h-full"
        renderMode={octoRenderMode}
        onExpandRequest={onExpandRequest}
        onCompactExpand={onCompactExpand}
        onCountdownActive={onCountdownActive}
      />
    </DynamicSheet>
  );
}
