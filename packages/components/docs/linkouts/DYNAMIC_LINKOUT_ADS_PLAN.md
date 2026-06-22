# Plan — In-linkout banner ad inside `<DynamicLinkouts>`

## Goal

Make `<DynamicLinkouts>` self-sufficient as a monetisation slot: when no
linkout fills, host an IAB banner ad **inside its own panel chrome** (Figma
`Component 3` at node `9563:113378`), with its own `<GenAdContainer>` instance
sized to the linkout's *own* container — independent of any parent video
player. Mirrors the existing pattern where `<DynamicLinkouts view="responsive">`
already renders entirely standalone (no video).

> **Scope clarification.** This plan does **not** touch `<FeedPlayer>` or its
> `<GenAdContainer>` overlay. `<FeedPlayer>` keeps its existing ad pipeline
> (full-frame video / IMA / native ads layered on top of the video). The new
> banner is a *second*, separate `<GenAdContainer>` instance instantiated by
> `<DynamicLinkouts>` itself, with a config that only contains `banner` (no
> video / native). The two never overlap because they target different slots.

## What I read

| File | Key findings |
| --- | --- |
| `packages/components/src/molecules/linkout-new/linkouts-dynamic.tsx` | `DynamicLinkoutsProps` is link-centric (`links: LinkData[]`, `ctaText`, `ctaLink`). Wraps `<LinkoutItem>` in a lazy `<DynamicSheet>` driven by the scenario picked from `linkouts-sheet-config.ts`. Current picker uses `effectiveVideoWidth` from `useEmbedConfigs()` — that's the *video player*'s width, which works fine for embed scenarios but is unavailable when the linkout is used standalone (responsive view, /websitev5, /grid story harness). |
| `packages/components/src/molecules/linkout-new/linkout-item.tsx` | `<LinkoutItem>` accepts `links: LinkData[]` and renders `<LinkCard>` per slide. `<LinkoutCarouselDots>` is already a pure-prop component exposed from this module. The `default` / `default-active` / `expand-view` states each host a single card + the same panel chrome (`rgba(0,0,0,0.5)` + backdrop blur) that the Figma `Component 3` reference shows. |
| `packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts` | Scenario config: per-width buckets (`pl-xs`, `pl-sml`, `default`, `default-active`, `expand-view`, `panel-view`, `full-view`, `responsive`) with their own `heights` / `enabledStates` / panel classes. The `default` family already has the exact panel chrome the banner needs. |
| `packages/components/src/molecules/linkout-new/link-card.tsx` | `<LinkCard>` is a per-`sheetState` renderer. Would be replaced 1:1 by `<GenAdContainer>` when the slot is in ad mode. |
| `packages/components/src/molecules/feed-player/gen-ad-container/gen-ad-container.tsx` | `<GenAdContainer>` lazily loads `gen_ad.min.js` (deduped via `document.querySelector(script[src=…])`) and calls `window.GenAd.init({ containerElement, … })` on mount. Owns its own analytics, mute state, waterfall callbacks. The script loader is idempotent — safe to mount a second `<GenAdContainer>` for the linkout banner without conflicting with FeedPlayer's instance. |
| `packages/components/src/molecules/feed-player/gen-ad-container/gen-ad.types.ts` | `GenAdConfig` = `{ adSlotId, brandDetails?, banner?, native?, video?, waterfallOrder?, debug? }`. The in-linkout instance only sets `banner` — the SDK happily fills against a banner-only config. |
| `packages/components/src/organisms/linkouts/linkouts.tsx` | Production wrapper around `<DynamicLinkouts>`. Receives `linkouts: LinkData[]` from the feed payload and forwards. New callers that want the banner fallback would pass a banner config alongside (or instead of) the linkouts. |
| `packages/components/src/organisms/linkouts/_story-helpers.tsx` | Storybook already implements the full picker (`pickBannerAdSize`, `BANNER_AD_SIZES`, `BANNER_AD_MIN_FRAME_HEIGHT`, `BANNER_AD_MAX_HEIGHT`) plus the `<MockLinkoutBannerPanel>` wrapper that mirrors Figma `Component 3`. Ready to be promoted to production. |
| `packages/components/src/page/websitev5/websitev5.tsx` | Existing call site that uses `<DynamicLinkouts view="responsive">` *without* a parent video player — proves the standalone-linkout case already exists. The new banner mode follows the same model: the linkout measures its own container, the size picker has no dependency on `effectiveVideoWidth`. |

## Constraints flagged

