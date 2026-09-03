"use client";

import { Image } from "@genuin/ui/components/image";
import { Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";

import { Link } from "@genuin/components/molecules/link";

import type { IntelligenceArticleCardProps } from "./intelligence-panel.types";

const ARTICLE_LINK_FOCUS_CLASS = cn(
  "gencl:focus-visible:outline-none gencl:focus-visible:ring-2",
  "gencl:focus-visible:ring-white gencl:focus-visible:ring-offset-2 gencl:focus-visible:ring-offset-black"
);

function ArticleImage({
  article,
  layout,
  expandToFill = false,
}: Pick<IntelligenceArticleCardProps, "article" | "layout"> & { expandToFill?: boolean }) {
  return (
    <div
      data-slot="intelligence-article-image"
      className={cn(
        "gencl:relative gencl:w-full gencl:shrink-0 gencl:overflow-hidden gencl:bg-secondary-800",
        expandToFill && "gencl:grow"
      )}
      style={{ aspectRatio: layout.imageAspectRatio }}>
      <Image
        src={article.image.src}
        alt={article.image.alt}
        handleError
        className="gencl:absolute gencl:inset-0 gencl:size-full gencl:object-cover gencl:transition-transform gencl:duration-300 gencl:group-hover:scale-105"
      />
    </div>
  );
}

/**
 * Reusable Intelligence article card. The optional label and configurable
 * artwork position support both compact "Up Next" grids and image-first feeds.
 */
export function IntelligenceArticleCard({
  article,
  layout,
  label,
  imagePosition = "bottom",
  onSelect,
  className,
  style,
  ...props
}: IntelligenceArticleCardProps) {
  const isImageFirst = imagePosition === "top";

  return (
    <article
      data-slot="intelligence-article-card"
      className={cn(
        "gencl:flex gencl:min-w-0 gencl:flex-col gencl:overflow-hidden",
        "gencl:rounded-md gencl:bg-secondary-900 gencl:p-3 gencl:text-white",
        className
      )}
      style={{
        position: "relative",
        width: layout.width,
        minHeight: layout.height,
        backgroundColor: layout.backgroundColor,
        color: layout.textColor,
        ...style,
      }}
      {...props}>
      {/* Whole-card hit target: the link below stays the real, focusable one (this overlay is
          hidden from AT and the tab order), so the label and the card's padding open the article
          too instead of being dead space. The link renders after it and is positioned, so it
          still paints on top and keeps its own hover treatment. */}
      <Link
        href={article.href}
        onClick={
          onSelect
            ? (event) => {
                if (onSelect(article) !== false) event.preventDefault();
              }
            : undefined
        }
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", inset: 0 }}
      />

      {label && (
        <Text as="p" size="body-1" weight="medium">
          {label}
        </Text>
      )}

      <Link
        href={article.href}
        onClick={
          onSelect
            ? (event) => {
                if (onSelect(article) !== false) event.preventDefault();
              }
            : undefined
        }
        className={cn(
          ARTICLE_LINK_FOCUS_CLASS,
          "gencl:group gencl:flex gencl:min-w-0 gencl:flex-1 gencl:flex-col gencl:rounded-sm",
          "gencl:text-white gencl:no-underline gencl:hover:text-secondary-100",
          isImageFirst ? "gencl:gap-3" : "gencl:gap-2"
        )}
        style={{ position: "relative", color: layout.textColor }}>
        {isImageFirst && <ArticleImage article={article} layout={layout} />}

        <Text asChild size={isImageFirst ? "body-0" : "body-1"} weight="medium">
          <h3 style={{ fontSize: isImageFirst ? layout.imageFirstTitleFontSize : undefined }}>{article.title}</h3>
        </Text>

        {!isImageFirst && <ArticleImage article={article} layout={layout} expandToFill />}
      </Link>
    </article>
  );
}
