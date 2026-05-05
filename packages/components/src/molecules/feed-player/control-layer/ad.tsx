"use client";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";

import { usePlayerContext } from "../context";

import { AnimatedMuteIcon } from "./controls/control-buttons";

export type AdProps = ComponentProps<"div">;

/**
 * Ad control layer overlay rendered when an ad is playing.
 */
export function Ad({ className, ...restProps }: AdProps) {
  const { muted } = usePlayerContext();

  return (
    <div
      className={cn("gencl:absolute gencl:inset-0 gencl:z-50 gencl:flex gencl:pointer-events-none", className)}
      data-testid="ad-control-layer"
      {...restProps}>
      <div
        className="gencl:absolute gencl:top-4 gencl:right-4 gencl:rounded-full! gencl:shrink-0 gencl:pointer-events-auto"
        onClick={(e) => e.stopPropagation()}>
        <AnimatedMuteIcon shouldAnimate={muted} enableVolumeSlider={false} />
      </div>
    </div>
  );
}
