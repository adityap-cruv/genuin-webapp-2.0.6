export const IHEART_CTA_UTM_CAMPAIGN = "local_highlights";
export const IHEART_FULLSCREEN_PARAM = "fullscreen";
export const IHEART_FULLSCREEN_PARAM_VALUE = "True";

function buildUrl(url: string | URL): URL {
  if (url instanceof URL) {
    return new URL(url.toString());
  }

  return typeof window === "undefined" ? new URL(url) : new URL(url, window.location.href);
}

export function isCurrentPageIheartSubdomain(): boolean {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname.toLowerCase();
  return hostname.endsWith(".iheart.com");
}

export function addIheartCtaCampaign(url: string | URL): URL {
  const nextUrl = buildUrl(url);
  if (!isCurrentPageIheartSubdomain()) return nextUrl;

  nextUrl.searchParams.set("utm_campaign", IHEART_CTA_UTM_CAMPAIGN);
  return nextUrl;
}

export const IHEART_LISTEN_LIVE_UTM_CAMPAIGN = IHEART_CTA_UTM_CAMPAIGN;
export const addIheartListenLiveCampaign = addIheartCtaCampaign;
