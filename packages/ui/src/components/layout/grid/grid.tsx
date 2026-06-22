import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

import { COL_GAP_CLASS, GAP_CLASS, ROW_GAP_CLASS, type DsSpace } from "../tokens";

/**
 * Static lookup for numeric `cols` (1-12). Static class strings are
 * required so Tailwind can statically discover them at build time —
 * arbitrary values like `grid-cols-13` would need safelisting or
 * arbitrary-value escapes.
 *
 * Values outside 1-12 fall through to the inline-style escape hatch
 * (see {@link Grid}). Keeping the static range at 12 matches what
 * Tailwind ships out of the box.
 */
const GRID_COLS_CLASS: Record<number, string> = {
  1: "gencl:grid-cols-1",
  2: "gencl:grid-cols-2",
  3: "gencl:grid-cols-3",
  4: "gencl:grid-cols-4",
  5: "gencl:grid-cols-5",
  6: "gencl:grid-cols-6",
  7: "gencl:grid-cols-7",
  8: "gencl:grid-cols-8",
  9: "gencl:grid-cols-9",
  10: "gencl:grid-cols-10",
  11: "gencl:grid-cols-11",
  12: "gencl:grid-cols-12",
};

const GRID_ROWS_CLASS: Record<number, string> = {
  1: "gencl:grid-rows-1",
  2: "gencl:grid-rows-2",
  3: "gencl:grid-rows-3",
  4: "gencl:grid-rows-4",
  5: "gencl:grid-rows-5",
  6: "gencl:grid-rows-6",
};

/**
 * Props for the {@link Grid} layout primitive — a CSS Grid wrapper.
 * The generator's main primitive for multi-column / multi-row
 * arrangements.
 *
 * `cols` and `rows` are intentionally polymorphic: a `number` resolves
 * to `repeat(N, minmax(0, 1fr))` via a Tailwind class; a `string`
 * passes through as a raw `grid-template-*` value via inline
 * `style` — because Tailwind cannot safelist arbitrary track strings
 * at build time, and the generator emits per-breakpoint tracks
 * (`"746px 320px"`) that are inherently dynamic.
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Column tracks. `number` = `repeat(N, minmax(0, 1fr))`; `string` =
   * raw `grid-template-columns` value (e.g. `"746px 320px"`,
   * `"1fr 2fr 1fr"`). Numbers outside 1-12 fall through to inline
   * style.
   */
  cols?: number | string;
  /**
   * Row tracks. Same convention as `cols`. Numbers outside 1-6 fall
   * through to inline style.
   */
  rows?: number | string;
  /**
   * Symmetric gap between cells. Named DS token. Mutually exclusive
   * with `colGap` / `rowGap` — when `gap` is set, the asymmetric
   * versions are ignored.
   */
  gap?: DsSpace;
  /** Column gap only. Ignored if `gap` is also set. */
  colGap?: DsSpace;
  /** Row gap only. Ignored if `gap` is also set. */
  rowGap?: DsSpace;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
}

/** Resolve a `cols` / `rows` prop to either a Tailwind class or an inline-style value. */
function resolveTracks(
  value: number | string | undefined,
  classMap: Record<number, string>,
  rawProperty: "gridTemplateColumns" | "gridTemplateRows"
): { className?: string; style?: React.CSSProperties } {
  if (value === undefined) return {};
  if (typeof value === "number") {
    const cls = classMap[value];
    if (cls) return { className: cls };
    // Out-of-range numeric value — fall back to inline style with
    // an explicit repeat() expression.
    return { style: { [rawProperty]: `repeat(${value}, minmax(0, 1fr))` } };
  }
  return { style: { [rawProperty]: value } };
}

/**
 * CSS Grid wrapper. The generator's main primitive for multi-column
 * and multi-row arrangements. See {@link GridProps} for the
 * number-vs-string track polymorphism.
 *
 * For the common 2-or-3-column ratio split (e.g. `"746px 320px"`),
 * prefer the dedicated `SplitView` primitive — the dedicated name
 * makes the intent legible in the page tree.
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(function Grid(
  { cols, rows, gap, colGap, rowGap, asChild = false, className, style, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";

  const colsResolved = resolveTracks(cols, GRID_COLS_CLASS, "gridTemplateColumns");
  const rowsResolved = resolveTracks(rows, GRID_ROWS_CLASS, "gridTemplateRows");

  // Mutual exclusion: when `gap` is set, asymmetric versions are
  // ignored. This matches the spec contract and keeps the resolved
  // class list deterministic.
  const gapClass = gap !== undefined ? GAP_CLASS[gap] : undefined;
  const colGapClass = gap === undefined && colGap !== undefined ? COL_GAP_CLASS[colGap] : undefined;
  const rowGapClass = gap === undefined && rowGap !== undefined ? ROW_GAP_CLASS[rowGap] : undefined;

  const mergedStyle: React.CSSProperties | undefined =
    colsResolved.style || rowsResolved.style || style
      ? { ...style, ...colsResolved.style, ...rowsResolved.style }
      : undefined;

  return (
    <Comp
      ref={ref}
      data-slot="layout-grid"
      className={cn(
        "gencl:grid",
        colsResolved.className,
        rowsResolved.className,
        gapClass,
        colGapClass,
        rowGapClass,
        className
      )}
      style={mergedStyle}
      {...props}
    />
  );
});
