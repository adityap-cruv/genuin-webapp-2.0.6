# VideoPlayerV2 Callback Rewire — Phased Plan

> Status: planning
> Owner: gruhineehotel
> Date: 2026-05-14
> Scope: `packages/ui/src/components/video-player/*` + `packages/components/src/molecules/feed-player/feed-player.tsx`

---

## Context

`VideoPlayerV2` (`video-player-v2.tsx`) is a registry-backed React view that claims a long-lived `<video>` element from `VideoRegistry` and forwards command props. It accepts the legacy `PlayerProps` API for parity with V1, but **13 ad-related callbacks** (`onAdStarted`, `onAdCompleted`, `onAdSkipped`, `onAdError`, `onAdClicked`, `onAdPause`, `onAdRequested`, `onAdFirstQuartile`, `onAdImpression`, `onAdRendered`, `onAdResponseReceived`, `onAdRenderError`, `onAdRequestFailed`) are **declared but never wired**. FeedPlayer passes them to V2 (lines 658–673), V2 destructures `PlayerProps` but only forwards command props to the registry — none of the ad callbacks reach `AdsLayer` or the DOM.

Result: every `track(EventName.AD_*)` analytics call in `feed-player.tsx` (lines 404–546) is dead code. Ad metrics in the dashboard are silently missing for the V2 path.

Additional React/perf issues found in V2:
- `console.log("loop::", { loop })` on line 82 — production debug statement, violates repo rules.
- `useLayoutEffect` deps on line 180 include `play` → toggling pause/play causes full release+re-claim instead of an `apply()`, defeating the registry reuse goal.
- Quartile callbacks captured in effect deps (line 291) — not routed through `callbacksRef`, so identity churn would force `attachQuartileTracking` to detach/reattach.
- `onEnded` coordination depends on a custom DOM event `"adsallAdsCompleted"` (line 265, 276) that **does not exist in current `AdsLayer`** — `AdsLayer` only invokes `events.allAdsCompleted` (a JS callback), never dispatches a DOM event. So the `videoCompleted && allAdsCompleted` gate currently never opens for post-roll cases; `onEnded` fires on first content-`ended` regardless of pending post-roll.

This plan implements **Approach A**: extend `AdsLayer` to dispatch granular IMA events as `CustomEvent`s on the content `<video>` element; V2 listens via the same `addEventListener` pattern it uses for native events; FeedPlayer's analytics handlers fire correctly. Approach is phased so each phase is independently shippable and behavior-preserving.

---

## Goals

1. All 13 ad callbacks fire correctly in FeedPlayer.
2. `onEnded` + post-roll coordination works deterministically (no relying on phantom events).
3. Zero registry/`AdsLayer` knowledge of React types — events flow over the DOM.
4. No `console.log` in production code.
5. No listener thrash on prop-identity churn (use `callbacksRef` everywhere).
6. `play` toggle uses `apply()`, not re-claim.
7. Each phase merges independently, no behavior regressions.

---

## Architecture: Event Bus via DOM CustomEvents

`AdsLayer` already has access to `contentVideoEl`. Add a private helper `emit(type, detail)` that dispatches `new CustomEvent(type, { detail })` on `contentVideoEl`. V2 adds one listener per event type in the same effect that wires native events — single deps array (`[src, adUrl]`), single cleanup function.

**Event names** (namespaced to avoid native event collisions, kebab-cased):

| DOM event name | V2 prop fired | IMA source |
|---|---|---|
| `genuin:ad-requested` | `onAdRequested` | before `adsLoader.requestAds()` |
| `genuin:ad-response-received` | `onAdResponseReceived` | `ADS_MANAGER_LOADED` |
| `genuin:ad-request-failed` | `onAdRequestFailed` | `AD_ERROR` pre-manager |
| `genuin:ad-rendered` | `onAdRendered` | `AdEvent.Type.STARTED` (already in IMA types but not wired) |
| `genuin:ad-impression` | `onAdImpression` | `AdEvent.Type.IMPRESSION` |
| `genuin:ad-started` | `onAdStarted` | `CONTENT_PAUSE_REQUESTED` (or `STARTED` — see Phase 3) |
| `genuin:ad-first-quartile` | `onAdFirstQuartile` | `AdEvent.Type.FIRST_QUARTILE` |
| `genuin:ad-pause` | `onAdPause` | `AdEvent.Type.PAUSED` |
| `genuin:ad-clicked` | `onAdClicked` | `AdEvent.Type.CLICK` |
| `genuin:ad-skipped` | `onAdSkipped` | `AdEvent.Type.SKIPPED` |
| `genuin:ad-completed` | `onAdCompleted` | `AdEvent.Type.COMPLETE` |
| `genuin:ad-error` | `onAdError` | `AD_ERROR` |
| `genuin:ad-all-completed` | (drives `onEnded` gate) | `ALL_ADS_COMPLETED` |

