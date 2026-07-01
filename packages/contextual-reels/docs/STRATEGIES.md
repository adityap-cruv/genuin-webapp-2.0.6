# Strategy System

Per-tag feature decisions for the contextual-reels widget. One **strategy** = one
yes/no feature toggle (plus a couple of tunable values) resolved per tag id.

> Code lives in [`src/strategies/`](../src/strategies/). To change behaviour for a
> tag you edit **one file** — [`strategyConfig.ts`](../src/strategies/strategyConfig.ts).
> No consumer code changes.

---

## Why this exists

The widget historically gated features with scattered per-tag allowlist arrays
(`FULLSCREEN_AD_BREAK_ENABLED_TAG_IDS`, `GATE_ON_UNMUTE_TAG_IDS`,
`SINGLE_HIT_WATERFALL_TAG_IDS`, `MUTE_PASSBACK_TAG_IDS`). Adding one tag to several
features meant editing several arrays, and consumers each re-ran their own
`includes()` check. The strategy layer collapses all of that into a single resolved
`Strategies` object distributed through React context.

---

## The three layers (most-specific wins)

`resolveStrategies(tagId)` cascades three layers, later overriding earlier:

```
DEFAULT_STRATEGIES  →  preset bundle  →  tag inline keys
```

1. **`DEFAULT_STRATEGIES`** — every feature off. Safe base + the fallback when no
   provider is mounted. ([strategies.ts](../src/strategies/strategies.ts))
2. **preset bundle** — a named reusable group of toggles attached via
   `TAG_STRATEGIES[id].preset` (e.g. `iheart`, `singleHit`).
3. **tag inline keys** — a tag's own keys, which override the preset.

Resolution is **pure and total**: an unknown or empty `tagId` falls through to
`DEFAULT_STRATEGIES`; it never throws.

```ts
// resolveStrategies("69b298f4d6a6ad57e7b9a499")
// → { ...DEFAULT_STRATEGIES, singleHitWaterfall: true, mutePassback: true }
```

---

## How a tag flows to a decision

```
App  →  <StrategyProvider tagId>  →  resolveStrategies(tagId)  →  Strategies (context)
                                                                     │
   useStrategy()  ←──────────────────────────────────────────────── ┘
   (AdProvider, MutePassbackGuard, GenAIProvider, feed transforms, …)
```

