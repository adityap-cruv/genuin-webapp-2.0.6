import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Colour tone of a link. Maps onto the Genuin DS palette — `default`
 * picks the brand action colour, `subtle` picks a muted gray, and
 * `inverted` flips to white for use on dark backgrounds.
 */
export type LinkTone = "default" | "subtle" | "inverted";

/** Font weight of the link text. Mirrors {@link TypographyWeight}. */
export type LinkWeight = "medium" | "semibold" | "bold";

/**
 * Underline behaviour. `hover` is the most common default — the link
 * has no underline at rest but reveals one on hover / focus.
 */
export type LinkUnderline = "always" | "hover" | "none";

const TONE_CLASS: Record<LinkTone, string> = {
  default: "gencl:text-primary-600 gencl:hover:text-primary-700",
  subtle: "gencl:text-secondary-600 gencl:hover:text-secondary-900",
  inverted: "gencl:text-white gencl:hover:text-secondary-100",
};

const WEIGHT_CLASS: Record<LinkWeight, string> = {
  medium: "gencl:font-medium",
  semibold: "gencl:font-semibold",
  bold: "gencl:font-bold",
};

const UNDERLINE_CLASS: Record<LinkUnderline, string> = {
  always: "gencl:underline gencl:underline-offset-2",
  hover: "gencl:no-underline gencl:underline-offset-2 gencl:hover:underline",
  none: "gencl:no-underline",
};

/**
 * Base classes — focus-visible ring is deliberately preserved (never
 * suppress the focus outline without a visible replacement).
 */
const BASE_CLASS =
  "gencl:inline gencl:cursor-pointer gencl:transition-colors gencl:focus-visible:outline-none gencl:focus-visible:ring-2 gencl:focus-visible:ring-primary-400 gencl:focus-visible:ring-offset-2 gencl:rounded-sm";

/** External-link affordance — small upward arrow appended after the text. */
const EXTERNAL_AFTER_CLASS = "gencl:after:content-['↗'] gencl:after:ml-0.5";

/**
 * Props for the {@link Link} typography primitive.
 *
 * Framework-agnostic by design — `Link` renders a plain `<a>`. For
 * client-side routing inside the webapp, wrap a `next/link` with
 * `asChild`. The web-sdk uses the bare `<a>`.
 */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Anchor URL. Required when not using `asChild`. */
  href?: string;
  /** Colour tone. Defaults to `"default"` (brand action colour). */
  tone?: LinkTone;
  /** Font weight. Defaults to `"medium"`. */
  weight?: LinkWeight;
  /** Underline behaviour. Defaults to `"hover"`. */
  underline?: LinkUnderline;
  /**
   * When `true`, emits `target="_blank"` + `rel="noopener noreferrer"`
   * and appends a visual external-link affordance. Honours an explicit
   * `target` / `rel` if the consumer also passes one.
   */
  external?: boolean;
  /** Render as a different element (uses Radix Slot for polymorphism). */
  asChild?: boolean;
  children: React.ReactNode;
}

/**
 * Inline link primitive — a typography-aware anchor with consistent
 * colour, weight, and underline behaviour. Framework-agnostic on
 * purpose: pages that need client-side routing wrap a `next/link` via
 * `asChild`; SDK consumers get the plain `<a>` semantics.
 *
 * Focus visibility is preserved with a `focus-visible:ring-*` class —
 * never suppress the browser's focus outline without an equivalent
 * visible replacement.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    tone = "default",
    weight = "medium",
    underline = "hover",
    external = false,
    asChild = false,
    className,
    target,
    rel,
    children,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot : "a";

  // Honour an explicit target / rel if the consumer passed one; otherwise
  // fall back to the safe `_blank` + `noopener noreferrer` defaults for
  // external links.
  const resolvedTarget = target ?? (external ? "_blank" : undefined);
  const resolvedRel = rel ?? (external ? "noopener noreferrer" : undefined);

  return (
    <Comp
      ref={ref}
      data-slot="link"
      className={cn(
        BASE_CLASS,
        TONE_CLASS[tone],
        WEIGHT_CLASS[weight],
        UNDERLINE_CLASS[underline],
        external && EXTERNAL_AFTER_CLASS,
        className
      )}
      target={resolvedTarget}
      rel={resolvedRel}
      {...props}>
      {children}
    </Comp>
  );
});
