"use client";
import React, { useState } from "react";

import type { TopBarSubProps } from "@cxr/controls/control-layer.types";
import { resolveCxrControlSize } from "@cxr/controls/control-size";
import { useNewPlayerControls } from "@cxr/controls/useNewPlayerControls";

import { ExpandCollapseButton } from "../buttons/atoms/ExpandCollapseButton";
import { ExpandCollapseButtonV2 } from "../buttons/atoms/ExpandCollapseButtonV2";
import { MuteUnmuteButton } from "../buttons/atoms/MuteUnmuteButton";
import { MuteUnmuteButtonV2 } from "../buttons/atoms/MuteUnmuteButtonV2";
import { PlayPauseButton } from "../buttons/atoms/PlayPauseButton";
import { PlayPauseButtonV2 } from "../buttons/atoms/PlayPauseButtonV2";

/**
 * V1: mute+play top-left, expand top-right. V2: all three clustered top-right.
 * iHeart: expand only (mute+play live in the bottom bar).
 */
export function DefaultTopBar({
  variant,
  isFullScreen,
  isMuted,
  isPlay,
  isActive = true,
  onMuteClick,
  onPlayClick,
  onFullScreenClick,
}: TopBarSubProps): React.JSX.Element {
  const isIheart = variant === "iheart";
  const isV2 = useNewPlayerControls();
  const [rightHovered, setRightHovered] = useState(false);
  // No adLayout here — topbar never appears in compact banners; fallback row is correct.
  const v2Size = resolveCxrControlSize(undefined, isFullScreen);

  function stopProp(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div
      data-testid="default-top-bar"
      className="gencl:absolute gencl:top-0 gencl:left-0 gencl:w-full gencl:flex gencl:items-center gencl:justify-between gencl:px-[15px] gencl:py-[10px]">
      {/* Left: V1 mute+play. Empty in V2 (all controls moved to right cluster). */}
      <div
        data-testid="topbar-left-group"
        onClick={stopProp}
        className="gencl:flex gencl:items-center gencl:gap-2 gencl:z-[10]">
        {!isIheart && !isV2 && (
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
      {/* Right: iHeart always V1 expand. Non-iHeart: V2 = mute+play+expand, V1 = expand only. */}
      <div
        data-testid="topbar-right-group"
        onClick={stopProp}
        onMouseEnter={() => setRightHovered(true)}
        onMouseLeave={() => setRightHovered(false)}
        className="gencl:flex gencl:items-center gencl:gap-2 gencl:z-[10]">
        {isIheart || !isV2 ? (
          <ExpandCollapseButton
            isFullScreen={isFullScreen}
            onClick={onFullScreenClick}
            size={isFullScreen ? "xl" : "lg"}
          />
        ) : (
          <>
            <MuteUnmuteButtonV2
              isMuted={isMuted}
              onClick={onMuteClick}
              size={v2Size}
              suppressText={rightHovered}
              shouldAnimate={isActive}
            />
            <PlayPauseButtonV2
              isPlay={isPlay}
              onClick={onPlayClick}
              size={v2Size}
              suppressText={rightHovered}
              shouldAnimate={isFullScreen && isActive}
            />
            <ExpandCollapseButtonV2 isFullScreen={isFullScreen} onClick={onFullScreenClick} size={v2Size} />
          </>
        )}
      </div>
    </div>
  );
}
