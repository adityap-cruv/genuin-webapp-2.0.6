export type IHeartContent = {
  kind: "article" | "podcast" | "promotion" | "page";
  title: string;
  description?: string;
  image?: string;
  paragraphs: string[];
  author?: string;
  publishedAt?: string;
  startDate?: string;
  endDate?: string;
  blocks: IHeartContentBlock[];
  promotionPageUrl?: string;
  originalUrl?: string;
  canEmbedOriginal?: boolean;
};

export type IHeartContentBlock =
  | { type: "contest"; campaignId: number; campaignType: string }
  | { type: "cta"; href: string; label: string }
  | { type: "embed"; src: string; title: string }
  | { type: "heading"; html: string; level: 2 | 3 | 4 | 5 | 6 }
  | { type: "image"; src: string; alt: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "paragraph"; html: string }
  | { type: "quote"; html: string };

type JsonRecord = Record<string, unknown>;

const IHEART_HOST = /(^|\.)iheart\.com$/i;
const MAX_RESPONSE_SIZE = 3_000_000;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function decodeHtml(value: string): string {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code.startsWith("#x")) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      if (code.startsWith("#")) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      return namedEntities[code.toLowerCase()] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function toParagraphs(...values: Array<string | undefined>): string[] {
  const paragraphs = values
    .flatMap((value) => value?.split(/\n\s*\n|\r\n\s*\r\n/) ?? [])
    .map(decodeHtml)
    .filter(Boolean);

  return Array.from(new Set(paragraphs));
}

function getAttribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`, "i"));
  return match?.[2];
}

function getInternalContentHref(value: string): string {
  try {
    const url = new URL(decodeHtml(value));
    if (url.protocol === "https:" && IHEART_HOST.test(url.hostname)) {
      return `/iheart/articles/linked-content?source=${encodeURIComponent(url.toString())}`;
    }
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    // Invalid and relative URLs are removed from copied markup.
  }
  return "";
}

function sanitizeInlineHtml(value: string): string {
  const tokens = value.match(/<[^>]+>|[^<]+/g) ?? [];
  let anchorOpen = false;

  return tokens
    .map((token) => {
      if (!token.startsWith("<")) return token;

      const tagName = token.match(/^<\/?\s*([a-z0-9]+)/i)?.[1]?.toLowerCase();
      const closing = /^<\//.test(token);
      if (!tagName) return "";

      if (["b", "strong"].includes(tagName)) return closing ? "</strong>" : "<strong>";
      if (["em", "i"].includes(tagName)) return closing ? "</em>" : "<em>";
      if (tagName === "br") return "<br>";

      if (tagName === "a") {
        if (closing) {
          if (!anchorOpen) return "";
          anchorOpen = false;
          return "</a>";
        }

        const href = getAttribute(token, "href");
        const safeHref = href ? getInternalContentHref(href) : "";
        if (!safeHref) return "";
        anchorOpen = true;
        const external = safeHref.startsWith("http");
        return `<a href="${safeHref}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>`;
      }

      return "";
    })
    .join("")
    .replace(/<a\b[^>]*>\s*<\/a>/g, "")
    .trim();
}

function isSafeEmbed(value: string): boolean {
  try {
    const url = new URL(decodeHtml(value));
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      (IHEART_HOST.test(host) ||
        host === "www.youtube.com" ||
        host === "www.youtube-nocookie.com" ||
        host === "player.vimeo.com" ||
        host === "omny.fm")
    );
  } catch {
    return false;
  }
}

