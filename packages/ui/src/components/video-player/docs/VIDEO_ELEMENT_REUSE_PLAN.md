# Video Element Reuse — Implementation Plan: Shared Element

## Status

Branch: `feature/video-element-reuse` (off `master-new`).

> **Note**: commit SHAs were rewritten to drop a Co-Authored-By trailer; the SHAs below match the current branch tip.

### Design pivot — 2026-04-30

The original M1 design keyed the registry by `src` URL: one long-lived `<video>` + `OpenPlayerJS` pair per unique manifest. That preserves `currentTime` per URL but **does not** preserve audio focus across URLs — iOS Safari binds the un-muted-autoplay gesture allowance to a specific `<video>` element, and a different element starts subject to the muted-autoplay restriction again. Manual testing confirmed it: unmuting slot 1 then swiping to slot 2 left slot 2 paused (and audible audio kept leaking from the parked slot 1 element).

The revised design uses **one shared `<video>` element** for the whole feed, mirroring `Downloads/genuin/grid/video.html`. The element is reparented across slots and its `src` is swapped in place. `currentTime` per URL is preserved out-of-band via a `Map<url, time>` cache and a `loadedmetadata` seek. `userState` (muted / volume / playbackRate) survives every transition for free because it's intrinsic to the same DOM node.

