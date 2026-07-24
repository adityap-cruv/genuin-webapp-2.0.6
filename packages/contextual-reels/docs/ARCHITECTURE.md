# Architecture

Embeddable "contextual reels" ad/video SDK. Boots from a plain-JS loader into a React 19 tree
mounted inside a Shadow DOM per `.gen-ext` element, plays reels via `hls.js/light` + `vlitejs`,
inserts GenAd ad slots, drives a GenAI "Octo" conversation panel, and reports to Rudderstack +
tracking pixels.

- **Import alias:** `@cxr/*` → `src/*` (Vite + Vitest + tsconfig).
- **Tailwind prefixes:** `gencl:` (widget-scoped classes) / `gai:` (GenAI SDK).
- **Layout ids drive nearly all branching** — `AD_LAYOUT.L1/L2/L3/L4` from [`config.ts`](../src/config.ts).

All paths below are relative to the package root. Most source files carry a rich file-level JSDoc
comment — this doc is the _map_; read the file for the _detail_.

---

## 1. Entry points & boot

| File                                                                                                | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`src/loader.jsx`](../src/loader.jsx)                                                               | Stable, dependency-free bootstrap script partners include (`gen_ext.min.js`). Build placeholders (`__CR_CORE_FILENAME__`, `__CR_CSS_FILENAME__`, `__CR_CDN_BASE__`, `__CR_PIXEL_URL__`) are hash-substituted at build. Captures its own `<script src>` query string into `window.__CXR_SCRIPT_PARAMS__` (the reliable config channel inside a cross-origin `srcdoc` iframe), then fires the `px-lo` "loader reached" beacon carrying `bid` + that raw script query verbatim (no cleaning/whitelisting — the source params are the signal), injects the CSS `<link>`, then dynamically `import()`s the core bundle. On core-load failure it fires a `px-script-error` pixel directly (PixelReporter lives inside the not-yet-loaded core, so its URL shape is duplicated here). |
| [`src/index.jsx`](../src/index.jsx)                                                                 | Core entry; runs `init()`. Scans all `.gen-ext` nodes, warns on duplicate/missing `id`/`data-tag-id`, dedups already-processed nodes (`data-cxr-status`), injects `<meta name="ad.size">` for GAM once/page, initializes Rudderstack, fires one shared geoip fetch, and per node: resolves `tagId` (host macro wins over `data-tag-id`), fires `TAG_INIT` once per tagId, resolves ad layout + stacked config, mounts Shadow DOM (default) or direct, `createRoot`, renders `<App>` in `SafeSuspense`, installs a `MutationObserver` for node removal ([ADR 003](cxr-decisions/003-mutation-observer-scope.md)), registers a `destroy` control on `InstanceRegistry`. Builds `window.cxr = buildPublicApi(...)` + installs the postMessage bridge.                             |
| [`src/publicApi.ts`](../src/publicApi.ts)                                                           | The `window.cxr` surface. `buildPublicApi(registry)` → `on(event, handler)`, `expand(id)`, `collapse(id)`, `infolinksImpression(id?)` + internal `_emit` + dev-only `_debugSimulateAdRemoval`. Public events: `play \| pause \| fullscreen:enter \| fullscreen:exit \| ad:fill \| ad:nofill \| ad:removed`. `installMessageBridge(api)` listens for `{ type: 'cxr:infolinksImpression', instanceId? }` postMessage (iframe embeds can't reach `window.cxr` across the frame boundary).                                                                                                                                                                                                                                                                                         |
| [`src/config.ts`](../src/config.ts)                                                                 | All static config + layout resolution. See [CONFIGURATION.md](CONFIGURATION.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| [`src/shadow-dom.ts`](../src/shadow-dom.ts) / [`shadow-dom-config.ts`](../src/shadow-dom-config.ts) | `setupCxrShadowDOM(node)` attaches an open shadow root, creates the mount `<div>`, injects CXR CSS (prod: adopts already-fetched CSS via a shared constructable `CSSStyleSheet` — no second fetch; dev: clones Vite `<style>` tags), hoists Tailwind `@property` rules via `CSS.registerProperty`, clones `gen_ad.min.css`. Also `getShadowConfig`, `isShadowMode`, `resyncShadowStyles(root)`.                                                                                                                                                                                                                                                                                                                                                                                |

**Boot chain:** loader → core `import()` → `index.js init()` → per node `setupCxrShadowDOM` →
`createRoot(mountTarget).render(<App tagId adLayout instanceId shadowConfig .../>)`.

---

## 2. Provider stacks

Two nested provider chains. **[`src/app/App.tsx`](../src/app/App.tsx)** (root) mounts the outer chain;
**[`src/app/FeedTree.tsx`](../src/app/FeedTree.tsx)** (lazy) mounts the inner chain.

```
App:      InstanceProvider → AnalyticsProvider → TagDetailsProvider
            → (SafeSuspense) → TagDetailsGate → FeedTree
FeedTree: FullScreenProvider → StrategyProvider → GenAIProvider
            → PlayerProvider → FeedProvider → AdProvider → NativeFeedShim
```

| Provider                                                        | Owns / exposes                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`InstanceContext`](../src/instance/InstanceContext.tsx)        | Per-instance `{ instanceId, bus: CxrEventBus, tracker: UserInteractionTracker }` (created once via ref). Hooks: `useInstanceId`, `useEventBus`, `useUserInteracted` (via `useSyncExternalStore`), `useMarkUserInteracted`.                                                                                                               |
| [`AnalyticsProvider`](../src/providers/AnalyticsProvider.tsx)   | Injects Rudderstack, holds a `RudderstackEventBuffer` (required keys `visit_id`, `geoip`) so early `sendEvent()`s queue + flush FIFO. `useAnalytics()`: `sendEvent` (referentially stable), `setBrandId`, `setBaseEventContext`, `setMandatoryData`, **`setAdPassback`** (sets `passback:1` on all later events — **revenue-critical**). |
| [`TagDetailsProvider`](../src/providers/TagDetailsProvider.tsx) | Resolved tag config (via `useTagLoader`). `useTagDetails()`: `tagDetails`, `apiFailed`, `tagId`, `brandId`, `adLayout`, `shadowConfig`. Does NOT gate rendering.                                                                                                                                                                         |
| [`TagDetailsGate`](../src/providers/TagDetailsGate.tsx)         | Gates children: `apiFailed` → `<NoContent>`, `!tagDetails` → `<FeedSkeleton>`, else children.                                                                                                                                                                                                                                            |
| [`FullScreenProvider`](../src/providers/FullScreenProvider.tsx) | Fullscreen strategy (manual React state / Browser Fullscreen API / iOS redirect for brand 3252). `useFullScreen()`: `isFullScreen`, `enter/exit/toggleFullScreen`, `isRedirectMode`.                                                                                                                                                     |
| [`StrategyProvider`](../src/strategies/StrategyProvider.tsx)    | Distributes resolved `Strategies` (see [STRATEGIES.md](STRATEGIES.md)). Rolls the experiment bucket once/mount (sessionStorage), applies `getInitVolumeOverride(dataGiv)`. `useStrategy()` degrades to `DEFAULT_STRATEGIES` outside a provider — never throws.                                                                           |
| [`GenAIProvider`](../src/providers/GenAIProvider.tsx)           | Active reel's Octo split state (`octoFraction` 0–1, `octoAxis`). Re-emits SDK `window` events onto the per-instance bus. `useGenAI()`, `useOctoSplit(isActive)`.                                                                                                                                                                         |
| [`PlayerProvider`](../src/providers/PlayerProvider.tsx)         | **`volume` is the source of truth; `isMuted = volume === 0`.** Also `isPlaying`, `isAdBreakActive`. `usePlayer()`: getters + `setVolume/setMuted/setPlaying/setAdBreakActive/notifyAutoplayBlocked`. `DEFAULT_UNMUTE_VOLUME = 0.2`.                                                                                                      |
| [`FeedProvider`](../src/providers/FeedProvider.tsx)             | Feed data. Creates `createFeedGenerator`, fetches, applies `normaliseFeed`. `useFeed()`: `entries`, `activeIndex`, `setActiveIndex`, `isLoading`, `feedFailed` + derived `isAdActive`/`activeReel`. Mounted **below** PlayerProvider so it can read `usePlayer()`.                                                                       |
| [`AdProvider`](../src/providers/AdProvider.tsx)                 | Ad waterfall fill/no-fill + single-hit deferred passback + ad layout. `useAdWaterfall()`: `onAdSuccess`, `onAdFail`, `recordAdBreakResult`, `adLayout`, `isAudioOnlyAds`. `firePassback()` fires `AD_PASSBACK`, notifies the embed page, emits `genad:destroy`, calls `registry.destroy()`. Registers `fireInfolinksImpression`.         |

`NativeFeedShim` (inside FeedTree) wires the cross-cutting hooks (`useMutePassbackGuard`,
`useInstanceRegistration`, `usePlayerCoordination`, `usePublicApiBridge`, `useResourceMonitor`,
`useHeavyAdReporter`) and renders `<FeedSkeleton>` / `<NoContent>` / `<Feed>` by feed state.

> **Note:** the overlay close button is currently disabled unconditionally in `NativeFeedShim`
> (`showCloseButton = false`) while the Infolinks stacked layout owns that affordance; the former
> layout-gated logic is preserved in a comment for future re-enable.

---

## 3. App shell — [`src/app/`](../src/app/)

- [`App.tsx`](../src/app/App.tsx) — root; owns `dismissed`; renders the outer provider chain; lazy-loads `TagDetailsGate` + `FeedTree`.
- [`FeedTree.tsx`](../src/app/FeedTree.tsx) — inner provider stack + `NativeFeedShim`; lazy-loads `Feed`.
- [`useTagLoader.ts`](../src/app/useTagLoader.ts) — `getTag` (or client-supplied `previewConfig` verbatim, no fetch, in dashboard preview) → force `config.show_cta=false` → set brand_id → fire `TAG_CAPTURED` (silenced in preview). Cancels stale responses.
- `CloseButton.tsx` (pure presentational X button), `NoContent.tsx`, `FeedSkeleton.tsx`.

---

## 4. Feed — [`src/feed/`](../src/feed/)

- **`Feed.tsx`** — vertical Embla carousel. Strict virtualization: every entry keeps a full-height
  slide wrapper (Embla loop math needs real heights) but only `computeSlideMountWindow(...)` indices
  mount a real `ReelItem`; others render a zero-fetch `ReelSlidePlaceholder`. Wires `useEmblaCarousel`
  - `useEmblaFeed`, gates swipe via `useSwipeGate([octoFraction>0, isAdActive])`.
- **`ReelItem.tsx`** — pure 3-branch router by `entry.kind`: `ad` → `AdLayout`, `video-with-ad` →
  `VideoLayout adObject`, `video` → `VideoLayout`. Both layouts lazy-loaded.
- **`layouts/VideoLayout.tsx`** — per-layout player rendering (`renderL1/L2/L3/L4`; fullscreen → L1).
  Mounts `LightPlayer` + `VideoControlLayer`; L2 mounts `OctoSheet host="split"`; ad-break overlay via
  `useFullscreenAdBreak`; L3 mounts an offscreen audio-only player only after unmute (`l3AudioEngaged`,
  [ADR 006](cxr-decisions/006-l3-audio-on-unmute.md)).
- **`layouts/AdLayout.tsx`** — standalone in-feed ad slot. `GenAdSlot` + `AdControlLayer`,
  `destroySignal = isActive ? 0 : 1`, tap-to-unmute (`ad:unmuteRequest` synchronously for the iOS
  gesture window), `useInactivityAdvance` for audio ads.
- **`useFeedNavigation.ts`** (`useEmblaFeed`), **`activeSlideState.ts`**, **`slideMountWindow.ts`**,
  **`feedTransforms.ts`** (`normaliseFeed` → `normaliseReel`/`normaliseAd`; `buildAdObject`;
  `BLANK_HLS_URL` silent stream behind video ads).
- **Hooks** — see [`src/feed/hooks/README.md`](../src/feed/hooks/README.md): `useEmblaCarousel`,
  `useSwipeGate`, `useInactivityAdvance`, `useFullscreenAdBreak`.

---

## 5. Player — [`src/player/`](../src/player/)

See [`src/player/README.md`](../src/player/README.md) for the full event-emission order.

- **`LightPlayer.tsx`** — slim presentation: `<video>` (always `muted` attr; silence via volume 0) +
  `VideoScrubber`. Delegates logic to `usePlayerLifecycle`.
- **`usePlayerLifecycle.ts`** — orchestrates vlitejs + IMA plugin + `hls.js/light`. Strict HLS buffer
  caps (`maxBufferLength:4`, `maxBufferSize:1MB`, `capLevelToPlayerSize`) + pins lowest rendition +
  `autoStartLoad:false` (only the **active** slide `startLoad(-1)`s) — all to stay under Chrome
  Heavy Ad Intervention. Extensive `cancelled` guards against fast tab-switch orphans.
- **`playerEvents.ts`** — `useQuartileEvents`, `usePlayStartedEvents` (`RECENT_CLICK_WINDOW_MS=2000`
  distinguishes user vs autoplay), `useActiveVideoIdBroadcast`.
- **`hlsPlayer.ts`** (`useAutoplayFallback`, `useImaPlugin`), **`VideoScrubber.tsx`**, **`types.ts`**.

---

## 6. Ads — [`src/ads/`](../src/ads/)

See [`src/ads/README.md`](../src/ads/README.md). **Nothing outside this folder calls `window.GenAd`
directly.**

- **`genAdSdk.ts`** — `loadGenAdSdk()` (singleton promise; injects `gen_ad.min.js` + CSS).
  `useGenAdInstance(options)` — full SDK slot lifecycle: `containerId = gen-ad-slot-${instanceId}-${id}`,
  gates the request on `requestArmed` (latched once active+playing+unmuted, or immediately when
  `gateOnUnmute=false`), calls `window.GenAd.init(...)` with banner/native/video configs + a large
  callback surface mapping SDK events → analytics + bus `ad:fill`/`ad:nofill`. Handles `destroySignal`,
  `genad:destroy`, synchronous `ad:unmuteRequest`, mute/play/pause-sync, `fullscreen:enter/exit` →
  `GenAd.updateView`.
- **`GenAdSlot.tsx`** (presentation over `useGenAdInstance` — SDK mount `<div>` + shimmer),
  **`adSlotProps.ts`** (`genAdSlotAdProps(ad)`), **`waterfall.ts`** (`notifyAdFill`/`notifyAdNoFill` —
  postMessage to parent + `window.adFillCallback`/`noAdsCallback`; `installGenaiBridge`),
  **`adConfig.ts`**, **`adUrlMacros.ts`** (`[PAGE_URL]` + host-macro token substitution;
  `rewriteTritonUrlForApp`), **`normalizers.ts`** (`AdProviderKind = video|banner|native`).

---

## 7. Controls — [`src/controls/`](../src/controls/)

- **`AdControlLayer.tsx`** — routes ad controls by layout (compact for L3/L4 non-fullscreen; else `AdControlBar`).
- **`VideoControlLayer.tsx`** — routes video controls: compact (L3/L4) → `CompactControlBar` +
  `CompactUnmuteOverlay` + `OctoSheet host="compact"`; banner/fullscreen → `DefaultControlLayer`.
  Gates V2 icons via `useNewPlayerControls()`.
- Sub-layers: `ad/AdControlBar`, `bottombar/DefaultBottomBar`, `topbar/DefaultTopBar`,
  `video/DefaultControlLayer`, `ClickOverlay`, `CompactControlBar`, `FullscreenActionRail(Host)`.
- Button atoms (`buttons/atoms/`): `PlayPauseButton(V2)`, `MuteUnmuteButton(V2)`,
  `ExpandCollapseButton(V2)`, `WatchButton`, `LinkoutButton`.

---

## 8. Strategies — [`src/strategies/`](../src/strategies/)

Per-tag feature flags. **The single place to edit per-tag behaviour is
[`strategyConfig.ts`](../src/strategies/strategyConfig.ts).** Full detail in [STRATEGIES.md](STRATEGIES.md).

- **`strategies.ts`** — `Strategies` interface, `DEFAULT_STRATEGIES` (all off), `resolveStrategies(tagId, brandId)`
  (cascade DEFAULT → preset → brand → tag inline, most-specific wins), `getExperimentRoll`, `applyExperiment`.
- **`strategyConfig.ts`** — `STRATEGY_PRESETS` (iheart/genaiDemo/singleHit), `BRAND_STRATEGIES`,
  `TAG_STRATEGIES`, `TAG_EXPERIMENTS`.
- **`useMutePassbackGuard.ts`** — arms on first `player:play`; fires `onAdFail` after `mutePassbackDelayMs`
  if still muted; bypassed for ad-verification crawlers.

---

## 9. Instance coordination & registry — [`src/instance/`](../src/instance/)

Each `.gen-ext` → its own React root + `CxrEventBus` + tracker (isolated). Cross-instance behaviour
flows through **module-singleton** coordinators; the public API + registry are page-global singletons.

- **`coordination/CxrEventBus.ts`** — typed per-instance emitter (`CxrEventMap`); tracks `_fired` names
  so late-mounting consumers can read one-way latches (`hasFired`). Never touches window/document.
- **`coordination/GlobalMuteCoordinator.ts`** — at most one instance unmuted.
- **`coordination/GlobalPlayerCoordinator.ts`** — at most one instance playing.
- **`coordination/usePlayerCoordination.ts`** — registers pause+mute callbacks with both coordinators.
- **`coordination/usePublicApiBridge.ts`** — bridges internal bus events → `window.cxr._emit`.
- **`registry/InstanceRegistry.ts`** — `getInstanceRegistry()` singleton; `instanceId → InstanceControls`;
  **merges** partial registrations from loader + React tree; DOM-id aliases (`registerAlias`).
- **`registry/useInstanceRegistration.ts`** — registers `expand`/`collapse` on mount.

> **Two event systems:** the per-instance **`CxrEventBus`** (internal, isolated per widget) vs the
> **`window.cxr`** public API (host-facing) — bridged by `usePublicApiBridge`. `src/utils/eventBus.ts`
> is legacy window-level and effectively dead — prefer `CxrEventBus`.

---

## 10. GenAI "Octo" — [`src/genai/octo/`](../src/genai/octo/)

- **`OctoSheet.tsx`** — size-aware dispatcher keyed on `host` (`bottombar`/`split`/`compact`) + layout.
  Returns null unless the resolved variant belongs to the calling host. Routes: L2 → `OctoSplitView`
  (split), L4/L3 → `OctoCountdownStrip` (compact), L1/fullscreen → `OctoSheetLadder` (bottombar; publishes
  `octoFraction` for the Instagram-style player shrink).
- **`OctoSplitView.tsx`** (300×250 overlay), **`OctoSdkPanel.tsx`** (wraps `@genuin/genai-sdk` — module
  import, not CDN; destroy+reinit on `videoId`/`activationKey` change), **`OctoCountdownStrip.tsx`**,
  **`octo-phase-map.ts`**, **`octoSheetConfig.ts`**, **`useOctoSheetState.ts`**.

---

## 11. Cross-cutting

| File                                                                                                                            | Role                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`hostMacros.ts`](../src/hostMacros.ts)                                                                                         | `parseHostMacros()` parses `window.__CXR_SCRIPT_PARAMS__` into a cleaned `HostMacros` map (drops empty + unresolved `{...}`/`~...~` placeholders). `hostMacros` singleton, `getHostMacro(name)`.                                                                                                                  |
| [`userId.ts`](../src/userId.ts)                                                                                                 | `generateUuid()` + per-page-load anonymous `userId` singleton (`x-user-id` header, analytics correlation).                                                                                                                                                                                                        |
| [`platform/device.ts`](../src/platform/device.ts)                                                                               | `detectDevice`, `getDeviceDetailsSnapshot`, `enrichDeviceDetailsWithGeoIp`. `resolveOsType` emits `'chromium'` for Linux/ChromeOS Chrome — **load-bearing analytics contract** ([ADR 002](cxr-decisions/002-chromium-os-quirk.md)).                                                                               |
| [`platform/topWindow.ts`](../src/platform/topWindow.ts)                                                                         | `getTopWindow` (walks up, bails on cross-origin), `windowLink` (outermost accessible href → `x-url` header / analytics / Infolinks purl).                                                                                                                                                                         |
| [`observability/pixel-reporter.ts`](../src/observability/pixel-reporter.ts)                                                     | `PixelReporter` singleton — fires `px-script-error` pixels for failures at stages `sdk_load\|init\|render\|runtime` (dedup keyed). `onFailure(cb)` → AdProvider subscribes → passback. Independent of `@cxr/config` so it works with a broken module graph.                                                       |
| [`analytics/analytics.ts`](../src/analytics/analytics.ts)                                                                       | `EVENT` vocabulary (verbatim strings sent to Rudderstack — **partner contract**), `sendEventLog`, `buildHostParamsDiagnostic`, offsite config merge.                                                                                                                                                              |
| [`analytics/rudderstack.ts`](../src/analytics/rudderstack.ts) / [`rudderstackBuffer.ts`](../src/analytics/rudderstackBuffer.ts) | Snippet injection + `RudderstackEventBuffer` (state machine `uninitialized→buffering→ready→flushed`).                                                                                                                                                                                                             |
| [`utils/`](../src/utils/)                                                                                                       | `infolinks.ts` (`setupStackedRows`), `share.ts`, `safeHref.ts`, `deepMerge.ts` (`deepMergeOverwrite`, cycle/depth-guarded), `ads.ts` (`isCompactLayout`, `isAdVerificationCrawler`), `logger.ts` (`createLogger`), `eventBus.ts` (legacy).                                                                        |
| [`monitoring/`](../src/monitoring/)                                                                                             | `resourceMonitor.ts` (pull-based `readResourceSnapshot` for the 3 HAI dimensions), `useResourceMonitor.ts`, `heavyAdReporter.ts`, `useHeavyAdReporter.ts` (two removal-detection paths — Chrome `ReportingObserver` "intervention" + inferred budget breach; Path B defaults to iframe-only; fires `ad:removed`). |
| [`services/api.ts`](../src/services/api.ts)                                                                                     | `apiFetch` (injects `x-user-id`/`x-url`), `getTag`, `getIpInfo`/`getSharedGeoIp`, `handleResponse` (unwraps `data.data`), `parseJsonResponse`.                                                                                                                                                                    |
| [`services/feed.ts`](../src/services/feed.ts)                                                                                   | `createFeedGenerator({tagId, sendEvent, ...})` → paged `fetchBatch()` against `/goservices/ad_creative/feed`; resolves per-tagId `visit_id` (`getVisitIdPromise`/`setVisitId`).                                                                                                                                   |
| [`types.ts`](../src/types.ts)                                                                                                   | Domain types: `TagResponse`, `Reel`, `NormalisedReel`, `NormalisedAd`, `FeedEntry` (discriminated union `video \| video-with-ad \| ad`), etc.                                                                                                                                                                     |

See [DATA_FLOW.md](DATA_FLOW.md) for how these connect end to end.
