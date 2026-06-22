"use client";

import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronRight, Download, ExternalLink, Heart, Star } from "lucide-react";
import { useRef } from "react";

import type { LinkMetaData } from "./link-card";
import {
  useOverflowCascade,
  useResponsiveSize,
  type ResponsiveOrientation,
  type ResponsiveSize,
} from "./use-responsive-card";

// Per-size CSS values not easily expressed via Tailwind utility
// classes. Per Figma node 9322:136877. Re-used for the grid overlay
// so it lines up exactly with the card's content area.
const SIZE_PAD: Record<ResponsiveSize, number> = {
  xlarge: 24,
  large: 16,
  medium: 16,
  small: 8,
};
const SIZE_GAP_OUT: Record<ResponsiveSize, number> = {
  xlarge: 24,
  large: 16,
  medium: 12,
  small: 8,
};

// Per-size column count for the debug grid overlay (per Figma
// node 9322:136877):
//   xlarge → 5, large → 4, medium → 3, small → 3.
const SIZE_GRID_CELLS: Record<ResponsiveSize, number> = {
  xlarge: 5,
  large: 4,
  medium: 3,
  small: 3,
};

// Per-size pixel dimensions for the chip leading icons (rating ★ /
// likes ♥ / downloads ↓). Drives a `style={{ width, height }}` on
// the Lucide SVG since the icon size scales with the chip text.
const SIZE_CHIP_ICON_PX: Record<ResponsiveSize, number> = {
  xlarge: 14,
  large: 12,
  medium: 10,
  small: 9,
};

// ── cva token bundles (per-size) ─────────────────────────────────
//
// One bundle per "slot" — root / title / desc / chips / CTA — keyed
// off the `size` variant. Per Figma node 9322:136877. Aligns with
// the `cva()` pattern used in `button.tsx` / `chip.tsx` /
// `dialog.tsx` — see RESPONSIVE_LINKOUT_PLAN §4.2.

const cardRoot = cva(
  cn(
    // `z-0` (with `relative`) forces a new stacking context so the
    // grid overlay's `z-index: -1` stays confined inside the card —
    // otherwise the overlay would slip behind the parent and become
    // invisible. Per Figma node 9322:136877.
    "gencl:relative gencl:z-0 gencl:flex gencl:flex-col gencl:overflow-hidden",
    "gencl:bg-white gencl:border gencl:border-secondary-150",
    "gencl:font-[Inter,system-ui,sans-serif] gencl:text-secondary-900",
    "gencl:w-full gencl:h-full"
  ),
  {
    variants: {
      size: {
        // Card corner radius is 8px across all sizes per Figma
        // node 9621:94120 — the responsive linkout reference uses
        // a small consistent radius regardless of card size.
        xlarge: "gencl:p-6 gencl:gap-6 gencl:rounded-lg",
        large: "gencl:p-4 gencl:gap-4 gencl:rounded-lg",
        medium: "gencl:p-4 gencl:gap-3 gencl:rounded-lg",
        small: "gencl:p-2 gencl:gap-2 gencl:rounded-lg",
      },
    },
  }
);

const cardMain = cva("gencl:flex gencl:min-h-0 gencl:flex-1", {
  variants: {
    size: {
      xlarge: "gencl:gap-6",
      large: "gencl:gap-4",
      medium: "gencl:gap-3",
      small: "gencl:gap-2",
    },
    orientation: {
      landscape: "gencl:flex-row",
      portrait: "gencl:flex-col",
    },
  },
});

// Thumb container — `container-type: size` + `width/height:
// min(100cqw, 100cqh)` is applied via inline style on the JSX
// element below (Tailwind v4's arbitrary-property syntax for these
// CSS-Containment values doesn't reliably emit inside the `gencl:`
// prefix). Per Figma node 9322:136877.
const cardThumbWrap = cva(
  "gencl:relative gencl:min-w-0 gencl:min-h-0 gencl:flex gencl:items-start gencl:justify-start"
);

const cardThumbInner = cva("gencl:relative gencl:overflow-hidden gencl:bg-secondary-50 gencl:flex-none", {
  variants: {
    size: {
      xlarge: "gencl:rounded-lg",
      large: "gencl:rounded-lg",
      medium: "gencl:rounded-lg",
      small: "gencl:rounded-md",
    },
  },
});

