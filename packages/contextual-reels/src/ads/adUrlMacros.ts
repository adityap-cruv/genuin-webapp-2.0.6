/**
 * Ad URL macro resolution.
 *
 * Some ad sources (e.g. Triton Digital) embed macros like [PAGE_URL] in the
 * ad request URL that must be replaced with the actual page URL before the
 * request is fired. This module handles detection and substitution.
 */

import { hostMacros, type HostMacros } from "@cxr/hostMacros";

/**
 * Resolve the URL of the page where the ad is being shown.
 *
 * When loaded directly on a page, this is `window.location.href`. When loaded
 * inside an iframe (e.g. an embedded widget), we attempt to read the parent
 * frame's URL. A cross-origin parent will throw a SecurityError on access, in
 * which case we fall back to `document.referrer` (set by the browser to the
 * embedding page's URL even cross-origin) and finally to an empty string.
 */
export function resolvePageUrl(): string {
  if (typeof window === "undefined") return "";

  const isInIframe = window !== window.parent;
  if (!isInIframe) return window.location.href;

  try {
    // Same-origin parent — direct access works.
    return window.parent.location.href;
  } catch {
    // Cross-origin parent — document.referrer is the next best signal.
    return document.referrer || window.location.href;
  }
}

/**
 * Ad-URL placeholder token → host macro name.
 *
 * DEFERRED: these tokens are seeded from the real ad URLs in
 * `feedTransforms.ts` and are still pending final ad-ops sign-off. Fields like
 * `us_privacy` / `country_code` are currently HARDCODED in the ad URL (not
 * tokenized), so they cannot be substituted until backend tokenizes them.
 * Update THIS map when confirmed — it is the single source of truth for
 * host-macro substitution in ad URLs.
 */
export const HOST_URL_MACRO_TOKENS: Readonly<Record<string, string>> = {
  // Privacy / consent — present in REEL_AD_BREAK_INFY_URL (feedTransforms.ts).
  "[DNT]": "dnt",
  "[GDPR]": "gdpr",
  "[GDPRCONSENT]": "gdpr_consent",
  // Geo lat/long — present in REEL_AD_BREAK_INFY_URL (feedTransforms.ts).
  "[LOCATION_LAT]": "loclat",
  "[LOCATION_LON]": "loclong",
  // App identity (Triton in-app: bundle-id / store-id / store-url). Filled when
  // the backend ad-URL template carries these tokens. store-url is URL-encoded
  // by the resolver, as Triton requires.
  "[APP_BUNDLE]": "appb",
  "[STORE_ID]": "appsi",
  "[STORE_URL]": "appsu",
};

/**
 * Remove a `<name>=<value>` query param (value = up to the next `&` or end) in
 * any position. The `[?&]` prefix anchors on a real param boundary so a param
 * whose NAME merely ends in `name` (e.g. `skip`/`myip` for `ip`) is never
 * touched. Consuming an optional trailing `&` (at most one) keeps the
 * surrounding `?a&b` separators intact — no `?&`, leading, or trailing `&`
 * artifact. When the param sits between two others, both the leading separator
 * and the trailing `&` match, so collapse the straddled pair to one separator.
 *
 * Targeted regex edit (not a URL round-trip) so untouched params keep their
 * original byte encoding — same rationale as {@link rewriteTritonUrlForApp}.
 *
 * @param url   The URL (or query-bearing string) to edit.
 * @param name  Bare param name, e.g. `"ip"` or `"site-url"` (escaped internally).
 */
function stripUrlParam(url: string, name: string): string {
  const escaped = escapeRegExp(name);
  // Match an optional leading separator, the param, and an optional trailing `&`.
  const re = new RegExp(`([?&])${escaped}=[^&]*&?`);
  return url.replace(re, (match, sep: string) =>
    // Leading `?` must be preserved; a straddled param (`&…&`) collapses to `&`;
    // a trailing param (`&…` with no trailing `&`) drops entirely.
    sep === "?" ? "?" : match.endsWith("&") ? "&" : ""
  );
}

