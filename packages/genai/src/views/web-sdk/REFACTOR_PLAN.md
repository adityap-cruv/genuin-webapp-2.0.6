# Web-SDK View Refactor Plan

> Status: **planned, not executed.** Behavior-preserving restructure of the `web-sdk` view to
> standard, *meaningfully* componentised code with clean naming, a proper style structure, and
> de-cluttered density logic. Execute phase by phase, `pnpm -F @genuin/genai-sdk typecheck`
> after each.

## Goal & locked decisions

Restructure `packages/genai/src/views/web-sdk/`. **Zero functionality change** — same DOM/
classes, same events, same auto-prompt / density / render-mode behavior.

- **Variant split** the 522-line `CustomInput` 4-way ternary into a clean discriminated-union
  `switch` — **rendered inline in one file**, not 6 micro-files (see "Granularity" below).
- **Fix the style structure** — lift static className blobs into named consts; stop inlining
  huge class strings in JSX.
- **De-clutter density** — one `DENSITY` config + one lookup per component; remove the 11
  scattered `Record<>` maps and the repeated `uiDensity === 'xs' …` ternaries.
- **Standardize names** `WebSDK*` → `WebSdk*`, `CustomInput` → `PromptComposer`, fix vague IDs.
- **Drop dead code**: `AgentChips.tsx` + `.stories.tsx` (zero importers), unused `index.ts`
  named exports.

## Granularity principle (DX over fragmentation)

Too much separation hurts readability as much as a god-component. Rule for this refactor:
**a file = a meaningful unit a developer would open on its own.** The 4 composer "states" are
*not* meaningful standalone components — they're branches of one input bar that share refs,
focus, density, and handlers. Keep them as a `switch` (+ small local helpers) **inside
`PromptComposer`**, not as separate files. Same for the scroll-area visuals — group them in one
`ScrollContent`, not four tiny files.

## Safety finding (renames are free)

`web-sdk` view is **100% internal** — `index.ts`'s `AgentChips`/`CustomInput`/`WebSDKContent`/
`WebSDKInput` re-exports have **no importer anywhere** (`grep` across `packages` + `apps` =
empty). genai's public entry exports only `init`/`destroy`/`setWebSdkRenderMode`;
`packages/web-sdk` consumes the built dist, not source. Renames/moves safe with internal-import
+ `index.ts` updates.

## Invariants — MUST preserve

- `index.ts` **default export** `ViewModule { name:'web-sdk', Shell, mountStrategy:
  {kind:'inline-container'} }` (loaded by `views/registry.ts`).
- Events unchanged: `WEB_SDK_STATE_CHANGE`/`_SESSION_CHANGE`/`_CANCEL_CYCLE`/`_RENDER_MODE`,
  `OCTO_LIFECYCLE`. `window.GenAISDK` untouched.
- **Exact rendered classes per branch** for every `uiDensity`×`renderMode`×auto-prompt×loading
  combo. The density config + named consts must concatenate to the *same* strings as today.
- `CustomInput` state precedence reproduced exactly: countdown-only → full-prompt → suggested →
  editable.
- `useAutoPromptCycle` integration + `WebSDKContent` derived booleans unchanged.

## Target structure (flat, ~8 meaningful files)

```
src/views/web-sdk/
├── index.ts                     REWRITE  ViewModule only; drop dead exports
├── WebSdkView.tsx               (was WebSDKView) Shell → WebSdkContent
├── WebSdkContent.tsx            (was WebSDKContent) orchestrator: hooks + layout + input assembly
├── ScrollContent.tsx            NEW  chat/loader/dummy/empty switch + skeletons + countdown badge
│                                     (the L21–161 sub-components, grouped — local helpers, 1 file)
├── PromptComposer.tsx           (was CustomInput) input bar: density lookup + state switch +
│                                     local SendButton helper (4 dup'd buttons → 1)
├── WebSdkInput.tsx              (was WebSDKInput) composer + preset dropdown wrapper
├── WebSdkPresetPrompts.tsx      (was WebSDKPresetPrompts) body unchanged
├── density.ts                   NEW  Density type + single DENSITY config (one lookup)
└── hooks/
    ├── useWebSdkBridge.ts                unchanged
    ├── useOctoBridge.ts                  unchanged
    ├── useInitialAgentSelection.ts       (renamed from useWebSdkAgentInit)
    └── useCachedResponsePlayer.ts        unchanged
```

