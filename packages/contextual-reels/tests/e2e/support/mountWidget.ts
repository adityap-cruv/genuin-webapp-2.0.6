/**
 * Deterministic mount harness for the contextual-reels widget E2E suite.
 *
 * What is mocked, and what is not:
 *
 *   - **Tag config + feed** (`/goservices/ad_creative[/feed]`) — replayed from
 *     REAL captured QA responses in `tests/e2e/fixtures/raw/`, so the feed shape
 *     is exactly what the bundle expects and the scenario is pinned per tag.
 *   - **`/ip_info`** — a fixed US record. Still served for `servedStatically`
 *     tags: geoip stays on analytics and supplies the real client IP.
 *   - **GenAd SDK + ad waterfall** — REAL by default (loads from the CDN, fills
 *     against the live ad server). A spec that needs to assert *whether or when*
 *     an ad request fires opts into interception via `support/adRequests.ts`.
 *   - **Content video** (Bunny CDN `.m3u8`) — REAL, so playback state is genuine
 *     (also what keeps an unmute from tripping the autoplay-blocked re-mute).
 *
 * Three determinism controls exist because the widget reads config the suite
 * would otherwise have no way to pin:
 *
 *   - `strategies` — a localhost-only patch (`src/strategies/testOverrides.ts`)
 *     reaching flag combinations no real tag carries.
 *   - `experimentRoll` — pins the `TAG_EXPERIMENTS` bucket. Without this a
 *     sampled tag flips its config on ~10% of loads and the spec flakes.
 *   - `apiCalls` on the returned handle — lets a spec assert that a
 *     `servedStatically` tag never touched `/ad_creative` or `/feed`.
 *
 * @see ../../../src/services/api.ts for the intercepted endpoints
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "@playwright/test";

// Type-only: erased at runtime, so the Playwright process never loads `src/`.
// Gives specs compile-time checking on their strategy patches.
import type { Strategies } from "@cxr/strategies/strategies";

import { waitUntil } from "./poll";
import { SHADOW_INIT_SCRIPT } from "./shadow";

const here = dirname(fileURLToPath(import.meta.url));
const rawDir = resolve(here, "../fixtures/raw");

/**
 * URL param carrying the strategy patch. Mirrors `STRATEGY_OVERRIDE_PARAM` in
 * `src/strategies/testOverrides.ts` — kept as a literal so this harness never
 * imports runtime `src/` code.
 */
const STRATEGY_OVERRIDE_PARAM = "cxr_strategies";

/** sessionStorage key prefix for the experiment roll. Mirrors `strategies.ts`. */
const EXP_ROLL_KEY_PREFIX = "cxr:exp-roll:";

/**
 * Default experiment roll. Above every `sampleRate` in `TAG_EXPERIMENTS` (max
 * 0.1 today), so a tag carrying an experiment resolves to its BASE config unless
 * a spec explicitly asks for the sampled arm.
 */
const UNSAMPLED_ROLL = 0.999;

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
 * Real QA tags, named for what they actually are. Each maps to a captured
 * fixture pair: `<id>.tag.json` (ad_creative) + `<id>.feed.json` (feed).
 *
 * The trailing note on each is its resolved config in `strategyConfig.ts` —
 * that is what a spec is really choosing between, so it is spelled out here
 * rather than left to be re-derived.
 */
