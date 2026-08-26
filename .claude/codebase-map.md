# Codebase Map

> **Living, team-shared knowledge of this codebase.** Claude reads this _before_ searching broadly
> and appends durable findings _after_ learning something non-obvious — see the `codebase-memory`
> skill. Keep entries as concise pointers, not paragraphs. Fix or delete entries that go stale.
> This is for durable codebase knowledge — **not** session logs or task history.

## Orientation (start here)

- **Repo layout, conventions, guardrails** — [.claude/CLAUDE.md](CLAUDE.md).
- **React 19 / Next 15 / Tailwind v4 patterns, env vars, package specifics** — [.claude/docs/ai-context.md](docs/ai-context.md).
- **Atomic design placement** — atoms → `packages/ui`, molecules/organisms → `packages/components`,
  app & pages → `apps/webapp`. Shared packages feed **both** the webapp and the web-sdk, so a change
  there affects both delivery formats.

## Gotchas (findings that cost time)

- **`gencl:` Tailwind utilities silently no-op** until `packages/components` prebuilt CSS
  (`dist/index.css`) is rebuilt. Fix: `pnpm install` from repo root (runs `build:styles`) or run the
  `dev:styles` watcher.
- **Tailwind v4 renames** — `shadow-sm`→`shadow-xs`, `rounded`→`rounded-sm`, `outline-none`→
  `outline-hidden`, `ring`→`ring-3` (full list in `docs/ai-context.md`).
- **Bundle size is gated** — there's a chunk-size check in CI; large new client chunks can fail it.
- **CXR `@genuin/components` subpath imports fail `tsc` but work at runtime.** The package exports
  `"./*": "./src/*"` (no extension), which tsc's `Bundler` resolver won't extension-probe through an
  exports glob — so `import … from "@genuin/components/molecules/…"` errors TS2307 even though Vite
  resolves it fine. Fix in `packages/contextual-reels/tsconfig.json`: `paths` alias
  `"@genuin/components/*": ["../components/src/*"]`. (web-sdk dodges this — it's Vite-built, not
  tsc-checked.)
- **CXR coverage gate is strict + per-file** — `packages/contextual-reels/vitest.config.ts`
  `test.coverage.thresholds` enforces `perFile: true` global 85/75/85/85, with **100%** dirs
  (`src/utils/**`, `src/ads/**`, `src/player/**`, `src/services/**`, `src/analytics/**`,
  `src/config/**`) and 95/90/95/95 for `src/providers/**`. `pnpm test:coverage` fails on ANY file
  below its bar. Browser-only entrypoints (`index.jsx`, `loader.jsx`) + type-only files are in the
  coverage `exclude` list — extend it there for new untestable entrypoints, don't lower thresholds.
- **CXR audible autoplay on `localhost` is an environment artifact, not real behavior.** A unit
  playing with sound on load (no interaction) happens for any of three reasons: (1) an
  **automation/WebDriver browser** (the MCP/DevTools-controlled Chrome) reports `navigator.webdriver:
true` and forges `navigator.userActivation` = true on a fresh page, so it always permits audible
  autoplay — this is why a tool-driven page load has sound; (2) Chrome whitelists high-MEI origins
  (`chrome://media-engagement/` — `localhost:3010` sits above the 0.3 threshold from repeated dev
  loads); (3) the profile runs `Autoplay Policy: no-user-gesture-required`. Real first-time users
  have no MEI → unmuted-audible autoplay is blocked → the `NotAllowedError` path in
  `packages/contextual-reels/src/player/hlsPlayer.ts` (`tryPlay`) resets volume to 0 and retries
  muted. **Test autoplay in an incognito window** (no MEI) for production-realistic behavior. The
  `initialVolume: 0.2` for tag `6a2fefd87ce338c3a5afc605` in
  `packages/contextual-reels/src/strategies/strategyConfig.ts` only becomes audible-on-load where the
  browser already trusts the origin.

- **CXR `no-console` is enforced package-locally**, not repo-wide. `packages/eslint-config/base.js`
  (shared by every workspace) has NO `no-console` rule; only `next.js` (webapp) and the unused
  `library.js` do. So `console.log` in a shared package lints clean. CXR adds its own
  `packages/contextual-reels/eslint.config.mjs` that extends the root config and bans `console.log`
  (allows `console.debug/info/warn/error` for `src/utils/logger.ts`). A repo-wide ban is blocked by
  ~48 existing `console.log`s across `packages/{components,ui,utils,web-sdk}` — would break their CI;
  needs team approval to clean up + enable in `base.js`.
