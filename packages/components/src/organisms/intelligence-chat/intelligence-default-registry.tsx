"use client";

import { IntelligenceArticleCard } from "@genuin/components/organisms/intelligence-panel/intelligence-article-card";
import { IntelligenceCalendarContent } from "@genuin/components/organisms/intelligence-panel/intelligence-calendar-panel";
import { IntelligenceLeaderboardContent } from "@genuin/components/organisms/intelligence-panel/intelligence-leaderboard-panel";
import type {
  IntelligenceArticle,
  IntelligenceArticleCardLayout,
  IntelligenceArticleSelectHandler,
  IntelligenceCalendarContentProps,
  IntelligenceLeaderboardContentProps,
} from "@genuin/components/organisms/intelligence-panel/intelligence-panel.types";

import type { IntelligenceResponseRegistry } from "./intelligence-chat.types";
import { defineIntelligenceBlock } from "./intelligence-response-registry";
import { IntelligenceTextBlock, IntelligenceUserTextBlock } from "./intelligence-text-block";

/** Props for the built-in `articles` block — a horizontally scrolling row of article cards. */
export type IntelligenceArticlesBlockProps = {
  articles: readonly IntelligenceArticle[];
  layout: IntelligenceArticleCardLayout;
  /** @default "Up Next" */
  label?: string;
  /** Card width in px. @default 250 */
  cardWidth?: number;
};

function IntelligenceArticlesBlock({
  articles,
  layout,
  label = "Up Next",
  cardWidth = 250,
  onArticleSelect,
}: IntelligenceArticlesBlockProps & { onArticleSelect?: IntelligenceArticleSelectHandler }) {
  return (
    <div
      data-slot="intelligence-articles-block"
      className="gencl:flex gencl:w-full gencl:gap-2 gencl:overflow-x-auto gencl:[scrollbar-width:none] gencl:[&::-webkit-scrollbar]:hidden">
      {articles.map((article) => (
        <IntelligenceArticleCard
          key={article.id}
          article={article}
          layout={layout}
          label={label}
          imagePosition="top"
          onSelect={onArticleSelect}
          className="gencl:shrink-0"
          style={{ width: cardWidth }}
        />
      ))}
    </div>
  );
}

/** Block type keys shipped by the default registry. */
export const INTELLIGENCE_BLOCK_TYPES = {
  text: "text",
  userText: "user-text",
  articles: "articles",
  leaderboard: "leaderboard",
  calendar: "calendar",
} as const;

/** Runtime actions supplied by the host, never serialized into response blocks. */
export type IntelligenceDefaultRegistryActions = {
  onArticleSelect?: IntelligenceArticleSelectHandler;
};

/**
 * Registry wiring the existing Intelligence components (text, articles,
 * leaderboard, calendar) as chat response blocks. Extend with
 * `mergeIntelligenceRegistries(INTELLIGENCE_DEFAULT_REGISTRY, { myType: MyComponent })`.
 */
export function createIntelligenceDefaultRegistry(
  actions: IntelligenceDefaultRegistryActions = {}
): IntelligenceResponseRegistry {
  function ArticlesBlock(props: IntelligenceArticlesBlockProps) {
    return <IntelligenceArticlesBlock {...props} onArticleSelect={actions.onArticleSelect} />;
  }

  return {
    [INTELLIGENCE_BLOCK_TYPES.text]: defineIntelligenceBlock(IntelligenceTextBlock),
    [INTELLIGENCE_BLOCK_TYPES.userText]: defineIntelligenceBlock(IntelligenceUserTextBlock),
    [INTELLIGENCE_BLOCK_TYPES.articles]: defineIntelligenceBlock<IntelligenceArticlesBlockProps>(ArticlesBlock),
    [INTELLIGENCE_BLOCK_TYPES.leaderboard]:
      defineIntelligenceBlock<IntelligenceLeaderboardContentProps>(IntelligenceLeaderboardContent),
    [INTELLIGENCE_BLOCK_TYPES.calendar]:
      defineIntelligenceBlock<IntelligenceCalendarContentProps>(IntelligenceCalendarContent),
  };
}

export const INTELLIGENCE_DEFAULT_REGISTRY = createIntelligenceDefaultRegistry();
