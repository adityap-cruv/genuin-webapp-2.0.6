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
  if (typeof window === 'undefined') return '';

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
 * Tag ids whose Triton (`tritondigital`) ad requests are rewritten to in-app
 * form at resolution time — an INTERIM measure until the backend serves app
 * params in its Triton template (see design spec §6). Web tags are unaffected.
 */
export const TRITON_APP_PARAM_TAG_IDS: ReadonlySet<string> = new Set([
  "6a3915b692929ebec64d785e", // 320x100 ads-only (app)
  "6a39163e92929ebec64d78ab", // 320x50 ads-only (app)
]);

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
  if (!appb) return url; // no bundle → cannot form an app request; leave as-is

  let result = url;

  // 1. Remove `site-url=<value>` (value = up to next `&` or end) in any
  //    position. Consuming an optional `&` on EITHER side (at most one) keeps
  //    the surrounding `?a&b` separators intact — no `?&`, leading, or trailing
  //    `&` artifact. When site-url sits between two params both a leading and a
  //    trailing `&` match, so collapse the pair back to a single separator.
  result = result.replace(/&?site-url=[^&]*&?/, (match) =>
    match.startsWith("&") && match.endsWith("&") ? "&" : ""
  );

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
  result += (result.includes("?") ? "&" : "?") + appParams.join("&");

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
  macros: HostMacros = hostMacros
): string {
  let result = url;
  if (result.includes("[PAGE_URL]")) {
    result = result.replaceAll("[PAGE_URL]", encodeURIComponent(pageUrl));
  }
  result = resolveHostMacroTokens(result, macros);
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
 * When `tagId` is allowlisted in {@link TRITON_APP_PARAM_TAG_IDS} and the entry
 * is an object with `platform === "tritondigital"`, its resolved URL fields are
 * additionally rewritten into an in-app Triton request (see
 * {@link rewriteTritonUrlForApp}). This is an INTERIM measure — bare-string and
 * non-Triton entries are never rewritten.
 *
 * @param tagId - Tag id used to gate the interim Triton in-app rewrite.
 */
export function resolveVideoAdMacros(
  videoAd: unknown,
  pageUrl: string,
  macros: HostMacros = hostMacros,
  tagId?: string
): unknown {
  if (!videoAd) return videoAd;

  if (typeof videoAd === "string") {
    return resolveAdUrlMacros(videoAd, pageUrl, macros);
  }

  if (Array.isArray(videoAd)) {
    return videoAd.map((entry) => resolveVideoAdMacros(entry, pageUrl, macros, tagId));
  }

  if (typeof videoAd === "object") {
    const ad = videoAd as Record<string, unknown>;
    const patched: Record<string, unknown> = { ...ad };
    const isTritonAppRewrite =
      tagId !== undefined &&
      TRITON_APP_PARAM_TAG_IDS.has(tagId) &&
      ad.platform === "tritondigital";
    for (const key of ["url", "ads_url", "vastUrl"] as const) {
      if (typeof ad[key] === "string") {
        let resolved = resolveAdUrlMacros(ad[key] as string, pageUrl, macros);
        if (isTritonAppRewrite) resolved = rewriteTritonUrlForApp(resolved, macros);
        patched[key] = resolved;
      }
    }
    return patched;
  }

  return videoAd;
}