export const TAG = {
  /**
   * 5 × `type:"ads"` reels — AdLayout / AdControlBar. NOT in `TAG_STRATEGIES`,
   * so every flag resolves to its default (all off, `initialVolume: 0`). That
   * all-off baseline is the point: strategy specs patch exactly one flag via
   * `strategies` and nothing else moves. Costs a one-shot `unknown tag …` warn.
   */
  ads: "6a3aa7f7a0daccfd43964937",
  /**
   * 5 × `type:"ads"` reels, `servedStatically: true` + `gateOnUnmute` +
   * `singleHitWaterfall` + `initialVolume: 0.2`. Registered in
   * `STATIC_TAG_LOADERS`, so the widget reads `src/providers/static-tag/` and
   * NEVER calls `/ad_creative` or `/feed` — the captured fixtures below are not
   * served for this tag. Use it only to assert the static path itself.
   */
  adsStatic: "6a3aa78ba0daccfd439648b8",
  /** 6 × `loop` reels. NOT in `TAG_STRATEGIES` → all-off baseline. */
  video: "6a3ba5f35df1fee89bf0bae9",
  /** 6 × `loop` reels, `gateOnUnmute: true`. */
  videoGated: "6a3ba4395df1fee89bf0b2e7",
  /**
   * 6 × `loop` reels, `gateOnUnmute: true` AND a `TAG_EXPERIMENTS` entry at
   * `sampleRate: 0.1` (`gateOnUnmute:false, mutePassback:false`). Always pass an
   * explicit `experimentRoll` when mounting this — that is the whole point of it.
   */
  videoExperiment: "6a3aa8244da8cd92d289cc72",
  /** 6 × `loop` reels, `initialVolume: 0.2` + `singleHitWaterfall` — audible start. */
  videoAudible: "6a3aa86e4da8cd92d289ccda",
} as const;

/** Endpoints the harness intercepts, counted on the returned {@link MountHandle}. */
export interface ApiCallCounts {
  /** `/goservices/ad_creative` — 0 for a `servedStatically` tag. */
  tag: number;
  /** `/goservices/ad_creative/feed` — 0 for a `servedStatically` tag. */
  feed: number;
  /** `/goservices/data/ip_info` — fires even for a `servedStatically` tag. */
  ipInfo: number;
}

/** Returned by {@link mountWidget} so specs can assert on the mount itself. */
export interface MountHandle {
  /**
   * Live counts of the intercepted API calls. Read AFTER the assertion's own
   * wait — a count read too early proves nothing.
   */
  apiCalls: ApiCallCounts;
}

export interface MountOptions {
  /** Real QA tag id (use the {@link TAG} map). */
  tagId: string;
  /**
   * Embed size — a named {@link SIZE} key, or explicit `[width, height]` for a
   * slot that deliberately matches no variant (resolves to `AD_LAYOUT.Unknown`).
   * Defaults to L4 (320×100).
   */
  size?: SizeKey | readonly [number, number];
  /**
   * Strategy patch applied as the LAST step of the cascade, beating tag config,
   * the traffic experiment, `GIV` and the dashboard `enable_ask_question`
   * override alike. Localhost-gated in the bundle, so it is inert in production.
   *
   * @example
   * ```ts
   * await mountWidget(page, {
   *   tagId: TAG.video, size: "L1",
   *   strategies: { visibilityGate: true, visibilityGateTimeoutMs: 1000 },
   * });
   * ```
   */
  strategies?: Partial<Strategies>;
  /**
   * Experiment bucket roll in `[0, 1)`, seeded into `sessionStorage` before any
   * page script runs. A load is in the bucket when `roll < sampleRate`.
   *
   * Defaults to {@link UNSAMPLED_ROLL} — every mount takes the tag's base config
   * unless a spec asks otherwise. Do not remove this default: each Playwright
   * test gets a fresh context, so an unseeded roll is redrawn per test and a
   * sampled tag silently flips config on ~10% of runs.
   */
  experimentRoll?: number;
  /**
   * Extra query params appended to the harness URL, e.g. `"gen_variant=stacked"`.
   * The widget runs in the harness page's own frame, so a param here is read by
   * the same code that reads it in production.
   */
  query?: string;
  /**
   * Deep-merged into the captured tag object before it is served — e.g.
   * `{ config: { enable_ask_question: true } }` to switch GenAI on.
   *
   * For BACKEND-shaped config only (things the dashboard sends). Feature flags
   * belong in `strategies`. Each use should mount the un-patched tag too, so the
   * assertion is the delta rather than the patched state alone.
   */
  tagOverrides?: Record<string, unknown>;
  /**
   * Render the slot below the fold, behind a tall spacer, so it starts OUTSIDE
   * the viewport. Required to exercise `visibilityGate` — with the slot at the
   * top of the page it is visible on mount and the gate opens immediately.
   *
   * Pair with `awaitMount: "none"`: a gated unit renders the skeleton, not a
   * slide layout, so the default wait would time out.
   */
  offscreen?: boolean;
  /**
   * What to wait for before returning. `"layout"` (default) waits for a slide
   * layout inside the shadow root. `"none"` returns as soon as the document has
   * loaded — for a gated or passed-back unit that never mounts a layout.
   */
  awaitMount?: "layout" | "none";
  /**
   * How many `.gen-ext` slots the harness page hosts. Defaults to 1.
   *
   * `index.jsx` scans `document.querySelectorAll(".gen-ext")` and mints one
   * instance per node, so >1 exercises the multi-embed path: separate instance
   * ids, separate shadow roots, and the global mute/player coordinators having
   * more than one participant. Each slot gets DOM id `gen-<tagId>-<n>`.
   */
  slotCount?: number;
}

