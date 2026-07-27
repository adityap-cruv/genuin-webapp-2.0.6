# Audio-audibility diagnostic beacon (iOS WKWebView "volume up, no sound")

> **Read this first (2026-07-27).** This document is the **design record** for the beacon — it explains
> why it was built and how it works, and it still reflects the _original_ native-`AVAudioSession`
> hypothesis in the Context section below. **That hypothesis was disproved.** For what is actually
> true now, read in this order:
>
> | For…                                            | Read                                                                                                                                                   |
> | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | What the field data established (and disproved) | [AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md) — 7 reversals; **start here**                                                             |
> | Whether the beacon reads every available API    | [AUDIO_DIAGNOSTIC_API_COVERAGE.md](AUDIO_DIAGNOSTIC_API_COVERAGE.md) — yes; also corrects `audio_session_type`                                         |
> | Whether a protocol/standard could fix it        | [Delivery-layer alternatives](#delivery-layer-alternatives--simid-mraid-openrtb-omid-all-rejected-2026-07-27) below — SIMID/MRAID/OpenRTB/OMID, all no |
>
> Short version of the outcome: **Android** is a per-app WebView-config problem (Audiomack ~95% muted,
> `NotAllowedError`, no user gesture). **iOS** is measured but unexplained — ~64% muted _with_ a prior
> gesture, so the Android mechanism does not transfer. Native `AVAudioSession` silencing was **not**
> found (`audio_session_type = "auto"` on 120/120 visits, though that field cannot see the host's
> category — see coverage-audit correction 1).

## Context

Infolinks serves our reel creative as an IAB banner inside their native iOS app via a `WKWebView`
(template: `src/infolinks_webview.html`). The publisher reports **the volume UI goes up, but no audio
is heard** on tag `6a39163e92929ebec64d78ab` (320x50).

That tag runs `initialVolume: 0.2`
([strategyConfig.ts:109](../src/strategies/strategyConfig.ts#L109)) →
`wantsAudibleAdStart = true`, so it attempts **audible autoplay with no user gesture**: the mute gate
is bypassed and the ad inits with `muted: false, volume: 0.2`
([genAdSdk.ts:430-441](../src/ads/genAdSdk.ts#L430-L441)). This is the most
fragile audio path on iOS.

**The unmuted start is a hard advertiser requirement, not config drift** (confirmed): this audio ad
must load unmuted at 20%. So muting by default, gating on a gesture, or lowering `initialVolume` are
**not available as fixes** — a browser autoplay block is something we _report_, never something we
design away. `GIV=0` is deliberately ignored (the override may raise, never suppress — PR #470), so the
tag holds 0.2 even when the publisher sends `GIV=0`.

**Why field data rather than the local repro** (this is the point of the task): the harness already
reproduces the symptom on demand via its `AVAudioSession` toggle, so the _mechanism_ is understood.
What is missing is proof that this is what happens in the publisher's app, on their audio-session
config, and at what rate. A repro alone invites _"that's your test app, not ours."_ The harness is the
**verification** surface for the beacon, not the evidence for Infolinks.

`AVAudioSession` is an app-global native setting owned by whoever instantiates the WKWebView (the
Infolinks host app). JS cannot read it, set it, or detect the ring/silent switch — **we cannot fix
audibility from this package.** What we _can_ do is emit a beacon proving which layer owns the failure
on field traffic, so the escalation to Infolinks is backed by data rather than a hypothesis.

**Scope (confirmed):** ad path only, for tag `6a39163e92929ebec64d78ab`. The reel `<video>` path,
`usePlayerLifecycle.ts`, `hlsPlayer.ts`, and `ClickOverlay.tsx` are **not touched**.

### What the local harness already establishes

`/Users/kunalshah/genuin/infolinks-demo-ios` (IAB-Demo) replicates the publisher webview. Reading it
reframes the task in three ways:

1. **The native hypothesis is already reproducible locally.** `ContentView.swift:25-39` has an
   `AudioSession` toggle switching `.playback`/`.moviePlayback` vs `.ambient` + `setActive(true)`,
   built specifically to demo "volume up, no sound". So the beacon's job is **not** to discover the
   cause — it is to _measure how often it happens in the field_, where the publisher's real
   audio-session config is unknown to us.
2. **The autoplay-policy gate is ruled out in the harness.** `WebView.swift:38-39` sets
   `allowsInlineMediaPlayback = true` and `mediaTypesRequiringUserActionForPlayback = []`; its own doc
   comment notes any observed muting must therefore come from the creative. The publisher's app may
   still differ — which is why the beacon must distinguish the two gates in the field.
3. **We already ship the autoplay-block signal — reuse it, don't duplicate it.** `unmute_blocked` is
   set on the analytics base context from the GenAd SDK's `onVolumeChange({reason:"system"})`
   ([genAdSdk.ts:505-520](../src/ads/genAdSdk.ts#L505-L520)), already tested at
   `genAdSdk.test.tsx:1687`. The original task doc proposed plumbing a new `autoplayBlockedRef` through
   `hlsPlayer`/`usePlayerLifecycle` — for the ad path that is redundant, and out of scope here.

### Reaching the ad's media element

The task doc assumes a `videoEl` in scope. In the ad path there is none: the media element is created
by the **GenAd SDK** inside `<div id={containerId}>`, and no provider exposes a video ref
(`PlayerProvider` exports state + setters only). What we do have is `containerRef`
([GenAdSlot.tsx:116](../src/ads/GenAdSlot.tsx#L116)), already used this way for
slot sizing at [genAdSdk.ts:621](../src/ads/genAdSdk.ts#L621).

Resolve the element with `containerRef.current?.querySelector("video, audio")`. The SDK mounts it
**asynchronously**, so resolve it on the `onWaterfallSuccess` callback (the fill moment,
[genAdSdk.ts:442-459](../src/ads/genAdSdk.ts#L442-L459)) rather than reading it
synchronously at init — and no-op if it never appears.

### Does GenAd need changing? No — verified against `html5 creative/src/gen_ad.js`

The mute/unmute and rendering do happen inside GenAd, so this was worth checking. Four findings, all
pointing at the host as the right place for the beacon:

1. **No iframe on this tag's path — the element is queryable from the host.** GenAd calls
   `document.createElement("video")` at 8 sites (`gen_ad.js:2516, 2536, 3836, 4126, 4225, 4347, 4710,
4803`) and creates **zero** iframes. **This is the load-bearing fact** — had this tag's provider
   used an iframe, the beacon would have had to move into GenAd.

   **Shadow DOM does not block this** — worth stating because it would be disqualifying if it did.
   The widget does render in a Shadow DOM and `document.querySelector` cannot cross into it, but we
   never do a document-level search. `containerRef.current` _is_ the element inside the shadow root,
   and `.querySelector()` on an element searches its own subtree. GenAd receives that same node as
   `containerElement` ([genAdSdk.ts:424](../src/ads/genAdSdk.ts#L424)) and
   resolves `this.container = this.containerElement` (`gen_ad.js:1271-1274`), appending the audio
   wrapper into it. The element we want is therefore a descendant of the node we already hold.

   **Provider scope — verified, not assumed.** The affected tag's own fixture
   (`src/providers/static-tag/6a39163e92929ebec64d78ab.feed.json`) is `"platform": "tritondigital"` →
   the **audio-VAST path** (`this._audioElement`, `gen_ad.js:4347`): a raw `<video>` in our container.
   Not IMA, not Aniview.

2. **The 320x50 audio-ad path uses a hidden `<video>`.** `gen_ad.js:4347-4355` creates
   `<video>` (deliberately, not `<audio>`: Chrome blocks muted autoplay for `<audio>`) with
   `style.display = "none"`, held as `this._audioElement`. So the selector must be
   `"video, audio"` and must **not** filter on visibility or dimensions — the affected tag's element
   is invisible by design.
3. **GenAd already reports the autoplay block correctly — twice.** Both the audio-VAST path
   (`gen_ad.js:5270-5296`, `_autoplayAudio`) and the IMA path (`gen_ad.js:2863-2872`) detect the block,
   fall back to muted, fire `onAdBlocked("unmuted_autoplay_restricted")`, and call
   `_triggerVolumeChange("system")` / `mute(true, "system")`. That `reason: "system"` is precisely what
   already drives `unmute_blocked` in CXR. Nothing to add.
4. **The gap is what GenAd reports, and it is not fixable inside GenAd.** `_triggerVolumeChange`
   (`gen_ad.js:6648-6655`) reports `this.isMuted` / `this.volume` — GenAd's **internal state**, not the
   element's real `muted`/`volume`/`webkitAudioDecodedByteCount`. The whole point of this beacon is that
   internal state says "unmuted at 0.2" while the OS emits silence. Only a read of the **live element**
   distinguishes those, and the host can do that read directly.

   Sharpening this: `_triggerVolumeChange` fires **before** the element writes in both `setVolume()`
   (`gen_ad.js:6572`) and `mute()` (`:6612`). So `onVolumeChange` — and therefore `unmute_blocked` —
   reports GenAd's _intent_, never the element's realized state. That is exactly why the beacon must
   sample the element itself rather than trust the callback, and why `unmute_blocked` alone was never
   going to answer the publisher's question.

**Conclusion: no GenAd change.** Reading the element host-side gets strictly more truth than any
GenAd-reported state, with none of the deployment risk below.

**Known limit of this approach (accepted, because it doesn't affect this tag).** The host-side read
works for the audio-VAST/Triton path and would _not_ generalize to two other providers:

- **IMA** — the element is SDK-private inside `adDisplayDiv`; volume only via `adsManager.setVolume()`.
- **Aniview** — renders into a **cross-origin iframe**; GenAd itself can only poll it
  (`gen_ad.js:2058-2088`), so no element is reachable from either side.

So if the diagnostic later needs to cover video ads across all providers, the beacon **does** have to
move into GenAd as an additive, default-off `events.onAudioDiagnostic` callback (GenAd detects and
reports; the host keeps owning the analytics transport). That is a deliberate follow-on, not this
change: the reported bug is on a Triton audio tag, where the host read is sufficient and free.

Two host-side follow-ups this surfaced (both cheap, neither blocking):

- **CXR never subscribes to `onAdBlocked`.** GenAd fires it with the exact string
  `"unmuted_autoplay_restricted"` and we discard it — a free, more precise signal than inferring from
  `onVolumeChange`. Worth wiring into the beacon payload as `ad_blocked_reason`.
- **`GenAd.mute(instanceId, isMuted)` drops the `reason` arg** (`gen_ad.js:7029-7038` → instance
  `mute(isMuted, reason)` at `:6607`), so a host-initiated mute fires `onVolumeChange` with
  `reason: undefined`. Harmless for us (CXR only acts on `reason === "system"`), but it means
  host-driven mutes are indistinguishable from SDK-internal ones in that callback. Not worth a GenAd
  release on its own.

### Why not change GenAd anyway (deployment risk)

GenAd is a **separately deployed CDN bundle**, not a workspace dependency. CXR loads it from
`https://media.begenuin.com/ad-sdk/1.0.0/gen_ad.min.js`
([genAdSdk.ts:36](../src/ads/genAdSdk.ts#L36)) — and that `1.0.0` is a **rolling
channel, not a version pin**: the SDK is internally at v1.23.0. So a GenAd change ships to _all_ CXR
traffic (every tag, every publisher) on CDN purge, with no staged rollout and no way for CXR to pin the
old build. Its repo also enforces doc-sync as a golden rule (`CLAUDE.md`/`AGENTS.md`: editing
`src/gen_ad.js` requires updating `API.md`/`README.md` in the same change) plus a version bump and
Bunny purge. That is a disproportionate blast radius for instrumentation that one tag needs and that
the host can gather on its own.

### Decision tree the beacon enables

> **As-designed, not as-shipped.** This tree is built on `audio_decoding`, which is
> always `false` on current iOS (see the amendment at the top). The shipped tree —
> keyed on `has_audio_track` + `audio_track_source` — is in
> [`src/ads/README.md`](../src/ads/README.md); `unmute_blocked` shipped as
> `ad_blocked_reason`.

| Snapshot                                                                                                        | Conclusion                                                                             |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `element_muted=false`, `element_volume>0`, `audio_decoding=true`, `time_advancing=true`, `unmute_blocked=false` | **Native audio-session silencing** → escalate to Infolinks (`.playback`). Not our bug. |
| `unmute_blocked=true` / `element_muted=true` / `element_volume=0`                                               | Autoplay-policy gate (their `mediaTypesRequiringUserActionForPlayback`).               |
| `audio_decoding=false` / `audio_decoded_bytes=0`                                                                | No audio track or decode failure → creative/encoding bug (ours).                       |

~~`webkitAudioDecodedByteCount` climbing while `muted=false, volume>0` is the one JS-observable proof
that WebKit is decoding audio and handing it to the OS — so any remaining silence is below the web
layer.~~ **Disproved on-device: the property does not exist on current iOS**, so there is no proof of
decoding available at all — `has_audio_track` + `time_advancing` is the weaker claim we actually ship.
(A Web Audio `AnalyserNode` cannot substitute: it measures the graph, not OS output.)

## Implementation

### 0. Branch + commit the plan

Currently on `release/genuin-sdk/2.0.6` — branch before touching anything:

```
git checkout -b feature/cxr-audio-diagnostic-beacon
```

The plan file itself lives outside the repo (`~/.claude/plans/…`), so "commit the plan" means copying it
into the package as `packages/contextual-reels/AUDIO_DIAGNOSTIC_PLAN.md` and committing it together with
the already-untracked `AUDIO_DIAGNOSTIC_TASK.md` (they belong together — task doc + the plan that
supersedes parts of it). One docs commit, before any source change, so the reasoning is reviewable
separately from the implementation.

### 1. Event vocab — two mechanical steps, both required

`src/analytics/analytics.ts` — append to the `EVENT` map (`:22-76`). These strings are a **partner
contract**; append, never rename or reorder:

```ts
AUDIO_DIAGNOSTIC: "Audio Diagnostic",
```

Then update the **locked inline snapshot** at
[analytics.test.ts:20-79](../src/analytics/analytics.test.ts#L20-L79) — it lists
every entry **alphabetically**, so `"AUDIO_DIAGNOSTIC": "Audio Diagnostic"` goes between
`AD_STARTED` and `BATCH_COMPLETED`. Skipping this fails `pnpm test`.

### 2. Snapshot helper (new file + colocated test)

`src/ads/audioDiagnostic.ts` — keep sampling out of the component so it is unit-testable. Note
`ads/` is in the **100%-per-file coverage** set, so a new source file without a test fails the gate.

```ts
/** WebKit-only decoded-audio counter; absent on other engines. */
type WebkitMedia = HTMLMediaElement & { webkitAudioDecodedByteCount?: number };

export interface AudioDiagnosticSnapshot {
  /* fields below */
}

/** Samples a media element twice, `delayMs` apart, and resolves the deltas. */
export function sampleAudioDiagnostic(
  el: HTMLMediaElement,
  extra: Record<string, unknown>,
  delayMs = 800
): Promise<AudioDiagnosticSnapshot>;
```

> **Planned signature and field list — the shipped one differs.** `sampleAudioDiagnostic`
> ships as `(root: HTMLMediaElement | ParentNode, extra, delayMs?) => Promise<… | null>`
> (it accepts the slot and picks the right element via `findAudioElement`, and resolves
> `null` rather than throwing into a publisher page). The shipped payload also adds
> `audio_track_source`, `element_src`, `media_element_count`, `time_advanced_ms`,
> `duration_ms`, `buffered_ahead_s`, `network_state`, `audio_session_type`, the
> `ad_blocked_*` set and `forced_fill`. Read the interface in
> [`src/ads/audioDiagnostic.ts`](../src/ads/audioDiagnostic.ts) — every field is
> documented there.

Fields: `is_webview` (reuse `isWebView()` from
[device.ts:98](../src/platform/device.ts#L98) — this would be its first
analytics consumer), `element_muted`, `element_volume`, `paused`, `ready_state`,
`audio_decoded_bytes`, `audio_decoding` (delta > 0), `time_advancing` (`currentTime` delta > 0),
`has_audio_track` (~~`webkitAudioDecodedByteCount !== undefined`~~ — **shipped as
`audioTracks.length > 0`**, since the byte counter is absent on current iOS; an empty list is only
trusted once `readyState >= HAVE_METADATA`, else it reports `audio_track_source:
"awaitingMetadata"` so a slow network cannot masquerade as a silent creative),
`wants_audible_ad_start`,
`configured_volume` (the resolved `initialVolume` — the publisher interpolates `GIV` per impression
server-side in `infolinks_webview.html:100`, so the field value is not always 0.2), and
`audiocontext_state` (only if an `AudioContext` already exists — **never construct one**; side
effects on iOS).

Do **not** re-send `volume`, `is_muted`, `os_type`, `user_agent`, `geoip`, `tag_id` — the analytics
base context and `device_details` already carry them.

For the untyped WebKit prop, follow the package's dominant local-cast idiom (as at
`playerEvents.ts:320`) rather than adding a global augmentation.

### 3. Emit on the ad audible-start path

`src/ads/genAdSdk.ts` — in the existing `onWaterfallSuccess` callback (`:442-459`), guarded on
`wantsAudibleAdStart` so ordinary tags emit nothing:

```ts
// GenAd renders a real <video> into our container (no iframe), so the element is
// reachable. The 320x50 audio-ad path uses a display:none <video> — match on
// "video, audio" and never filter on visibility or size.
const media = containerRef?.current?.querySelector<HTMLMediaElement>("video, audio");
if (wantsAudibleAdStart && media) {
  void sampleAudioDiagnostic(media, {
    wants_audible_ad_start: true,
    configured_volume: initialVolume,
    ad_blocked_reason: adBlockedReasonRef.current ?? null,
  }).then((snapshot) => {
    if (cancelled) return; // never emit from a torn-down slot
    sendEvent(EVENT.AUDIO_DIAGNOSTIC, snapshot);
  });
}
```

One beacon per fill. Reuse the existing `cancelled` flag and `sendEvent` already in scope (`:279`).

### 3b. Capture GenAd's `onAdBlocked` (new callback subscription)

GenAd already fires `onAdBlocked("unmuted_autoplay_restricted")` on both autoplay-block paths and CXR
currently ignores it. Add it to the `initOptions` alongside the existing callbacks and store it in an
`adBlockedReasonRef` for the beacon payload above. Declare it on `GenAdInitOptions` in
`src/types/window.d.ts:12-31` (that file is coverage-excluded, so it costs nothing).

This is instrumentation-only: do **not** change mute/volume behaviour in response to it —
`unmute_blocked` already handles the state side.

### 4. Tests

- `src/ads/audioDiagnostic.test.ts` — new. Fake timers; assert `audio_decoding`/`time_advancing`
  true and false cases, and the absent-`webkitAudioDecodedByteCount` (non-WebKit) case.
- `src/ads/genAdSdk.test.tsx` — extend beside the existing audible-start tests (`:1666-1735`), reusing
  the mutable-box mocks already there: `strategyMock.value = { initialVolume: 0.5 }`, `sendEventMock`,
  `lastInitOptions`. Assert events by **literal string** (`"Audio Diagnostic"`) — the suite's
  intentional double-entry check on the vocabulary.
- Assert a non-audible tag (`initialVolume: 0`) emits **no** `AUDIO_DIAGNOSTIC`.
- Cover the `display:none` audio-ad element (the affected tag's shape) so a future "skip hidden
  elements" optimisation can't silently break the selector.
- Drive `onAdBlocked` from `lastInitOptions` (same pattern the existing `onVolumeChange` test uses at
  `:1700-1708`) and assert `ad_blocked_reason` lands on the payload.

### Constraints

- Instrumentation only — no change to playback, mute, volume, or ad-request behaviour.
- No `console.log` (package-local `no-console`); use `src/utils/logger.ts` if needed.

## Verification

> **On-device verification (added 2026-07-27).** Real-device testing was blocked by fill, not by the
> beacon: Infolinks device-targets our two handsets so the unit always renders, but Triton fills only
> intermittently, so most loads passback and the audible path never runs. Those two devices are now
> served a **static VAST feed** that always fills —
> [STRATEGIES.md → Debug-device feeds](STRATEGIES.md#debug-device-feeds-temporary-diagnostic).
>
> Those impressions are **synthetic** and carry `forced_fill: true`. Exclude them from every rate in
> [Reading the field data](#reading-the-field-data-the-actual-deliverable) below — the handsets are
> device-targeted and load far more than ordinary traffic, so leaving them in biases the numerator of
> the figure quoted to Infolinks.

1. `pnpm test --filter @genuin/contextual-reels` and `pnpm typecheck` — the `analytics/` and `ads/`
   100%-per-file coverage gates must stay green.
2. `pnpm build` in `packages/contextual-reels`, then serve `dist/` over the LAN.
3. In the iOS harness, point the prod `scriptURL` at the LAN dev server (the commented
   `http://192.168.1.7:3002/dist/gen_ext.min.js`, `AdConfig.swift:20`) and set the prod tagId to
   `6a39163e92929ebec64d78ab` (commented at `AdConfig.swift:39`). The harness markup passes **no
   `GIV`**, so `initialVolume` comes from strategy config (0.2).
4. Read the beacon in the in-app log panel: the injected shim forwards `console.*` and already logs
   `media detected/play/volumechange` with `muted`/`volume`/`paused` (`WebView.swift:130-157`).
   Either log the snapshot via the logger temporarily, or enable "Log request/response bodies" to see
   the Rudderstack POST payload.
5. **Prove both branches of the decision tree** with the `AudioSessionConsole` toggle
   (`ContentView.swift:115-141`), silent switch ON:
   - `.playback` → audio audible; beacon shows `audio_decoding=true`, `time_advancing=true`.
   - `.ambient` → silent, yet the beacon must still show `element_muted=false`,
     `element_volume≈0.2`, `audio_decoding=true` — i.e. it correctly localizes the fault to native.
     That second case is the exact field symptom; reproducing it is the acceptance test.
6. Confirm `is_webview=true` and `element_volume≈0.2` in a WKWebView UA.

### iOS research findings — one of these overturns the original premise

Scope for all of the below: **ad-only config, `tritondigital`/`infy` audio ads, 320x50.**

**1. WKWebView has always ignored the host app's `AVAudioSession` category — and the ring/silent
switch.** [WebKit bug 167788](https://bugs.webkit.org/show_bug.cgi?id=167788) — open since Feb 2017,
still **NEW/unassigned as of Feb 2025**, with comments through 2025 confirming it persists. UIWebView
respected the category; WKWebView does not.

This explains our harness result that I could not account for: `.ambient` + silent switch ON still
played audio, twice. **That was not a harness bug — it is documented WebKit behaviour.** It also
weakens the original hypothesis: if WKWebView ignores the host's category, then "Infolinks set
`.ambient`" is a _less_ likely explanation for the field report than we assumed, and simply telling
them to set `.playback` may not fix anything. The beacon's job is now genuinely open-ended: find out
what the field data actually shows rather than confirming a presumed cause.

**2. `navigator.audioSession.type` is readable (WebKit-only, default-on since Safari 17)** —
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession/type),
[WebKit commit](https://github.com/WebKit/WebKit/commit/c39358705b79ccf2da3b76a8be6334e7e3dfcfa6).
Values: `auto` (default) | `playback` | `ambient` | `transient` | `transient-solo` | `play-and-record`.
Reading has no documented side effects; we never assign it (that would change routing for a live ad).
**`AudioSession.state`** — which would expose interruption — is gated behind
`DOMAudioSessionFullEnabled`, **off by default**, so it is `undefined` in the field. Don't build on it.

**3. `navigator.userActivation` is in WebKit (Safari 17+)** —
[WebKit blog](https://webkit.org/blog/13862/the-user-activation-api/). `hasBeenActive` (sticky) and
`isActive` (transient). Activation-triggering events: `keydown`, `mousedown`, `pointerdown` (mouse),
`pointerup` (non-mouse), `touchend`. This is what addresses the reported "unit didn't autoplay until I
interacted" case: it separates _audio absent with no gesture ever_ from _audio absent even after a
tap_. Caveat worth keeping: the API is specified for gating intrusive APIs, **not** as an autoplay-policy
oracle — it tells us whether a gesture happened, not whether autoplay would be permitted.

**4. `AudioContext` has a non-standard WebKit `"interrupted"` state** (screen lock, phone call) beyond
the spec's `running`/`suspended`/`closed`. We read `.state` **only if a context already exists** and
never construct one — constructing an `AudioContext` on iOS can claim the audio session and interrupt
the ad's own playback. Not worth the risk for a diagnostic. Related:
[bug 237878](https://bugs.webkit.org/show_bug.cgi?id=237878) (suspended when backgrounded).

**5. Ruled out, so we don't waste the deploy:** `webkitAudioDecodedByteCount` and `webkitHasAudio`
(absent on iOS 18.7, confirmed on-device); `navigator.getAutoplayPolicy()` (not in WebKit);
`AudioSession.state`/`onstatechange` (flag-gated off).

> **Strengthened 2026-07-27 — [API coverage audit](AUDIO_DIAGNOSTIC_API_COVERAGE.md).** Two of these
> exclusions are broader than written. `getAutoplayPolicy()` is absent from **Chromium too** (not just
> WebKit) — it does not appear in Blink's `navigator.idl`, so it is unavailable on our Android traffic
> as well; Firefox 112 is the only implementation. And `AudioSession.state` isn't merely flag-gated —
> MDN's compat data has no `state` entry at all. Also checked and rejected there:
> `navigator.userAgentData` (absent in Android WebView, and broken by any host app that calls
> `setUserAgentString()`). Consequence: the `NotAllowedError` trace we already capture is the
> **canonical** autoplay-block signal on both platforms, not a fallback for a better API.

> **Reinforced 2026-07-27 — Chromium source.** An independent web pass reached the same
> `getAutoplayPolicy` conclusion and adds three source-level facts worth recording, because each closes
> a workaround that looks viable from the docs alone:
>
> - **Android WebView uses `kUserGestureRequired`, not desktop Chrome's `kDocumentUserActivationRequired`.**
>   `AwSettings.java` defaults `mMediaPlaybackRequiresUserGesture = true`, and `aw_settings.cc` maps it
>   straight to `blink::mojom::AutoplayPolicy`. Consequence: the gesture must be **on the element** — a
>   tap elsewhere in the document does not unlock audible playback the way it does on desktop. Stricter
>   than the general "needs a gesture" framing.
> - **Web Audio is not an escape hatch.** `AudioContext::AreAutoplayRequirementsFulfilled` calls the
>   _same_ `AutoplayPolicy::GetAutoplayPolicyForDocument` the `<video>` path uses — one switch feeds
>   both. (Independent of the separate reason we already exclude it: constructing a context can claim
>   the iOS audio session.)
> - **MEI is compiled off on mobile.** `kMediaEngagementBypassAutoplayPolicies` is
>   `FEATURE_DISABLED_BY_DEFAULT` on Android and iOS, and its Blink consumer additionally requires
>   `IsOutermostMainFrame()`. This is the mechanism behind the known "audible on localhost, silent in
>   the field" trap — desktop verification of audible autoplay is not evidence about WebView behaviour.

### Deployment shape: temporary, unmerged, rolled back

This ships as a **deploy of the feature branch, not a merge** — collect a window of field data, then
roll production back to the previous version. Consequences worth holding onto:

- **One shot at the payload.** There is no follow-up build to add a missing field, which is why the
  beacon carries the quantified playback fields and `audio_track_source` / `element_src` rather than
  the minimum needed for the decision tree.
- **Note the `build_id`** on the events (`<coreHash>.<gitSha>`) before rolling back — it is how these
  events stay attributable to this exact build once production no longer serves it.
- **The data outlives the deploy.** Capture the segment counts while the build is live; after rollback
  no new `Audio Diagnostic` events arrive, so anything not queried is gone until a re-deploy.

### Reading the field data (the actual deliverable)

Once live, segment `AUDIO_DIAGNOSTIC` on `tag_id = 6a39163e92929ebec64d78ab` and split by
`is_webview` — the base context already supplies `os_type`, `user_agent`, and `geoip` for free. The
conclusive segment is:

> **Amended after on-device testing.** The original criteria below used
> `audio_decoding` / `element_volume`. Both are unusable on current iOS:
> `webkitAudioDecodedByteCount` **does not exist** (verified via Safari Web Inspector —
> `typeof` is `"undefined"`), so `audio_decoding` is always `false`; and iOS ignores
> programmatic volume writes entirely, so `element_volume` is always `1` regardless of the
> configured level. The criteria now rest on `has_audio_track` (from `audioTracks`, which
> **is** populated on iOS) plus `element_muted` and `time_advancing`.

```
is_webview = true AND element_muted = false AND has_audio_track = true
  AND time_advancing = true AND unmute_blocked = false
  AND forced_fill != true          -- exclude synthetic debug-handset fills
```

Every impression in that bucket has a real audio track, is unmuted, and is progressing while the user
hears nothing — i.e. **native silencing owned by Infolinks**. Report it as a _share of audible-start
impressions in their webview_, not a raw count: a rate is what makes the escalation unarguable, and it
also tells you whether their fleet is uniformly misconfigured or only some app versions are.

**Three independent views of volume land on every event** — the gaps between them are diagnostic:

| Field                 | Source                                  | Means                                            |
| --------------------- | --------------------------------------- | ------------------------------------------------ |
| `volume` / `is_muted` | analytics base context (PlayerProvider) | what the CXR **app** believes                    |
| `configured_volume`   | strategy / `GIV`                        | what was **intended**                            |
| `element_volume`      | the DOM element                         | what the element **reports** (always `1` on iOS) |

All three agreeing on "audible" while the user hears nothing is the native case. `volume: 0` /
`is_muted: true` instead means the app muted itself — a different (and ours-to-fix) problem.

**Quantified playback**, so "audio ran" is measured rather than inferred from a boolean:
`time_advanced_ms` (~800 = real-time, small = limping, 0 = stalled), `current_time_ms`,
`duration_ms`, `buffered_ahead_s`, `network_state`. A healthy buffer while unpaused rules out a
network/decode stall, which is what separates "silenced downstream" from "never really played".

**Honest limit of the amended claim:** without the byte counter we can prove a track exists and
playback is progressing, but **not** that audio is actively being decoded. That is a slightly weaker
proof than originally planned. It is still strong enough to place the fault outside the web layer,
especially paired with the harness reproduction (`.playback` audible vs `.ambient` silent, identical
beacon values) — but don't overstate it as "we measured bytes reaching the OS".

Watch the other two buckets as genuine falsifiers, not formalities — the beacon is only worth shipping
if it can come back against us:

- `unmute_blocked = true` (or `element_muted = true`) → their autoplay policy
  (`mediaTypesRequiringUserActionForPlayback`), a different ask of Infolinks.
- `has_audio_track = false` **with `audio_track_source = "audioTracks"`** → **ours**: the creative
  genuinely has no audio track. Note the qualifier: with
  `audio_track_source = "unknown"` the same `false` means only that no signal was available, which is
  evidence of nothing. Conflating those two is exactly the mistake that cost several debugging rounds.
- `audio_decoding` / `audio_decoded_bytes` → **ignore on iOS.** Retained only for WebKit builds that
  still expose the counter; on current iOS they are always `false` / `null` and mean nothing.

Since the advertiser requires audible playback, the "creative has no audio" bucket is the one to check
first — it changes what _we_ do rather than what we ask Infolinks to do.

Sanity gate before quoting any of it: confirm `is_webview = true` is actually populating (this is
`isWebView()`'s first analytics consumer), `has_audio_track = true` with
`audio_track_source = "audioTracks"` (if the source is `"unknown"` the diagnostic is inconclusive and
needs rethinking), and `element_src` points at the expected audio media URL — that last field is what
proves we sampled the ad's transport and not a decorative or placeholder element. Note
`configured_volume` reads 0.2 while `element_volume` reads 1 on iOS; that gap is expected (iOS ignores
programmatic volume) and is **not** a sign the level failed to apply. If `configured_volume` itself
reads anything other than 0.2, the publisher's `GIV` is in play and the volume premise needs revisiting
before interpreting anything else.

### Harness caveats (do not chase as product bugs)

- Prod loads the document on an **insecure `http://begenuin.com` origin** (`AdConfig.swift:31`) →
  `isSecureContext === false`, so `crypto.randomUUID` is absent. CXR already handles this
  (`generateUuid` fallback, `FeedProvider.tsx:109`) — a harness artifact, not a defect.
- `websiteDataStore = .nonPersistent()` (`WebView.swift:43`) — every run looks like a first run.
- The audio session is applied only on the **home** screen, never re-applied on the banner screen, with
  no interruption/route observers — a session change mid-test would go unnoticed.
- The `.ambient` branch passes no `mode`, so `mode` stays `.moviePlayback` after a prior `.playback`
  call — toggling back and forth is slightly sticky.
- WebKit-internal loads (`<script src>`, HLS segments) are invisible to the shim; only fetch/XHR and
  navigations are captured.

## Delivery-layer alternatives — SIMID, MRAID, OpenRTB, OMID (all rejected, 2026-07-27)

[AUDIO_DIAGNOSTIC_API_COVERAGE.md](AUDIO_DIAGNOSTIC_API_COVERAGE.md) answers _"does the beacon read
every API?"_ (yes). This section answers a **different** question that came up separately: _is there a
**protocol or delivery standard** — rather than a browser API — that would let us start audible, or let
us buy only inventory where audible autoplay works?_

**Verdict: no, on all four candidates.** The negative is worth writing down because each one sounds
plausible, and because two of them (SIMID, OpenRTB filtering) are the natural next suggestions from
anyone who reads the findings log and asks "so what do we actually do?"

### SIMID — needs a player we don't have, and doesn't address autoplay anyway

Two independent disqualifiers; the first is fatal on its own.

1. **No counterparty exists.** SIMID is strictly a cross-origin iframe ↔ **player** postMessage
   protocol. Its load sequence requires a SIMID-compliant player to create the iframe, listen for
   `message`, and own the media element. Our delivery is an IAB banner in a bare WebView: verified —
   `src/infolinks_webview.html` loads `gen_ext.min.js` via a plain `<script src>` with no player SDK
   and **no MRAID bridge**. Our banner _is_ the thing owning the hidden `<video>`, which inverts what
   SIMID assumes. SIMID's VAST hooks are also `<InteractiveCreativeFile>` / `<NonLinear>` — display
   banners don't use VAST at all.
2. **It doesn't model autoplay policy.** Grepping the v1.1.0 spec source for
   `autoplay|user gesture|user activation|NotAllowedError` returns **one** non-normative hit, merely
   acknowledging autoplay may happen. The audio surface is three messages
   (`Creative:requestChangeVolume`, `Media:volumechange`, `Player:init` state) and the spec states
   outright: _"SIMID does not expect device audio state information."_ Every `Creative:request*` has a
   defined `reject` branch — a SIMID player inside Audiomack's WebView would hit the same
   `NotAllowedError` and be obliged to reject.

Correction to an earlier claim in discussion: SIMID **does** support audio ads (spec abstract says
"video and audio"). That doesn't rescue it — the missing player is decisive.

### MRAID `audioVolumeChange` — right idea, not present in this delivery path

MRAID 3.0 §7.6 defines exactly the signal we'd want: `volumePercentage` (0.0–100.0), where **`0.0`
explicitly means "playback is not allowed"**, reporting device volume gated by app audio focus, sent
immediately on listener registration.

**But it is unavailable here.** `grep -ri mraid` returns **zero** hits across CXR `src/`, GenAd
`gen_ad.js`, the iOS harness, and `infolinks_webview.html`. MRAID requires the ad container to inject
`mraid.js`; nothing in this path does. Treating it as reachable would repeat the trap the findings log
records — inventing a mechanism before settling whether the field exists.

Also worth noting even if a bridge appeared: the spec says the event reflects volume _outside_ the
ad's control, so it would report "device/app is silent" but **not** an engine-level force-mute. It
would complement `element_muted`, never replace it.

### OpenRTB — the supply-side filter cannot be expressed for display

This was the most promising angle (buy only audible-capable inventory) and it fails structurally,
verified field-by-field across OpenRTB 2.5 §3.2.6/§3.2.8, 2.6, and AdCOM 1.0:

| Object   | Audibility / playback signal                                                       |
| -------- | ---------------------------------------------------------------------------------- |
| `Video`  | `playbackmethod` exists (`1` = load with sound on, `2`/`6` = sound off by default) |
| `Audio`  | **No `playbackmethod`.** Only `feed`, `stitched`, `nvol` (loudness normalization)  |
| `Banner` | **No audio or playback field at all**                                              |

We transact as a **banner**. There is no conformant field for an SSP to declare audible-autoplay
capability and none for us to filter on — it would require a bilateral `imp.ext` extension. And
`playbackmethod` encodes publisher _intent_, predating the autoplay policies; it would misreport
Audiomack even if it existed on `Banner`.

### OMID — measurement only, and `deviceVolume` isn't on the web path

OMID's `volumeChange`/`start` carry `deviceVolume` (0–1), _"[o]nly provided for mobile app
environments"_. But it is a **video-only event**, and the JS/web integration passes player volume
only — `deviceVolume` does not appear in OM SDK for Web. Getting it needs a **native** OMID session the
host app owns, which we don't control. Reporting value at best; fixes nothing.

### The one real precedent — and it is a commercial lever, not a technical one

Google Ad Manager requires audio tags to set **`vpmute=0`**, and publisher policy states _"audio ads
must not be requested or served in muted placements"_, with publishers required to declare
_"Audibility of ad placement: Audible … by default or muted."_

**The industry's answer to our exact problem is: don't serve audio into placements that can't be
audible.** Since no OpenRTB field carries that signal for display, the beacon is the only instrument
that can build the equivalent — an empirical **bundle-level allowlist**. That converts this from an
engineering problem into a targeting negotiation with Infolinks, and it is the strongest available
follow-on to the Audiomack finding.

### Uncomfortable finding: the requirement conflicts with IAB guidance

The IAB New Ad Portfolio Ad Experience Guide permits an unmuted start only when **the device sound is
on AND the placement has 100% share of screen**, and explicitly requires a muted start for _"[a]ds
placed in mobile browsers or mobile device apps when other content is also present on screen."_ Its
non-permitted list names _"Auto Play Video with Audio — Not Allowed."_

An inline 320×50 banner in a host-app feed is precisely that case. So the contractual audible-start is
**contrary to IAB creative guidance**, and browser autoplay policy is the enforcement of that
consensus rather than an obstacle to route around.

This does **not** change the standing rule that we never unilaterally mute this tag
([audible autoplay is an advertiser requirement](../src/strategies/strategyConfig.ts)) — but it
reframes the contract conversation from _"we couldn't make it work"_ to _"the requirement is outside
what this placement class permits."_ The two standards-sanctioned alternatives are a full-screen /
interstitial placement (the single carve-out) or tap-to-play.

One caveat against over-claiming: MRC's _Audible Ad Impression_ excludes ads served in a player-muted
state, and our blocked impressions are force-muted at the element — so they fail that test. A
measurement-standards defence does not rescue the muted population.

### What this closes

Treat **delivery-layer alternatives as closed** alongside the API question. No protocol change (SIMID,
MRAID, VPAID, DAAST/VAST audio mode) alters browser autoplay policy, because the gate sits below all of
them: `<video>`, `<audio>`, and `AudioContext` all route through the same
`AutoplayPolicy::GetAutoplayPolicyForDocument` in Blink, and user activation requires `isTrusted: true`
so it cannot be manufactured. Permissions-Policy `allow="autoplay"` cannot help either — delegation is
strictly attenuating (W3C §9.7 checks the parent's inherited policy and returns `Disabled` **before**
the `allow` attribute is consulted), so a parent cannot delegate what it lacks.

Reopen only if the placement class changes (interstitial), or if Infolinks adds a real MRAID container.

## Out of scope

Setting/reading `AVAudioSession`, detecting the ring/silent switch, or forcing output — impossible
from web content. The actual audibility fix is native and must be handed to Infolinks:

```swift
try AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback)
try AVAudioSession.sharedInstance().setActive(true)
```

Also out of scope for this pass: the reel `<video>` path (`usePlayerLifecycle`/`hlsPlayer`), the
tap-to-unmute path (`ClickOverlay`), and the 320x100 sibling tag `6a3915b692929ebec64d785e` (same
config — extend the beacon to it once the 320x50 data is read).

**No changes to the GenAd repo** (`/Users/kunalshah/genuin/html5 creative`) — see the analysis above.
If a later phase does need GenAd (e.g. reporting live element state from inside the SDK for providers
that wrap playback, like Aniview/IMA where we hold no element), that is a separate change requiring a
version bump, `API.md`/`README.md` doc-sync, and a CDN purge that hits all CXR traffic at once.
