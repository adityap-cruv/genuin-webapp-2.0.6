/**
 * AdElement ad-lifecycle tracking pixels.
 *
 * The AdElement endpoint (`b.adelement.com/v`) distinguishes lifecycle events by
 * a single `ev` query param — `passback`, `start_gen`, `complete_gen` — while every
 * other param stays identical across the three. This module owns that shared param
 * set and fires the `start_gen` / `complete_gen` beacons from the GenAd waterfall's
 * `onAdStarted` / `onAdCompleted` callbacks.
 *
 * Distinct from {@link PixelReporter} in `pixel-reporter.ts`, which fires Genuin's
 * own `px-*` pixels to `api.begenuin.com` on FAILURE boundaries only. This module
 * is success-path telemetry to a third-party host and shares no state with it.
 *
 * Every param is sourced from the cleaned host-macro bag
 * (`window.__CXR_SCRIPT_PARAMS__`, see `hostMacros.ts`), so a macro the host never
 * supplied is OMITTED rather than sent as an unresolved `{aid}` literal — the same
 * rule the `px-*` pixels follow.
 */

import { hostMacros as defaultHostMacros, type HostMacros } from "@cxr/hostMacros";
import { createLogger } from "@cxr/utils/logger";

const _logger = createLogger("cxr/adelement-pixel");

// import.meta.env shape is bundler-defined; the `?? {}` fallback is unreachable
// under Vite/Vitest (env is always defined), hence the v8 ignore. The `next 2`
// span covers the `?? {}` branch, which lives on the second line of the statement.
/* v8 ignore next 2 */
const _env: Record<string, string | undefined> =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env ?? {};

/**
 * AdElement beacon endpoint. Set VITE_CXR_ADELEMENT_PIXEL_URL to override
 * (e.g. to point QA at a capture endpoint instead of live AdElement).
 */
export const ADELEMENT_PIXEL_URL: string = _env.VITE_CXR_ADELEMENT_PIXEL_URL ?? "https://b.adelement.com/v";

/**
 * Lifecycle events this module fires. The `_gen` suffix marks these as
 * Genuin-originated so AdElement can separate CXR's beacons from the same
 * lifecycle reported by another integration on the shared endpoint.
 * `passback` is owned by the host embed layer.
 */
export type AdElementEvent = "start_gen" | "complete_gen";

/**
 * Pixel param name → host macro name, in the order the AdElement reference URL
 * lists them. The param name usually matches the macro name; the exceptions are
 * the four IFA aliases (`ifa` / `appidfa` / `appaid` / `deviceid`, all reading the
 * single `ifa` macro) and `d`, which mirrors `appb`.
 *
 * `p` / `sid` / `cb` map to the `aid` / `seller` / `rid` macros — AdElement's
 * placement, seller and request ids. CXR cannot derive these; they are supplied
 * by the host on the loader query string like every other macro here, and the
 * param is omitted when absent.
 */
const HOST_MACRO_PIXEL_PARAMS: ReadonlyArray<[param: string, macroName: string]> = [
  ["p", "aid"],
  ["sid", "seller"],
  ["cb", "rid"],
  ["appn", "appn"],
  ["appv", "appv"],
  ["appb", "appb"],
  ["appsu", "appsu"],
  ["ifa", "ifa"],
  ["appidfa", "ifa"],
  ["appaid", "ifa"],
  ["appsi", "appsi"],
  ["appc", "appc"],
  ["country", "country"],
  ["loc", "loc"],
  ["loclong", "loclong"],
  ["loclat", "loclat"],
  ["deviceid", "ifa"],
  ["dnt", "dnt"],
  ["d", "appb"],
  ["gdpr", "gdpr"],
  ["gdpr_consent", "gdpr_consent"],
  ["us_privacy", "us_privacy"],
  ["c1", "c1"],
  ["c2", "c2"],
  ["c3", "c3"],
  ["c6", "c6"],
  ["c7", "c7"],
  ["c8", "c8"],
  ["c9", "c9"],
  ["c10", "c10"],
  ["c11", "c11"],
  ["c12", "c12"],
  ["c13", "c13"],
  ["c14", "c14"],
];

/**
 * Fixed params the AdElement reference URL hardcodes rather than macro-filling.
 * `w`/`h` are the 320x50 slot the AdElement inventory is booked against and `ho=1`
 * marks a host-originated beacon — none are derived from the live DOM, so they are
 * constants here rather than measured values.
 */
const FIXED_PIXEL_PARAMS: ReadonlyArray<[param: string, value: string]> = [
  ["w", "320"],
  ["h", "50"],
  ["ho", "1"],
];

/**
 * Build the full AdElement pixel URL for one lifecycle event.
 *
 * `ev` is written first so it is the leading param (matching the reference URL),
 * then the fixed `w`/`h`/`ho`, then every resolved host macro. Params whose macro
 * the host never supplied are absent entirely.
 *
 * Exported for tests; production call sites use {@link fireAdElementPixel}.
 *
 * @param event   Which lifecycle event to stamp on `ev`.
 * @param macros  Cleaned host-macro map. Defaults to the `hostMacros` singleton.
 */
export function buildAdElementPixelUrl(event: AdElementEvent, macros: HostMacros = defaultHostMacros): string {
  const params = new URLSearchParams();
  params.set("ev", event);

  for (const [param, value] of FIXED_PIXEL_PARAMS) {
    params.set(param, value);
  }

  for (const [param, macroName] of HOST_MACRO_PIXEL_PARAMS) {
    const value = macros[macroName];
    if (value === undefined) continue;
    params.set(param, value);
  }

  return `${ADELEMENT_PIXEL_URL}?${params.toString()}`;
}

/**
 * Fire one AdElement lifecycle beacon.
 *
 * Best-effort and non-throwing: this is third-party telemetry on the ad success
 * path, so a locked-down window (no `Image` constructor) or a blocked request must
 * never surface as an error into the ad lifecycle that triggered it. Uses `Image`
 * rather than `fetch` so the GET is not subject to CORS — the endpoint returns no
 * body we need to read.
 *
 * Deliberately NOT deduplicated: `start_gen` and `complete_gen` are expected once
 * per ad play, and an ad break can legitimately play several ads per session, so
 * suppressing a repeat would under-count. Callers fire from the GenAd SDK's own
 * per-ad callbacks, which already emit once per ad.
 *
 * @param event   Which lifecycle event to report.
 * @param macros  Cleaned host-macro map. Defaults to the `hostMacros` singleton.
 */
export function fireAdElementPixel(event: AdElementEvent, macros: HostMacros = defaultHostMacros): void {
  try {
    if (typeof Image !== "function") return;
    const url = buildAdElementPixelUrl(event, macros);
    new Image().src = url;
    _logger.debug(`fired AdElement pixel (ev=${event}):`, url);
  } catch (err) {
    // Swallowed by design — see the doc comment above. Logged at warn (not error)
    // so a blocked third-party beacon never trips the px-script-error boundary.
    _logger.warn(`failed to fire AdElement pixel (ev=${event}):`, err);
  }
}
