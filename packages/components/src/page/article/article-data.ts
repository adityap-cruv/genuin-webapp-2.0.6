// Server-safe article model and accessors for on-domain /article/<slug> pages.
// The 3938 iHeart snapshot is generated in iheart-article-content.generated.ts.

import type { ArticleCommunity, ArticleGroup } from "./article-community";
import { IHEART_ARTICLE_CONTENT } from "./iheart-article-content.generated";

export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string };

export type ArticleKind = "news" | "interview" | "podcast" | "event";
export type ArticleSource = { name: string; url: string };
export type ArticleMedia = { kind: "instagram"; url: string };

export type Article = {
  slug: string;
  kind: ArticleKind;
  title: string;
  standfirst?: string;
  author?: string;
  publishedAt?: string;
  heroImage: { src: string; alt: string };
  body: ArticleBlock[];
  eventDate?: string;
  location?: string;
  source: ArticleSource;
  entityId?: string;
  embeddedMedia?: ArticleMedia[];
  community?: ArticleCommunity;
  group?: ArticleGroup;
};

export type ArticleContentMap = Record<string, Article>;

/** The active article catalog: S3 website import for iHeart brand 3938. */
export const ARTICLE_CONTENT: ArticleContentMap = IHEART_ARTICLE_CONTENT;

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLE_CONTENT[slug];
}

export function getArticleByHref(href: string, expectedOrigin?: string): Article | undefined {
  try {
    const base = expectedOrigin ?? "https://genuin.invalid";
    const url = new URL(href, base);
    if (expectedOrigin && url.origin !== new URL(expectedOrigin).origin) return undefined;
    const match = url.pathname.match(/^\/article\/([^/]+)\/?$/);
    return match?.[1] ? getArticleBySlug(decodeURIComponent(match[1])) : undefined;
  } catch {
    return undefined;
  }
}

export function getAllArticleSlugs(): string[] {
  return Object.keys(ARTICLE_CONTENT);
}

export function articleHref(slug: string): string {
  return `/article/${slug}`;
}