function getRenderableImageSrc(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const decodedValue = decodeHtml(value);
  if (decodedValue.startsWith("/api/iheart-image/")) return decodedValue;

  try {
    const url = new URL(decodedValue);
    if (url.protocol !== "https:") return undefined;

    if (url.hostname === "i.iheart.com") {
      const assetMatch = url.pathname.match(
        /^\/v3\/re\/(new_assets|assets\.getty|assets\.streams|assets\/images)\/([^/]+)$/i,
      );
      if (assetMatch) {
        const source = assetMatch[1]?.toLowerCase() === "assets/images" ? "assets.images" : assetMatch[1];
        return `/api/iheart-image/${source}/${encodeURIComponent(assetMatch[2] ?? "")}`;
      }

      const urlAssetMatch = url.pathname.match(/^\/v3\/url\/([^/]+)$/i);
      if (urlAssetMatch) {
        return `/api/iheart-image/url/${encodeURIComponent(urlAssetMatch[1] ?? "")}`;
      }
    }

    if (url.hostname === "cdn3.aptivada.com" && /^\/[A-Za-z0-9_-]{32,2048}={0,2}$/.test(url.pathname)) {
      return `/api/iheart-image/contest/${encodeURIComponent(url.pathname.slice(1))}`;
    }

    if (IHEART_HOST.test(url.hostname) || url.hostname === "www.omnycontent.com") {
      return url.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function parseRichBlocks(fragment: string): IHeartContentBlock[] {
  const blocks: IHeartContentBlock[] = [];
  const blockPattern =
    /<(p|h[2-6]|blockquote)\b([^>]*)>([\s\S]*?)<\/\1>|<(ul|ol)\b[^>]*>([\s\S]*?)<\/\4>|<img\b([^>]*)\/?>|<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi;

  for (const match of fragment.matchAll(blockPattern)) {
    const textTag = match[1]?.toLowerCase();
    const attributes = match[2] ?? "";
    const textHtml = match[3] ?? "";
    const listTag = match[4]?.toLowerCase();
    const listHtml = match[5] ?? "";
    const imageAttributes = match[6];
    const iframeAttributes = match[7];

    if (textTag === "p") {
      if (/data-test=["']article-(?:author|publish-date)["']/i.test(attributes)) continue;
      const html = sanitizeInlineHtml(textHtml);
      if (decodeHtml(html)) blocks.push({ type: "paragraph", html });
      continue;
    }

    if (textTag === "blockquote") {
      const html = sanitizeInlineHtml(textHtml);
      if (decodeHtml(html)) blocks.push({ type: "quote", html });
      continue;
    }

    if (textTag?.startsWith("h")) {
      const level = Number(textTag.slice(1)) as 2 | 3 | 4 | 5 | 6;
      const html = sanitizeInlineHtml(textHtml);
      if (decodeHtml(html)) blocks.push({ type: "heading", html, level });
      continue;
    }

    if (listTag) {
      const items = Array.from(listHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi))
        .map((item) => sanitizeInlineHtml(item[1] ?? ""))
        .filter((item) => decodeHtml(item));
      if (items.length) blocks.push({ type: "list", items, ordered: listTag === "ol" });
      continue;
    }

    if (imageAttributes) {
      const src = getRenderableImageSrc(getAttribute(imageAttributes, "src"));
      if (!src) continue;
      blocks.push({
        type: "image",
        src,
        alt: decodeHtml(getAttribute(imageAttributes, "alt") ?? ""),
      });
      continue;
    }

    if (iframeAttributes) {
      const src = getAttribute(iframeAttributes, "src");
      if (!src || !isSafeEmbed(src)) continue;
      blocks.push({
        type: "embed",
        src: decodeHtml(src),
        title: decodeHtml(getAttribute(iframeAttributes, "title") ?? "Embedded media"),
      });
    }
  }

  return blocks;
}

function getArticleFragment(html: string): string | undefined {
  const bodyMarker = html.search(/data-test=["']content-article-body["']/i);
  if (bodyMarker < 0) return undefined;
  const articleStart = html.indexOf("<article", bodyMarker);
  const contentStart = html.indexOf(">", articleStart);
  const articleEnd = html.indexOf("</article>", contentStart);
  if (articleStart < 0 || contentStart < 0 || articleEnd < 0) return undefined;
  return html.slice(contentStart + 1, articleEnd);
}

function blocksFromText(...values: Array<string | undefined>): IHeartContentBlock[] {
  return values.flatMap((value) => {
    if (!value) return [];
    const richBlocks = parseRichBlocks(value);
    if (richBlocks.length) return richBlocks;
    return toParagraphs(value).map((paragraph): IHeartContentBlock => ({
      type: "paragraph",
      html: paragraph,
    }));
  });
}

function getImage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return getImage(value[0]);
  if (!isRecord(value)) return undefined;
  return asString(value.url) ?? asString(value.contentUrl);
}

function getAuthor(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(getAuthor).filter(Boolean).join(", ") || undefined;
  if (!isRecord(value)) return undefined;
  return asString(value.name);
}

function getPreloadedState(html: string): unknown {
  const marker = "window.__PRELOADED_STATE__ =";
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return undefined;

  const scriptStart = markerIndex + marker.length;
  const scriptEnd = html.indexOf("</script>", scriptStart);
  if (scriptEnd < 0) return undefined;

  try {
    return JSON.parse(
      html
        .slice(scriptStart, scriptEnd)
        .trim()
        .replace(/;\s*$/, ""),
    ) as unknown;
  } catch {
    return undefined;
  }
}

function normalizeComparableUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return undefined;
  }
}

function getIHeartAssetUrl(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const bucket = asString(value.bucket);
  const id = asString(value.id)?.replace(/^%2f/i, "");
  if (!bucket || !id) return undefined;
  return getRenderableImageSrc(`https://i.iheart.com/v3/re/${bucket}/${id}`);
}

function findPublishingPayload(value: unknown, sourceUrl: URL): JsonRecord | undefined {
  const expectedUrl = normalizeComparableUrl(sourceUrl.toString());

  function visit(current: unknown): JsonRecord | undefined {
    if (Array.isArray(current)) {
      for (const item of current) {
        const match = visit(item);
        if (match) return match;
      }
      return undefined;
    }
    if (!isRecord(current)) return undefined;

    const payload =
      isRecord(current.payload) && asString(current.payload.title) ? current.payload : undefined;
    if (payload) {
      const urls = [
        asString(payload.canonical_url),
        asString(payload.permalink),
        asString(payload.feed_permalink),
      ];
      if (urls.some((url) => normalizeComparableUrl(url) === expectedUrl)) return payload;
    }

    for (const nested of Object.values(current)) {
      const match = visit(nested);
      if (match) return match;
    }
    return undefined;
  }

  return visit(value);
}

function parsePublishingArticle(state: unknown, sourceUrl: URL): IHeartContent | undefined {
  const payload = findPublishingPayload(state, sourceUrl);
  if (!payload) return undefined;

  const title = asString(payload.title);
  if (!title) return undefined;

  const description = asString(payload.summary);
  const sourceBlocks = Array.isArray(payload.blocks) ? payload.blocks : [];
  const blocks = sourceBlocks.flatMap((block): IHeartContentBlock[] => {
    if (!isRecord(block)) return [];

    if (block.type === "html") {
      const html = asString(block.html);
      return html ? parseRichBlocks(html) : [];
    }

    if (block.type === "asset") {
      const src = getIHeartAssetUrl(block);
      if (!src) return [];
      return [
        {
          type: "image",
          src,
          alt: decodeHtml(asString(block.caption) ?? asString(block.title) ?? ""),
        },
      ];
    }

    return [];
  });
  const image = getIHeartAssetUrl(payload.primary_image);
  const firstImageIndex = blocks.findIndex((block) => block.type === "image");
  const filteredBlocks =
    image && firstImageIndex >= 0
      ? blocks.filter((_, index) => index !== firstImageIndex)
      : blocks;
  const publishedAt =
    typeof payload.publish_date === "number"
      ? new Date(payload.publish_date).toISOString()
      : asString(payload.publish_date);

  return {
    kind: "article",
    title: decodeHtml(title),
    description: description ? decodeHtml(description) : undefined,
    image,
    paragraphs: filteredBlocks
      .filter((block): block is Extract<IHeartContentBlock, { type: "paragraph" }> => block.type === "paragraph")
      .map((block) => decodeHtml(block.html)),
    author: asString(payload.author),
    publishedAt,
    blocks: filteredBlocks.length ? filteredBlocks : blocksFromText(description),
  };
}

function flattenStructuredData(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) return value.flatMap(flattenStructuredData);
  if (!isRecord(value)) return [];

  const graph = Array.isArray(value["@graph"]) ? flattenStructuredData(value["@graph"]) : [];
  return [value, ...graph];
}

function parseStructuredData(html: string): JsonRecord[] {
  const scripts = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  return Array.from(scripts).flatMap((match) => {
    try {
      return flattenStructuredData(JSON.parse(match[1] ?? ""));
    } catch {
      return [];
    }
  });
}

function getSchemaTypes(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((type): type is string => typeof type === "string");
  return [];
}

function parseArticle(structuredData: JsonRecord[], html: string): IHeartContent | undefined {
  const article = structuredData.find((item) =>
    getSchemaTypes(item["@type"]).some((type) => ["Article", "BlogPosting", "NewsArticle"].includes(type)),
  );
  if (!article) return undefined;

  const title = asString(article.headline) ?? asString(article.name);
  if (!title) return undefined;

  const description = asString(article.description);
  const body = asString(article.articleBody);
  const articleFragment = getArticleFragment(html);
  const blocks = articleFragment ? parseRichBlocks(articleFragment) : blocksFromText(body ?? description);
  const image = getRenderableImageSrc(getImage(article.image));
  const filteredBlocks =
    image && blocks.some((block) => block.type === "image")
      ? blocks.filter((block, index) => !(block.type === "image" && index === blocks.findIndex((item) => item.type === "image")))
      : blocks;

  return {
    kind: "article",
    title: decodeHtml(title),
    description: description ? decodeHtml(description) : undefined,
    image,
    paragraphs: toParagraphs(body ?? description),
    author: getAuthor(article.author),
    publishedAt: asString(article.datePublished),
    blocks: filteredBlocks,
  };
}

function parsePodcast(structuredData: JsonRecord[]): IHeartContent | undefined {
  const podcast = structuredData.find((item) =>
    getSchemaTypes(item["@type"]).some((type) => type === "PodcastSeries"),
  );
  if (!podcast) return undefined;

  const title = asString(podcast.name);
  if (!title) return undefined;

  const description = asString(podcast.description);
  return {
    kind: "podcast",
    title: decodeHtml(title),
    description: description ? decodeHtml(description) : undefined,
    image: getRenderableImageSrc(getImage(podcast.image)),
    paragraphs: toParagraphs(description),
    author: getAuthor(podcast.author),
    blocks: blocksFromText(description),
  };
}

function normalizeTitle(value: string): string {
  return decodeHtml(value)
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isPromotionRecord(value: JsonRecord): boolean {
  return Boolean(
    asString(value.title) &&
      (value.appId ||
        value.app_id ||
        value.parentAppId ||
        value.parent_app_id ||
        asString(value.pageUrl) ||
        asString(value.page_url) ||
        asString(value.prize) ||
        asString(value.terms)),
  );
}

function findPromotion(value: unknown, expectedTitle?: string): JsonRecord | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const promotion = findPromotion(item, expectedTitle);
      if (promotion) return promotion;
    }
    return undefined;
  }
  if (!isRecord(value)) return undefined;
  const title = asString(value.title);
  if (
    isPromotionRecord(value) &&
    (!expectedTitle || (title && normalizeTitle(title) === normalizeTitle(expectedTitle)))
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    const promotion = findPromotion(nested, expectedTitle);
    if (promotion) return promotion;
  }
  return undefined;
}

