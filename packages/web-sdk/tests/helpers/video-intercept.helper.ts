import type { Page } from "@playwright/test";
import type { Route } from "@playwright/test";

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
 * Intercept API JSON responses and strip all video/thumbnail URLs.
 *
 * Operates at the data layer — SDK never receives a URL to pass to OpenPlayerJS
 * or hls.js, so no video fetching or poster rendering occurs. Works for all
 * layouts including HLS (iheart) where prototype patching cannot reach.
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

  await page.route("**/goservices/feed/v1/home*", interceptMediaUrls); // carousel
  // await page.route('**/goservices/placement/sections*', interceptMediaUrls) // feed, grid, iheart
}

/**
 * Inject CSS into each SDK shadow root to black out video frames.
 *
 * Must be called AFTER SDK renders (shadow roots exist). Targets only <video>
 * elements — overlay controls, titles, and buttons are sibling/parent divs
 * and are unaffected. Also clears poster attributes so thumbnails don't bleed through.
 */
export async function freezeVideosInShadowDom(page: Page): Promise<void> {
  await page.evaluate(() => {
    const shadowHosts = document.querySelectorAll('[data-genuin-host="true"]');
    shadowHosts.forEach((host) => {
      const shadowRoot = host.shadowRoot;
      if (!shadowRoot) return;
      const style = document.createElement("style");
      style.textContent = "video { background: #000 !important; }";
      shadowRoot.appendChild(style);
      shadowRoot.querySelectorAll("video").forEach((v) => v.removeAttribute("poster"));
    });
  });
}
