import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

import { GAP_CLASS, type DsSpace } from "../tokens";

/**
 * CVA recipe for the {@link Cluster} primitive. Wrap is always on —
 * the wrap-first intent is what separates `Cluster` from `Row`.
 *
 * `align` here mirrors flex `items-*` (vertical alignment within a
 * wrapped line). `baseline` is included for clusters of differently-
 * sized typographic chips.
 */
const clusterVariants = cva("gencl:flex gencl:flex-row gencl:flex-wrap", {
  variants: {
    align: {
      start: "gencl:items-start",
      center: "gencl:items-center",
      end: "gencl:items-end",
      baseline: "gencl:items-baseline",
    },
  },
  defaultVariants: {
    align: "center",
  },
});

/**
 * Props for the {@link Cluster} layout primitive — a wrap-friendly
 * flex row for chips, tags, breadcrumbs, and action button groups.
 */
export interface ClusterProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof clusterVariants> {
  /** Gap between items. Applies in both axes when wrapping. Defaults to `"xs"` (8 px). */
  gap?: DsSpace;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
}

/**
 * Wrap-friendly flex row — the primitive for chips, tags, action
 * button groups, and breadcrumbs. Anything that should reflow onto
 * additional lines when out of horizontal space.
 *
 * The "wrap is always on" distinction is what separates this from
 * {@link Row}. Different intent, different name — the AI generator
 * targets `Cluster` explicitly when emitting horizontally-flowing
 * collections.
 */
export const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(function Cluster(
  { gap = "xs", align, asChild = false, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      data-slot="layout-cluster"
      className={cn(clusterVariants({ align }), GAP_CLASS[gap], className)}
      {...props}
    />
  );
});

export { clusterVariants };