Existing `"adsallAdsCompleted"` listener in V2 (line 265) → rename to `"genuin:ad-all-completed"` and have `AdsLayer` dispatch it for real.

`CustomEvent.detail` carries the normalized ad metadata object FeedPlayer's `buildAdEventData` already expects: `{ adId, url, title, adFormat, advertiserBrandId, campaignId, lineItemId, creativeId, mediaType }`. Built once in `AdsLayer` from the IMA `Ad` object.

---

## Phase 1 — React hygiene fixes (no behavior change)

**Goal**: Clean up V2 without touching ad wiring. Independently shippable. Verifies registry-reuse story isn't already broken by `play` in deps.

### Changes

1. **[File: `packages/ui/src/components/video-player/video-player-v2.tsx`]**
   - Delete line 82: `console.log("loop::", { loop });`
   - Delete line 80 forced override `adUrl = SAMPLE_AD_TAGS.VMAP_PRE_MID_POST_WITH_BUMPERS;` — this is test scaffolding leaking into the prop. Replace with no-op (use the destructured `adUrl` as-is).
   - Remove `play` from `useLayoutEffect` deps array (line 180). Final deps: `[src, isActive]`. `play` is forwarded by the apply-effect below; re-claiming on play toggle is the bug.
   - Move quartile callbacks into `callbacksRef`: extend `callbacksRef` shape to include `onVideoFirstQuartile`, `onVideoMidpoint`, `onVideoThirdQuartile`, `onVideoWatched`. Update `attachQuartileTracking` call site (lines 282–291) to pass stable wrapper callbacks that read from `callbacksRef.current`. Quartile effect deps becomes `[src]` only (matches comment intent).
   - Add JSDoc to the component (it has a doc comment already; verify it still describes V2 truthfully after Phase 3).

2. **[File: `packages/components/src/molecules/feed-player/feed-player.tsx`]**
   - Delete lines 116, 142–143 commented-out adUrl overrides — dead code.
   - Delete `console.error` on lines 455 + 506. Replace with the project's structured logger if one exists; otherwise drop. `track(EventName.AD_REQUEST_FAILED, ...)` already captures the signal for analytics.
   - Add `useCallback` dep fix: `handleEnded` (line 289) currently captures `analyticsEventData` — already correct. No change needed but verify all `useCallback` deps are tight.

### Verification

- `pnpm typecheck` clean.
- Play feed, scrub through three videos; verify no console output from V2.
- Toggle play/pause via UI; confirm registry stats (`registry.getStats()` in devtools) show the same shared entry surviving the toggle — `entries` count should not grow.
- Quartile analytics still fire at 25/50/75% (check network tab).

---

## Phase 2 — `AdsLayer` event emitter scaffolding (additive, no consumer change)

**Goal**: Build the DOM CustomEvent emit path inside `AdsLayer`, wired only for events the SDK already handles. Existing JS-callback path (`AdsLayerEvents`) untouched — keeps registry working.

### Changes

1. **[File: `packages/ui/src/components/video-player/ads.ts`]**
   - Add private method:
     ```ts
     private emit(type: string, detail: unknown = {}): void {
       if (this.destroyed) return;
       this.contentVideoEl.dispatchEvent(new CustomEvent(type, { detail }));
     }
     ```
   - Define normalized ad-detail builder:
     ```ts
     type AdDetail = {
       adId: string | null;
       url: string | null;
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
     private buildAdDetail(adData: unknown): AdDetail { /* read from IMA Ad object via getAd() */ }
     ```
   - Emit DOM events at existing IMA hooks where data is already available:
     - In `request()` before `adsLoader.requestAds(adsRequest)`: `this.emit("genuin:ad-requested", { adTagUrl: adUrl })`.
     - In `onAdsManagerLoaded()` after assigning `this.adsManager`: `this.emit("genuin:ad-response-received", {})`.
     - In `onAdError()`: `this.emit("genuin:ad-error", { message, code })`. If `this.adsManager === null` at error time → also emit `"genuin:ad-request-failed"`.
     - In existing `CONTENT_PAUSE_REQUESTED` listener: keep `events.contentPauseRequested?.()` call; **add** `this.emit("genuin:ad-started", this.buildAdDetail(null))` (or hold for Phase 3 if Ad object only available via `STARTED`).
     - In existing `ALL_ADS_COMPLETED` listener: keep `events.allAdsCompleted?.()`; **add** `this.emit("genuin:ad-all-completed", {})`. **This is the fix for the phantom-event bug** — V2's listener becomes real.

