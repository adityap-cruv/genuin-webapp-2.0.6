"use client";
import { PauseIconOld } from "@genuin/ui/icons";
import { PlayIconOld } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { memo, useState } from "react";

import { usePlayerContext } from "../../../context";

import { AnimatedText } from "./animated-text-old";

type PlayButtonProps = {
  shouldAnimate: boolean;
  /** Force the "Tap to play" text collapsed — set while the cursor is anywhere
   * in the control bar so the text can't reflow the row mid-interaction. */
  suppressText?: boolean;
} & ComponentProps<"div">;

export const AnimatedPlayButton = memo(function PlayButton({
  className,
  shouldAnimate,
  suppressText = false,
  ...restProps
}: PlayButtonProps) {
  const { playingState, togglePlay } = usePlayerContext();
  const [stopAnimating, setStopAnimating] = useState(!shouldAnimate);

  return (
    <div
      onClick={() => {
        togglePlay(true);
        setStopAnimating(true);
      }}
      className={cn(
        "gencl:group gencl:cursor-pointer gencl:flex gencl:justify-center gencl:items-center gencl:rounded-full gencl:bg-black/40 gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:hover:bg-black/50",
        className
      )}
      {...restProps}>
      <div className="gencl:flex gencl:size-9 gencl:sm:size-12! gencl:flex-shrink-0 gencl:items-center gencl:justify-center">
        {playingState === "PLAYING" ? (
          <PauseIconOld theme="dark" className="gencl:size-5 gencl:sm:size-6!" />
        ) : (
          <PlayIconOld theme="fill-dark" className="gencl:size-5 gencl:sm:size-6!" />
        )}
      </div>
      {playingState === "PAUSED" && (
        <AnimatedText text="Tap to play" width={110} stop={stopAnimating || suppressText} />
      )}
    </div>
  );
});
