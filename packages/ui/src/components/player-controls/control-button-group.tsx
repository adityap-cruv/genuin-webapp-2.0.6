import { type ReactNode } from "react";

import { cn } from "../../lib/utils";

export interface ControlButtonGroupProps {
  /** The control buttons to cluster. */
  children: ReactNode;
  /** Horizontal gap between buttons. tight = gap-2, liberal = gap-3. @default "tight" */
  gap?: "tight" | "liberal";
  /** Extra classes on the row. */
  className?: string;
}

/**
 * Clusters V2 player-control buttons (mute / play-pause / expand) in a single
 * horizontal, vertically-centered row with consistent spacing. Pure layout — it
 * owns no positioning or business logic, so consumers wrap it in their own
 * positioned container and decide which buttons to render inside.
 */
export function ControlButtonGroup({ children, gap = "tight", className }: ControlButtonGroupProps) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:items-center",
        gap === "liberal" ? "gencl:gap-3" : "gencl:gap-2",
        className
      )}>
      {children}
    </div>
  );
}
