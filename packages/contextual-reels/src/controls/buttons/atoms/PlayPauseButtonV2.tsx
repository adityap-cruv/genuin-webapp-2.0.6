"use client";

import { PlayPauseButton, type PlayerControlSize } from "@genuin/ui/player-controls";
import React from "react";

import { assetLink } from "@cxr/config";

export interface PlayPauseButtonV2Props {
  /** true=playing (show pause icon), false=paused (show play icon). */
  isPlay?: boolean;
  /** Toggle handler (typically VideoLayout's `onPlayClick`). */
  onClick?: () => void;
  /** V2 double-circle size token. @default "lg" */
  size?: PlayerControlSize;
  /** Cycle the "Tap to play" pill while paused. Set false in narrow rails. @default true */
  shouldAnimate?: boolean;
  /** Collapse the "Tap to play" text — set while the cursor is in the control bar. */
  suppressText?: boolean;
}

/** CXR V2 play/pause adapter. Feeds play state into PlayPauseButton with CXR's SVG icons. */
export function PlayPauseButtonV2({
  isPlay = false,
  onClick,
  size = "lg",
  shouldAnimate = true,
  suppressText = false,
}: PlayPauseButtonV2Props): React.JSX.Element {
  return (
    <PlayPauseButton
      isPlaying={isPlay}
      onToggle={() => onClick?.()}
      playIcon={<img src={`${assetLink}reactions/iheartmedia/cxr/play.svg`} alt="Play" />}
      pauseIcon={<img src={`${assetLink}reactions/iheartmedia/cxr/pause.svg`} alt="Pause" />}
      shouldAnimate={shouldAnimate}
      once
      suppressText={suppressText}
      showAnimatedText={shouldAnimate && !isPlay}
      size={size}
      data-testid="play-pause-btn"
      role="button"
      aria-label={isPlay ? "Pause" : "Play"}
    />
  );
}
