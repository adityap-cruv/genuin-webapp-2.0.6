/**
 * Reels-feed generator factory (renamed from createFeedGenerator.ts).
 *
 * Returns an async function the caller invokes to fetch the next batch of
 * reels for a given tag. The factory captures per-tag state (`ref`,
 * `reelsNoMore`, `callCounter`) in a closure so callers don't have to
 * thread it through manually.
 *
 * Analytics event sequence is preserved verbatim from the legacy
 * `services/db.js` `getReelsGenerator`.
 */
import { windowLink as defaultWindowLink } from "@cxr/platform/topWindow";
import { apiFetch, handleResponse, type ResponseLike } from "@cxr/services/api";

/** A single reel record returned by the feed endpoint. */
/** Video ad payload returned inside an `ads` reel. */
export interface VideoAd {
  ads_url?: string;
  cpm?: number;
  platform?: string;
  url?: string;
  [key: string]: unknown;
}

/** Audio ad payload returned inside an `ads` reel. */
export interface AudioAd {
  ads_url?: string;
  cpm?: number;
  platform?: string;
  url?: string;
  [key: string]: unknown;
}

/** Reel record with ad content. */
export interface AdReel {
  type: "ads";
  video_ad?: VideoAd[];
  audio_ad?: AudioAd[];
  [key: string]: unknown;
}

/** Reel record with loop/content (non-ad). */
export interface LoopReel {
  _id?: string;
  community?: Record<string, unknown>;
  config?: Record<string, unknown>;
  cta?: Record<string, unknown> | null;
  iheart_episode_id?: string;
  loop?: Record<string, unknown>;
  og_details?: unknown;
  owner?: Record<string, unknown>;
  type?: string;
  video?: Record<string, unknown>;
  [key: string]: unknown;
}

/** A single reel record returned by the feed endpoint. */
export type Reel = AdReel | LoopReel | Record<string, unknown>;

interface FeedResponseShape {
  ref?: string;
  reels: Reel[];
}

interface FactoryArgs {
  tagId: string;
  /** Optional fetch wrapper for testing. Defaults to {@link apiFetch}. */
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
  /** Emits an analytics event. Provided by the caller so we don't import
   *  `sendEventLog` directly (keeps this module pure / testable). */
  sendEvent: (eventName: string) => void;
  /** Resolves the embedding page URL. Defaults to {@link topWindow.windowLink}. */
  getWindowLink?: () => string | undefined;
}

/**
 * Build an async fetcher for a single tag's reels feed.
 *
 * The returned function returns `[]` when the feed has been exhausted; in
 * that state no further requests are made and no analytics events are emitted.
 *
 * @param args  Factory configuration and DI hooks.
 * @returns An async function that fetches the next batch of reels.
 */
export function createFeedGenerator(args: FactoryArgs): () => Promise<Reel[]> {
  const { tagId, sendEvent } = args;
  const fetch_ = args.fetchFn ?? apiFetch;
  const getWindowLink = args.getWindowLink ?? (() => defaultWindowLink);

  // Closure state — exactly mirrors the legacy generator.
  const refs: Record<string, string | undefined> = {};
  const reelsNoMore: Record<string, boolean> = {};
  let callCounter = 0;

  return async function fetchBatch(): Promise<Reel[]> {
    if (reelsNoMore[tagId]) return [];

    sendEvent("batch_started");

    const params = new URLSearchParams({
      tag_id: tagId,
    });
    const url = getWindowLink();
    if (url !== undefined) params.set("url", url);
    const ref = refs[tagId];
    if (ref !== undefined) params.set("ref", ref);

    const response = await fetch_(`/goservices/ad_creative/feed?${params}`);
    const json = (await response.json()) as ResponseLike<FeedResponseShape>;

    if (callCounter > 0) sendEvent("batch_completed");
    sendEvent("feed_api_call_completed");
    callCounter += 1;

    const data = handleResponse<FeedResponseShape>(json);
    refs[tagId] = data.ref;

    if (!data.reels.length) {
      sendEvent("feed_completed");
      sendEvent("tag_displayed");
      reelsNoMore[tagId] = true;
    }

    return data.reels;
  };
}