function getPositiveInteger(...values: unknown[]): number | undefined {
  for (const value of values) {
    const number = typeof value === "number" ? value : Number(asString(value));
    if (Number.isSafeInteger(number) && number > 0) return number;
  }
  return undefined;
}

function parsePromotion(html: string, expectedTitle?: string): IHeartContent | undefined {
  try {
    const state = getPreloadedState(html);
    if (!state) return undefined;
    const currentBlock =
      isRecord(state) &&
      isRecord(state.block) &&
      isRecord(state.block.currentBlock) &&
      isRecord(state.block.currentBlock.resolved)
        ? state.block.currentBlock.resolved
        : undefined;
    const promotion = expectedTitle ? findPromotion(state, expectedTitle) : currentBlock ?? findPromotion(state);
    if (!promotion) return undefined;

    const title = asString(promotion.title);
    if (!title) return undefined;

    const description = asString(promotion.description);
    const prize = asString(promotion.prize);
    const terms = asString(promotion.terms);
    const pageUrl = asString(promotion.pageUrl) ?? asString(promotion.page_url);
    const blocks = blocksFromText(prize, description, terms);
    const appId = getPositiveInteger(promotion.appId, promotion.app_id);
    const appType = asString(promotion.appType) ?? asString(promotion.app_type) ?? "contest";
    if (appId) {
      blocks.push({ type: "contest", campaignId: appId, campaignType: appType });
    }
    const safePageUrl = pageUrl ? getInternalContentHref(pageUrl) : "";
    if (safePageUrl && !appId) {
      blocks.push({ type: "cta", href: safePageUrl, label: "View promotion details" });
    }
    return {
      kind: "promotion",
      title: decodeHtml(title),
      description: description ? decodeHtml(description) : undefined,
      image: getRenderableImageSrc(
        getImage(promotion.primaryImage) ??
          getImage(promotion.primary_image) ??
          getImage(promotion.displayImage) ??
          getImage(promotion.display_image) ??
          getImage(promotion.mobileImage),
      ),
      paragraphs: toParagraphs(prize, description, terms),
      startDate: asString(promotion.startDate) ?? asString(promotion.start_date),
      endDate: asString(promotion.endDate) ?? asString(promotion.end_date),
      blocks,
      promotionPageUrl: pageUrl,
    };
  } catch {
    return undefined;
  }
}