No `composer/` or `components/` sub-folders — flat reads better at this size.

## Naming map

| Old | New |
| --- | --- |
| `WebSDKView` / `WebSDKContent` / `WebSDKInput` / `WebSDKPresetPrompts` | `WebSdk…` |
| `CustomInput` | `PromptComposer` |
| `CompactPromptSuggested` | (local `SuggestedState` render inside PromptComposer) |
| `useWebSdkAgentInit` | `useInitialAgentSelection` |
| `handleChromeClick` / "chrome" | `handleInputPillClick` / "inputPill" |
| `handleActivate` + prop `onActivate` | `handleExpandToFull` + prop `onExpandToFull` |
| `handleCompactInputActivate` | `handleExpandToFull` |
| `isCycleCountingDown` | `isAutoPromptCounting` |

Prop `type` aliases → `interface`; replace inline `'xs'|'sm'|'base'` with `Density`.

## density.ts — single config, one lookup (Phase 1)

Collapse the 11 scattered maps into ONE keyed config so each component does **one** lookup and
reads named slots — no per-token maps, no inline `uiDensity === …` size ternaries.

```ts
export type Density = 'xs' | 'sm' | 'base';

interface DensitySlots {
  // composer
  avatar: string; inputMinHeight: string; inputText: string; button: string;
  // scroll content
  countdownCircle: string; countdownText: string;
  skeletonWrap: string; skeletonBubble: string; skeletonPadding: string;
  bubblePadding: string; bubbleText: string;
}

export const DENSITY: Record<Density, DensitySlots> = {
  base: { avatar: 'gai:h-11 gai:w-11', inputMinHeight: 'gai:min-h-[44px]', /* …existing base values… */ },
  sm:   { /* …existing sm values… */ },
  xs:   { /* …existing xs values… */ },
};
```

Usage: `const d = DENSITY[uiDensity];` then `d.avatar`, `d.inputText`, etc. — replaces
`AVATAR_SIZE[uiDensity]` & friends verbatim (same strings → same output).

**Structural (non-size) density branches** — the genuine layout differences (xs/sm single-line
textarea vs base multi-line; xs padding) are NOT size tokens; keep them as **named class consts**
gated by a single boolean, instead of repeating `uiDensity === 'xs' || uiDensity === 'sm'`:
```ts
const isTinyDensity = uiDensity !== 'base';   // xs | sm
const isXs = uiDensity === 'xs';
```
Define the two textarea variants (`TEXTAREA_TINY`, `TEXTAREA_STD`) and the row-padding variants
as consts at the top of `PromptComposer`; pick by `isTinyDensity`. One boolean, one place.

## Style structure (applies in every file)

- Hoist long static class strings to `const` at module top (e.g. `INPUT_CONTAINER_BASE`,
  `TEXTAREA_TINY`, `TEXTAREA_STD`, `SUGGEST_CARD`) — JSX then reads `className={cn(BASE, d.x, …)}`
  instead of 8-line inline blobs. (`WebSDKPresetPrompts` already does this with
  `containerClasses`/`itemClasses` — follow that pattern everywhere.)
- Dynamic parts stay in `cn(...)`; only the static skeleton lives in the const.

## Composer (Phase 2 — REWRITE, was CustomInput)

> Superseded: the input is no longer a behavior-preserving variant-split — it's a **design-driven
> rewrite** scoped to web-sdk. Full component design (state model, atom APIs, structure, wiring)
> lives in **[COMPOSER_DESIGN.md](./COMPOSER_DESIGN.md)**.

Summary: replace `CustomInput.tsx` with a small reusable cluster under `composer/` —
`PromptComposer` (orchestrator) + `ComposerInput` (editable, auto-grow ≤8 lines + inner scroll) +
`PromptPreview` (suggested/countdown) + `ComposerActionButton` (send/stop/countdown) +
`composer-status.ts` (discriminated union + pure derive). Auto-prompt cycle, contexts, and events
stay unchanged; only the input UI + internals are rewritten. `WebSdkInput` imports
`./composer/PromptComposer`. New behavior: multi-line auto-grow.

