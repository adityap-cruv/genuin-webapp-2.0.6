# Audio diagnostic — WebView API coverage audit

Answers one question, with citations: **does the `AUDIO_DIAGNOSTIC` beacon read every audio/autoplay
signal a WebView actually exposes to JavaScript, on both Android and iOS?**

**Verdict: yes.** Every API not consumed is either absent from the engines we ship to, structurally
unable to answer our question, or unsafe to touch on a live ad. Two candidate additions were
researched and **rejected on evidence** — both had looked promising. Two doc corrections came out of
it, recorded below.

- **Beacon design + decision tree**: [AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md)
- **What the field data showed**: [AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md)
- **Implementation**: [`src/ads/audioDiagnostic.ts`](../src/ads/audioDiagnostic.ts),
  emitted from [`src/ads/genAdSdk.ts`](../src/ads/genAdSdk.ts)
- **Audit date**: 2026-07-27. Compat data below was read from MDN BCD `main` and Blink source on that
  date; re-verify before treating a `false` as permanent.

> **Why this doc exists.** The escalation to Infolinks rests on "the web layer did everything right."
> That claim is only as strong as the set of signals we checked. Anyone can now see the set was
> complete, and see the two claims that were wrong before they get repeated.

---

## What the beacon reads

All from [`audioDiagnostic.ts`](../src/ads/audioDiagnostic.ts), sampled twice ~800 ms apart.

| Group             | Fields                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Element state     | `element_muted`, `element_volume`, `paused`, `ready_state`, `network_state`, `media_error_code`, `element_src`     |
| Playback progress | `time_advancing`, `time_advanced_ms`, `current_time_ms`, `duration_ms`, `buffered_ahead_s`                         |
| Audio presence    | `has_audio_track`, `audio_track_source`, `audio_decoded_bytes`, `audio_decoding`                                   |
| Platform / gating | `is_webview`, `audio_session_type`, `user_has_activated`, `user_activation_active`, `document_hidden`              |
| Slot sanity       | `media_element_count`, `audiocontext_state`                                                                        |
| SDK-reported      | `ad_blocked_reason`, `ad_blocked_error_name`, `ad_blocked_error_message`, `ad_blocked_source`                      |
| Base context      | `os_type`, `user_agent`, `geoip`, `app_bundle`, `app_store_id`, `volume`, `is_muted`, `unmute_blocked`, `build_id` |

---

## Rejected candidates — researched, then disproved

Both of these were initially recommended as gaps in this beacon. Both were wrong. Kept in full,
because each one reads as obviously correct until you check, and the next person will think of them
too.

### 1. `navigator.getAutoplayPolicy()` — not implemented in any engine we ship to

**The pitch.** A direct autoplay-policy oracle returning `allowed` / `allowed-muted` / `disallowed`.
On Audiomack it would read `allowed-muted`, turning our inference (`NotAllowedError` +
`user_has_activated: false`) into a direct read of the app's `setMediaPlaybackRequiresUserGesture`.
It would also decide the open `wp.wattpad` question. The claim made for it was that
[AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md) §5 rejected it too narrowly — "not in WebKit"
being true but leaving Chromium, where all our Android traffic lives.

**Why it fails.** It is not in Chromium either. Three independent checks:

