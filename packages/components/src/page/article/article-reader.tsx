"use client";

import { Image } from "@genuin/ui/components/image";
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

/**
 * Editorial typography for the reader — a long-form reading scale (serif body on a ~680px
 * measure, sans headline/UI) rather than the app's product scale.
 *
 * Shipped as literal CSS in a `<style>` tag, NOT as `gencl:` utilities: the webapp consumes
 * `@genuin/components` as a prebuilt CSS bundle, so brand-new utility classes wouldn't be
 * compiled in (same reason as `ARTICLE_LAYOUT_CSS`).
 *
 * Two rules make this survive BOTH hosts. The reader also renders inside the Web SDK's shadow
 * root (the inline Feed View article), and the SDK compiles Tailwind with `important: true` —
 * `.gencl\:text-\[14px\]{font-size:14px !important}` — while it also resets every descendant
 * with `.gen-sdk-class *:not([data-koah]) { margin/padding: revert-layer }` (specificity 0,2,0).
 * So:
 *   1. The reader renders semantic elements, not the `Text`/`Heading` atoms, so no `!important`
 *      utility is emitted to fight in the first place (an `!important` declaration cannot be
 *      outranked by specificity).
 *   2. Every selector below is anchored on the scroller's two classes
 *      (`.gen-article-prose.gen-article-page …`, specificity 0,3,0) so it outranks the SDK's
 *      0,2,0 margin/padding reset.
 * Changing either of those without the other reintroduces the bug in the inline view only.
 */
export const ARTICLE_READER_TYPOGRAPHY_CSS = `
.gen-article-prose.gen-article-page {
  /* Fluid type below sizes off THIS column's width (cqi), not the viewport: the reader also
     renders inside the narrow inline Feed View panel, where vw-based clamps blew the headline
     up to full-page size. The scroller declares the container (see ARTICLE_LAYOUT_CSS). */
  --gen-article-serif: Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, "Times New Roman", serif;
  --gen-article-ink: #1a1a1a;
  --gen-article-ink-soft: #5c5c5c;
  --gen-article-measure: 44rem;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* --- headline block ---------------------------------------------------- */
.gen-article-prose.gen-article-page .gen-article-kicker {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 0.875rem;
}
.gen-article-prose.gen-article-page .gen-article-title {
  font-size: 2.25rem;
  font-size: clamp(2rem, 1.35rem + 2.6cqi, 3.125rem);
  line-height: 1.15;
  letter-spacing: -0.022em;
  font-weight: 700;
  color: var(--gen-article-ink);
  max-width: 52rem;
  text-wrap: balance;
}
.gen-article-prose.gen-article-page .gen-article-dek {
  font-family: var(--gen-article-serif);
  font-size: 1.25rem;
  font-size: clamp(1.125rem, 1.02rem + 0.6cqi, 1.375rem);
  line-height: 1.5;
  letter-spacing: -0.003em;
  color: var(--gen-article-ink-soft);
  margin-top: 1rem;
  max-width: var(--gen-article-measure);
}
.gen-article-prose.gen-article-page .gen-article-byline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--gen-article-ink-soft);
}
.gen-article-prose.gen-article-page .gen-article-byline-author { font-weight: 600; color: var(--gen-article-ink); }
.gen-article-prose.gen-article-page .gen-article-byline-dot { color: rgba(0, 0, 0, 0.25); }
.gen-article-prose.gen-article-page .gen-article-event-meta {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--gen-article-ink-soft);
}
.gen-article-prose.gen-article-page .gen-article-event-date { font-weight: 600; color: var(--gen-article-ink); }

/* --- body -------------------------------------------------------------- */
.gen-article-prose.gen-article-page .gen-article-body { max-width: var(--gen-article-measure); }
.gen-article-prose.gen-article-page .gen-article-p {
  font-family: var(--gen-article-serif);
  font-size: 1.25rem;
  line-height: 1.75;
  letter-spacing: -0.003em;
  color: #292929;
  margin: 0 0 1.6rem;
}
.gen-article-prose.gen-article-page .gen-article-body > .gen-article-p:first-child { margin-top: 0; }
.gen-article-prose.gen-article-page .gen-article-h2 {
  font-size: 1.5rem;
  font-size: clamp(1.375rem, 1.18rem + 1.1cqi, 1.75rem);
  line-height: 1.3;
  letter-spacing: -0.016em;
  font-weight: 700;
  color: var(--gen-article-ink);
  margin: 2.75rem 0 0.75rem;
  text-wrap: balance;
}
.gen-article-prose.gen-article-page .gen-article-figure { margin: 2.5rem 0; }
.gen-article-prose.gen-article-page .gen-article-media {
  overflow: hidden;
  border-radius: 12px;
  background: #f1f1f1;
}
.gen-article-prose.gen-article-page .gen-article-figcaption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #757575;
}
.gen-article-prose.gen-article-page .gen-article-hero { margin-bottom: 2.5rem; }
.gen-article-prose.gen-article-page a { color: inherit; text-underline-offset: 3px; }

@container gen-article (min-width: 700px) {
  /* Images breathe past the text measure without leaving the column. */
  .gen-article-prose.gen-article-page .gen-article-figure,
  .gen-article-prose.gen-article-page .gen-article-hero { max-width: min(100%, 52rem); }
}
`;