const cardDetails = cva("gencl:flex gencl:flex-col gencl:min-w-0 gencl:min-h-0 gencl:overflow-hidden", {
  variants: {
    size: {
      xlarge: "gencl:gap-4",
      large: "gencl:gap-3",
      medium: "gencl:gap-2",
      small: "gencl:gap-1",
    },
  },
});

const cardTitle = cva("gencl:m-0 gencl:font-semibold gencl:text-secondary-900", {
  variants: {
    size: {
      xlarge: "gencl:text-[36px] gencl:leading-[44px] gencl:tracking-[-0.2px]",
      large: "gencl:text-[28px] gencl:leading-[36px] gencl:tracking-[-0.2px]",
      medium: "gencl:text-[20px] gencl:leading-[24px] gencl:tracking-[-0.1px]",
      small: "gencl:text-[14px] gencl:leading-[20px]",
    },
  },
});

const cardDesc = cva("gencl:m-0 gencl:font-medium gencl:text-secondary-700", {
  variants: {
    size: {
      xlarge: "gencl:text-[20px] gencl:leading-[24px]",
      large: "gencl:text-[16px] gencl:leading-[22px]",
      medium: "gencl:text-[12px] gencl:leading-[16px]",
      small: "gencl:text-[11px] gencl:leading-[14px]",
    },
  },
});

const cardChips = cva("gencl:flex gencl:flex-wrap gencl:font-medium gencl:text-secondary-700", {
  variants: {
    size: {
      xlarge: "gencl:gap-x-2 gencl:gap-y-1 gencl:text-[20px] gencl:leading-[24px]",
      large: "gencl:gap-x-1.5 gencl:gap-y-1 gencl:text-[16px] gencl:leading-[22px]",
      medium: "gencl:gap-x-1.5 gencl:gap-y-0.5 gencl:text-[12px] gencl:leading-[16px]",
      small: "gencl:gap-x-1 gencl:gap-y-0.5 gencl:text-[11px] gencl:leading-[14px]",
    },
  },
});

const cardCta = cva(
  cn(
    "gencl:flex gencl:items-center gencl:gap-1 gencl:bg-secondary-900",
    "gencl:text-white gencl:rounded-lg gencl:cursor-pointer gencl:no-underline",
    "gencl:font-semibold gencl:text-left"
  ),
  {
    variants: {
      size: {
        xlarge: "gencl:h-14 gencl:py-4 gencl:pl-4 gencl:pr-2 gencl:text-[20px] gencl:leading-[24px]",
        large: "gencl:h-12 gencl:py-3 gencl:pl-4 gencl:pr-2 gencl:text-[16px] gencl:leading-[22px]",
        medium: "gencl:h-10 gencl:py-2 gencl:pl-3 gencl:pr-2 gencl:text-[16px] gencl:leading-[22px]",
        small: "gencl:h-7 gencl:py-1 gencl:pl-3 gencl:pr-1 gencl:text-[14px] gencl:leading-[20px]",
      },
      // Width policy: inline-auto vs inline-stretch vs full.
      width: {
        auto: "gencl:self-start gencl:w-auto",
        stretch: "gencl:self-stretch gencl:w-full",
        full: "gencl:w-full",
      },
    },
  }
);

const cardCtaArrow = cva("gencl:flex gencl:items-center gencl:justify-center gencl:flex-none", {
  variants: {
    size: {
      xlarge: "gencl:size-6",
      large: "gencl:size-5",
      medium: "gencl:size-5",
      small: "gencl:size-4",
    },
  },
});

// ── Per-combination CTA visibility ──────────────────────────────
//
// Per Figma node 9322:136877 (CTA placement table).
// Returns which CTA variant ("inline" or "full") is shown for a
// given size + state + orientation combo, and the inline width
// policy when applicable.

type ContentState = "default" | "expand";

interface CtaPlacement {
  variant: "inline" | "full";
  width: "auto" | "stretch" | "full";
}

function pickCtaPlacement(size: ResponsiveSize, state: ContentState, orientation: ResponsiveOrientation): CtaPlacement {
  // Expand state: full-width CTA below the row, except portrait
  // shrinks to content.
  if (state === "expand") {
    return orientation === "portrait" ? { variant: "full", width: "auto" } : { variant: "full", width: "full" };
  }

  // Default state — per-size rules.
  if (size === "small") {
    // Default + small: full-width CTA spans card under thumb+title.
    return { variant: "full", width: "full" };
  }

  if (size === "medium") {
    // Default + medium horizontal: inline full-width within details.
    // Default + medium portrait: inline auto-width.
    return orientation === "portrait" ? { variant: "inline", width: "auto" } : { variant: "inline", width: "stretch" };
  }

  // Default + xlarge / large: inline content-width under title.
  return { variant: "inline", width: "auto" };
}

