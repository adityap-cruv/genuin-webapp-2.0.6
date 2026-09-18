"use client";

/**
 * Shared primitives for `<LinkCard>` and `<ResponsiveLinkCard>`. Each owns
 * its size variants via `cva`.
 */

import { Image } from "@genuin/ui/components/image";
import { LinkIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

import { Link } from "@genuin/components/molecules/link";

import { useImageLoadStatus } from "./use-image-load-status";

/**
 * A linkout href is "external" when it names a host/protocol (thefoil.com,
 * mailto:, tel:, protocol-relative). Same-origin app paths (`/article/…`) are
 * internal and should navigate in the same tab, not a new one.
 */
function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:|\/\/)/.test(href);
}

// ── LinkCardThumb ────────────────────────────────────────────────
//
// Square thumbnail with rounded corners; the caller sets the outer
// dimensions via `className` / `style`. When `src` is missing OR the image
// fails to load it either renders `null` (default — the row reflows) or, with
// `fallback`, a generic chain-link (`LinkIcon`) placeholder so every card view
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
  /** When set and `src` is missing/broken, render a generic linkout
   *  (chain-link) placeholder instead of `null`. Matches the chip's treatment. */
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
  // Preload off-DOM so a dead `src` resolves to the chain glyph instead of
  // committing a broken-image box. Only `error` falls back — `pending` still
  // renders the real thumbnail so there's no chain-glyph flash before it loads.
  const srcStatus = useImageLoadStatus(src);

  if (!src || srcStatus === "error") {
    // No/broken image and no fallback requested → render nothing so the row reflows.
    if (!fallback) return null;
    const isDark = theme === "dark";
    // Figma "Thumbnail fallback" (node 9621:92218): a bare 20×20 chain glyph on
    // a TRANSPARENT ground — no colored box. FIXED 20×20 in every state so it
    // stays a consistent mark rather than blowing up on the big panel/full
    // slide. Theme-aware stroke so it reads on both the dark card body and the
    // white panel.
    const placeholderIcon = isDark ? "gencl:stroke-white" : "gencl:stroke-secondary-900";
    return (
      <span className="gencl:flex gencl:items-center gencl:justify-center gencl:shrink-0 gencl:size-5">
        <LinkIcon className={cn("gencl:size-5", placeholderIcon)} />
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
  const content = (
    <>
      {/* CTA label marquees when it overflows instead of ellipsis-truncating, so
          a long label never shrinks/demotes the linkout state (GEN-10465). Plain
          single-line span when it fits. */}
      <MarqueeText text={label} className="gencl:flex-1 gencl:min-w-0 gencl:text-body-1-semi-bold!" />
      <ChevronRight className={cn(inlineCtaArrow, iconStrokeClass)} />
    </>
  );

  // Internal app paths (`/article/…`) navigate in the SAME tab via the app
  // router (Next.js `<Link>` through the shared Link molecule) — a same-domain
  // page, not a popup. `stopPropagation` keeps the enclosing card's click (e.g.
  // play-this-video) from also firing; we don't `preventDefault`, so the router
  // still navigates. External URLs fall through to the JS `window.open` path
  // below (a native link steals the horizontal touchmove Swiper needs).
  if (!isExternalHref(href)) {
    return (
      <Link
        href={href}
        aria-label={label}
        draggable={false}
        style={{ touchAction: "pan-y", userSelect: "none" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        className={cn(inlineCta({ theme }), "gencl:no-underline", className)}>
        {content}
      </Link>
    );
  }

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
      {content}
    </div>
  );
}

// ── LinkCardTitle ────────────────────────────────────────────────
//
// Clickable linkout title. Navigates to the link's URL on click/Enter so the
// TITLE — not just the CTA — is a live link, matching production where both are
// clickable (GEN-10510). Uses the same swipe-safe `role="link"` + synchronous
// `window.open` pattern as `LinkCardInlineCta` (a native `<a href>` steals
// horizontal touchmove and blocks the sheet/carousel swipe); `onClick` still
// fires the caller's analytics. Kept as a `<p>` so callers' typography and the
// `default` card's body-height measurement are unaffected.

export interface LinkCardTitleProps {
  /** Destination URL — the link's own `link`. */
  href: string;
  /** Title text (falls back to the URL upstream). */
  text: string;
  /** Typography / clamp classes from the calling state. */
  className?: string;
  /** Analytics-only callback (navigation is handled here via `window.open`). */
  onClick?: () => void;
}

export function LinkCardTitle({ href, text, className, onClick }: LinkCardTitleProps) {
  const navigate = () => {
    onClick?.();
    if (typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <p
      role="link"
      tabIndex={0}
      aria-label={text}
      draggable={false}
      style={{ touchAction: "pan-y", userSelect: "none" }}
      // Stop pointerdown bubbling so the sheet's pointer capture doesn't swallow
      // the click before it reaches this handler (same as the chip anchors/CTA).
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        navigate();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          navigate();
        }
      }}
      className={cn("gencl:cursor-pointer", className)}>
      {text}
    </p>
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
