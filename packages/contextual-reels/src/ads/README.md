# `src/ads/` — GenAd SDK Boundary

## Purpose

Owns the full lifecycle of a GenAd slot: SDK script injection, slot initialisation, waterfall
callbacks, and postMessage bridging back to the partner frame. Nothing outside this folder
should call `window.GenAd` directly.

## Sequence Diagram

```
Partner page  →  loadGenAdSdk()  →  useGenAdInstance  →  GenAd SDK
                                         ↓ isActive
                                    window.GenAd.init()
                                         ↓ callbacks
                        onWaterfallSuccess / onWaterfallFail
                                         ↓
                              postMessage to parent frame
```

`AdProvider.tsx` owns the passback counter; `useGenAdInstance.ts` owns the per-slot state.

## Event → Emitter Table

| Event emitted          | Trigger                            | File                  |
| ---------------------- | ---------------------------------- | --------------------- |
| `Ad Requested`         | before `GenAd.init()` call         | `useGenAdInstance.ts` |
| `Ad Response Received` | `onWaterfallSuccess` callback      | `useGenAdInstance.ts` |
| `Ad Impression`        | `onWaterfallSuccess` callback      | `useGenAdInstance.ts` |
| `Ad Request Failed`    | `onWaterfallFail` callback         | `useGenAdInstance.ts` |
| `Ad Passback`          | passback counter threshold reached | `AdProvider.tsx`      |

Event name strings are defined in [`../analytics/eventNames.ts`](../analytics/eventNames.ts).

## Single-Hit `tagIds`

Each `tagId` may trigger **at most one fill response and one no-fill response** per page
load. This prevents duplicate ad impressions when the MutationObserver re-mounts a
container. The allow-list is managed in `waterfall.ts` using a `Set` that persists for
the lifetime of the page. See `src/ads/waterfall.ts` for implementation.

## How to Add a New GenAd Provider

1. Create `src/ads/normalizers/yourProvider.ts` — export a pure function mapping the
   provider's response to the internal `GenAdSlot` type defined in `src/ads/types.ts`.
2. Add the provider key to the `GenAdProvider` union in `src/ads/types.ts`.
3. Add the `GenAdInitOptions` fields your provider requires to the same file.
4. Import and switch on the provider key inside `useGenAdInstance.ts`.
5. Write unit tests for the normalizer (happy path, missing fields, null/zero bid).

## Common Gotchas

- **Always call `GenAd.destroy()` before reinitialising** a slot — the SDK does not guard
  against double-init and will create duplicate DOM nodes.
- **Double-init guard**: `useGenAdInstance` must check `isActive` before calling
  `GenAd.init()`; the ref is set synchronously to prevent race conditions on strict-mode
  double-effect execution.
- **`genad:destroy` global event**: dispatched by `AdProvider` on unmount via
  `src/utils/eventBus.ts`; any hook holding a GenAd ref must listen and clean up.
