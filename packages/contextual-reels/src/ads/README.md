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

| Event emitted          | Trigger                                       | File             |
| ---------------------- | --------------------------------------------- | ---------------- |
| `Ad Requested`         | before `GenAd.init()` call                    | `GenAdSlot.tsx`  |
| `Ad Response Received` | `onWaterfallSuccess` callback                 | `GenAdSlot.tsx`  |
| `Ad Impression`        | `onWaterfallSuccess` callback                 | `GenAdSlot.tsx`  |
| `Ad Request Failed`    | `onWaterfallFail` callback                    | `GenAdSlot.tsx`  |
| `Ad Passback`          | waterfall exhausted (see below)               | `AdProvider.tsx` |
| `Infolinks Impression` | `window.cxr.infolinksImpression()`            | `AdProvider.tsx` |
| `Audio Diagnostic`     | `onWaterfallSuccess`, audible-start tags only | `genAdSdk.ts`    |

Event name strings are defined in [`../analytics/analytics.ts`](../analytics/analytics.ts) (`EVENT`).

## Audio diagnostic beacon

`Audio Diagnostic` ([`audioDiagnostic.ts`](audioDiagnostic.ts)) fires **once per fill, only for
tags with `initialVolume > 0`**. It samples the live GenAd media element twice (800ms apart) and
reports the deltas, so a "volume is up but I hear nothing" report can be localised to a layer:

| Snapshot                                                             | Owner                                                                                                                       |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `has_audio_track=true`, `element_muted=false`, `time_advancing=true` | **Native** — the OS/audio session is silencing a healthy element (iOS `AVAudioSession` / ring switch). Not fixable from JS. |
| `ad_blocked_reason` set, or `element_muted=true`                     | Browser autoplay policy blocked unmuted autoplay.                                                                           |
| `has_audio_track=false` with `audio_track_source="audioTracks"`      | **Ours** — the creative genuinely has no audio track.                                                                       |
| `has_audio_track=false` with `audio_track_source="awaitingMetadata"` | Inconclusive — sampled before metadata loaded, so the empty track list proves nothing. **Not** a silent creative.           |
| `has_audio_track=false` with `audio_track_source="unknown"`          | Inconclusive — no signal available on this engine. Not evidence of anything.                                                |

Four things to preserve if you touch this:

- **`webkitAudioDecodedByteCount` does not exist on current iOS.** It was the original design's proof
  (bytes reaching the decoder) but on-device testing showed `typeof` is `"undefined"`, so
  `audio_decoding` is `false` there and carries **no information**. `has_audio_track` (from
  `audioTracks`, which _is_ populated) is the field to read. Don't reintroduce a dependency on the
  counter.
- **`element_volume` is always `1` on iOS.** The platform ignores programmatic volume writes entirely
  (hardware buttons only), so `1` here does **not** mean our configured level failed to apply —
  compare `configured_volume` for intent.
- **Query `"video, audio"` and never filter on visibility or size.** The audio-ad path's element is
  `display: none` by design (a `<video>`, not `<audio>` — Chrome blocks muted autoplay on `<audio>`,
  and the audio media URL is loaded into a `<video>` for the same reason).
- **Don't substitute GenAd's `onVolumeChange`/`unmute_blocked` for the element read.** The SDK fires
  that callback _before_ writing the element, so it reports intent, not realised state — which is
  exactly the distinction this beacon exists to make.

`audio_track_source` exists so a `false` is never ambiguous between "no audio" and "couldn't tell" —
the distinction that cost several rounds of on-device debugging to establish. That is also why an
empty `audioTracks` is only reported as `audioTracks` once `readyState >= HAVE_METADATA`: before
metadata the list is legitimately empty on a creative that _does_ carry audio, so attributing it to
the creative would manufacture the exact false positive the field was added to prevent.

`forced_fill` reflects the feed **actually served**, not debug-device eligibility: a missing or
malformed fixture falls back to the real feed, and flagging that genuine fill would delete it from
every audibility rate (they all filter `not forced_fill`). Keep it sourced from
`didServeDebugDeviceFeed`, never from `isDebugDeviceFeed`.

Reachable host-side only because GenAd renders a real element into our container (no iframe) — true
for the Triton audio-VAST path, **not** for IMA (SDK-private element) or Aniview (cross-origin
iframe). Full rationale: [`../../docs/AUDIO_DIAGNOSTIC_PLAN.md`](../../docs/AUDIO_DIAGNOSTIC_PLAN.md).

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
