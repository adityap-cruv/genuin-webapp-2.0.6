/**
 * DSP ad-lifecycle tracking pixels.
 *
 * Fires three best-effort `Image()` beacons — `ad_render` / `start` / `complete`
 * — to Genuin's own aapi DSP pixel endpoint for the tags allow-listed in
 * `DSP_PIXEL_TAG_IDS` (see `strategies/strategyConfig.ts`). The path shape is
 * `<base>/<brand_id>/<tag_id>/<event>`, mirroring the `px-*` pixels in
 * {@link PixelReporter} (`pixel-reporter.ts`), and the beacons are issued
 * ALONGSIDE (never instead of) the Rudderstack `AD_*` analytics events from the
 * same GenAd SDK callbacks (`ads/genAdSdk.ts`).
 *
 * Structurally a sibling of `adelement-pixel.ts`: host-macro-sourced app context
 * plus SDK-sourced creative metadata, production-gated, non-throwing. Unlike the
 * AdElement pixel (a third-party host keyed on a single `ev` param), each event
 * here is its own URL path segment, and the `ad_id` param carries the ad's
 * `visit_id` so the DSP can correlate the lifecycle.
 *
 * Any param whose source (host macro, SDK field, or the ad's `visit_id`) was
 * never resolved is OMITTED rather than emitted as an unresolved literal — the
 * same rule the `px-*` and AdElement pixels follow.
 */

import { hostMacros as defaultHostMacros, type HostMacros } from "@cxr/hostMacros";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/dsp-pixel");

/**
 * Hardcoded fallback base — kept on the same host as the `px-*` pixels
 * ({@link FALLBACK_PIXEL_BASE_URL} in `pixel-reporter.ts`). Path shape:
 * `<base>/<brand_id>/<tag_id>/<event>`.
 */
export const FALLBACK_DSP_PIXEL_BASE_URL = "https://aapi.begenuin.com/goservices/dsp/pixel";

/**
 * Resolve the DSP pixel base URL from `import.meta.env` defensively; any failure
 * falls back to {@link FALLBACK_DSP_PIXEL_BASE_URL}. Reads the same
 * `VITE_CXR_PIXEL_URL` var as the `px-*` pixels so both stay on one host.
 */
function resolveDspPixelBaseUrl(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.VITE_CXR_PIXEL_URL || FALLBACK_DSP_PIXEL_BASE_URL;
    /* v8 ignore next 3 -- import.meta.env is always readable under Vite/Vitest;
       the catch exists only for a bundler that makes import.meta itself throw. */
  } catch {
    return FALLBACK_DSP_PIXEL_BASE_URL;
  }
}

/**
 * True only in a production build (`build:prod`).
 *
 * Deliberately reads `process.env.NODE_ENV` — which `vite.config.mjs` inlines
 * from the `cross-env NODE_ENV=...` each build script sets — and NOT
 * `import.meta.env.PROD`. Vite sets `PROD` true for ANY `vite build`, so
 * `build:qa` would satisfy it and leak QA/staging traffic into the DSP's live
 * reporting. `NODE_ENV` is `"development"` / `"qa"` / `"production"`
 * respectively, so only the prod build passes. Same check `genAdSdk.ts` uses to
 * gate the SDK's debug flag.
 *
 * Evaluated per call rather than at module load so a test can stub
 * `process.env.NODE_ENV` without needing a module-registry reset.
 */
