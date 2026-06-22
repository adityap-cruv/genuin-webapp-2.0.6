import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@genuin/ui/lib/utils";

import { MAX_W_CLASS, PX_CLASS, isNamedMaxW, type ContainerMaxW, type DsSpace } from "../tokens";

/**
 * The subset of `DsSpace` accepted by {@link ContainerProps.px}. The
 * design system's tightest spacings (`xxs`, `ml`, `xxl`) are
 * deliberately excluded from horizontal-padding usage to keep
 * Container's edge inset on a coarser ladder than the in-content
 * spacing scale.
 */
export type ContainerPx = Extract<DsSpace, "none" | "xs" | "sm" | "md" | "lg" | "xl">;

/**
 * Closed minimum-height scale. Maps to an inline `minHeight` style.
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
 * Closed height scale. `auto` (default) leaves the height
 * content-driven; `sm`–`hero` impose a fixed pixel height; `screen`
 * resolves to `100vh`. `'full-bleed'` resolves to `100vh` AND removes
 * Container's max-width inset by overriding it with `100vw` plus a
 * symmetric negative margin (the standard CSS "break out of a
 * centered max-width" trick) so the container fills the viewport.
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

export type ContainerMinHeight = keyof typeof MIN_HEIGHT_VALUE;
export type ContainerHeight = keyof typeof HEIGHT_VALUE;

/**
 * Props for the {@link Container} layout primitive — a max-width
 * content wrapper with horizontal centering and inset padding. The
 * page-level "don't let content stretch wider than X" primitive.
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Max width — named breakpoint token, `"full"`, or a raw CSS
   * length escape hatch (e.g. `"960px"`). Defaults to `"desktop"`.
   *
   * Named tokens align 1:1 with the Hierarchical Tree's canonical
   * breakpoint set (`HIERARCHICAL_TREE_SPEC.md` §2.8) so a
   * `<Container maxW="desktop">` targets the exact Figma desktop
   * frame without a px literal.
   */
  maxW?: ContainerMaxW;
  /** Horizontal padding inside the container. Named DS token. Defaults to `"md"`. */
  px?: ContainerPx;
  /**
   * Closed minimum-height scale. Reserves vertical space so subtrees
   * that load slowly don't collapse. Omitted ≡ no minimum.
   */
  minHeight?: ContainerMinHeight;
  /**
   * Closed height scale. `auto` (default) is content-driven;
   * `sm`–`hero` impose a fixed pixel height; `screen` is `100vh`.
   * `'full-bleed'` resolves to `100vh` AND cancels the container's
   * max-width inset so the content fills the viewport edge-to-edge —
   * use sparingly for hero sections that should break out of the
   * centered max-width.
   */
  height?: ContainerHeight;
  /** Render as a different element (e.g. `<main>`, `<section>`). */
  asChild?: boolean;
}

const BASE_CLASS = "gencl:mx-auto gencl:w-full";

/**
 * Max-width content wrapper with horizontal centering and inset
 * padding. The page-level "don't let content stretch wider than X"
 * primitive.
 *
 * Raw-string `maxW` values (e.g. `"960px"`) fall through to inline
 * `style.maxWidth` because Tailwind can't safelist arbitrary length
 * tokens at build time.
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { maxW = "desktop", px = "md", minHeight, height, asChild = false, className, style, ...props },
  ref
) {
  const Comp = asChild ? Slot : "div";

  const namedMaxWClass = isNamedMaxW(maxW) ? MAX_W_CLASS[maxW] : undefined;
  const minHeightValue = minHeight ? MIN_HEIGHT_VALUE[minHeight] : undefined;
  const heightValue = height ? HEIGHT_VALUE[height] : undefined;
  // `full-bleed` is the only height value that also rewrites the
  // container's horizontal sizing — it cancels the named max-width
  // class via inline `maxWidth: 100vw` plus a `100vw` symmetric
  // negative-margin trick so the content reaches both viewport edges
  // even when nested inside an already-centered parent.
  const fullBleedStyle: React.CSSProperties | undefined =
    height === "full-bleed"
      ? {
          maxWidth: "100vw",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
        }
      : undefined;
  const dimensionStyle: React.CSSProperties | undefined =
    minHeightValue !== undefined || heightValue !== undefined
      ? {
          ...(minHeightValue !== undefined ? { minHeight: minHeightValue } : null),
          ...(heightValue !== undefined ? { height: heightValue } : null),
        }
      : undefined;

  const inlineStyle: React.CSSProperties | undefined = (() => {
    const rawMaxWStyle = isNamedMaxW(maxW) ? undefined : { maxWidth: maxW };
    if (!style && !rawMaxWStyle && !dimensionStyle && !fullBleedStyle) return undefined;
    return { ...style, ...rawMaxWStyle, ...dimensionStyle, ...fullBleedStyle };
  })();

  return (
    <Comp
      ref={ref}
      data-slot="layout-container"
      data-min-height={minHeight}
      data-height={height}
      className={cn(BASE_CLASS, namedMaxWClass, PX_CLASS[px], className)}
      style={inlineStyle}
      {...props}
    />
  );
});
