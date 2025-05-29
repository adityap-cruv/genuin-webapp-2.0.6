import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "src/lib/utils";

const chipVariants = cva(
  "gencl:text-body-2-semi-bold! gencl:py-0.5 gencl:px-1.5",
  {
    variants: {
      variant: {
        default: "gencl:bg-primary-100 gencl:text-primary",
        secondary: "gencl:bg-secondary-100 gencl:text-secondary",
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
  }
);

type ChipProps = ComponentProps<"p"> & VariantProps<typeof chipVariants>;

export function Chip({ variant, rounded, className, ...restProps }: ChipProps) {
  return (
    <p
      className={cn(chipVariants({ variant, rounded }), className)}
      {...restProps}
    >
      Owner
    </p>
  );
}
