"use client";

import { IconCircleButton, type PlayerControlSize } from "@genuin/ui/player-controls";
import React from "react";

import { assetLink } from "@cxr/config";

export interface ExpandCollapseButtonV2Props {
  /** true=fullscreen (show collapse icon), false=show expand icon. */
  isFullScreen: boolean;
  /** Toggle handler (typically VideoLayout's `onFullScreenClick`). */
  onClick?: () => void;
  /** V2 double-circle size token. @default "lg" */
  size?: PlayerControlSize;
}

/**
 * CXR Design System V2 expand/collapse adapter.
 *
 * Wraps the shared `IconCircleButton` double-circle shell with CXR's own
 * `assetLink` expand/shrink SVG. `data-testid` flips between "topbar-expand"
 * and "topbar-collapse" to match the legacy button's test IDs.
 */
export function ExpandCollapseButtonV2({
  isFullScreen,
  onClick,
  size = "lg",
}: ExpandCollapseButtonV2Props): React.JSX.Element {
  const src = `${assetLink}reactions/iheartmedia/cxr/${isFullScreen ? "shrink" : "expand"}.svg`;
  const label = isFullScreen ? "Collapse" : "Expand";

  return (
    <IconCircleButton
      size={size}
      role="button"
      aria-label={label}
      data-testid={isFullScreen ? "topbar-collapse" : "topbar-expand"}
      className="gencl:cursor-pointer"
      onClick={(e) => {
        // Stop bubbling to the ad-layout onClick (handleAdClick) which fires the SDK CTA.
        e.stopPropagation();
        onClick?.();
      }}
      icon={<img src={src} alt={label} />}
    />
  );
}