2. Extend `ImaNamespace.AdEvent.Type` interface (top of `ads.ts`) to include new event type names IMA already supports:
   ```ts
   AdEvent: {
     Type: {
       CONTENT_PAUSE_REQUESTED: string;
       CONTENT_RESUME_REQUESTED: string;
       ALL_ADS_COMPLETED: string;
       STARTED: string;
       FIRST_QUARTILE: string;
       COMPLETE: string;
       SKIPPED: string;
       PAUSED: string;
       CLICK: string;
       IMPRESSION: string;
       LOADED: string; // → ad-rendered
     };
   };
   ```

### Verification

- `pnpm typecheck` clean.
- Open Chrome DevTools, in console run:
  ```js
  document.querySelector("video").addEventListener("genuin:ad-requested", (e) => console.log("ad req", e.detail));
  ```
- Trigger an ad, observe `ad req` log.
- Existing ad playback (post-roll, pre-roll, mid-roll) behaves identically — registry callbacks `contentPauseRequested`/`contentResumeRequested` still fire in same order.

---

## Phase 3 — Full IMA event coverage in `AdsLayer`

**Goal**: Wire remaining IMA `AdEvent` listeners and emit all 13 DOM events.

### Changes

1. **[File: `packages/ui/src/components/video-player/ads.ts`]**
   - In `onAdsManagerLoaded()`, add listeners on `adsManager` for the new IMA event types (alongside existing `CONTENT_PAUSE_REQUESTED`/`CONTENT_RESUME_REQUESTED`/`ALL_ADS_COMPLETED`/`AD_ERROR`):
     - `LOADED` → `emit("genuin:ad-rendered", buildAdDetail(getAd()))`
     - `STARTED` → `emit("genuin:ad-started", buildAdDetail(getAd()))` (move from `CONTENT_PAUSE_REQUESTED` if richer data available here)
     - `IMPRESSION` → `emit("genuin:ad-impression", buildAdDetail(getAd()))`
     - `FIRST_QUARTILE` → `emit("genuin:ad-first-quartile", buildAdDetail(getAd()))`
     - `PAUSED` → `emit("genuin:ad-pause", buildAdDetail(getAd()))`
     - `CLICK` → `emit("genuin:ad-clicked", buildAdDetail(getAd()))`
     - `SKIPPED` → `emit("genuin:ad-skipped", buildAdDetail(getAd()))`
     - `COMPLETE` → `emit("genuin:ad-completed", buildAdDetail(getAd()))`
   - `buildAdDetail` reads from IMA's `Ad` object: `ad.getAdId()`, `ad.getTitle()`, `ad.getClickThroughUrl()` (where exposed), `ad.getContentType()`, `ad.getAdPodInfo()` for `totalAds` / `currentAdIndex`. Wrap in try/catch — IMA throws on partial state.

2. **Open question**: `onAdClicked` — IMA `CLICK` events fire only if the SDK is configured to intercept clicks. Need to confirm whether `AdsRenderingSettings.useStyledNonLinearAds` / `useStyledLinearAds` is set; otherwise this event won't fire and `track(EventName.AD_CTA_CLICKED)` remains silent. **Recommendation**: ship Phase 3 with the listener wired; treat empty-click as a known limitation, document in `ADS_CAVEATS.md`.

### Verification

- For each event, add a one-off `addEventListener` in DevTools and verify firing order against IMA spec.
- Run a known VAST tag (Aniview VMAP from `sample-ad-tags.ts`) and capture network analytics calls; expect `AD_REQUESTED`, `AD_RESPONSE_RECEIVED`, `AD_RENDERED`, `AD_IMPRESSION`, `AD_STARTED`, `AD_MEDIA_PLAY`, `AD_MEDIA_QUARTILE`, `AD_COMPLETED` in order.

---

## Phase 4 — V2 wires DOM listeners; FeedPlayer `onEnded` coordination

