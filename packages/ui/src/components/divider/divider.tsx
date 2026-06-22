import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "../../lib/utils";

/** Orientation of the divider line. */
export type DividerOrientation = "horizontal" | "vertical";

/**
 * Color tone of the divider. Maps onto the Genuin DS `secondary` gray
 * scale — `subtle` is the lightest (just visible), `strong` is the most
 * pronounced. `default` is the canonical "1px hairline" tone.
 */
export type DividerTone = "default" | "subtle" | "strong";

/**
 * Horizontal inset applied to both ends of a horizontal divider. Has no
 * effect on a vertical divider.
 */
export type DividerInset = "none" | "sm" | "md" | "lg";

/**
 * Tone token → Tailwind background-color class. Background colour is
 * used (not border) so the same primitive works for both orientations
 * without juggling `border-t` / `border-l` shorthands.
 */
const TONE_CLASS: Record<DividerTone, string> = {
  subtle: "gencl:bg-secondary-100",
  default: "gencl:bg-secondary-150",
  strong: "gencl:bg-secondary-300",
};

/**
 * Horizontal-orientation inset token → Tailwind `mx-*` class. The map
 * is exhaustive so any future addition stays type-checked.
 */
const INSET_CLASS: Record<DividerInset, string> = {
  none: "",
  sm: "gencl:mx-2",
  md: "gencl:mx-4",
  lg: "gencl:mx-6",
};

const HORIZONTAL_BASE = "gencl:h-px gencl:w-full";
const VERTICAL_BASE = "gencl:w-px gencl:h-full";

/**
 * Props for the {@link Divider} static-page primitive.
 *
 * `Divider` is a thin presentational separator. Pages reach for it
 * between content sections — between a heading and a body, between two
 * adjacent cards, or as a vertical rule inside a toolbar.
 */
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Line orientation. Defaults to `"horizontal"`. */
  orientation?: DividerOrientation;
  /** Color tone. Defaults to `"default"`. */
  tone?: DividerTone;
  /** Horizontal inset (only honoured for horizontal orientation). Defaults to `"none"`. */
  inset?: DividerInset;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
}

/**
 * Thin presentational separator — a horizontal or vertical hairline.
 * Renders a `<div role="separator">` by default so it carries the right
 * ARIA semantics in both orientations without requiring an `<hr>`.
 *
 * Use `asChild` with `<hr>` if you need the native semantic element
 * (e.g. inside a `<main>` flow where the document outline matters).
 */
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = "horizontal", tone = "default", inset = "none", asChild = false, className, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";
  const baseClass = orientation === "horizontal" ? HORIZONTAL_BASE : VERTICAL_BASE;
  // Inset only applies on the horizontal axis — silently ignore for vertical.
  const insetClass = orientation === "horizontal" ? INSET_CLASS[inset] : "";

  return (
    <Comp
      ref={ref}
      data-slot="divider"
      role="separator"
      aria-orientation={orientation}
      className={cn(baseClass, TONE_CLASS[tone], insetClass, className)}
      {...props}
    />
  );
});
