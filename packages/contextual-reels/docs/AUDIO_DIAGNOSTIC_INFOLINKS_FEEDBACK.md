# Audio diagnostic — what to ask Infolinks for

Answers one question: **which WebView signals should Infolinks read, on iOS/Android, before loading our
unit?**

**Verdict: none — the question does not have the answer its framing implies.** There is no signal, on
either platform, that a host app can read to predict whether audible autoplay will work. Every
discriminating property is native configuration that Infolinks (or their publisher) _sets_ rather than
_observes_, and no browser API or ad protocol exposes it to either side. So the deliverable is not
"listen to X"; it is **"assert these four things before requesting our tag, and stop serving this tag
into placements that cannot honour them."**

- **What the field data established**: [AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md)
- **Why no browser API can answer it**: [AUDIO_DIAGNOSTIC_API_COVERAGE.md](AUDIO_DIAGNOSTIC_API_COVERAGE.md)
- **Why no protocol can either**: [AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md#delivery-layer-alternatives--simid-mraid-openrtb-omid-all-rejected-2026-07-27)
- **Tag under investigation**: `6a39163e92929ebec64d78ab` (320×50, Triton/`infy` audio, `initialVolume: 0.2`)

> **This doc is the outbound-facing synthesis.** It adds no new evidence — every claim traces to one of
> the three docs above. If a number here disagrees with those, they win. Read
> [Before this leaves the building](#before-this-leaves-the-building) before sending any of it to
> Infolinks: two headline figures are **not yet cleared for external use**.

---

## Why "which signal should they read" has no answer

Three independent closures, each verified in a sibling doc. They matter because "just have them check
the autoplay policy first" is the natural first suggestion, and it is unavailable.

| Candidate signal                                                                                   | Status                                                                                                                                                       | Source                                                                                                                     |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `navigator.getAutoplayPolicy()`                                                                    | Absent from **Chromium too**, not just WebKit — not in Blink's `navigator.idl`. Firefox 112 is the only implementation.                                      | [API coverage §1](AUDIO_DIAGNOSTIC_API_COVERAGE.md#1-navigatorgetautoplaypolicy--not-implemented-in-any-engine-we-ship-to) |
| `navigator.audioSession.type`                                                                      | Implemented (Safari 16.4+) but reports only whether **we** set a session type — never the host's `AVAudioSession` category. Read `auto` on 132/135 iOS rows. | [API coverage correction 1](AUDIO_DIAGNOSTIC_API_COVERAGE.md#1-audio_session_type-is-not-a-native-silencing-detector)      |
| `AVAudioSession` category, ring/silent switch, output route, system volume, Android `AudioManager` | No JS surface at all. If any were readable the beacon would have been unnecessary.                                                                           | [API coverage — correctly excluded](AUDIO_DIAGNOSTIC_API_COVERAGE.md#correctly-excluded--do-not-add-these)                 |

And the gate sits **below every protocol**, so no delivery-layer change routes around it: `<video>`,
`<audio>`, and `AudioContext` all resolve through the same
`AutoplayPolicy::GetAutoplayPolicyForDocument` in Blink, and user activation requires `isTrusted: true`
so it cannot be manufactured. Permissions-Policy `allow="autoplay"` cannot help either — delegation is
strictly attenuating, so a parent cannot delegate what it lacks.

**Consequence for the escalation:** we cannot ask them to detect the problem. We can only ask them to
not create it, and to stop selling us placements where it exists.

---

## The five asks, in priority order

Ordered by strength of evidence and by leverage. ① is the primary ask; the macro request that looks
like the obvious answer is deliberately **fourth** — see [why it moved](#why-the-macro-request-is-ranked-fourth).

### ① Placement-level audibility targeting — the primary ask

**Ask:** a **bundle-level allowlist** of apps whose WebViews permit gesture-free unmuted playback, and
agreement to stop serving this audio tag outside it. We can supply the initial list; the beacon is the
instrument that produces it.

**Why this and not a technical fix:** this is already the industry's answer to this exact problem.
Google Ad Manager requires audio tags to set `vpmute=0`, its publisher policy states _"audio ads must
not be requested or served in muted placements,"_ and it requires publishers to declare _"Audibility of
ad placement: Audible … by default or muted."_ Framing the ask in GAM's language makes it an existing
norm rather than a Genuin-specific demand.

Since no OpenRTB field carries that signal for display (see ④), an empirical allowlist is the only way
to build the equivalent. **This converts the problem from engineering to targeting negotiation** — which
is the strongest available follow-on to the Audiomack finding.

Starting evidence, from [the findings log](AUDIO_DIAGNOSTIC_FINDINGS.md#app-vs-ssp--2026-07-2427-20-events-per-cell):

| Bundle                | Verdict     | Evidence                                                                            |
| --------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `com.audiomack`       | **Exclude** | ~95% muted; agrees across two independent SSPs (pubnative 94.9%, inneractive 95.7%) |
| `wp.wattpad` (adform) | **Include** | 31 events, **0% muted**, 29 genuine no-gesture autoplays                            |

That second row is load-bearing in the conversation: it proves the permissive configuration is
**achievable inside their own supply**, so this is not a request for something no integration does.

### ② Android — WebView gesture flag

**Ask:** on the WebView instance that renders our creative,

```java
webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
```

**Evidence (the strongest half of the investigation).** `ad_blocked_error_name = NotAllowedError`,
message _"play() can only be initiated by a user gesture,"_ with `user_has_activated = false` on every
blocked row. `com.audiomack` ~95% muted vs ~8.9% across all other Android apps combined.

**Two points to include, because they close the obvious pushbacks:**

- **"Users tap in our app anyway" does not help.** Android WebView uses `kUserGestureRequired`, not
  desktop Chrome's `kDocumentUserActivationRequired` (`AwSettings.java` defaults
  `mMediaPlaybackRequiresUserGesture = true`; `aw_settings.cc` maps it straight to
  `blink::mojom::AutoplayPolicy`). The gesture must be **on the element** — a tap elsewhere in the
  document does not unlock audible playback.
- **There is no engagement-based bypass to wait for.** MEI is compiled off on mobile
  (`kMediaEngagementBypassAutoplayPolicies` is `FEATURE_DISABLED_BY_DEFAULT` on Android and iOS). This
  is also why desktop/localhost verification proves nothing about WebView behaviour.

**Scope note:** the divergence is per-app, not per-SSP (Audiomack agrees across SSPs; pubmatic diverges
across apps 6.3% / 13.0% / 30.3%). So this is an SDK-integration-level flag some of their publishers
set and others don't — an addressable integration checklist item, not a platform limitation.

### ③ iOS — WebView + audio-session configuration

**Ask:** confirm, on the WKWebView hosting our creative,

```swift
config.allowsInlineMediaPlayback = true
config.mediaTypesRequiringUserActionForPlayback = []   // iOS analogue of the Android flag
```

and, as a variable-removal measure rather than a diagnosis,

```swift
try AVAudioSession.sharedInstance().setCategory(.playback, mode: .moviePlayback)
try AVAudioSession.sharedInstance().setActive(true)
```

**State the epistemic position plainly — do not oversell this one.** On iOS we have the outcome, not the
mechanism:

- ~64% of real iOS impressions muted with GenAd self-reporting an autoplay block; the advertiser's
  audible-start requirement met on roughly **4%**.
- **The Android explanation does not transfer**: 85 of 122 events are muted while
  `user_has_activated = **true**`, so "the WebView never got a gesture" is not the iOS mechanism.
- `ad_blocked_error_name` is **absent on all 135 iOS rows** (no iOS traffic reached the build that
  emits it), so there is **no rejection evidence at all** on iOS.

The `AVAudioSession` line is belt-and-braces: [reversal 1](AUDIO_DIAGNOSTIC_FINDINGS.md#1-the-fault-is-native-ios-avaudiosession--disproved)
disproved the native-silencing premise as far as we could measure, and `audio_session_type` was never
capable of testing it. Asking for `.playback` costs them nothing and removes a variable; **claiming it
is the cause would be unsupported.**

### ④ A bilateral `imp.ext` audibility flag — worth asking, but custom

**Ask:** a request-time parameter asserting whether the rendering WebView permits gesture-free unmuted
playback (i.e. whether `setMediaPlaybackRequiresUserGesture(false)` /
`mediaTypesRequiringUserActionForPlayback = []` is set on that instance).

This is the only way to know **before** load. Without it we discover the block ~800 ms after fill,
which is too late to route away from it.

#### Why the macro request is ranked fourth

Because there is **nowhere standard to put it**. Verified field-by-field across OpenRTB 2.5
§3.2.6/§3.2.8, 2.6, and AdCOM 1.0:

| Object   | Audibility / playback signal                                                       |
| -------- | ---------------------------------------------------------------------------------- |
| `Video`  | `playbackmethod` exists (`1` = load with sound on, `2`/`6` = sound off by default) |
| `Audio`  | **No `playbackmethod`.** Only `feed`, `stitched`, `nvol`                           |
| `Banner` | **No audio or playback field at all**                                              |

**We transact as a banner.** So this is a bilateral `imp.ext` extension — a custom integration, not
"please populate a standard field." Describe it to them accurately as such, or the ask reads as
trivial when it is not.

Two adjacent facts worth carrying into the conversation:

- **`playbackmethod` would not fix it even if it existed on `Banner`** — it encodes publisher _intent_
  and predates the autoplay policies, so it would misreport Audiomack.
- **MRAID would give us this for free, if a bridge existed.** MRAID 3.0 §7.6 `audioVolumeChange`
  defines exactly the signal, where `0.0` explicitly means _"playback is not allowed."_ But
  `grep -ri mraid` returns **zero** hits across CXR `src/`, GenAd `gen_ad.js`, the iOS harness, and
  `infolinks_webview.html` — nothing in this path injects `mraid.js`. Worth flagging as a
  "if you ever add a real MRAID container, this becomes free."

### ⑤ If ①–④ are refused, the conversation moves to placement class

The two standards-sanctioned routes to an audible start are a **full-screen / interstitial** placement
(the single IAB carve-out) or **tap-to-play**. That is an advertiser and contract conversation, not an
engineering one — see the next section for why.

---

## Know this before you write to them

**The contractual requirement is contrary to IAB creative guidance.** The IAB New Ad Portfolio Ad
Experience Guide permits an unmuted start only when the device sound is on **and** the placement has
100% share of screen, and explicitly requires a muted start for _"[a]ds placed in mobile browsers or
mobile device apps when other content is also present on screen."_ Its non-permitted list names
_"Auto Play Video with Audio — Not Allowed."_

An inline 320×50 banner in a host-app feed is precisely that case. So **browser autoplay policy is the
enforcement of an industry consensus, not an obstacle to route around.**

Two consequences for tone and for scope:

- **Do not lead with "your WebView is misconfigured" as though we are on the standards' side.** Ask ②
  and ③ are legitimate — the permissive configuration is common and achievable — but the placement
  itself is outside what this creative class is supposed to permit. The honest frame is _"the
  requirement is outside what this placement class permits,"_ not _"we couldn't make it work."_
- **This does not change our standing rule.** We never unilaterally mute this tag — the audible start
  is a hard advertiser requirement ([`strategyConfig.ts`](../src/strategies/strategyConfig.ts),
  `initialVolume: 0.2`), `GIV=0` is deliberately ignored (the override may raise, never suppress), and
  a browser autoplay block is something we _report_, never something we design away.

**No measurement-standards defence rescues the muted population.** MRC's _Audible Ad Impression_
excludes ads served in a player-muted state, and our blocked impressions are force-muted at the
element — so they fail that test. Muted impressions are still being counted while the advertiser's
audible-start requirement is contractual; **that is the commercial stake** and the lever for getting
the config change prioritised.

**What is not in dispute, and is worth saying early:** the creative is never at fault
(`has_audio_track = true` on **100%** of ~40k rows), and our SDK behaves correctly — GenAd detects the
block, mutes, and plays on, so the ad is delivered rather than lost. Establishing that first makes the
rest of the conversation about configuration instead of blame.

---

## Before this leaves the building

Two headline numbers are **not cleared for external use**, both flagged as open in
[the findings log](AUDIO_DIAGNOSTIC_FINDINGS.md#open-questions):

| Blocker                            | Why it matters                                                                                                                                                                                  | Fix                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Android rate is event-weighted** | Audiomack emits ~3.9 events/visit vs ~1.0 elsewhere, so its 33,975 events are ~8,700 impressions. The 92.3% figure **overstates the problem** and the visit-weighted number will move it a lot. | One-line change (`uniqExact(visit_id)` in the ratio). **Do this before quoting any rate.**                       |
| **iOS sample may be incomplete**   | 135 events against Android's ~40k in the same window — thin enough that low iOS volume and partial warehouse data are indistinguishable.                                                        | Re-run the iOS pass; cross-check the total against a coarser `group by os_type` query and confirm the two agree. |

Safe to send now: the **mechanism** (`NotAllowedError` + `user_has_activated = false`), the
**per-app-not-per-SSP** structure, the `wp.wattpad` counter-example, and `has_audio_track = true` on
100% of rows. Hold the percentages.

Also note: production is **rolled back**, so no new `AUDIO_DIAGNOSTIC` events are arriving. Closing the
iOS mechanism gap (getting a rejection reason on iOS rather than self-report) needs a fresh deploy
window, not an edit.

---

## What this doc closes

Treat **"which signal should Infolinks read"** as answered: none exists, on either platform, at either
the API or the protocol layer. Reopen only if:

- Chromium ships `getAutoplayPolicy()` (issue [40073791](https://issues.chromium.org/issues/40073791), open, no timeline), **or**
- Infolinks adds a real MRAID container (making `audioVolumeChange` reachable), **or**
- the placement class changes to interstitial (which changes the IAB position too).
