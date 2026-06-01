# MSW Mocking Architecture

## Request flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Test starts: pnpm test                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ globalSetup (tests/global-setup.ts)                             │
│   1. esbuild bundles browser.ts → test-dist/msw-boot.js (IIFE)  │
│   2. Writes index-test.html (loads MSW boot, defers SDK script) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Per test (mswPage fixture):                                     │
│   page.goto('/index-test.html')                                 │
│     ↓                                                           │
│   <script src="test-dist/msw-boot.js">  ← blocking, sync        │
│     ↓                                                           │
│   setupWorker(...handlers).start()                              │
│     ↓                                                           │
│   Service Worker active → window.__MSW_READY__ = true           │
│     ↓ (load event)                                              │
│   Inject <script src="dist/gen_sdk.js"> dynamically             │
│     ↓ (script.onload)                                           │
│   Re-dispatch DOMContentLoaded ← fixes legacy onGenuinReady     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ SDK runs init()                                                 │
│   GET  /goservices/brand/details?api_key=…                      │
│     ↳ handlers/brand.ts ─→ data/shared/brand-details.json       │
│   GET  /goservices/embed?id=…       (embed_id layouts)          │
│     ↳ handlers/embed.ts ─→ data/embed/{layout}/config.json      │
│   GET  /goservices/placement?placement_id=…  (placement_id)     │
│     ↳ handlers/placement.ts ─→ data/placement/{layout}/config.json │
│   POST /goservices/feed/v1/home                                 │
│     ↳ handlers/feed.ts ─→ data/{embed,placement}/{layout}/home.json │
│   GET  /goservices/feed/video       (if start_video_slug)       │
│     ↳ handlers/video.ts ─→ data/shared/feed-video.json          │
│   GET  /api/v3/comments             (on comments open)          │
│     ↳ handlers/comments.ts ─→ data/shared/comments.json         │
│   GET  media.begenuin.com/...                                   │
│     ↳ handlers/media.ts ─→ placeholder PNG/SVG/GIF/m3u8         │
│                                                                 │
│   Every handler pipes JSON through sanitize() before returning. │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Screenshot diff against snapshots/                              │
└─────────────────────────────────────────────────────────────────┘
```

## Folder layout

Each layout owns one folder containing two raw API captures:

```
data/
├── image-placeholders.ts        ← shared base64 PNG/SVG/GIF/HLS constants
├── shared/                      ← responses identical across layouts
│   ├── brand-details.json       ← GET /brand/details
│   ├── comments.json            ← GET /api/v3/comments
│   └── feed-video.json          ← GET /feed/video
├── embed/                       ← embed_id-initialised layouts (3)
│   ├── carousel/
│   │   ├── config.json          ← GET /embed?id=…
│   │   └── home.json            ← POST /feed/v1/home
│   ├── ted/
│   │   ├── config.json
│   │   └── home.json
│   └── floating/
│       ├── config.json
│       └── home.json
└── placement/                   ← placement_id-initialised layouts (4)
    ├── feed/
    │   ├── config.json          ← GET /placement?placement_id=…
    │   └── home.json            ← POST /feed/v1/home
    ├── grid/
    │   ├── config.json
    │   └── home.json
    ├── iheart/
    │   ├── config.json
    │   └── home.json
    └── iheartPlacement/
        ├── config.json
        └── home.json
