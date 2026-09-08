"use client";

import { Image } from "@genuin/ui/components/image";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import * as React from "react";

import { Link } from "@genuin/components/molecules/link";

import { IntelligenceArticleCard } from "./intelligence-article-card";
import { IntelligencePanelShell } from "./intelligence-panel-shell";
import type {
  IntelligenceCssLength,
  IntelligenceFeaturedArticleProps,
  IntelligencePanelProps,
  IntelligencePanelSkeletonProps,
} from "./intelligence-panel.types";

/**
 * Shared phone treatment for every Intelligence card collection: a snapping
 * horizontal rail below `sm`, the surface's own layout from `sm` up.
 *
 * On a phone these collections only fit one column, so stacking them buries the
 * rest of the panel below the fold. Sideways keeps the whole panel on one screen
 * and makes "there is more here" legible.
 *
 * Two details carry that legibility:
 *
 * - **Full bleed.** `-mx-2` cancels `IntelligencePanelShell`'s `p-2` so cards run
 *   off the panel's rounded edge instead of stopping dead inside its gutter — a
 *   card sliced flush against the border reads as a rendering fault, one
 *   disappearing under the edge reads as scrollable content. `px-2` puts the
 *   first card back in line with the featured artwork above it, and
 *   `scroll-px-2` keeps snap positions honest against that padding.
 * - **A card wide enough to set type.** Narrower cards wrap a headline to three
 *   lines and squeeze the artwork into a strip. The width leaves room for two
 *   lines and still shows a definite slice of the next card.
 *
 * Breakpoints rather than a `useMediaQuery`, so server and client render the same
 * markup and the layout keeps tracking the viewport on resize.
 */
export const INTELLIGENCE_RAIL_CLASS = cn(
  "gencl:-mx-2 gencl:flex gencl:snap-x gencl:snap-mandatory gencl:gap-2 gencl:px-2",
  "gencl:overflow-x-auto gencl:overscroll-x-contain gencl:scroll-smooth gencl:scroll-px-2",
  "gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden"
);

/** Hands the layout back to the surface's own rules from `sm` up, for phone-only rails. */
export const INTELLIGENCE_RAIL_SM_RESET_CLASS = cn(
  "gencl:sm:mx-0! gencl:sm:snap-none! gencl:sm:px-0! gencl:sm:scroll-px-0!"
);

/** Card sizing on the rail. A surface that sets its own card width overrides it. */
export const INTELLIGENCE_RAIL_ITEM_CLASS = cn("gencl:w-[74%] gencl:max-w-[15.5rem] gencl:shrink-0 gencl:snap-start");

/** Pairs with `INTELLIGENCE_RAIL_SM_RESET_CLASS`: the surface takes the card width back at `sm`. */
export const INTELLIGENCE_RAIL_ITEM_SM_RESET_CLASS = cn("gencl:sm:w-auto! gencl:sm:max-w-none!");

const FOCUS_CLASS = cn(
  "gencl:focus-visible:outline-none gencl:focus-visible:ring-2",
  "gencl:focus-visible:ring-white gencl:focus-visible:ring-offset-2 gencl:focus-visible:ring-offset-black"
);

/** Phone rail that returns to the original responsive grid from `sm` up. */
const UP_NEXT_CONTAINER_CLASS = cn(
  INTELLIGENCE_RAIL_CLASS,
  INTELLIGENCE_RAIL_SM_RESET_CLASS,
  "gencl:mt-2 gencl:min-h-0 gencl:flex-1 gencl:sm:grid! gencl:sm:overflow-x-visible!",
  "gencl:sm:overscroll-x-auto! gencl:sm:scroll-auto!"
);

const MOBILE_FILL_CONTENT_CLASS = "gencl:flex gencl:flex-col gencl:sm:block!";

const RESPONSIVE_UP_NEXT_ITEM_CLASS = cn(
  "gencl:w-[var(--intelligence-up-next-mobile-width)]! gencl:max-w-none!",
  "gencl:sm:w-[var(--intelligence-up-next-desktop-width)]!"
);

type UpNextItemStyle = React.CSSProperties & {
  "--intelligence-up-next-mobile-width"?: string;
  "--intelligence-up-next-desktop-width"?: string;
};

function toCssLength(value: IntelligenceCssLength): string {
  return typeof value === "number" ? `${value}px` : value;
}

