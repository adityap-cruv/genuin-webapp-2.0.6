import { memo } from "react";
import type { CSSProperties } from "react";
import { cva } from "class-variance-authority";
import { Default } from "./default";
import { cn } from "@genuin/ui/lib/utils";
import { Embed } from "./embed";
import { ControlLayerPropsType } from "./control-layer.types";
import { EmbedPip } from "./embed-pip";
import { usePlayerContext } from "../context";
import { Ad } from "./ad";
import { Placement } from "./placement";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

export const controlLayerVariant = cva(
  "gencl:absolute gencl:inset-0 gencl:h-full gencl:w-full gencl:overflow-clip gencl:transition-all",
  {
    variants: {
      variant: {
        default: "",
        embed: "",
        "embed-pip": "",
        placement: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * This control layer is only inteded to use for feed player.
 */
export const ControlLayer = memo(function ControlLayer(
  props: ControlLayerPropsType
) {
  const { isAdPlaying } = usePlayerContext();
  const { isIOS, isMac } = useDeviceDetection();

  // Safari-specific optimization styles to prevent flickering during swiper transitions
  const safariOptimizationStyles: CSSProperties =
    isIOS || isMac
      ? {
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          willChange: "transform",
        }
      : {};

  if (isAdPlaying) {
    return <Ad {...props} />;
  }

  /**
   * Render the default control layer.
   */
  if (!props.variant || props.variant === "default") {
    const { className, variant = "default", ...restProps } = props;
    return (
      <Default
        className={cn(controlLayerVariant({ variant }), className)}
        style={safariOptimizationStyles}
        {...restProps}
      />
    );
  }

  /**
   * Render the embed control layer.
   */

  if (props.variant === "embed") {
    const { className, variant, ...restProps } = props;
    return (
      <Embed
        className={cn(controlLayerVariant({ variant }), className)}
        style={safariOptimizationStyles}
        layoutType={props.layoutType}
        {...restProps}
      />
    );
  }

  /**
   * Render the placement control layer.
   */

  if (props.variant === "placement") {
    const { className, variant, ...restProps } = props;
    return (
      <Placement
        className={cn(controlLayerVariant({ variant }), className)}
        style={safariOptimizationStyles}
        {...restProps}
      />
    );
  }

  if (props.variant === "embed-pip") {
    const { className, variant, ...restProps } = props;
    return (
      <EmbedPip
        className={cn(controlLayerVariant({ variant }), className)}
        style={safariOptimizationStyles}
        {...restProps}
      />
    );
  }

  // Fallback: render nothing or handle error as appropriate
  return null;
});
