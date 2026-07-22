# `src/player` — CXR Player Module

Owns the complete lifecycle of a single Vlitejs + HLS.js + IMA-ads video player
for one reel item. All orchestration is in TypeScript hooks; the JSX surface
(`LightPlayer.tsx`) is a thin presentation wrapper (≤120 lines).

---

## Event flow

The table below shows the exact order events are emitted per player lifecycle.
All analytics calls go through the `sendEvent` function from `useAnalytics()`.

| Condition                                          | Event emitted                                                                          | Hook responsible       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| Player ready + `isVideoItem === true`              | `video_loaded`                                                                         | `usePlayerLifecycle`   |
| Native `play` fires                                | quartile flags reset if restart                                                        | `useQuartileEvents`    |
| Native `playing` + `currentTime ≤ 0.1`             | `video_started` + optional `video_play_started`                                        | `usePlayStartedEvents` |
| Native `playing` + `recentClick` + not restart     | `video_play_started`                                                                   | `usePlayStartedEvents` |
| Native `playing` + not `recentClick` + not restart | `video_started`                                                                        | `usePlayStartedEvents` |
| Player `pause`                                     | `video_play_interrupted`                                                               | `usePlayStartedEvents` |
| `timeupdate` pct ≥ 25 / 50 / 75 / 100              | `video_first_quartile` / `video_midpoint` / `video_third_quartile` / `video_completed` | `useQuartileEvents`    |
| Native `ended`                                     | `video_completed` (if not already sent)                                                | `useQuartileEvents`    |
| IMA `adsrequest`                                   | `ad_request`                                                                           | `useImaPlugin`         |
| IMA LOADED                                         | `ad_response`                                                                          | `useImaPlugin`         |
| IMA STARTED                                        | `ad_start`                                                                             | `useImaPlugin`         |
| IMA COMPLETE                                       | `ad_complete`                                                                          | `useImaPlugin`         |
| IMA error                                          | `ad_error`                                                                             | `useImaPlugin`         |

---

## HLS gating

- **`hls.js/light` build** — the player dynamically imports `hls.js/light`, not
  the full `hls.js`. CXR uses only a subset of the API (isSupported, the
  buffer-limited constructor, loadSource/attachMedia/startLoad/stopLoad/destroy,
  `MANIFEST_PARSED`, lowest-level pinning) and none of the features the light
  build drops (alternate audio tracks, subtitles, EME/DRM, low-latency), so the
  chunk is ~240 KB smaller. Types come from `hls.js` (the light subpath ships no
  `.d.ts`); see `src/types/hls-light.d.ts`.

- **`autoStartLoad: false`** — HLS.js will not fetch any segments until we
  explicitly call `startLoad()`. This saves mobile bandwidth for off-screen
  slides that are preloaded in the DOM but not yet playing.

- **`startLoad(-1)` at mount only for the active slide** — the eager mount-time
  load is gated on `isPlayRef.current`. The active slide loads immediately (so it
  plays instantly and Vlitejs can fire `onReady`). Inactive mounted slides do
  **not** eager-load — every mounted m3u8 slide used to `startLoad(-1)` here,
  pulling N slides' first segments into Chrome's Heavy Ad Intervention budget.
  An inactive slide defers its load until it becomes active.

- **`startLoad` / `stopLoad` toggled by `isPlay`** — an inactive slide starts
  loading when the swiper flips `isPlay=true` (this call sits *above* the
  `isPlayerReady` guard, so a swipe-in before `onReady` still kicks off the load
  and unblocks `onReady`); an active slide that goes inactive calls `stopLoad()`.

---

## `lastUserPlayAt` window

The constant `RECENT_CLICK_WINDOW_MS = 2000` (exported from
`usePlayStartedEvents.ts`) defines how long after a user tap/click we consider
the next `playing` event to be "user-initiated".

- If `Date.now() - lastUserPlayAt < 2000`: the playing event is treated as a
  deliberate user action → emit `video_play_started`.
- Otherwise: the playing event is treated as an autoplay or programmatic play →
  emit `video_started` only.

The 2-second window is generous enough to cover slow devices where the browser
may buffer briefly before firing `playing`, but short enough to avoid
misattributing autoplays triggered by the swiper.

---

## Restart detection

A "restart" is detected inside `usePlayStartedEvents` / `useQuartileEvents` when
either of these is true:

- `currentTime ≤ 0.1` — the video playhead is at (or very near) the beginning.
- `_wasEnded === true` — the video reached its natural end in the previous play
  cycle (set by the `ended` listener in `useQuartileEvents`).

On a detected restart, `resetForPlay()` clears all quartile deduplication flags
(`q1`, `q2`, `q3`, `q4`) so they can fire again for the new play cycle.

---

## Known quirk

**Vlitejs fires its own `play` event before the native `playing` event**; the
native events arrive in the order: `play` (play requested) → `playing` (frames
rendering). Because Vlitejs intercepts the native `play` event early, we attach
our "did user click" and "did we already report started?" logic **exclusively to
native DOM events** via `player.getInstance()?.addEventListener(...)`. The
Vlitejs `player.on('play', ...)` listener is a no-op in CXR — we register it
only to satisfy the Vlitejs API; no analytics emission happens there.
