"use client";

/**
 * Shared primitives used by `<LinkCard>` (chip / default / expand
 * branches) and `<ResponsiveLinkCard>`. Each primitive owns its own
 * size variants via `cva` — same convention as `button.tsx` /
 * `chip.tsx` / `dialog.tsx` / `dynamic-sheet-parts.tsx`. Tracked as
 * the "optional cleanup" in RESPONSIVE_LINKOUT_PLAN.md §7.1.
 */

import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

// ── LinkCardThumb ────────────────────────────────────────────────
//
// Square thumbnail with optional rounded corners. Used by the
// `pl-sml` chip (24 px), the `default` / `default-active` composite
// (auto-square in a grid cell), the `expand-view` rich card (auto-
// square at min height 128 px), and the `panel-view` / `full-view`
// detail layout (max-w 280 px). The OUTER dimensions are always
// set by the caller via `className` (or `style`), since the
// hosting layout determines whether the thumb is fixed-size,
// aspect-square + h-full inside a grid cell, max-w-capped, etc.
//
// Returns `null` when `src` is missing — the caller's row collapses
// the thumb column so the title / description / CTA reflow to fill
// the freed space. (The chain-link `LinkIcon` lives in the sheet
// header, so the link still has visual identity without a body
// thumbnail.)

// `gencl:block` is non-optional: the wrapper is a `<span>` (default
// `display: inline`), and an inline element's bounding box for
// absolute positioning is its first line box. The inner `<img>` is
// `absolute inset-0 size-full`, so when the surrounding context
// doesn't blockify the span (e.g. when it lands inside a non-flex /
// non-grid parent like the Swiper slide chain used by `panel-view`
// / `full-view`), the span's line box stays 0 × 0, the img
// resolves to `size-full` of that zero box, and the thumb renders
// blank. Forcing `display: block` makes the span's own
// `w-full` / `h-full` / `aspect-square` sizing authoritative
// regardless of parent context.
const thumbWrap = cva("gencl:relative gencl:block gencl:overflow-hidden", {
  variants: {
    radius: {
      sm: "gencl:rounded-md", // 6 px (small)
      md: "gencl:rounded-lg", // 8 px (medium / large / xlarge / chip)
      lg: "gencl:rounded-lg", // legacy alias for "md"
    },
  },
  defaultVariants: {
    radius: "md",
  },
});

type ThumbRadius = "sm" | "md";

export interface LinkCardThumbProps {
  src?: string | null;
  alt?: string;
  /** Wrapper border-radius. */
  radius?: ThumbRadius;
  /** Outer dimensions / flex behavior — caller decides. */
  className?: string;
  style?: React.CSSProperties;
}

export function LinkCardThumb({ src, alt = "", radius = "md", className, style }: LinkCardThumbProps) {
  // No image → render nothing so the thumb area collapses and the
  // surrounding layout (title / description / CTA) reflows to fill
  // the row. The chain-link `LinkIcon` lives in the sheet header
  // (linkouts-dynamic.tsx), so the link still has visual identity
  // even without a body thumbnail.
  if (!src) return null;
  return (
    <span className={cn(thumbWrap({ radius }), className)} style={style}>
      <Image src={src} alt={alt} className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover" />
    </span>
  );
}

// ── LinkCardInlineCta ───────────────────────────────────────────
//
// Translucent / dark CTA pill used by the `default` / `default-
// active` composite (40 px tall, dark transparent bg) and the
// `expand-view` rich card (same). Trailing chevron, single-line
// label that ellipsizes. Hover state varies by theme.

// Per Figma 10075:76973 (outside default / default-active / expand)
// the inline CTA pill is the same dark gray-900 surface in BOTH
// themes — the panel surface flips white vs dark, but the button
// itself stays dark with white label + chevron. The hover state is
// kept theme-specific so the inside (overlay) translucent CTA still
// brightens against the video poster.
const inlineCta = cva(
  cn(
    "gencl:flex gencl:items-center gencl:gap-2 gencl:h-10 gencl:pl-3 gencl:pr-2 gencl:py-0.5",
    "gencl:rounded-lg gencl:no-underline"
  ),
  {
    variants: {
      theme: {
        dark: "gencl:bg-black/50 hover:gencl:bg-black/70 gencl:text-white",
        light: "gencl:bg-secondary-900 hover:gencl:bg-secondary-800 gencl:text-white",
      },
    },
    defaultVariants: {
      theme: "dark",
    },
  }
);

