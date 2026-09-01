"use client";

import { NavArrowButton } from "@genuin/ui/player-controls";
import { useEffect, useRef } from "react";

import type { Article } from "./article-data";
import { ArticlePage } from "./article-page";

const INLINE_ARTICLE_CSS = `
.gen-inline-article-view {
  animation: gen-inline-article-enter 240ms ease-out both;
}
@keyframes gen-inline-article-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .gen-inline-article-view { animation: none; }
}
`;

/**
 * Same-route host for the canonical article page inside the expanded Home Feed.
 * Only the route-specific Back link is replaced; the article page itself remains
 * the single source of truth for layout, content and SDK placements.
 */
export function InlineArticleView({ article, onBack }: { article: Article; onBack: () => void }) {
  const viewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      viewRef.current?.querySelector<HTMLButtonElement>('[data-slot="inline-article-back"] button')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      ref={viewRef}
      data-slot="inline-intelligence-article"
      className="gen-inline-article-view gencl:absolute gencl:inset-0 gencl:z-40 gencl:overflow-hidden gencl:bg-white gencl:text-secondary-900"
      aria-label={article.title}
      tabIndex={-1}>
      <style>{INLINE_ARTICLE_CSS}</style>
      <ArticlePage
        article={article}
        backControl={
          <span data-slot="inline-article-back" className="gencl:inline-flex">
            <NavArrowButton direction="left" size="lg" theme="dark" ariaLabel="Back to Intelligence" onClick={onBack} />
          </span>
        }
      />
    </section>
  );
}
