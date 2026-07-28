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

| Key                   | Type      | Default    | Meaning                                                                                                                                                                                                                                                                                                     |
| --------------------- | --------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `genAiEnabled`        | `boolean` | `false`    | GenAI Octo experience available for this tag.                                                                                                                                                                                                                                                               |
| `adBreakEnabled`      | `boolean` | `false`    | Mock fullscreen ad break fires on organic reel playback (dev/demo fallback when the backend supplies no `ad_configs`).                                                                                                                                                                                      |
| `gateOnUnmute`        | `boolean` | `false`    | Default for `NormalisedAd.gateOnUnmute` when the backend omits `gate_on_unmute`. Suppresses the ad _request_ while muted.                                                                                                                                                                                   |
| `singleHitWaterfall`  | `boolean` | `false`    | Fill / no-fill waterfall callbacks are suppressed after the first per page load.                                                                                                                                                                                                                            |
| `adsDisabled`         | `boolean` | `false`    | Hard kill switch — no ads ever shown. Drops standalone ad slides and strips the organic ad break. Overrides `adBreakEnabled`.                                                                                                                                                                               |
| `mutePassback`        | `boolean` | `false`    | On first `player:play`, start a timer; if still muted when it fires, trigger an ad passback (`onAdFail`). Distinct from `gateOnUnmute` — this passes the slot back rather than just suppressing the request.                                                                                                |
| `mutePassbackDelayMs` | `number`  | `3000`     | Delay before the `mutePassback` timer fires, measured from the first `player:play`. Ignored unless `mutePassback` is on.                                                                                                                                                                                    |
| `initialVolume`       | `number`  | `0`        | Volume (0..1) the feed starts at on first load. `0` plays unmuted-but-silent and shows the unmute prompt; set per-tag (e.g. `0.2`) to start audible. A browser autoplay block snaps it back to 0.                                                                                                           |
| `servedStatically`    | `boolean` | `false`    | Serve the tag's config + feed from committed per-tag fixtures — skip `/ad_creative` and `/feed`. `/ip_info` is still fetched (geoip stays on analytics). The ad URL is rewritten client-side (real `ua`, `[PAGE_URL]`, real client `ip` from geoip). See [Statically-served tags](#statically-served-tags). |
| `feedLoopEnabled`     | `boolean` | **`true`** | Whether the feed wraps from the last slide back to the first. See [Finite feeds](#finite-feeds-feedloopenabled).                                                                                                                                                                                            |

> **`feedLoopEnabled` is the one flag that defaults _on_.** Every other key defaults to
> off/safe; looping is the pre-existing behaviour for every tag, so the safe default is
> `true` and only an explicit per-tag `false` opts out.

> Add a new toggle by extending `Strategies` + giving it a default in
> `DEFAULT_STRATEGIES`. Consumers read it through `useStrategy()` unchanged.

---

## Presets

Defined in [`strategyConfig.ts`](../src/strategies/strategyConfig.ts):

| Preset             | Sets                             |
| ------------------ | -------------------------------- |
| `iheart`           | `adBreakEnabled`, `gateOnUnmute` |
| `genaiDemo`        | `genAiEnabled`                   |
| `singleHit`        | `singleHitWaterfall`             |
| `servedStatically` | `servedStatically`               |
| `noLoop`           | `feedLoopEnabled: false`         |

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
  `player:play` bus event (not on mount), so the window measures muted _playback_,
  not the tag/feed-load gap. Calls `useAdWaterfall().onAdFail()` if still muted.
- **`singleHitWaterfall`** — consumed entirely inside `AdProvider`
  ([AdProvider.tsx](../src/providers/AdProvider.tsx)): `recordSingleHitNoFill`
  tallies per-slot no-fills into `noFillSlotsRef`, and `firePassbackIfExhausted`
  fires the deferred passback once every ad/video-with-ad slot has reported
  no-fill and the feed has reached its last entry. `recordAdBreakResult` feeds
  the same tally for ad-break (`video-with-ad`) results without ever triggering
  passback directly. `notifyAdFill` / `notifyAdNoFill`
  ([`src/ads/waterfall.ts`](../src/ads/waterfall.ts)) themselves are
  **tag-agnostic** — they postMessage to the parent frame and call
  `window.adFillCallback` / `window.noAdsCallback`; the only id-driven gate is
  the single-hit count kept in `AdProvider`.
- **`adBreakEnabled` / `gateOnUnmute` / `adsDisabled`** — consumed by the feed
  transform in [`src/feed/feedTransforms.ts`](../src/feed/feedTransforms.ts)
  (`normaliseReel` / `normaliseFeed`).
- **`servedStatically`** — consumed in four places (all gated on the flag, so normal
  tags are untouched). See [Statically-served tags](#statically-served-tags).

---

## Statically-served tags

A `servedStatically` tag serves its **config + feed** from committed per-tag JSON
fixtures, skipping two network calls (`/ad_creative`, `/feed`) to cut ad-load
latency. `/ip_info` is still fetched — geoip is needed on analytics and supplies
the real client IP for the ad-URL rewrite. Configuration-driven and per-tag
dynamic — a new static tag is added by dropping in fixtures + one registry key +
the preset, with **no core logic change**.

### Two pieces

1. **The flag** (`servedStatically` in the strategy cascade) — marks a tag as static.
   Attached via the `servedStatically` preset in `TAG_STRATEGIES`.
2. **The data registry** ([`src/strategies/staticTagData.ts`](../src/strategies/staticTagData.ts))
   — `STATIC_TAG_DATA` maps `tagId → () => Promise<StaticTagEntry>`. Each value is a
   **lazy per-tag loader** that dynamic-`import()`s only that tag's two JSON
   fixtures, so Vite emits one async chunk per tag and a non-static tag pulls
   **zero** fixture bytes. `getStaticTagData(tagId)` is **async**; `STATIC_TAG_IDS`
   is a sync, fixture-free `Set` for membership checks (drift guard, "is static?").

   Fixtures live in [`src/providers/static-tag/`](../src/providers/static-tag/) as
   `<tagId>.tag.json` and `<tagId>.feed.json`. Both are stored as the **full**
   gateway envelope (`{ code, message, data }`) — paste a real `/ad_creative` or
   `/feed` response in verbatim; the loader unwraps `.data`. From the feed only
   `data.reels` is used — `data.visit_id` is ignored (see below).

### The gated consumers

| What                | Where                                                                                   | Behaviour                                                                                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| skip `/ad_creative` | [`useTagLoader.ts`](../src/app/useTagLoader.ts)                                         | Applies `entry.tagConfig` instead of `getTag`. Falls back to `getTag` on any fixture miss.                                                                                                                                        |
| skip `/feed`        | [`FeedProvider.tsx`](../src/providers/FeedProvider.tsx)                                 | Serves `entry.feed`; generates a fresh `crypto.randomUUID()` visit_id per load; emits `BATCH_STARTED` + `FEED_API_CALL_COMPLETED` for funnel parity.                                                                              |
| rewrite ad URL      | [`genAdSdk.ts`](../src/ads/genAdSdk.ts) → [`adUrlMacros.ts`](../src/ads/adUrlMacros.ts) | Via a `{ servedStatically, clientIp }` option: replaces `ua` with the real UA and `ip` with the real client IP (from the shared geoip fetch); strips `ip` only when no IP is available. See [CONFIGURATION.md](CONFIGURATION.md). |

`/ip_info` is **not** skipped — `AnalyticsProvider` fetches geoip for every tag
(static included) exactly as before, stamping it onto analytics and feeding the
ad-URL IP rewrite. All static behaviour is gated on `servedStatically` **AND**
registry membership (`STATIC_TAG_IDS.has(tagId)`), so a flagged-but-unregistered
tag behaves exactly like a normal tag (no half-static state).

### Load-bearing behaviours

- **Fresh visit_id per load.** The fixture's baked `data.visit_id` is intentionally
  ignored; `FeedProvider` generates a UUID per mount so sessions stay distinct.
  It flows through `setVisitId(tagId, …)` → `getVisitIdPromise(tagId)` to
  `TAG_INIT` in `index.jsx`, so the top-of-funnel event and every feed/ad event
  share one id.
- **API fallback on any miss.** If a tag is flagged `servedStatically` but its static
  data is unavailable — absent from the registry (config drift), loader resolves
  empty, or the chunk fails to load — both `useTagLoader` and `FeedProvider` fall
  back to the **real API** rather than failing. A drift guard test asserts every
  `servedStatically` tag has a registry entry.
- **Full analytics parity.** Static tags emit the same funnel + ad/revenue events
  as normal tags, and — because `/ip_info` is still fetched — the same `geoip`
  (country/lat/lng/ip) and device/os/ua. No analytics gap.
- **Real client IP on the ad URL (best-effort).** `genAdSdk` reads the shared
  geoip cache (`getSharedGeoIp`, same fetch analytics uses — no extra request) and
  passes the client IP into the rewrite. It never blocks the ad on the fetch: if
  geoip hasn't resolved yet, the `ip` param is stripped rather than sent stale.

### Add a new statically-served tag

1. Drop `<tagId>.tag.json` + `<tagId>.feed.json` into `src/providers/static-tag/`.
2. Add a loader thunk keyed by `tagId` in `STATIC_TAG_DATA` (staticTagData.ts).
3. Add `preset: "servedStatically"` to the tag's `TAG_STRATEGIES` entry.

No consumer code changes.

---

## Debug-device feeds (temporary, diagnostic)

**Status: temporary.** This exists to debug the iOS audibility report
([AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md)) on real handsets. Remove
the registry entries once that investigation closes — see [Removing it](#removing-it).

### Why it exists

Infolinks device-targets our two test handsets so our unit always renders on
them, but the Triton exchange behind it fills only intermittently — most loads
end in a **passback**. That makes the audible-ad path nearly impossible to
exercise on a real device in the real app.

We cannot create fill: the auction happens inside Infolinks' waterfall, and by
the time `onWaterfallSuccess` or the no-fill passback fires the decision is
already made. What we _can_ do is bypass the exchange for two known devices, by
serving them a feed of **static VAST URLs** that always resolve.

### How it works

[`src/strategies/debugDevices.ts`](../src/strategies/debugDevices.ts) mirrors the
`staticTagData` registry above: a lazy `import()` thunk per device, so a
non-debug device pulls **zero** fixture bytes and Vite emits one async chunk per
device, fetched only on a match.

| Export                      | Kind  | Purpose                                                         |
| --------------------------- | ----- | --------------------------------------------------------------- |
| `isDebugDeviceFeed(tagId)`  | sync  | Fixture-free membership check — never pulls a chunk.            |
| `getDebugDeviceFeed(tagId)` | async | That device's reels, or `undefined` (caller falls back).        |
| `DEBUG_FEED_TAG_IDS`        | Set   | Tags the debug feed may replace. Currently the 320x50 tag only. |

Fixtures live in [`src/providers/debug-device/`](../src/providers/debug-device/)
as `<lowercase-device-id>.feed.json`, stored as the **full** gateway envelope
just like the static-tag fixtures. Their reels point at VAST documents served
from `https://gimedia.begenuin.com/vast/`.

### The gate — both halves required

Same invariant style as `isStaticTag`: a debug device on an unlisted tag, or an
ordinary device on the debug tag, is **not** a debug load.

1. **Device id** — matched against the `ifa`, `appidfa`, `appaid`, and `deviceid`
   host macros, **case-insensitively**. iOS reports an uppercase IDFA and Android
   a lowercase GAID; registry keys are lowercase and lookups are lowercased, so
   one key matches both. A case-sensitive check would silently miss iOS.
2. **Tag id** — must be in `DEBUG_FEED_TAG_IDS`.

Only the _existing_ `servedStatically` branch in `FeedProvider` consults this, so
non-static tags never reach it.

### Load-bearing behaviours

- **`Map`, not an object literal.** `key in obj` walks the prototype chain, so a
  device id of `"constructor"` or `"__proto__"` would read as a _registered_
  device and then throw on the loader call. `Map.has()` has no prototype chain.
  Tests lock this, along with prefix and substring near-misses.
- **The all-zero advertising id never matches.** Both platforms report
  `00000000-0000-0000-0000-000000000000` when tracking is denied (iOS ATT) or the
  id is reset. Treating it as a debug device would serve the debug feed to
  **every opted-out user in the population**.
- **Three independent fallbacks, all to normal behaviour.** A `.catch()` at the
  call site, an `Array.isArray` guard against fixture drift, and the zero-id
  rejection. Any failure serves the tag's ordinary static feed.
- **Analytics are untouched.** The swap happens _after_ `BATCH_STARTED`,
  `visit_id` generation, and `FEED_API_CALL_COMPLETED` — only `reels` differs, so
  the funnel is byte-identical to an ordinary static load.
- **`platform` stays `tritondigital`.** This keeps GenAd on the audio-VAST path
  (`_audioElement`) the audibility bug actually lives on. A video creative would
  exercise a different code path and prove nothing about the reported symptom.

### `forced_fill` — read this before quoting any audio numbers

Impressions served this way are **synthetic**, and they emit the same
`Audio Diagnostic` beacon as real fills. Every one carries **`forced_fill: true`**
([`genAdSdk.ts`](../src/ads/genAdSdk.ts)).

> Any field query reading the audibility rate **MUST** filter
> `forced_fill != true`. These two handsets are device-targeted by Infolinks and
> therefore load far more often than ordinary traffic — leaving them in silently
> biases the numerator in the rate quoted to Infolinks. See
> [ANALYTICS_QUERYING.md](ANALYTICS_QUERYING.md).

### The VAST documents

Served from `https://gimedia.begenuin.com/vast/` (Bunny pull zone 6193063) and
referenced **by URL** — the build never reads them.

**CORS is load-bearing.** GenAd fetches VAST with a plain `await fetch(vastUrl)`,
so a missing `Access-Control-Allow-Origin` makes the browser block the request;
GenAd then reports no-fill → passback, which looks _identical_ to the Triton
passback this feature exists to escape. The pull zone currently returns `ACAO: *`.
If the debug feed ever stops filling, check this first.

Local reference copies under `src/providers/static-vast/` are **gitignored** —
nothing in the build reads them and they have already drifted from what the CDN
serves. Treat the CDN as the source of truth.

### Add or change a debug device

1. Drop `<lowercase-device-id>.feed.json` into `src/providers/debug-device/`.
2. Add a thunk keyed by the **lowercase** id to `DEBUG_FEED_LOADERS`.

No consumer code changes. To cover another tag, add its id to
`DEBUG_FEED_TAG_IDS` (the 320x100 sibling `6a3915b692929ebec64d785e` is
deliberately excluded today).

**If the gate silently no-ops** — ordinary passback behaviour on a device you
expect to match — the likely cause is that the id Infolinks targets differs from
what the host actually passes. Read `host_script_params_raw` off the
`tag_captured` event on that handset and compare against the registry keys.

### Removing it

Delete `debugDevices.ts` + its test, the `src/providers/debug-device/` fixtures,
the two-line swap in `FeedProvider.tsx`, and the `forced_fill` field in
`genAdSdk.ts`. Nothing else depends on them.

---

## Finite feeds (`feedLoopEnabled`)

By default the feed is a **loop**: swiping (or auto-advancing) past the last entry wraps
to index 0. For an ads-only tag with 5 slots that means the widget replays its filled
slots indefinitely and never comes to rest.

Set `feedLoopEnabled: false` to make the feed **finite** — the last slide becomes a hard
stop. Attach the `noLoop` preset, or set the key inline:

```ts
// strategyConfig.ts → TAG_STRATEGIES
"<tagId>": { preset: "noLoop" },
// or alongside other keys:
"<tagId>": { initialVolume: 0.2, singleHitWaterfall: true, feedLoopEnabled: false },
```

A tag can carry only **one** preset, so a tag that already uses another bundle (e.g.
`servedStatically`) must opt out with the inline key rather than `preset: "noLoop"`.

### Tags currently opted out

| Tag id                     | Size    | Why                                                              |
| -------------------------- | ------- | ---------------------------------------------------------------- |
| `6a39163e92929ebec64d78ab` | 320×50  | Static AD-only feed — rest on the last slot instead of replaying |
| `6a3915b692929ebec64d785e` | 320×100 | Static AD-only feed — rest on the last slot instead of replaying |
| `6a6892e52ca77d200369fb9e` | 320×480 | Static AD-only feed — rest on the last slot instead of replaying |

All three also carry `preset: "servedStatically"`, hence the inline key.

### What it changes

|                                 | `feedLoopEnabled: true` (default) | `feedLoopEnabled: false`       |
| ------------------------------- | --------------------------------- | ------------------------------ |
| Embla `loop`                    | `true`                            | `false`                        |
| Embla `containScroll`           | `false`                           | `"trimSnaps"`                  |
| Swipe past last slide           | wraps to index 0                  | no-op, rests on the last slide |
| `autoAdvance()` on the final ad | wraps to index 0                  | no-op                          |

`containScroll` **must** follow `loop`: with `loop: false` and the loop-mode
`containScroll: false`, Embla keeps its un-contained bounds and the feed can be dragged
into empty space past the final slide.

### What it does not change

- **Ad requests.** `singleHitWaterfall` already prevents a looped-back slot from
  re-requesting, so turning looping off does not change fill counts or impressions.
- **Passback.** The end-of-feed check in
  [`AdProvider`](../src/providers/AdProvider.tsx) keys off `activeIndex` reaching the last
  entry, which happens in both modes. A feed where at least one slot filled never fires
  passback either way.
- **Slide virtualization.** Every entry keeps a full-height wrapper in both modes — Embla
  computes translate math from real per-slide height (see [`Feed.tsx`](../src/feed/Feed.tsx)).

### Where it connects

Resolved in [`strategies.ts`](../src/strategies/strategies.ts), read by
[`Feed.tsx`](../src/feed/Feed.tsx) via `useStrategy()`, and passed as the `loop` option to
[`useEmblaCarousel`](../src/feed/hooks/useEmblaCarousel.ts). The hook resolves it **once per
mount** into a per-instance base-options object, so the `enable`/`disable` swipe-gate
`reInit` calls (used while an Octo sheet is open) can never silently restore looping.

---

## Forward note

Currently client-side. When the backend serves this config, prepend one layer in
`resolveStrategies` and these registries become the dev / fallback default.
