# Pending Things

---

## IMPROVEMENT-001: Expand → Embed view transition breaks layout (shared `<video>` element conflict)

> **DEFERRED 2026-05-27 — blocked on M3 of `VIDEO_ELEMENT_REUSE_PLAN.md`.**
> The doc's stated symptom ("embed slot is blank / layout broken") **did not
> reproduce** in a synthetic two-V2 Storybook harness (`ExpandEmbedTransition`
> in `video-player-v2.stories.tsx`). With both V2 instances mounted
> simultaneously, the registry's transient-mint path (Branch 2 in `claim`)
> works as designed: embed keeps the shared element + tag, expand gets a
> fresh transient — verified by ref-attach tags and snapshot inspection.
> The doc's bullets (b) and (c) about embed-being-emptied or
> `playerStateRef` cross-contamination are not what the code does — see
> the synthetic-harness analysis.
>
> **What the harness DID surface (separate concerns, not the original 001):**
>
> - **Transients have no ad layer.** `requestAd` is guarded by
>   `if (!entry.shared) return`, so the expand-during-embed-ad case can
>   never play the ad — at best raw content, desynchronized from the
>   embed's ad break. Architectural by current design; document or
>   redesign separately.
> - **Autoplay-with-sound on the expand transient is blocked by Chrome's
>   autoplay policy** unless a recent user gesture is in scope. Surfaces
>   as "expand stays totally blank during embed ad" in the harness when
>   `muted={false}`. Harness-only manifestation, but production-relevant
>   if expand auto-mounts mid-ad without a gesture.
>
> **Why deferred:** the original 001 symptom likely requires the production
> expand/embed remount path (route swap, modal portal stack) that fully
> unmounts the embed tree. That path doesn't exist yet — V2 is not wired
> to feed-player / comments/video / animated-tile. Per
> `VIDEO_ELEMENT_REUSE_PLAN.md` M3, those callers get migrated to V2 and
> the deferred V1 surfaces (ad/IMA, quartile callbacks, etc.) fold back
> in. Once M3 lands, 001 can be reproduced against the real transition
> and diagnosed properly — likely with the existing `ExpandEmbedTransition`
> story extended to fully unmount/remount the embed tree.
>
> The harness story (`ExpandEmbedTransition`) is committed and ready to
> reuse when M3 starts.

### Summary

When user opens expand view and then returns to embed view, the embed view layout breaks. Root cause: both views try to claim the single shared `<video>` / `containerEl` from the registry simultaneously (or in rapid succession), resulting in the element landing in the wrong slot or leaving the embed slot empty.

### Background

V2 uses **one shared `containerEl`** (wrapping `<video>` + IMA overlay) across the entire feed subtree. `VideoPlayerV2` reparents this element into its slot via `useLayoutEffect`. Only one slot can own the element at a time — simultaneous claims are handled by minting a transient entry (a fresh `<video>`, no reuse benefits).

### Condition

**Reproduces only while an ad is actively playing** at the moment the user transitions from expand → embed view. When no ad is in flight the transition completes cleanly.

### Steps to Reproduce

1. Open embed view (feed card with `VideoPlayerV2`). Wait for an ad to start playing.
2. While the ad is playing, tap to open expand view for the same clip.
3. Close expand view / navigate back to embed view.
4. Observe: embed view slot is blank / layout is broken.

### What Goes Wrong

| Step | What happens in the registry |
|---|---|
| Embed view mounts | `registry.claim(src)` → `refCount = 1`, `containerEl` reparented into embed slot |
| Expand view mounts | `refCount` already `1` → registry mints a **transient** entry (separate `<video>`) for expand view |
| Expand view unmounts | transient is **destroyed** (`destroyEntry`), not parked |
| Embed view's slot | still holds the original `containerEl` — but React may have re-rendered the embed slot during the transition, and the layout state driven by `VideoPlayerV2`'s own React state (sizing, poster, loading overlay) is now stale or detached |

