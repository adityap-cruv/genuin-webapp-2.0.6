"use client";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";

import { usePlayerContext } from "../context";

import { AnimatedMuteIcon } from "./controls/control-buttons";

export type AdProps = ComponentProps<"div"> & {
  /** Determines which side the mute button is positioned on. In-feed ads use the right side; in-stream ads use the left. */
  adType: "in-feed" | "in-stream";
};

/**
 * Ad control layer overlay rendered when an ad is playing.
 *
 * The mute button is positioned on the right for in-feed ads and on the
 * left for in-stream ads to avoid overlapping native ad UI elements.
 */
export function Ad({ className, adType, ...restProps }: AdProps) {
  const { muted } = usePlayerContext();

  return (
    <div
      className={cn("gencl:absolute gencl:inset-0 gencl:z-50 gencl:flex gencl:pointer-events-none", className)}
      data-testid="ad-control-layer"
      {...restProps}>
      <div
        className={cn(
          "gencl:absolute gencl:top-4 gencl:rounded-full! gencl:shrink-0 gencl:pointer-events-auto",
          adType === "in-stream" ? "gencl:left-4" : "gencl:right-4"
        )}
        onClick={(e) => e.stopPropagation()}>
        <AnimatedMuteIcon shouldAnimate={muted} enableVolumeSlider={false} />
      </div>
    </div>
  );
}
