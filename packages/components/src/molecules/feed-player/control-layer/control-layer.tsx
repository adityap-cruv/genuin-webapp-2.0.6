import { memo, lazy, Suspense } from "react";
import type { CSSProperties } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "./control-layer.types";
import { usePlayerContext } from "../context";
import { useDeviceDetection } from "@genuin/components/hooks/use-device-detection";

const Ad = lazy(() => import("./ad").then((m) => ({ default: m.Ad })));
const Default = lazy(() =>
  import("./default").then((m) => ({ default: m.Default }))
);
const Embed = lazy(() => import("./embed").then((m) => ({ default: m.Embed })));
const Placement = lazy(() =>
  import("./placement").then((m) => ({ default: m.Placement }))
);
const EmbedPip = lazy(() =>
  import("./embed-pip").then((m) => ({ default: m.EmbedPip }))
);

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
    return (
      <Suspense fallback={null}>
        <Ad {...props} />
      </Suspense>
    );
  }

  /**
   * Render the default control layer.
   */
  if (!props.variant || props.variant === "default") {
    const { className, variant = "default", ...restProps } = props;
    return (
      <Suspense fallback={null}>
        <Default
          className={cn(controlLayerVariant({ variant }), className)}
          style={safariOptimizationStyles}
          {...restProps}
        />
      </Suspense>
    );
  }

  /**
   * Render the embed control layer.
   */

  if (props.variant === "embed") {
    const { className, variant, ...restProps } = props;
    return (
      <Suspense fallback={null}>
        <Embed
          className={cn(controlLayerVariant({ variant }), className)}
          style={safariOptimizationStyles}
          layoutType={props.layoutType}
          {...restProps}
        />
      </Suspense>
    );
  }

  /**
   * Render the placement control layer.
   */

  if (props.variant === "placement") {
    const { className, variant, ...restProps } = props;
    return (
      <Suspense fallback={null}>
        <Placement
          className={cn(controlLayerVariant({ variant }), className)}
          style={safariOptimizationStyles}
          {...restProps}
        />
      </Suspense>
    );
  }

  if (props.variant === "embed-pip") {
    const { className, variant, ...restProps } = props;
    return (
      <Suspense fallback={null}>
        <EmbedPip
          className={cn(controlLayerVariant({ variant }), className)}
          style={safariOptimizationStyles}
          {...restProps}
        />
      </Suspense>
    );
  }

  // Fallback: render nothing or handle error as appropriate
  return null;
});