function getUpNextItemStyle(
  minimumCardWidth: IntelligenceCssLength,
  mobileCardWidth?: IntelligenceCssLength,
  desktopCardWidth?: IntelligenceCssLength
): UpNextItemStyle {
  return {
    "--intelligence-up-next-mobile-width": toCssLength(mobileCardWidth ?? minimumCardWidth),
    "--intelligence-up-next-desktop-width": desktopCardWidth === undefined ? "auto" : toCssLength(desktopCardWidth),
  };
}

function getResponsiveGridColumns(minimumCardWidth: IntelligenceCssLength): string {
  return `repeat(auto-fit, minmax(min(${toCssLength(minimumCardWidth)}, 100%), 1fr))`;
}

export function IntelligenceFeaturedArticle({
  article,
  layout,
  readMoreLabel = "Read more",
  onSelect,
  className,
  style,
  ...props
}: IntelligenceFeaturedArticleProps) {
  const handleSelect = onSelect
    ? (event: React.MouseEvent) => {
        if (onSelect(article) !== false) event.preventDefault();
      }
    : undefined;
  return (
    <article
      data-slot="intelligence-featured-article"
      className={cn(
        "gencl:relative gencl:w-full gencl:max-w-full gencl:overflow-hidden gencl:rounded-md gencl:bg-secondary-200",
        className
      )}
      style={{ width: layout.width, height: layout.height, clipPath: layout.clipPath, ...style }}
      {...props}>
      <Image
        src={article.image.src}
        alt={article.image.alt}
        handleError
        className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover"
      />
      <div
        aria-hidden="true"
        className="gencl:pointer-events-none gencl:absolute gencl:inset-0 gencl:bg-linear-to-t gencl:from-black/85 gencl:via-black/25 gencl:to-transparent"
      />

      {/* Whole-card hit target. The headline and CTA below stay the real, focusable links (this one
          is hidden from AT and the tab order); it only makes the artwork and every other pixel of
          the card open the article, instead of just the two small text targets. */}
      <Link
        href={article.href}
        onClick={handleSelect}
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />

      <div
        className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:flex gencl:flex-col gencl:items-start gencl:gap-2 gencl:p-3"
        // Empty space beside the headline falls through to the overlay; the links opt back in.
        style={{ zIndex: 2, pointerEvents: "none" }}>
        <Link
          href={article.href}
          onClick={handleSelect}
          className={cn(
            FOCUS_CLASS,
            "gencl:max-w-3xl gencl:rounded-sm gencl:text-white gencl:no-underline gencl:hover:text-secondary-100"
          )}
          style={{ color: layout.headingTextColor, pointerEvents: "auto" }}>
          <Text asChild size="body-0" weight="bold">
            <h3 className="gencl:line-clamp-2" style={{ fontSize: layout.headingFontSize }}>
              {article.title}
            </h3>
          </Text>
        </Link>

        <Link
          href={article.href}
          onClick={handleSelect}
          className={cn(
            FOCUS_CLASS,
            "gencl:inline-flex gencl:h-6 gencl:min-w-20 gencl:items-center gencl:justify-center",
            "gencl:bg-[#d4ad00] gencl:px-2 gencl:pr-4",
            "gencl:text-black gencl:no-underline",
            "gencl:transition-[filter] gencl:hover:brightness-95"
          )}
          style={{
            clipPath: layout.ctaClipPath,
            backgroundColor: layout.ctaBackgroundColor,
            color: layout.ctaTextColor,
            pointerEvents: "auto",
          }}>
          <Text as="span" size="body-4" weight="medium" style={{ fontSize: layout.ctaFontSize }}>
            {readMoreLabel}
          </Text>
        </Link>
      </div>
    </article>
  );
}

/**
 * Scrollable editorial panel containing one featured Intelligence article and
 * a container-responsive grid of secondary articles. Data fetching, panel
 * visibility, and close-state ownership remain with the consumer.
 */
