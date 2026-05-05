import { cn } from "@genuin/ui/lib/utils";
import { type FC } from "react";

import type { ControlLayerPropsType } from "../control-layer.types";
import { EmbedControls } from "../controls/embed";

export const ResponsivenessEmbed: FC<ControlLayerPropsType> = ({ className, isActive, ...restProps }) => {
  return (
    <div className={cn("gencl:h-full gencl:w-full", className)} {...restProps}>
      {isActive && <EmbedControls onClick={(e) => e.stopPropagation()} className="gencl:justify-end gencl:p-1" />}
    </div>
  );
};