// ── Layout ratios (thumb : details) ─────────────────────────────
//
// Per Figma node 9322:136877 (thumb : details flex ratios).
// Returns flex grow values for the thumb and details slots.

export interface FlexRatio {
  thumb: number;
  details: number;
}

function pickFlexRatio(size: ResponsiveSize, state: ContentState, orientation: ResponsiveOrientation): FlexRatio {
  if (orientation === "landscape") {
    if (state === "default") {
      if (size === "xlarge") return { thumb: 3, details: 2 };
      if (size === "large") return { thumb: 2, details: 2 };
      return { thumb: 1, details: 2 }; // medium / small
    }
    // Expand
    if (size === "xlarge") return { thumb: 2, details: 3 };
    if (size === "large") return { thumb: 1, details: 3 };
    return { thumb: 1, details: 2 }; // medium / small
  }
  // Portrait
  if (state === "default") {
    if (size === "xlarge") return { thumb: 4, details: 1 };
    if (size === "large") return { thumb: 3, details: 1 };
    return { thumb: 2, details: 1 }; // medium / small
  }
  // Portrait + expand
  if (size === "xlarge") return { thumb: 3, details: 2 };
  if (size === "large") return { thumb: 2, details: 2 };
  return { thumb: 1, details: 2 }; // medium / small
}

// ── Chips row (flat, with bullet separators between siblings) ───

function ResponsiveChips({ data, size, className }: { data: LinkMetaData; size: ResponsiveSize; className?: string }) {
  const items: React.ReactNode[] = [];
  const push = (key: string, node: React.ReactNode) => {
    if (items.length > 0) {
      items.push(
        <span key={`sep-${key}`} className="gencl:flex gencl:items-center gencl:px-1" aria-hidden="true">
          •
        </span>
      );
    }
    items.push(node);
  };

  if (data.brand) {
    push(
      "brand",
      <span key="brand" className="gencl:whitespace-nowrap">
        {data.brand}
      </span>
    );
  }
  if (data.website) {
    push(
      "website",
      <span key="website" className="gencl:whitespace-nowrap">
        {data.website}
      </span>
    );
  }
  if (data.originalPrice || data.currentPrice) {
    push(
      "price",
      <span key="price" className="gencl:flex gencl:items-baseline gencl:gap-1 gencl:whitespace-nowrap">
        {data.originalPrice && <span className="gencl:line-through">{data.originalPrice}</span>}
        {data.currentPrice && <span>{data.currentPrice}</span>}
      </span>
    );
  }
  const iconPx = SIZE_CHIP_ICON_PX[size];
  const iconStyle: React.CSSProperties = { width: iconPx, height: iconPx };
  if (data.rating) {
    push(
      "rating",
      <span key="rating" className="gencl:flex gencl:items-center gencl:gap-1 gencl:whitespace-nowrap">
        <Star aria-hidden="true" style={iconStyle} className="gencl:shrink-0" />
        <span>{data.rating}</span>
      </span>
    );
  }
  if (data.likes) {
    push(
      "likes",
      <span key="likes" className="gencl:flex gencl:items-center gencl:gap-1 gencl:whitespace-nowrap">
        <Heart aria-hidden="true" style={iconStyle} className="gencl:shrink-0" />
        <span>{data.likes}</span>
      </span>
    );
  }
  if (data.downloads) {
    push(
      "downloads",
      <span key="downloads" className="gencl:flex gencl:items-center gencl:gap-1 gencl:whitespace-nowrap">
        <Download aria-hidden="true" style={iconStyle} className="gencl:shrink-0" />
        <span>{data.downloads}</span>
      </span>
    );
  }
  if (data.phone) {
    push(
      "phone",
      <span key="phone" className="gencl:whitespace-nowrap">
        {data.phone}
      </span>
    );
  }
  if (data.address) {
    push(
      "address",
      <span key="address" className="gencl:whitespace-nowrap">
        {data.address}
      </span>
    );
  }

  if (items.length === 0) return null;
  return <div className={cn(cardChips({ size }), className)}>{items}</div>;
}

