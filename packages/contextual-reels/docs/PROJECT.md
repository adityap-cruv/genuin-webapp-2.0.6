# @genuin/contextual-reels — Project Reference

Embeddable contextual-reel ad widget. Delivered as a single IIFE bundle (`gen_ext.min.js`)
from CDN. Self-boots by scanning the partner page for `.gen-ext` mount points, creates an
isolated Shadow DOM root per mount, and renders a full React tree with no changes required
to the partner's script tags beyond the initial loader include.

---

## Scripts

| Command              | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Vite dev server                                   |
| `pnpm build`         | Production build                                  |
| `pnpm build:qa`      | QA build                                          |
| `pnpm build:prod`    | Prod build                                        |
| `pnpm test`          | Unit tests (Vitest, jsdom)                        |
| `pnpm test:watch`    | Vitest watch mode                                 |
| `pnpm test:coverage` | Vitest + v8 coverage, per-file thresholds         |
| `pnpm test:e2e`      | Playwright end-to-end tests                       |
| `pnpm typecheck`     | `tsc --noEmit` (strict, 0 errors required)        |
| `pnpm lint`          | ESLint against `src/`                             |
| `pnpm format`        | Prettier write                                    |
| `pnpm tdd:pairing`   | Assert every impl file has a sibling test         |
| `pnpm tdd:order`     | Assert test files committed before impl on branch |

---

## Source Layout

```
src/
├── loader/          entry IIFE, CDN base URL resolve
├── boot/            container scan, Shadow DOM roots, MutationObserver teardown
├── app/             App.tsx composition root + CloseButton
├── providers/       Analytics → Config → Feed → Ad → GenAI → Player
├── feed/            Feed, ReelList, ReelItem, layouts/, control-layer/, hooks/, feedTransforms
├── player/          LightPlayer, HLS hook, IMA hook, usePlayerLifecycle, VideoScrubber
├── ads/             GenAd SDK boundary, waterfall, normalizers, GenAdSlot, AdControlBar
├── genai/           OctoOverlay, genAiSdk loader
├── analytics/       sendEventLog, rudderstack, eventBuffer, eventNames
├── services/        api, feed generator, device detection, topWindow
├── instance/        multi-instance registry, GlobalPlayerCoordinator, GlobalMuteCoordinator,
│                    CxrEventBus, EventBusContext, InstanceContext, InstanceRegistry
├── config.ts        env constants, adLayouts, tagAllowLists
├── utils/           logger, eventBus
├── types/           API shapes, feedItem, analytics, window.d.ts
└── styles/          tokens, animations, layout, feed, player, ads
```

---

## Data Flow

1. **Boot** — `boot/boot.ts` scans `.gen-ext` nodes, creates a Shadow DOM root per node,
   mounts `<App>` into each root. `MutationObserver` on `document` detects nodes added
   or removed at runtime (SPA navigation, lazy slots) — see
   [ADR 003](cxr-decisions/003-mutation-observer-scope.md).

2. **Config** — `ConfigProvider` calls `services/api.ts → getTag(tagId)`. Result frozen
   and injected via Context. Re-renders once on fetch resolution.

3. **Feed** — `FeedProvider` calls `services/feed.ts → createFeedGenerator(tagId)`.
   Batches are yielded lazily as the user scrolls. `feedTransforms.ts` normalises raw
   API items into typed `FeedItem` objects and interleaves ad slots (strictly 1:1).

4. **Player** — `LightPlayer` wraps a `<video>` element. `hlsPlayer.ts` loads hls.js
   lazily (only when `canPlayType('application/vnd.apple.mpegurl')` is falsy).
   `usePlayerLifecycle` manages HLS attach/detach, IMA ad playback, autoplay, and
   quartile events. `GlobalPlayerCoordinator` (singleton per page) ensures at most one
   instance plays at a time across all mounted widgets.

5. **Ads** — `AdProvider` loads `gen_ad.js` from CDN (idempotent). `useGenAdInstance`
   calls `window.GenAd.init(slotConfig, callbacks)` per slot. Fill/no-fill callbacks
   fire `postMessage` to the parent frame and emit Rudderstack events.

6. **GenAI** — `GenAIProvider` drives a status machine (`none → data-fetching → data-loaded`).
   `genAiSdk.ts` lazily loads the GenAI SDK. `OctoOverlay` renders on top of the reel
   once status is `data-loaded`.