Trade-off: OpenPlayerJS is no longer instantiated by the registry — its `src` setter is append-only (won't cleanly swap), and its DOM wrapping conflicts with reparenting. HLS playback runs through raw `hls.js` (lazy-loaded from `cdn.jsdelivr.net`, already CSP-allowed) on non-Safari and native HLS on Safari. Ad / IMA support, the `onVideoStart` / `onSeeked` / `onPlayerLoad` surfaces, and quartile tracking are deferred to M3 alongside the V1 replacement.

### Milestones

- **M0 — Done.** `hlsConfigs` and `attachQuartileTracking` extracted to `packages/ui/src/components/video-player/internals.ts` (commit `74fd63871`). `attachQuartileTracking` is unused after the pivot but stays available for M3.
- **M0.5 — Superseded.** `createOpenPlayerJS` factory extracted to `internals.ts` (commit `b952a4bd3`). Still used by V1; the new shared registry doesn't call it.
- **M1 (per-src registry) — Superseded by M1*.** Original commits `69d98f69d` / `d37eead7c` / `0180c5061` / `89deeb463` / `9d4543530` shipped the per-src design and a manual-QA page. They surfaced the iOS gesture-allowance issue.
- **M1\* — Done in-tree, not yet committed.** [registry.ts](packages/ui/src/components/video-player/registry.ts) rewritten as a shared-element registry: one long-lived `<video>`, src swap with stored `currentTime`, lazy hls.js via CDN, transient escape hatch for simultaneous claims. [video-player-v2.tsx](packages/ui/src/components/video-player/video-player-v2.tsx) updated (drops quartile-callback wiring; layout-effect-based reparenting unchanged). [video-element-provider.tsx](packages/ui/src/components/video-player/video-element-provider.tsx) unchanged. [video-reuse-test/client.tsx](apps/webapp/src/app/(site)/(new)/video-reuse-test/client.tsx) shows a 10-slot vertical-snap feed with mute/play overlay, on-screen error capture, and a debug panel exposing `total / parked / storedTimes / <video> count`.
- **M2 — Done.** Jest module resolution repaired by adding `moduleNameMapper` for `@genuin/ui/*` in `packages/ui/jest.config.cjs` (mirrors the tsconfig path aliases). [registry.test.ts](packages/ui/src/components/video-player/registry.test.ts) rewritten for the shared model: 13 tests covering element-identity across srcs, `userState` survival, currentTime cache + `loadedmetadata` seek, simultaneous-duplicate transients, `apply` forwarding, pause-on-park, evict / evictAll, getStats. All green.
- **M3 — Not started.** Replace V1 with V2 caller-by-caller (feed-player → comments/video → animated-tile) and fold the deferred surfaces back in: OpenPlayerJS or equivalent for ad/IMA support, quartile tracking, `onVideoStart` latency, `onSeeked`, `onPlayerLoad`, `onMutedChange`. The registry will need a way to mount an OpenPlayerJS-style controls/ad layer **around** the shared `<video>` without breaking reparent.
- **M4 — Not started.** Delete legacy V1, rename V2 to VideoPlayer.

## Goal

When the user unmutes one video in the feed, every subsequent video they swipe to plays unmuted — without a visible glitch, audio gap, or stalling. Today each `<VideoPlayer>` creates its own `<video>` ([video-player.tsx:731](packages/ui/src/components/video-player/video-player.tsx#L731)); destroying the React instance drops the audio gesture allowance and resets the muted state.

The shared-element design holds **one** `<video>` element under `<VideoElementProvider>` for the entire feed. `<VideoPlayer>` becomes a thin slot wrapper that reparents the shared element on mount and releases it on unmount. Per-URL `currentTime` is preserved via an external cache so swiping back resumes from where the user left off.

## Non-goals

- Breaking changes for callers — `<VideoPlayer>` keeps its current props and imperative ref. The ref does become stable across mount/unmount cycles for the same source (see "Imperative ref impact"), but no caller has to change.
- Replacing `OpenPlayerJS` with another player engine.

## Constraints from current code

- `<VideoPlayer>` is `memo`-wrapped and accepts ~30 props ([video-player.tsx:170-207](packages/ui/src/components/video-player/video-player.tsx#L170-L207)).
- It exposes the `<video>` element via `useImperativeHandle(ref, …)` ([video-player.tsx:209](packages/ui/src/components/video-player/video-player.tsx#L209)) — this contract must keep working.
- `AdControls` reads `playerRef.current` and the same `<video>` ([video-player.tsx:762-781](packages/ui/src/components/video-player/video-player.tsx#L762-L781)) — must keep getting the live element.
- Direct callers ([feed-player/feed-player.tsx:394](packages/components/src/molecules/feed-player/feed-player.tsx#L394), [comments/video/video.tsx:69](packages/components/src/molecules/comments/video/video.tsx#L69), animated-tile usages) must not change.
- Some props are descriptive (`src`, `poster`), others are commands that mutate the element on every render (volume/muted/playbackRate effects at [video-player.tsx:255-273](packages/ui/src/components/video-player/video-player.tsx#L255-L273)) — semantics must survive re-mounts of the same `src`.

## Architecture overview

```text
<VideoElementProvider>      (one instance per feed subtree)
  ├─ parkingDiv             hidden <div> holding the shared <video> when idle
  ├─ shared: { videoEl, refCount, parked, currentSrc, userState }
  ├─ storedTimes: Map<url, currentTime>  ← scroll-back resume cache
  └─ pendingSeeks: Map<url, time>        ← waits for loadedmetadata after src swap

<VideoPlayer>               (slot wrapper, no <video> of its own)
  on mount   → registry.claim(src) → reparent shared.videoEl into slot, swap src
  on unmount → reparent shared.videoEl back to parkingDiv → registry.release()
```

Reparenting an existing `HTMLMediaElement` does **not** reset its native state — that's the property the design relies on. Crucially, `<video>` element identity also preserves iOS Safari's audio gesture allowance, which is what makes the "unmute once, hear audio on every video" behaviour possible.

> The sections below ("Registry API", "Auto-disambiguation", "Provider behaviour", "Ad state on src change", "startTime semantics", "Lazy init", "Imperative ref impact") describe the superseded per-src design. They are kept for historical context; the authoritative shape of the API is in [packages/ui/src/components/video-player/registry.ts](packages/ui/src/components/video-player/registry.ts) and the M3 plan above. Differences worth knowing:
>
> - Single shared entry under `key === "@shared"` — no LRU, no shadow keys for typical use.
> - `currentTime` per URL lives in `storedTimes`, not on per-entry state.
> - Simultaneous claims (only safe when production callers haven't been migrated yet) mint *transient* duplicates that destroy on release rather than parking. The unmute does not transfer to a transient — it's a defensive fallback.
> - OpenPlayerJS is not constructed by the registry. HLS playback uses raw `hls.js` (CDN) or native HLS. Ad / IMA wiring is M3 work.

## Registry API

```ts
type Key = string; // canonical: src URL (or an auto-minted shadow key for duplicates)
type RegistryEntry = {
  key: Key;
  videoEl: HTMLVideoElement;
  player: OpenPlayerJS | null;
  refCount: number; // 0 (parked) or 1 (claimed). >1 never happens — see "Auto-disambiguation".
  parked: boolean; // true when sitting in parkingDiv
  userState: {
    // persisted across claims
    muted: boolean;
    volume: number; // 0–100
    playbackRate: number;
  };
};

/** Opaque token returned from claim() and passed back to release(). */
type ClaimHandle = { entry: RegistryEntry; key: Key };

interface VideoRegistry {
  /** Returns an existing parked entry under `src`, or mints a fresh entry (with a shadow key when `src` is already active). */
  claim(src: string, opts: ClaimOptions): ClaimHandle;
  /** Releases the specific entry referenced by the handle; parks it when refCount hits 0. */
  release(handle: ClaimHandle): void;
  /** Optional explicit eviction (re-mount churn / route change). */
  evict(handle: ClaimHandle): void;
}
```

`ClaimOptions` carries the prop bag forwarded by `<VideoPlayer>`: `id`, `poster`, `playsInline`, `loop`, `adUrl`, `enableLazyLoading`, plus the prop-driven runtime values `muted`, `volume`, `playbackSpeed`, `play`, `startTime`. The provider applies any that diverge from the entry's last known state (no-op when same).

### Auto-disambiguation

The caller passes `src` to `claim`; the registry decides what key to use internally:

- If no active entry under `src` (none, or one parked): reuse it. Sequential mounts of the same URL — the common case — get the cached `<video>` + `OpenPlayerJS` and full state preservation.
- If an entry is *currently active* under `src` (`refCount === 1`): mint a fresh entry under a synthetic shadow key like `${src}::dup-${counter}` and return that. The caller never sees the suffix.

Consumers receive an opaque `ClaimHandle` and pass it back to `release`/`evict`; the registry releases the exact entry they claimed. URLs come from the API and consumers don't have to reason about whether they might collide.

**Trade-off**: when two `<VideoPlayer>`s render on the same URL at the same time, only one of them gets the cached state — the second is a fresh entry that behaves like today's `<VideoPlayer>` (new `<video>`, new `OpenPlayerJS`). The shadow entry parks on unmount and is LRU-evicted normally.

## Provider behaviour

1. **Construction (once)**: provider creates `parkingDiv = document.createElement('div')`, sets `display:none`, appends to `document.body`. Registry is a plain `Map` held in a ref so it survives renders. On provider unmount (route-group exit, see Resolved decisions §1), the cleanup `evict`s every entry and removes `parkingDiv` from the body so we don't leak a hidden div across navigations.
2. **`claim(src, opts)`**:
   - If a parked entry exists under `src`: increment its `refCount` to 1. Apply any opts that changed (`src`, `loop`, `playsInline`, `volume`, `muted`, `playbackRate`, `play`, `startTime`) — see "startTime semantics" below. Mark `parked=false` (caller will reparent). Return a handle pointing at this entry.
   - If an entry under `src` is currently claimed (`refCount === 1`): mint a fresh entry under a synthetic shadow key `${src}::dup-${counter}`, create a new `<video>` + (deferred) `OpenPlayerJS`, store in the map, return a handle pointing at the shadow entry. The original entry is untouched. See "Auto-disambiguation" above.
   - If no entry exists under `src`: create `<video>`; copy attribute-style props (`id`, `class`, `playsInline`, `loop`, `preload="none"`, initial `src`, `poster` background); construct `OpenPlayerJS` unless `enableLazyLoading && !play` (see "Lazy init" below); store in map; refCount=1; return handle.
3. **`release(handle)`**:
   - Decrement `handle.entry.refCount`. When 0, move the element back to `parkingDiv` and set `parked=true`. Do not destroy. Shadow entries park the same way and are eligible for LRU eviction like any other parked entry.
4. **`evict(handle)`**: explicit teardown — destroy `OpenPlayerJS`, remove `<video>`, drop from map. Used for memory pressure, route teardown, or testing.
5. **Native event syncing**: provider listens once per entry to `volumechange` and `ratechange` and writes to `entry.userState`. On the next `claim`, props that don't override (e.g. `muted` left undefined) inherit from `userState`. **This is the behaviour change that motivates the work** — the user's mute/unmute survives swiping between feed cards instead of resetting on every mount.
6. **Quartile event listeners**: today they're attached inside `useEffect` blocks per instance. Move them onto the **entry**, not the React instance, so they fire continuously even across reparenting. The current `playerStateRef` ([video-player.tsx:224](packages/ui/src/components/video-player/video-player.tsx#L224)) becomes `entry.playerStateRef`.

### Ad state on `src` change

Within an entry, the IMA/DAI ad container is a sibling of the `<video>` and lives inside the wrapper that gets reparented; ad state therefore survives reparenting normally. **When the entry's `src` changes**, the OpenPlayerJS instance is rebuilt on the same `<video>` element (see "Risks" below) and any ad timeline tied to the previous source is lost — by design. We accept that an in-flight ad doesn't survive a media swap; the wins from element/state preservation across mount-unmount-mount are the primary goal.

### `startTime` semantics

`startTime` is applied **only on first claim** (or on a subsequent claim where `startTime` differs from the value last applied). On a parked-then-reclaimed entry with the same `startTime`, we leave `currentTime` alone so resume position is preserved. Without this rule, every mount would seek the user back to `startTime`, defeating reuse.

### Lazy init (`enableLazyLoading`)

The flag now defers the `OpenPlayerJS` construction *within* an entry, not the entry itself: the `<video>` element is created on first claim either way, but the player is built only when `play` becomes true. Subsequent claims that flip `play` back and forth do not re-build — the player exists once per entry's lifetime.

### `AdControls` lifetime

`AdControls` stays a child of `<VideoPlayer>` ([video-player.tsx:762-781](packages/ui/src/components/video-player/video-player.tsx#L762-L781)) and re-mounts with it. On unmount it tears down its React listeners; on re-mount it re-attaches them to the (still-alive) `OpenPlayerJS` instance read from the entry. The ad clock and IMA listeners reset across mount/unmount — same observable behaviour as today — but the underlying player and media buffer survive on the entry.

### Imperative ref impact

Today the ref returned by `useImperativeHandle` ([video-player.tsx:209](packages/ui/src/components/video-player/video-player.tsx#L209)) points at the per-instance `<video>`: every mount produces a new node, every unmount invalidates the ref. After the change, the ref points at the registry's persistent element. Two consequences callers should know:

1. The ref is **stable across mount/unmount cycles for the same key**, so cached references keep working — a behaviour change relative to today, but a friendlier one.
2. When the consumer's `src` changes, the entry rotates and the ref points at a different element — same as today.

### Slot poster while empty

`useEffect` runs after paint, so there's exactly one frame between `<VideoPlayer>`'s first render and the moment `entry.videoEl` is reparented into `slotRef`. Rather than show an empty box, the slot wrapper applies `poster` as a CSS `background-image` — same approach the current component uses inline at [video-player.tsx:738](packages/ui/src/components/video-player/video-player.tsx#L738). The reparented `<video>` covers it on the next paint.

## `<VideoPlayer>` after the change

```tsx
function VideoPlayer(props: PlayerProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const registry = useVideoRegistry();
  const handleRef = useRef<ClaimHandle | null>(null);

  useImperativeHandle(
    props.ref,
    () => handleRef.current?.entry.videoEl ?? null,
    [],
  );

  // claim/release on mount/unmount
  useEffect(() => {
    const handle = registry.claim(props.src, props);
    handleRef.current = handle;
    slotRef.current?.appendChild(handle.entry.videoEl);   // reparent into slot
    return () => {
      if (handleRef.current) registry.release(handleRef.current);
      handleRef.current = null;
    };
  }, [props.src]);

  // forward "command" props to the live entry on every change
  useEffect(() => {
    if (handleRef.current) registry.apply(handleRef.current, props);
  }, [props.muted, props.volume, props.playbackSpeed, props.play, props.startTime, /* … */]);

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full" ref={slotRef}>
      {props.isLoading && <LoadingOverlay />}
      {props.adUrl && <AdControls player={handleRef.current?.entry.player ?? null} … />}
    </div>
  );
}
```

The component shrinks substantially — every `useEffect` that wrote to `videoRef.current` becomes a single `registry.apply` call, and every block that constructs `OpenPlayerJS` is gone.

## Migration plan (incremental, behind a feature flag)

1. **Lift helpers**, no behaviour change. Extract from `video-player.tsx` into a new sibling file `packages/ui/src/components/video-player/internals.ts` so the surface stays internal to the component folder:
   - `createOpenPlayerJS(videoEl, opts)` — current init at [video-player.tsx:472-540](packages/ui/src/components/video-player/video-player.tsx#L472-L540).
   - `applyRuntimeProps(videoEl, player, opts)` — all the property setters in `useEffect`s.
   - `attachQuartileTracking(player, stateRef, callbacks)` — the 4 quartile flags at [video-player.tsx:224-235](packages/ui/src/components/video-player/video-player.tsx#L224-L235).
   - Keep current `<VideoPlayer>` calling these helpers; behaviour identical.
2. **Add `<VideoElementProvider>` + `useVideoRegistry`**, but no consumer uses it yet. Mount it once in the `(new)` layout — that's the route group that contains every `<VideoPlayer>` consumer (`/home`'s feed, comments, animated-tile).
3. **Introduce `<VideoPlayerV2>`** (same prop API) using the registry helpers. Keep `<VideoPlayer>` untouched.
4. **Feature flag** (`useReusableVideoPlayer` env / cookie) so callers can opt-in. Initially: enable in Storybook stories + a new dedicated test route (see "Test page" below) only. **Do not touch `/home` yet** — `/home`'s feed is the integration target, not the smoke test.
5. **Migrate callers one at a time**: `feed-player` (which is what `/home` renders), `comments/video`, `animated-tile`. Verify mute/volume persistence across navigation in each.
6. **Flip default**, delete legacy `<VideoPlayer>`. Final shape: `<VideoPlayer>` is the v2; the old code is gone.

### Test page

Add a small route under `(site)/(new)/video-reuse-test/page.tsx` whose only job is to exercise the reuse contract in isolation:

- A "Mount / Unmount" toggle that conditionally renders `<VideoPlayerV2 src={A} />`.
- A "Swap src" button that flips between two URLs.
- A "Two slots, same src" pane to validate auto-disambiguation: both slots render, the second is a fresh entry, mute on one doesn't bleed into the other.
- A readout panel showing `currentTime`, `muted`, `volume`, `paused`, `refCount` for each registry entry.

`/home` keeps the original `<VideoPlayer>` until M3 (route-by-route migration), at which point the feature flag flips and we use `/home` as the soak test, not the smoke test. Reasons:

- `/home` has many surrounding moving parts (feed swiper, ad slots, comments) that mask whether a regression is in the registry or in something adjacent.
- The dedicated test page can mount/unmount synthetically — much faster to iterate on than scrolling a feed.
- Storybook covers static visuals; the test route covers the dynamic reuse behaviour.

## Edge cases & how the plan handles them

| Case                                                      | Handling                                                                                                                                                                                                                                     |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same `src` rendered twice (e.g. expand-view + thumbnail). | Auto-disambiguated by the registry: first claim gets the canonical entry, second gets a fresh shadow entry. See "Auto-disambiguation".                                                                                                       |
| `src` changes while mounted.                              | `useEffect([props.src])` cleanup runs `release(oldKey)`, then claims new key. Default React semantics.                                                                                                                                       |
| Ads (IMA/DAI).                                            | Ad container is a sibling of `<video>` injected by OpenPlayerJS. Both live inside the same wrapper element kept on the entry; reparent the wrapper, not the bare `<video>`, so the ad UI travels with it.                                    |
| `useImperativeHandle` consumers.                          | The forwarded `<video>` reference now points at the registry's persistent element. Behaviour change explained in 'Imperative ref impact' below.                                                                                              |
| Memory growth.                                            | Count-based LRU on parked entries. See "Eviction policy" below for the policy and the chosen cap.                                                                                                                                            |
| SSR.                                                      | Provider creates the parking div in `useEffect`, never on the server; registry is a `useRef`. No DOM access at module load.                                                                                                                  |
| Hot-reloading the provider.                               | If the provider hot-replaces in dev, all entries are orphaned — accept it. In production the provider re-mounts only on route-group entry/exit; entries don't survive that boundary by design (Resolved decisions §1).                       |

## Eviction policy

When the registry holds more parked entries than its cap, one has to go. Policy: **LRU by count**.

Track `lastClaimedAt` per entry. When `parked.length > maxEntries`, evict the oldest parked entry — destroy its `OpenPlayerJS`, drop its `<video>` from the DOM, remove from the map.

- **Pros**: O(1) decision, predictable, trivial to test, no measurement noise. The cap is a knob anyone can reason about.
- **Default**: `maxEntries = 6`. Justification: a feed shows ~3 cards on screen at once, plus pre-fetch of the next 1–2; 6 covers the active window with a small safety margin.

### Triggers

- On every `release()` that brings `refCount` to 0, schedule an eviction pass.
- On Next router `routeChangeStart`, evict everything that has been parked > 5 min (cheap "page change" sweep).
- Expose `evict(handle)` and `evictAll()` for tests and explicit teardown.

## Risks

- **AdControls' tight coupling** to `playerRef.current`. Will need a small refactor to read from the entry instead.
- **Memo'd `<VideoPlayer>`**: prop-bag forwarding to `registry.apply` must keep referential stability where it matters — wrap callbacks with `useEvent`-style refs.

## Testing

The bug is mobile-only — autoplay/mute policy, gesture-gated playback, real audio output, PiP, and iOS Safari quirks don't reproduce reliably in headless browsers even with device emulation. So we split testing into "what can be automated" (the registry contract, in JS) and "what must be manual" (the actual mobile playback behaviour).

### Automated (CI)

- **Registry unit tests** under `packages/ui` using the existing test stack — **Jest + Vitest + @testing-library/react** with jsdom (see [packages/ui/jest.config.cjs](packages/ui/jest.config.cjs), [packages/ui/vitest.config.ts](packages/ui/vitest.config.ts), and the existing pattern in [button.test.tsx](packages/ui/src/components/button/button.test.tsx)). Cover the contract that gives us state preservation — pure JS, no real video decoding required:
  - claim → release → claim returns the same `<video>` element.
  - `userState` (`muted`, `volume`, `playbackRate`) survives release/claim.
  - refCount increments on a second claim of the same key, decrements on release.
  - Two simultaneous claims on the same `src` produce two distinct handles pointing at separate entries; releasing one doesn't disturb the other.
  - `evict(key)` destroys the player and removes from the map; `evictAll()` cleans everything.
  - Eviction LRU at `maxEntries` cap drops the least-recently-claimed parked entry first.
- **Storybook story `VideoPlayer/Reuse`** with a "Mount / Unmount" toggle on the same source. Used as a visual smoke test in Chromatic — no real audio assertion, just "still renders, no crash." Runs in regular Chromium.
- **Type / build** smoke: the v2 component must satisfy the existing `<VideoPlayer>` type contract so callers don't need changes during migration.

### Manual (mobile, every milestone)

The QA matrix below has to be run on real devices. Headless mobile emulation lies about autoplay policies, suspends audio output, and routinely diverges from native iOS Safari on PiP.

Devices: at minimum **iOS Safari (latest + latest-1)**. iPad Safari is informative but not gating.

All counts/state used in the checklist must be visible **on the page** (no DevTools on iOS Safari without a tethered Mac). To make this possible, `/video-reuse-test` must render a debug panel that pulls live values from the registry every ~500 ms:

- `registry.size` (total entries) and `parked.length`.
- For each entry: `key`, `refCount`, `parked`, `userState.muted`, `userState.volume`, `userState.playbackRate`, `videoEl.currentTime`, `videoEl.paused`.
- A separate counter showing `document.querySelectorAll('video').length` so duplicate-DOM regressions are visible without DevTools.

Checklist (run on `/video-reuse-test` then on `/home` when its flag flips):

- [ ] Mute → unmute → unmount the player → mount it again → still unmuted, audio plays.
- [ ] Playback at 1.5× → unmount → re-mount → playback rate preserved (read from the debug panel, since iOS Safari has no in-OS rate UI).
- [ ] Scrub to 30 s → unmount → re-mount → resumes at 30 s (within ±0.2 s, read from the debug panel).
- [ ] In a feed: unmute clip A, swipe to B, swipe back to A → A still unmuted, ad state intact.
- [ ] Two clips with the same URL on screen at once → both render (registry auto-disambiguates), mute on one doesn't affect the other.
- [ ] After 50 mount/unmount cycles on `/video-reuse-test`, the page's `<video>` count (debug panel) stays at or below `maxEntries`.
- [ ] After navigating away and back to the route group, `registry.size` returns to 0 (provider unmounted on route exit, see "Resolved decisions").
- [ ] `evict()` while the registry is at the cap drops the oldest parked entry; the active entry is never evicted (verified via debug panel counts).
- [ ] iOS Safari: silent-switch behaviour matches the legacy player.

Excluded from the checklist (and why):

- **Programmatic volume control**: `videoEl.volume` is read-only on iOS Safari; only the device volume buttons change audio level. Mute persistence covers the user-visible behaviour we care about.
- **Lock screen / backgrounded resume**: iOS aggressively suspends and resumes background video at the OS level. Differences observed there are usually iOS being iOS, not a regression in the reuse contract — out of scope for this work.
- **PiP across navigation**: iOS Safari only supports PiP from the native system controls and behaviour varies by iOS version. We accept that PiP may exit on reparenting and document it.

### Non-goals for testing

- No e2e / browser-automation harness for mute, autoplay, or PiP — the cost-to-confidence ratio on these mobile-Safari-specific behaviours is poor.
- No automated memory regression test — too flaky in headless Chromium and irrelevant to the iOS-only symptoms.

## Rollout milestones

| Milestone | What lands                                                | Owner gate                                                |
| --------- | --------------------------------------------------------- | --------------------------------------------------------- |
| M0        | Helper extractions in `video-player.tsx`. No API change.  | Code review.                                              |
| M1        | Provider + registry + `VideoPlayerV2` behind a flag.      | Manual QA on `/video-reuse-test` + Storybook reuse story. |
| M2        | Jest/Vitest unit tests + Storybook reuse story pass.      | Frontend tech-lead sign-off.                              |
| M3        | Flag flipped per-route (feed → comments → animated-tile). | One-week soak per route.                                  |
| M4        | Legacy `VideoPlayer` deleted; v2 renamed back.            | Final regression sweep.                                   |

## Resolved decisions

1. **Cross-page persistence: no.** Provider lives inside the `(new)` route group layout. When the user leaves the route group, the provider unmounts and we evict everything. Simpler lifecycle, no orphaned media on unrelated pages.
2. **Eviction policy: count-based LRU**, default `maxEntries = 6`. See "Eviction policy" for the trigger rules.
3. **Simultaneous duplicates are auto-disambiguated by the registry.** Two `<VideoPlayer>`s on the same `src` at the same time happen in production (e.g. an inline thumbnail and an expand-view of the same clip during a transition). The registry mints a shadow entry for the second claim and returns a distinct handle; both render. Only one caller gets the cached state — the other is a fresh `<video>` + `OpenPlayerJS`, matching today. Consumers do nothing special.
