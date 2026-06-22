"use client";
import { PauseIcon } from "@genuin/ui/icons";
import { PlayIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { memo, useState } from "react";

import { usePlayerContext } from "../../../context";
import {
  DARK_OVERLAY_20,
  DARK_OVERLAY_40,
  PLAYER_CONTROL_SIZE,
  type PlayerControlSize,
} from "../../player-control-size";

import { AnimatedText } from "./animated-text";

type PlayButtonProps = {
  shouldAnimate: boolean;
  size?: PlayerControlSize;
  /** Force the "Tap to play" text collapsed — set while the cursor is anywhere
   * in the control bar so the text can't reflow the row mid-interaction. */
  suppressText?: boolean;
} & ComponentProps<"div">;

export const AnimatedPlayButton = memo(function PlayButton({
  className,
  shouldAnimate,
  size: sizeProp = "md",
  suppressText = false,
  ...restProps
}: PlayButtonProps) {
  const { playingState, togglePlay } = usePlayerContext();
  const [stopAnimating, setStopAnimating] = useState(!shouldAnimate);

  const size = PLAYER_CONTROL_SIZE[sizeProp];
  const glyphStyle = { width: size.glyph, height: size.glyph };

  return (
    <div
      onClick={() => {
        togglePlay(true);
        setStopAnimating(true);
      }}
      className={cn(
        "gencl:group gencl:cursor-pointer gencl:flex gencl:justify-center gencl:items-center gencl:rounded-full gencl:transition-all gencl:duration-300 gencl:ease-in-out",
        className
      )}
      {...restProps}
      style={{
        minWidth: size.outer,
        height: size.outer,
        background: DARK_OVERLAY_20,
        backdropFilter: `blur(${size.outerBlur}px)`,
        WebkitBackdropFilter: `blur(${size.outerBlur}px)`,
      }}>
      <div
        className="gencl:flex gencl:flex-shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full"
        style={{
          width: size.inner,
          height: size.inner,
          background: DARK_OVERLAY_40,
          backdropFilter: `blur(${size.innerBlur}px)`,
          WebkitBackdropFilter: `blur(${size.innerBlur}px)`,
        }}>
        {playingState === "PLAYING" ? (
          <PauseIcon theme="dark" style={glyphStyle} />
        ) : (
          <PlayIcon theme="fill-dark" style={glyphStyle} />
        )}
      </div>
      {playingState === "PAUSED" && (
        <AnimatedText text="Tap to play" width={110} stop={stopAnimating || suppressText} />
      )}
    </div>
  );
});