const KIND_LABEL: Record<Article["kind"], string> = {
  news: "News",
  interview: "Interview",
  podcast: "Podcast",
  event: "Event",
};

/**
 * One route-neutral body block shared by full-page and inline article readers.
 *
 * Deliberately plain semantic elements rather than the `Text`/`Heading` atoms: the reader runs its
 * own editorial type scale (see {@link ARTICLE_READER_TYPOGRAPHY_CSS}), and inside the Web SDK the
 * atoms' utilities are compiled `!important`, which no amount of specificity can override.
 */
function ArticleBodyBlock({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") {
    return <h2 className="gen-article-h2">{block.text}</h2>;
  }

  if (block.type === "image") {
    return (
      <figure className="gen-article-figure">
        <div className="gen-article-media">
          <Image src={block.src} alt={block.alt ?? ""} handleError className="gencl:w-full gencl:object-cover" />
        </div>
        {block.caption ? <figcaption className="gen-article-figcaption">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  return <p className="gen-article-p">{block.text}</p>;
}

/** Canonical article headline and metadata, independent of route/navigation chrome. */
export function ArticleReaderHeader({ article, className }: { article: Article; className?: string }) {
  const isEvent = article.kind === "event";

  return (
    <header className={cn("gen-article-reveal", className)}>
      <p className="gen-article-kicker">{KIND_LABEL[article.kind]}</p>

      <h1 className="gen-article-title">{article.title}</h1>

      {article.standfirst ? <p className="gen-article-dek">{article.standfirst}</p> : null}

      {isEvent && (article.eventDate || article.location) ? (
        <div className="gen-article-event-meta">
          {article.eventDate ? <span className="gen-article-event-date">{article.eventDate}</span> : null}
          {article.eventDate && article.location ? (
            <span aria-hidden className="gen-article-byline-dot">
              •
            </span>
          ) : null}
          {article.location ? <span>{article.location}</span> : null}
        </div>
      ) : null}

      {article.author || article.publishedAt ? (
        <div className="gen-article-byline">
          {article.author ? <span className="gen-article-byline-author">{article.author}</span> : null}
          {article.author && article.publishedAt ? (
            <span aria-hidden className="gen-article-byline-dot">
              •
            </span>
          ) : null}
          {article.publishedAt ? <span>{article.publishedAt}</span> : null}
        </div>
      ) : null}
    </header>
  );
}

/** Canonical article hero and body, shared without mounting any SDK placements. */
export function ArticleReaderBody({ article, className }: { article: Article; className?: string }) {
  return (
    <article className={cn("gen-article-main gen-article-reveal gen-article-reveal-delay-2", className)}>
      <div className="gen-article-hero gen-article-media">
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          handleError
          className="gencl:w-full gencl:object-cover"
        />
      </div>

      <div data-slot="article-body" className="gen-article-body">
        {article.body.map((block, index) => (
          <ArticleBodyBlock key={index} block={block} />
        ))}
      </div>
    </article>
  );
}