/** True for a plain object (not an array, not null) — the recursion target. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Recursively merge `patch` into `target`, replacing arrays and primitives
 * outright. Local to the harness on purpose: it patches a JSON fixture, not the
 * runtime config objects `@cxr/utils/deepMerge` is built for.
 */
function deepMerge(target: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(patch)) {
    const existing = out[key];
    out[key] = isPlainObject(existing) && isPlainObject(value) ? deepMerge(existing, value) : value;
  }
  return out;
}

/**
 * Apply `overrides` to the tag object inside a captured `{ code, data }` body.
 *
 * Today's `/ad_creative` response puts the tag fields directly on `data`, which
 * is what every captured fixture here holds. The `data.iab_standard_tag` branch
 * is kept so the helper survives the feed-API-v2 nesting when that lands.
 *
 * @returns The re-serialised body.
 */
export function applyTagOverrides(body: string, overrides: Record<string, unknown>): string {
  const parsed = JSON.parse(body) as { data?: Record<string, unknown> };
  const data = parsed.data;
  if (!isPlainObject(data)) throw new Error("tagOverrides: captured tag body has no `data` object");

  const tag = data.iab_standard_tag;
  if (isPlainObject(tag)) {
    data.iab_standard_tag = deepMerge(tag, overrides);
  } else {
    parsed.data = deepMerge(data, overrides);
  }
  return JSON.stringify(parsed);
}

/** Read a captured raw response (already wrapped in the `{ code, data }` envelope). */
function loadRaw(tagId: string, kind: "tag" | "feed"): string {
  return readFileSync(resolve(rawDir, `${tagId}.${kind}.json`), "utf8");
}

/**
 * Guarantee the served feed carries a `visit_id`, as a real `/feed` response does.
 *
 * `createFeedGenerator` reads `data.visit_id` and only then calls
 * `setMandatoryData({ visit_id })`. That is one of the TWO keys
 * `RudderstackEventBuffer` requires before it will flush (the other is `geoip`),
 * so a fixture without one leaves every event queued in `buffering` forever and
 * NOTHING reaches `rudderanalytics.track`. The captured QA bodies happen to omit
 * it, which is why analytics was not observable from this suite at all.
 *
 * Injecting it makes the replay MORE faithful to production, not less — a real
 * response always carries one. A fixture that already has one is left alone.
 */
function withVisitId(body: string, tagId: string): string {
  const parsed = JSON.parse(body) as { data?: Record<string, unknown> };
  if (!isPlainObject(parsed.data)) return body;
  if (typeof parsed.data.visit_id === "string" && parsed.data.visit_id) return body;
  // Deterministic per tag: a test that asserts on visit_id gets a stable value,
  // and nothing in the suite depends on it varying per load.
  parsed.data.visit_id = `e2e-visit-${tagId}`;
  return JSON.stringify(parsed);
}

/**
 * A minimal HTML page that hosts one `.gen-ext` and loads the built loader.
 *
 * With `offscreen`, a 200vh spacer pushes the slot below the fold so a
 * `visibilityGate` mount starts genuinely hidden. `data-testid="spacer"` gives
 * a spec something to scroll the slot into view against.
 */