## ScrollContent.tsx (Phase 3)

Group the WebSDKContent scroll-area visuals (currently inline L21–161) into ONE component:
`CountdownBadge`, `DummyMessage`, `CompactLoadingSkeleton`, `FullLoadingSkeleton` as **local
helpers**, plus the `renderScrollContent` chat/loader/dummy/empty decision (L316–337). Props:
the handful WebSdkContent passes (`currentSession`, `shouldShowLoader`, `isCompactMode`,
`showDummyMessage`, `primaryPrompt`, `countdown`, `panelViewCountdown`, `handleAutoPromptClick`,
`scrollContainerRef`, `uiDensity`). Uses `DENSITY` for sizing. `Chat` stays imported here.

WebSdkContent then renders `<ScrollContent … />` inside its scroll wrapper — orchestrator drops
~140 lines.

## WebSdkContent / WebSdkView / WebSdkInput / WebSdkPresetPrompts (Phase 4)

- `WebSdkContent`: same orchestration + input-prop assembly (L353–408); renders `ScrollContent`
  + `WebSdkInput`. Rename `handleCompactInputActivate` → `handleExpandToFull`,
  `isCycleCountingDown` → `isAutoPromptCounting`. Hoist its class blobs (scrollContainer/root)
  into named consts.
- `WebSdkView`: `export function WebSdkView(_props: ViewShellProps){ return <WebSdkContent/>; }`.
- `WebSdkInput` / `WebSdkPresetPrompts`: rename only; `WebSdkInput` imports `./PromptComposer`.

## hook rename (Phase 5)

`useWebSdkAgentInit.ts` → `useInitialAgentSelection.ts` (same body); update WebSdkContent call.

## index.ts rewire + deletions (Phase 6)

```ts
import type { ViewModule } from '../types';
import { WebSdkView } from './WebSdkView';
const mod: ViewModule = { name: 'web-sdk', Shell: WebSdkView, mountStrategy: { kind: 'inline-container' } };
export default mod;
```
Delete `WebSDKView/Content/Input/PresetPrompts.tsx`, `CustomInput.tsx`, `AgentChips.tsx` +
`.stories.tsx`, `hooks/useWebSdkAgentInit.ts` (after renamed copies exist).
`grep -rn "WebSDK\|CustomInput\|AgentChips\|useWebSdkAgentInit" src` → expect zero (excl. this doc).

## Verification

- `pnpm -F @genuin/genai-sdk typecheck` / `lint` / `test`.
- `pnpm -F @genuin/genai-sdk dev:app` → web-sdk across renderMode compact/full, each uiDensity,
  auto-prompt countdown-only/full/disabled, loading, active session — pixel-identical UI + same
  outbound/inbound events.
- `pnpm -F @genuin/genai-sdk build:qa` sanity.

## Optimisations — measured follow-up (NOT in this behavior-preserving pass)

Separate PR; profile/bundle-analyze first (genai's Vite build has **no React Compiler**, so
manual memo is a real lever here, unlike the webapp).
1. 🟡 **Lazy-load `Chat`** in ScrollContent (`lazy(() => import('@/components/Chat'))` + Suspense)
   — today eager-imported (WebSDKContent L3) while AppContent lazy-loads it; defers heavy chunk
   for the compact/no-session embed.
2. 🟡 **Memoize bridge closures** — inline `()=>undefined` (L222) + `onExternalRenderModeChange`
   (L240) re-subscribe `useWebSdkBridge` listeners every render (dep at useWebSdkBridge L82);
   `useCallback` + module-const no-op.
3. 🟡 **`React.memo`** the pure leaves (ScrollContent visuals, composer state renders) + `useMemo`
   the stable derived values — profile first.
4. 🟢 De-dupe `sessions.find` (WebSDKContent L294 + CustomInput L194); textarea-height effect →
   `[]` dep (CustomInput L188); verify double analytics (Octo + Rudder) on preset select.
