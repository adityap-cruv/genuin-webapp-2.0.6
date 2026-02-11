import { cn } from "@genuin/ui/lib/utils";
import type { PointerEvent as ReactPointerEvent } from "react";

interface DragIndicatorProps {
  isDarkTheme: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
}

export function DragIndicator({
  isDarkTheme,
  onPointerDown,
}: DragIndicatorProps) {
  return (
    <div
      data-slot="draggable-sheet-indicator"
      className={cn(
        "gencl:flex gencl:items-center gencl:justify-center gencl:py-2 gencl:w-full gencl:shrink-0",
        "gencl:cursor-grab active:gencl:cursor-grabbing",
      )}
      onPointerDown={onPointerDown}
      style={{ touchAction: "none" }}
    >
      <div
        className={cn(
          "gencl:h-1 gencl:w-[42px] gencl:rounded-full",
          isDarkTheme ? "gencl:bg-secondary-300" : "gencl:bg-secondary-50",
        )}
      />
    </div>
  );
}