The visual break can come from multiple sources:
- If embed `VideoPlayerV2` unmounts and remounts during the transition (route change, modal stack), the `useLayoutEffect` cleanup runs → `containerEl` goes to parking div → on remount, `claim` succeeds but the slot's CSS / sizing classes have reset.
- If expand view somehow claims the shared element first (race on fast open), embed slot is left empty for the duration of expand view being open, and on close the reparent may conflict with a stale React DOM tree.
- `playerStateRef` (quartile flags, `videoCompleted`) is per-`VideoPlayerV2` instance. When expand view creates a transient entry and the user watches part of the video there, closing expand view leaves the embed instance's `playerStateRef` out of sync — callbacks may misfire.

### Affected Files

- [video-player-v2.tsx](../video-player-v2.tsx) — `useLayoutEffect` claim/release and `apply` effect
- [registry.ts](../registry.ts) — `claim`, `release`, `park`, transient path
- Callers that render both embed and expand for the same `src` simultaneously

### Expected Behaviour

- Returning from expand → embed view restores the embed slot to the exact visual and playback state it had before expand opened.
- No blank slot, no layout reflow, no broken sizing.

### Notes / Constraints

- Transient entries are intentionally stateless (no unmute carry, no seek resume) — that's correct for the expand path. The bug is not about state loss on the transient; it's about the embed slot's DOM / React state breaking on the transition back.
- Any fix must keep `useLayoutEffect` for claim/release (required to avoid `NotFoundError` on iOS Safari — see [ARCHITECTURE.md](./ARCHITECTURE.md#why-uselayouteffect-not-useeffect-for-the-claimrelease)).
- This is M3 work — V2 is not yet wired to the embed / expand callers in production.

---

## IMPROVEMENT-002: Returning to an already-playing video reloads HLS chunks from the beginning

> **PARTIALLY RESOLVED 2026-05-27** — `registry.ts` makes resume position
> deterministic and eliminates back-buffer fill, but hls.js still fetches the
> first ~2 segments on swap-back regardless of every supported config knob.
>
> **What landed (real wins):**
>
> - `hls.config.startPosition` is set BEFORE `hls.loadSource()` so MANIFEST_PARSED
>   sees the authoritative resume offset.
> - `autoStartLoad: false` in `hlsConfig`; we explicitly call `hls.startLoad(pos)`
>   from a one-shot `'hlsManifestParsed'` listener registered before
>   `loadSource()` — eliminates the auto-start race.
> - `backBufferLength: 0` so hls.js never backfills behind the playhead. This
>   removed the dominant waste (default was 30s of back-fill).
> - `hls.stopLoad()` on swap-away preserves buffered segments near the swap
>   point. Fresh srcs reset `startPosition = -1` so no offset leaks.
> - `recoverUnsupportedSource` (IMA pre-roll recovery) also registers the
>   manifest-parsed listener — required under `autoStartLoad: false`.
> - Native HLS (Safari) is untouched. See `registry.ts` (`loadSource`,
>   `swapSrc`, `recoverUnsupportedSource`, `hlsConfig`, `HlsLike` interface)
>   and the IMPROVEMENT-002 tests in `registry.test.ts`.
>
> **What is still NOT solved:** in Chrome with hls.js, the first ~2 segments
> (0 and 1) are still fetched at full size on swap-back before playback
> resumes at the stored offset. Pattern: `0 → 1 → 10 → 11 → …`. Verified via
> DevTools Network — full segment sizes, not cache hits. All standard hls.js
> levers (`startLoad`, `config.startPosition`, `autoStartLoad: false`,
> `backBufferLength: 0`, `startFragPrefetch: false`) were exhausted. The
> remaining ~1 MB-per-swap-back waste appears to be a hls.js architectural
> floor — likely a manifest/variant probe that bypasses the start-load path.
>
> **Path to a true zero-waste fix:** maintain a SEPARATE hls.js instance per
> src + swap the `<video>`'s `srcObject` between them, so the manifest is
> never re-loaded on swap-back. Multi-day rework. Not started.

### Summary

When the user navigates away from a playing video and returns to it, the video resumes playback at the correct `currentTime` visually, but the network tab shows HLS segments being fetched from the start of the stream (byte-range 0 / earliest segment). Wasted bandwidth and a potential stutter on resume.

### Background

The registry preserves `currentTime` per URL via `storedTimes: Map<url, currentTime>`. On `swapSrc`, the stored time is written; on `claim` / `swapSrc` back to the same URL, a seek is scheduled via `pendingSeeks` and applied in the `loadedmetadata` handler. The seek is correct from the `<video>` element's perspective — but `hls.js` is a separate layer that maintains its own internal buffer and segment download queue, and seeking the `<video>` element after `hls.loadSource()` does **not** tell `hls.js` to start fetching from that position.

### Steps to Reproduce

1. Open a feed. Let a video play past the 10-second mark.
2. Swipe away to another video (triggers `swapSrc` → `storedTimes` saves position).
3. Swipe back to the original video (triggers `swapSrc` back → `pendingSeeks` schedules seek to saved time).
4. Open DevTools → Network tab, filter by `.ts` / `.m4s` / `segment`.
5. Observe: first segment fetched is from t=0, not from the resume position.

### What Goes Wrong

```
swapSrc(entry, originalUrl)
  hls.loadSource(originalUrl)     ← hls.js starts buffering from segment 0
  pendingSeeks.set(url, 12.4)     ← seek scheduled
  ...
  loadedmetadata fires
  videoEl.currentTime = 12.4      ← video element seeks to 12.4s
                                  ← hls.js receives seeked event and may re-request
                                     segments near 12.4s, but segments 0–12s were
                                     already requested and partially downloaded
```

`hls.loadSource()` always resets the internal fragment loader to position 0. The `currentTime` seek happens after `loadedmetadata`, which is too late — hls.js has already started fetching from the beginning. The correct approach is to call `hls.startLoad(startPosition)` with the resume position **before** hls.js begins fetching, or use `hls.config.startPosition` on the `loadSource` call.

### Expected Behaviour

- On swipe-back, hls.js fetches segments starting at (or just before) the stored `currentTime`.
- Segments from t=0 to resume position are **not** requested.
- No visible stutter on resume beyond normal seek buffering.

### Affected Files

- [registry.ts](../registry.ts) — `swapSrc` / `loadSource` call site and `pendingSeeks` / `loadedmetadata` handler

### Notes / Constraints

- `hls.startLoad(position)` must be called **after** `hls.loadSource()` but **before** the first segment request fires. The window is tight — `loadSource` triggers an async fetch of the manifest; `startLoad` with a position hint must be set before that completes.
- Native HLS path (Safari) is unaffected — `videoEl.src = url` + `videoEl.currentTime = pos` after `loadedmetadata` is the correct native sequence and Safari handles it without re-fetching from 0.
- `hls.js` `startPosition` config option is set once at `Hls` construction time and does not apply per-`loadSource` call — so the fix must use `hls.startLoad(pos)` dynamically, not a constructor option.
- Already-buffered segments near the seek point should be retained by hls.js's buffer if `hls.stopLoad()` is called before `loadSource` on the swap-away path (worth evaluating as part of the fix).

---

## IMPROVEMENT-003: Ad play/pause not in sync with external player play/pause

> **RESOLVED 2026-05-27 (initial)** — `registry.ts` forwarded external
> play/pause to `adVideoEl` during an ad break and tracked a `pendingPause` flag.
>
> **CORRECTED 2026-05-27** — the `adVideoEl` approach was the **wrong layer** and
> did not work in the browser: IMA renders and drives a linear ad through its
> `AdsManager`, not through the raw `adVideoEl`. Calling `adVideoEl.pause()` does
> not stop an IMA ad — the SDK keeps its own playback timer and re-asserts
> control, so the external Play/Pause button appeared to do nothing. (This is
> consistent with how mute/volume already route through `AdsManager.setVolume`,
> never through `adVideoEl.muted` — pause/resume was the lone inconsistent path.)
>
> The note below claiming "the fix should call `adVideoEl.pause()` … not add a
> new AdsLayer API" was **incorrect**. The real fix adds minimal
> `AdsLayer.pause()` / `AdsLayer.resume()` methods that call
> `AdsManager.pause()` / `.resume()`, and `applyOpts` now calls
> `entry.adsLayer?.pause()/resume()` during an ad break. The `pendingPause` flag
> and `resumeContent` logic are unchanged. See `ads.ts`
> (`AdsLayer.pause`/`resume`, `ImaAdsManager.pause`/`resume`), `registry.ts`
> (`applyOpts` play branch), and `registry.test.ts` (IMPROVEMENT-003 block).
>
> **Knock-on:** the "player becomes unclickable after the first click" symptom
> was a *consequence* of this bug — because the ad never truly paused, IMA never
> fired `CONTENT_RESUME_REQUESTED`/`ALL_ADS_COMPLETED`, so `resumeContent()`
> never ran and the ad overlay (`adContainerEl`, `pointerEvents:auto`,
> `display:block`) stayed mounted over the content, swallowing every subsequent
> click. Routing through the AdsManager lets the ad lifecycle complete normally,
> which restores the overlay teardown.

### Summary

When the external caller flips `play=false` (e.g. user taps pause, feed card goes off-screen, app backgrounds) while an ad break is active, the ad continues playing. Conversely, when `play=true` resumes, if an ad was mid-break the content video may try to play alongside the ad.

### Background

`applyOpts` in [registry.ts](../registry.ts) guards content video play/pause behind `!entry.adIsPlaying`:

```ts
if (opts.play !== undefined && !entry.adIsPlaying) {
  if (opts.play) playVideoEl(entry);
  else videoEl.pause();
}
```

This correctly prevents `playVideoEl` from fighting IMA during an ad break. But it has no symmetrical path for the **ad video** — when `opts.play === false` arrives during an active ad break, `adVideoEl` is never paused. The guard silently swallows the pause signal instead of forwarding it to the ad.

### Steps to Reproduce

1. Let a pre-roll ad start playing (`contentPauseRequested` fires → `adIsPlaying = true`).
2. Externally set `play=false` on `VideoPlayerV2` (e.g. swipe card off-screen, tab blur, caller prop flip).
3. Observe: `adVideoEl` keeps playing audio/video. Content `videoEl` is already paused (IMA did that). No visible pause happens.
4. Set `play=true` again — `playVideoEl` is skipped (guard fires), ad resumes from where it was, but if IMA already fired `CONTENT_RESUME_REQUESTED` during the pause window the content video may try to play simultaneously.

### What Goes Wrong

```
opts.play = false arrives while adIsPlaying = true
  → guard: !entry.adIsPlaying === false → entire block skipped
  → adVideoEl.pause() never called
  → ad plays on in background
```

The `resumeContent` / `contentResumeRequested` path also doesn't consult the current `play` prop — it unconditionally calls `playVideoEl(entry)`, so if the caller had set `play=false` before IMA finished, content resumes without the caller's consent.

### Expected Behaviour

- `play=false` during an ad break: pause `adVideoEl` immediately; store a `pendingPause` flag so `resumeContent` knows not to auto-play content when the ad eventually ends.
- `play=true` while ad was externally paused: resume `adVideoEl`; clear `pendingPause`.
- `resumeContent` must consult `pendingPause` before calling `playVideoEl` — if caller wants pause, leave content paused.

### Affected Files

- [registry.ts](../registry.ts) — `applyOpts` play/pause branch (line ~706), `resumeContent` function, `RegistryEntry` type (needs `pendingPause: boolean` field)

### Notes / Constraints

- ~~`adVideoEl` is a separate `<video>` from `videoEl`. IMA drives it directly. Pausing `adVideoEl` externally mid-ad is safe — IMA does not monitor `adVideoEl.paused` to decide lifecycle; it drives play/pause via its own `AdsManager`. Pausing and resuming `adVideoEl` around an external pause signal does not corrupt the IMA ad timeline.~~ **WRONG** (see CORRECTED note above): IMA *does* drive playback via the `AdsManager`'s own timer; pausing `adVideoEl` does not stop the ad. The `AdsManager` is the authority.
- ~~`AdsLayer` has no `pause()` / `resume()` public method today — the fix should call `adVideoEl.pause()` / `adVideoEl.play()` directly in `applyOpts`, not add a new AdsLayer API, to keep the change minimal.~~ **WRONG**: a new minimal `AdsLayer.pause()` / `resume()` (delegating to `AdsManager.pause()`/`.resume()`) is exactly what was needed and is the implemented fix.
- On iOS Safari, `adVideoEl.play()` requires a user gesture if the element has been paused. Resuming an externally paused ad after a short background-then-foreground may be blocked by autoplay policy. Document this as a known edge case rather than trying to work around it.

---

## AUDIT: Analytics / Tracking Events — What We Send and What Needs Verification

> For devs reviewing analytics coverage: every event below is dispatched as a DOM `CustomEvent` on the shared `<video>` element (via the imperative ref). Consumers call `videoEl.addEventListener(eventName, handler)`. Two global window events also exist (IMA SDK load failures).
>
> **What to check:** confirm each event fires at the right moment, carries the right payload, and is actually consumed (subscribed to) by the caller (`feed-player`, `comments/video`, analytics layer, etc.). Events listed below but missing a consumer = silent drop.

---

### Native Browser Events (pass-through, no wrapping)

These fire directly on `<video>` — V2 does not re-dispatch them. Consumers subscribe to the raw element.

| Event | When | Payload |
|---|---|---|
| `play` | `videoEl.play()` called | none |
| `pause` | `videoEl.pause()` called | none |
| `playing` | actual playback starts after buffering | none |
| `ended` | content stream ends (pre-post-roll gate) | none |
| `seeked` | seek completes | none |
| `timeupdate` | ~4× per second during playback | none |
| `volumechange` | mute / volume change | none |
| `loadstart` | new src begins loading | none |
| `loadedmetadata` | duration / dimensions available | none |

---

### Synthesized CustomEvents (V2-dispatched on `<video>`)

These are dispatched by `VideoPlayerV2` itself. Verify listeners exist on the consumer side for each.

| Event | When | `detail` shape | File |
|---|---|---|---|
| `genuin:player-ready` | registry `claim` completed; element attached to slot | `{}` | [video-player-v2.tsx:134](../video-player-v2.tsx#L134) |
| `genuin:video-start` | first `playing` event after `play=true` prop; latency measured from prop flip to first frame | `{ duration: number, currentTime: number, latency: number }` | [video-player-v2.tsx:192](../video-player-v2.tsx#L192) |
| `genuin:quartile-first` | 25% of duration watched | `{ duration: number, currentTime: number }` | [video-player-v2.tsx:244](../video-player-v2.tsx#L244) |
| `genuin:quartile-mid` | 50% of duration watched | `{ duration: number, currentTime: number }` | [video-player-v2.tsx:246](../video-player-v2.tsx#L246) |
| `genuin:quartile-third` | 75% of duration watched | `{ duration: number, currentTime: number }` | [video-player-v2.tsx:248](../video-player-v2.tsx#L248) |
| `genuin:quartile-watched` | 100% of duration watched | `{ duration: number, currentTime: number }` | [video-player-v2.tsx:250](../video-player-v2.tsx#L250) |
| `genuin:content-ended` | post-roll-gated end of stream; fires **once per playback pass** | `{}` | [video-player-v2.tsx:173](../video-player-v2.tsx#L173) |
| `genuin:mute-change` | mute state changes (derived from native `volumechange`) | `{ muted: boolean }` | [video-player-v2.tsx:209](../video-player-v2.tsx#L209) |

**Quartile flag reset:** flags reset on `src` / `adUrl` change. They also reset when user seeks backward past a fired quartile boundary (so the quartile re-fires on the next pass). Confirm callers de-dupe if they don't want double-fires on backward seek.

---

### Ad CustomEvents (AdsLayer-dispatched on `<video>`)

Dispatched by `AdsLayer` via `this.emit()` → `contentVideoEl.dispatchEvent(new CustomEvent(...))`. Source: [ads.ts:524–586](../ads.ts#L524).

All ad events carry an `AdDetail` payload (or `{}` for events with no IMA `Ad` object):

```ts
// AdDetail — ads.ts:145
type AdDetail = {
  adId: string | null;
  url: string | null;           // ad media URL
  title: string | null;
  adFormat: string | null;
  advertiserBrandId: string | null;
  campaignId: string | null;
  lineItemId: string | null;
  creativeId: string | null;
  mediaType: string | null;
  totalAds: number;
  currentAdIndex: number;
};
```

| Event | When | `detail` shape |
|---|---|---|
| `genuin:ad-requested` | just before `adsLoader.requestAds()` | `{ adTagUrl: string }` |
| `genuin:ad-response-received` | IMA `ADS_MANAGER_LOADED` fires | `{}` |
| `genuin:ad-request-failed` | `AD_ERROR` fires before AdsManager exists | `{ message: string, code: number }` |
| `genuin:ad-rendered` | IMA `AdEvent.LOADED` | `AdDetail` |
| `genuin:ad-started` | IMA `AdEvent.STARTED` | `AdDetail` |
| `genuin:ad-impression` | IMA `AdEvent.IMPRESSION` | `AdDetail` |
| `genuin:ad-first-quartile` | IMA `AdEvent.FIRST_QUARTILE` | `AdDetail` |
| `genuin:ad-pause` | IMA `AdEvent.PAUSED` | `AdDetail` |
| `genuin:ad-clicked` | IMA `AdEvent.CLICK` (unreliable on iOS — IMA suppresses it) | `AdDetail` |
| `genuin:ad-skipped` | IMA `AdEvent.SKIPPED` | `AdDetail` |
| `genuin:ad-completed` | IMA `AdEvent.COMPLETE` (single ad done) | `AdDetail` |
| `genuin:ad-all-completed` | IMA `AdEvent.ALL_ADS_COMPLETED` (full pod done) | `{}` |
| `genuin:ad-error` | any `AD_ERROR` (pre- or post-manager) | `{ message: string, code: number }` |

---

### Global Window Events (IMA SDK load failures)

Dispatched on `window`, not on the `<video>` element. Only relevant if IMA SDK itself fails to load.

| Event | When | `detail` |
|---|---|---|
| `video-registry:ad-error` | `ima3.js` loaded but `window.google.ima` missing | `{ message: string, code: -2 }` |
| `video-registry:ad-error` | `ima3.js` script `onerror` (CSP block / network) | `{ message: string, code: -3 }` |

---

### What Needs to Be Checked

- [ ] **`genuin:player-ready` consumer exists?** — verify `feed-player` / `comments/video` listens and uses it (e.g. to show/hide loading state). If no listener: event is a silent no-op.
- [ ] **`genuin:video-start` latency value** — `latency` is measured from when `play=true` prop lands to first `playing` event. Confirm the measurement start point is reset correctly on each new `src` claim, not carried over from a previous video on the shared element.
- [ ] **Quartile double-fire on backward seek** — flags reset on backward seek so quartiles re-fire. Confirm analytics layer de-dupes or intentionally counts them again.
- [ ] **`genuin:content-ended` vs native `ended`** — callers must use `genuin:content-ended`, NOT native `ended`, for "video finished" analytics. Native `ended` fires before the post-roll; `genuin:content-ended` fires after. Using `ended` directly will double-count or mistime the event when a post-roll is present.
- [ ] **`genuin:ad-clicked` reliability** — IMA suppresses the `CLICK` event on iOS Safari in most in-app browsers. Do not rely on it for billing-critical click tracking; use a separate click-through URL ping if needed.
- [ ] **`AdDetail` nullable fields** — all fields except `totalAds` / `currentAdIndex` are `string | null`. Callers must null-check before sending to analytics backends that require non-null strings.
- [ ] **`genuin:ad-error` vs `genuin:ad-request-failed`** — `ad-request-failed` fires only on pre-manager errors (before IMA AdsManager is created). `ad-error` fires on ALL errors. Do not double-count by listening to both for the same error condition.
- [ ] **Window-level `video-registry:ad-error`** — only fires for IMA SDK load failure, not for normal ad errors. Confirm there is a global listener for this in the app shell; otherwise IMA load failures are completely silent.