**Goal**: V2 listens to the new DOM events, calls FeedPlayer callbacks. `onEnded` gating fixed.

### Changes

1. **[File: `packages/ui/src/components/video-player/video-player-v2.tsx`]**
   - Extend `callbacksRef` to include all 13 ad callbacks.
   - Extend the native-event `useEffect` (currently lines 192–278) to also attach listeners for the 13 `genuin:ad-*` DOM events. Each handler reads from `callbacksRef.current.onAdXxx?.(event.detail)`. Cleanup removes them.
   - **`onEnded` coordination — the tricky part**:
     - Current logic gates `onEnded` on `videoCompleted && allAdsCompleted`, with `allAdsCompleted` defaulting to `!adUrl`.
     - This is conceptually right but the gate is built around two flags both maintained inside `useEffect`-local closures. Move state to a single ref `endStateRef.current = { contentEnded, postRollPending, adsCompleted }`.
     - On `genuin:ad-all-completed`: set `adsCompleted = true`. If `contentEnded === true`, fire `onEnded` once.
     - On native `ended`: set `contentEnded = true`. Check `AdsLayer.postRollScheduled` via a new accessor exposed on the registry handle (`handle.entry.adsLayer?.postRollScheduled ?? false`). If a post-roll is scheduled, wait for `genuin:ad-all-completed`. Otherwise fire `onEnded` immediately.
     - **Why a ref, not state**: re-renders for end-tracking are wasteful — `onEnded` is a side-effect call, not a render input.
     - Reset all three flags on src change.
   - Hand the registry an opaque "is post-roll scheduled" probe instead of duplicating cue-point logic. Add `getPostRollScheduled(handle: ClaimHandle): boolean` to `VideoRegistry` interface → reads `entry.adsLayer?.postRollScheduled`. Keeps registry-DOM-React boundary clean.

2. **[File: `packages/ui/src/components/video-player/registry.ts`]**
   - Add `getPostRollScheduled(handle: ClaimHandle): boolean` to `VideoRegistry` interface and implementation. Pure read, no side effects.

3. **[File: `packages/components/src/molecules/feed-player/feed-player.tsx`]**
   - **No behavior changes needed** — `handleEnded` already does the right thing: track `VIDEO_COMPLETED`, call `stateHandleEnded`, call user's `onEnded`. The wiring change is upstream in V2.
   - Verify `handleAdCompleted` fires for each ad in a pod (currently called per-ad; if VMAP has multiple ads, `onEnded` will only fire after the final `genuin:ad-all-completed`). Confirm desired behavior with product — current intent appears to be "video done = both content done AND all ad breaks done", which matches.

### Verification

- Play a VMAP with pre+mid+post-roll. Confirm `onEnded` fires **once**, after the post-roll completes — not after content-`ended`.
- Play a non-ad video. Confirm `onEnded` fires immediately on content-`ended`.
- Play a video with `loop=true` + post-roll. Confirm `AdsLayer.onContentTimeUpdate` loop-wrap path triggers post-roll, `onEnded` fires after post-roll.
- Run an ad-error scenario (use bad VAST URL). Confirm `onAdError` fires, then content plays through, then `onEnded` fires after content `ended` (no post-roll because manager failed).

---

## Phase 5 — Cleanup & test coverage

### Changes

1. **[File: `packages/ui/src/components/video-player/registry.test.ts`]**
   - Add tests:
     - Toggling `play` prop does not increment `registry.getStats().entries`.
     - `getPostRollScheduled` returns true after VMAP with `-1` cue.
   - Tests for V2 native event flow (jsdom — limit to listener attach/detach assertions; full play loop tested in Storybook/playwright).

2. **[File: `packages/ui/src/components/video-player/docs/ARCHITECTURE.md`]**
   - Add a "DOM Event Bus" section documenting `genuin:ad-*` event names, `CustomEvent.detail` shape, and the rationale (registry-DOM-React separation).

3. **[File: `packages/ui/src/components/video-player/docs/ADS_CAVEATS.md`]**
   - Document `onAdClicked` limitation (requires IMA click interception config).

4. **[Optional] remove transitional shim**: if V1 (`video-player.tsx`) and V2 share `PlayerProps` and V1 already supports these events directly, no shim needed. If not, add a comment in `PlayerProps` explaining that V1 wires through OpenPlayerJS, V2 wires through DOM CustomEvents — both observe the same prop contract.

---

