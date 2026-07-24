/**
 * Per-brand fullscreen redirect config — the single place to manage where a
 * brand's expand button redirects when fullscreen is unsupported (webview, or
 * an iframe without the Fullscreen API).
 *
 * Brands with no entry here get no redirect (see {@link FullScreenProvider}'s
 * `redirectToFullScreen`) until they're added below.
 */

/** A brand's fullscreen redirect destination. */
export interface FullScreenRedirectTarget {
  /** Destination base URL, without query params. */
  baseUrl: string;
  /** Value for the `embed_id` query param appended to `baseUrl`. Omit to send no query param (e.g. a QA placeholder). */
  embedId?: string;
}

/** Redirect destinations, keyed by numeric `brand_id`. */
export const BRAND_FULLSCREEN_REDIRECTS: Record<number, FullScreenRedirectTarget> = {
  3252: {
    baseUrl: "https://infolinks.begenuin.com/home",
    embedId: "6a4b8a153b428877f20c9bb5",
  },
  // QA placeholder — no real destination yet.
  3250: {
    baseUrl: "https://www.google.com",
  },
};

/**
 * Build the redirect URL for a brand, or `undefined` if the brand has no
 * configured redirect (caller should no-op in that case).
 *
 * @param brandId Active tag's `brand_id`, or `undefined` if unresolved yet.
 */
export function resolveFullScreenRedirectUrl(brandId: number | undefined): string | undefined {
  if (brandId === undefined) return undefined;
  const target = BRAND_FULLSCREEN_REDIRECTS[brandId];
  if (!target) return undefined;

  const url = new URL(target.baseUrl);
  if (target.embedId !== undefined) {
    url.searchParams.set("embed_id", target.embedId);
  }
  return url.toString();
}
