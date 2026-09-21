// Server-only home-feed data for iHeart brand 3938.
// All editorial cards are sourced from the imported article catalog; no Foil
// community, event, sponsor, or external article assignments are retained.

import { articleHref, getAllArticleSlugs, getArticleBySlug, type Article } from "@genuin/components/page/article/article-data";
import type { ArticleData, EventData, HomeDataPage, LinkItemData, WidgetData } from "@genuin/components/page/home-dynamic/contract";

import { getHomeLayoutForPage } from "./layout";

const ARTICLE_POOL = getAllArticleSlugs()
  .map((slug) => getArticleBySlug(slug))
  .filter((article): article is NonNullable<typeof article> => Boolean(article));

// Keep the existing placement's video identities so the SDK/video rail remains unchanged;
// only the linked editorial metadata now comes from iHeart.
const PLACEMENT_VIDEO_IDS = [
  "fbcded82-eaee-463e-b55b-420fab97cecc",
  "5ad649b6-643f-47b3-92ed-79e838eed35d",
  "01e2b86a-2e1c-4632-adaf-ad5f9a84fe84",
  "77b5ecd0-4515-455a-a62b-daa1ac9faa0a",
  "b25aa012-ef94-4516-9820-2184636e9854",
  "dd8de87c-ae65-4799-9038-5b67d96e411a",
  "b71ae2e2-8ac8-4d07-95a2-6ac41b573309",
  "d88ffffd-105f-49d6-bff3-83bc7feb9792",
  "6448766f-78b2-4132-ac91-1c44f5f0ad6c",
  "83498e6b-a6b8-4e9d-a9f9-9071d5b66281",
  "dcccd164-cea2-418b-93f9-ed76cd9b2fd6",
  "3760f089-b345-4112-9d0c-969b1ca12da1",
  "0210081e-2266-4c81-9764-0cd6cc56c18e",
  "4e99d2bd-cffd-462a-95ed-1a2380deba76",
  "b211c258-bfa5-4546-828f-fd17f5d75c39",
  "b528af60-ec77-4c1e-806c-1d8d87bf1149",
  "f99bcc45-ad7b-4445-9054-17bc92f059bb",
  "0e4078c7-b0d8-4a6c-8a28-39b719d3fcfc",
  "ed49f624-1e1e-4128-97f3-fe9ab330bd8a",
  "c53825e0-23a0-49b3-af81-dcb467837a29",
] as const;

function poolArticle(index: number): Article {
  const article = ARTICLE_POOL[index % ARTICLE_POOL.length];
  if (!article) throw new Error("iHeart article catalog is empty");
  return article;
}

function articleData(index: number): ArticleData {
  const article = poolArticle(index);
  return { id: article.entityId ?? article.slug, title: article.title, href: articleHref(article.slug), image: { src: article.heroImage.src, alt: article.heroImage.alt } };
}

function articleDescription(index: number): string {
  return poolArticle(index).standfirst ?? "Read the latest from iHeart.";
}

function contextualLinks(pageIndex: number): LinkItemData[] {
  return Array.from({ length: Math.min(20, ARTICLE_POOL.length) }, (_, offset) => {
    const index = pageIndex * 3 + offset;
    const article = poolArticle(index);
    return {
      id: `${pageIndex}-related-${offset}`,
      video_id: PLACEMENT_VIDEO_IDS[offset % PLACEMENT_VIDEO_IDS.length]!,
      link: articleHref(article.slug),
      title: article.title,
      description: articleDescription(index),
      brand: "iHeart",
      website: "iheart.com",
      image: article.heroImage.src,
    };
  });
}

function events(pageIndex: number): EventData[] {
  return Array.from({ length: Math.min(6, ARTICLE_POOL.length) }, (_, offset) => {
    const index = pageIndex * 2 + offset;
    const article = poolArticle(index);
    const date = article.publishedAt?.slice(0, 10) ?? "2026-09-19";
    return {
      id: article.entityId ?? article.slug,
      heading: article.title,
      image: { src: article.heroImage.src },
      startDate: date,
      endDate: date,
      location: "iHeart",
      cta: { label: "Read article", href: articleHref(article.slug) },
    };
  });
}

function baseData(pageIndex: number): Record<string, WidgetData> {
  const featured = articleData(pageIndex);
  const upNext = [1, 2, 3].map((offset) => articleData(pageIndex + offset));
  const articles = [0, 1, 2, 3, 4].map((offset) => articleData(pageIndex + offset));
  const header = (heading: string, subHeading: string) => ({ heading, subHeading });

  return {
    salegp_desk: { id: "salegp_desk", header: header("iHeart", "Latest iHeart coverage"), ctaText: "Read More" },
    latest_news: { id: "latest_news", header: header("iHeart News", "Latest Articles"), featuredArticle: featured, upNextArticles: upNext, readMoreLabel: "Read more", upNextLabel: "More from iHeart" },
    upcoming_races: { id: "upcoming_races", header: header("iHeart Highlights", "Published articles"), events: events(pageIndex) },
    latest_videos: { id: "latest_videos", header: header("iHeart Video", "Latest Highlights") },
    related_links: { id: "related_links", header: header("Related iHeart links", "More to explore"), items: contextualLinks(pageIndex) },
    latest_interviews: { id: "latest_interviews", header: header("iHeart Features", "Featured Stories"), articles },
    top_categories: { id: "top_categories", header: header("iHeart Categories", "Music, news and culture"), ctaText: "Read More" },
    tmobile: { id: "tmobile", header: header("iHeart", "More Stories"), sponsored: false, ctaText: "Read More" },
    relevant_news: { id: "relevant_news", header: header("iHeart News", "More Coverage"), featuredArticle: articleData(pageIndex + 2), upNextArticles: upNext },
  };
}

function cursorForIndex(index: number): string {
  return Buffer.from(`iheart-3938:${index}`, "utf8").toString("base64url");
}

function indexForCursor(cursor: string | null): number {
  if (!cursor) return 0;
  try {
    const value = Buffer.from(cursor, "base64url").toString("utf8");
    const index = Number(value.split(":").at(-1));
    return Number.isFinite(index) && index >= 0 ? index : 0;
  } catch {
    return 0;
  }
}

export function getHomeFeedPage(cursor: string | null): HomeDataPage {
  const pageIndex = indexForCursor(cursor);
  return {
    metadata: { page: "home", schemaVersion: 1, pageSession: "iheart-3938", pageIndex },
    pagination: { cursor, nextCursor: cursorForIndex(pageIndex + 1), endOfFeed: false },
    data: baseData(pageIndex),
    layout: getHomeLayoutForPage(pageIndex),
  };
}
