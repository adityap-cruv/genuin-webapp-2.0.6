"use client";

import React from "react";

import { EVENT } from "@cxr/analytics/analytics";
import type { ClickOverlayProps } from "@cxr/controls/control-layer.types";
import { useEventBus } from "@cxr/instance/InstanceContext";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";

function stopProp(e: { stopPropagation(): void }): void {
  e.stopPropagation();
}

/**
 * Full-area transparent overlay that routes tap to the correct action.
 *
 * - isFullScreen=false, expandOnTap=false → unmute (default audible volume, user gesture) and
 *                                            resume playback if currently paused
 * - isFullScreen=false, expandOnTap=true  → onFullScreenClick (expand instead of unmuting)
 * - isFullScreen=true                     → onPlayClick (play/pause)
 *
 * Stops pointer/touch propagation to prevent scroll interference in embedded contexts.
 */
export function ClickOverlay({
  isFullScreen,
  onFullScreenClick,
  onPlayClick,
  containerId,
  expandOnTap = false,
}: ClickOverlayProps): React.JSX.Element {
  const { isMuted, setMuted, isPlaying, setPlaying } = usePlayer();
  const bus = useEventBus();
  const analytics = useAnalytics();
  function handleClick(e: React.MouseEvent<HTMLDivElement>): void {
    const target = e.target as Element;
    if (target.closest("a, button, img, [data-no-cta]")) return;
    if (isFullScreen) {
      onPlayClick();
    } else if (expandOnTap) {
      // 300x250 Octo overlay: tapping the bare video expands to fullscreen
      // instead of unmuting (audio stays as-is).
      onFullScreenClick();
    } else {
      // Unmute when the user clicks the video. This avoids iOS Safari autoplay
      // restrictions, where audio playback is blocked unless triggered through a
      // direct user interaction.
      //
      // Emit `ad:unmuteRequest` FIRST, synchronously within this click handler.
      // CxrEventBus.emit runs the consumer (useGenAdInstance) inline in this same
      // call stack, so the SDK volume+unmute fires inside the user-gesture window —
      // iOS Safari only honours it there (not from a deferred effect).
      // Only ad overlays carry a containerId; non-ad (video) overlays skip the emit.
      if (containerId) {
        bus.emit("ad:unmuteRequest", { containerId });
      }
      // Then update React/PlayerProvider state (and emit the `mute:unmuted`
      // bus event) so the rest of the app stays consistent. Only report the
      // Unmuted analytics event on a real state change — a tap while already
      // audible is a no-op.
      if (isMuted) {
        analytics.sendEvent(EVENT.VIDEO_UNMUTED, { by_user: true });
      }
      setMuted(false);
      // Muted + paused: a tap should resume playback too, not just unmute silently.
      if (!isPlaying) {
        setPlaying(true);
      }
    }
  }

  return (
    <div
      data-testid="click-overlay"
      onClick={handleClick}
      onPointerDown={stopProp}
      onPointerMove={stopProp}
      onTouchStart={stopProp}
      onTouchMove={stopProp}
      className="gencl:absolute gencl:inset-0 gencl:z-[1] gencl:bg-transparent"
    />
  );
}
