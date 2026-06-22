"use client";
import { MuteIcon, UnmuteIcon } from "@genuin/ui";
import { Button } from "@genuin/ui/components/button";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";

import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

import { usePlayerContext } from "../context";

import { AnimatedMuteIcon as AnimatedMuteIconNew } from "./controls/control-buttons/mute-button";
import { AnimatedMuteIcon as AnimatedMuteIconOld } from "./controls/control-buttons/mute-button-old";
import { useNewPlayerControls } from "./use-new-player-controls";

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
  const isV2 = useNewPlayerControls();
  const { muted, toggleMuted } = usePlayerContext();
  const embedDetails = useSafeEmbedContext();
  return (
    <div
      className={cn("gencl:absolute gencl:inset-0 gencl:z-50 gencl:flex gencl:pointer-events-none", className)}
      data-testid="ad-control-layer"
      {...restProps}>
      <div
        className={cn(
          "gencl:absolute gencl:right-4 gencl:rounded-full! gencl:shrink-0 gencl:pointer-events-auto",
          adType === "in-stream" ? "gencl:top-10" : "gencl:top-4"
        )}
        onClick={(e) => e.stopPropagation()}>
        {isV2 ? (
          <AnimatedMuteIconNew shouldAnimate={muted} enableVolumeSlider={false} size="lg" />
        ) : (
          <AnimatedMuteIconOld shouldAnimate={muted} enableVolumeSlider={false} alwaysLarge />
        )}
      </div>
    </div>
  );
}