7. **Analytics** — every event calls `useAnalytics().sendEvent(EVENT_NAME, payload)`.
   `AnalyticsProvider` buffers calls until Rudderstack is initialised then flushes FIFO.

---

## Provider Stack

Outermost → innermost. Each layer re-renders at the noted frequency.

| #   | Provider          | Provides                           | Re-render trigger     |
| --- | ----------------- | ---------------------------------- | --------------------- |
| 1   | AnalyticsProvider | `sendEvent`                        | mount-once (memoised) |
| 2   | ConfigProvider    | tag record, ad dimensions          | fetch resolves once   |
| 3   | FeedProvider      | feed pages, scroll callbacks       | batch append          |
| 4   | AdProvider        | ad fill state, slot refs           | fill/no-fill callback |
| 5   | GenAIProvider     | overlay visibility, status machine | videoId change        |
| 6   | PlayerProvider    | player ref, playback state         | per-frame (internal)  |

---

## Multi-Instance Architecture

Multiple `.gen-ext` containers on a single page each get their own React tree in an
isolated Shadow DOM, but share page-level singletons:

- **`InstanceRegistry`** — tracks all live `instanceId` → root mappings.
- **`GlobalPlayerCoordinator`** — pause-all-then-play for mutual exclusion.
- **`GlobalMuteCoordinator`** — propagates mute state across instances.
- **`CxrEventBus`** / **`EventBusContext`** — cross-instance event dispatch without
  coupling to specific element refs.

Each `<App>` receives a unique `instanceId` from `boot.ts` at mount time.

---

## Ad Integration (GenAd SDK)

The GenAd SDK (`gen_ad.js`) is a self-contained waterfall orchestrator:
Aniview → Video/IMA → Banner/GAM → Native.

### Loading

CDN script is injected once by `ads/genAdSdk.ts` without an `id` attribute (prevents
auto-start). The `AdProvider` calls `loadGenAdSdk()` on mount.

### Slot init

```ts
// one call per ad ReelItem, cleaned up on unmount
const instanceId = window.GenAd.init({
  containerId: `gen-ad-${reelId}`, // must be unique per live slot
  brandId: tagDetails.customer_id,
  // ...provider configs, waterfall order, callbacks
});
return () => window.GenAd.destroy(instanceId);
```

### Waterfall callbacks → widget actions

| Callback             | Widget action                                                      |
| -------------------- | ------------------------------------------------------------------ |
| `onWaterfallSuccess` | emit `Ad Impression`, `postMessage({ type: 'adFillCallback' })`    |
| `onWaterfallFail`    | emit `Ad Request Failed`, `postMessage({ type: 'noAdsCallback' })` |

### External scripts loaded by the SDK (lazy, cached)

| Provider      | Script                                         | Approx gz |
| ------------- | ---------------------------------------------- | --------- |
| Aniview       | Aniview player bundle                          | ~80 KB    |
| Video/IMA     | `imasdk.googleapis.com/js/sdkloader/ima3.js`   | ~100 KB   |
| Banner/Native | `securepubads.g.doubleclick.net/tag/js/gpt.js` | ~80 KB    |

---

## Partner Contracts — Never Change Without Approval

- **Loader filename**: `gen_ext.min.js` — hardcoded in partner pages.
- **postMessage shape**: `{ type: 'adFillCallback' }` and `{ type: 'noAdsCallback' }`.
- **Event name strings**: all values in `src/analytics/eventNames.ts` — passed verbatim to
  Rudderstack and ad-team dashboards.
- **Window callbacks**: `window.adFillCallback()` and `window.noAdsCallback()`.
- **`window.offsitePropertiesConfig` merge**: deep-merge at analytics init — breaking
  changes affect partner overrides.

---

## TDD Workflow

This package enforces test-first development. CI rejects PRs where impl files lack a
paired test, or where impl predates the test commit.

1. Write `src/foo/bar.test.ts` — must fail (red).
2. Commit: `test(cxr): <module> spec`
3. Write `src/foo/bar.ts` — make it pass (green).
4. Commit: `feat(cxr): <module> impl`

```sh
pnpm tdd:pairing   # every impl must have a .test sibling
pnpm tdd:order     # test commit must predate impl commit in git history
```

---

## Key Invariants

