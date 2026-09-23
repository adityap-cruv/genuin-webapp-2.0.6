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

| Dir              | Contents                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/`           | `App.tsx` (root), `FeedTree.tsx` (inner tree + `NativeFeedShim`), `useTagLoader`, `CloseButton`, `NoContent`, `FeedSkeleton`                                                                                 |
| `providers/`     | Analytics, TagDetails(+Gate), FullScreen, Strategy, GenAI, Player, Feed, Ad                                                                                                                                  |
| `feed/`          | `Feed`, `ReelItem`, `ReelSlidePlaceholder`, `useFeedNavigation`, `slideMountWindow`, `activeSlideState`, `feedTransforms`; `layouts/` (Video/Ad), `hooks/` (embla, swipeGate, inactivity, fullscreenAdBreak) |
| `player/`        | `LightPlayer`, `usePlayerLifecycle`, `playerEvents`, `hlsPlayer`, `VideoScrubber`                                                                                                                            |
| `ads/`           | `genAdSdk`, `GenAdSlot`, `waterfall`, `adConfig`, `adSlotProps`, `adUrlMacros`, `normalizers` — GenAd boundary                                                                                               |
| `controls/`      | Ad/Video control layers, top/bottom bars, `buttons/atoms/`                                                                                                                                                   |
| `strategies/`    | `strategies`, `strategyConfig` (edit flags here), `staticTagData` (per-tag statically-served fixtures registry), `debugDevices` (temporary per-device VAST feed), `StrategyProvider`, `useMutePassbackGuard` |
| `instance/`      | `InstanceContext`; `coordination/` (CxrEventBus, Global{Mute,Player}Coordinator, usePlayerCoordination, usePublicApiBridge); `registry/` (InstanceRegistry)                                                  |
| `genai/octo/`    | `OctoSheet`, `OctoSplitView`, `OctoSdkPanel`, `OctoCountdownStrip`, phase map, sheet config                                                                                                                  |
| `monitoring/`    | `resourceMonitor`, `useResourceMonitor`, `heavyAdReporter`, `useHeavyAdReporter` (HAI removal detection)                                                                                                     |
| `observability/` | `pixel-reporter` (px-script-error pixels)                                                                                                                                                                    |
| `analytics/`     | `analytics` (EVENT vocab), `rudderstack`, `rudderstackBuffer`                                                                                                                                                |
| `platform/`      | `device` (os_type incl. `chromium`), `topWindow`                                                                                                                                                             |
| `services/`      | `api` (getTag/apiFetch/handleResponse), `feed` (createFeedGenerator, visit_id)                                                                                                                               |
| `utils/`         | `logger`, `deepMerge`, `infolinks`, `share`, `safeHref`, `ads`, `eventBus` (legacy)                                                                                                                          |
| root             | `index.jsx` (core init), `loader.jsx` (CDN bootstrap), `publicApi` (`window.cxr`), `config`, `shadow-dom`, `hostMacros`, `userId`, `types`                                                                   |

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

- **`AD_LAYOUT.L1–L5`** (config.ts) drives most branching. L5=320×480 renders L1's full player. L3=320×50 audio-on-unmute ([ADR 006](docs/cxr-decisions/006-l3-audio-on-unmute.md)).
- **Volume is source of truth**: `isMuted = volume === 0` (PlayerProvider).
- **Two event systems**: per-instance `CxrEventBus` (internal) vs `window.cxr` (host-facing), bridged by `usePublicApiBridge`. `utils/eventBus.ts` is dead legacy.
- **HAI (Chrome Heavy Ad Intervention)**: HLS buffer caps + active-slide-only `startLoad` + ad-request gating exist to stay under 4MB/15s/60s. Don't loosen — [AD_REMOVAL_RISK_AUDIT.md](docs/AD_REMOVAL_RISK_AUDIT.md).
- **Feature flags live only in `strategies/strategyConfig.ts`** ([STRATEGIES.md](docs/STRATEGIES.md)).
- **`feedLoopEnabled` is the only strategy that defaults ON** (every other key defaults off/safe). The feed wraps last→first unless a tag sets `false` (or the `noLoop` preset), which makes the last slide a hard stop. `containScroll` must follow `loop` (`"trimSnaps"` when off) or the feed drags past the final slide; `useEmblaCarousel` resolves it once per mount so the Octo `enable`/`disable` `reInit` can't restore looping ([STRATEGIES.md](docs/STRATEGIES.md#finite-feeds-feedloopenabled)).
- **`servedStatically` tags** serve config + feed from lazy per-tag fixtures (`strategies/staticTagData.ts`, `providers/static-tag/*.json`) — skip `/ad_creative` + `/feed` (NOT `/ip_info` — geoip stays on analytics + supplies the real client IP), rewrite the ad URL client-side (real `ua`, real client `ip` from geoip; strip `ip` if unavailable), mint a fresh UUID `visit_id` per load, and fall back to the real API on any fixture miss. Consumers: `useTagLoader`, `FeedProvider`, `adUrlMacros`/`genAdSdk`. All gated on the flag **AND** `STATIC_TAG_IDS.has(tagId)` → normal + flagged-but-unregistered tags untouched. ([STRATEGIES.md](docs/STRATEGIES.md#statically-served-tags)).
- **Debug-device feeds** (TEMPORARY — remove with the audio investigation): two test handsets get a static VAST feed instead of the live exchange, gated on device id (`ifa`/`appidfa`/`appaid`/`deviceid`, case-insensitive) **AND** `DEBUG_FEED_TAG_IDS` (5 tags). Registry `strategies/debugDevices.ts` + fixtures `providers/debug-device/*.feed.json`; consumed only inside FeedProvider's existing `servedStatically` branch. Uses a `Map` (not object literal — `in` walks the prototype chain) and rejects the all-zero opted-out ad id. **Emits `forced_fill:true` on the audio beacon — every audibility rate query MUST exclude it** ([STRATEGIES.md](docs/STRATEGIES.md#debug-device-feeds-temporary-diagnostic)). `forced_fill` comes from `didServeDebugDeviceFeed` (was the feed _actually_ served?), never `isDebugDeviceFeed` (eligibility): a malformed fixture falls back to the real feed, and flagging that genuine fill would drop it from every rate query.
- **`GEOIP_DISABLED_TAG_IDS`** (TEMPORARY — server-load relief, `strategies/strategyConfig.ts`): the 12 Direct IO iHM/Infolinks Audio (Sep) tags skip the `/goservices/data/ip_info` fetch entirely. `getSharedGeoIp` is a per-page singleton, so BOTH call sites gate on `isGeoIpDisabled(tagId)`: `AnalyticsProvider` marks `geoip` **unavailable** (buffer still flushes — skipping without this wedges it forever, since `geoip` is a mandatory buffer key) and events carry no geoip block; `genAdSdk` leaves `clientIp` undefined so the ad-URL `ip=` is stripped. DMA/National targeting is unaffected — it rides explicit host macros (`m`/`country`/`r`/…), not geoip. This is the exception to the `servedStatically` "NOT `/ip_info`" note above. Delete the set + its two guards to restore.
- **Partner contracts** (never change w/o approval): loader name `gen_ext.min.js`; postMessage `adFillCallback`/`noAdsCallback`; `window.adFillCallback`/`noAdsCallback`; `EVENT` strings (analytics.ts); `offsitePropertiesConfig` deep-merge; `passback:1` (revenue-critical).
- **`os_type:'chromium'`** for Linux/ChromeOS Chrome is intentional ([ADR 002](docs/cxr-decisions/002-chromium-os-quirk.md)).
- Never reuse a `containerId` across live `GenAd.init()` calls; never call `window.GenAd` outside `src/ads/`.

## Testing

- **Catalogue + measured run times: [docs/TESTING.md](docs/TESTING.md)** — every category, what it covers, when to run it. **[Gate timings](docs/TESTING.md#gate-timings-measured-2026-08-15)** has the end-to-end cost of each gate: pre-push ≈ **3 min 30 s** total (CXR's lint + coverage is 32 s of it; the rest is the root typecheck + web-sdk/webapp production builds), the `e2e-cxr.yml` job ≈ **6–8 min**, and the manual commands (`test:e2e` 251 s, `budget:all` ~19 min, `fixtures:check` ~5 s,
  `lighthouse` ~3–4 min).
- Unit/component: **Vitest + jsdom**, colocated `*.test.ts(x)`. `pnpm test` (13–18 s, 2256 tests), `pnpm test:coverage` (23 s — the gate that actually runs in pre-push).
- **Per-file coverage** ([`vitest.config.ts`](vitest.config.ts)): global **90/80/100/90** (ratcheted 2026-08-15 from 85/75/85/85, which sat ~14 points under the measured 99.6/97.4/100 — set against the WEAKEST file on the gate, since `perFile: true`; `functions: 100` is what makes "a new source file with no test fails the gate" actually true); **100%** for `analytics/`, `ads/`, `services/`, `config/`, `player/`, `utils/`, `device/`; 95/90/95/95 for `providers/`. Excluded: `loader.jsx`, `index.jsx` — now genuinely E2E-covered by [`tests/e2e/publicApi.spec.ts`](tests/e2e/publicApi.spec.ts) (`window.cxr` shape, per-instance `ready`, DOM-id alias, the `cxr:*` bridge, multi-slot, node-removal teardown, `adFillCallback`), not just "the bundle responds 200" — plus `*.d.ts`, `types.ts`, `stories/`.
- E2E: **Playwright** against built `dist/` (`pnpm test:e2e`; needs `pnpm build` first). Mocks only the feed, runs real GenAd — [ADR 004](docs/cxr-decisions/004-e2e-real-genad.md) + its 2026-08-15 amendment. See [`tests/e2e/README.md`](tests/e2e/README.md). **65 tests in 7 specs** — one per ad layout (`l1.300x600` … `l5.320x480`), plus `publicApi` (the host-facing partner contract, asserted against the built bundle) and `init` (bundle smoke). Three projects: `chromium` 39, `mobile-chrome` (Pixel 5) the 18 tagged `@mobile`, and `webkit` (Desktop Safari) the 8 tagged `@routing` — layout resolution + bundle bootstrap, the cases that need no media or ad fill, which is the widget's only non-Chromium signal. Every `AD_LAYOUT` including `Unknown` and both stacked shapes is covered.
- **Strategy flags are E2E-drivable** via a localhost-gated seam, [`strategies/testOverrides.ts`](src/strategies/testOverrides.ts): a `cxr_strategies` URL patch layered as the LAST cascade step (`DEFAULT → preset → brand → tag → experiment → GIV → dashboard → TEST`). Use `mountWidget({ strategies: {...} })`. Gated on `isLocalhost()` — **not** `import.meta.env.DEV`, which folds to false in the `dist/` build E2E actually runs. Because it is last it beats the dashboard flag too, so it cannot express dashboard-vs-allowlist precedence (that is unit-covered). `getSuppressedEvents` is routed through it separately, since its consumer `AnalyticsProvider` sits ABOVE `StrategyProvider` by design.
- **E2E gotchas that look like product bugs**: never use `page.waitForFunction` (rAF polling stops being delivered once the widget mounts, so a false predicate hangs past its own timeout) — use `waitUntil`/`pollUntil` from [`tests/e2e/support/poll.ts`](tests/e2e/support/poll.ts). Never read `.gen-ext.shadowRoot` directly — use `window.__cxrRoot()` ([`support/shadow.ts`](tests/e2e/support/shadow.ts)), because the stacked variant moves the root onto the `stacked-top` row. `activeSlideIndex()` is an index among MOUNTED layouts (the mount window keeps ~2) — for the real feed position use `feedIndex()` / `data-cxr-active-index`. Analytics fields live under `properties.event_details`. `waitForAdBar()` only works on L3/L4; the full-player layouts need `waitForAdSlot()`. Always let `mountWidget` pin `experimentRoll` — an unseeded `TAG_EXPERIMENTS` roll is redrawn per test context and flips config on ~10% of runs. And the suite serves `dist/` on **3111** (moved off 3011 on 2026-08-14 — `pnpm dev` asks Vite for 3010 and drifts onto 3011, and `reuseExistingServer` then hands the suite the dev server instead of `dist/`); `CXR_E2E_PORT` overrides, and the `globalSetup` guard [`tests/e2e/support/assertDistServer.ts`](tests/e2e/support/assertDistServer.ts) fails in ~1 s on a hijacked port or missing `dist/` instead of 50 identical 15 s mount timeouts.
- **CI: E2E only, label-gated** ([`e2e-cxr.yml`](../../.github/workflows/e2e-cxr.yml), wired 2026-08-13) — runs all 65 on `workflow_dispatch` or a PR labelled **both** `run-e2e-all` and `pkg:contextual-reels` (`auto-label-pr.yml` adds the latter), at `--workers=2` (measured on the previous 41-test suite at ~192 s; 3 workers was measured and rejected then. Re-measure before changing it — the suite is now 65 tests and two raise their own timeout to 120 s to wait on a real ad completing). Installs Chromium **and WebKit**. **It is the only CI touching this package**, so everything else gates in **pre-push** ([`.husky/pre-push`](../../.husky/pre-push)): lint (`src/` + `tests/`) + `test:coverage`, ~25 s, `SKIP_CXR_CHECKS=1` bypasses. Typecheck comes from the root turbo step. `budget:all`, `fixtures:check` and `test:e2e` are **manual** — each needs a built `dist/` and/or hits the real QA exchange. Details + times: [docs/TESTING.md](docs/TESTING.md#where-each-check-runs).
- Resource budgets: `pnpm budget*` — [`ad-resource-budget/`](ad-resource-budget/). **Manual**: ~19 min for the 36-cell matrix, and every cell fires real QA ad requests. Run it when you touch the mount path, HLS buffering or ad gating.
- **Fixture drift**: `pnpm fixtures:check` ([`tests/e2e/fixtures/check-drift.mjs`](tests/e2e/fixtures/check-drift.mjs)) diffs the committed QA captures against live QA by SHAPE. Gates only on `LOAD_BEARING` keys the bundle actually reads; envelope changes print as notices, because the backend churns presentational fields and a permanently-red job gets ignored. **Manual** (~5 s, read-only). Exists because the captured feeds silently lacked `visit_id` — one of two keys the analytics buffer needs to flush — so E2E emitted zero analytics for months.
- **`pnpm lint` now covers `tests/` too** (was `eslint src/` only). The flat config declares Playwright + Node + DOM globals for `tests/**/*.ts` and bans `page.waitForTimeout` / `page.waitForFunction` via `no-restricted-syntax`, so the two gotchas that cost hours fail at lint instead of as a mystery hang.
- Convention: TDD (test → impl), a new source file with no test fails the coverage gate.
