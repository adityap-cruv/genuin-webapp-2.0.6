# `src/ads/` — GenAd SDK Boundary

## Purpose

Owns the full lifecycle of a GenAd slot: SDK script injection, slot initialisation, waterfall
callbacks, and postMessage bridging back to the partner frame. Nothing outside this folder
should call `window.GenAd` directly.

## Sequence Diagram

```
Partner page  →  loadGenAdSdk()  →  GenAdSlot.tsx  →  GenAd SDK
                                         ↓ isActive
                                    window.GenAd.init()
                                         ↓ callbacks
                        onWaterfallSuccess / onWaterfallFail
                                         ↓
                              postMessage to parent frame
```

`AdProvider.tsx` (`src/providers/`) owns single-hit deferred passback + Infolinks
Impression; `GenAdSlot.tsx` owns the per-slot GenAd SDK state.

## Event → Emitter Table

| Event emitted          | Trigger                             | File              |
| ---------------------- | ------------------------------------ | ----------------- |
| `Ad Requested`         | before `GenAd.init()` call          | `GenAdSlot.tsx`   |
| `Ad Response Received` | `onWaterfallSuccess` callback       | `GenAdSlot.tsx`   |
| `Ad Impression`        | `onWaterfallSuccess` callback       | `GenAdSlot.tsx`   |
| `Ad Request Failed`    | `onWaterfallFail` callback          | `GenAdSlot.tsx`   |
| `Ad Passback`          | waterfall exhausted (see below)     | `AdProvider.tsx`  |
| `Infolinks Impression` | `window.cxr.infolinksImpression()`  | `AdProvider.tsx`  |

Event name strings are defined in [`../analytics/analytics.ts`](../analytics/analytics.ts) (`EVENT`).

## Single-Hit `tagIds` & deferred passback

Each `tagId` may trigger **at most one fill response and one no-fill response** per page
load (`singleHitWaterfall` strategy — see
[../../docs/STRATEGIES.md](../../docs/STRATEGIES.md)). This prevents duplicate ad
impressions when the MutationObserver re-mounts a container. `AdProvider.tsx` tracks
per-slot no-fills in `noFillSlotsRef` and defers `Ad Passback` until every ad/
`video-with-ad` slot has reported no-fill **and** the feed has reached its last entry
(`firePassbackIfExhausted`). `notifyAdFill`/`notifyAdNoFill` in `waterfall.ts` are
themselves tag-agnostic — they just postMessage the parent frame / call
`window.adFillCallback`/`window.noAdsCallback`; the single-hit gate lives in `AdProvider`.

## How to Add a New GenAd Provider

1. Add a normalizer function in `src/ads/normalizers.ts` mapping the provider's response
   to the internal `AdProviderKind` shape.
2. Add the provider key to the `AdProviderKind` union in `src/ads/normalizers.ts`.
3. Add any `GenAdInitOptions` fields your provider requires.
4. Import and switch on the provider key inside `GenAdSlot.tsx`.
5. Write unit tests for the normalizer (happy path, missing fields, null/zero bid).

## Common Gotchas

- **Always call `GenAd.destroy()` before reinitialising** a slot — the SDK does not guard
  against double-init and will create duplicate DOM nodes.
- **Double-init guard**: `GenAdSlot.tsx` must check `isActive` before calling
  `GenAd.init()`; the ref is set synchronously to prevent race conditions on strict-mode
  double-effect execution.
- **`genad:destroy` bus event**: emitted by `AdProvider` on the per-instance
  `CxrEventBus` (via `useEventBus()`), not the legacy `src/utils/eventBus.ts` (dead code,
  no production import — see `.claude/codebase-map.md`); any hook holding a GenAd ref
  must listen and clean up.