// ── Main component ──────────────────────────────────────────────

export interface ResponsiveLinkCardProps {
  data: LinkMetaData;
  /** Caller-controlled content state — `default` hides desc + chips,
   *  `expand` shows everything. */
  state?: ContentState;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: (e: React.MouseEvent) => void;
  /** Override the auto-detected size (e.g. for static stories /
   *  visual regression). When set, skips the ResizeObserver. */
  forceSize?: ResponsiveSize;
  /** Override the auto-detected orientation. */
  forceOrientation?: ResponsiveOrientation;
  /** Storybook-only debug overlay: renders a grid of grey cells
   *  behind the card content (5 / 4 / 3 / 3 cells per size).
   *  Per Figma node 9322:136877 (debug column / row grid). */
  showGrid?: boolean;
  /** Extra classes merged onto the CTA pill. The base `cardCta`
   *  styling (dark fill, white text, rounded-lg, font-semibold) stays;
   *  this hook lets hosts override paddings, borders, or brand
   *  accents without forking the component. */
  ctaClassName?: string;
  /** Override the auto-picked thumb/details flex ratio. The default
   *  ratios are tuned for the canonical responsive scenarios
   *  (see `pickFlexRatio`); pass this when the host needs a
   *  deterministic layout — e.g. a Figma reference that uses a
   *  bigger image than the bucket's default. Values are flex-grow
   *  numbers, NOT pixels. */
  forceFlexRatio?: FlexRatio;
  /** Skip rendering the thumb / image area entirely. Used when the
   *  host composes its own preview element above the card (e.g. a
   *  separate video player) and the card should only show the
   *  title / description / chips / CTA. */
  hideThumb?: boolean;
}