- HLS loaded only when browser lacks native HLS support (`canPlayType`).
- Each `tagId` triggers at most one fill and one no-fill per page load.
- Ad slot interleave: strictly 1:1 — never two consecutive ads.
- `MutationObserver` currently watches `document` with `childList: true, subtree: true` —
  see [ADR 003](cxr-decisions/003-mutation-observer-scope.md) for the narrowing plan.
- `genai:videoId` dispatched via `CxrEventBus` — consumers must not couple to element refs.
- `GlobalPlayerCoordinator`: at most one video playing per page at any time.

---

## Performance

### Bundle targets

| Chunk              | Target gz    |
| ------------------ | ------------ |
| loader             | ≤ 1.5 KB     |
| core sync          | ≤ 35 KB      |
| feed               | ≤ 25 KB      |
| player             | ≤ 30 KB      |
| hls.js (lazy)      | ≤ 40 KB      |
| ads                | ≤ 8 KB       |
| genai              | ≤ 4 KB       |
| **total hot path** | **≤ 145 KB** |

Phase 0/1 measured baseline: ~409 KB gz (includes legacy React+framer-motion+swiper vendor).
Legacy estimate: ~206 KB gz (no chunking). Target is ≤ 145 KB once dropped deps land.

Dropped dependencies saving ~88 KB gz net:

- `framer-motion` → ~50 KB
- `swiper` → ~25 KB (replaced by CSS scroll-snap — see [ADR 001](cxr-decisions/001-drop-swiper.md))
- `react-device-detect` → ~5 KB
- `axios` → ~14 KB (replaced by native `fetch`)
- `uuid` → ~2 KB (replaced by `crypto.randomUUID`)

### CI performance gates (never regress)

| Gate                               | Threshold  |
| ---------------------------------- | ---------- |
| Loader gz                          | ≤ 1.5 KB   |
| TypeScript strict errors           | 0          |
| Test suite                         | 100% green |
| HLS cold-start to first frame (4G) | ≤ 500 ms   |

Measure after each build:

```sh
pnpm build
node scripts/track-bundle-size.mjs
```

Full historical data in [build-metrics/PERFORMANCE_MATRIX.md](build-metrics/PERFORMANCE_MATRIX.md).

---

## How-to Guides

### Add an analytics event

1. Add constant to `src/analytics/eventNames.ts` (SCREAMING_SNAKE_CASE key, preserve string value verbatim).
2. Emit via `useAnalytics().sendEvent(EVENT.YOUR_EVENT, payload)`.
3. Write a unit test asserting shape of emitted payload.
4. Flag PR for analytics-consumer review if string value is new (dashboard impact).

### Add an ad layout

1. Add variant to `src/config/adLayouts.ts` with `id`, `width`, `height`.
2. Add layout component `src/feed/layouts/YourLayout.tsx`.
3. Add `case` in `src/feed/ReelItem.tsx` layout switch.
4. Add visual regression test or Storybook story.

### Add a GenAd provider normalizer

1. Add `src/ads/normalizers/yourProvider.ts` — map provider response to `GenAdSlot`.
2. Add identifier to `GenAdInitOptions` in `src/ads/types.ts`.
3. Wire normalizer in `src/ads/useGenAdInstance.ts`.
4. Unit test: happy path, missing fields, null bid.
5. Integration test: `postMessage` fires for fill and no-fill.

---

## Module Size Budgets

| Module type            | Max lines |
| ---------------------- | --------- |
| Hook                   | 80        |
| Component              | 120       |
| Provider               | 150       |
| Service                | 60        |
| Transform / normalizer | 80        |

---

## What Not to Do

- No `console.log` — use `src/utils/logger.ts`.
- No `any` without a comment explaining why.
- No barrel files (`index.ts` re-exporting everything).
- Do not re-add `framer-motion` or `swiper` — see [ADR 001](cxr-decisions/001-drop-swiper.md).
- Do not add new `dependencies` without team approval (bundle budget is strict).
- Do not reuse a `containerId` across two live `GenAd.init()` calls.
- Do not edit `.github/` or `.claude/` — generated by `scripts/sync-ai-config.mjs`.

---

## Related

- [ADR 001 — Drop Swiper](cxr-decisions/001-drop-swiper.md)
- [ADR 003 — MutationObserver scope](cxr-decisions/003-mutation-observer-scope.md)
- [Bundle baseline & metrics](build-metrics/PERFORMANCE_MATRIX.md)