## Critical Files

- `packages/ui/src/components/video-player/video-player-v2.tsx` — primary site of React fixes + DOM listener wiring.
- `packages/ui/src/components/video-player/ads.ts` — emit DOM events for all IMA events.
- `packages/ui/src/components/video-player/registry.ts` — expose `getPostRollScheduled`.
- `packages/components/src/molecules/feed-player/feed-player.tsx` — clean dead code + console.error.
- `packages/ui/src/components/video-player/registry.test.ts` — new tests.
- `packages/ui/src/components/video-player/internals.ts` — no change (quartile helper stays as-is; V2 wraps it).

---

## Reused Existing Code

- `attachQuartileTracking` (`internals.ts:116`) — V2 already uses it. Phase 1 routes its callbacks through `callbacksRef` but keeps the helper unchanged.
- `AdsLayer.postRollScheduled` getter (`ads.ts:573`) — already exists; just needs a registry-level accessor.
- `AdsLayer.events` callbacks (`contentPauseRequested`, etc.) — keep for registry-side state mgmt; DOM emit is additive, not replacement.
- `buildAdEventData` (`feed-player.tsx:388`) — keeps its current shape; `CustomEvent.detail` matches what it reads.
- `callbacksRef` pattern (V2 lines 95–116) — extend it; don't invent a parallel system.

---

## Constraints Flagged (Approval Required)

- **Changes to `packages/ui/components/video-player/`** affect both `apps/webapp` and `packages/web-sdk`. Web-SDK consumers of `VideoPlayerV2`/registry must be tested independently. **Flag before merging Phase 4.**
- No auth/CORS/CSP changes.
- No new external deps.
- No public API rename — `PlayerProps` shape unchanged, just newly-honored.

---

## React Best-Practices Checklist

- ✅ **Callbacks via ref**: every callback prop read through `callbacksRef` so listener attach/detach isn't tied to render identity (avoids quadratic listener churn).
- ✅ **Stable effect deps**: `[src, adUrl]` for event wiring; `[src]` for quartile; `[src, isActive]` for claim/release.
- ✅ **`useLayoutEffect` only for DOM mutation phase work** (claim/release reparenting) — keep as-is.
- ✅ **No state used for side-effects only** (`endStateRef` is a ref, not state).
- ✅ **`React.memo` retained** on both V2 and FeedPlayer; new wiring doesn't break memoization (no new inline objects passed as props).
- ✅ **No `console.log` / `console.error`** in committed code.
- ✅ **Cleanup symmetry**: every `addEventListener` has a paired `removeEventListener` in the same effect's cleanup.
- ✅ **No prop-drilling React types into DOM layer** — `AdsLayer` and `VideoRegistry` stay framework-agnostic. Bridge is the DOM `CustomEvent`.
- ✅ **Performance**: `dispatchEvent` is synchronous and cheap; one per IMA event is fine. No additional renders triggered by ad events (all consumed in refs).

---

## Verification — End-to-End

1. `pnpm typecheck && pnpm lint` — clean.
2. `pnpm --filter @genuin/webapp dev` — open feed, scrub through 5 videos.
3. Network tab: confirm `AD_REQUESTED`, `AD_RESPONSE_RECEIVED`, `AD_RENDERED`, `AD_IMPRESSION`, `AD_STARTED`, `AD_MEDIA_PLAY`, `AD_MEDIA_QUARTILE`, `AD_COMPLETED`, `AD_CTA_CLICKED` (if clicked), `AD_SKIPPED` (if skipped), `AD_PAUSED` (if paused), `VIDEO_*` analytics events fire on a known VMAP.
4. Registry stats: `total === 1`, `parked` toggles 0↔1 on swipe, `entries` never grows.
5. Post-roll: `onEnded` fires exactly once, after post-roll completes.
6. Storybook: existing `video-player.stories.tsx` scenarios all green.
7. Test page in `packages/web-sdk` — embed renders, ads fire, no regressions.

---

## Rollback Strategy

Each phase is independently revertable:
- Phase 1: pure cleanup, no API change.
- Phase 2: additive DOM emits; if listeners aren't attached they're no-ops.
- Phase 3: more additive emits.
- Phase 4: this is the behavior-changing phase. Feature-flag the new `onEnded` path behind a prop (`useStrictEndCoordination?: boolean`, default `true`) so consumers can opt back to the old behavior if regressions surface.
- Phase 5: docs + tests; no functional risk.
