import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

import { GAP_CLASS, type DsSpace } from "../tokens";

/**
 * CVA recipe for the {@link Row} primitive. Only enumerated variants
 * (`align`, `justify`, `wrap`) live here — the DS-named `gap` token is
 * looked up separately in `GAP_CLASS` to keep the recipe compact.
 */
const rowVariants = cva("gencl:flex gencl:flex-row", {
  variants: {
    align: {
      start: "gencl:items-start",
      center: "gencl:items-center",
      end: "gencl:items-end",
      baseline: "gencl:items-baseline",
      stretch: "gencl:items-stretch",
    },
    justify: {
      start: "gencl:justify-start",
      center: "gencl:justify-center",
      end: "gencl:justify-end",
      between: "gencl:justify-between",
      around: "gencl:justify-around",
      evenly: "gencl:justify-evenly",
    },
    wrap: {
      true: "gencl:flex-wrap",
      false: "gencl:flex-nowrap",
    },
  },
  defaultVariants: {
    align: "stretch",
    justify: "start",
    wrap: false,
  },
});

/**
 * Props for the {@link Row} layout primitive — a horizontal flex
 * container. The bread-and-butter primitive for "lay these children
 * out side by side."
 */
export interface RowProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof rowVariants> {
  /** Spacing between children. Named DS token. Defaults to `"none"`. */
  gap?: DsSpace;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
}

/**
 * Horizontal flex container. The bread-and-butter primitive for "lay
 * these children out side by side."
 *
 * For a wrap-friendly variant (chips, tags, action button rows), use
 * the `Cluster` primitive — it's a separate component because the
 * intent is different and the AI generator targets it explicitly.
 */
export const Row = React.forwardRef<HTMLDivElement, RowProps>(function Row(
  { gap = "none", align, justify, wrap, asChild = false, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      data-slot="layout-row"
      className={cn(rowVariants({ align, justify, wrap }), GAP_CLASS[gap], className)}
      {...props}
    />
  );
});

export { rowVariants };
