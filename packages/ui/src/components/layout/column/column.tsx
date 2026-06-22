import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

import { GAP_CLASS, type DsSpace } from "../tokens";

/**
 * CVA recipe for the {@link Column} primitive. Same enumerated
 * variants as `Row`; the axis-flipped semantics are the consumer's
 * concern (Tailwind handles them via `flex-col` automatically).
 *
 * In a column: `align` (`items-*`) is horizontal alignment, `justify`
 * (`justify-*`) is vertical distribution.
 */
const columnVariants = cva("gencl:flex gencl:flex-col", {
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
 * Props for the {@link Column} layout primitive — a vertical flex
 * container. The semantic alias for "lay these children out
 * top-to-bottom" when {@link Stack} doesn't provide enough alignment
 * control.
 */
export interface ColumnProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof columnVariants> {
  /** Spacing between children. Named DS token. Defaults to `"none"`. */
  gap?: DsSpace;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
}

/**
 * Vertical flex container. Semantic alias for "lay these children out
 * top-to-bottom" with the same prop surface as `Row`.
 *
 * Kept separate from `Row` (instead of a `direction` prop) because
 * "this is a vertical group" is clearer in code and easier for the AI
 * generator to emit. For simple vertical gap-only layouts, prefer
 * {@link Stack}.
 */
export const Column = React.forwardRef<HTMLDivElement, ColumnProps>(function Column(
  { gap = "none", align, justify, wrap, asChild = false, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      data-slot="layout-column"
      className={cn(columnVariants({ align, justify, wrap }), GAP_CLASS[gap], className)}
      {...props}
    />
  );
});

export { columnVariants };
