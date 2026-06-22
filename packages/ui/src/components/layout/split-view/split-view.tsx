import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

import { GAP_CLASS, type DsSpace } from "../tokens";

/**
 * CVA recipe for the {@link SplitView} primitive. Only `align` lives
 * here — tracks and gap are resolved separately.
 *
 * Alignment uses CSS Grid's `align-items` (vertical alignment of
 * each track's content within its row).
 */
const splitViewVariants = cva("gencl:grid", {
  variants: {
    align: {
      start: "gencl:items-start",
      center: "gencl:items-center",
      end: "gencl:items-end",
      stretch: "gencl:items-stretch",
    },
  },
  defaultVariants: {
    align: "stretch",
  },
});

/**
 * Props for the {@link SplitView} layout primitive — a two-or-three
 * column ratio split with explicit track widths.
 *
 * The canonical Hierarchical Tree pattern ("video on the left,
 * linkout stack on the right at 746/320 px") maps to:
 * `<SplitView tracks={[746, 320]} gap="lg">`.
 */
export interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof splitViewVariants> {
  /**
   * Column tracks. Required. Accepts:
   * - `number` — equal-fraction split (`2` → `1fr 1fr`, `3` →
   *   `1fr 1fr 1fr`)
   * - `number[]` — explicit pixel widths (`[746, 320]` →
   *   `"746px 320px"`)
   * - `string` — raw `grid-template-columns` value (`"2fr 1fr"`,
   *   `"min-content 1fr"`)
   */
  tracks: number | number[] | string;
  /** Gap between columns. Named DS token. Defaults to `"none"`. */
  gap?: DsSpace;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
}

/** Resolve a {@link SplitViewProps.tracks} value to a CSS `grid-template-columns` string. */
function resolveTracks(tracks: SplitViewProps["tracks"]): string {
  if (typeof tracks === "number") {
    return `repeat(${tracks}, minmax(0, 1fr))`;
  }
  if (Array.isArray(tracks)) {
    return tracks.map((px) => `${px}px`).join(" ");
  }
  return tracks;
}

/**
 * Two-or-three-column ratio split with explicit track widths. Thin
 * wrapper around `Grid` with `rows: 1` semantics, kept as a separate
 * primitive because the "ratio split" intent is common enough to
 * deserve a dedicated name.
 *
 * If we later find this is just sugar with no usage benefit, it can
 * fold into {@link Grid} — the generator can switch by changing one
 * `uiVariant` string.
 */
export const SplitView = React.forwardRef<HTMLDivElement, SplitViewProps>(function SplitView(
  { tracks, gap = "none", align, asChild = false, className, style, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";

  const gridTemplateColumns = resolveTracks(tracks);
  const mergedStyle: React.CSSProperties = { ...style, gridTemplateColumns };

  return (
    <Comp
      ref={ref}
      data-slot="layout-split-view"
      className={cn(splitViewVariants({ align }), GAP_CLASS[gap], className)}
      style={mergedStyle}
      {...props}
    />
  );
});

export { splitViewVariants };
