/**
 * Ad URL macro resolution.
 *
 * Some ad sources (e.g. Triton Digital) embed macros like [PAGE_URL] in the
 * ad request URL that must be replaced with the actual page URL before the
 * request is fired. This module handles detection and substitution.
 */

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
 * Replace `[PAGE_URL]` macros in an ad URL with the encoded current page URL.
 *
 * @param url      The raw ad URL that may contain `[PAGE_URL]` placeholders.
 * @param pageUrl  The resolved page URL to substitute in.
 * @returns The URL with all `[PAGE_URL]` occurrences replaced.
 */
export function resolveAdUrlMacros(url: string, pageUrl: string): string {
  if (!url.includes('[PAGE_URL]')) return url;
  return url.replaceAll('[PAGE_URL]', encodeURIComponent(pageUrl));
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
 */
export function resolveVideoAdMacros(videoAd: unknown, pageUrl: string): unknown {
  if (!videoAd) return videoAd;

  if (typeof videoAd === 'string') {
    return resolveAdUrlMacros(videoAd, pageUrl);
  }

  if (Array.isArray(videoAd)) {
    return videoAd.map((entry) => resolveVideoAdMacros(entry, pageUrl));
  }

  if (typeof videoAd === 'object') {
    const ad = videoAd as Record<string, unknown>;
    const patched: Record<string, unknown> = { ...ad };
    for (const key of ['url', 'ads_url', 'vastUrl'] as const) {
      if (typeof ad[key] === 'string') {
        patched[key] = resolveAdUrlMacros(ad[key] as string, pageUrl);
      }
    }
    return patched;
  }

  return videoAd;
}