| Source                                                                                                                                        | Result                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [MDN BCD `api/Navigator.json`](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/Navigator.json)                             | `chrome: version_added: false`; `webview_android` mirrors Chrome |
| [caniuse](https://caniuse.com/mdn-api_navigator_getautoplaypolicy)                                                                            | Unsupported through Chrome 153 / Chrome Android 150 / Safari 27  |
| [Blink `navigator.idl`](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/frame/navigator.idl) | **`getAutoplayPolicy` does not appear in the file**              |

Firefox 112 is the only implementation. Chromium issue
[40073791](https://issues.chromium.org/issues/40073791) ("Implement support for Autoplay Policy
Detection") is open, filed 2024-04; Chrome and Safari expressed interest with no timeline.

**The IDL check is the decisive one** — compat tables can lag, but an absent IDL entry means the
method cannot exist at runtime. Do that check first next time.

**What this means for the Android conclusion — it gets _stronger_.** With no policy-detection API in
Chromium, inspecting the `play()` promise rejection is not a fallback, it is
[the canonical technique](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play) per
MDN and [Chrome's own autoplay docs](https://developer.chrome.com/blog/autoplay). GenAd already does
exactly that (`_autoplayAudio`, `gen_ad.js:5352-5374`) and CXR captures the result. The findings
doc's `NotAllowedError` trace is the best signal the platform offers, not a proxy for a better one.

### 2. `navigator.userAgentData.getHighEntropyValues()` — unavailable in Android WebView

**The pitch.** `fullVersionList` would give the exact WebView build, separating "Audiomack ships an
old WebView" from "Audiomack sets the gesture flag" — different asks of different parties. Motivated
by reversal 7, where app-level identity (`app_name`) proved unreliable.

**Why it fails.**
[MDN BCD `api/NavigatorUAData.json`](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/NavigatorUAData.json):
`webview_android: version_added: false` for both the interface and `getHighEntropyValues`.

Search suggests WebView 116+ support, but [Android's own
announcement](https://android-developers.googleblog.com/2024/12/user-agent-reduction-on-android-webview.html)
carries the condition that kills it: UA-CH works _"only for applications that send the default
User-Agent string."_ Ad-serving host apps routinely call `setUserAgentString()`. So even where it
exists it is unreliable **precisely in our population**, and Chrome 144+ adds
`ch-ua-high-entropy-values` permissions-policy gating on top.

WebView version stays UA-string-only.

---

## iOS — every exposed API, and how we consume it

Scope: `tritondigital`/`infy` audio ads, 320×50, `initialVolume: 0.2`.

| API                                                                             | Availability                 | Our use                                        | Correct?                                        |
| ------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `HTMLMediaElement.audioTracks`                                                  | Safari 7+ (unflagged)        | `has_audio_track`                              | ✅ — see below                                  |
| `.muted` / `.paused` / `.readyState` / `.networkState` / `.buffered` / `.error` | Universal                    | element-state fields                           | ✅                                              |
| `.volume`                                                                       | Read-only on iOS, always `1` | `element_volume`                               | ✅ documented                                   |
| `navigator.audioSession.type`                                                   | Safari 16.4+                 | `audio_session_type`                           | ✅ read-only — but see correction 1             |
| `navigator.userActivation`                                                      | Safari 16.4+ / Chrome 72+    | `user_has_activated`, `user_activation_active` | ⚠️ sampled late — see gap                       |
| `document.hidden`                                                               | Universal                    | `document_hidden`                              | ✅                                              |
| `AudioContext.state`                                                            | Pre-existing context only    | `audiocontext_state`                           | ✅ never constructs — always `null` in practice |
| `webkitAudioDecodedByteCount`                                                   | **Absent on current iOS**    | `audio_decoding` (dead)                        | ✅ retained for older WebKit                    |
| `webkitHasAudio`                                                                | **Absent on current iOS**    | last-resort fallback                           | ✅                                              |

### `audioTracks` is the load-bearing field — and it is safe on this tag

Two traps here, both cleared.

**Trap 1 — the compat pattern is inverted from the usual.**
[MDN BCD `api/HTMLMediaElement.json`](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/HTMLMediaElement.json)
marks `audioTracks` **flag-gated in Chrome** (37, needs
`#enable-experimental-web-platform-features`) and **Firefox** (33, needs `media.track.enabled`).
Only **Safari 7+** has it unflagged. The field the beacon depends on is solid on the platform under
investigation and unreliable elsewhere — the opposite of the usual "iOS is the gap" assumption.

**Trap 2 — HLS would have broken it, and this path is not HLS.** WebKit has known HLS audio-track
exposure gaps ([WebKit HLS audio-tracks
test](https://github.com/WebKit/webkit/blob/main/LayoutTests/http/tests/media/hls/hls-audio-tracks.html),
plus [bug 180696](https://bugs.webkit.org/show_bug.cgi?id=180696) on
`createMediaElementSource` with HLS). That would be disqualifying. It does not apply: GenAd sets
`audio.src = vastData.mediaUrl` directly (`gen_ad.js:4423`) from a parsed VAST `<MediaFile>`
(`gen_ad.js:3366-3378`) — **progressive download, no `hls.js`, no native HLS**.

> **Regression risk worth naming:** if a future audio creative ships an HLS `<MediaFile>`,
> `has_audio_track` may silently read `false` on iOS with `audio_track_source: "audioTracks"` — which
> the decision tree reads as **"our creative has no audio."** That is a false accusation against
> ourselves. Re-verify this section if the transport changes.

`ranked-fallback` order in [`readAudioTrack`](../src/ads/audioDiagnostic.ts) is right: `audioTracks`
first (works on iOS), decode counter second, `webkitHasAudio` last.

### `element_volume: 1` is Apple-documented, not a bug

[Apple's iOS-Specific
Considerations](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html):
volume is read-only on iOS and always reads `1`; level is under physical user control. So
`configured_volume: 0.2` alongside `element_volume: 1` is **expected** and is not evidence the level
failed to apply. The three-views-of-volume table in the plan has this right.

---

## Correctly excluded — do not add these

| Candidate                                                                       | Why not                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AVAudioSession` category/mode, ring-silent switch, output route, system volume | No JS surface at all. If any of these were readable the beacon would be unnecessary.                                                                                                                                                    |
| Android `AudioManager` / `STREAM_MUSIC`                                         | Native only.                                                                                                                                                                                                                            |
| `AudioSession.state` / `onstatechange`                                          | Not merely flag-gated — [MDN BCD `api/AudioSession.json`](https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/AudioSession.json) has **no `state` entry**, and the interface documents only `type`. Nothing to build on. |
| `setSinkId` / `enumerateDevices`                                                | Gated on getUserMedia permission. Prompting for mic access inside an ad is far worse than the bug.                                                                                                                                      |
| Web Audio `AnalyserNode` on the element                                         | `createMediaElementSource` **reroutes the element's audio through the graph** — changes playback on a live ad, violating instrumentation-only. Also measures the graph, not OS output.                                                  |
| Constructing an `AudioContext`                                                  | Can claim the audio session on iOS and interrupt the ad's own playback.                                                                                                                                                                 |

---

## Corrections this audit produced

### 1. `audio_session_type` is not a native-silencing detector

[AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md) reversal 1 reads `"auto"` on 120/120 iOS
visits as evidence about the host app, hedged with "this is also what an unimplemented API looks
like." It is actually a **third** thing: an API that is implemented (Safari 16.4+), returning its
documented default, that was never designed to expose the host's native category.

[MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession/type) does not document whether
`type` reflects the platform's _effective_ session or only the page's _requested_ value, nor what you
read back before setting. Since `"auto"` means "the UA chooses based on the APIs in use," reading
`"auto"` most plausibly means **nobody set it** — i.e. it reports that _we_ did not set a session
type. Paired with [WebKit bug 167788](https://bugs.webkit.org/show_bug.cgi?id=167788) (**still NEW**,
unassigned, P2, latest comment 2026-02-12, no shipped workaround or API), there is no mechanism by
which this field could ever have reported Infolinks' `AVAudioSession` category.

**Read it as:** "did CXR set a session type" — never as a window onto the native layer. The
`"auto"` result neither supports nor undermines the native hypothesis.

### 2. `has_audio_track` is more trustworthy on iOS than the plan hedges

The plan's amendment calls the `audioTracks`-based claim "slightly weaker than originally planned"
because the byte counter is gone. True for _decoding_, but for **track presence** `audioTracks` is
unflagged Safari 7+ and this tag is progressive-download — so a `true` here is solid. The honest
limit is unchanged: we prove a track exists and playback progresses, not that audio is being decoded.

---

## Remaining gap — real, and needs no new API

`user_activation_active` is sampled ~800 ms **after** fill
([`genAdSdk.ts:485-519`](../src/ads/genAdSdk.ts)), long after GenAd's `play()` call
(`gen_ad.js:5353`). Transient activation is what actually gates unmuted autoplay — the mechanism
behind [reversal 4](AUDIO_DIAGNOSTIC_FINDINGS.md#reversals--conclusions-that-did-not-survive) — so as
recorded the field is near-meaningless, and `user_has_activated` (sticky) carries the signal.

Fixing it needs an earlier read, not an unavailable API. It would sharpen the open `wp.wattpad`
question (81 events `element_muted: true` / `unmute_blocked: false`); it would **not** change the
Audiomack verdict. Whether that justifies a deploy window is a judgement call — production is rolled
back, so it means a fresh window, not an edit.

## What is not blocked by any of this

Both open items in the findings log need **no new fields** — they are queries against data already
collected:

1. **Visit-weighted Android mute rate** — one-line change (`uniqExact(visit_id)`). Gates the number
   in the Infolinks escalation; do it before quoting any rate externally.
2. **iOS analysis** — deferred by choice, data already in hand.

Treat "should we ship more beacon fields" as **closed** unless the transport changes (see the HLS
regression risk above) or Chromium ships `getAutoplayPolicy`.
