import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

const overlayVariants = cva(
  "gencl:fixed gencl:inset-0 gencl:pointer-events-auto gencl:transition-opacity gencl:duration-200 gencl:z-40",
  {
    variants: {
      theme: {
        light: "gencl:bg-black/20",
        dark: "gencl:bg-black/40",
      },
    },
    defaultVariants: {
      theme: "light",
    },
  },
);

interface OverlayProps
  extends ComponentPropsWithoutRef<"div">,
    VariantProps<typeof overlayVariants> {}

export function Overlay({ theme, className, ...props }: OverlayProps) {
  return (
    <div
      data-slot="draggable-sheet-overlay"
      className={cn(overlayVariants({ theme }), className)}
      {...props}
    />
  );
}
