import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

import { GAP_CLASS, type DsSpace } from "../tokens";

/**
 * Closed minimum-height scale. Maps to an inline `minHeight` style
 * because the values include `100vh` which Tailwind's JIT cannot
 * safelist as an arbitrary `min-h-[…]` utility across the dynamic prop
 * surface.
 */
const MIN_HEIGHT_VALUE = {
  none: "0",
  sm: "180px",
  md: "300px",
  lg: "420px",
  hero: "600px",
  screen: "100vh",
} as const;

/**
 * Closed height scale. `auto` (default) emits no constraint. On
 * Stack, `'full-bleed'` is an alias for `'screen'` (100vh) — only
 * Container collapses the parent's max-width inset.
 */
const HEIGHT_VALUE = {
  auto: undefined,
  sm: "180px",
  md: "300px",
  lg: "420px",
  hero: "600px",
  screen: "100vh",
  "full-bleed": "100vh",
} as const;

export type StackMinHeight = keyof typeof MIN_HEIGHT_VALUE;
export type StackHeight = keyof typeof HEIGHT_VALUE;

/**
 * Props for the {@link Stack} layout primitive.
 *
 * `Stack` is the ergonomic shortcut for the most common "vertical list
 * of things separated by N" pattern — reach for {@link Column} when you
 * also need alignment / justification control.
 */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Vertical spacing between children. Named DS token. Defaults to `"md"` (16 px). */
  gap?: DsSpace;
  /**
   * Closed minimum-height scale. Reserves vertical space so subtrees
   * that load slowly don't collapse. Omitted ≡ no minimum.
   */
  minHeight?: StackMinHeight;
  /**
   * Closed height scale. `auto` (default) leaves the height
   * content-driven; `sm`–`hero` impose a fixed height; `screen` and
   * `full-bleed` both resolve to `100vh`.
   */
  height?: StackHeight;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
}

const BASE_CLASS = "gencl:flex gencl:flex-col";

/**
 * Vertical column with a consistent gap between children — and nothing
 * else. The ergonomic shortcut for the most common "list of things
 * separated by N" pattern.
 *
 * For alignment / justification, use {@link Column}.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack(
  { gap = "md", minHeight, height, asChild = false, className, style, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";
  const minHeightValue = minHeight ? MIN_HEIGHT_VALUE[minHeight] : undefined;
  const heightValue = height ? HEIGHT_VALUE[height] : undefined;
  const dimensionStyle: React.CSSProperties | undefined =
    minHeightValue !== undefined || heightValue !== undefined
      ? {
          ...(minHeightValue !== undefined ? { minHeight: minHeightValue } : null),
          ...(heightValue !== undefined ? { height: heightValue } : null),
        }
      : undefined;
  const mergedStyle: React.CSSProperties | undefined =
    style || dimensionStyle ? { ...style, ...dimensionStyle } : undefined;

  return (
    <Comp
      ref={ref}
      data-slot="layout-stack"
      data-min-height={minHeight}
      data-height={height}
      className={cn(BASE_CLASS, GAP_CLASS[gap], className)}
      style={mergedStyle}
      {...props}
    />
  );
});
