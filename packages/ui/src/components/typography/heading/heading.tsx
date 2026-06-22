import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "../../../lib/utils";
import {
  ALIGN_CLASS,
  HEADING_DEFAULT_AS,
  HEADING_DEFAULT_WEIGHT,
  HEADING_LEVEL_CLASS,
  WEIGHT_CLASS,
  type HeadingLevel,
  type TypographyWeight,
} from "../tokens";

/**
 * Allowed semantic elements for {@link Heading}. The full `h1`-`h6`
 * range is supported so consumers can correct the document outline
 * even when the visual level says otherwise.
 */
export type HeadingAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Optional decoration treatment. `'ribbon'` paints a 4 px vertical bar
 * in the brand primary color flush against the heading's left edge —
 * used for section titles that need a stronger affordance than the
 * type scale alone provides (e.g. right-rail meta panels).
 */
export type HeadingDecoration = "none" | "ribbon";

/**
 * Tailwind utility map for {@link HeadingDecoration}. `'ribbon'` uses
 * a `::before` pseudo-element so it costs zero extra DOM and applies
 * cleanly through `asChild` polymorphism.
 */
const DECORATION_CLASS: Record<HeadingDecoration, string> = {
  none: "",
  ribbon:
    'gencl:relative gencl:pl-3 gencl:before:absolute gencl:before:inset-y-0 gencl:before:left-0 gencl:before:w-1 gencl:before:bg-primary gencl:before:content-[""]',
};

/**
 * Props for the {@link Heading} typography primitive.
 *
 * `Heading` renders any of the Display / Headline scale levels from
 * the Genuin DS. It deliberately decouples visual level (`level`)
 * from semantic element (`as`) — the visual scale is dense (8 levels)
 * but the HTML heading scale only has 6, and the AI layout generator
 * needs both knobs independently.
 */
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Visual level — picks the font-size + line-height + letter-spacing
   * triple from the DS scale. Defaults to `"headline-2"` (32 px /
   * 36 px / -0.2 px) — the most common section-heading level.
   */
  level?: HeadingLevel;
  /**
   * Font weight. When omitted, defaults to the canonical weight per
   * level (see {@link HEADING_DEFAULT_WEIGHT}) — `bold` for `h1` and
   * `headline-0`, `semibold` for everything else.
   */
  weight?: TypographyWeight;
  /**
   * Semantic HTML element. When omitted, defaults to the canonical
   * tag per level (see {@link HEADING_DEFAULT_AS}). Override only
   * when the document outline demands it.
   */
  as?: HeadingAs;
  /** Text alignment. Defaults to `"left"` (no explicit class). */
  align?: "left" | "center" | "right";
  /**
   * Optional decoration treatment. Defaults to `"none"`. Use
   * `"ribbon"` for a 4 px brand-color bar flush against the left edge —
   * a common section-heading affordance in the meta-panel pattern.
   */
  decoration?: HeadingDecoration;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * Display / Headline scale primitive — one component for every level
 * in the Genuin DS typography scale (`h1`, `h2`, `h3`, `headline-0`
 * through `headline-4`). Pure presentational: no `'use client'`, no
 * tone / color knob (consumers apply colour via className).
 *
 * Visual level and semantic element are independent props. Reach for
 * `as` only when the rendered tag should diverge from the
 * level-default semantic mapping.
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  {
    level = "headline-2",
    weight,
    as,
    align = "left",
    decoration = "none",
    asChild = false,
    className,
    children,
    ...props
  },
  ref
) {
  const resolvedWeight = weight ?? HEADING_DEFAULT_WEIGHT[level];
  const resolvedAs = as ?? HEADING_DEFAULT_AS[level];
  const Comp = asChild ? Slot : resolvedAs;

  return (
    <Comp
      ref={ref}
      data-slot="heading"
      className={cn(
        HEADING_LEVEL_CLASS[level],
        WEIGHT_CLASS[resolvedWeight],
        ALIGN_CLASS[align],
        DECORATION_CLASS[decoration],
        className
      )}
      {...props}>
      {children}
    </Comp>
  );
});
