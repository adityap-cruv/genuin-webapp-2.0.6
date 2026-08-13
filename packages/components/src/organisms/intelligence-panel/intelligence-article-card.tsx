"use client";

import { Image } from "@genuin/ui/components/image";
import { Heading, Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";

import { Link } from "@genuin/components/molecules/link";

import type { IntelligenceArticleCardProps } from "./intelligence-panel.types";

const ARTICLE_LINK_FOCUS_CLASS = cn(
  "gencl:focus-visible:outline-none gencl:focus-visible:ring-2",
  "gencl:focus-visible:ring-white gencl:focus-visible:ring-offset-2 gencl:focus-visible:ring-offset-black"
);

function ArticleImage({ article, layout }: Pick<IntelligenceArticleCardProps, "article" | "layout">) {
  return (
    <div
      className="gencl:relative gencl:w-full gencl:shrink-0 gencl:overflow-hidden gencl:bg-secondary-800"
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
  className,
  style,
  ...props
}: IntelligenceArticleCardProps) {
  return (
    <article
      data-slot="intelligence-article-card"
      className={cn(
        "gencl:flex gencl:min-w-0 gencl:flex-col gencl:overflow-hidden",
        "gencl:rounded-md gencl:bg-secondary-900 gencl:p-3 gencl:text-white",
        className
      )}
      style={{ height: layout.height, ...style }}
      {...props}>
      {label && (
        <Text as="p" size="body-0" weight="medium" className="gencl:font-normal!">
          {label}
        </Text>
      )}

      <Link
        href={article.href}
        className={cn(
          ARTICLE_LINK_FOCUS_CLASS,
          "gencl:group gencl:flex gencl:min-w-0 gencl:flex-1 gencl:flex-col gencl:rounded-sm",
          "gencl:text-white gencl:no-underline gencl:hover:text-secondary-100",
          imagePosition === "top" && "gencl:gap-3"
        )}>
        {imagePosition === "top" && <ArticleImage article={article} layout={layout} />}

        <Heading
          as="h3"
          level="headline-4"
          weight="bold"
          className="gencl:text-body-1-bold! gencl:leading-5! gencl:font-bold!">
          {article.title}
        </Heading>

        {imagePosition === "bottom" && (
          <div className="gencl:mt-auto">
            <ArticleImage article={article} layout={layout} />
          </div>
        )}
      </Link>
    </article>
  );
}
