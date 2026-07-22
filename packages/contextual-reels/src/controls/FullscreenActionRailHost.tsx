"use client";
import React from "react";

import { FullscreenActionRail } from "@cxr/controls/FullscreenActionRail";
import type { ControlLayerVariant } from "@cxr/controls/control-layer.types";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import type { NormalisedReel } from "@cxr/types";

/** 9:16 video-box width — kept in sync with Feed's `fullscreen-video-box` style. */
const FULLSCREEN_VIDEO_WIDTH = "min(100vw, calc(100vh * 9 / 16))";

/**
 * Anchors {@link FullscreenActionRail} at the feed backdrop level. Centralises
 * fullscreen control-rail logic so `Feed` stays a layout-only shell.
 *
 * Hidden while `isAdActive` (ads own their own overlay/CTA chrome), outside
 * fullscreen, or for the `iheart` variant (its controls live in the TopBar).
 * tagDetails is read from {@link useTagDetails}.
 */
export function FullscreenActionRailHost({
  variant,
  isFullScreen,
  isAdActive,
  item,
}: {
  variant?: ControlLayerVariant;
  isFullScreen: boolean;
  isAdActive: boolean;
  item?: NormalisedReel;
}): React.JSX.Element | null {
  const { tagDetails } = useTagDetails();

  if (!isFullScreen || isAdActive) return null;

  return (
    <div
      data-testid="fullscreen-action-rail-anchor"
      className="gencl:absolute gencl:bottom-2 gencl:z-[20]"
      style={{ left: `calc(50% + ${FULLSCREEN_VIDEO_WIDTH} / 2 + 12px)` }}>
      <FullscreenActionRail config={tagDetails?.config} variant={variant} item={item} />
    </div>
  );
}
