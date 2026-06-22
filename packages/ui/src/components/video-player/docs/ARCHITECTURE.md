# Video Player Architecture

## Overview

The video player system has two generations:

| | V1 (`VideoPlayer`) | V2 (`VideoPlayerV2`) |
|---|---|---|
| `<video>` element | New per mount | One shared, reparented |
| Engine | OpenPlayerJS | Bare HTML5 + hls.js |
| iOS unmute carry | No | Yes |
| Seek resume on swipe-back | No | Yes |
| Ads | OpenPlayerJS IMA | `AdsLayer` (direct IMA SDK) |

V2 was introduced to solve a hard iOS Safari constraint: the browser binds its "user has gestured → allow unmuted autoplay" token to a **specific `<video>` element**. Re-creating the element on every swipe destroys the token. The only fix is to **never destroy it**.

---

## File Map

```
video-player/
├── video-player.tsx          # V1 — OpenPlayerJS-backed, one element per mount
├── video-player-v2.tsx       # V2 — registry consumer, slot-based reparenting
├── registry.ts               # Singleton engine: claim / release / apply / evict
├── video-element-provider.tsx # React Context: one VideoRegistry per subtree
├── ads.ts                    # AdsLayer — thin IMA SDK wrapper
├── internals.ts              # Shared: quartile tracking, HLS config, OPJ factory
└── index.ts                  # Public exports
```

---

## Component Hierarchy

```
<VideoElementProvider>            ← creates VideoRegistry, provides via Context
  └─ <FeedSwiper> / any parent
       ├─ <VideoPlayerV2 src="A"> ← active card
       └─ <VideoPlayerV2 src="B"> ← next card (not rendered simultaneously)
```

`VideoElementProvider` must wrap every subtree that contains `VideoPlayerV2` instances. Leaving the subtree calls `registry.evictAll()`, which destroys the shared `<video>` and the parking div.

---

## Singleton Video Element Architecture

### The Core Idea

```
┌─────────────────────────────────────────────────────────┐
│  VideoRegistry (module-level closure, one per Provider)  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  shared RegistryEntry (key = "@shared")         │    │
│  │  ┌──────────────────────────────────────────┐   │    │
│  │  │  containerEl  (data-video-registry-cont) │   │    │
│  │  │   ├─ videoEl  <video>                    │   │    │
│  │  │   └─ adContainerEl  (IMA overlay)        │   │    │
│  │  └──────────────────────────────────────────┘   │    │
│  │  currentSrc, userState, refCount, parked         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  storedTimes  Map<url, currentTime>  (seek-resume cache) │
│  pendingSeeks Map<url, targetTime>   (loadedmetadata)    │
│  transients   Map<key, RegistryEntry> (fallback dupes)   │
│  parkingDiv   <div style="display:none"> in document.body│
└─────────────────────────────────────────────────────────┘
```

**One `<video>` is created on first `claim` and lives until `evictAll`.** On every subsequent claim, the same element is reparented into the new slot.

---

## Lifecycle: Claim → Reparent → Release → Park

```
Mount VideoPlayerV2(src="A")
        │
        ▼
  registry.claim("A", opts)
        │
        ├── first call ever ──► ensureShared(opts)
        │                         creates <video>, <div> container, <div> adContainer
        │                         attaches volumechange / ratechange / timeupdate /
        │                         loadedmetadata listeners (permanent, once)
        │                         lazy-loads hls.js (non-Safari)
        │
        ├── shared.refCount == 0 (sequential reuse, common case)
        │     shared.refCount = 1
        │     applyOpts(shared, opts)   ← swapSrc + muted/volume/play etc.
        │
        └── shared.refCount == 1 (simultaneous claim, defensive)
              mint transient entry (separate <video>, no reuse benefits)
              auto-destroy on release

  VideoPlayerV2 layout effect:
        slot.appendChild(handle.entry.containerEl)   ← reparent into visible slot
        onPlayerLoad?.(null)

                          [user swipes to next card]

  Unmount VideoPlayerV2(src="A")
        │
        ▼
  layout-effect cleanup (runs BEFORE React removes slot from DOM):
        handle.entry.containerEl.parentNode?.removeChild(containerEl)
        registry.release(handle)
              │
              └── park(shared)
                    shared.parked = true, refCount = 0
                    storedTimes.set(currentSrc, videoEl.currentTime)
                    containerEl → parkingDiv  (display:none, stays in DOM)
                    ** NO pause — preserves iOS unmute token **

  Mount VideoPlayerV2(src="B")
        │
        ▼
  registry.claim("B", opts)
        shared.refCount == 0  ──► reuse path
        swapSrc(shared, "B")
              saves A's currentTime → storedTimes
              calls loadSource / hls.loadSource("B")
              ** NO pause between A and B **
        slot.appendChild(containerEl)   ← reparent into new slot
```

