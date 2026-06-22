import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Tone → Tailwind background utility map. Brand-keyed tones (`subtle`,
 * `brand-tint`, `brand-strong`, `accent-strong`) map straight to the
 * brand variables under the active theme cascade (`.theme-<slug>`) so
 * a publisher's palette flows through automatically with no per-tone
 * theme overrides. The `inverse` tone deliberately resolves to a
 * theme-independent near-black (`--gencl-black`) so dark strips don't
 * collapse into a low-contrast olive/burgundy when a publisher's
 * `--gencl-secondary-900` is itself coloured (e.g. Planet Fitness
 * resolves `secondary-900` to a dark olive `#4d430c` — useless as a
 * "dark" tone).
 *
 * `inverse` and `brand-strong` additionally flip the foreground to
 * white because both backgrounds are too dark for the inherited body
 * color to remain accessible. `accent-strong` flips to near-black
 * because the accent (e.g. Planet Fitness yellow) is bright enough
 * that white-on-accent would fail AA contrast. `subtle` and
 * `brand-tint` keep the inherited text color.
 */
const TONE_CLASS = {
  none: "gencl:bg-transparent",
  subtle: "gencl:bg-secondary-50",
  inverse: "gencl:bg-black gencl:text-white",
  "brand-tint": "gencl:bg-primary-100",
  "brand-strong": "gencl:bg-primary gencl:text-white",
  "accent-strong": "gencl:bg-secondary-500 gencl:text-black",
} as const;

/**
 * Closed border-radius scale. Mirrors the DS radius tokens already in
 * use across `image` and `chip`.
 */
const RADIUS_CLASS = {
  none: "gencl:rounded-none",
  sm: "gencl:rounded-sm",
  md: "gencl:rounded-md",
  lg: "gencl:rounded-lg",
  full: "gencl:rounded-full",
} as const;

/**
 * Internal-padding scale. Closed DS spacing scale — the agent cannot
 * emit a one-off pixel value. `none` is rendered as an explicit
 * `p-0` so the data-attribute and class state stay consistent.
 */
const PADDING_CLASS = {
  none: "gencl:p-0",
  xs: "gencl:p-1",
  sm: "gencl:p-2",
  md: "gencl:p-4",
  lg: "gencl:p-6",
  xl: "gencl:p-8",
} as const;

type SurfaceTone = keyof typeof TONE_CLASS;
type SurfaceRadius = keyof typeof RADIUS_CLASS;
type SurfacePadding = keyof typeof PADDING_CLASS;

/**
 * Closed minimum-height scale. Maps to an inline `minHeight` style
 * because the values include `100vh` which Tailwind's JIT cannot
 * safelist as an arbitrary `min-h-[…]` utility across the dynamic prop
 * surface. `none` is rendered as `0` so the data-attribute and effective
 * style stay consistent.
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
 * Surface, `'full-bleed'` is an alias for `'screen'` (100vh) — only
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

type SurfaceMinHeight = keyof typeof MIN_HEIGHT_VALUE;
type SurfaceHeight = keyof typeof HEIGHT_VALUE;

export const surfaceVariants = cva("", {
  variants: {
    tone: TONE_CLASS,
    radius: RADIUS_CLASS,
    padding: PADDING_CLASS,
  },
  defaultVariants: {
    tone: "subtle",
    radius: "md",
    padding: "md",
  },
});

/**
 * Props for {@link Surface}.
 *
 * `surface` is a container-level fill primitive — it wraps a subtree
 * with a tinted background, rounded corners, and internal padding.
 * Parallels {@link AccentBorder} (border decoration). The two
 * primitives compose: nest a `surface` inside an `accent-border` (or
 * vice versa) for blocks that need both fill and edge accent.
 */
export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof surfaceVariants> {
  /** Background tone. Closed enum. Defaults to 'subtle'. */
  tone?: SurfaceTone;
  /** Border radius. Defaults to 'md'. */
  radius?: SurfaceRadius;
  /** Internal padding. Closed DS scale. Defaults to 'md'. */
  padding?: SurfacePadding;
  /**
   * Closed minimum-height scale. `none` (default behaviour when
   * omitted) imposes no minimum; `sm`–`hero` map to a fixed pixel
   * floor (180/300/420/600px). Reserves vertical space so subtrees
   * that load slowly don't collapse.
   */
  minHeight?: SurfaceMinHeight;
  /**
   * Closed height scale. `auto` (default) leaves the height
   * content-driven. `sm`–`hero` impose a fixed height; `screen` and
   * `full-bleed` both resolve to `100vh` (on Container, `full-bleed`
   * additionally cancels the parent's max-width inset).
   */
  height?: SurfaceHeight;
  /** Render as a different element via Radix Slot. */
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * Container-level fill decoration. Wraps `children` with a tinted
 * background, rounded corners, and internal padding. Use for sidebar
 * panels (`tone='subtle'`), BREAKING badges (`tone='brand-strong'`),
 * stat tiles (`tone='brand-tint'`), saturated accent bands like the
 * Planet Fitness yellow "more for your membership" strip
 * (`tone='accent-strong'`), or dark-mode strips (`tone='inverse'`).
 */
export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  {
    tone = "subtle",
    radius = "md",
    padding = "md",
    minHeight,
    height,
    asChild = false,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : "div";
  // Inline style for the closed dimension scales — Tailwind cannot
  // safelist arbitrary `min-h-[…]` / `h-[…]` values across the prop
  // surface, and emitting raw px utility classes would violate the
  // closed-vocabulary rule the Hierarchical Tree relies on.
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
      data-slot="surface"
      data-tone={tone}
      data-radius={radius}
      data-padding={padding}
      data-min-height={minHeight}
      data-height={height}
      className={cn(surfaceVariants({ tone, radius, padding }), className)}
      style={mergedStyle}
      {...props}>
      {children}
    </Comp>
  );
});