/**
 * Rewrite a Triton on-demand ad URL into an in-app request: drop the web-only
 * `site-url`, point `dist` at the app bundle, and add `bundle-id`/`store-id`/
 * `store-url`. Only the params sourced from present macros are added; a missing
 * macro leaves its param absent (and leaves `dist` unchanged). Empty appb
 * returns the url unchanged.
 *
 * Operates with targeted string/regex edits rather than `URL`/`URLSearchParams`
 * so the ORIGINAL byte-for-byte encoding of untouched params (e.g. `ua` with
 * `%20` and literal `/` `(` `:`, `ttag` with a literal `:`) is preserved — a
 * full parse/re-serialise round-trip would normalise those to `+`/`%3A`/`%2F`.
 */
function rewriteTritonUrlForApp(url: string, macros: HostMacros): string {
  const appb = macros.appb;
  // Unreachable via the public API: `resolveVideoAdMacros` only calls this
  // function when `isTritonAppRewrite` is true, which already requires
  // `Boolean(macros.appb)` — so `appb` is always truthy here. Kept as a
  // defensive guard for any future direct caller of this function.
  /* v8 ignore next 2 */
  if (!appb) return url; // no bundle → cannot form an app request; leave as-is

  let result = url;

  // 1. Remove the web-only `site-url` param in any position (see stripUrlParam).
  result = stripUrlParam(result, "site-url");

  // 2. Replace the `dist` value, or append `dist` if the param is absent.
  const encodedAppb = encodeURIComponent(appb);
  if (/[?&]dist=[^&]*/.test(result)) {
    result = result.replace(/([?&])dist=[^&]*/, `$1dist=${encodedAppb}`);
  } else {
    result += (result.includes("?") ? "&" : "?") + `dist=${encodedAppb}`;
  }

  // 3. Append the app-identity params sourced from present macros.
  const appParams = [`bundle-id=${encodedAppb}`];
  if (macros.appsi !== undefined) appParams.push(`store-id=${encodeURIComponent(macros.appsi)}`);
  if (macros.appsu !== undefined) appParams.push(`store-url=${encodeURIComponent(macros.appsu)}`);
  // Step 2 above always appends a `dist=` param (with `?` or `&`), so `result`
  // always contains `?` by this point — the `: "?"` side is unreachable in
  // practice. Kept as a defensive default, not dead code to delete.
  /* v8 ignore next */
  result += (result.includes("?") ? "&" : "?") + appParams.join("&");

  return result;
}

/** Opt-in ad-URL rewrites applied only for statically-served tags. */
export interface AdUrlOptions {
  /**
   * When true, replace the `ua` param value with the real `navigator.userAgent`
   * and the `ip` param value with {@link clientIp}. Off/undefined leaves the URL
   * byte-identical to the non-static path.
   */
  servedStatically?: boolean;
  /**
   * Real client IP (from the shared geoip fetch), substituted for the fixture's
   * stale `ip` param when {@link servedStatically} is set. Best-effort: when
   * absent (geoip not resolved yet / unavailable), the `ip` param is stripped
   * instead so no stale/fake IP is sent.
   */
  clientIp?: string;
}

/**
 * Real user agent. This runs only in the ad-request path (client-side), so
 * `navigator` is always present; the `?? ""` guards a browser that reports a
 * null/absent userAgent. Mirrors the read in platform/device.ts.
 */
function readNavigatorUa(): string {
  return navigator.userAgent ?? "";
}

/**
 * Rewrite an ad URL for a statically-served tag: replace the `ua` param value
 * with the real user agent, and the `ip` param value with the real client IP
 * (or strip `ip` when no IP is available). Targeted regex edits (not a URL
 * round-trip) so untouched params keep their original byte encoding — same
 * rationale as {@link rewriteTritonUrlForApp}.
 *
 * @param url       The resolved ad URL.
 * @param clientIp  Real client IP to substitute, or `undefined` to strip `ip`.
 */
function applyStaticAdRewrites(url: string, clientIp: string | undefined): string {
  let result = url;

  // Replace the `ua` value in place (preserve position). Value runs to the next
  // `&` or end of string. No-op when there is no `ua` param.
  const ua = encodeURIComponent(readNavigatorUa());
  result = result.replace(/([?&]ua=)[^&]*/, `$1${ua}`);

  if (clientIp) {
    // Replace the `ip` value in place with the real client IP.
    result = result.replace(/([?&]ip=)[^&]*/, `$1${encodeURIComponent(clientIp)}`);
  } else {
    // No IP available — strip `ip=<value>` rather than send a stale one (see
    // stripUrlParam; its `[?&]` boundary ensures params like `skip`/`myip` are
    // left untouched).
    result = stripUrlParam(result, "ip");
  }

  return result;
}