### Why `useLayoutEffect` (not `useEffect`) for the claim/release

React's mutation phase removes DOM nodes. If `useEffect` is used, the cleanup runs **after** the slot is removed while `containerEl` is still a child — iOS Safari throws `NotFoundError` from `removeChild`. `useLayoutEffect` cleanup runs during the mutation phase, before deletion.

---

## State Flow: What Lives Where

```
┌──────────────────────┬──────────────────────────────────────────┐
│  Where               │  What                                    │
├──────────────────────┼──────────────────────────────────────────┤
│  RegistryEntry       │  muted, volume, playbackRate (userState) │
│  .userState          │  survives every src swap for free —      │
│                      │  it's on the same <video> element        │
├──────────────────────┼──────────────────────────────────────────┤
│  storedTimes Map     │  currentTime per URL                     │
│                      │  written: on swapSrc, on park            │
│                      │  read:    on claim / swapSrc             │
│                      │  restores resume position on swipe-back  │
├──────────────────────┼──────────────────────────────────────────┤
│  VideoPlayerV2       │  playerStateRef — quartile fire flags,   │
│  component           │  videoCompleted, allAdsCompleted         │
│                      │  resets on src / adUrl change            │
├──────────────────────┼──────────────────────────────────────────┤
│  VideoPlayerV2       │  callbacksRef — always-current prop      │
│  component           │  callbacks, avoids re-attaching DOM      │
│                      │  listeners on every render               │
└──────────────────────┴──────────────────────────────────────────┘
```

---

## HLS Playback Strategy

```
                    ┌─ isSafari? ─────────────────────────┐
                    │  OR canPlayType(mpegurl) != ""       │
                    ▼                                      ▼
              nativeHls = true                    nativeHls = false
                    │                                      │
            videoEl.src = url                   lazy-load hls.js from CDN
                    │                           (once, module-level promise)
                    │                                      │
                    │                             hls.attachMedia(videoEl)
                    │                             hls.loadSource(url)
                    └───────────────┬──────────────────────┘
                                    ▼
                            HLS plays in <video>
```

HLS strategy is decided **once** per shared entry creation (`ensureShared`). `loadSource()` picks the right path on every `swapSrc`.

---

## Ads Integration (AdsLayer)

```
VideoRegistry
  └─ RegistryEntry.adsLayer: AdsLayer | null

AdsLayer (created lazily on first adUrl claim)
  ├─ adDisplayContainer  ImaAdDisplayContainer  (wraps adContainerEl)
  ├─ adsLoader           ImaAdsLoader
  └─ adsManager          ImaAdsManager  (per ad-request, recycled on swapSrc)
```

### Ad request flow

```
applyOpts(entry, { adUrl: "https://..." })
  │
  ├── adUrl !== entry.currentAdUrl  →  requestAd(entry, adUrl)
  │
  └── requestAd
        ├── entry.adsLayer ?? new AdsLayer(adContainerEl, videoEl, hooks)
        │
        └── requestAnimationFrame (wait for containerEl to have dimensions)
              AdsLayer.request(adUrl, width, height)
                ├── ensureInitialized()
                │     loadImaSdk()  (once, module-level promise)
                │     new AdDisplayContainer + new AdsLoader
                │
                ├── destroy prior AdsManager
                ├── adDisplayContainer.initialize()
                └── adsLoader.requestAds(req)
                      │
                      ADS_MANAGER_LOADED
                      │
                      adsManager.init() + adsManager.start()
                      │
                      CONTENT_PAUSE_REQUESTED → videoEl.pause()
                      CONTENT_RESUME_REQUESTED → videoEl.play()
                      ALL_ADS_COMPLETED → entry via callback
                      AD_ERROR → window CustomEvent "video-registry:ad-error"
```

