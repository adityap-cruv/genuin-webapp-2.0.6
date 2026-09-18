import axios from "axios";
import { headers } from "next/headers";
import { cache } from "react";

import { getConfig } from "@/middleware";

import { toHttpUrl } from "../utils/common/url";

import { toTitle } from "./video-seo";

export type RelatedVideo = { slug: string; title: string };

export type RelatedInput = {
  /** The current video's slug — excluded from the results. Pass "" on hub pages (no current video). */
  currentSlug: string;
  /** Loop/group slug (tightest relevance) — queried first. */
  loopSlug?: string;
  /** Community slug — used to top up to `limit` after the loop. */
  communitySlug?: string;
  /**
   * Current video's id (uuid) used as the feed pagination cursor. On watch pages,
   * seed with the current video so each page links to the videos *after* it —
   * coverage then chains across the whole loop/community instead of every page
   * repeating page 1 (leaving the deep catalog with no inbound links). Omit on
   * hub pages so they link page 1 (the crawl entry seed).
   */
  afterVideoId?: string;
  /** Max links to return (default 12). */
  limit?: number;
};

// Best-effort SEO fetch: cap each feed request so a stalled endpoint (accepted
// but never completing) degrades to an empty block instead of hanging the render.
const FEED_TIMEOUT_MS = 2500;

/**
 * Server-rendered "more videos" links for a watch page. Turns each
 * `/video/[slug]` page into a crawl hub pointing at sibling videos (same loop
 * first, then community) so Googlebot can walk from any indexed watch page to the
 * rest of the catalog. The client feed is a crawl dead-end, so without these most
 * sitemap URLs stay "unknown to Google" — discovered but never crawled.
 *
 * Fail-safe by construction: a missing loop/community, a non-200, or any parse
 * error yields whatever was gathered so far (often `[]`); the caller then renders
 * no block. Mirrors `getVideoSeoData`'s direct-`axios`, host-aware, `cache()`d
 * pattern — never the shared axios singleton (its auth/brand interceptors would
 * leak across concurrent server requests). Same host `domain`/`subdomain` scoping
 * keeps related videos within the right brand on whitelabel subdomains.
 */
export const getRelatedVideos = cache(async (input: RelatedInput): Promise<RelatedVideo[]> => {
  const { currentSlug, loopSlug, communitySlug, afterVideoId, limit = 12 } = input;
  if (!loopSlug && !communitySlug) return [];

  try {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const config = getConfig(host);
    const base = toHttpUrl(process.env.NEXT_PUBLIC_API_URL);
    const scope = {
      ...(config?.domain !== undefined && { domain: config.domain }),
      ...(config?.subdomain !== undefined && { subdomain: config.subdomain }),
    };

    // Fetch both sources concurrently (the loop maxes at ~10/page, so community is
    // almost always needed to reach `limit` — running them in parallel keeps the
    // added latency to a single round-trip). Each is independently guarded so one
    // failing endpoint never drops the other; results merge loop-first below.
    // `cursorParam` differs per endpoint (loop → last_video_id, community →
    // from_video_id); when `afterVideoId` is set the feed returns videos *after*
    // the current one, so watch pages chain-cover the catalog.
    const feedsOf = async (
      endpoint: string,
      slug: string | undefined,
      cursorParam: string
    ): Promise<Record<string, any>[]> => {
      if (!slug) return [];
      try {
        const params: Record<string, unknown> = { slug, ...scope };
        if (afterVideoId) params[cursorParam] = afterVideoId;
        const res = await axios.get(base + endpoint, { params, timeout: FEED_TIMEOUT_MS });
        const feeds: unknown[] = res?.data?.data?.feeds ?? [];
        return feeds.filter((e): e is Record<string, any> => !!e && typeof e === "object");
      } catch {
        return [];
      }
    };

    const [loopFeeds, communityFeeds] = await Promise.all([
      feedsOf("/goservices/feed/loop", loopSlug, "last_video_id"),
      feedsOf("/goservices/feed/community", communitySlug, "from_video_id"),
    ]);

    // Merge loop first (tightest relevance), then community; dedupe against the
    // current video and each other; cap at `limit`. Slug is always non-empty so
    // every link has usable anchor text even when no title is available.
    const out: RelatedVideo[] = [];
    const seen = new Set<string>([currentSlug]);
    for (const entry of [...loopFeeds, ...communityFeeds]) {
      if (out.length >= limit) break;
      const video = entry.video as Record<string, any> | undefined;
      const videoSlug = typeof video?.slug === "string" ? video.slug.trim() : "";
      if (!video || !videoSlug || seen.has(videoSlug)) continue;
      const rawTitle = typeof video?.attributes?.video_title === "string" ? video.attributes.video_title.trim() : "";
      const title = rawTitle || toTitle(video?.description_text as string | undefined) || videoSlug;
      seen.add(videoSlug);
      out.push({ slug: videoSlug, title });
    }

    return out;
  } catch {
    // Match getVideoSeoData's soft-fail: never throw out of a Server Component.
    return [];
  }
});