function readMeta(html: string, key: string): string | undefined {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of metaTags) {
    const property = tag.match(/\b(?:property|name)=["']([^"']+)["']/i)?.[1];
    if (property?.toLowerCase() !== key.toLowerCase()) continue;
    const content = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1];
    if (content) return decodeHtml(content);
  }
  return undefined;
}

function parseGenericPage(html: string): IHeartContent | undefined {
  const documentTitle = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const title = readMeta(html, "og:title") ?? (documentTitle ? decodeHtml(documentTitle) : undefined);
  if (!title) return undefined;

  const description = readMeta(html, "description") ?? readMeta(html, "og:description");
  return {
    kind: "page",
    title,
    description,
    image: getRenderableImageSrc(readMeta(html, "og:image")),
    paragraphs: toParagraphs(description),
    blocks: blocksFromText(description),
  };
}

export function parseIHeartContentHtml(
  html: string,
  sourceUrl?: URL,
  expectedTitle?: string,
): IHeartContent | undefined {
  const structuredData = parseStructuredData(html);
  const state = getPreloadedState(html);
  return (
    (sourceUrl ? parsePublishingArticle(state, sourceUrl) : undefined) ??
    parseArticle(structuredData, html) ??
    parsePromotion(html, expectedTitle) ??
    parsePodcast(structuredData) ??
    parseGenericPage(html)
  );
}

