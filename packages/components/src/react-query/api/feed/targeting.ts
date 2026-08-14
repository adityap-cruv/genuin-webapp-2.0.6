import type { IpInfoResponse } from "@genuin/components/react-query/api/authentication/ip-info";

/**
 * Ad/feed targeting payload attached to every feed request.
 *
 * `location` is resolved separately at the `useFeed` hook level (via
 * `useIpInfo`, gated so the feed request waits for it) and merged in by the
 * caller — see `feed.ts`. This module only builds the synchronous metadata
 * fields: `keywords` and `page_url`.
 */
export type Targeting = {
  keywords?: string;
  location?: IpInfoResponse;
  page_url?: string;
};

/**
 * Reads keywords from the page's `<meta name="keywords">` tag.
 *
 * Splits on commas, trims each entry, drops empties and exact duplicates
 * (case-sensitive — original casing is preserved), then rejoins with ", ".
 *
 * @returns The cleaned keyword string, or `undefined` when the tag is absent
 *   or yields no keywords.
 */
function resolveMetaKeywords(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const content = document.querySelector('meta[name="keywords"]')?.getAttribute("content");
  if (!content) return undefined;

  const keywords = [
    ...new Set(
      content
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    ),
  ];
  return keywords.length ? keywords.join(", ") : undefined;
}

/**
 * Resolves the page URL to report, accounting for iframe embedding.
 *
 * - Not in an iframe: `window.location.href` (unchanged, exact).
 * - Same-origin iframe: the top frame's real URL (readable directly).
 * - Cross-origin iframe: `window.top.location` access throws, so falls back to
 *   `document.referrer` — which, in this branch, means "the page that embedded
 *   us" rather than "the previous page" — then to the iframe's own URL as a
 *   last resort if referrer is empty/blocked.
 *
 * @returns The resolved URL, or `undefined` outside a browser context.
 */
function resolvePageUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    if (window.top === window.self) {
      return window.location.href;
    }
    return window.top!.location.href;
  } catch {
    return document.referrer || window.location.href;
  }
}

/**
 * Builds the synchronous portion of `targeting` — `keywords` and `page_url`,
 * neither of which needs a network call. `location` is NOT included here;
 * `useFeed` resolves it via `useIpInfo()` and merges it in, since that needs
 * React Query's hook-based cache plus an `enabled` gate to guarantee the feed
 * request waits for geo-ip to settle before firing.
 *
 * @returns The fields that could be resolved, or `undefined` if both are empty.
 */
export function buildTargetingSync(): Pick<Targeting, "keywords" | "page_url"> | undefined {
  const keywords = resolveMetaKeywords();
  const pageUrl = resolvePageUrl();

  const metadata: Pick<Targeting, "keywords" | "page_url"> = {
    ...(keywords && { keywords }),
    ...(pageUrl && { page_url: pageUrl }),
  };

  return Object.keys(metadata).length ? metadata : undefined;
}