/** Escape a token for safe use in a `RegExp` (tokens contain `[` and `]`). */
function escapeRegExp(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace host-macro tokens (e.g. `[IFA]`) with their URL-encoded macro values.
 * Tokens whose macro is absent are left untouched so an unfilled token is never
 * silently blanked.
 */
function resolveHostMacroTokens(url: string, macros: HostMacros): string {
  let result = url;
  for (const [token, macroName] of Object.entries(HOST_URL_MACRO_TOKENS)) {
    const value = macros[macroName];
    if (value === undefined) continue;
    if (!result.includes(token)) continue;
    result = result.replace(new RegExp(escapeRegExp(token), "g"), encodeURIComponent(value));
  }
  return result;
}

/**
 * Replace `[PAGE_URL]` macros in an ad URL with the encoded current page URL.
 *
 * @param url      The raw ad URL that may contain `[PAGE_URL]` placeholders.
 * @param pageUrl  The resolved page URL to substitute in.
 * @param macros   Host macro map whose tokens (e.g. `[IFA]`) are substituted.
 * @returns The URL with all `[PAGE_URL]` and host-macro tokens replaced.
 */
export function resolveAdUrlMacros(
  url: string,
  pageUrl: string,
  macros: HostMacros = hostMacros,
  options?: AdUrlOptions
): string {
  let result = url;
  if (result.includes("[PAGE_URL]")) {
    result = result.replaceAll("[PAGE_URL]", encodeURIComponent(pageUrl));
  }
  result = resolveHostMacroTokens(result, macros);
  if (options?.servedStatically) {
    result = applyStaticAdRewrites(result, options.clientIp);
  }
  return result;
}

/**
 * Walk a raw video-ad value and resolve `[PAGE_URL]` macros in any URL strings.
 *
 * Handles the three shapes that `normalizeVideoConfig` accepts:
 * - `string` — the VAST URL directly
 * - `object` — a descriptor with `url`, `ads_url`, or `vastUrl`
 * - `array`  — an array of either of the above
 *
 * Returns the input unchanged when it contains no `[PAGE_URL]` macros or is
 * not a string/object/array.
 *
 * When the host supplied an app bundle (`macros.appb` present) and the entry is
 * an object with `platform === "tritondigital"`, its resolved URL fields are
 * additionally rewritten into an in-app Triton request (see
 * {@link rewriteTritonUrlForApp}). `appb` presence is the signal that we are
 * running inside an app webview — only the host app can supply a bundle id — so
 * any app-loaded Triton entry becomes an in-app request, with no per-tag config.
 * Bare-string and non-Triton entries are never rewritten.
 *
 * When `options.servedStatically` is set, every resolved URL additionally has its
 * `ua` param replaced with the real `navigator.userAgent` and its `ip` param
 * replaced with `options.clientIp` (or stripped when no IP is available — see
 * {@link AdUrlOptions}). Omitting the option leaves output byte-identical to the
 * pre-existing behavior.
 */
export function resolveVideoAdMacros(
  videoAd: unknown,
  pageUrl: string,
  macros: HostMacros = hostMacros,
  options?: AdUrlOptions
): unknown {
  if (!videoAd) return videoAd;

  if (typeof videoAd === "string") {
    return resolveAdUrlMacros(videoAd, pageUrl, macros, options);
  }

  if (Array.isArray(videoAd)) {
    return videoAd.map((entry) => resolveVideoAdMacros(entry, pageUrl, macros, options));
  }

  if (typeof videoAd === "object") {
    const ad = videoAd as Record<string, unknown>;
    const patched: Record<string, unknown> = { ...ad };
    // App webview (bundle present) + Triton → emit an in-app ad request.
    // Truthy check mirrors rewriteTritonUrlForApp's own `if (!appb)` guard.
    const isTritonAppRewrite = Boolean(macros.appb) && ad.platform === "tritondigital";
    for (const key of ["url", "ads_url", "vastUrl"] as const) {
      if (typeof ad[key] === "string") {
        let resolved = resolveAdUrlMacros(ad[key] as string, pageUrl, macros, options);
        if (isTritonAppRewrite) resolved = rewriteTritonUrlForApp(resolved, macros);
        patched[key] = resolved;
      }
    }
    return patched;
  }

  return videoAd;
}