- **Shared-package change.** Touches `packages/components/molecules/linkout-new/*` and `organisms/linkouts/*`, consumed by both `apps/webapp` and `packages/web-sdk`. Requires approval before landing.
- **Public-API expansion on `<DynamicLinkouts>`.** Additive (new optional prop). Should still be reviewed for API shape — see the "discriminated union vs separate prop" decision in step 1.
- **GenAd SDK script lifecycle.** Two `<GenAdContainer>` instances may now coexist on a single page (FeedPlayer's full-frame ad + DynamicLinkouts' in-slot banner). The existing dedupe inside `loadGenAdScript()` prevents the script from being injected twice; need to verify `window.GenAd.init(...)` is safe to call concurrently with two different `instanceIdRef`s, two different container elements, and two different ad-slot ids. Initial read of the source suggests it is — each call returns its own `instanceId` and the SDK is documented as multi-instance — but worth a smoke test in the implementation PR.
- **No telemetry regression.** FeedPlayer's existing AD_REQUESTED / AD_RESPONSE_RECEIVED / etc. events must continue to fire from its instance. The new in-linkout `<GenAdContainer>` will fire the *same* events for the banner — that's intentional and required, since the banner is a real ad with real impression tracking. Analytics consumers should disambiguate via the existing `ad_type` payload (FeedPlayer sets `ad_type: "in_feed"`; the linkout instance should set something like `ad_type: "linkout_banner"`).
- **Auth / CORS / CSP / security headers.** None.
- **New external dependencies.** None — `<GenAdContainer>` already exists; we're just relocating its mount point for the banner case.

## Plan

The plan is split into two layers: **(A)** type / API contracts that everyone agrees on first, then **(B)** the component-level wiring. Land (A) as one PR so call sites can be updated independently; land (B) as a second PR with the actual render logic + Storybook stories.

### Phase A — types and config

1. **`packages/components/src/molecules/linkout-new/types.ts`** *(new file)*

   Add a single export `LinkoutSlotContent` modelling the discriminated union the
   slot can host. Keeps the option list closed so the picker and
   `<LinkoutItem>` switch are exhaustive.

   ```ts
   // sketch — do not implement here
   export type LinkoutSlotContent =
     | { kind: "link"; links: LinkData[]; ctaText: string; ctaLink: string }
     | { kind: "banner-ad"; banner: GenAdBannerConfig | GenAdBannerConfig[]; brandId?: string };
   ```

   The `banner-ad` variant carries *only* the banner config — no video / native
   from `GenAdConfig`. Those formats live in `<FeedPlayer>` and are out of
   scope for the linkout slot.

   *Decision:* discriminated union vs separate optional props.
   **Recommended:** discriminated union. Avoids the "both `links` and
   `bannerConfig` are set, which wins?" ambiguity at call sites, and lets the
   `<LinkoutItem>` switch on `content.kind` exhaustively.

2. **`packages/components/src/molecules/linkout-new/linkouts-dynamic.tsx`** —
   extend `DynamicLinkoutsProps`.

   Add an *optional* `content?: LinkoutSlotContent` prop alongside the existing
   `links` / `ctaText` / `ctaLink`. When `content` is supplied it takes
   precedence; existing props remain (back-compat) and resolve to
   `{ kind: "link", links, ctaText, ctaLink }` internally.

   Forward the resolved `LinkoutSlotContent` down to `<LinkoutItem>` via a new
   `content` prop (also typed as `LinkoutSlotContent`).

3. **`packages/components/src/molecules/linkout-new/banner-ad-picker.ts`**
   *(new file)*

   Promote the storybook helpers from `_story-helpers.tsx` to production. Same
   rules, no dependency on `effectiveVideoWidth` or any video context — the
   picker is a pure function of the linkout's own container dimensions:

   ```ts
   export const BANNER_AD_SIZES = [
     { w: 300, h: 50 },
     { w: 320, h: 50 },
     { w: 320, h: 100 },
   ] as const;
   export const BANNER_AD_MIN_CONTAINER_HEIGHT = 200;
   export const BANNER_AD_MAX_HEIGHT = 100;

   export function pickBannerAdSize(
     containerW: number,
     containerH: number,
   ): { w: number; h: number } | null;
   ```

   Rule recap (mirrors what the storybook ships today, terminology updated):
   - `containerH ≥ BANNER_AD_MIN_CONTAINER_HEIGHT` (no banner in short slots).
   - `adH ≤ BANNER_AD_MAX_HEIGHT` (guardrail against future entries).
   - `adW ≤ containerW`.
   - Pick the largest *area* that fits; tiebreaker is height (320×100 beats
     320×50 at equal width).

   Replace the storybook copies (`pickBannerAdSize`, `BANNER_AD_*`,
   `BANNER_CROP_BY_SIZE`) with re-imports from this module so the
   `<MockLinkoutBannerPanel>` story stays in lock-step with production.