- **CXR `LightPlayer` renders `crossOrigin="true"`** (`src/player/LightPlayer.tsx:116`, cast
  `as any`). Non-standard but intentional/frozen ("preserved for compat"); the HTML enumerated attr
  maps any non-`use-credentials` value to `anonymous`, so it behaves as `crossOrigin="anonymous"`.
  Its test asserts only truthiness, not the literal. Don't "fix" to `"anonymous"` without team sign-off
  — it's deliberately preserved.

- **CXR has two event buses; `src/utils/eventBus.ts` is dead.** The live one is the per-instance
  `CxrEventBus` (`src/instance/coordination/CxrEventBus.ts`, consumed via `EventBusContext` +
  `useEventBus`). The older window-`CustomEvent`-based `src/utils/eventBus.ts` (`dispatchEvent`/
  `addEventListener` over `CxrEventMap`) has **no production import** — only its own test and
  `player/playerEvents.test.ts` reference it; not used cross-package either. Candidate for deletion
  (source + `utils/eventBus.test.ts`) but left in place pending team sign-off (removing it also drops
  it from the coverage set).

## Architecture notes

<!-- Append how non-obvious systems work, with file pointers. Example shape:
- **<system>** — <one-or-two-line explanation>. (path:line) -->

- **`RootPortal` renders `null` outside SDK mode** (`molecules/root-portal/root-portal.tsx`:
  `if (!isEmbed || !containerElement) return null`) — but its effects still paint
  `document.body` black/fixed when `useShadowDOM` is false. Don't use it from webapp-mode code;
  use `createPortal` (FeedView positions itself `fixed top-0` when expanded, `templates/feed/core.tsx`).
- **`packages/components` has NO unit-test vitest project** — `vitest.config.ts` only defines the
  storybook browser project, and `storybookTest` fails to load `.storybook/main.ts` under
  `vitest run` locally. Run plain `*.test.ts` files with an ad-hoc config (`vite-tsconfig-paths` +
  `environment: "jsdom"`). `lottie-web` (via `@genuin/ui`) touches canvas at import — stub
  `HTMLCanvasElement.prototype.getContext` in `vi.hoisted`.


- **CXR Triton in-app rewrite is gated on `appb` presence, NOT tag id.** `rewriteTritonUrlForApp`
  (`src/ads/adUrlMacros.ts`) rewrites a `tritondigital` ad URL to an in-app request (drop `site-url`,
  `dist`=bundle, append `bundle-id`/`store-id`/`store-url`) whenever host macro `appb` is present +
  `platform === "tritondigital"`. `appb` is the app-webview signal (only the host app supplies a
  bundle). No per-tag allowlist, no `tagId` threaded to `resolveVideoAdMacros`. Was previously gated
  on a hardcoded `TRITON_APP_PARAM_TAG_IDS` set — brittle, and standalone-ads reels (`AdLayout`)
  passed `tagDetails={{}}` so the gate never fired there. History: replaced the allowlist with the
  `appb` gate (removed `tagDetails` from `useGenAdInstance`/`GenAdSlot` entirely).

- **CXR strategy system** — per-tag feature toggles for the contextual-reels widget. Resolved by
  `resolveStrategies(tagId)` as a 3-layer cascade (most-specific wins): `DEFAULT_STRATEGIES` → preset
  bundle → tag inline keys. Edit behaviour in **one file**:
  `packages/contextual-reels/src/strategies/strategyConfig.ts` (`TAG_STRATEGIES` + `STRATEGY_PRESETS`).
  `<StrategyProvider tagId>` memoises the resolved object; `useStrategy()` reads it and degrades to
  `DEFAULT_STRATEGIES` (all-off) outside a provider — never throws. `tagId` is the **embed tag id**,
  not a feed reel `_id`. Toggles: `genAiEnabled`, `adBreakEnabled`, `gateOnUnmute`,
  `singleHitWaterfall`, `adsDisabled`, `mutePassback` + tunable `mutePassbackDelayMs` (default 5000),
  `servedStatically` (see below).
  Full reference: [packages/contextual-reels/docs/STRATEGIES.md](../packages/contextual-reels/docs/STRATEGIES.md).
