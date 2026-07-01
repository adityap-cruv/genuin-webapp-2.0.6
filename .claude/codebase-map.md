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

## Architecture notes

<!-- Append how non-obvious systems work, with file pointers. Example shape:
- **<system>** — <one-or-two-line explanation>. (path:line) -->

- **CXR strategy system** — per-tag feature toggles for the contextual-reels widget. Resolved by
  `resolveStrategies(tagId)` as a 3-layer cascade (most-specific wins): `DEFAULT_STRATEGIES` → preset
  bundle → tag inline keys. Edit behaviour in **one file**:
  `packages/contextual-reels/src/strategies/strategyConfig.ts` (`TAG_STRATEGIES` + `STRATEGY_PRESETS`).
  `<StrategyProvider tagId>` memoises the resolved object; `useStrategy()` reads it and degrades to
  `DEFAULT_STRATEGIES` (all-off) outside a provider — never throws. `tagId` is the **embed tag id**,
  not a feed reel `_id`. Toggles: `genAiEnabled`, `adBreakEnabled`, `gateOnUnmute`,
  `singleHitWaterfall`, `adsDisabled`, `mutePassback` + tunable `mutePassbackDelayMs` (default 3000).
  Full reference: [packages/contextual-reels/docs/STRATEGIES.md](../packages/contextual-reels/docs/STRATEGIES.md).
- **CXR mutePassback timing** — the passback timer (`MutePassbackGuard`, `src/app/App.tsx`) arms on
  the **first `player:play`** bus event, NOT on mount — so it measures muted *playback*, not the
  tag/feed-load gap. One-shot: a later pause/resume won't restart or re-fire it.
- **CXR fill/passback logs are tag-agnostic** — `notifyAdFill`/`notifyAdNoFill`
  (`src/ads/waterfall.ts`) postMessage to the parent + call `window.adFillCallback`/`noAdsCallback`;
  no per-tag branch. Only id-driven gate is `singleHitWaterfall` (suppresses after first count). Their
  `_logger.debug` lines are no-ops in any `vite build` (`import.meta.env.PROD` is true for build, not
  just `--mode production`) and `console.*` is fully stripped in `build:prod`; only `pnpm dev` (vite
  serve) shows them, and only with DevTools console level set to **Verbose**.

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
