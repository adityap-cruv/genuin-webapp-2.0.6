"use client";

import { Image } from "@genuin/ui/components/image";
import { Heading, Text } from "@genuin/ui/components/typography";
import { cn } from "@genuin/ui/lib/utils";

import type { Article, ArticleBlock } from "./article-data";

/** Shared reader entrance motion; both route and inline compositions opt into it. */
export const ARTICLE_READER_MOTION_CSS = `
.gen-article-reveal {
  opacity: 0;
  animation: gen-article-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.gen-article-reveal-delay-1 { animation-delay: 80ms; }
.gen-article-reveal-delay-2 { animation-delay: 160ms; }
.gen-article-reveal-delay-3 { animation-delay: 240ms; }
@keyframes gen-article-rise {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .gen-article-reveal { opacity: 1; animation: none; }
}
`;

const KIND_LABEL: Record<Article["kind"], string> = {
  news: "News",
  interview: "Interview",
  podcast: "Podcast",
  event: "Event",
};

/** One route-neutral body block shared by full-page and inline article readers. */
function ArticleBodyBlock({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") {
    return (
      <Heading as="h2" level="headline-3" weight="bold" className="gencl:mt-8 gencl:mb-2 gencl:text-secondary-900">
        {block.text}
      </Heading>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="gencl:my-6">
        <div className="gencl:overflow-hidden gencl:rounded-lg gencl:bg-secondary-100">
          <Image src={block.src} alt={block.alt ?? ""} handleError className="gencl:w-full gencl:object-cover" />
        </div>
        {block.caption ? (
          <figcaption className="gencl:mt-2">
            <Text as="span" size="body-3" className="gencl:text-secondary-500">
              {block.caption}
            </Text>
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <Text as="p" size="body-1" className="gencl:my-4 gencl:leading-7 gencl:text-secondary-800">
      {block.text}
    </Text>
  );
}

/** Canonical article headline and metadata, independent of route/navigation chrome. */
export function ArticleReaderHeader({ article, className }: { article: Article; className?: string }) {
  const isEvent = article.kind === "event";
  const bylineParts = [article.author, article.publishedAt].filter(Boolean);

  return (
    <header className={cn("gen-article-reveal", className)}>
      <Text
        as="p"
        size="body-3"
        weight="semibold"
        className="gencl:mb-2 gencl:uppercase gencl:tracking-wider gencl:text-primary">
        {KIND_LABEL[article.kind]}
      </Text>

      <Heading as="h1" level="headline-1" weight="bold" className="gencl:text-secondary-900">
        {article.title}
      </Heading>

      {article.standfirst ? (
        <Text as="p" size="body-0" className="gencl:mt-3 gencl:leading-7 gencl:text-secondary-700">
          {article.standfirst}
        </Text>
      ) : null}

      {isEvent && (article.eventDate || article.location) ? (
        <div className="gencl:mt-4 gencl:flex gencl:flex-wrap gencl:items-center gencl:gap-x-2 gencl:gap-y-1">
          {article.eventDate ? (
            <Text as="span" size="body-1" weight="semibold" className="gencl:text-secondary-900">
              {article.eventDate}
            </Text>
          ) : null}
          {article.eventDate && article.location ? (
            <span aria-hidden className="gencl:text-secondary-400">
              |
            </span>
          ) : null}
          {article.location ? (
            <Text as="span" size="body-1" className="gencl:text-secondary-600">
              {article.location}
            </Text>
          ) : null}
        </div>
      ) : null}

      {bylineParts.length > 0 ? (
        <Text as="p" size="body-2" className="gencl:mt-4 gencl:text-secondary-500">
          {bylineParts.join(" • ")}
        </Text>
      ) : null}
    </header>
  );
}

/** Canonical article hero and body, shared without mounting any SDK placements. */
export function ArticleReaderBody({ article, className }: { article: Article; className?: string }) {
  return (
    <article className={cn("gen-article-main gen-article-reveal gen-article-reveal-delay-2", className)}>
      <div className="gencl:mb-6 gencl:overflow-hidden gencl:rounded-xl gencl:bg-secondary-100">
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          handleError
          className="gencl:w-full gencl:object-cover"
        />
      </div>

      <div data-slot="article-body">
        {article.body.map((block, index) => (
          <ArticleBodyBlock key={index} block={block} />
        ))}
      </div>
    </article>
  );
}
