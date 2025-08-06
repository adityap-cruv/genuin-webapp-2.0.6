import { cn } from "@genuin/ui/lib/utils";
import { ControlLayerPropsType } from "./control-layer.types";
import { Controls } from "./controls";

export function EmbedPip({
  isActive,
  postDetails,
  className,
  ...restProps
}: ControlLayerPropsType) {
  return (
    <div className={cn("gencl:absolute", className)} {...restProps}>
      <Controls variant="embed" />
    </div>
  );
}
