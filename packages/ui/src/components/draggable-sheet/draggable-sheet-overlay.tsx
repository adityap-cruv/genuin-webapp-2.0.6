import { cn } from "@genuin/ui/lib/utils";

interface OverlayProps {
  isDarkTheme: boolean;
  overlayClassName?: string;
  onClick: () => void;
}

export function Overlay({
  isDarkTheme,
  overlayClassName,
  onClick,
}: OverlayProps) {
  return (
    <div
      data-slot="draggable-sheet-overlay"
      className={cn(
        "gencl:fixed gencl:inset-0 gencl:pointer-events-auto gencl:transition-opacity gencl:duration-200 gencl:z-40",
        isDarkTheme ? "gencl:bg-black/40" : "gencl:bg-black/20",
        overlayClassName,
      )}
      onClick={onClick}
    />
  );
}
