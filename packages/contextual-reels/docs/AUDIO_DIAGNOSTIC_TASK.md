# Task: Audio-audibility diagnostic beacon (iOS WKWebView "volume up, no sound")

Status: **Shipped** (PR #473). This file is kept as the original task brief — the
record of what was asked for before implementation. It is **not** a description of
the shipped code, and two of its central technical claims were disproved on-device.

> **Do not implement from this document.** Two things below are now known wrong:
>
> | This doc says                                                                 | What is actually true                                                                                                                                                      |
> | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `webkitAudioDecodedByteCount` is "the one JS-observable signal" proving audio | **Absent on current iOS** (`typeof === "undefined"`, verified via Safari Web Inspector). Detection uses `audioTracks`; `audio_decoding` carries **no information** on iOS. |
> | The native `AVAudioSession` hypothesis (the decision tree below rests on it)  | **Not found in the field** — `audio_session_type = "auto"` on 120/120 visits. iOS remains measured but unexplained.                                                        |
>
> Current truth, in reading order:
> [AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md) (what the field data
> established — 7 reversals; start here) ·
> [AUDIO_DIAGNOSTIC_ANALYST_GUIDE.md](AUDIO_DIAGNOSTIC_ANALYST_GUIDE.md) (how to read
> the data) · [`src/ads/README.md`](../src/ads/README.md) (the shipped decision table
> and the invariants to preserve).

Scope: contextual-reels package only (JS/TS). No native changes are possible from here (see "What we cannot do").

---

## Problem report

Infolinks serves our reel creative as an IAB banner inside their native iOS app
via a `WKWebView` (the served template is `src/infolinks_webview.html`). The
publisher reports: **the volume UI goes up, but no audio is heard.**

Affected tag (Infolinks 320x50):

```
6a39163e92929ebec64d78ab
```

Its strategy (`src/strategies/strategyConfig.ts`):

```ts
"6a39163e92929ebec64d78ab": { initialVolume: 0.2, singleHitWaterfall: true, preset: "servedStatically" }, // 320x50
```

`initialVolume: 0.2` ⇒ `wantsAudibleAdStart = true`, so this tag **attempts
audible autoplay at 20% volume with NO user gesture**: it bypasses the
`gateOnUnmute` gate and inits the ad with `muted: false, volume: 0.2`
(`src/ads/genAdSdk.ts` ~426-441). This is the most fragile audio path on iOS.

---

## Root-cause analysis (why we can't just "fix" it in JS)

`AVAudioSession` is an **app-global native setting owned by whoever instantiates
the WKWebView** — here, the Infolinks SDK / host app. JavaScript in a WKWebView
**cannot read it, cannot set it, and cannot detect the ring/silent switch**.
There is no web API for any of this. A Web Audio `AnalyserNode` measures the
signal feeding the graph, **not** whether the OS actually emits sound, so it
cannot confirm audibility either.

Two independent native gates (both owned by Infolinks, not us) can silence a
correctly-unmuted element:

| Native gate                                            | Effect                                                                        | Matches "volume up, no sound"? |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------ |
| `mediaTypesRequiringUserActionForPlayback` not cleared | unmuted autoplay → `NotAllowedError` → our fallback mutes + drops volume to 0 | No — UI would show 0/muted     |
| `AVAudioSession` = `.ambient`/default + ring switch ON | `muted=false`, `volume>0`, WebKit decodes audio, but OS routes to silence     | **Yes**                        |

The reported symptom points at the **audio-session gate**. A user tap does NOT
rescue this: a gesture satisfies the autoplay policy but not the audio-session
category.

### The real fix (not ours)

Infolinks' WKWebView must configure:

```swift
try AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback)
try AVAudioSession.sharedInstance().setActive(true)
```

---

## What this task IS: prove which layer owns the failure, on field traffic

We cannot fix the audio, but we CAN emit an analytics beacon that captures enough
state to definitively localize the fault. ~~The one JS-observable signal that
proves audio is reaching the OS is **`video.webkitAudioDecodedByteCount`** — if it
climbs while `muted=false` and `volume>0`, WebKit is decoding audio and handing it
to the OS, so any silence is native (below the web layer).~~

> **Wrong — this was the plan's premise and it does not hold.**
> `webkitAudioDecodedByteCount` **does not exist on current iOS**, so nothing
> proves audio is _decoded_. The shipped beacon rests on `has_audio_track` (from
> `audioTracks`, which **is** populated on iOS) + `element_muted === false` +
> `time_advancing` — a track exists and playback is progressing. That is a weaker
> claim than "audio reached the OS", and the shipped fields say so rather than
> implying more.

### Decision tree the beacon must enable

> **Superseded.** The table below is the originally-specified tree, written around
> the byte counter. The tree the beacon actually ships is in
> [`src/ads/README.md`](../src/ads/README.md); field names also drifted
> (`autoplay_blocked` → `ad_blocked_reason`). Kept only to show what was asked for.

| Snapshot (webview)                                                                                | Conclusion                                                                                          |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `muted=false`, `volume>0`, `audio_decoding=true`, `time_advancing=true`, `autoplay_blocked=false` | **Native audio-session silencing** → escalate to Infolinks (set `.playback`). Not our bug.          |
| `autoplay_blocked=true` / `muted=true` / `volume=0`                                               | Autoplay policy gate → unmuted autoplay blocked (their `mediaTypesRequiringUserActionForPlayback`). |
| `audio_decoding=false` / `audio_decoded_bytes=0`                                                  | No audio track or decode failure → creative/encoding bug (ours).                                    |

---

## Implementation

### 1. Add event to the vocab

`src/analytics/analytics.ts` — add to the `EVENT` map:

```ts
AUDIO_DIAGNOSTIC: "Audio Diagnostic",
```

### 2. Track autoplay-blocked in the play path

`src/player/hlsPlayer.ts` — in `tryPlay`, the `NotAllowedError` branch (~86-92)
already calls `onAutoplayBlocked?.()`. Ensure that callback path can set a ref/flag
the beacon reads (e.g. plumb an `autoplayBlockedRef` through
`src/player/usePlayerLifecycle.ts` where `tryPlay(..., false, () => onAutoplayBlockedRef.current?.())`
is invoked, ~190-219). No behavior change — flag only.

### 3. Emit the snapshot beacon

Best insertion point for this tag's audible-autoplay path: right after the
audible start is attempted. Two acceptable homes:

- `src/controls/ClickOverlay.tsx` — after the `ad:unmuteRequest` emit (~55-63), for the tap-to-unmute path.
- The audible-autoplay start in `src/player/usePlayerLifecycle.ts` (~190-219) — for the `wantsAudibleAdStart` (no-gesture) path, which is what this tag uses. **Cover this one.**

Sample ~800ms after the attempt so decode/advance deltas are meaningful:

```ts
const v = videoEl.current;
if (v) {
  const decoded0 = v.webkitAudioDecodedByteCount ?? 0;
  const t0 = v.currentTime;
  setTimeout(() => {
    analytics.sendEvent(EVENT.AUDIO_DIAGNOSTIC, {
      is_webview: isWebView(), // src/platform/device.ts
      element_muted: v.muted,
      element_volume: v.volume,
      paused: v.paused,
      ready_state: v.readyState,
      audio_decoded_bytes: v.webkitAudioDecodedByteCount ?? null,
      audio_decoding: (v.webkitAudioDecodedByteCount ?? 0) > decoded0,
      time_advancing: v.currentTime > t0,
      autoplay_blocked: autoplayBlockedRef.current ?? false,
      wants_audible_ad_start: wantsAudibleAdStart, // from useStrategy()/genAdSdk
      audiocontext_state: probeAudioContextState(), // best-effort helper, see below
      ua: navigator.userAgent,
    });
  }, 800);
}
```

Notes:

- `webkitAudioDecodedByteCount` is WebKit-only and untyped — extend the
  `HTMLVideoElement` type locally or read via `(v as any)`.
- `probeAudioContextState()`: best-effort — if an `AudioContext` already exists,
  return its `.state` ("running" | "suspended"); otherwise return `null`. Do NOT
  create a new `AudioContext` just for this (side effects on iOS). Optional field.
- Every event already carries `volume`, `is_muted`, `os_type`, `user_agent`,
  `geoip`, `tag_id` via the analytics base context, so webview-vs-Safari
  correlation comes for free.

---

## Acceptance criteria

- A single `AUDIO_DIAGNOSTIC` beacon fires per audible-start attempt for the
  `wantsAudibleAdStart` path (and optionally the tap-to-unmute path).
- Fields above are populated; `audio_decoding` and `time_advancing` reflect real
  ~800ms deltas.
- No change to playback/mute behavior — instrumentation only.
- Verified on tag `6a39163e92929ebec64d78ab` in a webview UA: beacon shows
  `element_muted=false`, `element_volume≈0.2`.
- Tests updated where analytics emissions are asserted (see
  `src/ads/genAdSdk.test.tsx`, `src/providers/AnalyticsProvider.test.tsx`).

## What we cannot do (do not attempt)

- Set/read `AVAudioSession`, detect the ring/silent switch, or force output —
  impossible from web content. The fix for actual audibility is native and must
  be handed to Infolinks.

---

## Key references

- `src/strategies/strategyConfig.ts:109` — the affected tag's strategy
- `src/ads/genAdSdk.ts` ~283-345, ~426-441 — `wantsAudibleAdStart`, ad init `muted/volume`
- `src/player/hlsPlayer.ts` ~62-109 — `tryPlay`, `NotAllowedError` fallback
- `src/player/usePlayerLifecycle.ts` ~160-219, ~452-458 — audible autoplay start, volume sync
- `src/controls/ClickOverlay.tsx` ~35-69 — tap-to-unmute gesture path
- `src/analytics/analytics.ts` — `EVENT` vocab + `sendEventLog`
- `src/providers/AnalyticsProvider.tsx` — `useAnalytics().sendEvent`, base context
- `src/platform/device.ts:98-112` — `isWebView()`
- `src/infolinks_webview.html` — the served creative template (loads with `GIV` + `tagId`)
