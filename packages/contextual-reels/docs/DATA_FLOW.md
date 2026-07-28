# Data Flow

End-to-end path: **tag id → boot → config → feed load → render → ad insertion → analytics/pixels →
cross-instance coordination.** Read [ARCHITECTURE.md](ARCHITECTURE.md) first for the module map.

## The flow

1. **Boot** — [`loader.jsx`](../src/loader.jsx) captures its `<script src>` query into
   `window.__CXR_SCRIPT_PARAMS__`, injects CSS, `import()`s the core. [`index.jsx`](../src/index.jsx)
   `init()` reads `tagId` (host macro ∨ `data-tag-id`) and `data-preview`, fires `TAG_INIT` once/tagId
   (skipped in preview), sets up Shadow DOM, `createRoot`, registers a `destroy` control, renders
   `<App tagId adLayout instanceId preview shadowConfig />`.

2. **Config resolve** — `TagDetailsProvider` → [`useTagLoader`](../src/app/useTagLoader.ts) →
   `getTag(tagId)` (or, in preview, the client-supplied `previewConfig` verbatim — no fetch) → force
   `config.show_cta=false` → `setBrandId` → fire `TAG_CAPTURED` (a no-op in preview, which is
   analytics-silent). `StrategyProvider` resolves `Strategies` (tag/brand/preset cascade
   - experiment roll + `GIV` override). `TagDetailsGate` unblocks children once `tagDetails` resolves
     (else skeleton / `NoContent`).

3. **Feed load** — `FeedProvider` → [`createFeedGenerator(tagId)`](../src/services/feed.ts) →
   `GET /goservices/ad_creative/feed` (fires `Batch Started` / `Batch Completed` /
   `Feed API Call Completed`; resolves `visit_id` → stamps base context + flushes the analytics buffer)
   → [`normaliseFeed(reels, tagId, adBreakEnabled, gateOnUnmute, adsDisabled)`](../src/feed/feedTransforms.ts)
   → `FeedEntry[]` (`video` / `video-with-ad` with an attached `adObject` / `ad`). Empty batch →
   `Feed Completed` + `Tag Displayed`, and further calls short-circuit.

   **Statically-served tags** (`servedStatically` strategy — see
   [STRATEGIES.md](STRATEGIES.md#statically-served-tags)) diverge at steps 2–3 and 5:
   `/ad_creative` and `/feed` are **skipped**, served instead from lazy per-tag
   JSON fixtures ([`staticTagData.ts`](../src/strategies/staticTagData.ts)).
   `useTagLoader` applies the fixture `tagConfig`; `FeedProvider` serves the
   fixture `reels`, mints a fresh `crypto.randomUUID()` `visit_id`, and still
   fires `Batch Started` / `Feed API Call Completed`. `/ip_info` is **not**
   skipped — geoip is fetched as normal (analytics parity + supplies the ad-URL
   IP). Any missing/failed fixture falls back to the real API. In step 5 the ad
   URL is rewritten client-side (real `ua`, real client `ip` from geoip) via the
   `{ servedStatically, clientIp }` option to `resolveVideoAdMacros`.

4. **Render** — `NativeFeedShim` → `Feed` mounts Embla. `computeSlideMountWindow(activeIndex, visibleIndices)`
   mounts only active/visible slides → `ReelItem` routes to `VideoLayout` or `AdLayout` by layout id
   (L1–L5). Video → `LightPlayer` (`hls.js/light`, buffer-capped, lowest rendition, active-slide-only
   `startLoad`; vlitejs; quartile/play analytics).

5. **Ad insertion** — `AdLayout` (standalone) or `VideoLayout`'s ad-break overlay mounts `GenAdSlot` →
   [`useGenAdInstance`](../src/ads/genAdSdk.ts) gates on `requestArmed` (unmute/play), `loadGenAdSdk()`,
   `window.GenAd.init(...)` with normalized banner/native/video config + macro-resolved URLs. SDK
   callbacks → analytics events + bus `ad:fill`/`ad:nofill` → `AdProvider.onAdSuccess`/`onAdFail`.
   No-fill (immediate, or single-hit-exhausted) → `firePassback` → `AD_PASSBACK` + `notifyAdNoFill`
   (postMessage + `window.noAdsCallback`) + `genad:destroy` + registry `destroy()`.

6. **Analytics / pixels** — every event flows `sendEvent` → `RudderstackEventBuffer` (stamped with base
   context: volume / mute / screen / passback / tag_id / brand_id / visit_id / geoip) → Rudderstack once
   mandatory data settles. Failures at any stage → `PixelReporter` fires a `px-script-error` pixel and
   (via `onFailure`) triggers `AdProvider.onAdFail`. Ad-frame removal (HAI or inferred budget breach) →
   `useHeavyAdReporter` → bus `ad:removed` → `usePublicApiBridge` → `window.cxr` `ad:removed`.

7. **Coordination** — unmute/play on one instance mutes/pauses the others via the two module-singleton
   coordinators. Public-API imperative `expand`/`collapse` route through `InstanceRegistry` → the
   per-instance bus.

## Key state-ownership rules

- **Volume is the single source of truth** in `PlayerProvider` (`isMuted = volume === 0`).
- **`visit_id`** is per-tagId; `getVisitIdPromise(tagId)` lets `index.jsx`'s `TAG_INIT` await the value
  the feed response resolves via `setVisitId`.
- **Passback** (`setAdPassback` → `passback:1`) is revenue-critical and flagged DO-NOT-REMOVE in
  `AnalyticsProvider`.
- Ad request gating (`gateOnUnmute`, `requestArmed`) and the HLS buffer caps exist specifically to stay
  under **Chrome Heavy Ad Intervention** — do not loosen without understanding HAI
  ([AD_REMOVAL_RISK_AUDIT.md](AD_REMOVAL_RISK_AUDIT.md)).