4. **`packages/components/src/molecules/linkout-new/use-linkout-container-size.ts`**
   *(new file, pseudocode)*

   Hook that returns the linkout's *own* live container size via
   `ResizeObserver`. The picker needs container W/H to decide which banner
   fits, and the linkout must measure itself — it can't borrow
   `effectiveVideoWidth` from the embed context because the standalone /
   responsive cases (e.g. `/websitev5`, `/grid` harness) have no video player
   above them.

   ```ts
   // sketch
   export function useLinkoutContainerSize(): {
     ref: RefObject<HTMLDivElement>;
     size: { w: number; h: number };
   };
   ```

   Attach `ref` to the outermost element rendered by `<DynamicLinkouts>` (the
   `<Suspense>` wrapper around `<LazyDynamicSheet>` — see existing JSX). On
   resize, recompute. Same pattern as `useFrameSize` in `_story-helpers.tsx`.

   *Decision:* measure the linkout's outer container vs the host's container?
   **Recommended:** the linkout's *own* container. That's what the user
   asked for, and it matches the standalone-linkout architecture. The
   container's width is set by whatever parent it's dropped into (a video
   player, a grid cell, a static page section) — the picker doesn't need
   to know which.

5. **`packages/components/src/molecules/linkout-new/linkouts-sheet-config.ts`** —
   reuse-vs-extend the existing scenarios.

   The default-family scenarios (`default`, `default-active`, `expand-view`)
   already have the exact panel chrome the banner needs (`rgba(0,0,0,0.5)` +
   backdrop blur + 4 px pad + 8 px radius), and they already auto-measure
   their `heights` from rendered content. **No new scenario needed for the
   first cut** — the banner just renders inside the existing `default`
   scenario panel, and the auto-height picks up its 50 / 100 px footprint.

   The only required change: when `content.kind === "banner-ad"`, force
   `initialState: "default"` and `enabledStates: ["default"]` (no expand
   transitions, no auto-advance) so the slot stays static while the banner
   is displayed. Implementable inline in `linkouts-dynamic.tsx` (override
   the scenario's `initialState` / `enabledStates` / `autoAdvance` when in
   ad mode) — no `linkouts-sheet-config.ts` change at all. **Recommended.**

   *Defer to v2 if needed:* dedicated `embed-banner-*` scenarios that
   pre-size the panel to the largest banner that can fit. The current auto-
   height pathway already produces the correct visual, so the extra config
   complexity isn't justified in v1.

### Phase B — component wiring

1. **`packages/components/src/molecules/linkout-new/linkout-item.tsx`** —
   accept `content` and branch on kind.

   When `content.kind === "banner-ad"`, render `<GenAdContainer>` (lazily
   imported, same as `<FeedPlayer>` does) in place of `<LinkCard>`. Pass the
   resolved `GenAdConfig` with *only* the `banner` field set, and a unique
   `adSlotId` derived from a `useId()` hook so it doesn't collide with
   FeedPlayer's slot id on the same page.

   `<LinkoutCarouselDots>` is still rendered as a sibling, but with
   `total = 1` (or hidden via `total <= 1` short-circuit that the dots
   component already has). The Figma reference shows a static 4-dot strip;
   we'll opt for the realistic 1-dot version for v1 and revisit if the
   product wants the cosmetic 4-dot strip even for single-ad slots.

2. **`packages/components/src/molecules/linkout-new/linkouts-dynamic.tsx`** —
   route the content prop and run the picker.

   Inside the component:
   - Resolve `content` from the new prop (or back-compat-build from
     `links` / `ctaText` / `ctaLink`).
   - Call `useLinkoutContainerSize()` and attach its `ref` to the outer
     wrapper.
   - When `content.kind === "banner-ad"`:
     - Run `pickBannerAdSize(size.w, size.h)`.
     - If `null`, render nothing (linkout slot stays empty — matches the
       storybook behaviour).
     - Otherwise pick the matching banner entry from `content.banner` (when
       the host supplies an array, the picker still picks the largest that
       *fits*; if only one is supplied, render it iff it fits).
     - Build a `GenAdConfig` with `banner: pickedBanner`, pass to
       `<LinkoutItem>` via the `content` prop.
   - Override `baseConfig.initialState` / `enabledStates` / `autoAdvance`
     for the ad case as described in step 5.

