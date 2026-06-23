"use client";
import { MuteIcon, UnmuteIcon } from "@genuin/ui/icons";
import { MuteButtonView, type PlayerControlSize } from "@genuin/ui/player-controls";
import { useCallback } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

import { usePlayerContext } from "../../../context";

/** Webapp/SDK mute adapter. Feeds PlayerContext + BaseContext state into MuteButtonView. */
export const AnimatedMuteIcon = ({
  shouldAnimate,
  enableVolumeSlider = true,
  size: sizeProp = "md",
  suppressText = false,
}: {
  shouldAnimate: boolean;
  enableVolumeSlider?: boolean;
  size?: PlayerControlSize;
  /** Force the "Tap to unmute" text collapsed — set while the cursor is anywhere
   * in the control bar so the text can't reflow the row mid-interaction. */
  suppressText?: boolean;
}) => {
  const { volume, setVolume } = useBaseContext();
  const { toggleMuted, muted } = usePlayerContext();
  const { isMobile } = useDeviceDetectMediaQuery();

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      if (muted && newVolume > 0) toggleMuted(false);
      if (newVolume === 0) toggleMuted(true);
    },
    [setVolume, toggleMuted, muted]
  );

  return (
    <MuteButtonView
      muted={muted}
      volume={volume}
      onToggleMuted={() => toggleMuted(true)}
      onVolumeChange={handleVolumeChange}
      muteIcon={<MuteIcon theme="dark" />}
      unmuteIcon={<UnmuteIcon theme="dark" />}
      shouldAnimate={shouldAnimate}
      enableVolumeSlider={enableVolumeSlider}
      isMobile={isMobile}
      size={sizeProp}
      suppressText={suppressText}
    />
  );
};
