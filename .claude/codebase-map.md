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
