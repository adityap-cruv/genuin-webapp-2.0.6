/**
 * Deterministic mount harness for the contextual-reels widget E2E suite.
 *
 * The widget fetches its tag config + feed from `api.qa.begenuin.com`. Only the
 * FEED is mocked — `mountWidget` replays REAL captured QA responses
 * (tests/e2e/fixtures/raw/<tag>.{tag,feed}.json) for the two API endpoints, so
 * the feed shape is exactly what the bundle expects without hand-authoring deep
 * reel JSON, and the scenario (video-only / ad / video+ad) is pinned per tag.
 *
 * Everything else is REAL and end-to-end:
 *   - the GenAd SDK loads from the CDN and runs its live waterfall against the
 *     ad server (the QA ad config fills reliably), so ad slots render a real
 *     creative and real mute/CTA wiring; and
 *   - the Bunny-CDN `.m3u8` content video plays for real (also what keeps an
 *     unmute from tripping the autoplay-blocked → re-mute fallback).
 *
 * @see ../../../src/services/api.ts for the intercepted endpoints
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const rawDir = resolve(here, "../fixtures/raw");

/** Embed sizes → [width, height], mapping to the AD_LAYOUT ids. */
export const SIZE = {
  L1: [300, 600],
  L2: [300, 250],
  L3: [320, 50],
  L4: [320, 100],
  L5: [320, 480],
} as const;

export type SizeKey = keyof typeof SIZE;

/**
 * Named real QA tags, by the variation they exercise. Each maps to a pair of
 * captured fixtures: `<id>.tag.json` (ad_creative) + `<id>.feed.json` (feed).
 */
export const TAG = {
  /** type:"ads" reels with video_ad — AdLayout / AdControlBar path. */
  adOnly: "6a3aa78ba0daccfd439648b8",
  adOnlyAlt: "6a3aa7f7a0daccfd43964937",
  /** loop reels + ad_config — VideoLayout with a fullscreen ad break. */
  videoPlusAd: "6a3aa8244da8cd92d289cc72",
  videoPlusAdAlt: "6a3aa86e4da8cd92d289ccda",
  /** loop reels only — plain VideoLayout. */
  videoOnly: "6a3ba4395df1fee89bf0b2e7",
  videoOnlyAlt: "6a3ba5f35df1fee89bf0bae9",
} as const;

export interface MountOptions {
  /** Real QA tag id (use the `TAG` map). */
  tagId: string;
  /** Embed size; defaults to L4 (320×100). */
  size?: SizeKey;
}

/** Read a captured raw response (already wrapped in the `{ code, data }` envelope). */
function loadRaw(tagId: string, kind: "tag" | "feed"): string {
  return readFileSync(resolve(rawDir, `${tagId}.${kind}.json`), "utf8");
}

/** A minimal HTML page that hosts one `.gen-ext` and loads the built loader. */
function harnessHtml(tagId: string, [w, h]: readonly [number, number]): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<title>CXR E2E Harness</title>
<style>html,body{margin:0;background:#fff}.gen-ext{background:#000;display:block;overflow:hidden}</style>
</head><body>
<div class="gen-ext" id="gen-${tagId}" data-tag-id="${tagId}" style="width:${w}px;height:${h}px"></div>
<script type="module" src="/gen_ext.min.js"></script>
</body></html>`;
}

const FEED_RE = /\/goservices\/ad_creative\/feed/;
const TAG_RE = /\/goservices\/ad_creative(\?|$)/;
const IPINFO_RE = /\/goservices\/data\/ip_info/;

/**
 * Mount the widget for a real QA tag under mocked API + stubbed GenAd, and
 * return once the compact control bar has rendered inside the shadow root.
 *
 * @param page     Playwright page.
 * @param options  Which tag + size to mount.
 */
export async function mountWidget(page: Page, options: MountOptions): Promise<void> {
  const size = SIZE[options.size ?? "L4"];
  const { tagId } = options;
  const tagBody = loadRaw(tagId, "tag");
  const feedBody = loadRaw(tagId, "feed");

  // Feed MUST be matched before the broader tag regex.
  await page.route(FEED_RE, (route) => route.fulfill({ contentType: "application/json", body: feedBody }));
  await page.route(TAG_RE, (route) => {
    if (FEED_RE.test(route.request().url())) return route.fallback();
    return route.fulfill({ contentType: "application/json", body: tagBody });
  });
  await page.route(IPINFO_RE, (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ country_code: "US", ip: "0.0.0.0" }) })
  );
  // NOTE: the GenAd SDK + ad waterfall and the Bunny-CDN media are intentionally
  // NOT intercepted — they run for real, so this is a true end-to-end test.

  await page.route("**/e2e-harness", (route) =>
    route.fulfill({ contentType: "text/html", body: harnessHtml(tagId, size) })
  );

  await page.goto("/e2e-harness");
  // Wait for a slide layout to mount. For ad slots the control bar only renders
  // after the real waterfall fills (isAdReady) — the test waits for that with
  // `bar.waitForAdBar()` — so here we wait for the layout, not the bar.
  await page.waitForFunction(
    () => {
      const root = document.querySelector(".gen-ext")?.shadowRoot;
      return !!root?.querySelector(
        '[data-testid="video-layout"], [data-testid="ad-layout"], [data-testid="compact-control-bar"]'
      );
    },
    { timeout: 15_000 }
  );
}
