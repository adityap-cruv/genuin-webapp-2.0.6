import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@genuin/ui/lib/utils";
import { XIcon } from "@genuin/ui/icons";
import type { ReactNode, ComponentPropsWithoutRef } from "react";

const navigationBarVariants = cva(
  "gencl:flex gencl:items-center gencl:touch-none gencl:gap-3 gencl:px-4 gencl:py-3.5 gencl:w-full gencl:shrink-0 gencl:border-b gencl:border-solid gencl:cursor-grab active:gencl:cursor-grabbing",
  {
    variants: {
      theme: {
        light: "gencl:bg-white gencl:border-secondary-50",
        dark: "gencl:bg-transparent gencl:border-white/10",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  },
);

const navigationBarTitleVariants = cva(
  "gencl:flex-1 gencl:min-w-0 gencl:text-body-0-medium gencl:truncate",
  {
    variants: {
      theme: {
        light: "gencl:text-secondary-900",
        dark: "gencl:text-white",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  },
);

interface NavigationBarProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onPointerDown">,
    VariantProps<typeof navigationBarVariants> {
  navTitle?: string;
  showClose?: boolean;
  closeIcon?: ReactNode;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onClose?: () => void;
}

export function NavigationBar({
  navTitle,
  showClose = true,
  closeIcon,
  theme,
  className,
  onPointerDown,
  onClose,
  style,
  ...props
}: NavigationBarProps) {
  return (
    <div
      data-slot="draggable-sheet-nav"
      className={cn(navigationBarVariants({ theme }), className)}
      onPointerDown={onPointerDown}
      {...props}
    >
      {navTitle ? (
        <p className={navigationBarTitleVariants({ theme })}>{navTitle}</p>
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
            onClose?.();
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