function isProductionBuild(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Lifecycle events this module fires, each mapped to its own URL path segment. */
export type DspPixelEvent = "ad_render" | "start" | "complete";

/**
 * Context the caller (a GenAd SDK callback) supplies for one beacon. Host-macro
 * app context is read separately from the shared `hostMacros` bag; this carries
 * only the per-ad identifiers the macros can't provide.
 */
export interface DspPixelContext {
  /**
   * Widget's configured tag id. Used as the `<tag_id>` path segment (falls back
   * to `"1"` there) AND carried as a `tag_id` query param (omitted when absent).
   */
  tagId: string | undefined;
  /** Resolved brand id — the `<brand_id>` path segment. Falls back to `"1"`. */
  brandId: string | number | undefined;
  /**
   * The ad's `visit_id` → the `ad_id` param. Omitted when unresolved.
   */
  visitId: string | undefined;
  /** SDK ad provider → the `provider` param. Optional. */
  provider?: string;
  /** SDK creative id → the `creative_id` param. Optional. */
  creativeId?: string;
  /** SDK advertiser domain → the `adv` param. Optional. */
  advertiserDomain?: string;
}

/** Constant `src` / `fill_src` value: all these tags are Triton-sourced fills. */
const DSP_PIXEL_SOURCE = "triton";

/**
 * Optional params sourced from the cleaned host-macro bag, in emit order. Each
 * is omitted when the host never supplied that macro. `bundle` / `app_name` are
 * mandatory in intent but follow the same omit-if-absent rule as the rest.
 */
const HOST_MACRO_DSP_PIXEL_PARAMS: ReadonlyArray<[param: string, macroName: string]> = [
  ["bundle", "appb"],
  ["app_name", "appn"],
  ["name_s", "appn"],
  ["store_url", "appsu"],
  ["store_id", "appsi"],
  ["dnt", "dnt"],
];

/** Set `name=value` only when `value` is a resolved, non-empty string. */
function setParam(params: URLSearchParams, name: string, value: string | undefined): void {
  if (value === undefined || value === "") return;
  params.set(name, value);
}

/** Read `navigator.userAgent` best-effort, guarding a locked-down/SSR window. */
function readUserAgent(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  return navigator.userAgent || undefined;
}

/** Read `navigator.language` best-effort, guarding a locked-down/SSR window. */
function readLanguage(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  return navigator.language || undefined;
}

/**
 * Build the `<base>/<brand_id>/<tag_id>/<event>` path. Both id segments fall
 * back to `"1"` when empty/undefined (the server rejects `"0"`/empty), matching
 * `pixel-reporter.ts`'s `buildPixelPath`. All three segments are encoded.
 */
function buildDspPixelPath(
  event: DspPixelEvent,
  brandId: string | number | undefined,
  tagId: string | undefined
): string {
  const base = resolveDspPixelBaseUrl();
  const brandSegment = brandId === undefined || brandId === "" ? "1" : String(brandId);
  const tagSegment = tagId && tagId.trim() ? tagId : "1";
  return `${base}/${encodeURIComponent(brandSegment)}/${encodeURIComponent(tagSegment)}/${encodeURIComponent(event)}`;
}

/**
 * Build the full DSP pixel URL for one lifecycle event.
 *
 * Params are written in a stable order: the mandatory `src` / `fill_src` /
 * `ad_id` / `tag_id` first, then the host-macro-sourced app context, then the
 * SDK-sourced optionals, then the computed `ua` / `device_language` / `ts` /
 * `cb`. Any param whose source is absent is omitted entirely — no unresolved
 * literal is emitted. `cb` is a cachebuster so the `Image` GET is not served
 * from cache.
 *
 * `tag_id` is ALSO carried as a query param (in addition to its path segment),
 * because the DSP endpoint reads it from the query string too.
 *
 * Exported for tests; production call sites use {@link fireDspPixel}.
 *
 * @param event   Which lifecycle event this beacon reports.
 * @param context Per-ad identifiers + SDK creative metadata.
 * @param macros  Cleaned host-macro map. Defaults to the `hostMacros` singleton.
 */
export function buildDspPixelUrl(
  event: DspPixelEvent,
  context: DspPixelContext,
  macros: HostMacros = defaultHostMacros
): string {
  const path = buildDspPixelPath(event, context.brandId, context.tagId);
  const params = new URLSearchParams();

  // Mandatory (still omitted when their source is genuinely absent).
  params.set("src", DSP_PIXEL_SOURCE);
  params.set("fill_src", DSP_PIXEL_SOURCE);
  setParam(params, "ad_id", context.visitId);
  // tag_id rides the query string too (it is already the path's <tag_id>
  // segment); the DSP endpoint reads it from both. Omitted when unresolved.
  setParam(params, "tag_id", context.tagId);

  // Host-macro-sourced app context (bundle/app_name mandatory in intent).
  for (const [param, macroName] of HOST_MACRO_DSP_PIXEL_PARAMS) {
    setParam(params, param, macros[macroName]);
  }

  // SDK-sourced optionals.
  setParam(params, "creative_id", context.creativeId);
  setParam(params, "adv", context.advertiserDomain);
  setParam(params, "provider", context.provider);

  // Computed.
  setParam(params, "ua", readUserAgent());
  setParam(params, "device_language", readLanguage());
  const now = Date.now();
  params.set("ts", String(now));
  params.set("cb", `${now}.${Math.random().toString(36).slice(2)}`);

  return `${path}?${params.toString()}`;
}

/**
 * Fire one DSP lifecycle beacon.
 *
 * **Production builds only.** No request leaves the page in dev, QA, unit tests
 * or E2E — the DSP's reporting is live, so a QA ad play or a test run must never
 * register as a real event. See {@link isProductionBuild} for why this is a
 * `NODE_ENV` check and not `import.meta.env.PROD`.
 *
 * Best-effort and non-throwing: this is success-path telemetry on the ad
 * lifecycle, so a locked-down window (no `Image` constructor) or a blocked
 * request must never surface as an error into the SDK callback that triggered
 * it. Uses `Image` rather than `fetch` so the GET is not subject to CORS — the
 * endpoint returns no body we need to read.
 *
 * Deliberately NOT deduplicated: each of the three events fires at most once per
 * ad play from a distinct GenAd SDK callback, and an ad break may play several
 * ads per session.
 *
 * @param event   Which lifecycle event to report.
 * @param context Per-ad identifiers + SDK creative metadata.
 * @param macros  Cleaned host-macro map. Defaults to the `hostMacros` singleton.
 */
export function fireDspPixel(
  event: DspPixelEvent,
  context: DspPixelContext,
  macros: HostMacros = defaultHostMacros
): void {
  try {
    // Non-production builds resolve the URL but never request it, so the
    // debug line below still shows what prod WOULD have sent.
    if (!isProductionBuild()) {
      _logger.debug(`skipped DSP pixel (event=${event}) — non-production build`);
      return;
    }
    if (typeof Image !== "function") return;
    const url = buildDspPixelUrl(event, context, macros);
    new Image().src = url;
    _logger.debug(`fired DSP pixel (event=${event}):`, url);
  } catch (err) {
    // Swallowed by design — see the doc comment above. Logged at warn (not error)
    // so a blocked beacon never trips the px-script-error boundary.
    _logger.warn(`failed to fire DSP pixel (event=${event}):`, err);
  }
}
