# Feed Hooks

Navigation, gating, and ad-break hooks for the reels feed. Since the migration to
`embla-carousel` (see [ADR 001](../../../docs/cxr-decisions/001-drop-swiper.md)), Embla owns
swipe/wheel physics and slide-in-view tracking, so the old bespoke swipe/wheel/snap hooks were
removed. The feed-navigation orchestrator itself now lives one level up at
[`src/feed/useFeedNavigation.ts`](../useFeedNavigation.ts) (the `useEmblaFeed` hook), not in this
folder.

| Hook                   | File                        | Purpose                                                                                                                                                                                                                                                             | Key constants                                    |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `useEmblaCarousel`     | `useEmblaCarousel.ts`       | Owns the Embla instance via a **callback ref** (synchronous init — avoids the ad-callback-before-API race). Vertical, `loop`, `duration: 15`. Custom wheel/trackpad handler (one slide per gesture, unlocks on `settle`). `watchDrag` predicate (`skipDragInAdSlot`) blocks phantom drags that start inside an ad iframe. `enable()`/`disable()` freeze swiping (reInit `watchDrag:false` + wheel guard) — used while Octo is open or an ad is active. | Wheel `THRESHOLD = 20`px accumulated             |
| `useSwipeGate`         | `useSwipeGate.ts`           | Single **combined** gate over a `disableReasons[]` array, calling `useEmblaCarousel`'s `enable`/`disable`. One gate — not one-per-reason — so two independent reasons (Octo split open, ad active) can't race to re-enable swipe while the other still wants it frozen. | —                                                |
| `useInactivityAdvance` | `useInactivityAdvance.ts`   | 10 s inactivity timer that auto-advances the feed when `isActive` (used for audio-only ads that have no natural "ended" event). Resets on pointer/click/touch.                                                                                                        | `DEFAULT_TIMEOUT_MS = 10_000`                    |
| `useFullscreenAdBreak` | `useFullscreenAdBreak.ts`   | State machine for the mid-reel fullscreen ad break: `idle → requesting → playing → completed → (cover hold) → idle \| failed`. Exposes `shouldMountAd`, `isOverlayMounted`, `isAdVisible`, `suppressVideo`, and the transition handlers that `VideoLayout` overlays a `GenAdSlot` with. | `AD_FADE_MS = 300`, `COMPLETED_COVER_MS = 700`   |

## Related (outside this folder)

- [`../useFeedNavigation.ts`](../useFeedNavigation.ts) — `useEmblaFeed`: subscribes to Embla
  `select`, exposes `activeIndex`, `visibleIndices` (slides-in-view), `goNext/goPrev/goTo/autoAdvance`
  (fires `Swipe Next/Previous` + the `auto_swipe` flag), and accumulates watch-time for `video_watch`.
- [`../slideMountWindow.ts`](../slideMountWindow.ts) — `computeSlideMountWindow(activeIndex, visibleIndices, { radius })`:
  which slide indices mount a real `ReelItem` vs a zero-fetch `ReelSlidePlaceholder`. `radius` defaults
  to `0` (`FEED_PRELOAD_RADIUS`); loop-wrapped.
- [`../activeSlideState.ts`](../activeSlideState.ts) — `getActiveSlideState(entries, activeIndex, isAdBreakActive)`
  → `{ isAdActive, activeReel }`.
