import axios from "axios";
import { headers } from "next/headers";
import { cache } from "react";

import { getOgUrl } from "@/lib/utils";
import { getConfig } from "@/middleware";

import { toHttpUrl } from "../utils/common/url";
import { PATH_NAME } from "../utils/constants/path";

/**
 * Normalized, SEO-relevant slice of a single video, pulled directly from the Go
 * feed API. Used server-side by the video route to emit `og:video` (real mp4),
 * correct pixel dimensions, and `VideoObject` JSON-LD in the initial HTML.
 *
 * Every field is optional: crawlers and JSON-LD must degrade gracefully rather
 * than emit fabricated or empty values (see the skill's missing-data rule).
 */
export type VideoSeoData = {
  slug: string;
  title?: string;
  description?: string;
  /** Raw progressive mp4 — never the m3u8 stream or the page URL. */
  contentUrl?: string;
  /** Primary (largest) thumbnail — the required `VideoObject.thumbnailUrl` fallback. */
  thumbnailUrl?: string;
  /** All available thumbnail sizes (largest first); emitted as the `thumbnailUrl` array. */
  thumbnailUrls?: string[];
  /** ISO-8601 (e.g. `PT2M14S`). */
  duration?: string;
  /** ISO-8601 upload date. */
  uploadDate?: string;
  width?: number;
  height?: number;
  /** Param-free, per-host canonical URL for this video. */
  canonicalUrl: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  author?: {
    name: string;
    url?: string;
    /** True when the owner is a brand → emit as `Organization`, else `Person`. */
    isBrand: boolean;
    /** Author bio → `author.description` (entity clarity / E-E-A-T). */
    description?: string;
    /** Author avatar/logo → `author.image` (and `logo` when an Organization). */
    image?: string;
  };
  /** Community the video belongs to — crawlable entity context for GEO. */
  community?: { name: string; description?: string; url?: string };
  /** Loop/group the video belongs to — crawlable entity context for GEO. */
  loop?: { name: string; description?: string; url?: string };
  shareUrl?: string;
  /**
   * Full spoken transcript of the clip. The single highest-value GEO signal —
   * AI answer engines ingest text, not pixels — so when present it is rendered
   * on-page and emitted as `VideoObject.transcript`. Optional and never
   * fabricated: many clips have none yet.
   */
  transcript?: string;
  /**
   * Public topic tags (from `attributes.video_keywords`), normalized without the
   * leading `#` and with internal/system entries stripped. Feeds `keywords`.
   */
  tags?: string[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Convert a duration to ISO-8601 (`PT#H#M#S`). Prefers the numeric seconds field;
 * falls back to the string `meta_data.duration`, which may already be ISO, a
 * plain seconds string, or `M:SS` / `H:MM:SS`. Returns null when unparseable —
 * never emit a hardcoded placeholder like `PT60S`.
 */
export function toIsoDuration(seconds?: number | null, metaDuration?: string | null): string | null {
  let totalSeconds: number | null = null;

  if (typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0) {
    totalSeconds = Math.round(seconds);
  } else if (metaDuration) {
    const raw = metaDuration.trim();
    if (/^PT/i.test(raw)) return raw.toUpperCase(); // already ISO-8601
    if (/^\d+(\.\d+)?$/.test(raw)) {
      totalSeconds = Math.round(Number(raw));
    } else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(raw)) {
      totalSeconds = raw
        .split(":")
        .map(Number)
        .reduce((acc, part) => acc * 60 + part, 0);
    }
  }

  if (totalSeconds === null || totalSeconds <= 0) return null;

  // totalSeconds is > 0 here (checked above), so at least one component is non-zero.
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${secs ? `${secs}S` : ""}`;
}

/**
 * Convert a Unix timestamp (seconds or milliseconds) to an ISO-8601 date string.
 * Returns null for missing/invalid input.
 */
export function epochToIso(epoch?: number | null): string | null {
  if (typeof epoch !== "number" || !Number.isFinite(epoch) || epoch <= 0) return null;
  // Values below ~1e12 are in seconds; scale to milliseconds.
  const ms = epoch < 1e12 ? epoch * 1000 : epoch;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Parse a `"1080x1920"` (or `1080×1920`) resolution string into pixel dimensions. */
export function parseResolution(resolution?: string | null): { width: number; height: number } | null {
  if (!resolution) return null;
  const match = resolution.match(/(\d{2,5})\s*[x×]\s*(\d{2,5})/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;
  return { width, height };
}

/**
 * Resolve pixel dimensions from `meta_data`, handling both backend formats: an
 * explicit `"1080x1920"` resolution, or a single short-side value
 * (`resolution: "1080"`) plus an `aspect_ratio` (`"9:16"`, read as width:height).
 * In the single-value form the number is the shorter side (1080p short side) and
 * the aspect ratio supplies the longer side and orientation. Returns null when
 * neither format yields usable dimensions — never guesses.
 */
export function resolveDimensions(
  resolution?: string | null,
  aspectRatio?: string | null
): { width: number; height: number } | null {
  const explicit = parseResolution(resolution);
  if (explicit) return explicit;

  const shortSide = resolution && /^\d{2,5}$/.test(resolution.trim()) ? Number(resolution.trim()) : null;
  const ratio = aspectRatio?.match(/^(\d{1,2})\s*:\s*(\d{1,2})$/);
  if (!shortSide || !ratio) return null;
  const wRatio = Number(ratio[1]);
  const hRatio = Number(ratio[2]);
  if (!wRatio || !hRatio) return null;
  // aspect_ratio is width:height; the stored value is the shorter side.
  return wRatio <= hRatio
    ? { width: shortSide, height: Math.round((shortSide * hRatio) / wRatio) } // portrait/square
    : { width: Math.round((shortSide * wRatio) / hRatio), height: shortSide }; // landscape
}

/**
 * Backend `video_keywords` can include internal/system entries (e.g. pipeline or
 * layout tags like `mcc-vertical`) that shouldn't surface as public tags. Backend
 * has been asked for a clean public-tags field; until then, strip the known
 * internal namespaces here.
 */
const INTERNAL_TAG_RE = /^mcc-/i;

/** Collapse a transcript value to trimmed text, or undefined when empty/non-string. */
export function normalizeTranscript(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text ? text : undefined;
}

/**
 * Normalize tags from either an array or a comma/space-separated string into a
 * deduped list without the leading `#`. Returns undefined when there are none.
 */
export function normalizeTags(value: unknown): string[] | undefined {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,\s]+/) : [];
  const tags = raw
    .map((tag) => (typeof tag === "string" ? tag.replace(/^#/, "").trim() : ""))
    .filter((tag) => tag.length > 0 && !INTERNAL_TAG_RE.test(tag));
  return tags.length ? Array.from(new Set(tags)) : undefined;
}

/**
 * Clean caption/description text for SEO: collapse the doubled quotes (`""` → `"`)
 * seen in some feed content and normalize all whitespace/newlines to single
 * spaces. Returns undefined when empty.
 */
export function cleanText(value?: string | null): string | undefined {
  const clean = value?.replace(/""/g, '"').replace(/\s+/g, " ").trim();
  return clean || undefined;
}

/**
 * Derive a concise headline from a long caption when a video has no dedicated
 * title. Takes the first sentence; if that is still too long (or there is no
 * sentence break), truncates at a word boundary with an ellipsis. Used only as a
 * fallback — a real `attributes.video_title` is always preferred.
 */
export function toTitle(value?: string | null, maxLen = 100): string | undefined {
  const clean = cleanText(value);
  if (!clean) return undefined;
  const firstSentence = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
  const base = firstSentence.length >= 15 ? firstSentence : clean;
  if (base.length <= maxLen) return base;
  return (
    base
      .slice(0, maxLen)
      .replace(/\s+\S*$/, "")
      .trim() + "…"
  );
}

/**
 * Build a schema.org `VideoObject` from normalized video data, omitting any
 * field that is missing rather than emitting an empty string (which fails
 * structured-data validation). Returns null when the required `name` is absent.
 */
export function buildVideoJsonLd(data: VideoSeoData): Record<string, unknown> | null {
  const name = data.title?.trim();
  if (!name) return null;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    url: data.canonicalUrl,
  };

  // description, thumbnailUrl and uploadDate are REQUIRED by VideoObject. Per the
  // missing-data rule: never omit a required field and never fabricate a value —
  // when our ecosystem has nothing, emit a type-appropriate empty ("") so the key
  // is present and the object still validates.

  // Prefer the video's own caption, then real related context (loop/community).
  // Only the composed/synthetic sentence is disallowed — an empty string is used
  // when no real text exists at all.
  jsonLd.description =
    data.description?.trim() || data.loop?.description?.trim() || data.community?.description?.trim() || "";

  // thumbnailUrl is REQUIRED. Emit all available sizes as an array (Google
  // supports and prefers multiple); fall back to the single primary, then to an
  // empty string so the key is always present (per the missing-data rule).
  // TODO(seo): empty when no thumbnail exists in our ecosystem for this video.
  jsonLd.thumbnailUrl = data.thumbnailUrls?.length ? data.thumbnailUrls : data.thumbnailUrl || "";
  // TODO(seo): empty - required field "uploadDate" not in ecosystem for this video
  jsonLd.uploadDate = data.uploadDate || "";

  // duration and contentUrl are optional/recommended — omit when absent.
  if (data.duration) jsonLd.duration = data.duration;
  if (data.contentUrl) jsonLd.contentUrl = data.contentUrl;
  // No embedUrl: contentUrl (the raw mp4) is present and is Google's preferred
  // source, so an embed/player URL is not needed for VideoObject.

  // transcript is the strongest GEO signal — AI engines cite the text they can
  // read. Emit only when a real transcript exists; never synthesize one.
  const transcript = data.transcript?.trim();
  if (transcript) jsonLd.transcript = transcript;

  // keywords aids topical understanding; drawn only from real tags.
  if (data.tags?.length) jsonLd.keywords = data.tags.join(", ");

  // No hardcoded publisher: on whitelabel domains the publisher is the brand
  // (e.g. iHeart), not Genuin. Brand identity is resolved on the backend, so we
  // don't manufacture a platform publisher here.

  if (data.author?.name) {
    const image = data.author.image;
    jsonLd.author = {
      "@type": data.author.isBrand ? "Organization" : "Person",
      name: data.author.name,
      ...(data.author.url ? { url: data.author.url } : {}),
      ...(data.author.description ? { description: data.author.description } : {}),
      // `image` applies to both; `logo` is Organization-specific.
      ...(image ? { image } : {}),
      ...(image && data.author.isBrand ? { logo: image } : {}),
    };
  }

  const interactions: Array<Record<string, unknown>> = [];
  const counters: Array<[string, number | undefined]> = [
    ["WatchAction", data.viewCount],
    ["LikeAction", data.likeCount],
    ["CommentAction", data.commentCount],
    ["ShareAction", data.shareCount],
  ];
  for (const [action, count] of counters) {
    if (typeof count === "number") {
      interactions.push({
        "@type": "InteractionCounter",
        interactionType: { "@type": action },
        userInteractionCount: count,
      });
    }
  }
  if (interactions.length) jsonLd.interactionStatistic = interactions;

  return jsonLd;
}

/**
 * Fetch the SEO-relevant fields for a single video, request-scoped.
 *
 * Mirrors `fetchMetadata`: a fresh, direct `axios.get` per request (never the
 * shared `axiosInstance` singleton, whose auth token / brand id are set by
 * runtime interceptors and would leak across concurrent server requests).
 *
 * Wrapped in React `cache()` so `generateMetadata` and the page component share
 * a single upstream request per render.
 *
 * @returns Normalized data, or null when the video is not found / the fetch fails
 *   (caller should then skip JSON-LD rather than emit hollow markup).
 */
export const getVideoSeoData = cache(async (slug: string): Promise<VideoSeoData | null> => {
  if (!slug) return null;

  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const config = getConfig(host);
    const canonicalUrl = getOgUrl(PATH_NAME.video(slug), config?.domain, config?.subdomain);

    const params: Record<string, unknown> = {
      ...(UUID_RE.test(slug) ? { uuid: slug } : { slug }),
      ...(config?.domain !== undefined && { domain: config.domain }),
      ...(config?.subdomain !== undefined && { subdomain: config.subdomain }),
    };

    const response = await axios.get(toHttpUrl(process.env.NEXT_PUBLIC_API_URL) + "/goservices/feed/video", {
      params,
    });

    const feeds: unknown[] = response?.data?.data?.feeds ?? [];
    const item = feeds.find(
      (entry): entry is Record<string, any> =>
        !!entry && typeof entry === "object" && (entry as any).type !== "ads" && !!(entry as any).video
    );
    if (!item) return null;

    const video = item.video as Record<string, any>;
    const owner = (video.owner ?? item.owner) as Record<string, any> | undefined;
    const community = item.community as Record<string, any> | undefined;
    const loop = item.loop as Record<string, any> | undefined;
    const attributes = video.attributes as Record<string, any> | undefined;
    const dims = resolveDimensions(video?.meta_data?.resolution, video?.meta_data?.aspect_ratio);

    // Prefer the backend's dedicated `attributes.video_title` (a real, human
    // headline). Fall back to the caption, then the most specific real context,
    // so every video still gets a non-empty <h1> and VideoObject.name (JSON-LD
    // requires a name). Description stays caption-only — omitted, never fabricated.
    // Prefer the real title; otherwise derive a short headline from the caption
    // (a full caption can be 600+ chars — unusable as a title/<h1>). cleanText
    // also collapses the doubled quotes some captions carry.
    const videoTitle = cleanText(attributes?.video_title as string | undefined);
    const caption = cleanText(video.description_text as string | undefined);
    const authorName = owner?.name || owner?.username;
    const title =
      videoTitle ||
      toTitle(caption) ||
      (loop?.group_name as string | undefined) ||
      (community?.name ? `${community.name} on Genuin` : undefined) ||
      (authorName ? `Video by ${authorName}` : undefined) ||
      "Video on Genuin";

    // All thumbnail sizes, largest first, deduped — emitted as the thumbnailUrl array.
    const thumbnails = [video.thumbnail_url_l, video.thumbnail_url, video.thumbnail_url_s].filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0
    );
    const authorImage = (owner?.profile_image_l || owner?.profile_image) as string | undefined;

    return {
      slug,
      canonicalUrl,
      title,
      description: caption || undefined,
      // Raw mp4 for contentUrl/og:video — the m3u8 stream is not valid for either.
      contentUrl: video.media_url || undefined,
      thumbnailUrl: thumbnails[0],
      thumbnailUrls: thumbnails.length ? Array.from(new Set(thumbnails)) : undefined,
      duration: toIsoDuration(video.duration, video?.meta_data?.duration) ?? undefined,
      uploadDate: epochToIso(video.conversation_at) ?? undefined,
      width: dims?.width,
      height: dims?.height,
      viewCount: typeof video.no_of_views === "number" ? video.no_of_views : undefined,
      likeCount: typeof video.no_of_sparks === "number" ? video.no_of_sparks : undefined,
      commentCount: typeof video.no_of_comments === "number" ? video.no_of_comments : undefined,
      shareCount: typeof video.no_of_shares === "number" ? video.no_of_shares : undefined,
      author:
        owner?.name || owner?.username
          ? {
              name: owner.name || owner.username,
              url: owner.share_url || undefined,
              isBrand: !!owner.brand,
              description: (owner.bio as string | undefined)?.trim() || undefined,
              image: authorImage,
            }
          : undefined,
      community: community?.name
        ? {
            name: community.name,
            description: community.description || undefined,
            url: community.share_url || undefined,
          }
        : undefined,
      loop: loop?.group_name
        ? {
            name: loop.group_name,
            description: loop.group_description || undefined,
            url: loop.share_url || undefined,
          }
        : undefined,
      shareUrl: video.share_url || undefined,
      // Public topic tags — confirmed field: `attributes.video_keywords`.
      tags: normalizeTags(attributes?.video_keywords),
      // TODO(seo): the feed exposes an `is_transcribed` flag but not the
      // transcript TEXT yet (asked backend to add it). These reads are defensive
      // across likely field names so the on-page transcript and
      // VideoObject.transcript light up the moment backend ships it, no further
      // frontend change needed.
      transcript: normalizeTranscript(
        video.transcript ?? video.transcription ?? attributes?.transcript ?? attributes?.video_transcript
      ),
    };
  } catch {
    // Match fetchMetadata's soft-fail: never throw out of metadata generation.
    // A missing video simply yields no JSON-LD / no media tags.
    return null;
  }
});