```

`config.json` = SDK init response (dimensions, customisation, layout style).
`home.json` = feed items response (videos, owners, communities).

## Files at a glance

| File | One-line purpose |
| --- | --- |
| `browser.ts` | Composes all handler arrays into the MSW worker. |
| `sanitize.ts` | Walks any response, fills empty fields with defaults, promotes relative media URLs to absolute. Idempotent. |
| `handlers/feed.ts` | `POST /feed/v1/home` — dispatches by `placement_id` or `embed_id`. |
| `handlers/brand.ts` | `GET /brand/details` — dispatches by `api_key`, injects per-brand `card_layout_id`. |
| `handlers/embed.ts` | `GET /embed` — dispatches by `id`; forces `customization.autoplay = false`. |
| `handlers/placement.ts` | `GET /placement` — dispatches by `placement_id`. |
| `handlers/video.ts` | `GET /feed/video` — single response, slug ignored. |
| `handlers/comments.ts` | `GET /api/v3/comments` — single response. |
| `handlers/media.ts` | `media.begenuin.com/*` — placeholder bytes for image/HLS, real CDN for profile_images + thumbnails. |
| `../global-setup.ts` | Bundles MSW boot, writes index-test.html. |
| `../fixtures/msw.fixture.ts` | Playwright fixture gating on `__MSW_READY__`. |
| `../helpers/sdk-wait.helper.ts` | `pinThumbnailPosters` copies `<img>` thumbnail URLs onto `<video>.poster` so snapshots show stills when autoplay is off. |

## Non-obvious decisions

### 1. Why `card_layout_id` lives in brand.ts, not embed.ts

SDK's `getBrandType()` maps `card_layout_id` → which component renders the tile (TedEmbed vs IHeartControlLayer vs DefaultEmbed). The embed response does NOT include `card_layout_id` — the SDK falls back to `brandDetails.card_layout_id` (see `genuin-sdk.ts:730`). So **the brand handler is what picks the layout**, not the embed handler. TED=3, iHeart=2, default=1.

### 2. Why we re-dispatch DOMContentLoaded after SDK loads

SDK's loader.js registers a `DOMContentLoaded` listener for the legacy `onGenuinReady` callback. Our deferred SDK loading means that event has already fired by the time the SDK script runs → the listener never fires → legacy tests break. We dispatch a fresh `DOMContentLoaded` event after `sdk.onload` so the listener can pick it up.

### 3. Why `attributes.image_url` is a static URL, not a data URI

SDK appends `?ops=fit(64,64)` (iHeart resize syntax) to `attributes.image_url`. With a data URI value, this becomes `data:image/png;base64,xxx?ops=fit(64,64)` — invalid base64. Workaround: serve a static PNG from the dev server at `/test-assets/iheart-artwork.png`. The query string is harmlessly ignored.

### 4. Why each layout has its own fixture file

Real API returns different shapes per layout: iHeart has `attributes` blocks with podcast metadata, carousel/embed_floating have 7 linkouts blocks vs 8 for others. A single shared fixture would break the layouts whose real shape has unique fields.

### 5. Why `sanitize()` runs at request time, not on fixture file

Devs paste raw real API responses straight into the JSON files. The sanitizer scrubs at request time so no manual editing is required. Sanitizer is idempotent — re-sanitized data is identical.

### 6. Why `pinThumbnailPosters` exists

SDK renders thumbnails as `<img>` overlays above paused `<video>` tiles and removes them once the HLS source loads — expecting autoplay to start painting frames. Our tests force `autoplay = false`, so removal leaves bare black `<video>` tiles. The helper walks the shadow DOM, copies the thumbnail URL onto each `<video>.poster`, and preloads it. Snapshot then shows the still.

### 7. Why `media_url_m3u8` is promoted to absolute URL

Real API responses paste `media_url_m3u8` as a relative path (`temp_video/m3u8s/...`). SDK does `new URL(path)` on it — throws `Invalid URL` for relative input → React error recovery loop → poster fetches restart and race the screenshot. `sanitize.ts` prepends `https://media.begenuin.com/` to relative media URLs.

### 8. Which CDN URLs are mocked vs. real

`handlers/media.ts` intercepts requests to `media.begenuin.com` and returns placeholder bytes. Two upload paths are intentionally left unmocked so snapshots show real artwork.

| URL pattern | What MSW returns | Why |
| --- | --- | --- |
| `media.begenuin.com/webapp_assets/reactions/*` | Gold star SVG (`SPARK_ICON_SVG`) | Reaction icons — placeholder is recognisable in snapshots |
| `media.begenuin.com/webapp_assets/avatar/*` | 1×1 transparent GIF | System avatar — not visually meaningful |
| `media.begenuin.com/webapp_assets/*` | 1×1 transparent PNG | Generic UI chrome — not visually meaningful |
| `media.begenuin.com/temp_video/m3u8s/*` | Empty HLS playlist | Signals end-of-stream; player stops cleanly without errors |
| `cdn.begenuin.com/uploads/profile_images/*` | **Real CDN image** | Community avatars — real artwork makes layouts verifiable |
| `cdn.begenuin.com/uploads/thumbnails/*` | **Real CDN image** | Video posters — real frames make snapshots meaningful |

Note: even when a fixture JSON contains a real CDN URL (e.g. `profile_image: "https://cdn.begenuin.com/..."`), the URL passes through to the browser unchanged. MSW only intercepts the matching patterns above — anything outside those patterns hits the real network.

## Adding things

**New mocked endpoint:**
1. Capture real response → `data/shared/<name>.json` (or `data/{embed,placement}/<layout>/<name>.json` if layout-specific)
2. Copy `handlers/comments.ts`, change URL + import → `handlers/<name>.ts`
3. Add to `setupWorker(...)` in `browser.ts`

**New layout:**
1. `mkdir data/{embed|placement}/<layout>/`
2. Capture `/embed` or `/placement` response → `config.json` in that folder
3. Capture `/feed/v1/home` response → `home.json` in that folder
4. Add the layout's `embed_id`/`placement_id` to `tests/data/init.ts`
5. Add lookup entry in the matching handler's dispatch table

**New scrubbed field:**
1. Add field name to the right set in `sanitize.ts` (`PNG_FALLBACK_KEYS` / `PII_FALLBACK_KEYS` / `TEXT_FALLBACKS` etc.)

**Never add to the sanitizer:** `card_layout_id`, `video_layout_id`, customisation booleans, `style`, `embed_layout`, `type`, `brand_id`. These drive SDK behaviour and must reach the SDK exactly as the backend sent them.
