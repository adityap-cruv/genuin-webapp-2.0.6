# CXR Ad-Removal Risk Audit

> **Point-in-time snapshot — line numbers may drift.** This audit was run against the
> codebase as of 2026-07-02, before `AdProvider.tsx` was rewritten (commit `ad1910f74`,
> 2026-07-17) to drop its props (`tagId`/`tagHeight`/`tagWidth`/`adLayout` now come from
> `useTagDetails()`), add single-hit deferred passback (`noFillSlotsRef`,
> `firePassbackIfExhausted`, `recordAdBreakResult`) and the Infolinks Impression event.
> Findings that cite `AdProvider.tsx` or `waterfall.ts` line numbers should be
> re-verified against current source before acting on them — treat this as a historical
> record of the audit methodology and root-cause reasoning, not a live reference.

**Package:** `@genuin/contextual-reels`
**Date:** 2026-07-02
**Scope:** Every code path in `packages/contextual-reels/src` that can cause Chrome to
unload the ad frame (Heavy Ad Intervention) or trip Google's automated ad-policy
detection.
**Method:** Nine parallel code audits — five on the core render/resource surface
(network, CPU, layout/viewability, descendant iframes/SDKs, lifecycle/leaks) and
four gap-closing passes (strategies, platform, multi-instance, ad-waterfall deep
read) — each finding then re-verified against the actual source before inclusion
here.

> **How to read severity.** Findings are ranked by how directly they cause a
> removal, weighted by whether the mechanism is **confirmed in our code** vs.
> **dependent on upstream** (VAST responses, third-party SDKs) vs. an **estimate**.
> Byte/CPU numbers from the audit agents are *modeled estimates* unless marked
> **measured**. The only measured figure we have today is the ~18 MB / 30 s total
> transfer reported by the PR #364 harness — see [Measured baseline](#measured-baseline).

---

## TL;DR — the one root cause behind the removals

**Every feed entry mounts a live player, and every mounted player starts pulling
HLS segments regardless of whether it is the active slide.** That single design
choice is responsible for the confirmed HAI network breach and most of the CPU
pressure. Fix it and the intermittent removals almost certainly stop.

Two files, three lines:

| # | File | Line | What it does |
|---|------|------|--------------|
| **R1** | [`feed/ReelList.tsx`](../src/feed/ReelList.tsx#L61) | 61 | `entries.map()` mounts **all N** slides — virtualization intentionally removed so Embla has real scroll height. |
| **R2** | [`player/usePlayerLifecycle.ts`](../src/player/usePlayerLifecycle.ts#L265) | 265 | `hls.startLoad(-1)` is called **unconditionally** on mount, defeating the `autoStartLoad:false` design. |
| **R3** | [`player/usePlayerLifecycle.ts`](../src/player/usePlayerLifecycle.ts#L291) | 291 | IMA `enablePreloading: true` preloads ad creatives on every ad slide. |

R1 × R2 = N parallel segment fetches inside the 30 s un-interacted window ⇒ HAI's
4 MB network limit is blown. The careful byte-conservation elsewhere in the player
(lowest-rendition pinning, 100 KB buffer, `stopLoad()` on inactive) cannot win the
race, because line 265 fires the moment `import("hls.js")` resolves — *before* the
`onReady` handler's `stopLoad()` at line 370 runs.

<a name="measured-baseline"></a>
### Measured baseline & progress

The `ad-resource-budget` harness is the source of the **measured** numbers.
Run per-tag: `pnpm --filter @genuin/contextual-reels run budget` (video+ad), or
all three variations with a scorecard: `pnpm --filter @genuin/contextual-reels run budget:all`.

> ⚠️ **Env matters.** With a mis-set env the QA tag returns **no video fill** and
> the harness reads ~1.6 MB (bundle only) — a false pass. Always confirm real
> video + ad creatives load (heaviest requests should be `b-cdn.net` video /
> `audio-ads`, not just `chunks/`). Fill is non-deterministic; use `--runs 3+`.
> The earlier "~6.2 MB after N2" figure in this doc's history was a no-fill
> artifact and has been corrected below.

**Baseline (correct env, worst-of-3):** video+ad ~14 MB, ads-only ~10 MB,
video-only ~10 MB — all over the 4 MB HAI ceiling.

**After the frontend levers** (auto-advance gate, active-slide-only load, Octo
lazy-load, hls.light — see the Done list): video+ad ~9–10 MB, ads-only ~6–7 MB,
video-only ~8 MB. CPU is far under limit for all three (≤4 s total, ≤4 s peak,
≤13 % avg). **Still over 4 MB** — the overage is no longer runaway prefetch; the
heaviest requests are now:

- **~2.6–4.2 MB** — `…b-cdn.net/{id}/play_720p.mp4`. **A direct 720p MP4, not
  HLS** — a **GenAd audio-ad creative**, not CXR reel content (CXR reels are
  always m3u8). Because `content` ends in `.mp4` it takes the `video.src = content`
  branch ([usePlayerLifecycle.ts](../src/player/usePlayerLifecycle.ts)) — no buffer
  cap, no rendition control (our hls.js caps apply only to `.m3u8`). One such file
  alone ≈ the whole 4 MB ceiling.
- **~1.2 MB** — the ad creative (`media.begenuin.com/audio-ads/…`) — upstream, IMA/GenAd.
- **~1.5 MB** — our JS/CSS bundle (`chunks/index` 599 KB core, `App`, `Feed`,
  `cxr.css` 255 KB). Note `cxr.css` is fetched **3×** per cold load (shadow-DOM +
  loader link + `@property` fetch, none deduped by `max-age=0`) — a known ~510 KB
  waste, deferred (shared/sensitive shadow-DOM code, partly a CDN-header issue).

So the remaining gap is (a) a **backend-served 720p MP4 creative** on the uncapped
`video.src` path, (b) upstream creative weight, (c) our bundle size — **not** the
N-slide prefetch this audit started from.

**Root of (a) — and why it's not a clean frontend fix.** The Bunny CDN offers each
video as both `playlist.m3u8` (adaptive → hits our *capped* hls.js path) and
`play_720p.mp4` (fixed 720p → uncapped). The fill handed CXR the **MP4**. We don't
choose the format or rendition — the creative does. Frontend options are all
fragile (URL-rewriting `play_720p.mp4` → `playlist.m3u8` guesses CDN structure; a
blanket "reject MP4" breaks legitimate MP4 creatives). **The correct fix is
backend/ad-ops: serve CXR reel slots an HLS variant or a lower-rendition creative,
not a 720p MP4.** Flagged for the ads team.

Bundle size (c) is the one clean frontend lever left (code-split `Feed`/`index`
chunks), worth ~1.2 MB — a separate performance task.

---

## The two enforcement layers (why these matter)

1. **Chrome Heavy Ad Intervention (HAI) — the hard limit.** An un-interacted ad
   frame that crosses any of these is unloaded and replaced with a gray "Ad
   removed" box:
   - **> 4 MB** transferred (frame **plus all descendant iframes**)
   - **> 15 s** main-thread CPU in any 30 s window
   - **> 60 s** total main-thread CPU
2. **Google ad-policy detection — the softer spiders.** Viewability
   misreporting, layout shift (CLS), size mismatch, autoplay-with-sound,
   lifecycle/event double-counting. These degrade quality scores and can block
   serving.

---

## Findings by dimension

Severity key: **P0** stop-the-bleeding · **P1** fix next · **P2** hardening ·
**P3** hygiene. "Confidence" = Confirmed (read in code) / Upstream-dependent /
Estimate.

### A. Network / transferred bytes → HAI 4 MB

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| N1 | **P0** | Confirmed | [ReelList.tsx:61](../src/feed/ReelList.tsx#L61) | All N entries mount a player; no virtualization. | Mount player only for `activeIndex ± 1`; render poster placeholder otherwise. Keep wrapper in-flow so Embla scroll height is preserved. |
| N2 | **P0** | Confirmed | [usePlayerLifecycle.ts:265](../src/player/usePlayerLifecycle.ts#L265) | Unconditional `hls.startLoad(-1)` on mount, before the `onReady` `stopLoad()` guard (L370) can run. | Gate on `isPlayRef.current`: only the active slide starts loading; else `stopLoad()`. |
| N3 | **P1** | Confirmed | [usePlayerLifecycle.ts:291](../src/player/usePlayerLifecycle.ts#L291) | IMA `enablePreloading: true` fetches ad creative on every ad slide. | Set `enablePreloading` to active-slide-only, or gate behind unmute. |
| N4 | **P2** | Estimate | [LightPlayer.tsx:114](../src/player/LightPlayer.tsx#L114) | `poster` loads on every mounted `<video>`; small-variant rewrite (`feedTransforms`) not applied consistently. | Enforce `/s/` poster variant in `normaliseFeed`; posters only for near-window slides. |
| N5 | **P2** | Confirmed | [services/feed.ts](../src/services/feed.ts) | Feed fetched in one batch; no progressive/infinite load. Batch size set by backend, unvalidated client-side. | Progressive batch loading; only fetch beyond first batch on scroll. |
| N6 | **P3** | Estimate | [VideoLayout.tsx](../src/feed/layouts/VideoLayout.tsx) (`OctoSheet`) | GenAI SDK/model can load when `genAiEnabled`. | Lazy-load on explicit interaction (already partly dynamic-imported — verify). |

> **Note on N2 vs. existing safeguards.** The player is *already* written for
> conservation: `autoStartLoad:false, startFragPrefetch:false` (L228), lowest-level
> pinning (L234-247), `maxBufferSize` clamp (L230), `stopLoad()` on inactive
> (L186, L370). N2 is the single line that bypasses all of it. This is the
> highest-leverage fix in the whole audit.
>
> The audit flagged the 100 KB `maxBufferSize` (L230) as forcing re-fetches. Left
> as-is here: it is a deliberate conservation choice and re-fetch overhead is
> second-order next to N1/N2. Revisit only if throttled CPU passes still fail.

### B. Main-thread CPU → HAI 15 s / 60 s

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| C1 | **P0** | Confirmed | [ReelList.tsx:61](../src/feed/ReelList.tsx#L61) | N × (Vlitejs init + `import("hls.js")` + manifest parse) synchronous work at mount. Scales O(N). | Same virtualization as N1 — do not initialize off-window players. |
| C2 | **P1** | Confirmed¹ | [playerEvents.ts:127](../src/player/playerEvents.ts#L127) | `timeupdate` handler runs `Promise.all` + quartile math per tick; **not** guarded by `isActive`. | Guard the handler body on active/playing. |
| C3 | **P2** | Confirmed | [useFeedNavigation.ts:72](../src/feed/useFeedNavigation.ts#L72) | `slidesInView` → `setVisibleIndices(new Set(...))` re-renders on every scroll frame; drives per-slide opacity. | Debounce/rAF-batch; or drive visibility via CSS, not React state. |
| C4 | **P2** | Confirmed | [VideoLayout.tsx:99](../src/feed/layouts/VideoLayout.tsx#L99) | `ResizeObserver` → `setDimensions` re-render; fires ~16-30× during fullscreen transition. | Debounce callback; `contain: layout`. |
| C5 | **P3** | Confirmed | [analytics.ts](../src/analytics/analytics.ts) | `deepMergeOverwrite` on every event emission; hot during playback. | Cache merged defaults; merge overrides only when changed. |
| C6 | **P3** | Confirmed | [ReelList.tsx:61](../src/feed/ReelList.tsx#L61) | `ReelItem` not `React.memo` — every `activeIndex`/`visibleIndices` change re-renders all N. | `React.memo` with `isActive` comparator. |

¹ **Corrected from the raw audit.** The handler is genuinely ungated, **but**
inactive players receive `isPlay = isActive && isPlaying` (VideoLayout
[L218](../src/feed/layouts/VideoLayout.tsx#L218), [L242](../src/feed/layouts/VideoLayout.tsx#L242)),
which triggers `pause()` + `stopLoad()` (usePlayerLifecycle L184-190). A paused
`<video>` does not fire `timeupdate`. So the audit's "30 fps × N off-screen
players" figure is **overstated** — the real cost is the mount/init (C1), not
per-tick work on idle slides. C2 still worth guarding for the active player.

### C. Layout / viewability / policy spiders

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| L1 | **P1** | Confirmed | [GenAdSlot.tsx:106](../src/ads/GenAdSlot.tsx#L106) | If `dimensions` never populated (ResizeObserver never fires while hidden), slot can stay 0-sized or size-mismatched. | Fall back to declared layout-variant dims; don't mount ad until a real size is known. |
| L2 | **P1** | Confirmed | [App.tsx:312](../src/app/App.tsx#L312) | `MutePassbackGuard` arms on `player:play`, not on ad-request. Passback can fire while an ad is mid-fill → conflicting fill/fail events (policy: malformed waterfall). | Arm on request (`status === "requesting"`); guard `if (adLoaded) return`. See also LK-race. |
| L3 | **P2** | Confirmed | [App.tsx:159](../src/app/App.tsx#L159) | Overlay root is `overflow-visible`; `CloseButton` uses negative offsets ([CloseButton.tsx:12](../src/app/CloseButton.tsx#L12)) → content escapes declared slot bounds. | Clip to slot (`overflow-hidden`) or position button inside bounds. |
| L4 | **P2** | Confirmed | [VideoLayout.tsx:148](../src/feed/layouts/VideoLayout.tsx#L148), [305](../src/feed/layouts/VideoLayout.tsx#L305) | Opacity (300 ms) and player-height (320 ms) transitions can cause CLS during ad-break/split. | `will-change` + `contain: layout`; stabilize size before animating. |
| L5 | **P2** | Confirmed | [config.ts](../src/config.ts) (stacked) | Stacked layout renders only the top half but analytics may report the full slot size (e.g. 320×100 vs actual 320×50). | Report actual rendered dims in `tag_captured`. |
| L6 | **P3** | Confirmed | [tailwind.css:157](../src/styles/tailwind.css#L157) | `body.cxr__body--fullscreen { overflow:hidden }` exists but the class may not be applied by `useFullscreenClasses` — page can scroll behind fullscreen. | Apply the body class on fullscreen enter; restore on exit. |

> **REJECTED — not real violations** (raw audit flagged these; verification
> disproved them):
>
> - ❌ **"`muted` attribute is an autoplay-with-sound violation" (audit #1, #7,
>   marked CRITICAL).** Backwards. **Muted autoplay is the *compliant* path**;
>   *unmuted* autoplay is the violation. The element is intentionally `muted`
>   ([LightPlayer.tsx:121](../src/player/LightPlayer.tsx#L121)) and the app models
>   audible level via `volume`, unmuting only after playback starts — documented at
>   [usePlayerLifecycle.ts:142-151](../src/player/usePlayerLifecycle.ts#L142). No fix
>   needed. The video also correctly has **no** `autoplay` attribute (JS-driven
>   play is fine and expected for gated playback); the audit's "add `autoplay`"
>   suggestion (#10) is rejected.
> - ❌ **AdControlLayer click-trap (audit #4).** The `ClickOverlay` it worries about
>   is commented out and the bar is `pointer-events-none`. No live trap.

### D. Descendant iframes / third-party SDKs → aggregate into the *same* HAI budget

**HAI counts every descendant iframe's bytes and CPU against the ad frame's one
budget.** These are the SDKs that can inject frames/creatives:

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| I1 | **P1** | Upstream-dependent | [usePlayerLifecycle.ts:281](../src/player/usePlayerLifecycle.ts#L281) | IMA follows VAST `<Wrapper>` chains with **no depth cap**; each hop = request + parse. Wrapper contents are upstream (Triton/Infy), not frozen. | Set a wrapper-depth cap if IMA exposes one; monitor VAST response sizes. |
| I2 | **P1** | Upstream-dependent | same | IMA may inject **companion-ad iframes** and run **VPAID** (arbitrary vendor JS) — both aggregate into the HAI budget. | `enableCompanionAds: false` if unused; consider rejecting VPAID creatives. |
| I3 | **P2** | Confirmed | [genAdSdk.ts:44-66](../src/ads/genAdSdk.ts#L44) | GenAd SDK JS+CSS loaded once (async); internal per-provider ad requests are **unbounded** by our code. | Cap providers per slot; add request-count monitoring. |
| I4 | **P2** | Confirmed | [rudderstack.ts:34-75](../src/analytics/rudderstack.ts#L34) | RudderStack SDK + a `polyfill-fastly.io` polyfill loaded; event POSTs unbatched. | Drop the polyfill on modern targets; batch/throttle events. |
| I5 | **P3** | Confirmed | [infolinks.ts:27-66](../src/utils/infolinks.ts#L27) | Infolinks runs in its **own** iframe (`srcdoc`) → separate HAI budget, *not* the ad frame's. Still unbounded internally. | Lazy-create only when the stacked layout is active. |

> **Confidence caveat for I1/I2:** these are inherent IMA behaviors. Whether they
> *actually* fire depends on the VAST our demand partners return — not provable
> from our source alone. Treat as "known risk to monitor," not "confirmed active."

### E. Lifecycle / cleanup / leaks → slow accumulation toward the ceilings

The package has **good cleanup fundamentals** (EventBus subs, HLS `destroy` +
`detachMedia`, global coordinators unregister on unmount — all verified clean).
Residual gaps:

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| LK1 | **P2** | Confirmed | [usePlayerLifecycle.ts:234](../src/player/usePlayerLifecycle.ts#L234) | `hls.on(MANIFEST_PARSED)` never `.off()`'d. (Low impact — `destroy()` frees most, but breaks cleanup symmetry.) | `.off()` in the cleanup return, or store the handler ref. |
| LK2 | **P2** | Confirmed | [playerEvents.ts](../src/player/playerEvents.ts) | Vlitejs `player.on(...)` and native `video.addEventListener(play/playing)` handlers never explicitly detached before `destroy()`. | Store handler refs; detach before destroy. |
| LK3 | **P2** | Confirmed | [App.tsx:308](../src/app/App.tsx#L308) | `MutePassbackGuard`: if the widget unmounts **before** any `player:play`, `timerId` is `undefined` and the cleanup clears nothing — but no timer was set either, so this is benign as written. The real risk is the fired callback touching an unmounted context. | Move `clearTimeout(timerId)` unconditionally (already effectively safe); ensure `onAdFail` no-ops post-unmount. |
| LK4 | **P2** | Confirmed | [OctoSdkPanel.tsx:228](../src/genai/octo/OctoSdkPanel.tsx#L228) | Unmount cleanup uses a bare `setTimeout(...,0)` whose id is never stored → can't be cancelled; rapid open/close can double-destroy. | Store the timer id in a ref and clear it. |
| LK5 | **P3** | Confirmed | [AdProvider.tsx:120](../src/providers/AdProvider.tsx#L120) | `installGenaiBridge` deps include inline callbacks → re-subscribes on every parent re-render if callbacks aren't stable. | Memoize the callbacks. |
| LK-race | **P1** | Confirmed | App.tsx / genAdSdk.ts | Passback-vs-fill race (same as **L2**) — cross-listed because it is both a lifecycle and a policy issue. | Fix once via L2. |

> **Verified clean (no action):** all `bus.on()` have matching unsubscribes;
> `GlobalPlayerCoordinator` / `GlobalMuteCoordinator` unregister per instance;
> fetches use `cancelled` flags instead of `AbortController` but guard state
> updates safely.

### F. Ad waterfall — terminal-event correctness & attempt bounding

The no-fill retry path can emit malformed waterfall signals (multiple/late
terminal events), which Google's ad stack treats as a viewability/fraud signal
and can sanction. Two of these are **verified in code** (asymmetry / missing
guard); the rest depend on GenAd SDK internals CXR cannot introspect.

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| W1 | **P1** | Confirmed | [genAdSdk.ts:374](../src/ads/genAdSdk.ts#L374) | `onWaterfallSuccess` has **no `if (cancelled) return`** guard, but `onWaterfallFail` (L415-417) sets `cancelled`. A late fill after unmount/no-fill fires `ad:fill` after `ad:nofill` → **double terminal event**. | Add `if (cancelled) return;` as the first line of `onWaterfallSuccess`. |
| W2 | **P1** | Confirmed¹ | [waterfall.ts:28](../src/ads/waterfall.ts#L28), [AdProvider.tsx:96](../src/providers/AdProvider.tsx#L96) | `shouldCountFill`/`shouldCountNoFill` return `true` for *all* counts when `singleHitWaterfall === false`. On a non-single-hit tag, `onAdSuccess`/`onAdFail` forward **once per stage** → duplicate `AD_IMPRESSION` / `AD_PASSBACK`. | Guard both callbacks with a fired-once ref independent of `singleHitWaterfall`. |
| W3 | **P2** | Estimate | [normalizers.ts:124](../src/ads/normalizers.ts#L124) | Provider arrays (`banner[]`/`native[]`/`video[]`) passed to `GenAd.init()` with **no size cap**. A large array = the SDK attempts every entry, each pulling creative bytes. (Audit's "20 MB" math is fictional; the *missing cap* is real.) | `.slice(0, N)` per provider in the normalizers; validate backend contract. |
| W4 | **P2** | Estimate | [genAdSdk.ts:292](../src/ads/genAdSdk.ts#L292) | `gateOnUnmute` request re-arm on fast swipe-away-and-back can leave the original request in flight while a new instance arms → two parallel requests. | Generation id / key ad slot by reel id so stale callbacks are dropped. |
| W5 | **P2** | Upstream-dependent | [genAdSdk.ts:402](../src/ads/genAdSdk.ts#L402) | `onStageFail` has no CXR-side teardown; abandoned per-stage creatives/iframes keep loading *if* GenAd doesn't reclaim them. CXR can't see GenAd internals. | Confirm GenAd reclaims per-stage resources; else add explicit teardown. |
| W6 | **P2** | Upstream-dependent | [genAdSdk.ts:540](../src/ads/genAdSdk.ts#L540) | Unmount sets `cancelled` and calls `GenAd.destroy()`, but the `_loadSdk()` promise may resolve after unmount; whether in-flight GenAd requests abort is upstream. | Wrap the load path so late resolution is a no-op (the `cancelled` check at L341 helps); verify GenAd aborts on destroy. |

¹ **Condition on W2:** the currently-configured tags set `singleHitWaterfall: true`
(verified in `strategyConfig.ts`), which *does* dedup terminal events correctly.
W2 bites only tags **without** that flag (the default). Fix it anyway — the guard
should not depend on a per-tag strategy being set.

> **Cross-ref:** W1 is the mechanical twin of **L2 / LK-race / S1** — they are the
> same "fill-after-fail" family seen from different angles (layout/policy,
> lifecycle, strategy timing, and the waterfall callback itself). One coordinated
> fix (idempotent, cancellation-guarded terminal events armed on ad-request)
> closes all four.

### G. Strategy layer (mutePassback / gateOnUnmute / TAG_STRATEGIES)

The strategy layer is otherwise **clean and pure** (no polling, no per-request
state leaks, `singleHitWaterfall` dedup verified working). Real issues:

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| S1 | **P1** | Confirmed | [feedTransforms.ts](../src/feed/feedTransforms.ts) (`gate_on_unmute ?? gateOnUnmute`) + [App.tsx:305](../src/app/App.tsx#L305) | Exact trigger for the fill-after-passback race: backend per-ad `gate_on_unmute:false` on a tag whose strategy is `mutePassback:true` → ad requests immediately (ungated) while passback still arms on `player:play` and fires at 3 s. If the ad filled in between → fill + fail. | Arm passback only when the *resolved* ad is gated; guard `if (adLoaded) return`. Same fix as W1/L2. |
| S2 | **P2** | Confirmed | [StrategyProvider.tsx:43](../src/strategies/StrategyProvider.tsx#L43) | Experiment bucket uses `Math.random()` **per mount** → gating/passback behavior can flip across reloads in one session (non-deterministic viewability, hard to repro). | Persist the roll in `sessionStorage` keyed by tag id. |
| S3 | **P2** | Confirmed | [strategyConfig.ts](../src/strategies/strategyConfig.ts) (`TAG_STRATEGIES`) | Hardcoded per-tag registry; an unknown tag silently falls back to defaults (safeguards like gating/passback *off*). Config drift = a live tag missing its intended safeguard, no warning. | Warn on unknown tag id; plan to server-fetch strategies. |

> **Verified compliant (no action):** the muted-element + `volume=0` model is the
> *correct* autoplay path; `singleHitWaterfall` dedups terminal events; strategy
> resolution is pure with no cross-instance persistence.

### H. Platform / environment

`platform/` itself is pure, cheap, and correct. One real cross-cutting risk lives
in the player but is *triggered* by platform:

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| PL2 | **P1** | Confirmed (measured) | [usePlayerLifecycle.ts:320](../src/player/usePlayerLifecycle.ts#L320) | When `content` is a `.mp4` (not `.m3u8`), `video.src = content` — **no buffer cap, no rendition control** (our hls.js caps apply only to HLS). A backend fill served a **720p MP4** (~3 MB, the measured heaviest request). Browser-agnostic. | Backend/ad-ops: serve HLS or a lower rendition to CXR slots. Frontend can't cap a raw MP4 without fragile CDN-URL rewriting. |
| PL1 | **P1** | Confirmed | [usePlayerLifecycle.ts:215](../src/player/usePlayerLifecycle.ts#L215) | When `HlsClass.isSupported()` is false → `video.src = content` native HLS runs its **own ABR and climbs to the highest rendition**, bypassing our pinning. **Safari/iOS always take this path** (no MSE). *Separate from PL2 and NOT the current measured breach* (that's the MP4). | Low-bitrate variant playlist, or accept-and-monitor on Safari; defer until it actually breaches. |

> **Verified compliant (no action):** autoplay/mute correct on both HLS paths;
> lifecycle events fire on native and hls.js paths (no viewability gap); the
> `postMessage` ad bridge is standard with no heavy webview SDK; iOS-fullscreen
> disable and mobile-nav hiding are UI-only.

### I. Multiple instances on one page

**CXR's per-instance isolation is sound and verified:** each widget gets its own
`InstanceProvider` → `EventBus` → `UserInteractionTracker` → `PlayerProvider`;
global coordinators unregister on unmount; `window.cxr` events carry `instanceId`
for filtering; RudderStack and Infolinks are isolated. Cross-instance play/mute
pausing is **intentional UX**, not a leak.

| ID | Severity | Confidence | File:line | Mechanism | Fix direction |
|----|----------|-----------|-----------|-----------|---------------|
| M1 | **P0-if-shared** | Estimate (needs runtime check) | [genAdSdk.ts](../src/ads/genAdSdk.ts) + GenAd SDK (external) | HAI is measured per ad-frame-subtree. **If GenAd renders all ad slots into one page-level iframe, every instance × every slide aggregates into a single 4 MB / 15 s / 60 s budget** — one widget can blow the budget for all. If GenAd uses a frame per instance/slot, budgets stay separate. CXR cannot introspect this. | **Verify empirically:** embed two widgets, DevTools → count `gen_ad` iframes. One shared frame → escalate to the GenAd team. |

> This is the single item this audit **cannot resolve from source alone.** It is
> the most important open question for multi-widget pages and must be checked at
> runtime before relying on multi-instance embeds.

---

## Priority-ordered remediation

Status: ✅ done · ❌ rejected on verification (false positive) · ⏳ open ·
🔍 needs runtime/upstream info (not fixable from source).

**Done — byte-reduction levers (measured, correct env: video+ad ~14 → ~9–10 MB):**
- ✅ **N2** — `startLoad(-1)` gated + HLS buffer limits moved into the constructor
  (`maxBufferLength: 6`; the old post-construction `maxBufferSize` assignment was a
  no-op). Cut the ~18 MB runaway buffer. Also fixed the swipe-in deadlock: HLS load
  toggles above the `isPlayerReady` guard.
- ✅ **N2b — mount-time `startLoad(-1)` now gated on the active slide** (a refinement
  of N2): inactive mounted m3u8 slides no longer pull their first segments at mount
  (was ~6 videos' worth). They defer to swipe-in. Off-screen videos dropped ~500 KB → ~70 KB each.
- ✅ **Auto-advance gate** — `ReelList` no-ops `onEnded` auto-advance until the user
  first interacts (`useUserInteracted`). Un-interacted (HAI's measured state) no
  longer plays through multiple videos in the 30 s window. Real navigation unchanged.
- ✅ **N6 / Octo lazy-load** — `VideoLayout` + `VideoControlLayer` statically imported
  `OctoSheet`, pulling the GenAI SDK (markdown + lucide) into the eager graph even
  for `genAiEnabled=false` tags. Now `lazy()` + `SafeSuspense`; ships in its own
  chunk that loads only when Octo renders (verified 0 loads for video+ad). Correctness
  win; did not move video+ad bytes (genai wasn't in that tag's runtime path).
- ✅ **hls.light** — runtime imports `hls.js/light` (CXR uses none of the dropped
  features). Chunk 735 → 497 KB (−238 KB) on every m3u8 tag.
- ✅ **dummyFeed tree-shake** — [`FeedProvider.tsx`](../src/providers/FeedProvider.tsx)
  statically imported the ~66 KB dev fixture `dummyFeed.json`; `USE_DUMMY_FEED` was a
  hardcoded `false`, but the live reference kept Rollup from dropping it, inlining the
  JSON into the `App` chunk. Gated the flag on `import.meta.env.DEV` (false in every
  `vite build`) so the reference dies and the side-effect-free JSON is tree-shaken out
  — **`App` chunk 187 → 126 KB (−61 KB raw / ~−6 KB gzip)**, no orphan chunk emitted.
  `App` loads on every reel view. The dev toggle still works under `npm run dev`.
- ✅ **cxr.css 3× → 2× cold-load** — [`shadow-dom.ts`](../src/shadow-dom.ts) fetched the
  255 KB stylesheet three times per cold load: the loader head `<link>`, a cloned
  `<link>` into the shadow root, and the `@property`-hoist `fetch()`. The shadow clone
  now **adopts the already-fetched text** via a shared constructable `CSSStyleSheet` +
  `adoptedStyleSheets` (one `CSSStyleSheet` cached and reused across all instances), and
  that same fetch feeds the `@property` hoist — so the redundant clone fetch is gone.
  Falls back to the `<link>` clone when constructable stylesheets are unsupported or the
  fetch fails (never leaves the shadow root unstyled). **Measured (no-fill env): total
  transferred 1.24 MB → 1011 KB (−255 KB), cxr.css requests 3 → 2.** Getting to 1× needs
  the backend cache-header change below.
- ✅ **W1** — `if (cancelled) return;` in `onWaterfallSuccess`.
- ✅ **W2** — per-run `terminalFired` flag; at most one terminal event per waterfall
  run (kept as third-party-SDK hardening; the "per-stage duplicate" framing was
  itself a false positive — `!singleHitWaterfall` counting distinct placements is
  correct).
- ✅ **S1 / L2 / LK-race** — `MutePassbackGuard` subscribes to `ad:fill` and bails if
  the ad already filled, so passback can't emit `ad:nofill` after `ad:fill`.

**Rejected on verification (false positives — audit read the code wrong):**
- ❌ **muted-attr "autoplay-with-sound"** — muted autoplay is the *compliant* path.
- ❌ **L1 (0×0 ad slot)** — the `containerStyle` fallback is `"100%"`, not `0px`, and
  no ad render site even passes the `dimensions` prop it flagged. No 0×0 path.
- ❌ **C2 (timeupdate ungated)** — inactive players are already paused (`isPlay=false`
  → `pause()`), so `timeupdate` only fires for the active player. Nothing to gate.
- ⚠️ **N1 / C1 (virtualize ReelList)** — *partially addressed, not via virtualization.*
  The correct-env re-measure showed multi-video load **does** contribute (several
  m3u8 slides each pulled a first segment). Rather than virtualize (Embla `loop:true`
  makes true DOM virtualization unsafe — breaks loop cloning + scroll height), the
  **N2b active-slide load gate + auto-advance gate** cut the same bytes: inactive
  slides now stay at ~70 KB. Full DOM virtualization remains unnecessary.

**Open — real, still worth doing:**
- ⏳ **The remaining overage** (see [Measured baseline](#measured-baseline)): the
  ~2.6–4.2 MB backend-served **720p MP4 GenAd audio-ad creative** on the uncapped
  `video.src` path (the dominant single item — backend/ad-ops fix below), ~1.2 MB
  upstream creative, ~1.5 MB our bundle. Frontend bundle levers already applied
  (hls.light −238 KB, Octo lazy, dummyFeed tree-shake −61 KB, cxr.css 3×→2× −255 KB).
  The cxr.css cold-load is now down to the head `<link>` plus one reused fetch (see
  Done); the **last hop to 1× fetch needs the backend `max-age=0` → cacheable CDN
  header** so the head `<link>` and the remaining fetch dedupe (see ad-ops list).

  > **Correction — the "599 KB index core" is *not* the cold-load critical path.**
  > A prod-build import-graph trace (`ANALYZE=true npm run build:prod` → `dist/stats.html`)
  > shows the entry statically loads exactly **one** chunk (`index-*` ≈ 329 KB), and
  > **~568 KB of it is `react-dom` + `react` + `scheduler`** — irreducible; you cannot
  > code-split React out of a React app. The 593 KB `index-*` chunk the audit worried
  > about is the **markdown/Octo stack** (`mdast`, `decode-data-html`, `BrandAssets`),
  > already behind an `import()` boundary — it is *not* fetched on cold load. `App`,
  > `Feed`, `AppContent`, `hls.light`, `OctoSheet` are all likewise dynamic. So the
  > "code-split the index/Feed/App chunks" lever was **already realised** in prior work;
  > there is no fat CXR module left sitting on the static critical path to split off.
  > The only clean frontend bytes remaining were the `cxr.css` multi-fetch and the
  > dummyFeed tree-shake — both now done.

**Needs backend / ad-ops (not a clean frontend fix):**
- 🔧 **MP4 creative rendition** — the fill served CXR a 720p MP4 (uncapped) when the
  same asset also exists as adaptive HLS (`playlist.m3u8`, which *would* hit our
  capped path). Ask ad-ops to serve reel slots HLS or a lower rendition. Frontend
  can't cap a raw `video.src` MP4 without fragile CDN-URL rewriting.
- 🔧 **PL1 (Safari/iOS native HLS)** — a *separate* risk from the MP4 above: for
  `.m3u8` content on Safari (no MSE), native ABR can climb rendition, bypassing our
  hls.js pinning. Not the current measured breach (that's the MP4). Needs a
  low-bitrate variant playlist or accept-and-monitor; defer until it actually breaches.
- 🔧 **cxr.css cacheable header (2× → 1×)** — the stylesheet is now fetched twice (head
  `<link>` + one reused fetch, down from three). The CDN serves `cxr-*.css` with
  `max-age=0`, so the browser cannot reuse the `<link>` bytes for the shadow-root
  stylesheet fetch. A far-future `Cache-Control` (the file is content-hashed, so it is
  safe to cache immutably) would let the two dedupe to a single network hit — the last
  ~255 KB of the original 3× waste. Frontend side is done; this is a CDN-config change.

**Done since last revision:**
- ✅ **N3** — IMA `enablePreloading` gated on the active slide
  ([usePlayerLifecycle.ts:307](../src/player/usePlayerLifecycle.ts#L307)); inactive ad
  slides no longer prefetch the creative media into the HAI budget.

**Done — P2 hardening (first low-risk cluster, TDD, 1335/1335 unit tests green):**
- ✅ **LK1** — the `MANIFEST_PARSED` handler is now a named closure with a stored detacher
  (`detachHlsManifestHandlerRef`) `.off()`'d in cleanup before `destroy()`
  ([usePlayerLifecycle.ts](../src/player/usePlayerLifecycle.ts)). Cleanup symmetry;
  `destroy()` freed it anyway, so no runtime behavior change.
- ✅ **LK4** — the deferred unmount-destroy `setTimeout` in
  [`OctoSdkPanel.tsx`](../src/genai/octo/OctoSdkPanel.tsx) now stores its id in
  `unmountDestroyTimerRef`; the effect body cancels a still-pending destroy on remount, so
  a rapid open/close can no longer double-destroy the SDK.
- ✅ **S2** — the experiment bucket roll is drawn via `getExperimentRoll(tagId)`, which
  persists it in `sessionStorage` keyed by tag id
  ([strategies.ts](../src/strategies/strategies.ts), wired in
  [StrategyProvider.tsx](../src/strategies/StrategyProvider.tsx)). The bucket is now stable
  across reloads in a session (deterministic viewability, reproducible bugs) instead of a
  fresh `Math.random()` each mount. Falls back to an unpersisted roll when storage is
  blocked/SSR.
- ✅ **S3** — `resolveStrategies` now emits a one-time `logger.warn` for an unknown
  non-empty tag id ([strategies.ts](../src/strategies/strategies.ts)) so registry drift (a
  live tag silently losing its safeguards) is visible instead of a viewability incident.
- ✅ **W3** — `normalizers.ts` warns (does not clip) when any provider array exceeds
  `AD_PROVIDER_ARRAY_WARN_THRESHOLD` (10) on the banner/native/video branches
  ([normalizers.ts](../src/ads/normalizers.ts)). Pure observability for backend-contract
  drift; deliberately warn-only so a legitimately long waterfall is never truncated.
- ✅ **LK2** — `attachToPlayer` (both `useQuartileEvents` and `usePlayStartedEvents` in
  [playerEvents.ts](../src/player/playerEvents.ts)) now returns a `detach()` that `.off()`s
  the vlite handlers and `removeEventListener`s the native `play`/`playing` listeners. The
  lifecycle cleanup calls the detachers before `player.destroy()`
  ([usePlayerLifecycle.ts](../src/player/usePlayerLifecycle.ts)), so no handler lingers on a
  reused `<video>` element.
- ✅ **W4** — added a monotonic `generationRef` run counter in
  [genAdSdk.ts](../src/ads/genAdSdk.ts). Each init-effect run captures its `runId`; the SDK
  callbacks (`onWaterfallSuccess`/`Fail`, `onAdCompleted`, the post-`_loadSdk` init) bail
  via `isStale()` when a newer run has started. A fast swipe-away-and-back can no longer let
  a stale run's late callback destroy the new run's instance or reset shared init state.
  (The prior `cancelled` flag only covered the terminal callbacks; the instance-destroying
  `onAdCompleted` was ungated — that was the live hole.)

**Needs runtime / upstream info (not fixable from source):**
- 🔍 **M1** — embed two widgets, count `gen_ad` iframes in DevTools. One shared
  frame ⇒ every instance shares one 4 MB HAI budget. Check before multi-widget use.
- 🔍 **I1 / I2** — VAST wrapper depth / companion / VPAID; needs a real VAST sample
  from demand partners.

**P2 — hardening (remaining):** C3, C4, L3, L4, L5, I3, I4, W5, W6.
(Done: LK1, LK2, LK4, W3, W4, S2, S3 — see the P2-hardening block above.)

**P3 — hygiene:** C5, C6, N4, N6, L6, I5, LK5.

---

## How to verify any fix

The PR #364 harness is the ground truth. From the package root:

```bash
pnpm --filter @genuin/contextual-reels run budget            # video+ad tag, unthrottled: bytes, requests, avg CPU%
pnpm --filter @genuin/contextual-reels run budget:throttled  # 4× CPU throttle: total & peak CPU seconds
pnpm --filter @genuin/contextual-reels run budget:build       # build, then check
pnpm --filter @genuin/contextual-reels run budget:all         # all 3 tag variations + a scorecard
```

Tag variations, ids, and the scorecard runner live in
`ad-resource-budget/cxr/` (`tags.mjs`, `run-budgets.mjs`). Confirm real video +
ad creatives actually load before trusting a number (see the env warning under
[Measured baseline](#measured-baseline)).

**Guardrail (from the harness SKILL.md):** never raise a Chrome HAI `error` limit
to make the build pass. The ceiling is Chrome's, not ours. The only valid fix is a
lighter creative/load — which is exactly what P0/P1 above do.

---

## Appendix — provenance, coverage & caveats

**Provenance.** Findings came from **nine independent audit passes** — five on the
core surface (§A network, §B CPU, §C layout/policy, §D iframes/SDKs, §E
lifecycle) and four gap passes (§F waterfall, §G strategies, §H platform, §I
multi-instance). **Each finding was then re-checked against the source** before
landing here. The raw passes over-reported in several places; every correction is
called out inline — the **REJECTED** block in §C (the "muted = violation" false
alarm), footnote ¹ in §B (overstated off-screen CPU), footnote ¹ in §F (W2's
single-hit condition), and the fictional byte math flagged in W3/N4.

**What was covered.** Every directory under `src/` was audited: `feed/`, `player/`,
`ads/`, `providers/`, `analytics/`, `strategies/`, `platform/`, `instance/`,
`genai/`, `app/`, `controls/`, `services/`, `utils/`, `config.ts`, `shadow-dom.ts`.

**Known limits of this audit (what could still be missed):**
- Agents read **excerpts, not always whole files** on the first five passes; the
  four gap passes read their targets whole. A finding past an excerpt window on the
  core passes could be missed.
- **Runtime-only behavior** (event storms, races under real input, actual VAST
  responses) cannot be seen by static reading. **M1 (iframe topology) and I1/I2
  (VAST wrapper/companion/VPAID) are the explicit open questions** requiring a
  runtime check or a real VAST sample — they cannot be resolved from our source.
- All byte/CPU magnitudes except the **~18 MB measured baseline** (PR #364) are
  modeled estimates. Do not quote them as measured — run the harness for real
  numbers.

**Confidence at a glance:** the *root cause* of the removals (N1/N2/N3 + the
fill-after-fail family) is **confirmed in code and measured**. Coverage of the
*full edge surface* is high but not provably exhaustive — treat M1 and I1/I2 as
must-verify-at-runtime before declaring the widget HAI-safe on multi-widget pages
or against live demand.
