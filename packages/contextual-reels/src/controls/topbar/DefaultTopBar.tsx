"use client";
import React from "react";

import type { TopBarSubProps } from "@cxr/controls/control-layer.types";

import { ExpandCollapseButton } from "../buttons/atoms/ExpandCollapseButton";
import { MuteUnmuteButton } from "../buttons/atoms/MuteUnmuteButton";
import { PlayPauseButton } from "../buttons/atoms/PlayPauseButton";

/**
 * TopBar — variant-based icon visibility.
 *
 * `default`: mute + play grouped left, expand/collapse on right.
 * `iheart`: only expand/collapse on right — mute/play live in the bottom bar.
 */
export function DefaultTopBar({
  variant,
  isFullScreen,
  isMuted,
  isPlay,
  onMuteClick,
  onPlayClick,
  onFullScreenClick,
}: TopBarSubProps): React.JSX.Element {
  const isIheart = variant === "iheart";

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      data-testid="default-top-bar"
      className="gencl:absolute gencl:top-0 gencl:left-0 gencl:w-full gencl:flex gencl:items-center gencl:justify-between gencl:px-[15px] gencl:py-[10px]">
      <div
        data-testid="topbar-left-group"
        onClick={stopProp}
        className="gencl:flex gencl:items-center gencl:gap-2 gencl:z-[10]">
        {!isIheart && (
          <>
            {/* Outer (non-fullscreen) view always shows the unmuted icon even
                though the player is silent at volume 0; only the expanded view
                reflects the real mute state. */}
            <MuteUnmuteButton
              isMuted={isFullScreen ? isMuted : false}
              onClick={onMuteClick}
              size={isFullScreen ? "xl" : "lg"}
            />
            <PlayPauseButton isPlay={isPlay} onClick={onPlayClick} size={isFullScreen ? "xl" : "lg"} />
          </>
        )}
      </div>
      <div
        data-testid="topbar-right-group"
        onClick={stopProp}
        className="gencl:flex gencl:items-center gencl:gap-2 gencl:z-[10]">
        <ExpandCollapseButton
          isFullScreen={isFullScreen}
          onClick={onFullScreenClick}
          size={isFullScreen ? "xl" : "lg"}
        />
      </div>
    </div>
  );
}
