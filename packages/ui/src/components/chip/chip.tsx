import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@genuin/ui/lib/utils";

// `success` is the only intent-tone we ship today. The shared design
// system only carries a single `success-status` swatch (no 100/700
// shades), so we pair the brand-green background with white text for
// AA contrast. `info` and `warning` are not provided — the DS has no
// matching blue or amber palette, and inventing hex values into a
// primitive would defeat per-publisher theming. Add them only after
// the design system grows those palettes.
const chipVariants = cva("gencl:text-body-2-semi-bold! gencl:py-0.5 gencl:px-1.5", {
  variants: {
    variant: {
      default: "gencl:bg-primary-100 gencl:text-primary",
      secondary: "gencl:bg-secondary-100 gencl:text-secondary",
      success: "gencl:bg-success-status gencl:text-white",
    },
    rounded: {
      full: "gencl:rounded-full",
      small: "gencl:rounded-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    rounded: "full",
  },
});

type ChipProps = ComponentProps<"p"> & VariantProps<typeof chipVariants>;

export function Chip({ variant, children, rounded, className, ...restProps }: ChipProps) {
  return (
    <p className={cn(chipVariants({ variant, rounded }), className)} {...restProps}>
      {children}
    </p>
  );
}
