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
import { EVENT } from "@cxr/analytics/analytics";
import { windowLink as defaultWindowLink } from "@cxr/platform/topWindow";
import { apiFetch, handleResponse, type ResponseLike } from "@cxr/services/api";

/** Promise that resolves when visit_id is available. */
let visitIdResolve: ((id: string) => void) | undefined;
export const visitIdPromise = new Promise<string>((resolve) => {
  visitIdResolve = resolve;
});

export function setVisitId(id: string): void {
  if (visitIdResolve) {
    visitIdResolve(id);
    visitIdResolve = undefined; // Only resolve once
  }
}

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
  visit_id: string;
}

interface FactoryArgs {
  tagId: string;
  /** Optional fetch wrapper for testing. Defaults to {@link apiFetch}. */
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
  /** Emits an analytics event. Provided by the caller so we don't import
   *  `sendEventLog` directly (keeps this module pure / testable). */
  sendEvent: (eventName: string, eventDetails?: Record<string, unknown>) => void;
  /** Stamps visit_id onto all subsequent events' base context. Called once
   *  per feed load with the API-returned visit_id. */
  setBaseEventContext?: (partial: Record<string, unknown>) => void;
  /** Set mandatory data (visit_id) for RudderStack buffering. */
  setMandatoryData?: (data: Record<string, unknown>) => void;
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
  const { tagId, sendEvent, setBaseEventContext, setMandatoryData } = args;
  const fetch_ = args.fetchFn ?? apiFetch;
  const getWindowLink = args.getWindowLink ?? (() => defaultWindowLink);

  // Closure state — exactly mirrors the legacy generator.
  const refs: Record<string, string | undefined> = {};
  const reelsNoMore: Record<string, boolean> = {};
  let callCounter = 0;

  return async function fetchBatch(): Promise<Reel[]> {
    if (reelsNoMore[tagId]) return [];

    sendEvent(EVENT.BATCH_STARTED);

    const params = new URLSearchParams({
      tag_id: tagId,
    });
    const url = getWindowLink();
    if (url !== undefined) params.set("url", url);
    const ref = refs[tagId];
    if (ref !== undefined) params.set("ref", ref);

    const response = await fetch_(`/goservices/ad_creative/feed?${params}`);
    const json = (await response.json()) as ResponseLike<FeedResponseShape>;

    const data = handleResponse<FeedResponseShape>(json);
    refs[tagId] = data.ref;

    // Stamp visit_id onto all subsequent events via base context and buffer.
    if (data.visit_id) {
      setVisitId(data.visit_id); // Store globally for index.jsx TAG_INIT
      setBaseEventContext?.({ visit_id: data.visit_id });
      setMandatoryData?.({ visit_id: data.visit_id }); // Signal buffer
    }

    if (callCounter > 0) sendEvent(EVENT.BATCH_COMPLETED);
    sendEvent(EVENT.FEED_API_CALL_COMPLETED);
    callCounter += 1;

    if (!data.reels.length) {
      sendEvent(EVENT.FEED_COMPLETED);
      sendEvent(EVENT.TAG_DISPLAYED);
      reelsNoMore[tagId] = true;
    }

    return data.reels;
  };
}
