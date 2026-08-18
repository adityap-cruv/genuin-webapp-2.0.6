"use client";

import { Image } from "@genuin/ui/components/image";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { Heading, Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";
import * as React from "react";

import { Link } from "@genuin/components/molecules/link";

import { IntelligenceArticleCard } from "./intelligence-article-card";
import { IntelligencePanelShell } from "./intelligence-panel-shell";
import type {
  IntelligenceArticle,
  IntelligenceCssLength,
  IntelligenceFeaturedArticleLayout,
  IntelligencePanelProps,
  IntelligencePanelSkeletonProps,
} from "./intelligence-panel.types";

const FOCUS_CLASS = cn(
  "gencl:focus-visible:outline-none gencl:focus-visible:ring-2",
  "gencl:focus-visible:ring-white gencl:focus-visible:ring-offset-2 gencl:focus-visible:ring-offset-black"
);

function toCssLength(value: IntelligenceCssLength) {
  return typeof value === "number" ? `${value}px` : value;
}

function getResponsiveGridColumns(minimumCardWidth: IntelligenceCssLength) {
  return `repeat(auto-fit, minmax(min(${toCssLength(minimumCardWidth)}, 100%), 1fr))`;
}

type FeaturedArticleProps = {
  article: IntelligenceArticle;
  layout: IntelligenceFeaturedArticleLayout;
  readMoreLabel: string;
  onSelect?: (article: IntelligenceArticle) => void;
};

function FeaturedArticle({ article, layout, readMoreLabel, onSelect }: FeaturedArticleProps) {
  const handleSelect = onSelect
    ? (event: React.MouseEvent) => {
        event.preventDefault();
        onSelect(article);
      }
    : undefined;
  return (
    <article
      data-slot="intelligence-featured-article"
      className="gencl:relative gencl:mt-2 gencl:w-full gencl:overflow-hidden gencl:rounded-md gencl:bg-secondary-200"
      style={{ height: layout.height, clipPath: layout.clipPath }}>
      <Image
        src={article.image.src}
        alt={article.image.alt}
        handleError
        className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover gencl:grayscale"
      />
      <div
        aria-hidden="true"
        className="gencl:pointer-events-none gencl:absolute gencl:inset-0 gencl:bg-linear-to-t gencl:from-black/85 gencl:via-black/25 gencl:to-transparent"
      />

      <div className="gencl:absolute gencl:inset-x-0 gencl:bottom-0 gencl:flex gencl:flex-col gencl:items-start gencl:gap-2 gencl:p-3">
        <Link
          href={article.href}
          onClick={handleSelect}
          className={cn(
            FOCUS_CLASS,
            "gencl:max-w-3xl gencl:rounded-sm gencl:text-white gencl:no-underline gencl:hover:text-secondary-100"
          )}>
          <Heading as="h3" level="headline-4" weight="bold" className="gencl:text-body-0-semi-bold! gencl:font-bold!">
            {article.title}
          </Heading>
        </Link>

        <Link
          href={article.href}
          className={cn(
            FOCUS_CLASS,
            "gencl:inline-flex gencl:h-6 gencl:min-w-20 gencl:items-center gencl:justify-center",
            "gencl:bg-[#d4ad00] gencl:px-2 gencl:pr-4",
            "gencl:text-black gencl:no-underline",
            "gencl:transition-[filter] gencl:hover:brightness-95"
          )}
          style={{ clipPath: layout.ctaClipPath }}>
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
      className={className}
      {...props}>
      <FeaturedArticle
        article={featuredArticle}
        layout={layout.featuredArticle}
        readMoreLabel={readMoreLabel}
        onSelect={onArticleSelect}
      />

      {upNextArticles.length > 0 && (
        <div
          data-slot="intelligence-up-next-grid"
          className="gencl:mt-2 gencl:grid gencl:gap-2"
          style={{
            gridTemplateColumns: getResponsiveGridColumns(layout.upNextGrid.minimumCardWidth),
          }}>
          {upNextArticles.map((article) => (
            <IntelligenceArticleCard
              key={article.id}
              data-slot="intelligence-up-next-article"
              article={article}
              layout={layout.articleCard}
              label={upNextLabel}
              imagePosition="bottom"
              onSelect={onArticleSelect}
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
    { onClose, layout, cardCount = 4, className, "aria-busy": ariaBusy = true, ...props },
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
        className={className}
        {...props}>
        <div
          aria-hidden="true"
          className="gencl:relative gencl:mt-2 gencl:w-full gencl:overflow-hidden gencl:rounded-md gencl:bg-secondary-100"
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
            className="gencl:mt-2 gencl:grid gencl:gap-2"
            style={{
              gridTemplateColumns: getResponsiveGridColumns(layout.upNextGrid.minimumCardWidth),
            }}>
            {Array.from({ length: normalizedCardCount }, (_, index) => (
              <div
                key={index}
                className="gencl:flex gencl:flex-col gencl:gap-2 gencl:rounded-md gencl:bg-secondary-900 gencl:p-3"
                style={{ height: layout.articleCard.height }}>
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
