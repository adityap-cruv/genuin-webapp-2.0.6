import { cn } from "@genuin/ui/lib/utils";
import { resolveControlSize } from "@genuin/ui/player-controls";

import type { ControlLayerPropsType } from "./control-layer.types";
import { Controls } from "./controls";

export function EmbedPip({ isActive, postDetails, className, containerWidth, ...restProps }: ControlLayerPropsType) {
  return (
    <div className={cn("gencl:absolute", className)} {...restProps}>
      {/* PiP is a small fixed-size floating window — size off its own width like every
          other control layer, instead of Controls' unconditioned "md" default. */}
      <Controls variant="embed" size={containerWidth ? resolveControlSize(containerWidth) : "sm"} />
    </div>
  );
}