3. **`packages/components/src/organisms/linkouts/linkouts.tsx`** —
   forward `content`.

   Add the optional `content` pass-through. Most callers stay on the
   `links` / `ctaText` / `ctaLink` shape; new ad-aware callers pass `content`.

4. **Call-site updates (out-of-scope for this PR, listed for awareness).**
   Whichever feature first wants the banner fallback (likely the feed-page
   linkout adapter or the /websitev5 hierarchical-grid linkout slot) will
   call `<DynamicLinkouts content={{ kind: "banner-ad", banner: …, brandId }}>`
   instead of (or in addition to) `links`. The exact wiring belongs in
   *that* feature's PR — this plan stops at making `<DynamicLinkouts>` *able*
   to render the banner.

### Phase C — tests and stories

1. **Unit tests** — colocate alongside source:
    - `banner-ad-picker.test.ts` — verify largest-area-fits / min-container-
      height / max-ad-height / no-fit cases. The storybook story already
      enumerates the matrix; the test is a direct mirror.
    - `linkouts-dynamic.test.tsx` — `<DynamicLinkouts content={{ kind: "banner-ad", banner: … }}>`
      renders `<GenAdContainer>` (mocked), forwards a `GenAdConfig` containing
      *only* `banner`, and does *not* render `<LinkCard>` or fire any
      `LINKOUTS_CLICKED` analytics.

2. **Storybook updates** — fold the existing mocks back to production.
    - `dynamic-linkout-embed.stories.tsx` `Banner Ad` mode currently uses
      `<MockLinkoutBannerPanel>`. After this work it can swap to
      `<DynamicLinkouts content={{ kind: "banner-ad", banner: … }}>` with a
      stubbed `<GenAdContainer>` (Vite alias or context-injected renderer)
      so the story exercises the real code path. Keep the existing storybook
      helpers as the *fallback* renderer in the alias.
    - `dynamic-linkouts-embed-view.doc.mdx` — update the banner-ad section
      so it cross-references the production helper module instead of the
      storybook-only mock.

## Open questions

- **Should the linkout host display ads (300×250 / 300×600)?** The Figma
  reference for `Component 3` is banner-only. Display ads are centre-anchored
  full-frame and don't share the linkout's bottom-pinned panel chrome — they
  belong in a different component (a sibling overlay, not inside
  `<DynamicLinkouts>`). Out of scope for this plan; flag for design review.
- **Should the linkout rotate between a link and a banner ad in the same
  session?** Current waterfall is "linkout if available, banner ad if not".
  Rotation would need new dot-strip semantics and a more complex content
  model. Defer to v2.
- **`debug: true` on `GenAdConfig`.** Currently unused in the codebase.
  Worth confirming with the GenAd team whether it renders a deterministic
  sandbox banner — would let the Storybook stories replace the static-image
  mock with a real `<GenAdContainer debug>` instance.
- **Concurrent `<GenAdContainer>` instances.** Confirm with the GenAd team
  that mounting two instances (FeedPlayer's full-frame + DynamicLinkouts'
  in-slot banner) on the same page is supported. Initial code read suggests
  yes (the SDK returns a per-instance id and the script loader is deduped),
  but worth an explicit smoke test in the implementation PR.

## Recommended approach

Land in two PRs:

1. **PR 1 (Phase A only).** Adds the `LinkoutSlotContent` discriminated union,
   the back-compat default in `<DynamicLinkouts>` (no behaviour change), the
   `banner-ad-picker.ts` production helper, and the `useLinkoutContainerSize`
   hook. No render-path changes — purely contract setup. Easy to review,
   easy to revert. Storybook keeps using its own copies of the picker until
   PR 1 ships, then in a follow-up commit switches to the production
   module.

2. **PR 2 (Phases B + C).** Wires the actual `<GenAdContainer>` mount inside
   `<LinkoutItem>`, applies the scenario override for ad mode, updates the
   organism wrapper, and adds tests + storybook integration. Smoke-tests
   the concurrent-instance question with the GenAd team's input.

This split keeps the type / API change separate from the behaviour change so
reviewers can audit each layer independently. The first PR is safe to ship on
its own (nothing renders differently); the second PR is the meaningful
behavioural delta. `<FeedPlayer>` and its existing ad overlay are unchanged
throughout — the new banner lives entirely inside the linkout slot.