function harnessHtml(tagId: string, [w, h]: readonly [number, number], offscreen: boolean, slotCount: number): string {
  const spacer = offscreen ? `<div data-testid="spacer" style="height:200vh"></div>` : "";
  const slots = Array.from(
    { length: slotCount },
    (_unused, i) =>
      `<div class="gen-ext" id="gen-${tagId}-${i}" data-tag-id="${tagId}" style="width:${w}px;height:${h}px"></div>`
  ).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8">
<title>CXR E2E Harness</title>
<style>html,body{margin:0;background:#fff}.gen-ext{background:#000;display:block;overflow:hidden}</style>
</head><body>
${spacer}${slots}
<script type="module" src="/gen_ext.min.js"></script>
</body></html>`;
}

/** Build the harness URL, folding in the strategy patch and any caller params. */
function harnessUrl(strategies: Partial<Strategies> | undefined, query: string | undefined): string {
  const params = new URLSearchParams(query);
  if (strategies) params.set(STRATEGY_OVERRIDE_PARAM, JSON.stringify(strategies));
  const search = params.toString();
  return search ? `/e2e-harness?${search}` : "/e2e-harness";
}

const FEED_RE = /\/goservices\/ad_creative\/feed/;
const TAG_RE = /\/goservices\/ad_creative(\?|$)/;
const IPINFO_RE = /\/goservices\/data\/ip_info/;

/**
 * Third-party hosts no assertion in the suite depends on. Blocked for
 * CORRECTNESS, not speed — see the measurement below before "optimising" this.
 *
 * Two separate telemetry leaks, both of which had the suite writing into live
 * systems on every run:
 *
 * 1. Rudderstack. `captureAnalytics` stops the SDK loading (`initRudderstack`
 *    no-ops once `window.rudderanalytics` exists), but only 7 of 35 tests
 *    install the recorder. The other 28 were downloading the real SDK and
 *    **emitting real analytics events off the back of it** — precisely the leak
 *    the recorder's docblock claims the suite does not have. Aborting the host
 *    makes that guarantee hold for every test, not just the ones that opt in.
 *
 * 2. The observability pixel. `.env.development` points `VITE_CXR_PIXEL_URL` at
 *    **`api.begenuin.com` (production) in its QA block as well as its PROD one**,
 *    so every mount fired ~3 `px-lo` beacons at the live endpoint, stamped with
 *    the build's git SHA (`?bid=<key>.<sha>`). ~195 production writes per suite
 *    run, more with CI retries. No spec asserts on pixels, so this is pure leak.
 *    Blocked by path rather than by host, so a future real `api.begenuin.com`
 *    call is not silently swallowed too.
 *
 * `fonts.googleapis` rides along: `dist/assets/cxr-*.css` @imports Inter, and
 * nothing here reads a glyph or a text metric (assertions are `img` src, box
 * geometry against slots sized by `AD_LAYOUT`, video state, analytics events).
 *
 * NOT a retreat from ADR 004 — the GenAd exchange and Bunny-CDN media still run
 * for real. These are page weight, not the thing under test.
 *
 * Measured, and the speed hypothesis FAILED: a trace showed 1.23 s of font and
 * 0.93 s of SDK per mount, but those load in parallel with the mount rather than
 * on its critical path. Interleaved A/B over the l3 spec (8 tests, 3 rounds)
 * came out 53.5-54.2 s blocked vs 52.4-53.5 s unblocked — ~0.15 s per test, i.e.
 * nothing. Request duration in a trace is not blocking time.
 */
const THIRD_PARTY_NOISE_RE = /fonts\.(googleapis|gstatic)\.com|cdn\.rudderlabs\.com|api\.rudderstack\.com/;

/** Observability beacons — fulfilled, never aborted. See {@link PIXEL_GIF}. */
const PIXEL_RE = /\/goservices\/dsp\/pixel\//;

/**
 * A 1x1 transparent GIF, served with 200, in place of the real pixel response.
 *
 * Deliberately NOT `route.abort()`. Aborting yields `net::ERR_FAILED`, which is
 * what an ad blocker produces — a genuinely different scenario, and one the
 * suite would then have been testing silently on every run. Measured: aborting
 * cost 14 of 65 tests, scattered across every spec and both projects including
 * pure `@routing` cases that touch no ad. Fulfilling costs none.
 *
 * "Does a blocked pixel break the mount?" is a real and worthwhile question —
 * the loader's px-lo is a fire-and-forget `new Image()` and looks fail-safe by
 * construction — but it deserves its own explicit test, not an accident of the
 * shared mount helper.
 */
const PIXEL_GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

/**
 * Mount the widget for a real QA tag and return once a slide layout has
 * rendered inside the shadow root.
 *
 * Waits for the LAYOUT, not the control bar: on an ad slot the bar only renders
 * once the real waterfall fills, which is the spec's wait (`waitForAdBar`), not
 * the harness's.
 *
 * @param page    Playwright page.
 * @param options Which tag, size, strategies and experiment bucket to mount.
 * @returns A handle exposing the intercepted API call counts.
 */
export async function mountWidget(page: Page, options: MountOptions): Promise<MountHandle> {
  const requested = options.size ?? "L4";
  const size = typeof requested === "string" ? SIZE[requested] : requested;
  const {
    tagId,
    query,
    tagOverrides,
    strategies,
    experimentRoll = UNSAMPLED_ROLL,
    offscreen = false,
    awaitMount = "layout",
    slotCount = 1,
  } = options;
  const rawTagBody = loadRaw(tagId, "tag");
  const tagBody = tagOverrides ? applyTagOverrides(rawTagBody, tagOverrides) : rawTagBody;
  const feedBody = withVisitId(loadRaw(tagId, "feed"), tagId);

  const apiCalls: ApiCallCounts = { tag: 0, feed: 0, ipInfo: 0 };

  // Feed MUST be matched before the broader tag regex.
  await page.route(FEED_RE, (route) => {
    apiCalls.feed++;
    return route.fulfill({ contentType: "application/json", body: feedBody });
  });
  await page.route(TAG_RE, (route) => {
    if (FEED_RE.test(route.request().url())) return route.fallback();
    apiCalls.tag++;
    return route.fulfill({ contentType: "application/json", body: tagBody });
  });
  await page.route(IPINFO_RE, (route) => {
    apiCalls.ipInfo++;
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ country_code: "US", ip: "0.0.0.0" }),
    });
  });
  await page.route(THIRD_PARTY_NOISE_RE, (route) => route.abort());
  await page.route(PIXEL_RE, (route) => route.fulfill({ status: 200, contentType: "image/gif", body: PIXEL_GIF }));
  // NOTE: the GenAd SDK + ad waterfall and the Bunny-CDN media are intentionally
  // NOT intercepted here — they run for real. Opt into counting ad requests with
  // `captureAdRequests` from `./adRequests` when the assertion is about the request.

  // Stacked-aware shadow-root resolver, available to the first evaluate after
  // navigation. See ./shadow.ts for why it is installed rather than imported.
  await page.addInitScript(SHADOW_INIT_SCRIPT);

  // Seed the experiment bucket BEFORE any page script reads it, so the tag's
  // config is pinned rather than redrawn per test context.
  await page.addInitScript(
    ([key, roll]) => {
      try {
        window.sessionStorage.setItem(key as string, String(roll));
      } catch {
        // sessionStorage blocked — the widget falls back to a fresh draw.
      }
    },
    [`${EXP_ROLL_KEY_PREFIX}${tagId}`, experimentRoll] as const
  );

  // Trailing `*` so a harness URL carrying a query still matches — Playwright
  // globs are tested against the full URL.
  await page.route("**/e2e-harness*", (route) =>
    route.fulfill({ contentType: "text/html", body: harnessHtml(tagId, size, offscreen, slotCount) })
  );

  // `domcontentloaded`, not the default `load`: the harness pulls real HLS media
  // and a real ad creative, so `load` waits on third-party subresources that can
  // stall past the test timeout. The wait below is the real readiness signal.
  await page.goto(harnessUrl(strategies, query), { waitUntil: "domcontentloaded" });
  if (awaitMount === "none") return { apiCalls };

  await waitUntil(
    page,
    "a slide layout to mount",
    () => {
      // Ordinarily the shadow root sits on the `.gen-ext` slot; under the
      // stacked variant the slot is split and the root lives on the top row.
      const slot = document.querySelector(".gen-ext");
      const root = slot?.shadowRoot ?? slot?.querySelector('[data-genuin-cxr="stacked-top"]')?.shadowRoot;
      return !!root?.querySelector(
        '[data-testid="video-layout"], [data-testid="ad-layout"], [data-testid="compact-control-bar"]'
      );
    },
    { timeoutMs: 15_000 }
  );

  return { apiCalls };
}
