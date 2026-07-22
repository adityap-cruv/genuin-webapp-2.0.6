# CLAUDE.md — Contextual Reels (CXR)

AI memory map for `@genuin/contextual-reels`. Compressed architecture + navigation. Full docs in
[`docs/`](docs/README.md) ([ARCHITECTURE](docs/ARCHITECTURE.md) · [DATA_FLOW](docs/DATA_FLOW.md) ·
[CONFIGURATION](docs/CONFIGURATION.md) · [CONTRIBUTING](docs/CONTRIBUTING.md) · [STRATEGIES](docs/STRATEGIES.md)
· [ADRs](docs/cxr-decisions/)). Repo-wide rules: root `.claude/CLAUDE.md`.

## What this is

Embeddable "contextual reels" ad/video widget. Ships as a CDN IIFE (`gen_ext.min.js`) that self-boots
into a React 19 tree inside a Shadow DOM per `.gen-ext` element. Plays reels (`hls.js/light` + `vlitejs`),
inserts GenAd ad slots, drives a GenAI "Octo" conversation panel, reports to Rudderstack + tracking pixels.
Vite build; **not** part of the Next.js webapp — standalone bundle.

- **Alias:** `@cxr/*` → `src/*`. **Tailwind prefixes:** `gencl:` (widget), `gai:` (GenAI SDK).
- **React 19, TS strict.** Raw `react-dom` in tests (no @testing-library). Vitest `globals:false`.

## Directory structure (`src/`)

| Dir | Contents |
| --- | --- |
| `app/` | `App.tsx` (root), `FeedTree.tsx` (inner tree + `NativeFeedShim`), `useTagLoader`, `CloseButton`, `NoContent`, `FeedSkeleton` |
| `providers/` | Analytics, TagDetails(+Gate), FullScreen, Strategy, GenAI, Player, Feed, Ad |
| `feed/` | `Feed`, `ReelItem`, `ReelSlidePlaceholder`, `useFeedNavigation`, `slideMountWindow`, `activeSlideState`, `feedTransforms`; `layouts/` (Video/Ad), `hooks/` (embla, swipeGate, inactivity, fullscreenAdBreak) |
| `player/` | `LightPlayer`, `usePlayerLifecycle`, `playerEvents`, `hlsPlayer`, `VideoScrubber` |
| `ads/` | `genAdSdk`, `GenAdSlot`, `waterfall`, `adConfig`, `adSlotProps`, `adUrlMacros`, `normalizers` — GenAd boundary |
| `controls/` | Ad/Video control layers, top/bottom bars, `buttons/atoms/` |
| `strategies/` | `strategies`, `strategyConfig` (edit flags here), `StrategyProvider`, `useMutePassbackGuard` |
| `instance/` | `InstanceContext`; `coordination/` (CxrEventBus, Global{Mute,Player}Coordinator, usePlayerCoordination, usePublicApiBridge); `registry/` (InstanceRegistry) |
| `genai/octo/` | `OctoSheet`, `OctoSplitView`, `OctoSdkPanel`, `OctoCountdownStrip`, phase map, sheet config |
| `monitoring/` | `resourceMonitor`, `useResourceMonitor`, `heavyAdReporter`, `useHeavyAdReporter` (HAI removal detection) |
| `observability/` | `pixel-reporter` (px-script-error pixels) |
| `analytics/` | `analytics` (EVENT vocab), `rudderstack`, `rudderstackBuffer` |
| `platform/` | `device` (os_type incl. `chromium`), `topWindow` |
| `services/` | `api` (getTag/apiFetch/handleResponse), `feed` (createFeedGenerator, visit_id) |
| `utils/` | `logger`, `deepMerge`, `infolinks`, `share`, `safeHref`, `ads`, `eventBus` (legacy) |
| root | `index.jsx` (core init), `loader.jsx` (CDN bootstrap), `publicApi` (`window.cxr`), `config`, `shadow-dom`, `hostMacros`, `userId`, `types` |

