import { type Article } from "@genuin/components/page/article/article-data";

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Converts the source's display date ("31st August 2026 8:09pm") to ISO-8601.
 * Returns `undefined` when the string can't be parsed, so callers omit the field
 * instead of emitting an invalid date. No timezone is appended: the snapshot
 * doesn't carry one and inventing an offset would be wrong.
 */
export function toIsoDate(displayDate?: string): string | undefined {
  if (!displayDate) return undefined;
  const match = displayDate
    .trim()
    .match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(am|pm)?)?/i);
  if (!match) return undefined;

  const [, day, monthName, year, hour, minute, meridiem] = match;
  const month = monthName ? MONTHS[monthName.toLowerCase()] : undefined;
  if (!month || !day || !year) return undefined;

  const date = `${year}-${pad(month)}-${pad(Number(day))}`;
  if (!hour || !minute) return date;

  let hours = Number(hour) % 12;
  if (meridiem?.toLowerCase() === "pm") hours += 12;
  if (!meridiem) hours = Number(hour);
  return `${date}T${pad(hours)}:${minute}:00`;
}

/** Splits a byline like "Benedict Donovan, Deputy Editor" into name + job title. */
export function parseByline(byline?: string): { name: string; jobTitle?: string } | undefined {
  if (!byline) return undefined;
  const [name = "", ...rest] = byline.split(",");
  const jobTitle = rest.join(",").trim();
  if (!name.trim()) return undefined;
  return { name: name.trim(), ...(jobTitle ? { jobTitle } : {}) };
}

/** Plain-text description capped at a snippet-friendly length. */
export function getArticleDescription(article: Article): string | undefined {
  const text =
    article.standfirst ?? article.body.find((block) => block.type === "paragraph")?.text ?? undefined;
  if (!text) return undefined;
  return text.length > 300 ? `${text.slice(0, 297).trimEnd()}…` : text;
}

/**
 * Self-referencing, param-free canonical for the current host, so whitelabel
 * domains rank for themselves.
 */
export function getArticleCanonical(slug: string, host: string | null): string {
  const base = host
    ? `${host.startsWith("localhost") ? "http" : "https"}://${host}`
    : (process.env.NEXT_PUBLIC_HOST_URL ?? "https://begenuin.com");
  return `${base.replace(/\/$/, "")}/article/${encodeURIComponent(slug)}`;
}

/** `NewsArticle` + `BreadcrumbList` JSON-LD for the article route. */
export function buildArticleJsonLd(article: Article, canonicalUrl: string) {
  const origin = new URL(canonicalUrl).origin;
  const author = parseByline(article.author);
  const datePublished = toIsoDate(article.publishedAt);
  const images = [article.heroImage.src, ...article.body.flatMap((b) => (b.type === "image" ? [b.src] : []))]
    .filter(Boolean)
    .slice(0, 5);
  const articleBody = article.body
    .filter((block) => block.type !== "image")
    .map((block) => ("text" in block ? block.text : ""))
    .join("\n\n");

  const newsArticle = {
    "@context": "https://schema.org",
    "@type": article.kind === "news" ? "NewsArticle" : "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    url: canonicalUrl,
    headline: article.title.slice(0, 110),
    ...(getArticleDescription(article) ? { description: getArticleDescription(article) } : {}),
    ...(images.length ? { image: images } : {}),
    ...(datePublished ? { datePublished, dateModified: datePublished } : {}),
    ...(author ? { author: { "@type": "Person", ...author } } : {}),
    publisher: { "@type": "Organization", name: article.source.name, url: new URL(article.source.url).origin },
    isBasedOn: article.source.url,
    inLanguage: "en",
    ...(articleBody ? { articleBody, wordCount: articleBody.split(/\s+/).filter(Boolean).length } : {}),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/home` },
      { "@type": "ListItem", position: 2, name: article.title, item: canonicalUrl },
    ],
  };

  return [newsArticle, breadcrumbs];
}

/** Serialises JSON-LD safely for a `<script>` tag (escapes `<` so content can't close the tag). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