The IMA `AdDisplayContainer` is bound to `adContainerEl`. Since `adContainerEl` is always inside `containerEl`, reparenting the container carries the entire IMA DOM subtree with it — no re-init needed across src swaps.

---

## Simultaneous Claims: Transient Fallback

Production feeds render only the active card — the shared element is always free. If two `VideoPlayerV2` instances mount simultaneously (edge case), the registry mints a **transient** entry:

```
shared.refCount == 1 (already claimed)
  │
  └── new RegistryEntry { shared: false, key: "@shared::dup-N" }
        separate <video>, no hls.js reuse, no unmute carry
        transients.set(key, entry)
        → auto-destroyed on release (destroyEntry, not park)
```

Transients are a safety valve, not a feature. The unmute token does **not** transfer to transients.

---

## Effect Summary (VideoPlayerV2)

| Effect | Deps | Purpose |
|---|---|---|
| `useLayoutEffect` | `[src]` | claim / reparent / release — layout timing required |
| `useEffect` | `[muted, volume, playbackSpeed, play, startTime, adUrl, loop, playsInline]` | forward command props to registry via `apply` |
| `useEffect` | `[src, adUrl]` | attach native video event listeners; resets quartile state |
| `useEffect` | `[src]` | attach quartile tracking via `attachQuartileTracking` |
| `useImperativeHandle` | `[]` | expose `videoEl` to parent refs |

---

## V1 vs V2 Comparison

```
V1 (VideoPlayer)                    V2 (VideoPlayerV2)
─────────────────────────────────   ──────────────────────────────────
new <video> per mount               ONE <video>, reparented
OpenPlayerJS wraps <video>          bare HTML5 API
OPJ src setter: append-only         swapSrc: direct .src / hls.loadSource
OPJ IMA integration                 AdsLayer (direct IMA SDK)
mute token lost on swipe            mute token preserved across swipes
no seek resume                      storedTimes seek resume
                                    useLayoutEffect claim/release
                                    parkingDiv holds element between claims
```

