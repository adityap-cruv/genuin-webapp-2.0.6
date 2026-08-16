"use client";

import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

import { SectionHeader } from "@genuin/components/molecules/section-header";
import { HoverLinkCardList, type ContextualLinkMetaData } from "@genuin/components/organisms/hover-link-card-list";

import styles from "./contextual.module.css";

export type ContextualHeaderData = {
  iconUrl?: string | null;
  iconAlt?: string;
  heading?: ReactNode;
  subHeading?: ReactNode;
};

export interface ContextualProps extends Omit<ComponentProps<"section">, "children"> {
  header: ContextualHeaderData;
  video: ReactNode;
  articles: readonly ContextualLinkMetaData[];
  activeVideoId?: string | null;
  ctaText?: string;
  videoClassName?: string;
  articleListClassName?: string;
  articleFallback?: ReactNode;
  relatedContentLabel?: string;
  animationDurationMs?: number;
  onArticleClick?: (article: ContextualLinkMetaData, index: number) => void;
}

/**
 * Responsive context-aware media surface. The active video's matching article
 * is pinned to the first rail position and expanded; selecting another article
 * delegates the corresponding video change to the host through `onArticleClick`.
 */
export function Contextual({
  header,
  video,
  articles,
  activeVideoId,
  ctaText = "Read More",
  videoClassName,
  articleListClassName,
  articleFallback,
  relatedContentLabel = "Articles related to the active video",
  animationDurationMs = 450,
  onArticleClick,
  className,
  ...restProps
}: ContextualProps) {
  return (
    <section data-slot="contextual" className={cn(styles.root, className)} {...restProps}>
      <SectionHeader
        data-slot="contextual-header"
        className={styles.header}
        imageUrl={header.iconUrl}
        imageAlt={header.iconAlt ?? ""}
        heading={header.heading}
        subHeading={header.subHeading}
        headingStyle={{ fontSize: 20, lineHeight: 1.15 }}
        subHeadingStyle={{ fontSize: 14, lineHeight: 1.15, marginTop: 1 }}
      />

      <div
        data-slot="contextual-video"
        className={cn(
          styles.video,
          "gencl:relative gencl:overflow-hidden gencl:rounded-xl gencl:border gencl:border-secondary-150 gencl:bg-secondary-100",
          videoClassName
        )}>
        {video}
      </div>

      <aside
        data-slot="contextual-related"
        aria-label={relatedContentLabel}
        className={cn(
          styles.related,
          "gencl:rounded-xl gencl:bg-white gencl:p-2"
        )}>
        {articles.length > 0 ? (
          <HoverLinkCardList
            className={cn("gencl:size-full", articleListClassName)}
            items={articles}
            width="100%"
            height="100%"
            activeVideoId={activeVideoId}
            pinActiveItemToTop
            autoRotate={false}
            animationDurationMs={animationDurationMs}
            ctaText={ctaText}
            ariaLabel={relatedContentLabel}
            onLinkClick={onArticleClick}
          />
        ) : (
          <div
            className={cn(
              styles.fallback,
              "gencl:grid gencl:size-full gencl:place-items-center gencl:p-6 gencl:text-center gencl:text-body-2-medium gencl:text-secondary-500"
            )}>
            {articleFallback ?? "No related articles available."}
          </div>
        )}
      </aside>
    </section>
  );
}
