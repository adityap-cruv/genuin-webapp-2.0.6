import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "../../../lib/utils";
import {
  ALIGN_CLASS,
  TEXT_DEFAULT_WEIGHT,
  TEXT_SIZE_CLASS,
  WEIGHT_CLASS,
  type TextSize,
  type TypographyWeight,
} from "../tokens";

/**
 * Allowed semantic elements for {@link Text}. Covers the common
 * paragraph / inline / wrapper / label cases. For headings, use
 * {@link Heading} instead.
 */
export type TextAs = "p" | "span" | "div" | "label";

/**
 * Props for the {@link Text} typography primitive.
 *
 * `Text` renders body / paragraph / label copy using the Body scale
 * from the Genuin DS. Pure presentational — no `'use client'`, no
 * tone / color knob (consumers apply colour via className).
 */
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Body scale size — picks the font-size + line-height pair from the
   * DS scale. Defaults to `"body-1"` (14 px / 20 px), the standard
   * paragraph size.
   */
  size?: TextSize;
  /**
   * Font weight. When omitted, defaults to the canonical weight per
   * size (see {@link TEXT_DEFAULT_WEIGHT}) — `semibold` for `body-0`,
   * `medium` for every other size.
   */
  weight?: TypographyWeight;
  /** Semantic HTML element. Defaults to `'p'`. */
  as?: TextAs;
  /** Text alignment. Defaults to `"left"` (no explicit class). */
  align?: "left" | "center" | "right";
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * Body / paragraph / label scale primitive — one component for every
 * size in the Genuin DS Body scale (`body-0` through `body-4`). Pure
 * presentational: no `'use client'`, no tone / color knob (consumers
 * apply colour via className).
 *
 * For section / page titles, use {@link Heading} instead.
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { size = "body-1", weight, as = "p", align = "left", asChild = false, className, children, ...props },
  ref
) {
  const resolvedWeight = weight ?? TEXT_DEFAULT_WEIGHT[size];
  const Comp = (asChild ? Slot : as) as React.ElementType;

  return (
    <Comp
      ref={ref}
      data-slot="text"
      className={cn(TEXT_SIZE_CLASS[size], WEIGHT_CLASS[resolvedWeight], ALIGN_CLASS[align], className)}
      {...props}>
      {children}
    </Comp>
  );
});
