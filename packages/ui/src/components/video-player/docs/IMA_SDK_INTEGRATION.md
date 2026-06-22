# IMA SDK Integration — Architecture & Implementation Plan

**Last updated:** 2026-05-13  
**Files:** `packages/ui/src/components/video-player/ads.ts`, `registry.ts`, `video-player-v2.tsx`  
**Related:** `docs/architecture/ARCHITECTURE.md`, `packages/ui/src/components/video-player/docs/ADS_CAVEATS.md`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Constraints That Shaped the Design](#2-constraints-that-shaped-the-design)
3. [Component Map](#3-component-map)
4. [Current Implementation — How It Works](#4-current-implementation--how-it-works)
   - 4.1 [SDK Loading](#41-sdk-loading)
   - 4.2 [AdsLayer Class](#42-adslayer-class)
   - 4.3 [Registry Integration](#43-registry-integration)
   - 4.4 [VideoPlayerV2 Wiring](#44-videoplayerv2-wiring)
   - 4.5 [Element Topology](#45-element-topology)
   - 4.6 [Lifecycle — Cold Start to Content Resume](#46-lifecycle--cold-start-to-content-resume)
   - 4.7 [Src-Swap Lifecycle](#47-src-swap-lifecycle)
5. [Known Issues & Required Fixes](#5-known-issues--required-fixes)
6. [Remaining Work — Implementation Plan](#6-remaining-work--implementation-plan)
   - 6.1 [P0 — Correctness (must fix before production)](#61-p0--correctness-must-fix-before-production)
   - 6.2 [P1 — Feature Parity with V1](#62-p1--feature-parity-with-v1)
   - 6.3 [P2 — Hardening](#63-p2--hardening)
7. [CSP Requirements](#7-csp-requirements)
8. [Testing Checklist](#8-testing-checklist)
9. [Decision Log](#9-decision-log)

---

## 1. Overview

The Genuin video player supports VAST and VMAP ad playback via Google's Interactive Media
Ads (IMA) SDK (`ima3.js`). The integration is built around the **registry-backed shared
`<video>` architecture** introduced in V2 of the player.

The IMA layer sits alongside the shared `<video>` element as a parallel DOM structure. It
never touches `videoEl` directly for playback; instead it drives a dedicated `adVideoEl`
and signals the registry when to pause or resume the content video. This design avoids the
play/pause race condition that occurs when IMA and the registry both try to control the same
`<video>`.

**What is implemented today:**

- Lazy-loaded `ima3.js` (one load, module-scoped promise)
- `AdsLayer` class: `AdDisplayContainer`, `AdsLoader`, `AdsManager` lifecycle management
- VAST pre-roll and VMAP schedule support
- Content pause/resume handoff between IMA and the registry
- `resetForNewContent()` — recycles `AdsManager` + `AdsLoader` without destroying `AdDisplayContainer` on src swap
- Deduplication guard: same `adUrl` + same `adsManager` → no duplicate request
- Error fallback: any ad error resumes content immediately

**What is not yet implemented (P0/P1):**

- Ad event callbacks surfaced to consumers (`onAdStarted`, `onAdCompleted`, `onAdSkipped`, `onAdClicked`, `onAdImpression`)
- `ResizeObserver` for `adContainerEl` → `adsLayer.resize()` on layout change
- Retry on transient IMA SDK load failure
- Request cancellation token inside `AdsLayer.request()` (zombie `AdsManager` guard)
- `onEnded` coordination when ads are active

---

## 2. Constraints That Shaped the Design

### iOS Safari — one `<video>` element, forever

iOS Safari grants "unmuted autoplay" permission to a specific `HTMLVideoElement` instance
the moment a user gestures on it. Destroying and recreating the element (which V1 did on
every swipe) drops that permission. V2 keeps one `<video>` alive for the entire session
and reparents it on each swipe.

**IMA consequence:** `AdDisplayContainer` holds a reference to the container element and the
`video` element at construction time. These references must remain stable. This is why
`AdDisplayContainer` is created once per registry entry and never recreated, while
`AdsManager` (per-ad-request) and `AdsLoader` (per-content-lifecycle) are recycled.

### IMA `AdDisplayContainer.initialize()` must be called from a user gesture

IMA requires `initialize()` to be called exactly once per `AdDisplayContainer` from a
user-gesture context. On autoplay-permitted pages (muted + `playsinline`) this can be
deferred to the first `request()` call. It must never be called a second time — IMA throws
on some SDK versions. The `adDisplayContainerInitialized` flag on `AdsLayer` enforces this.

### IMA `AdsLoader.requestAds()` is terminal after `contentComplete()`

Once `contentComplete()` is called on an `AdsLoader`, subsequent `requestAds()` calls are
silently no-ops. The only way to request an ad for new content after calling
`contentComplete()` is to create a **new `AdsLoader`** against the existing
`AdDisplayContainer`. This is what `resetForNewContent()` does.

### `adVideoEl` is separate from `videoEl` by design

A single `<video>` under IMA's `AdDisplayContainer` causes IMA to control the element's
`src`, `play()`, and `pause()` directly. That would race with the registry's own
`swapSrc()` and `playVideoEl()` calls. Using a dedicated `adVideoEl` gives IMA full
ownership of its element and eliminates the race entirely.

---

## 3. Component Map

```
packages/ui/src/components/video-player/
├── ads.ts                  ← AdsLayer class + loadImaSdk()
├── registry.ts             ← VideoRegistry: requestAd(), resumeContent(), destroyEntry()
├── video-player-v2.tsx     ← Consumer: passes adUrl to registry, handles onEnded coordination
├── video-element-provider.tsx  ← React Context exposing VideoRegistry
├── sample-ad-tags.ts       ← Dev/QA VAST + VMAP tag URLs (not for production)
└── docs/
    ├── ADS_CAVEATS.md      ← Known bugs with reproduction notes
    └── ARCHITECTURE.md     ← Broader player architecture
```

---

## 4. Current Implementation — How It Works

### 4.1 SDK Loading

```
loadImaSdk()                         [ads.ts:106]
│
├── window.google.ima already present? → resolve immediately
├── imaPromise already in-flight?     → return same promise (dedup)
└── else: append <script src="ima3.js"> to document.head
       onload  → resolve with window.google.ima  (or null if missing)
       onerror → dispatch "video-registry:ad-error" CustomEvent, resolve null
```

`imaPromise` is module-scoped. Only one script tag is ever injected per page, regardless of
how many `AdsLayer` instances exist. Callers that receive `null` treat ads as disabled and
let content play normally.

**Known issue (P2):** On `onerror`, `imaPromise` keeps the null-resolving promise forever.
A transient CDN blip at startup permanently disables ads for the session. See §5.7.

### 4.2 AdsLayer Class

`AdsLayer` [ads.ts:166] is constructed once per `RegistryEntry` on the first claim that
supplies an `adUrl`. It owns three IMA objects across its lifetime:

| Object | Lifecycle | Notes |
|---|---|---|
| `AdDisplayContainer` | One per `AdsLayer` | Never recreated; references container + video elements |
| `AdsLoader` | One per content item | Recreated in `resetForNewContent()` — `contentComplete()` makes it terminal |
| `AdsManager` | One per ad request | Destroyed + replaced on every new `request()` or on error |

**Key methods:**

- `ensureInitialized()` — idempotent; loads SDK, creates `AdDisplayContainer` + `AdsLoader` on first call
- `request(adUrl, width, height)` — tears down prior `AdsManager`, calls `adsLoader.requestAds()`
- `resetForNewContent()` — for src swaps: destroys `AdsManager` + `AdsLoader`, creates fresh `AdsLoader`, clears `lastAdUrl`
- `reset()` — clears `lastAdUrl` + destroys `AdsManager` only (keeps `AdsLoader` alive)
- `resize(width, height)` — forwards to `adsManager.resize()` if active
- `destroy()` — tears down everything; sets `destroyed = true` to guard async callbacks

**Event flow inside `AdsLayer`:**

```
adsLoader: ADS_MANAGER_LOADED
  └─ onAdsManagerLoaded()
       ├─ getAdsManager(adVideoEl, renderingSettings)
       ├─ register CONTENT_PAUSE_REQUESTED  → events.contentPauseRequested()
       ├─ register CONTENT_RESUME_REQUESTED → events.contentResumeRequested()
       ├─ register ALL_ADS_COMPLETED        → events.allAdsCompleted()
       ├─ register AD_ERROR (manager-level) → onAdError()
       ├─ adsManager.init(w, h, ViewMode.NORMAL)
       └─ adsManager.start()

adsLoader: AD_ERROR (loader-level)
  └─ onAdError()
       ├─ events.adError({ message, code })
       └─ adsManager.destroy()
```

### 4.3 Registry Integration

`requestAd()` [registry.ts:662] is called from `applyOpts()` whenever `opts.adUrl` differs
from `entry.currentAdUrl`. It:

1. Stores `adUrl` on `entry.currentAdUrl` immediately (guards re-entry)
2. If `adUrl` is `undefined` → destroys `adsLayer`, sets it to `null`
3. Creates `AdsLayer` if `entry.adsLayer` is `null`, wiring four callbacks:
   - `contentPauseRequested` → sets `entry.adIsPlaying = true`, shows `adVideoEl`, pauses `videoEl`
   - `contentResumeRequested` → calls `resumeContent()`: clears `adIsPlaying`, hides `adVideoEl`, restores mute state, calls `playVideoEl()`
   - `allAdsCompleted` → calls `resumeContent()` _(no event dispatch yet — see §5.3)_
   - `adError` → calls `resumeContent()`, dispatches `"video-registry:ad-error"` on `window`
4. Makes `adContainerEl` visible (`display: block`) so `clientWidth/Height` are non-zero
5. Calls `entry.adsLayer.request(adUrl, w, h)` inside `requestAnimationFrame` so layout has
   settled before reading slot dimensions

`resumeContent()` [registry.ts:603]:

```ts
entry.adIsPlaying = false;
entry.adContainerEl.style.display = 'none';
entry.adVideoEl.style.display = 'none';
entry.videoEl.muted = entry.userState.muted;
playVideoEl(entry);
```

`playVideoEl()` guards against calling `play()` while `adIsPlaying` is true, preventing
IMA's `CONTENT_PAUSE_REQUESTED` from racing with an already-queued `play()`.

### 4.4 VideoPlayerV2 Wiring

`VideoPlayerV2` [video-player-v2.tsx] currently hardcodes `adUrl` to `SAMPLE_AD_TAGS.VMAP_PRE_ROLL`
for development. In production this must be removed and the prop threaded from the caller.

The component handles the `onEnded` coordination gate [video-player-v2.tsx:215–220]:

```ts
// onEnded fires only when BOTH conditions are true:
videoCompleted && allAdsCompleted
```

When `adUrl` is set, `allAdsCompleted` starts as `false`. It becomes `true` when the
`"adsallAdsCompleted"` DOM event fires on `videoEl`. **This event is currently never
dispatched** — see §5.3.

### 4.5 Element Topology

```
containerEl  [data-video-registry-container]
├── videoEl          <video>   ← content, registry-driven
└── adContainerEl    <div>     [data-video-registry-ads] position:absolute inset:0
    │                          display:none by default; block when ad active
    ├── adVideoEl    <video>   ← IMA-driven; display:none until CONTENT_PAUSE_REQUESTED
    └── [IMA DOM]              ← IMA SDK injects click overlays, skip button, etc. here
```

`adContainerEl` has `pointer-events: none` by default. IMA's own injected DOM enables
pointer events on its interactive subtree (skip button, click-through) when an ad renders.

### 4.6 Lifecycle — Cold Start to Content Resume

```
registry.claim(src, { adUrl }, slotEl)
  │
  ├─ ensureShared() → creates containerEl / videoEl / adContainerEl / adVideoEl
  │
  └─ applyOpts() → requestAd(entry, adUrl)
       │
       ├─ new AdsLayer(adContainerEl, adVideoEl, { contentPauseRequested, ... })
       ├─ adContainerEl.style.display = 'block'
       └─ requestAnimationFrame →
            ├─ AdsLayer.request(adUrl, w, h)
            │    ├─ ensureInitialized() → loadImaSdk() → new AdDisplayContainer, AdsLoader
            │    └─ adsLoader.requestAds(adsRequest)
            │
            └─ [async] ADS_MANAGER_LOADED
                  ├─ new AdsManager(adVideoEl, settings)
                  ├─ adsManager.init(w, h, NORMAL)
                  └─ adsManager.start()
                       │
                       ├─ CONTENT_PAUSE_REQUESTED
                       │    ├─ entry.adIsPlaying = true
                       │    ├─ adVideoEl.style.display = 'block'
                       │    └─ videoEl.pause()
                       │
                       │    [ad plays on adVideoEl]
                       │
                       └─ CONTENT_RESUME_REQUESTED / ALL_ADS_COMPLETED
                            └─ resumeContent()
                                 ├─ entry.adIsPlaying = false
                                 ├─ adContainerEl.style.display = 'none'
                                 ├─ adVideoEl.style.display = 'none'
                                 └─ playVideoEl(entry)   ← content resumes
```

### 4.7 Src-Swap Lifecycle

On every content `src` change, `applyOpts()` [registry.ts:614–626]:

1. Detects `srcChanged`
2. Calls `swapSrc(entry, newSrc)`
3. Clears `entry.currentAdUrl = undefined`
4. Calls `entry.adsLayer?.resetForNewContent()`

`resetForNewContent()` [ads.ts:379]:

```
destroy current AdsManager
destroy current AdsLoader          ← contentComplete() would make it terminal
new AdsLoader(adDisplayContainer)  ← fresh listener registration
lastAdUrl = undefined              ← allows same adUrl to trigger new request
```

Then `requestAd()` fires again with the same or new `adUrl`, requesting a fresh pre-roll
against the new content.

---

## 5. Known Issues & Required Fixes

See `docs/ADS_CAVEATS.md` for reproduction notes. Summary by priority:

| # | Severity | Issue | Location |
|---|---|---|---|
| 1 | P0 | `onEnded` never fires when `adUrl` set — `"adsallAdsCompleted"` never dispatched | registry.ts:685, video-player-v2.tsx:284 |
| 2 | P0 | `play` in layout-effect deps → re-claim on every pause restarts ads | video-player-v2.tsx:220 |
| 3 | P0 | Same `adUrl` + src swap → pre-roll skipped (`lastAdUrl` not reset) | ads.ts:219, registry.ts:612 |
| 4 | P1 | Race: async IMA load + rapid src swap → zombie `AdsManager` | ads.ts:218–265 |
| 5 | P1 | `restoreCustomPlaybackStateOnAdBreakComplete: true` → double `play()` | ads.ts:270 |
| 6 | P1 | No `ResizeObserver` → IMA renders at stale dimensions after layout changes | registry.ts (absent) |
| 7 | P2 | `imaPromise` poisoned on transient load failure — no retry | ads.ts:97 |
| 8 | P0 | `adUrl` hardcoded to SAMPLE tag in `VideoPlayerV2` | video-player-v2.tsx:87 |

---

## 6. Remaining Work — Implementation Plan

### 6.1 P0 — Correctness (must fix before production)

#### Task 1 — Remove hardcoded `SAMPLE_AD_TAGS` from `VideoPlayerV2`

**File:** `packages/ui/src/components/video-player/video-player-v2.tsx:87`

```ts
// Remove this line:
adUrl = SAMPLE_AD_TAGS.VMAP_PRE_ROLL;
```

`adUrl` is already a prop via `PlayerProps`. Callers that want ads pass the tag URL; callers
that don't want ads pass `undefined`. Remove the import of `SAMPLE_AD_TAGS` from this file.
Keep `sample-ad-tags.ts` for the test/dev page.

---

#### Task 2 — Fix `onEnded` coordination: dispatch `"adsallAdsCompleted"` from registry

**File:** `packages/ui/src/components/video-player/registry.ts:685`

In `requestAd()`, the `allAdsCompleted` callback currently calls `resumeContent()` but does
not notify `VideoPlayerV2` that ads are done. The component gate at
`video-player-v2.tsx:215–220` waits for `playerStateRef.current.allAdsCompleted` to become
`true`, which is set by a `"adsallAdsCompleted"` DOM event listener on `videoEl`.

Change the `allAdsCompleted` callback from:

```ts
allAdsCompleted: () => {
  resumeContent(entry);
},
```

to:

```ts
allAdsCompleted: () => {
  resumeContent(entry);
  entry.videoEl.dispatchEvent(new CustomEvent('adsallAdsCompleted'));
},
```

No changes needed in `video-player-v2.tsx` — the listener is already registered.

---

#### Task 3 — Remove `play` from layout-effect dependency array

**File:** `packages/ui/src/components/video-player/video-player-v2.tsx:186`

```ts
// Before:
}, [src, play, isActive]);

// After:
}, [src, isActive]);
```

The `apply` effect at line 191 already forwards `play` changes to the registry. Including
`play` in the layout-effect deps causes `release → claim` on every pause, which tears down
the `AdsManager` and restarts the pre-roll.

---

#### Task 4 — Fix same-`adUrl` dedup across src swaps

**Problem:** `AdsLayer.request()` [ads.ts:219] deduplicates on `this.lastAdUrl`. When
`resetForNewContent()` is called on src swap, it already resets `lastAdUrl = undefined`
[ads.ts:407]. This should be sufficient. However, `registry.ts:624` calls
`entry.adsLayer?.resetForNewContent()` **before** `requestAd()` sets `entry.currentAdUrl =
undefined` at line 620. Verify that the ordering is correct and add a regression test.

**Verification step:** In the dev test page, play video A with `adUrl = X`, swipe to
video B with the same `adUrl = X`. Confirm the pre-roll fires for video B. If it does not,
add a `console.assert(this.lastAdUrl === undefined)` guard in `AdsLayer.request()` to
confirm `resetForNewContent()` was called before `request()`.

---

### 6.2 P1 — Feature Parity with V1

#### Task 5 — Surface ad event callbacks to consumers

V1 (`video-player.tsx`) exposes `onAdStarted`, `onAdCompleted`, `onAdSkipped`,
`onAdClicked`, `onAdImpression` to callers. V2 accepts these props but ignores them.

**Step 5a — Extend `AdsLayerEvents` in `ads.ts`:**

```ts
export type AdsLayerEvents = {
  contentPauseRequested?: () => void;
  contentResumeRequested?: () => void;
  allAdsCompleted?: () => void;
  adError?: (err: { message: string; code: number }) => void;
  // Add:
  adStarted?: (adData: AdMetadata) => void;
  adCompleted?: () => void;
  adSkipped?: () => void;
  adClicked?: () => void;
  adImpression?: () => void;
};

export type AdMetadata = {
  /** Ad duration in seconds, or -1 if unknown (live ad). */
  duration: number;
  /** Whether the ad can be skipped. */
  isSkippable: boolean;
  /** Skip offset in seconds, or -1 if not skippable. */
  skipOffset: number;
};
```

**Step 5b — Register additional event listeners in `onAdsManagerLoaded()` [ads.ts:275]:**

```ts
// After existing listeners:
adsManager.addEventListener(this.ima.AdEvent.Type.STARTED, (e) => {
  const adEvent = e as ImaAdEvent;
  this.events.adStarted?.({
    duration: adEvent.getAd?.()?.getDuration() ?? -1,
    isSkippable: adEvent.getAd?.()?.isSkippable() ?? false,
    skipOffset: adEvent.getAd?.()?.getSkipTimeOffset() ?? -1,
  });
});
adsManager.addEventListener(this.ima.AdEvent.Type.COMPLETE, () =>
  this.events.adCompleted?.()
);
adsManager.addEventListener(this.ima.AdEvent.Type.SKIPPED, () =>
  this.events.adSkipped?.()
);
adsManager.addEventListener(this.ima.AdEvent.Type.CLICK, () =>
  this.events.adClicked?.()
);
adsManager.addEventListener(this.ima.AdEvent.Type.IMPRESSION, () =>
  this.events.adImpression?.()
);
```

**Step 5c — Extend `ImaNamespace.AdEvent.Type` in `ads.ts:41`:**

Add `COMPLETE`, `SKIPPED`, `CLICK`, `IMPRESSION` to the type definition.

**Step 5d — Extend `ImaAdEvent` interface** to expose `getAd()` for metadata extraction.

**Step 5e — Wire callbacks in `registry.ts → requestAd()`:**

Pass `adStarted`, `adCompleted`, `adSkipped`, `adClicked`, `adImpression` through from
`AdsLayerEvents` into the `AdsLayer` constructor. The registry itself does not consume
these; it only threads them. `VideoPlayerV2` will receive them via `ClaimOptions` or a
registry callback extension — see Step 5f.

**Step 5f — Thread callbacks from `VideoPlayerV2` to registry:**

Option A (simpler): `ClaimOptions` gains optional ad callback fields. The registry passes
them into `AdsLayer`. `VideoPlayerV2.buildOpts()` includes the props.

Option B (event bus): `RegistryEntry` gains a `onAdEvent` callback field. Callers register
via `registry.apply()`. This keeps `ClaimOptions` clean but adds indirection.

**Recommendation: Option A** — fewer moving parts, direct traceability from prop to IMA event.

---

#### Task 6 — `ResizeObserver` for `adContainerEl`

**File:** `packages/ui/src/components/video-player/registry.ts`

IMA renders ads at the dimensions passed to `adsManager.init()`. After layout changes
(orientation change, fullscreen, container resize), IMA's click-through overlays and
non-linear positions go stale.

In `ensureShared()` [registry.ts:394], after creating the elements, attach a
`ResizeObserver`:

```ts
const resizeObserver = new ResizeObserver((entries) => {
  for (const e of entries) {
    const { width, height } = e.contentRect;
    shared?.adsLayer?.resize(width, height);
  }
});
resizeObserver.observe(adContainerEl);
```

Disconnect in `destroyEntry()` [registry.ts:721]:

```ts
resizeObserver.disconnect();
```

Store the observer on `RegistryEntry` so it's accessible from `destroyEntry`. Add
`resizeObserver: ResizeObserver | null` to the `RegistryEntry` type.

---

#### Task 7 — Fix `restoreCustomPlaybackStateOnAdBreakComplete` double-play

**File:** `packages/ui/src/components/video-player/ads.ts:270`

The flag is already `false` in the current implementation:

```ts
settings.restoreCustomPlaybackStateOnAdBreakComplete = false;
```

Confirmed correct. No change needed. This caveat was from an earlier version. Verify
against the deployed build if this was ever `true`.

---

#### Task 8 — Zombie `AdsManager` guard (request cancellation token)

**File:** `packages/ui/src/components/video-player/ads.ts:217–265`

Add a monotonic request ID inside `AdsLayer` to detect superseded requests:

```ts
private requestId = 0;

async request(adUrl: string, width: number, height: number): Promise<void> {
  const id = ++this.requestId;
  if (this.destroyed) return;

  const ok = await this.ensureInitialized();
  if (!ok || this.destroyed || id !== this.requestId) return; // superseded

  // ... rest of request logic unchanged
}
```

When a second `request()` call arrives before `ensureInitialized()` resolves on the first,
the first sees `id !== this.requestId` and short-circuits without calling `requestAds()`.
Only the latest request proceeds.

---

### 6.3 P2 — Hardening

#### Task 9 — IMA SDK retry on transient load failure

**File:** `packages/ui/src/components/video-player/ads.ts:97, 147`

In `onerror`, reset `imaPromise = null` before resolving:

```ts
script.onerror = () => {
  imaPromise = null; // allow retry on next call
  window.dispatchEvent(new CustomEvent('video-registry:ad-error', { ... }));
  resolve(null);
};
```

This means the next `loadImaSdk()` call will retry the script injection. Add exponential
backoff or a retry cap if CDN flakiness is a concern in production.

---

#### Task 10 — Remove `console.log` from `video-player-v2.tsx`

**File:** `packages/ui/src/components/video-player/video-player-v2.tsx` (any `console.log`
calls referencing `adUrl`). Remove or replace with the project's structured logger.
Ad tag URLs may contain targeting parameters that should not appear in production console
output.

---

## 7. CSP Requirements

The IMA SDK requires the following Content Security Policy directives. Verify these are
present in the app's CSP headers before enabling ads in production:

```
script-src  https://imasdk.googleapis.com
            https://pubads.g.doubleclick.net  (for DoubleClick ad tags)
            https://securepubads.g.doubleclick.net
frame-src   https://imasdk.googleapis.com
            https://googleads.g.doubleclick.net
img-src     https://googleads.g.doubleclick.net
            https://pagead2.googlesyndication.com
connect-src https://pubads.g.doubleclick.net
```

The registry already handles the case where `ima3.js` fails to load (CSP block → `null`
from `loadImaSdk()` → ads skipped, content plays normally). The `"video-registry:ad-error"`
event is dispatched on `window` with `code: -3` for observability.

---

## 8. Testing Checklist

Before shipping ad support to production, verify each scenario manually (IMA SDK cannot
be tested with unit tests — it requires real browser and network):

### Functional

- [ ] Pre-roll plays before content on first load
- [ ] Pre-roll plays again after swiping to a new video (src swap)
- [ ] Same `adUrl` + different `src` → pre-roll fires (not deduped)
- [ ] Ad error (bad tag URL) → content plays immediately, no freeze
- [ ] IMA SDK load failure (e.g. blocked by CSP) → content plays immediately
- [ ] `onEnded` fires after both content end AND all ads complete
- [ ] `onEnded` fires correctly when `adUrl` is `undefined` (no ads path)
- [ ] Rapid swipe (before IMA loads) → no zombie ads, content plays correctly
- [ ] Pause/resume during ad → ad continues, content resumes after ad ends
- [ ] VMAP mid-roll: content pauses at the scheduled cue, ad plays, content resumes

### iOS Safari Specific

- [ ] Unmute during ad → audio carries to content after ad ends
- [ ] Swipe back to previous video → correct frame and seek position shown
- [ ] Ad plays muted on autoplay; audio follows `userState.muted` after `CONTENT_RESUME_REQUESTED`

### Layout

- [ ] Orientation change during ad → ad container resizes, click overlay aligns
- [ ] Fullscreen toggle during ad → ad resizes correctly

### Callbacks (after Task 5)

- [ ] `onAdStarted` fires with correct duration and skippable flag
- [ ] `onAdCompleted` fires after linear ad finishes
- [ ] `onAdSkipped` fires when user clicks skip
- [ ] `onAdImpression` fires once per ad

---

## 9. Decision Log

| Decision | Rationale |
|---|---|
| Separate `adVideoEl` from `videoEl` | Eliminates play/pause race between IMA and registry. IMA drives its own `<video>`; registry drives content `<video>`. |
| `AdDisplayContainer` created once, `AdsLoader` recreated per content item | `AdDisplayContainer` holds stable element refs (required by IMA). `AdsLoader` becomes terminal after `contentComplete()` — recreating is the only way to request new ads. |
| `AdsLayer` persists across src swaps | Cheaper than full destroy + rebuild. `AdDisplayContainer.initialize()` is a one-shot operation; recreating it would require a new user gesture on iOS. |
| `requestAd()` inside `requestAnimationFrame` | Ensures `adContainerEl.clientWidth/Height` return non-zero values after `display: block` is set. Without this, IMA receives `1×1` slot dimensions and renders the ad invisibly. |
| No OpenPlayerJS for ads in V2 | OPJ wraps `<video>` in its own DOM container and its `src` setter only appends, never replaces — incompatible with the shared src-swapping model. |
| `adUrl` hardcoded to sample tag during development | Safe for dev iteration; MUST be removed before production (Task 1). |