## Entry points

1. `loader.jsx` — CDN script; captures `<script src>` query → `window.__CXR_SCRIPT_PARAMS__`, injects CSS, `import()`s core.
2. `index.jsx` `init()` — scans `.gen-ext`, resolves tagId, Shadow DOM, `createRoot`, renders `<App>`, builds `window.cxr`.
3. `publicApi.ts` — `window.cxr`: `on/expand/collapse/infolinksImpression` + iframe postMessage bridge.

## Provider nesting

```
App:      Instance → Analytics → TagDetails → TagDetailsGate → FeedTree
FeedTree: FullScreen → Strategy → GenAI → Player → Feed → Ad → NativeFeedShim
```

## Data flow (one line each)

tagId (host macro ∨ `data-tag-id`) → `getTag` + strategy resolve → `createFeedGenerator` feed batch →
`normaliseFeed` → Embla mounts active/visible slides → `ReelItem` → Video/Ad layout by `AD_LAYOUT` →
`GenAdSlot` gates on unmute/play → `GenAd.init` → SDK callbacks → analytics + bus `ad:fill`/`nofill` →
no-fill → `firePassback`. All events buffer through `RudderstackEventBuffer` (stamped visit_id/geoip/passback).
Full detail: [DATA_FLOW.md](docs/DATA_FLOW.md).

## Load-bearing facts (don't break)

- **`AD_LAYOUT.L1/L2/L3/L4`** (config.ts) drives most branching. L3=320×50 audio-on-unmute ([ADR 006](docs/cxr-decisions/006-l3-audio-on-unmute.md)).
- **Volume is source of truth**: `isMuted = volume === 0` (PlayerProvider).
- **Two event systems**: per-instance `CxrEventBus` (internal) vs `window.cxr` (host-facing), bridged by `usePublicApiBridge`. `utils/eventBus.ts` is dead legacy.
- **HAI (Chrome Heavy Ad Intervention)**: HLS buffer caps + active-slide-only `startLoad` + ad-request gating exist to stay under 4MB/15s/60s. Don't loosen — [AD_REMOVAL_RISK_AUDIT.md](docs/AD_REMOVAL_RISK_AUDIT.md).
- **Feature flags live only in `strategies/strategyConfig.ts`** ([STRATEGIES.md](docs/STRATEGIES.md)).
- **Partner contracts** (never change w/o approval): loader name `gen_ext.min.js`; postMessage `adFillCallback`/`noAdsCallback`; `window.adFillCallback`/`noAdsCallback`; `EVENT` strings (analytics.ts); `offsitePropertiesConfig` deep-merge; `passback:1` (revenue-critical).
- **`os_type:'chromium'`** for Linux/ChromeOS Chrome is intentional ([ADR 002](docs/cxr-decisions/002-chromium-os-quirk.md)).
- Never reuse a `containerId` across live `GenAd.init()` calls; never call `window.GenAd` outside `src/ads/`.

## Testing

- Unit/component: **Vitest + jsdom**, colocated `*.test.ts(x)`. `pnpm test`, `pnpm test:coverage`.
- **Per-file coverage** ([`vitest.config.ts`](vitest.config.ts)): global 85/75/85/85; **100%** for `analytics/`, `ads/`, `services/`, `config/`, `player/`, `utils/`, `device/`; 95/90/95/95 for `providers/`. Excluded: `loader.jsx`, `index.jsx` (E2E-covered), `*.d.ts`, `types.ts`, `stories/`.
- E2E: **Playwright** against built `dist/` (`pnpm test:e2e`; needs `pnpm build` first). Mocks only the feed, runs real GenAd — [ADR 004](docs/cxr-decisions/004-e2e-real-genad.md). See [`tests/e2e/README.md`](tests/e2e/README.md).
- Resource budgets: `pnpm budget*` — [`ad-resource-budget/`](ad-resource-budget/).
- Convention: TDD (test → impl), a new source file with no test fails the coverage gate.
