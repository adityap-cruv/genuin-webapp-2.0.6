/**
 * API layer for the contextual-reels widget.
 *
 * Consolidates: handleResponse, apiFetch, getTag, getIpInfo.
 * The feed generator remains in `./feed.ts`.
 */
import { apiurl as PROD_API_URL } from "@cxr/config";
import { windowLink } from "@cxr/platform/topWindow";
import { userId } from "@cxr/userId";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/services-api");

// ─── Response unwrapper ───────────────────────────────────────────────────────

/** Minimal shape of a response object this helper accepts. */
export interface ResponseLike<T = unknown> {
  data?: T | { data?: T } | null;
}

/**
 * Parse a `Response` body as JSON, tolerating an empty or non-JSON body.
 *
 * `response.json()` throws `Unexpected end of JSON input` (or `Failed to
 * execute 'json' on 'Response'`) on an empty body — which a gateway returns on
 * a 204, a truncated/aborted response, or an edge-cached miss. Reading the raw
 * text first and treating empty/unparseable as `{}` turns that into the clean,
 * expected `No Data found` path in {@link handleResponse} instead of a raw
 * parse error that surfaces as an error pixel.
 *
 * @returns The parsed shape, or an empty object when the body is empty/invalid.
 */
export async function parseJsonResponse<T = unknown>(response: Response): Promise<ResponseLike<T>> {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as ResponseLike<T>;
  } catch {
    return {};
  }
}

/**
 * Unwrap a Genuin API response. Returns `response.data.data` when present,
 * otherwise `response.data`. Throws if both are falsy.
 *
 * @throws Error 'No Data found' when no payload can be extracted.
 */
export function handleResponse<T = unknown>(response: ResponseLike<T>): T {
  if (!response?.data) {
    throw new Error("No Data found");
  }
  const envelope = response.data as { data?: T } | T;
  const nested = (envelope as { data?: T } | null | undefined)?.data;
  return (nested ? nested : (envelope as T)) as T;
}

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

interface FetchDeps {
  /** Genuin API base URL. */
  apiurl: string;
  /** Returns the current user identifier — invoked per request. */
  getUserId: () => string;
  /** Returns the URL of the embedding page. May be `undefined`. */
  getLocation: () => string | undefined;
}

function hostOf(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

function resolveUrl(url: string, baseUrl: string): string {
  return /^https?:\/\//i.test(url) ? url : baseUrl.replace(/\/$/, "") + url;
}

/**
 * Internal factory used by tests. Production code should use the
 * pre-configured {@link apiFetch} singleton.
 *
 * @param deps  Injected dependencies.
 * @returns `apiFetch` — a fetch wrapper that injects auth headers for API requests.
 */
export function __createApiFetch(deps: FetchDeps): (url: string, init?: RequestInit) => Promise<Response> {
  const apiHost = hostOf(deps.apiurl);

  return function apiFetch(url: string, init?: RequestInit): Promise<Response> {
    const fullUrl = resolveUrl(url, deps.apiurl);
    const isApiHost = apiHost !== undefined && hostOf(fullUrl) === apiHost;

    const headers = new Headers(init?.headers);
    if (isApiHost) {
      headers.set("x-user-id", deps.getUserId());
      const loc = deps.getLocation();
      if (loc !== undefined) {
        headers.set("x-url", loc);
      }
    }

    return fetch(fullUrl, { ...init, headers });
  };
}

/**
 * Production fetch wrapper. Bound to the build-time `apiurl` and reads
 * `userId` / `windowLink` from the module singletons.
 */
export const apiFetch: (url: string, init?: RequestInit) => Promise<Response> = __createApiFetch({
  apiurl: PROD_API_URL,
  getUserId: () => userId,
  getLocation: () => windowLink,
});

// ─── getTag ───────────────────────────────────────────────────────────────────

/**
 * Shape of the `/ad_creative` response `data` payload returned by the
 * Genuin gateway for ad tags. Fields are marked optional where the gateway
 * may omit them.
 */
export interface AdCreativeResponse {
  ads_freq?: number;
  ads_slot_cpm?: number;
  advertiser_logo?: number | string | null;
  allowed_domains?: string[] | null;
  config?: {
    show_video_url?: boolean;
    show_comments?: boolean;
    show_repost?: boolean;
    show_share?: boolean;
    show_reply?: boolean;
    show_save?: boolean;
    show_pre_feed_vast?: boolean;
    enable_ask_question?: boolean;
    show_cta?: boolean;
    show_report?: boolean;
    show_owner_details?: boolean;
    show_logo?: boolean;
    show_spark?: boolean;
    auto_swipe?: boolean;
    on_click?: string;
    disable_profile_redirect?: boolean;
    [key: string]: unknown;
  } | null;
  created_at?: string;
  created_by?: string;
  cta?: Record<string, unknown> | null;
  customer_id?: number;
  feed_limit?: number;
  feed_type?: string;
  genuin_user_name?: string;
  status?: string;
  tag_id?: string;
  tag_name?: string;
  tag_type?: string;
  updated_at?: string;
  view_type?: string;
  [key: string]: unknown;
}

/**
 * Fetch the creative configuration for a tag.
 *
 * @param tagId      The tag identifier returned by the embed snippet.
 * @param fetchFn    Optional fetch wrapper. Defaults to {@link apiFetch}.
 */
export async function getTag<T = unknown>(
  tagId: string,
  fetchFn: (url: string, init?: RequestInit) => Promise<Response> = apiFetch
): Promise<T> {
  const params = new URLSearchParams({ tag_id: tagId });
  const response = await fetchFn(`/goservices/ad_creative?${params}`);
  const json = await parseJsonResponse<T>(response);
  return handleResponse<T>(json);
}

// ─── getIpInfo ────────────────────────────────────────────────────────────────

/**
 * Raw fields the gateway may return for a geoip lookup. All fields are
 * optional — consumers must defensively read them.
 */
export interface RawGeoIpResponse {
  city?: string;
  city_en?: string;
  country?: string;
  country_code?: string;
  country_en?: string;
  country_name?: string;
  ip?: string;
  query?: string;
  tip?: string;
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lon?: number | string;
  lng?: number | string;
  location?: string;
  region?: string;
  postal?: string;
  timezone?: string;
}

/**
 * Fetch the geoip record. Returns the raw provider shape unchanged —
 * normalise via `enrichDeviceDetailsWithGeoIp` before consuming.
 *
 * @param fetchFn    Optional fetch wrapper. Defaults to {@link apiFetch}.
 */
export async function getIpInfo(
  fetchFn: (url: string, init?: RequestInit) => Promise<Response> = apiFetch
): Promise<RawGeoIpResponse> {
  const response = await fetchFn("/goservices/data/ip_info");
  // ip_info returns flat JSON, not the standard { data: {...} } envelope. An
  // empty/invalid body yields {} — consumers read every field defensively.
  return (await parseJsonResponse<RawGeoIpResponse>(response)) as RawGeoIpResponse;
}

let cachedGeoIp: Promise<RawGeoIpResponse | null> | undefined;

/**
 * Fetches geoip once and shares the result with every caller. Never rejects
 * (failure resolves `null`), so callers just `.then` to know it settled.
 */
export function getSharedGeoIp(): Promise<RawGeoIpResponse | null> {
  if (!cachedGeoIp) {
    cachedGeoIp = getIpInfo().catch((err) => {
      _logger.error("error :", err);
      return null;
    });
  }
  return cachedGeoIp;
}

/** Test-only: reset the module-level geoip cache between test cases. */
export function __resetGeoIpCache(): void {
  cachedGeoIp = undefined;
}
