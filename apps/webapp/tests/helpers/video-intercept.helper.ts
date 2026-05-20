import type { Page, Route } from "@playwright/test";

const MEDIA_URL_KEYS = new Set([
  "media_url",
  "media_url_m3u8",
  "thumbnail_url",
  "thumbnail_url_s",
  "thumbnail_url_m",
  "thumbnail_url_l",
]);

function stripMediaUrls(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(stripMediaUrls);
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => {
      if (MEDIA_URL_KEYS.has(k) && typeof v === "string") return [k, ""];
      return [k, stripMediaUrls(v)];
    })
  );
}

/**
 * Intercept feed API responses and strip all video/thumbnail URLs so the
 * browser never fetches or renders video content. Must be called before page.goto().
 */
export async function stubVideoSources(page: Page): Promise<void> {
  const interceptMediaUrls = async (route: Route) => {
    const response = await route.fetch();
    const body = await response.text();
    try {
      const patched = stripMediaUrls(JSON.parse(body));
      await route.fulfill({ response, body: JSON.stringify(patched) });
    } catch {
      await route.fulfill({ response });
    }
  };

  await page.route("**/goservices/feed/home*", interceptMediaUrls);
}
