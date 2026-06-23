"use client";
import { PauseIcon } from "@genuin/ui/icons";
import { PlayIcon } from "@genuin/ui/icons";
import { PlayPauseButton, type PlayerControlSize } from "@genuin/ui/player-controls";
import { memo, type ComponentProps } from "react";

import { usePlayerContext } from "../../../context";

type PlayButtonProps = {
  shouldAnimate: boolean;
  size?: PlayerControlSize;
  /** Force the "Tap to play" text collapsed — set while the cursor is anywhere
   * in the control bar so the text can't reflow the row mid-interaction. */
  suppressText?: boolean;
  // Omit native `onToggle` so the passthrough can't shadow the View's play toggle.
} & Omit<ComponentProps<"div">, "onToggle">;

export const AnimatedPlayButton = memo(function PlayButton({
  className,
  shouldAnimate,
  size = "md",
  suppressText = false,
  ...restProps
}: PlayButtonProps) {
  const { playingState, togglePlay } = usePlayerContext();

  return (
    <PlayPauseButton
      className={className}
      isPlaying={playingState === "PLAYING"}
      onToggle={() => togglePlay(true)}
      playIcon={<PlayIcon theme="fill-dark" />}
      pauseIcon={<PauseIcon theme="dark" />}
      shouldAnimate={shouldAnimate}
      showAnimatedText={playingState === "PAUSED"}
      size={size}
      suppressText={suppressText}
      {...restProps}
    />
  );
});