---

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│  React Tree                                                        │
│                                                                    │
│  <VideoElementProvider>                                            │
│    registry = useMemo(() => createVideoRegistry(), [])             │
│    useEffect cleanup → registry.evictAll()                         │
│                                                                    │
│    <VideoPlayerV2 src="..." play muted={false} adUrl="...">        │
│      slotRef = <div ref={slotRef} />   ← visible slot              │
│                                                                    │
│      useLayoutEffect([src]):                                       │
│        handle = registry.claim(src, opts)                          │
│        slotRef.appendChild(handle.entry.containerEl)               │
│        return () => { detach; registry.release(handle) }           │
│                                                                    │
│      useEffect([muted,...]):                                       │
│        registry.apply(handle, opts)                                │
│                                                                    │
│      useEffect([src,adUrl]):                                       │
│        videoEl.addEventListener(...)  ← native event bridge        │
│                                                                    │
│    </VideoPlayerV2>                                                │
│  </VideoElementProvider>                                           │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐        ┌──────────────────────────────┐
│  VideoRegistry           │        │  DOM (document.body)         │
│                          │        │                              │
│  claim(src, opts)        │──────► │  <div data-parking>          │
│    applyOpts             │  park  │    <div data-container>      │
│    swapSrc               │◄───────│      <video>                 │
│    requestAd             │ claim  │      <div data-ads>          │
│                          │        │    </div>                    │
│  release(handle)         │        │  </div>                      │
│    park → parkingDiv     │        │                              │
│                          │        │  (slot div, inside React)    │
│  apply(handle, opts)     │        │  <div ref={slotRef}>         │
│    applyOpts (diff)      │        │    ← containerEl reparented  │
│                          │        │      here while active       │
│  evictAll()              │        │  </div>                      │
│    destroyEntry(shared)  │        └──────────────────────────────┘
│    remove parkingDiv     │
└──────────────────────────┘
```

---

## DOM Event Bus

`AdsLayer` dispatches namespaced `CustomEvent`s on the **content** `<video>` element so React consumers (`VideoPlayerV2`) can subscribe without coupling to AdsLayer or the registry. All ad-related signal flows through this bus; the existing `AdsLayerEvents` JS callbacks remain for registry-internal state (`adIsPlaying`, `postRollPending`).

### Why DOM events, not callbacks

- **Framework-agnostic** — AdsLayer and VideoRegistry have zero React types. `dispatchEvent` is a DOM primitive.
- **One subscription point** — V2's single `useEffect` (deps `[src, adUrl, useStrictEndCoordination]`) attaches/removes all 13 listeners in one cleanup. JS callbacks would require either prop-drilling or a parallel ref system.
- **Listener identity stable** — Handlers read latest callbacks from `callbacksRef` in V2. Listener attach/detach is not tied to render identity → no quadratic listener churn.

### Event names + payloads

| DOM event | V2 prop fired | `detail` type | IMA source |
|---|---|---|---|
| `genuin:ad-requested` | `onAdRequested` | `{ adTagUrl: string }` | pre `requestAds()` |
| `genuin:ad-response-received` | `onAdResponseReceived` | `{}` | `ADS_MANAGER_LOADED` |
| `genuin:ad-request-failed` | `onAdRequestFailed` | `{ message, code }` | `AD_ERROR` pre-manager |
| `genuin:ad-rendered` | `onAdRendered` | `AdDetail` | `AdEvent.LOADED` |
| `genuin:ad-impression` | `onAdImpression` | `AdDetail` | `AdEvent.IMPRESSION` |
| `genuin:ad-started` | `onAdStarted` | `AdDetail` | `AdEvent.STARTED` |
| `genuin:ad-first-quartile` | `onAdFirstQuartile` | `AdDetail` | `AdEvent.FIRST_QUARTILE` |
| `genuin:ad-pause` | `onAdPause` | `AdDetail` | `AdEvent.PAUSED` |
| `genuin:ad-clicked` | `onAdClicked` | `AdDetail` | `AdEvent.CLICK` (see caveats) |
| `genuin:ad-skipped` | `onAdSkipped` | `AdDetail` | `AdEvent.SKIPPED` |
| `genuin:ad-completed` | `onAdCompleted` | `AdDetail` | `AdEvent.COMPLETE` |
| `genuin:ad-error` | `onAdError` + `onAdRenderError` | `{ message, code }` | `AD_ERROR` |
| `genuin:ad-all-completed` | drives `onEnded` post-roll gate | `{}` | `AdEvent.ALL_ADS_COMPLETED` |

`AdDetail` shape exported from [ads.ts](../ads.ts). All fields nullable — IMA's `Ad` object can be partial on some event types.

### `onEnded` post-roll gate

V2's `endStateRef` tracks `contentEnded` + `adsCompleted` separately. On native `ended` it flips `contentEnded` and consults `handle.entry.adsLayer?.postRollScheduled`:
- No post-roll scheduled → fire `onEnded` immediately.
- Post-roll scheduled → wait for `genuin:ad-all-completed` to flip `adsCompleted`, then fire.

Opt-out via `useStrictEndCoordination={false}` (V2 prop, default `true`) restores the legacy raw-`ended` behavior.

---

## Key Constraints That Drove the Design

1. **iOS Safari unmute token** — bound to a `<video>` element instance. Destroying and recreating loses it. Solution: never destroy; reparent instead.

2. **No pause between swaps** — `park()` deliberately skips `videoEl.pause()`. Pausing before a src swap also drops the iOS token. The element is in the parking div for sub-millisecond windows during a React commit.

3. **`containerEl` reparenting (not `videoEl` alone)** — the IMA `AdDisplayContainer` holds references to `adContainerEl`. Moving only the `<video>` would orphan the IMA overlay. Moving `containerEl` carries both.

4. **`useLayoutEffect` for claim/release** — React's mutation phase can call `removeChild` on a slot that still contains `containerEl` if `useEffect` cleanup is used. `useLayoutEffect` cleanup runs before the deletion walk.

5. **OpenPlayerJS rejected** — OPJ's `src` setter appends sources (never replaces), and it wraps `<video>` in its own container. Both made it unsuitable as a shared, src-swapping engine.
