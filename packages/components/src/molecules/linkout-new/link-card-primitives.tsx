"use client";

/**
 * Shared primitives for `<LinkCard>` and `<ResponsiveLinkCard>`. Each owns
 * its size variants via `cva`.
 */

import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

// ── LinkCardThumb ────────────────────────────────────────────────
//
// Square thumbnail with rounded corners; the caller sets the outer
// dimensions via `className` / `style`. When `src` is missing it either
// renders `null` (default — the row reflows) or, with `fallback`, a
// generic chain-link (`ExternalLink`) placeholder so every card view
// shows the same "linkout" glyph the chip already uses.

// `gencl:block` is non-optional: the `<span>` wrapper is inline by default,
// so without it the span's line box stays 0×0 inside non-flex/grid parents
// (the panel/full-view Swiper chain) and the `absolute size-full` img renders blank.
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
  /** When set and `src` is missing, render a generic linkout (chain-link)
   *  placeholder instead of `null`. Matches the chip's no-image treatment. */
  fallback?: boolean;
  /** Placeholder colors follow the card theme. */
  theme?: "light" | "dark";
}

export function LinkCardThumb({
  src,
  alt = "",
  radius = "md",
  className,
  style,
  fallback = false,
  theme = "dark",
}: LinkCardThumbProps) {
  if (!src) {
    // No image and no fallback requested → render nothing so the row reflows.
    if (!fallback) return null;
    // Generic linkout glyph on a tinted square — same treatment as the chip
    // (pl-sml) and responsive card, so all views agree when a link has no image.
    const isDark = theme === "dark";
    const placeholderBg = isDark ? "gencl:bg-secondary-800" : "gencl:bg-secondary-100";
    const placeholderIcon = isDark ? "gencl:text-white/60" : "gencl:text-secondary-400";
    return (
      <span
        className={cn(
          thumbWrap({ radius }),
          "gencl:flex gencl:items-center gencl:justify-center",
          placeholderBg,
          className
        )}
        style={style}>
        <ExternalLink className={cn("gencl:size-6", placeholderIcon)} />
      </span>
    );
  }
  return (
    <span className={cn(thumbWrap({ radius }), className)} style={style}>
      <Image src={src} alt={alt} className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover" />
    </span>
  );
}

// ── LinkCardInlineCta ───────────────────────────────────────────
//
// 40 px dark CTA pill for the `default` / `default-active` / `expand-view`
// layouts. Trailing chevron, ellipsizing label.

// Dark surface in BOTH themes; only the hover differs so the inside
// (translucent) CTA still brightens against the video poster.
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
  onClick?: (e: React.MouseEvent) => void;
}

export function LinkCardInlineCta({ href, label, theme = "dark", className, onClick }: LinkCardInlineCtaProps) {
  // Both themes share a dark pill with white content (see `inlineCta`).
  void theme;
  const iconStrokeClass = "gencl:stroke-white";
  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={label}
      // div + JS nav instead of `<a href>`: a native link steals horizontal
      // touchmove (link-drag) and blocks Swiper's swipe, so a swipe across
      // the pill would open the link instead of advancing. Synchronous
      // `window.open` in the click avoids popup blockers.
      draggable={false}
      style={{ touchAction: "pan-y", userSelect: "none" }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        if (typeof window !== "undefined") {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e as unknown as React.MouseEvent);
          if (typeof window !== "undefined") {
            window.open(href, "_blank", "noopener,noreferrer");
          }
        }
      }}
      className={cn(inlineCta({ theme }), className)}>
      {/* Marker for the off-screen well (linkout-expand-height-well.tsx) to detect
          ellipsis truncation via scrollWidth vs clientWidth. No effect on live render. */}
      <span data-cta-label className={inlineCtaLabel}>
        {label}
      </span>
      <ChevronRight className={cn(inlineCtaArrow, iconStrokeClass)} />
    </div>
  );
}

// ── MarqueeText ──────────────────────────────────────────────────
//
// Single-line text that auto-scrolls when it overflows its container
// (used by the chip titles). Renders as a plain span when it fits.

export interface MarqueeTextProps {
  /** Text content (duplicated for the seamless loop when overflowing). */
  text: string;
  /** Outer span styling. */
  className?: string;
  /** Gap in px between the two text copies during the scroll loop. */
  gapPx?: number;
  /** Scroll speed in px/s. */
  pxPerSecond?: number;
  /**
   * Reports one full scroll pass's duration in ms once measured (`null` when
   * the text fits and isn't scrolling). Lets a caller with a fixed timer —
   * e.g. the chip's auto-advance-to-`default` — wait for at least one full
   * pass before tearing the chip down. See `[[project_linkout_marquee_reset_debug]]`.
   */
  onScrollDurationChange?: (durationMs: number | null) => void;
}

/**
 * Auto-scrolling text that activates only when content overflows.
 * Measures via ResizeObserver so the marquee turns on / off as the
 * container width changes (e.g. chip resizes in storybook).
 */
export function MarqueeText({
  text,
  className,
  gapPx = 32,
  pxPerSecond = 50,
  onScrollDurationChange,
}: MarqueeTextProps) {
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
        const next = Math.max(3, (textW + gapPx) / pxPerSecond);
        setDuration(next);
        onScrollDurationChange?.(next * 1000);
      } else {
        onScrollDurationChange?.(null);
      }
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    ro.observe(t);
    return () => ro.disconnect();
    // `onScrollDurationChange` intentionally excluded — callers pass an inline
    // setter; including it would re-run (and re-report) on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
