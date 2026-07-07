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
  thumbnailUrl?: string;
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
  author?: {
    name: string;
    url?: string;
    /** True when the owner is a brand → emit as `Organization`, else `Person`. */
    isBrand: boolean;
  };
  /** Community the video belongs to — crawlable entity context for GEO. */
  community?: { name: string; description?: string; url?: string };
  /** Loop/group the video belongs to — crawlable entity context for GEO. */
  loop?: { name: string; description?: string; url?: string };
  shareUrl?: string;
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

  // TODO(seo): empty - required field "thumbnailUrl" not in ecosystem for this video
  jsonLd.thumbnailUrl = data.thumbnailUrl || "";
  // TODO(seo): empty - required field "uploadDate" not in ecosystem for this video
  jsonLd.uploadDate = data.uploadDate || "";

  // duration and contentUrl are optional/recommended — omit when absent.
  if (data.duration) jsonLd.duration = data.duration;
  if (data.contentUrl) jsonLd.contentUrl = data.contentUrl;

  if (data.author?.name) {
    jsonLd.author = {
      "@type": data.author.isBrand ? "Organization" : "Person",
      name: data.author.name,
      ...(data.author.url ? { url: data.author.url } : {}),
    };
  }

  const interactions: Array<Record<string, unknown>> = [];
  if (typeof data.viewCount === "number") {
    interactions.push({
      "@type": "InteractionCounter",
      interactionType: { "@type": "WatchAction" },
      userInteractionCount: data.viewCount,
    });
  }
  if (typeof data.likeCount === "number") {
    interactions.push({
      "@type": "InteractionCounter",
      interactionType: { "@type": "LikeAction" },
      userInteractionCount: data.likeCount,
    });
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
    const dims = parseResolution(video?.meta_data?.resolution);

    // A video's caption is its natural title/description, but many clips have
    // none. Fall back to the most specific real context available so every
    // video still gets a non-empty <h1> and VideoObject.name (JSON-LD requires
    // a name). Description stays caption-only — omitted rather than fabricated.
    const caption = (video.description_text as string | undefined)?.trim();
    const authorName = owner?.name || owner?.username;
    const title =
      caption ||
      (loop?.group_name as string | undefined) ||
      (community?.name ? `${community.name} on Genuin` : undefined) ||
      (authorName ? `Video by ${authorName}` : undefined) ||
      "Video on Genuin";

    return {
      slug,
      canonicalUrl,
      title,
      description: caption || undefined,
      // Raw mp4 for contentUrl/og:video — the m3u8 stream is not valid for either.
      contentUrl: video.media_url || undefined,
      thumbnailUrl: video.thumbnail_url || video.thumbnail_url_l || undefined,
      duration: toIsoDuration(video.duration, video?.meta_data?.duration) ?? undefined,
      uploadDate: epochToIso(video.conversation_at) ?? undefined,
      width: dims?.width,
      height: dims?.height,
      viewCount: typeof video.no_of_views === "number" ? video.no_of_views : undefined,
      likeCount: typeof video.no_of_sparks === "number" ? video.no_of_sparks : undefined,
      author: owner?.name || owner?.username
        ? {
            name: owner.name || owner.username,
            url: owner.share_url || undefined,
            isBrand: !!owner.brand,
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
    };
  } catch {
    // Match fetchMetadata's soft-fail: never throw out of metadata generation.
    // A missing video simply yields no JSON-LD / no media tags.
    return null;
  }
});
