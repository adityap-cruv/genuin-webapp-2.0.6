# Contributing & Conventions

Working rules for the `@genuin/contextual-reels` package: TDD workflow, coverage gates, load-bearing
invariants, the partner contracts you must never break, and how-to guides. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the map and the root [`CLAUDE.md`](../CLAUDE.md) for the compressed version.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server (`predev` validates env) |
| `pnpm build` / `build:qa` / `build:prod` | Vite build per mode |
| `pnpm test` | Vitest (jsdom), single run |
| `pnpm test:watch` | Vitest watch |
| `pnpm test:coverage` | Vitest + v8 coverage, per-file thresholds |
| `pnpm test:e2e` | Playwright E2E (needs a built `dist/` first) |
| `pnpm typecheck` | `tsc --noEmit` (strict, 0 errors) |
| `pnpm lint` / `format` | ESLint (`src/`) / Prettier |
| `pnpm budget[:throttled\|:build\|:all]` | Run the HAI/IAB resource-budget harness ([`../ad-resource-budget/`](../ad-resource-budget/)) |

## TDD workflow

Test-first. Every source file is colocated with a `.test` sibling, enforced by the per-file coverage
thresholds in [`../vitest.config.ts`](../vitest.config.ts) — a new source file with no test fails the gate.

1. Write `src/foo/bar.test.ts` — must fail (red).
2. Write `src/foo/bar.ts` — make it pass (green).

**Test conventions:** raw React + `react-dom` (`createRoot` / `act`) — this repo does **not** use
`@testing-library/react`. Vitest runs with `globals:false`, so import `{ describe, it, expect, vi }`
from `vitest`. Use the `@cxr/*` alias. Reuse the mock helpers already in the neighbouring test file.

**Coverage thresholds** (per-file, from `vitest.config.ts`): global 85/75/85/85 (lines/branches/functions/
statements); **100%** for `src/analytics/**`, `src/ads/**`, `src/services/**`, `src/config/**`,
`src/player/**`, `src/utils/**`, `src/device/**`; 95/90/95/95 for `src/providers/**`. Excluded from
coverage: `loader.jsx`, `index.jsx` (browser-only bootstrap; covered by E2E), `types.ts`, `*.d.ts`,
`stories/**`.

## Key invariants

- **Volume is the single source of truth** (`isMuted = volume === 0`) in `PlayerProvider`.
- HLS is loaded lazily; only the **active** slide `startLoad(-1)`s, and buffers are hard-capped — for
  Chrome Heavy Ad Intervention headroom. Do not loosen without reading [AD_REMOVAL_RISK_AUDIT.md](AD_REMOVAL_RISK_AUDIT.md).
- Each `tagId` triggers at most one fill and one no-fill per page load.
- `MutationObserver` watches `document` with `childList + subtree` — see [ADR 003](cxr-decisions/003-mutation-observer-scope.md).
- `GlobalPlayerCoordinator`: at most one video playing per page. `GlobalMuteCoordinator`: at most one unmuted.
- Do not reuse a `containerId` across two live `GenAd.init()` calls (`gen-ad-slot-${instanceId}-${id}` keeps them unique).
- The `os_type: 'chromium'` value for Linux/ChromeOS Chrome is intentional — [ADR 002](cxr-decisions/002-chromium-os-quirk.md).

## Partner contracts — never change without team approval

These cross a trust/integration boundary; a change silently breaks live partner pages or ad-team dashboards.

- **Loader filename**: `gen_ext.min.js` — hardcoded in partner pages.
- **postMessage shapes**: `{ type: 'adFillCallback' }` and `{ type: 'noAdsCallback' }`; inbound
  `{ type: 'cxr:infolinksImpression', instanceId? }`.
- **Window callbacks**: `window.adFillCallback()` and `window.noAdsCallback()`.
- **Event-name strings**: every value in the `EVENT` const ([`src/analytics/analytics.ts`](../src/analytics/analytics.ts))
  is sent verbatim to Rudderstack — new strings need analytics-consumer review.
- **`window.offsitePropertiesConfig`**: deep-merged at analytics dispatch — breaking its shape affects partner overrides.
- **`passback: 1`** (`setAdPassback`): revenue-critical, flagged DO-NOT-REMOVE.

## How-to guides

### Add an analytics event

1. Add a constant to the `EVENT` const in [`src/analytics/analytics.ts`](../src/analytics/analytics.ts)
   (SCREAMING_SNAKE_CASE key; preserve the string value verbatim).
2. Emit via `useAnalytics().sendEvent(EVENT.YOUR_EVENT, payload)`.
3. Unit-test the emitted payload shape.
4. Flag the PR for analytics-consumer review if the string value is new (dashboard impact).

### Add an ad layout

1. Add a variant to `adLayoutVariants` (and the `AD_LAYOUT` map) in [`src/config.ts`](../src/config.ts) with `id`, `width`, `height`.
2. Add the render branch in [`src/feed/layouts/VideoLayout.tsx`](../src/feed/layouts/VideoLayout.tsx) (`renderL*`).
3. Add/extend the `case` in [`src/feed/ReelItem.tsx`](../src/feed/ReelItem.tsx) if routing changes.
4. Add a Storybook story / visual check.

### Add a GenAd provider normalizer

1. Add a normalizer in [`src/ads/normalizers.ts`](../src/ads/normalizers.ts) mapping the provider's response to the internal shape.
2. Add any `GenAdInitOptions` fields the provider needs.
3. Wire it into [`src/ads/adConfig.ts`](../src/ads/adConfig.ts) / `genAdSlotAdProps`.
4. Unit-test happy path, missing fields, null bid; assert `postMessage` fires for fill and no-fill.

## Module size budgets

| Module type | Max lines |
| --- | --- |
| Hook | 80 |
| Component | 120 |
| Provider | 150 |
| Service | 60 |
| Transform / normalizer | 80 |

## Bundle targets (gz)

| Chunk | Target |
| --- | --- |
| loader | ≤ 1.5 KB |
| core sync | ≤ 35 KB |
| feed | ≤ 25 KB |
| player | ≤ 30 KB |
| hls.js (lazy) | ≤ 40 KB |
| ads | ≤ 8 KB |
| genai | ≤ 4 KB |
| **total hot path** | **≤ 145 KB** |

Dropped dependencies (net ~88 KB gz saving): `framer-motion` (~50), `swiper` (~25, → Embla — [ADR 001](cxr-decisions/001-drop-swiper.md)),
`react-device-detect` (~5), `axios` (~14, → native `fetch`), `uuid` (~2, → `crypto.randomUUID`).

## What not to do

- No `console.log` — use [`src/utils/logger.ts`](../src/utils/logger.ts).
- No `any` without a justifying comment.
- No barrel files (`index.ts` re-exporting everything).
- Do not re-add `framer-motion` or `swiper`; no new `dependencies` without approval (bundle budget is strict).
- Do not reuse a `containerId` across two live `GenAd.init()` calls.
- Do not call `window.GenAd` outside `src/ads/`.
