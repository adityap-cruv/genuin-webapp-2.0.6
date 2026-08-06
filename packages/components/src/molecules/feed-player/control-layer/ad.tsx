"use client";
import { MuteIcon, UnmuteIcon } from "@genuin/ui";
import { Button } from "@genuin/ui/components/button";
import { cn } from "@genuin/ui/lib/utils";
import { resolveControlSize } from "@genuin/ui/player-controls";
import { useMemo, type ComponentProps } from "react";

import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

import { usePlayerContext } from "../context";

import { AnimatedMuteIcon as AnimatedMuteIconNew } from "./controls/control-buttons/mute-button";
import { AnimatedMuteIcon as AnimatedMuteIconOld } from "./controls/control-buttons/mute-button-old";
import { useNewPlayerControls } from "./use-new-player-controls";

export type AdProps = ComponentProps<"div"> & {
  /** Whether this ad is in-feed or in-stream. Kept for callers; does not affect size or spacing. */
  adType: "in-feed" | "in-stream";
  /** Tile width — used to size the mute button the same way the embed-tile player
   * controls do (`default-embed.tsx`: `resolveControlSize(containerWidth)`). */
  containerWidth?: number;
};

/**
 * Ad control layer overlay rendered when an ad is playing.
 */
export function Ad({ className, adType, containerWidth, ...restProps }: AdProps) {
  const isV2 = useNewPlayerControls();
  const { muted, toggleMuted, showExpandView } = usePlayerContext();
  const embedDetails = useSafeEmbedContext();
  const embedConfig = useEmbedConfigs();
  const { isDesktop } = useDeviceDetectMediaQuery();

  // Match the player controls' size in each context, exactly how they compute it:
  //    - expand view → viewport width (like default.tsx)
  //    - embed tile  → the tile's own width (like default-embed.tsx)
  const playerControlSize = useMemo(
    () =>
      embedConfig.isDesignSystemV2
        ? showExpandView && typeof window !== "undefined"
          ? resolveControlSize(window.innerWidth)
          : containerWidth
            ? resolveControlSize(containerWidth)
            : "lg"
        : "md",
    [embedConfig.isDesignSystemV2, showExpandView, containerWidth]
  );
  //  TODO: hardcoded because Figma design and real size conflict.
  const effectiveControlSize = embedConfig.view.brandLayoutType === "iheart" ? "md" : playerControlSize;

  return (
    <div
      className={cn("gencl:absolute gencl:inset-0 gencl:z-50 gencl:flex gencl:pointer-events-none", className)}
      data-testid="ad-control-layer"
      {...restProps}>
      <div
        className={cn(
          "gencl:absolute gencl:right-4 gencl:rounded-full! gencl:shrink-0 gencl:pointer-events-auto",

          !isDesktop ? "gencl:top-8" : "gencl:top-2"
        )}
        onClick={(e) => e.stopPropagation()}>
        {isV2 ? (
          <AnimatedMuteIconNew shouldAnimate={muted} enableVolumeSlider={false} size={effectiveControlSize} />
        ) : (
          <AnimatedMuteIconOld shouldAnimate={muted} enableVolumeSlider={false} alwaysLarge />
        )}
      </div>
    </div>
  );
}