- `StrategyProvider` resolves **once per tag** (`useMemo`) and shares the result.
  It also rolls any per-tag **traffic experiment** at this point (see
  [Experiments](#experiments)) and applies the winning overrides before sharing.
  ([StrategyProvider.tsx](../src/strategies/StrategyProvider.tsx))
- `useStrategy()` reads it. It does **not** throw outside a provider — a missing
  provider degrades to `DEFAULT_STRATEGIES` (every feature off), because strategies
  are an enhancement layer.
- The `tagId` is the **embed tag id** (from embed config / `getTag`), **not** the
  reel `_id` in a feed payload.

---

## Current strategies

| Key                   | Type      | Default | Meaning |
| --------------------- | --------- | ------- | ------- |
| `genAiEnabled`        | `boolean` | `false` | GenAI Octo experience available for this tag. |
| `adBreakEnabled`      | `boolean` | `false` | Mock fullscreen ad break fires on organic reel playback (dev/demo fallback when the backend supplies no `ad_configs`). |
| `gateOnUnmute`        | `boolean` | `false` | Default for `NormalisedAd.gateOnUnmute` when the backend omits `gate_on_unmute`. Suppresses the ad *request* while muted. |
| `singleHitWaterfall`  | `boolean` | `false` | Fill / no-fill waterfall callbacks are suppressed after the first per page load. |
| `adsDisabled`         | `boolean` | `false` | Hard kill switch — no ads ever shown. Drops standalone ad slides and strips the organic ad break. Overrides `adBreakEnabled`. |
| `mutePassback`        | `boolean` | `false` | On first `player:play`, start a timer; if still muted when it fires, trigger an ad passback (`onAdFail`). Distinct from `gateOnUnmute` — this passes the slot back rather than just suppressing the request. |
| `mutePassbackDelayMs` | `number`  | `3000`  | Delay before the `mutePassback` timer fires, measured from the first `player:play`. Ignored unless `mutePassback` is on. |
| `initialVolume`       | `number`  | `0`     | Volume (0..1) the feed starts at on first load. `0` plays unmuted-but-silent and shows the unmute prompt; set per-tag (e.g. `0.2`) to start audible. A browser autoplay block snaps it back to 0. |

> Add a new toggle by extending `Strategies` + giving it a default in
> `DEFAULT_STRATEGIES`. Consumers read it through `useStrategy()` unchanged.

---

## Presets

Defined in [`strategyConfig.ts`](../src/strategies/strategyConfig.ts):

| Preset      | Sets |
| ----------- | ---- |
| `iheart`    | `adBreakEnabled`, `gateOnUnmute` |
| `genaiDemo` | `genAiEnabled` |
| `singleHit` | `singleHitWaterfall` |

Attach to a tag with `{ preset: "iheart", ...inlineOverrides }`. Inline keys win.

---

## Experiments

`TAG_STRATEGIES` is **deterministic** per tag. For a randomised slice of traffic,
use `TAG_EXPERIMENTS` (also in [`strategyConfig.ts`](../src/strategies/strategyConfig.ts)).
An experiment applies its `overrides` on top of a tag's resolved strategies when a
page load falls into the bucket (probability `sampleRate`).

```ts
// strategyConfig.ts
export const TAG_EXPERIMENTS: Record<string, TagExperiment> = {
  "6a032e34054c8fcb08582510": { sampleRate: 0.02, overrides: { mutePassback: false } },
  "6a032de445fa9f171bd291cb": { sampleRate: 0.02, overrides: { mutePassback: false } },
};
```

- **Roll site & cadence** — `StrategyProvider` draws `Math.random()` **once per
  mount** inside `useMemo`, so the bucket is stable for the session but varies
  page-load to page-load. (Not sticky per user — a returning user may land in a
  different bucket next load.)
- **Pure split** — the override logic is `applyExperiment(base, tagId, roll)` in
  [`strategies.ts`](../src/strategies/strategies.ts): in-bucket when `roll <
  sampleRate`, no-op otherwise and for tags with no experiment. The random draw
  lives in the provider, not the function, so it stays unit-testable.

**Current experiment** — tags `6a032e34054c8fcb08582510` / `6a032de445fa9f171bd291cb`
already start at `initialVolume: 0` and fire the ad request immediately
(`gateOnUnmute` is off). For **2%** of loads, `mutePassback` is suppressed so the
volume-0 ad runs instead of being passed back after the muted-playback timer.

---

## Recipes

**Turn a feature on for a tag** — add or edit one entry in `TAG_STRATEGIES`:

```ts
// strategyConfig.ts
export const TAG_STRATEGIES: Record<string, TagStrategyEntry> = {
  "69b298f4d6a6ad57e7b9a499": { singleHitWaterfall: true, mutePassback: true },
};
```

**Override the mute-passback delay for one tag:**

```ts
"69b298f4d6a6ad57e7b9a499": { mutePassback: true, mutePassbackDelayMs: 5000 },
```

**Use a preset + one override:**

```ts
"someTag": { preset: "iheart", gateOnUnmute: false }, // iheart bundle, but ungated
```

---

## Where things connect

- **`mutePassback`** — consumed by `MutePassbackGuard` in
  [`src/app/App.tsx`](../src/app/App.tsx). Arms a one-shot timer on the **first**
  `player:play` bus event (not on mount), so the window measures muted *playback*,
  not the tag/feed-load gap. Calls `useAdWaterfall().onAdFail()` if still muted.
- **`singleHitWaterfall`** — consumed by `AdProvider`
  ([AdProvider.tsx](../src/providers/AdProvider.tsx)) via `shouldCountFill` /
  `shouldCountNoFill` in [`src/ads/waterfall.ts`](../src/ads/waterfall.ts). Note:
  `notifyAdFill` / `notifyAdNoFill` themselves are **tag-agnostic** — they
  postMessage to the parent frame and call `window.adFillCallback` /
  `window.noAdsCallback`; the only id-driven gate is the single-hit count.
- **`adBreakEnabled` / `gateOnUnmute` / `adsDisabled`** — consumed by the feed
  transform in [`src/feed/feedTransforms.ts`](../src/feed/feedTransforms.ts)
  (`normaliseReel` / `normaliseFeed`).

---

## Forward note

Currently client-side. When the backend serves this config, prepend one layer in
`resolveStrategies` and these registries become the dev / fallback default.