const inlineCtaLabel = cn(
  "gencl:flex-1 gencl:min-w-0 gencl:overflow-hidden gencl:text-ellipsis",
  "gencl:whitespace-nowrap gencl:text-body-1-semi-bold!"
);

const inlineCtaArrow = "gencl:size-6 gencl:shrink-0";

export interface LinkCardInlineCtaProps {
  href: string;
  label: string;
  theme?: "light" | "dark";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function LinkCardInlineCta({ href, label, theme = "dark", className, onClick }: LinkCardInlineCtaProps) {
  // Chevron stroke follows the label colour. Both themes now share
  // a dark pill with white content (see `inlineCta` cva above).
  void theme;
  const iconStrokeClass = "gencl:stroke-white";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // Stop pointerdown from bubbling to `<DynamicSheet>`'s content
      // div, which `setPointerCapture`s at scrollTop=0 and routes the
      // browser's `click` to itself (where it's swallowed by
      // stopPropagation). Without this stop, the anchor's `href`
      // navigation is silently dropped.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(inlineCta({ theme }), className)}>
      <span className={inlineCtaLabel}>{label}</span>
      <ChevronRight className={cn(inlineCtaArrow, iconStrokeClass)} />
    </a>
  );
}

// ── MarqueeText ──────────────────────────────────────────────────
//
// Renders single-line text that auto-scrolls horizontally (ticker
// animation) when the text overflows its container. Used by the
// pl-xs / pl-sml chip titles so long CTA labels stay legible
// instead of being clipped to an ellipsis. When the text fits the
// container, it renders as a plain inline span — no duplicate copy,
// no animation cost.

export interface MarqueeTextProps {
  /** Text content rendered (and, when overflowing, duplicated for
   *  the seamless scroll loop). */
  text: string;
  /** Outer span styling (typography, colour, flex sizing). */
  className?: string;
  /** Gap in pixels between the two text copies during the scroll
   *  loop. Also acts as the breath of space readers see between
   *  one iteration ending and the next starting. */
  gapPx?: number;
  /** Scroll speed in pixels per second. Lower = slower / more
   *  readable. */
  pxPerSecond?: number;
}

/**
 * Auto-scrolling text that activates only when content overflows.
 * Measures via ResizeObserver so the marquee turns on / off as the
 * container width changes (e.g. chip resizes in storybook).
 */
export function MarqueeText({ text, className, gapPx = 32, pxPerSecond = 50 }: MarqueeTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [duration, setDuration] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const t = textRef.current;
    if (!container || !t) return;
    const recompute = () => {
      const textW = t.offsetWidth;
      const containerW = container.clientWidth;
      // +1 px tolerance for subpixel rounding so we don't flicker
      // marquee on at the exact-fit boundary.
      const overflowing = textW > containerW + 1;
      setNeedsScroll(overflowing);
      if (overflowing) {
        setDuration(Math.max(3, (textW + gapPx) / pxPerSecond));
      }
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    ro.observe(t);
    return () => ro.disconnect();
  }, [text, gapPx, pxPerSecond]);

  return (
    <span
      ref={containerRef}
      className={cn("gencl:relative gencl:block gencl:overflow-hidden gencl:whitespace-nowrap", className)}>
      {needsScroll && (
        <style>{`@keyframes linkout-marquee-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      )}
      <span
        className="gencl:inline-flex gencl:max-w-none"
        style={needsScroll ? { animation: `linkout-marquee-x ${duration}s linear infinite` } : undefined}>
        <span
          ref={textRef}
          className="gencl:inline-block gencl:shrink-0"
          style={needsScroll ? { paddingRight: gapPx } : undefined}>
          {text}
        </span>
        {needsScroll && (
          <span aria-hidden className="gencl:inline-block gencl:shrink-0" style={{ paddingRight: gapPx }}>
            {text}
          </span>
        )}
      </span>
    </span>
  );
}