export const IntelligencePanel = React.forwardRef<HTMLElement, IntelligencePanelProps>(function IntelligencePanel(
  {
    featuredArticle,
    upNextArticles,
    layout,
    onClose,
    readMoreLabel = "Read more",
    upNextLabel = "Up Next",
    onArticleSelect,
    scrollContentClassName,
    className,
    ...props
  },
  ref
) {
  return (
    <IntelligencePanelShell
      ref={ref}
      data-slot="intelligence-panel"
      size={layout.panel}
      onClose={onClose}
      scrollContentClassName={cn(MOBILE_FILL_CONTENT_CLASS, scrollContentClassName)}
      className={className}
      {...props}>
      <IntelligenceFeaturedArticle
        article={featuredArticle}
        layout={layout.featuredArticle}
        readMoreLabel={readMoreLabel}
        onSelect={onArticleSelect}
        className="gencl:mt-2 gencl:shrink-0"
      />

      {upNextArticles.length > 0 && (
        <div
          data-slot="intelligence-up-next-grid"
          className={UP_NEXT_CONTAINER_CLASS}
          style={{ gridTemplateColumns: getResponsiveGridColumns(layout.upNextGrid.minimumCardWidth) }}>
          {upNextArticles.map((article) => (
            <IntelligenceArticleCard
              key={article.id}
              data-slot="intelligence-up-next-article"
              article={article}
              layout={layout.articleCard}
              label={upNextLabel}
              imagePosition="bottom"
              onSelect={onArticleSelect}
              className={cn(
                INTELLIGENCE_RAIL_ITEM_CLASS,
                INTELLIGENCE_RAIL_ITEM_SM_RESET_CLASS,
                RESPONSIVE_UP_NEXT_ITEM_CLASS
              )}
              style={getUpNextItemStyle(
                layout.upNextGrid.minimumCardWidth,
                layout.upNextGrid.mobileCardWidth,
                layout.articleCard.width
              )}
            />
          ))}
        </div>
      )}
    </IntelligencePanelShell>
  );
});

/** Loading placeholder that preserves panel dimensions and header actions. */
export const IntelligencePanelSkeleton = React.forwardRef<HTMLElement, IntelligencePanelSkeletonProps>(
  function IntelligencePanelSkeleton(
    { onClose, layout, cardCount = 4, scrollContentClassName, className, "aria-busy": ariaBusy = true, ...props },
    ref
  ) {
    const normalizedCardCount = Math.max(0, Math.floor(cardCount));

    return (
      <IntelligencePanelShell
        ref={ref}
        data-slot="intelligence-panel-skeleton"
        size={layout.panel}
        aria-busy={ariaBusy}
        onClose={onClose}
        scrollContentClassName={cn(MOBILE_FILL_CONTENT_CLASS, scrollContentClassName)}
        className={className}
        {...props}>
        <div
          aria-hidden="true"
          className="gencl:relative gencl:mt-2 gencl:w-full gencl:shrink-0 gencl:overflow-hidden gencl:rounded-md gencl:bg-secondary-100"
          style={{ height: layout.featuredArticle.height, clipPath: layout.featuredArticle.clipPath }}>
          <Skeleton className="gencl:absolute gencl:inset-0 gencl:size-full gencl:rounded-none" />
          <div className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:flex gencl:flex-col gencl:gap-2 gencl:p-3">
            <Skeleton className="gencl:h-5 gencl:w-4/5 gencl:rounded-md" />
            <Skeleton className="gencl:h-5 gencl:w-3/5 gencl:rounded-md" />
            <Skeleton className="gencl:h-7 gencl:w-24 gencl:rounded-none" />
          </div>
        </div>

        {normalizedCardCount > 0 && (
          <div
            aria-hidden="true"
            data-slot="intelligence-up-next-skeleton-grid"
            className={UP_NEXT_CONTAINER_CLASS}
            style={{ gridTemplateColumns: getResponsiveGridColumns(layout.upNextGrid.minimumCardWidth) }}>
            {Array.from({ length: normalizedCardCount }, (_, index) => (
              <div
                key={index}
                className={cn(
                  "gencl:flex gencl:flex-col gencl:gap-2 gencl:rounded-md gencl:bg-secondary-900 gencl:p-3",
                  INTELLIGENCE_RAIL_ITEM_CLASS,
                  INTELLIGENCE_RAIL_ITEM_SM_RESET_CLASS,
                  RESPONSIVE_UP_NEXT_ITEM_CLASS
                )}
                style={{
                  ...getUpNextItemStyle(layout.upNextGrid.minimumCardWidth, layout.upNextGrid.mobileCardWidth),
                  minHeight: layout.articleCard.height,
                }}>
                <Skeleton className="gencl:h-5 gencl:w-20 gencl:rounded-md" />
                <Skeleton className="gencl:h-5 gencl:w-full gencl:rounded-md" />
                <Skeleton className="gencl:h-5 gencl:w-4/5 gencl:rounded-md" />
                <Skeleton
                  className="gencl:mt-auto gencl:w-full gencl:rounded-none"
                  style={{ aspectRatio: layout.articleCard.imageAspectRatio }}
                />
              </div>
            ))}
          </div>
        )}
      </IntelligencePanelShell>
    );
  }
);
