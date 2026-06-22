import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Tailwind utility map for {@link AccentBorderProps.tone}. We map to the
 * existing brand variables so the active theme cascade (`.theme-<slug>`)
 * carries through automatically — no per-publisher CSS needed.
 */
const TONE_COLOR_CLASS = {
  primary: "gencl:[--accent-border-color:var(--gencl-color-primary)]",
  secondary: "gencl:[--accent-border-color:var(--gencl-color-secondary-800)]",
  neutral: "gencl:[--accent-border-color:var(--gencl-color-secondary-200)]",
} as const;

type AccentBorderTone = keyof typeof TONE_COLOR_CLASS;
type AccentBorderWeight = "thin" | "medium" | "thick";
type AccentBorderSide = "left" | "right" | "top" | "bottom";
type AccentBorderState = "always" | "reveal" | "expand";
type AccentBorderInset = "none" | "xs" | "sm" | "md";

/**
 * Base utilities every variant shares. We render the accent line via a
 * `::before` pseudo-element rather than a real CSS `border-*` because
 * `expand` and `reveal` need to animate width/height/opacity, and
 * shifting an actual border between 0/N px breaks layout. The pseudo
 * sits at the chosen edge and is sized from a CSS variable populated
 * by the side / state variants below.
 */
const ACCENT_BORDER_BASE = [
  "gencl:relative",
  "gencl:before:content-['']",
  "gencl:before:absolute",
  "gencl:before:bg-[var(--accent-border-color)]",
  "gencl:before:pointer-events-none",
  "gencl:before:transition-all",
  "gencl:before:duration-300",
  "gencl:before:ease-out",
].join(" ");

/**
 * Side-axis layout for the `::before` pseudo. The cross-axis dimension
 * is fixed (the weight) and the main-axis dimension stretches to 100%
 * — `state` then overrides it for reveal/expand. We also pad the
 * content away from the line by the same edge.
 */
const SIDE_CLASS: Record<AccentBorderSide, string> = {
  left: [
    "gencl:before:left-0",
    "gencl:before:top-0",
    "gencl:before:h-full",
    "gencl:before:w-[var(--accent-border-weight)]",
  ].join(" "),
  right: [
    "gencl:before:right-0",
    "gencl:before:top-0",
    "gencl:before:h-full",
    "gencl:before:w-[var(--accent-border-weight)]",
  ].join(" "),
  top: [
    "gencl:before:top-0",
    "gencl:before:left-0",
    "gencl:before:w-full",
    "gencl:before:h-[var(--accent-border-weight)]",
  ].join(" "),
  bottom: [
    "gencl:before:bottom-0",
    "gencl:before:left-0",
    "gencl:before:w-full",
    "gencl:before:h-[var(--accent-border-weight)]",
  ].join(" "),
};

/**
 * Padding-from-line scale. Closed DS scale so the agent cannot emit a
 * one-off pixel value. Padding only applies on the side the accent
 * lives on; the other three sides remain at zero so the wrapper is
 * transparent to siblings.
 */
const INSET_PADDING: Record<AccentBorderSide, Record<AccentBorderInset, string>> = {
  left: {
    none: "",
    xs: "gencl:pl-2",
    sm: "gencl:pl-3",
    md: "gencl:pl-4",
  },
  right: {
    none: "",
    xs: "gencl:pr-2",
    sm: "gencl:pr-3",
    md: "gencl:pr-4",
  },
  top: {
    none: "",
    xs: "gencl:pt-2",
    sm: "gencl:pt-3",
    md: "gencl:pt-4",
  },
  bottom: {
    none: "",
    xs: "gencl:pb-2",
    sm: "gencl:pb-3",
    md: "gencl:pb-4",
  },
};

/**
 * `state` controls the pseudo's visibility / size animation. `always`
 * is the default (static brand line). `reveal` fades the line in on
 * hover. `expand` grows the line from the leading edge to 100% on
 * hover — vertical sides grow top→bottom, horizontal sides grow
 * left→right.
 */
const STATE_BASE: Record<AccentBorderState, string> = {
  always: "gencl:before:opacity-100",
  reveal: "gencl:before:opacity-0 gencl:hover:before:opacity-100",
  expand: "gencl:before:opacity-100",
};

/**
 * Per-side overrides for `expand` — vertical sides grow height from 0
 * → full, horizontal sides grow width from 0 → full. These supersede
 * the default 100% main-axis size set by {@link SIDE_CLASS}.
 */
const EXPAND_BY_SIDE: Record<AccentBorderSide, string> = {
  left: "gencl:before:h-0 gencl:hover:before:h-full",
  right: "gencl:before:h-0 gencl:hover:before:h-full",
  top: "gencl:before:w-0 gencl:hover:before:w-full",
  bottom: "gencl:before:w-0 gencl:hover:before:w-full",
};

export const accentBorderVariants = cva(ACCENT_BORDER_BASE, {
  variants: {
    side: SIDE_CLASS,
    tone: TONE_COLOR_CLASS,
    weight: {
      thin: "gencl:[--accent-border-weight:2px]",
      medium: "gencl:[--accent-border-weight:3px]",
      thick: "gencl:[--accent-border-weight:5px]",
    },
    state: STATE_BASE,
  },
  defaultVariants: {
    side: "left",
    tone: "primary",
    weight: "medium",
    state: "always",
  },
});

/**
 * Props for {@link AccentBorder}.
 *
 * `accent-border` wraps a subtree with a single brand-colored accent
 * line on one edge. The line is rendered via a `::before` pseudo so
 * `state='reveal'` and `state='expand'` can animate without nudging
 * layout. Distinct from `<Heading decoration='ribbon'>`, which paints
 * a smaller heading-internal strap on the heading itself.
 */
export interface AccentBorderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof accentBorderVariants>, "side"> {
  /** Which side the accent appears on. Single side only — multi-side requires nested wrappers. */
  side: AccentBorderSide;
  /** Brand tone of the accent line. Defaults to 'primary'. */
  tone?: AccentBorderTone;
  /** Line thickness. Defaults to 'medium' (~3-4px). */
  weight?: AccentBorderWeight;
  /** Static, reveal-on-hover, or expand-from-leading-edge on hover. Defaults to 'always'. */
  state?: AccentBorderState;
  /** Padding from accent line to content. Closed DS scale. Defaults to 'sm'. */
  inset?: AccentBorderInset;
  /** Render as a different element via Radix Slot. */
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * Container-level accent border. Wraps `children` with a brand line on
 * one edge. Use for sponsored-content cards (`side='left'
 * state='always'`), hover-revealed underlines (`side='bottom'
 * state='expand'`), or any block needing a brand accent.
 */
export const AccentBorder = React.forwardRef<HTMLDivElement, AccentBorderProps>(function AccentBorder(
  {
    side,
    tone = "primary",
    weight = "medium",
    state = "always",
    inset = "sm",
    asChild = false,
    className,
    children,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : "div";
  const expandClass = state === "expand" ? EXPAND_BY_SIDE[side] : "";
  return (
    <Comp
      ref={ref}
      data-slot="accent-border"
      data-side={side}
      data-tone={tone}
      data-weight={weight}
      data-state={state}
      data-inset={inset}
      className={cn(
        accentBorderVariants({ side, tone, weight, state }),
        INSET_PADDING[side][inset],
        expandClass,
        className
      )}
      {...props}>
      {children}
    </Comp>
  );
});
