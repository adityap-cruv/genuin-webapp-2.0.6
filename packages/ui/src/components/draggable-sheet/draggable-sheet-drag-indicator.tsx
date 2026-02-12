import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

const dragIndicatorVariants = cva(
  "gencl:flex gencl:items-center gencl:justify-center gencl:py-2 gencl:w-full gencl:shrink-0 gencl:cursor-grab active:gencl:cursor-grabbing gencl:touch-none",
);

const dragIndicatorPillVariants = cva(
  "gencl:h-1 gencl:w-[42px] gencl:rounded-full",
  {
    variants: {
      theme: {
        light: "gencl:bg-secondary-50",
        dark: "gencl:bg-secondary-300",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  },
);

interface DragIndicatorProps
  extends ComponentPropsWithoutRef<"div">,
    VariantProps<typeof dragIndicatorPillVariants> {}

export function DragIndicator({
  theme,
  className,
  ...props
}: DragIndicatorProps) {
  return (
    <div
      data-slot="draggable-sheet-indicator"
      className={cn(dragIndicatorVariants(), className)}
      {...props}
    >
      <div className={dragIndicatorPillVariants({ theme })} />
    </div>
  );
}
