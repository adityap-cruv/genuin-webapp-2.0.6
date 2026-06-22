# `ads.ts` / `AdsLayer` — Known Caveats & Bugs

Reviewed: 2026-05-07  
Files: `ads.ts`, `registry.ts`, `video-player-v2.tsx`

---

## HIGH

### 2. Same `adUrl` + src swap → pre-roll skipped (user-confirmed)

**File:** `registry.ts:612`, `ads.ts:219`

Registry correctly clears `entry.currentAdUrl` on src change and re-calls `requestAd`. However
`AdsLayer.request()` deduplicates by its own `this.lastAdUrl`:

```ts
if (this.lastAdUrl === adUrl && this.adsManager) return; // ads.ts:219
```

The `AdsLayer` instance persists across src swaps; `lastAdUrl` is never reset between them.
If `adUrl` is the same for video A and video B, no ad plays for video B.

**Fix:** In `registry.ts → requestAd`, call `entry.adsLayer.destroy()` (which resets `lastAdUrl`)
and recreate the layer on every src swap, or expose a `reset()` method on `AdsLayer` that
clears `lastAdUrl` and destroys only the `AdsManager` (not the `AdsLoader`).

---

### 3. `onEnded` never fires when ads are active

**File:** `registry.ts:650–655`, `video-player-v2.tsx:305–308`

The registry's `allAdsCompleted` callback is a no-op:

```ts
allAdsCompleted: () => {
  // no-op
},
```

`video-player-v2.tsx` listens for a `"adsallAdsCompleted"` DOM event on `videoEl` to set
`playerStateRef.current.allAdsCompleted = true` and call `tryCallEnd`. That event is never
dispatched — it only exists in the V1 `use-ad-player.ts` path.

Result: `playerStateRef.current.allAdsCompleted` stays `false` forever when `adUrl` is set;
`onEnded` is never called. Feed advance, completion analytics, and post-roll UI all break.

**Fix:** In the registry's `allAdsCompleted` callback, dispatch a `"adsallAdsCompleted"`
`CustomEvent` on `entry.videoEl`.

---

### 4. `play` in layout-effect deps → re-claim on pause restarts ads

**File:** `video-player-v2.tsx:220`

```ts
}, [src, play, isActive]); // layout effect deps
```

The comment above says "only re-run when src changes", but `play` is in the array.
Every pause/play toggle triggers: `release` → freeze-frame capture → `claim` → `applyOpts`
→ `requestAd` → pre-roll restart. The `apply` effect at line 224 already forwards `play`
changes — including `play` in the layout-effect deps is incorrect.

**Fix:** Remove `play` from the layout-effect dependency array.

---

### 5. Race: async IMA load + rapid src swap → zombie `AdsManager`

**File:** `ads.ts:218–265`, `registry.ts:677–692`

`AdsLayer.request()` suspends at `await ensureInitialized()` while IMA SDK loads.
During suspension a second src swap can trigger a second `requestAd` call. The second call
reuses the same `AdsLayer` (not null yet). Both async continuations resume, both call
`adsLoader.requestAds()` → two `ADS_MANAGER_LOADED` events → second overwrites
`this.adsManager`; first `AdsManager` is still playing and never gets destroyed (zombie).

**Fix:** Track an in-flight request token inside `AdsLayer.request()`. On re-entry, cancel
the prior in-flight request before calling `requestAds` again.

---

### 6. `restoreCustomPlaybackStateOnAdBreakComplete: true` + explicit resume callback → double `play()`

**File:** `ads.ts:270`, `registry.ts:637–646`

With custom playback, `restoreCustomPlaybackStateOnAdBreakComplete = true` causes IMA to
internally call `videoEl.play()` on `CONTENT_RESUME_REQUESTED`. The registry also registers
a `contentResumeRequested` callback that calls `entry.videoEl.play()`. Both fire for the
same event → two sequential `play()` calls → spurious `play` events in analytics and a
potential `DOMException: play() interrupted` on iOS Safari.

**Fix:** Set `restoreCustomPlaybackStateOnAdBreakComplete = false` since the registry
handles resume explicitly.

---

## MEDIUM

### 7. `imaPromise` permanently poisoned after transient load failure

**File:** `ads.ts:97`, `ads.ts:110`, `ads.ts:147`

```ts
let imaPromise: Promise<ImaNamespace | null> | null = null;
// ...
if (imaPromise) return imaPromise; // fast-path, never clears on failure
```

On `script.onerror`, `imaPromise` resolves to `null` but is never reset. Any subsequent
`loadImaSdk()` call returns the null-resolving promise forever. One CDN blip at startup →
ads disabled for the entire session with no retry path.

**Fix:** On `onerror`, reset `imaPromise = null` before resolving, so the next call retries.

---

### 8. `adDisplayContainer.initialize()` called on every `request()` — violates IMA contract

**File:** `ads.ts:239`

IMA requires `AdDisplayContainer.initialize()` to be called exactly once, from a user gesture.
The code calls it inside every `request()` invocation (deferred via `requestAnimationFrame`,
which is not a user gesture context). On iOS Safari this resets the click-through overlay
state; click-through fails silently on ads after the first break.

**Fix:** Track whether `initialize()` has been called (a boolean flag on `AdsLayer`) and
call it only once.

---

### 9. No `resize()` calls → IMA renders at stale dimensions after layout changes

**File:** `ads.ts:330`, `registry.ts` (absence of `ResizeObserver`)

`AdsLayer.resize(width, height)` is implemented but never called. On orientation change,
window resize, or fullscreen toggle, IMA uses the slot dimensions captured at ad-request
time. Non-linear overlays are mispositioned; linear ad click boxes are misaligned.

**Fix:** Attach a `ResizeObserver` to `entry.adContainerEl` in `registry.ts` and call
`entry.adsLayer.resize(width, height)` on every size change.

---

## LOW

### 10. `console.log` of ad tag URL in production code

**File:** `video-player-v2.tsx:171`

```ts
console.log("[log] ad url changed::", { adUrl });
```

Ad tag URLs may contain campaign identifiers or targeting parameters. Leaking them to the
browser console in production violates the project's logging policy. Replace with a
structured logger or remove entirely.

---

## MEDIUM

### `onAdClicked` requires SDK click interception

**File:** `ads.ts` — `AdEvent.Type.CLICK` listener (Phase 3 commit).

IMA's `CLICK` event fires only when the SDK intercepts clicks via
`AdsRenderingSettings.useStyledLinearAds` / `useStyledNonLinearAds`. Current
`onAdsManagerLoaded` does not set these flags, so click-through analytics
(`AD_CTA_CLICKED` in `feed-player.tsx`) may be silent for direct creative
clicks on linear ads.

**Workaround:** enable `useStyledLinearAds = true` in `onAdsManagerLoaded` if
click attribution becomes a product requirement. Trade-off: SDK overlays a
styled CTA button which some VAST creatives forbid in their wrappers.

**Decision:** ship Phase 3 with listener wired but flag disabled; revisit when
click-through is prioritized.
