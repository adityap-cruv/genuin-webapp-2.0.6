"use client";

import { MuteButtonView, type PlayerControlSize } from "@genuin/ui/player-controls";
import React from "react";

import { assetLink } from "@cxr/config";
import { usePlayer } from "@cxr/providers/PlayerProvider";

export interface MuteUnmuteButtonV2Props {
  /** true=muted (show mute icon), false=unmuted (show unmute icon). */
  isMuted: boolean;
  /** Toggle handler (typically VideoLayout's `onMuteClick`). */
  onClick?: () => void;
  /** Animated gradient ring while muted (`cxr-animated-border`). */
  animatedBorder?: boolean;
  /** V2 double-circle size token. @default "lg" */
  size?: PlayerControlSize;
  /** Show hover-to-reveal volume slider. Set false in narrow contexts. @default true */
  enableVolumeSlider?: boolean;
  /** Cycle the "Tap to unmute" pill while muted. Set false in narrow rails. @default true */
  shouldAnimate?: boolean;
  /** Collapse the "Tap to unmute" text — set while the cursor is in the control bar. */
  suppressText?: boolean;
}

/** Returns true on touch devices — disables hover volume slider. */
function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;
}

/** CXR V2 mute adapter. Feeds PlayerProvider state into MuteButtonView with CXR's SVG icons. */
export function MuteUnmuteButtonV2({
  isMuted,
  onClick,
  animatedBorder = false,
  size = "lg",
  enableVolumeSlider = true,
  shouldAnimate = true,
  suppressText = false,
}: MuteUnmuteButtonV2Props): React.JSX.Element {
  const { volume, setVolume, setMuted } = usePlayer();

  // MuteButtonView's slider speaks 0–100; CXR's PlayerProvider speaks 0–1. Convert here.
  const handleVolumeChange = (newVolume: number) => {
    const next = newVolume / 100;
    setVolume(next);
    if (isMuted && next > 0) setMuted(false);
    if (next === 0) setMuted(true);
  };

  return (
    <MuteButtonView
      muted={isMuted}
      volume={Math.round(volume * 100)}
      onToggleMuted={() => onClick?.()}
      onVolumeChange={handleVolumeChange}
      muteIcon={<img src={`${assetLink}reactions/iheartmedia/cxr/mute.svg`} alt="Unmute" />}
      unmuteIcon={<img src={`${assetLink}reactions/iheartmedia/cxr/unmute.svg`} alt="Mute" />}
      shouldAnimate={shouldAnimate}
      once
      suppressText={suppressText}
      enableVolumeSlider={enableVolumeSlider}
      isMobile={isCoarsePointer()}
      size={size}
      testId="mute-btn"
      ariaLabel={isMuted ? "Unmute" : "Mute"}
      className={animatedBorder && isMuted ? "cxr-animated-border" : undefined}
    />
  );
}
