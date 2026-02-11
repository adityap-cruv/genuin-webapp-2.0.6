import { cn } from "@genuin/ui/lib/utils";
import { XIcon } from "@genuin/ui/icons";
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";

interface NavigationBarProps {
  isDarkTheme: boolean;
  navTitle?: string;
  showClose: boolean;
  closeIcon?: ReactNode;
  theme: "light" | "dark";
  navClassName?: string;
  onPointerDown: (e: ReactPointerEvent) => void;
  onClose: () => void;
}

export function NavigationBar({
  isDarkTheme,
  navTitle,
  showClose,
  closeIcon,
  theme,
  navClassName,
  onPointerDown,
  onClose,
}: NavigationBarProps) {
  return (
    <div
      data-slot="draggable-sheet-nav"
      className={cn(
        "gencl:flex gencl:items-center gencl:gap-3 gencl:px-4 gencl:py-3.5 gencl:w-full gencl:shrink-0",
        "gencl:border-b gencl:border-solid",
        isDarkTheme
          ? "gencl:bg-transparent gencl:border-white/10"
          : "gencl:bg-white gencl:border-secondary-50",
        "gencl:cursor-grab active:gencl:cursor-grabbing",
        navClassName,
      )}
      onPointerDown={onPointerDown}
      style={{ touchAction: "none" }}
    >
      {navTitle ? (
        <p
          className={cn(
            "gencl:flex-1 gencl:min-w-0 gencl:text-body-0-medium gencl:truncate",
            isDarkTheme ? "gencl:text-white" : "gencl:text-secondary-900",
          )}
        >
          {navTitle}
        </p>
      ) : (
        <span className="gencl:flex-1" />
      )}

      {showClose && (
        <button
          data-slot="draggable-sheet-close"
          className={cn(
            "gencl:shrink-0 gencl-size-6 gencl:flex gencl:items-center gencl:justify-center",
            "gencl:rounded-xs gencl:transition-opacity hover:gencl:opacity-70",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Close"
          type="button"
        >
          {closeIcon ?? <XIcon theme={theme} size="md" />}
        </button>
      )}
    </div>
  );
}