- **CXR `servedStatically` tags** — a tag whose config + feed are served from committed per-tag JSON
  fixtures, skipping two network calls (`/ad_creative`, `/feed`) to cut ad-load latency. `/ip_info` is
  NOT skipped — geoip stays on analytics and supplies the real client IP for the ad-URL rewrite. Two
  pieces: the `servedStatically` strategy flag (attached via the `servedStatically` preset in
  `strategyConfig.ts`) + a per-tag data registry `STATIC_TAG_DATA` in
  `packages/contextual-reels/src/strategies/staticTagData.ts` keyed by tagId. Registry values are
  **lazy loader thunks** (`() => import()` the tag's two JSON fixtures in `src/providers/static-tag/`),
  so Vite emits one async chunk per tag and non-static tags load zero fixture bytes; `getStaticTagData`
  is async, `STATIC_TAG_IDS` is a sync fixture-free `Set`. Fixtures are stored as the full gateway
  envelope (`{code,message,data}`); the loader unwraps `.data`. Consumers (all no-op for normal tags):
  `useTagLoader` (skip `/ad_creative`), `FeedProvider` (skip `/feed`, mint fresh `crypto.randomUUID()`
  visit_id per load), `adUrlMacros`/`genAdSdk` (rewrite ad URL: real `ua`, real client `ip` from the
  shared geoip fetch; strip `ip` if unavailable). Every static path gates on the flag **AND**
  `STATIC_TAG_IDS.has(tagId)`, so a flagged-but-unregistered tag behaves like a normal tag (no
  half-static state). Any missing/failed fixture falls back to the real API. Full analytics parity
  (geoip included). Full reference:
  [STRATEGIES.md#statically-served-tags](../packages/contextual-reels/docs/STRATEGIES.md#statically-served-tags).
- **CXR host macros unresolved = host bug, not ours** — the host webview must substitute its own
  tilde-delimited macros (`~appb~`, `~loclat~`, `~appn~`, `~appv~`, `~loc~`) with real values BEFORE
  building the loader `<script src>`. The loader copies that query string verbatim into
  `window.__CXR_SCRIPT_PARAMS__` (`loader.jsx:41`); `parseHostMacros()` (`src/hostMacros.ts`) reads
  it. `isUnresolved()` (`src/hostMacros.ts`) drops **both** the curly `{appv}` and tilde `~appv~`
  forms, so a leaked template never flows into analytics/ad-URLs as a "real" value. Diagnostic:
  `buildHostParamsDiagnostic()` (`src/analytics/analytics.ts`) reads the RAW bag _before_ cleaning and
  stamps `host_script_params_raw` + `host_params_unresolved` onto the one-time `Tag Captured` event
  (`src/app/App.tsx:260`) — so it still reports leaked placeholders even though they're now dropped
  downstream. NOTE: `host_script_params_raw` logs host values verbatim (ifa/deviceid/geo/consent) —
  privacy sign-off + eventual removal expected.
- **CXR mutePassback timing** — the passback timer (`MutePassbackGuard`, `src/app/App.tsx`) arms on
  the **first `player:play`** bus event, NOT on mount — so it measures muted _playback_, not the
  tag/feed-load gap. One-shot: a later pause/resume won't restart or re-fire it.
- **CXR fill/passback logs are tag-agnostic** — `notifyAdFill`/`notifyAdNoFill`
  (`src/ads/waterfall.ts`) postMessage to the parent + call `window.adFillCallback`/`noAdsCallback`;
  no per-tag branch. Only id-driven gate is `singleHitWaterfall` (suppresses after first count). Their
  `_logger.debug` lines are no-ops in any `vite build` (`import.meta.env.PROD` is true for build, not
  just `--mode production`) and `console.*` is fully stripped in `build:prod`; only `pnpm dev` (vite
  serve) shows them, and only with DevTools console level set to **Verbose**.
- **CXR `AdProvider` is prop-less** (as of commit `ad1910f74`, 2026-07-17) — it takes only
  `{ children }` and reads `adLayout` from `useTagDetails()` (`TagDetailsProvider`), not
  from props. Old docs/audits referencing `tagId`/`tagHeight`/`tagWidth`/`adLayout` as
  `AdProvider` props are stale. `AdProvider` now also owns: **single-hit deferred
  passback** (`noFillSlotsRef`/`recordSingleHitNoFill`/`firePassbackIfExhausted` — fires
  `Ad Passback` only once every ad/`video-with-ad` slot has reported no-fill _and_ the
  feed reached its last entry, replacing the old immediate-fire-on-first-fail path for
  `singleHitWaterfall` tags) and **Infolinks Impression** (registers
  `fireInfolinksImpression` on `InstanceRegistry` per `instanceId`; driven by
  `window.cxr.infolinksImpression(instanceId?)` in `src/publicApi.ts`, which also exposes
  an iframe `postMessage({ type: 'cxr:infolinksImpression' })` bridge via
  `installMessageBridge`). `InstanceRegistry.register()` uses **merge semantics**
  (`{ ...existing, ...controls }`), not replace — multiple owners (`index.jsx`'s
  `destroy`, `AdProvider`'s `fireInfolinksImpression`) register their own slice of the
  same instance's controls without clobbering each other.

- **Embed-tile linkout/controls hidden under 200px tile width** — `embed-tile.tsx`
  (`packages/components/src/organisms/embed-tile/embed-tile.tsx:349-351,422`): the whole
  ControlLayer — linkout included — is skipped when `itemSize.width < 200`; the entire tile becomes
  clickable instead. Originally sponsored-only (`cardLayoutId === 7`, commit f1107d29c); extended to
  ALL videos (July 2026) so normal videos match sponsored behavior. Grid layout divides container
  width by columns (`grid-view/grid-layout.ts`, `GRID_GAP = 8`), so a 375px-wide 2-col grid gives
  ~179px tiles → no linkout in tiles. Linkout inside the tile also renders only on the **active**
  tile (`control-layer/embed/default-embed.tsx:85`).

## File pointers

<!-- Append where hard-to-find things live. Format:
- **<thing>** — <path:line> -->

- **CXR unit-test conventions** — the `contextual-reels` package does **NOT** use
  `@testing-library/react`. Tests render with raw React (`createRoot` + `act`), capture hook/context
  values via a `Consumer`/shim component into a module var, and import source through the `@cxr/*`
  alias. Shared mocks live in `packages/contextual-reels/tests/_mocks/` (hls, vlitejs, genAd, ima,
  rudderstack, axios, genAiSdk); `vi.mock` factories are hoisted so they `await import()` the mock.
  Global setup (`tests/_setup/vitest.setup.ts`) stubs `HTMLCanvasElement.getContext`. Copy an existing
  sibling `*.test.tsx` for the provider-tree setup rather than reinventing it.
- **CXR lazy boundaries use `<SafeSuspense>`** — an eslint rule (`no-restricted-syntax` in
  `packages/eslint-config/react-internal.js`) bans bare `<Suspense>`; use `SafeSuspense` from
  `@genuin/components/molecules/error/safe-suspense` (wraps Suspense in `AppErrorBoundary` so a failed
  lazy chunk shows a local fallback instead of unwinding to the embed root). Opt out only with a
  justified `// eslint-disable-next-line no-restricted-syntax`.
- **Dynamic-chunk failure handling (web-sdk)** — `AppErrorBoundary`
  (`packages/components/src/molecules/error/app-error-boundary.tsx`) catches failed `React.lazy`
  imports/render errors and shows a styled retryable card, scoping the failure to one embed. SDK lazy
  trees wrap in it: `EmbedRootMount`/`LazyEmbedRootSuspense` in `react-utils.tsx` (outer EmbedRoot
  chunk) and `EmbedContent` in `embed-root.tsx` (embed / standard-wall chunks). Retry works by
  recreating the lazy component via `useMemo(() => lazy(factory), [attempt])` — a plain remount reuses
  React.lazy's memoised rejected promise and never refetches. Toaster wraps in a silent
  `fallback={() => null}` boundary (non-critical chrome). GEN-9406.

---

> Single file on purpose. When it outgrows one screen, split into `.claude/memory/<topic>.md` + a
> `MEMORY.md` index (see the `codebase-memory` skill). Stays in-repo → shared with the team via git.
