export const IHEART_CTA_UTM_CAMPAIGN = "local_highlights";
export const IHEART_FULLSCREEN_PARAM = "fullscreen";
export const IHEART_FULLSCREEN_PARAM_VALUE = "True";

function buildUrl(url: string | URL): URL {
  if (url instanceof URL) {
    return new URL(url.toString());
  }

  return typeof window === "undefined" ? new URL(url) : new URL(url, window.location.href);
}

/**
 * Hostnames to check for "is this an iheart.com page": the current window's own
 * hostname, plus — when embedded in a cross-origin iframe, where
 * `window.location.hostname` only reflects the iframe's own host (the SDK
 * origin) — every ancestor frame's hostname (Chromium/WebKit) and the document
 * referrer as a fallback (may be blank under a strict referrer-policy).
 */
export function getCandidateHostnames(): string[] {
  if (typeof window === "undefined") return [];
  const hostnames = [window.location.hostname];

  try {
    const ancestors = window.location.ancestorOrigins;
    for (let i = 0; i < (ancestors?.length ?? 0); i++) {
      const origin = ancestors.item(i);
      if (origin) hostnames.push(new URL(origin).hostname);
    }
  } catch {
    // ancestorOrigins unavailable/unparsable — fall through to referrer.
  }

  if (typeof document !== "undefined" && document.referrer) {
    try {
      hostnames.push(new URL(document.referrer).hostname);
    } catch {
      // malformed referrer — ignore.
    }
  }

  return hostnames;
}

/**
 * True when the current page is an iheart.com subdomain (e.g. mike.iheart.com) —
 * directly, or via a cross-origin iframe embedded on one.
 */
export function isCurrentPageIheartSubdomain(): boolean {
  return getCandidateHostnames().some((hostname) => hostname.toLowerCase().endsWith(".iheart.com"));
}

export function addIheartCtaCampaign(url: string | URL): URL {
  const nextUrl = buildUrl(url);
  if (!isCurrentPageIheartSubdomain()) return nextUrl;

  nextUrl.searchParams.set("utm_campaign", IHEART_CTA_UTM_CAMPAIGN);
  return nextUrl;
}

export const IHEART_LISTEN_LIVE_UTM_CAMPAIGN = IHEART_CTA_UTM_CAMPAIGN;
export const addIheartListenLiveCampaign = addIheartCtaCampaign;