export function validateIHeartSource(source: string): URL | undefined {
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || !IHEART_HOST.test(url.hostname)) return undefined;
    return url;
  } catch {
    return undefined;
  }
}

function canEmbedExternalPage(response: Response): boolean {
  const frameOptions = response.headers.get("x-frame-options")?.toLowerCase();
  if (frameOptions?.includes("deny") || frameOptions?.includes("sameorigin")) return false;

  const contentSecurityPolicy = response.headers.get("content-security-policy")?.toLowerCase();
  const frameAncestors = contentSecurityPolicy
    ?.split(";")
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith("frame-ancestors"));
  if (!frameAncestors) return true;

  return frameAncestors.includes("*") || frameAncestors.includes("https:");
}

export async function fetchIHeartContent(source: string, expectedTitle?: string): Promise<IHeartContent> {
  const sourceUrl = validateIHeartSource(source);
  if (!sourceUrl) throw new Error("Invalid iHeart content URL");

  const response = await fetch(sourceUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0 (compatible; GenuinIHeartContent/1.0)",
    },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) throw new Error(`iHeart content request failed with ${response.status}`);

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_RESPONSE_SIZE) throw new Error("iHeart content response is too large");

  const html = await response.text();
  if (html.length > MAX_RESPONSE_SIZE) throw new Error("iHeart content response is too large");

  const isGenericCampaignIndex = /\/(?:promotions|rules)\/?$/i.test(sourceUrl.pathname);
  const content = parseIHeartContentHtml(
    html,
    sourceUrl,
    isGenericCampaignIndex ? expectedTitle : undefined,
  );
  if (!content) throw new Error("iHeart content could not be read");
  if (
    expectedTitle &&
    isGenericCampaignIndex &&
    normalizeTitle(content.title) !== normalizeTitle(expectedTitle)
  ) {
    throw new Error("The selected iHeart campaign is no longer available");
  }
  const contentWithSource: IHeartContent = {
    ...content,
    originalUrl: sourceUrl.toString(),
    canEmbedOriginal: canEmbedExternalPage(response),
  };

  const promotionPageUrl =
    contentWithSource.kind === "promotion" && contentWithSource.promotionPageUrl
      ? validateIHeartSource(contentWithSource.promotionPageUrl)
      : undefined;
  if (promotionPageUrl && promotionPageUrl.pathname !== sourceUrl.pathname) {
    const detailResponse = await fetch(promotionPageUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; GenuinIHeartContent/1.0)",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(12_000),
    });
    if (detailResponse.ok) {
      const detailHtml = await detailResponse.text();
      if (detailHtml.length <= MAX_RESPONSE_SIZE) {
        const detailContent = parseIHeartContentHtml(detailHtml, promotionPageUrl);
        if (detailContent?.kind === "promotion") {
          return {
            ...detailContent,
            originalUrl: promotionPageUrl.toString(),
            canEmbedOriginal: canEmbedExternalPage(detailResponse),
          };
        }
      }
    }
  }

  return contentWithSource;
}