export function ResponsiveLinkCard({
  data,
  state = "default",
  ctaText,
  ctaLink,
  onCtaClick,
  forceSize,
  forceOrientation,
  showGrid = false,
  ctaClassName,
  forceFlexRatio,
  hideThumb = false,
}: ResponsiveLinkCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Auto-detected size + orientation. When `forceSize` /
  // `forceOrientation` are set, the auto values are ignored —
  // useful for visual regression / static demos.
  const auto = useResponsiveSize(rootRef);
  const size = forceSize ?? auto.size;
  const orientation = forceOrientation ?? auto.orientation;

  const cta = pickCtaPlacement(size, state, orientation);
  const ratio = forceFlexRatio ?? pickFlexRatio(size, state, orientation);

  // Overflow cascade: hide desc + chips first, then CTA. The cascade
  // toggles CSS attributes (`data-hide-meta` / `data-hide-cta`) on
  // the card root; children with `group-data-…:hidden` Tailwind
  // variants hide synchronously, which lets the cascade
  // sequentially re-measure within a single tick. React still
  // renders all the elements — they're just `display: none` when
  // the cascade decides to drop them.
  //
  // The frame dimensions (`auto.w` / `auto.h`) are in the deps so
  // the cascade re-evaluates whenever the frame resizes — including
  // *within* a size bucket (e.g. 150 × 282 → 150 × 517 stays "small
  // portrait" but gains room to un-hide the CTA). Safe from the
  // measurement loop that ResizeObserver-on-details would cause:
  // the card root is `h-full w-full` of the panel, so its size
  // only changes when the FRAME changes, never when cascade
  // attributes flip CSS visibility.
  const { hideMeta, hideCta } = useOverflowCascade(rootRef, detailsRef, [
    auto.w,
    auto.h,
    size,
    state,
    orientation,
    // All `LinkMetaData` fields that surface in the rendered card —
    // any of them affects the details column's `scrollHeight` and
    // therefore the cascade decision. Listed individually so we
    // re-evaluate cleanly when the active link changes (multi-link
    // scenarios where a parent swaps the displayed `data`).
    data.title,
    data.description,
    data.brand,
    data.website,
    data.originalPrice,
    data.currentPrice,
    data.rating,
    data.likes,
    data.downloads,
    data.phone,
    data.address,
    ctaText,
  ]);

  const showDesc = state === "expand" && !!data.description;
  const showChips = state === "expand";
  const showInlineCta = cta.variant === "inline";
  const showFullCta = cta.variant === "full";

  const ctaLabel = ctaText || data.title || data.link;
  const ctaHref = ctaLink || data.link;

  const cells = SIZE_GRID_CELLS[size];
  const pad = SIZE_PAD[size];
  const gap = SIZE_GAP_OUT[size];

  return (
    <div
      ref={rootRef}
      className={cn(
        cardRoot({ size }),
        "gencl:group",
        // When the host suppresses the thumb, the card no longer has
        // a definite parent height to fill (the `<StandaloneLinkout>`
        // wrapper drops its `aspectRatio` constraint in this mode),
        // so `h-full` would collapse the card to 0. Switch to content
        // sizing instead — the title / desc / CTA drive the height.
        hideThumb && "gencl:h-auto!"
      )}
      data-state={state}
      data-orientation={orientation}
      data-size={size}
      data-hide-meta={hideMeta ? "" : undefined}
      data-hide-cta={hideCta ? "" : undefined}>
      {/* Grid overlay (storybook debug). `z-index: -1` keeps it
          behind the card content but above the white background;
          `cardRoot` establishes a stacking context (z: 0) so this
          stays scoped. Per Figma node 9322:136877. */}
      {showGrid && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: pad,
            left: pad,
            right: pad,
            bottom: pad,
            display: "grid",
            gridTemplateColumns: orientation === "landscape" ? `repeat(${cells}, 1fr)` : "1fr",
            gridTemplateRows: orientation === "portrait" ? `repeat(${cells}, 1fr)` : "1fr",
            gap: `${gap}px`,
            zIndex: -1,
            pointerEvents: "none",
          }}>
          {Array.from({ length: cells }).map((_, i) => (
            <div key={i} style={{ background: "#f4f5f6", borderRadius: 4 }} />
          ))}
        </div>
      )}

      <div
        className={cn(
          cardMain({ size, orientation }),
          // No thumb → no row to share flex with. Drop `flex-1` (which
          // requires a definite parent height) so the row sizes to
          // its content along with the rest of the card.
          hideThumb && "gencl:flex-none"
        )}>
        {!hideThumb && (
          <div
            className={cardThumbWrap()}
            // `containerType: size` + the inline `min(100cqw, 100cqh)`
            // sizing on the inner make the thumb a square that fits
            // whichever dimension of the wrap is smaller. Inline
            // styles (vs Tailwind arbitrary classes) so the values
            // emit reliably.
            style={{ flex: ratio.thumb, containerType: "size" }}>
            <div
              className={cardThumbInner({ size })}
              style={{
                width: "min(100cqw, 100cqh)",
                height: "min(100cqw, 100cqh)",
              }}>
              {data.image ? (
                <Image
                  src={data.image}
                  alt=""
                  className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover"
                />
              ) : (
                <span className="gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center">
                  <ExternalLink className="gencl:size-6 gencl:text-secondary-400" />
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={detailsRef} className={cardDetails({ size })} style={{ flex: ratio.details }}>
          <p className={cardTitle({ size })}>{data.title || data.link}</p>
          {showDesc && (
            <p className={cn(cardDesc({ size }), "gencl:group-data-[hide-meta]:hidden")}>{data.description}</p>
          )}
          {showChips && <ResponsiveChips data={data} size={size} className="gencl:group-data-[hide-meta]:hidden" />}
          {showInlineCta && (
            <ResponsiveCta
              size={size}
              width={cta.width}
              href={ctaHref}
              label={ctaLabel}
              onClick={onCtaClick}
              className={cn("gencl:group-data-[hide-cta]:hidden", ctaClassName)}
            />
          )}
        </div>
      </div>

      {showFullCta && (
        <ResponsiveCta
          size={size}
          width={cta.width}
          href={ctaHref}
          label={ctaLabel}
          onClick={onCtaClick}
          className={cn("gencl:group-data-[hide-cta]:hidden", ctaClassName)}
        />
      )}
    </div>
  );
}

function ResponsiveCta({
  size,
  width,
  href,
  label,
  onClick,
  className,
}: {
  size: ResponsiveSize;
  width: "auto" | "stretch" | "full";
  href: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(cardCta({ size, width }), className)}>
      <span
        className={cn(
          "gencl:overflow-hidden gencl:text-ellipsis gencl:whitespace-nowrap",
          width === "auto" ? "gencl:flex-[0_1_auto]" : "gencl:flex-1"
        )}>
        {label}
      </span>
      <ChevronRight className={cardCtaArrow({ size })} />
    </a>
  );
}

export type { ContentState };
