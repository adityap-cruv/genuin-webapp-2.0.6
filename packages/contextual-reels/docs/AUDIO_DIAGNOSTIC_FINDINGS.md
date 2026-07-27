# Audio diagnostic — findings log

Running record of what the `AUDIO_DIAGNOSTIC` beacon has actually established, what it disproved, and
what is still open. Append as new data arrives.

- **Why this exists**: [AUDIO_DIAGNOSTIC_TASK.md](AUDIO_DIAGNOSTIC_TASK.md) (original report) →
  [AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md) (what was built)
- **How to query it**: [ANALYTICS_QUERYING.md](ANALYTICS_QUERYING.md)
- **Is the instrumentation complete?**
  [AUDIO_DIAGNOSTIC_API_COVERAGE.md](AUDIO_DIAGNOSTIC_API_COVERAGE.md) — yes, with citations; it also
  **corrects how `audio_session_type` should be read in reversal 1 below**
- **Tag under investigation**: `6a39163e92929ebec64d78ab` (320×50, Triton/`infy` audio, `initialVolume: 0.2`)

> **Read the [reversals](#reversals--conclusions-that-did-not-survive) section before acting on
> anything here.** Seven conclusions were overturned by later data. The ones that survived are marked
> **established**; everything else is provisional.

---

## Current state (2026-07-27)

**Android — root cause identified, no code fix available to us.**

`com.audiomack` mutes ~95% of impressions; every other Android app averages ~8.9%. The mechanism is
fully traced: Chrome refuses unmuted autoplay because the WebView never received a user gesture, and
GenAd's guard rail correctly mutes so the ad still plays. `ad_blocked_error_name` reads
`NotAllowedError` ("play() can only be initiated by a user gesture") and `user_has_activated` is
`false` on every blocked row.

This is app-side WebView configuration (`setMediaPlaybackRequiresUserGesture`), not our bug. Genuine
unmuted autoplay _does_ work elsewhere (`wp.wattpad` via adform: 0% muted, 29 autoplay events), so the
permissive configuration is achievable.

**iOS — first pass done; outcome measured, mechanism not.**

~64% of real iOS impressions are muted with GenAd self-reporting an autoplay block. The advertiser's
audible-autoplay requirement is met on roughly **4%**. But the **Android explanation does not
transfer**: 85 of 122 events are muted while `user_has_activated = true`, so "the WebView never got a
gesture" is not the iOS mechanism. And `ad_blocked_error_name` is **absent on every iOS row** — no iOS
traffic reached the build that emits it — so we have _no rejection evidence at all_ on iOS. Bucket B
by self-report, cause unmeasured. See [iOS snapshot](#ios-by-app--2026-07-2427-135-events) and
[Open questions](#open-questions).

**Sample caveat:** 135 iOS events total, and the warehouse is suspected of returning incomplete data
for this window (see the trap below). Directional only — do not quote externally.

**The advertiser's audible-start requirement is contractual** and is being violated on muted
impressions, which are still counted. That is the business stake.

---

## What is established

| Finding                                            | Evidence                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The creative is never at fault                     | `has_audio_track = true` on **100%** of ~40k rows. Bucket C eliminated.                                                                                                                                                                          |
| Muting is a genuine browser autoplay block         | `ad_blocked_error_name = NotAllowedError` on every new-build blocked row, message _"play() can only be initiated by a user gesture."_                                                                                                            |
| The block is caused by a missing user gesture      | `user_has_activated = false` correlates **perfectly** with the blocked outcome across all sampled rows; `true` correlates with audible.                                                                                                          |
| Cause is per-app, not per-SSP                      | Same app across two independent SSPs agrees (Audiomack: pubnative 94.9%, inneractive 95.7%); same SSP across apps diverges (pubmatic: 6.3% / 13.0% / 30.3%).                                                                                     |
| Audiomack is numerically the whole Android problem | `com.audiomack` ~95% muted vs ~8.9% for all other apps combined.                                                                                                                                                                                 |
| Unmuted autoplay is achievable                     | `wp.wattpad`/adform: 31 events, **0% muted**, 29 genuine autoplay-no-gesture.                                                                                                                                                                    |
| Our SDK behaves correctly                          | GenAd detects the block, mutes, and plays on — the ad is delivered rather than lost.                                                                                                                                                             |
| The repeat emission is Audiomack-specific          | ~3.9–4.1 events/visit on Audiomack vs ~1.02–1.17 everywhere else. **iOS confirms it: 135 events / 133 visits ≈ 1.0**, so event- and visit-weighted iOS rates coincide.                                                                           |
| The gesture mechanism is Android-only              | iOS: 85/122 events muted with `user_has_activated = **true**`. Consistent with WebKit gating on _transient_ activation + MEI, not sticky activation ([reversal 4](#4-genads-guard-rail-fires-on-non-autoplay-rejections-aborterror--disproved)). |
| iOS has no unexplained mute path                   | Only **2** of 87 muted iOS events have `unmute_blocked = false` (1.5%), vs 20.4% on Android `wp.wattpad`. Nearly all iOS muting is self-reported by GenAd.                                                                                       |

---

## Reversals — conclusions that did not survive

Kept deliberately. Each cost real time, and the pattern (small samples, plausible mechanisms,
premature generalisation) is the reusable lesson.

### 1. "The fault is native iOS `AVAudioSession`" — **disproved**

The original premise, and the reason the beacon was built. `audio_session_type` came back `"auto"` on
120/120 iOS visits — never `ambient`. The residual unexplained-by-our-own-muting population was **4
visits out of 1,760**.

Caveat that keeps this honest: `"auto"` on 100% of rows is also what an unimplemented API looks like
(WebKit bug 167788 — WKWebView has historically ignored the host's category). So this is _failure to
find evidence_ for native silencing, not proof of its absence.

> **Amended 2026-07-27 —
> [API coverage audit](AUDIO_DIAGNOSTIC_API_COVERAGE.md#1-audio_session_type-is-not-a-native-silencing-detector).**
> Sharper than both readings above. `navigator.audioSession` **is** implemented (Safari 16.4+), and
> `"auto"` is its documented default meaning "the UA chooses" — so `"auto"` most plausibly means
> **nobody set a session type**, i.e. the field reports that _we_ didn't set one. It was never capable
> of reporting the host app's `AVAudioSession` category, so this row is neither evidence for nor
> against native silencing. Read `audio_session_type` as "did CXR set a session type" only.

### 2. "The decoy content video is being sampled" — **disproved**

First device payload showed `has_audio_track: false` with `time_advancing: true`. Attributed to
first-match `querySelector` grabbing GenAd's decorative content video (created at `gen_ad.js:4144`,
before the real audio element at `:4354`). Shipped `findAudioElement()` scoring logic to fix it.

Next payload showed `media_element_count: 1` — there was nothing to choose between. The real cause was
that `webkitAudioDecodedByteCount` is **absent on current iOS**, so `has_audio_track` was reading a
missing property. Fixed properly by basing detection on `audioTracks`.

### 3. "This fill went down the IMA path" — **disproved by domain knowledge, not data**

Hypothesised that `provider: "video"` + `has_audio_track: false` meant IMA, whose element is
SDK-private and unreachable from the host. Wrong: **the 320×50 Triton/`infy` audio layout never uses
IMA** — it plays audio through a `<video>` element in our own container. `ad_blocked_source` is always
`audio_vast` on this tag by construction.

Consequence: the `ima_message_match` false-positive concern was structurally unreachable here.

### 4. "GenAd's guard rail fires on non-autoplay rejections (`AbortError`)" — **disproved**

The entire justification for a planned **release 2** narrowing `_autoplayAudio`. Reasoning: 87 of 120
iOS visits muted while `user_has_activated` was `true`, and a gesture is what unlocks unmuted
playback — so the block "couldn't" be real.

Field data after v1.24.0: **zero `AbortError`**, 100% `NotAllowedError`. The guard rail is correct.
**Release 2 cancelled.** Narrowing it would fix nothing and could turn muted-but-playing impressions
into no impression at all.

Where the reasoning failed: Chrome/WebKit autoplay policy uses Media Engagement Index and _transient_
activation, not merely "has ever been active" — so sticky activation being `true` does not imply
unmuted autoplay is permitted.

### 5. "The published CXR build doesn't contain the new fields" — **wrong, my error**

Fetched `gen_ext.min.js` (3,418 bytes) and `gen_ext-<hash>.js` (37 bytes), found zero matches, and
reported the deploy had failed. Both are **loader stubs**. The code splits four levels deep:

```
gen_ext.min.js → gen_ext-DidcsdpB.js → chunks/index-*.js → chunks/AdControlLayer-*.js
```

The beacon lives in the leaf chunk, which was live on the CDN the whole time. **Always follow the
chunk chain before declaring a deploy broken.**

### 6. "The SSP/demand path is the discriminator" — **disproved within one exchange of messages**

Within FreeCell, pubmatic showed 0.2% autoplay vs fmx 45.1%, and the same placement hash
(`e9ce905...`) appeared under two SSPs with opposite outcomes. Concluded the SSP's rendering wrapper
gated playback.

Artifact of measuring `autoplay_no_gesture` instead of `muted`. On a low-mute app, audible impressions
split between "autoplay" and "after gesture" depending on when the 800 ms sample landed relative to a
user tap — timing noise, not configuration. Grouping on `muted_pct` makes the SSP signal vanish
entirely.

### 7. "`app_name` proxies the supply path" — **disproved**

Same bundle + same version `7.1.0.5010` split 0/800 autoplay under `FreeCell (Android)` versus 36/184
under `FreeCell Solitaire: Card Games`. Inferred `app_name` was tracking the integration.

`FreeCell Solitaire: Card Games` actually spans **10 distinct `app_store_id`s** with autoplay rates
from 0% to 100%. `app_name` is just inconsistently-filled macro text. The 0/800 split was an artifact
of `FreeCell (Android)` being ~entirely PubMatic traffic (see reversal 6).

---

## Measurement traps found the hard way

Full detail in [ANALYTICS_QUERYING.md](ANALYTICS_QUERYING.md); the ones that changed a conclusion here:

**Event-weighted numbers are inflated by Audiomack.** It emits ~3.9 events/visit vs ~1.0 elsewhere, so
its 33,975 events are roughly **8,700 impressions**. Every event-weighted percentage over-weights the
worst app. The "82.9% of Android muted" figure below is event-weighted and **overstates the problem** —
the visit-weighted number is materially lower and has not yet been computed.

**Small windows lie.** A 54-second sample gave Audiomack 96.9% / FreeCell 6.2%; three days gave 92.3%
/ 14.8%. `com.callapp.contacts` went from 0.0% muted (2 events) to 59.1% (1,270 events) — inverting
its meaning.

**A missing JSON key extracts as `false`/`''`, never an error.** Querying a field before its build is
deployed returns "no data" that reads exactly like a finding. Always group by `build_id`.

**RudderStack Live Events ≠ ClickHouse.** Warehouse lag ran tens of minutes. The decisive Android
sample was pulled from Live Events JSON while ClickHouse still showed only the previous build.

**The warehouse may return incomplete result sets, not just lagging ones.** The iOS pass returned 135
events against Android's ~40k in the same window — thin enough that low iOS volume and partial data
are indistinguishable. Every iOS number in this document is therefore provisional in a way the Android
numbers are not. Before trusting a small segment, cross-check its total against a coarser query (same
window, `group by os_type` only) and confirm the two agree.

**Check `JSONHas` before explaining _why_ a field is empty.** On the iOS pass an all-blank
`ad_blocked_error_name` was first attributed to "iOS reaches `onAdBlocked` without the v1.24.0 second
argument" — a plausible mechanism, reasoned from the field varying on `user_has_activated` and so
"the build must be new". Wrong: `user_has_activated` shipped in `3a9919590`, two commits _before_
`02332d16f`, so a populated `user_has_activated` is perfectly consistent with a build too old for
`ad_blocked_error_name`. One `JSONHas` + `build_id` query settled it in seconds. **Fields ship in
different commits — "another new field is populated" is not evidence that _this_ new field is
deployed.**

---

## Data snapshots

### Android by app — 2026-07-24→26, 40,442 events (event-weighted)

| app_bundle                      | events | muted  | muted %  |
| ------------------------------- | ------ | ------ | -------- |
| com.audiomack                   | 33,975 | 31,343 | **92.3** |
| com.mobilityware.freecell       | 2,351  | 348    | 14.8     |
| com.callapp.contacts            | 1,270  | 751    | 59.1     |
| wp.wattpad                      | 844    | 398    | 47.2     |
| in.playsimple.cryptogram        | 595    | 238    | 40.0     |
| puzzle.blockpuzzle.cube.relax   | 527    | 66     | 12.5     |
| com.wood.block.sudoku.puzzle.bm | 403    | 177    | 43.9     |
| com.mathbrain.sudoku            | 376    | 174    | 46.3     |
| com.block.juggle                | 75     | 41     | 54.7     |

Totals: **82.9% muted / 17.1% audible**. Audiomack is 84% of events and 93.4% of all muted events.
Excluding it, the remainder is 34.0% muted. **Treat all of these as upper bounds** — see the
event-weighting trap above.

### App vs SSP — 2026-07-24→27, ≥20 events per cell

| SSP          | app_bundle                      | events | visits | muted % | ev/visit |
| ------------ | ------------------------------- | ------ | ------ | ------- | -------- |
| pubnative    | com.audiomack                   | 916    | 237    | 94.9    | 3.86     |
| inneractive  | com.audiomack                   | 162    | 40     | 95.7    | 4.05     |
| pubmatic     | com.mobilityware.freecell       | 1002   | 967    | 6.3     | 1.04     |
| medianet     | com.mobilityware.freecell       | 148    | 127    | 2.0     | 1.17     |
| fmx          | com.mobilityware.freecell       | 60     | 59     | 15.0    | 1.02     |
| pubmatic     | com.mathbrain.sudoku            | 33     | 32     | 30.3    | 1.03     |
| themediagrid | com.mathbrain.sudoku            | 24     | 21     | 41.7    | 1.14     |
| adform       | wp.wattpad                      | 31     | 17     | **0.0** | 1.82     |
| pubmatic     | wp.wattpad                      | 23     | 10     | 13.0    | 2.30     |
| fmx          | com.wood.block.sudoku.puzzle.bm | 27     | 25     | 81.5    | 1.08     |

This table is the basis for "app, not SSP": within-app agreement across SSPs, cross-app divergence
within SSP.

### iOS by app — 2026-07-24→27, 135 events

Query: `os_type = 'ios'`, no `build_id` filter (see the caveat under the outcome table).

| app_bundle | events | visits | unmuted | unmuted, no gesture | unmuted % |
| ---------- | ------ | ------ | ------- | ------------------- | --------- |
| 1638139403 | 80     | 80     | 13      | 3                   | 16.2      |
| 1602508478 | 27     | 27     | 16      | 0                   | 59.3      |
| _(blank)_  | 13     | 10     | 13      | 13                  | 100       |
| 1496354836 | 12     | 11     | 3       | 2                   | 25.0      |
| 1463070775 | 2      | 2      | 2       | 0                   | 100       |
| 448999087  | 1      | 1      | 1       | 0                   | 100       |

Totals: **35.6% unmuted**, but only **13.3% unmuted with no prior gesture** — the latter is the
advertiser's actual requirement. `ev/visit ≈ 1.0` throughout, so no repeat-emission inflation.

**Excluding the blank-bundle row** (below): **122 events, 39.3% muted-and-blocked**, and genuine
no-gesture unmuted autoplay drops to **5 of 122 ≈ 4%**.

Rows under ~30 events are indicative only — `1463070775` and `448999087` at "100%" carry 2 and 1
events. Precedent: `com.callapp.contacts` read 0.0% muted on 2 events and 59.1% on 1,270.

**The blank `app_bundle` row is probably not field traffic.** It is the only row with blank
`app_bundle` _and_ blank `audio_session_type` (a WebKit-only field populated on every other iOS row)
_and_ `ev/visit > 1` _and_ 100% unmuted-no-gesture. Most likely our own iOS harness running against
prod during verification. Excluded from the headline rates above.

### iOS outcome distribution — same window, 135 events

| element_muted | unmute_blocked | user_has_activated | audio_session_type | events | visits |
| ------------- | -------------- | ------------------ | ------------------ | ------ | ------ |
| 1             | 1              | 1                  | auto               | 85     | 85     |
| 0             | 0              | 1                  | auto               | 30     | 30     |
| 0             | 0              | 0                  | _(blank)_          | 13     | 10     |
| 0             | 0              | 0                  | auto               | 5      | 4      |
| 1             | 0              | 1                  | auto               | 2      | 2      |

Reading it:

- **Row 1 is the whole iOS problem** — 63% of all events, muted, block self-reported, and a gesture had
  already happened. This is what breaks the Android narrative.
- **Row 4 is the proof unmuted autoplay is achievable on real iOS WebKit**: no gesture, unmuted,
  `audio_session_type = auto`. Only 5 events, but it is genuine field traffic unlike row 3.
- **Row 5 is the entire unexplained-mute population**: 2 events.
- `audio_session_type` is `auto` on 132/135 rows and **never** `ambient` — consistent with
  [reversal 1](#1-the-fault-is-native-ios-avaudiosession--disproved). Still cannot distinguish
  "session is fine" from "API unimplemented" (WebKit bug 167788).

**`ad_blocked_error_name` is absent on all 135 rows** — `JSONHas` returns 0 for every iOS build
present. Not an iOS-specific GenAd gap; just build coverage:

| build_id             | key_present | events |
| -------------------- | ----------- | ------ |
| `hZifUrc1.69d2d114c` | 0           | 122    |
| `ZGLZhBJH.32f099196` | 0           | 5      |
| `Bgbys0Q0.e627500a8` | 0           | 3      |
| `BrLJ31Z7.82a1d0421` | 0           | 3      |
| `DgWNUnOa.32f099196` | 0           | 2      |

`69d2d114c` is the commit **immediately before** `02332d16f`, which is what added the field. No iOS
traffic reached `DidcsdpB.02332d16f` in this window at all.

---

## Open questions

| Question                                       | Status                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visit-weighted Android mute rate**           | Not computed. One-line change (`uniqExact(visit_id)` in the ratio). Given ~4× inflation on the dominant app, this will move the headline number a lot. **Do this before quoting any rate externally.**                                                                                                                                                                             |
| **Why iOS blocks — no rejection evidence**     | **The main iOS gap.** `ad_blocked_error_name` is absent on all 135 iOS rows (no iOS traffic on `02332d16f`), so `unmute_blocked = true` is all we have. That cannot separate "WebKit refused unmuted autoplay" from "something else muted it" — and they are **different asks of Infolinks**. Android's claim rested on an actual `NotAllowedError` string; iOS has no equivalent. |
| **Is `02332d16f` still serving iOS?**          | Decides whether iOS `error_name` is a matter of waiting or needs a re-deploy — and the plan plans to **roll back**, after which no new events arrive at all. Query: `group by os_type, build_id` with `min/max(_timestamp)` over the last 24h. Given iOS is ~135 events vs Android's ~40k, low volume alone may explain it.                                                        |
| **iOS sample completeness**                    | 135 events is thin enough that partial warehouse data cannot be ruled out (see the trap above). Re-run the iOS pass and confirm the totals reproduce before any iOS number leaves this document.                                                                                                                                                                                   |
| **Blank-bundle iOS row — harness or supply?**  | 13 events, 100% unmuted-no-gesture, blank `app_bundle` **and** blank `audio_session_type`. Reads as our own harness against prod. If it is instead a real supply path omitting the bundle macro, it is the best working-configuration comparison we have. Confirm before discarding.                                                                                               |
| **iOS: muted despite a gesture**               | 85 events muted with `user_has_activated = true`. Explained in principle by transient-activation/MEI ([reversal 4](#4-genads-guard-rail-fires-on-non-autoplay-rejections-aborterror--disproved)), but unverified on iOS. Distinguishing it from `mediaTypesRequiringUserActionForPlayback` needs the rejection details above.                                                      |
| **Audiomack repeat emission**                  | ~4 events/visit vs ~1.0 elsewhere. Suggests slot re-init or remount. Unexplained; inflates every event-weighted figure.                                                                                                                                                                                                                                                            |
| **`wp.wattpad` mutes with no reported block**  | 81 of 398 muted events (20.4%) have `element_muted = true` but `unmute_blocked = false` — an order of magnitude above every other app. A distinct mute path the current instrumentation cannot explain.                                                                                                                                                                            |
| **Is `app_store_id`'s prefix really the SSP?** | Reads unmistakably as exchange names (pubmatic, medianet, sonobi, appstock, pubnative, themediagrid, inneractive, adform, fmx), but the macro plumbing has not been traced. Well-supported reading, not verified fact.                                                                                                                                                             |

### Closed — do not re-open without new information

| Question                                                | Answer                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Should we ship more beacon fields?**                  | **No** — [API coverage audit](AUDIO_DIAGNOSTIC_API_COVERAGE.md). Reopen only if the transport changes to HLS or Chromium ships `getAutoplayPolicy`.                                                                                                                                                                    |
| **Could SIMID / MRAID / VPAID / DAAST fix this?**       | **No** — [plan §Delivery-layer alternatives](AUDIO_DIAGNOSTIC_PLAN.md#delivery-layer-alternatives--simid-mraid-openrtb-omid-all-rejected-2026-07-27). SIMID needs a player we don't have; MRAID isn't present in this path at all (verified: zero `mraid` refs anywhere). No protocol changes browser autoplay policy. |
| **Can we filter for audible-capable inventory in RTB?** | **Not in a conformant way.** `Banner` has no audio/playback field in OpenRTB 2.5/2.6 or AdCOM; `playbackmethod` is `Video`-only. Needs a bilateral `imp.ext` extension — i.e. a commercial negotiation, not a spec feature.                                                                                            |

---

## Shipped

| What                                  | Where                                                                                                                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUDIO_DIAGNOSTIC` beacon             | CXR `32f099196` → `69d2d114c` (iterations: decoy fix, `audioTracks` detection, iOS signals, fail-safety)                                        |
| `onAdBlocked` rejection details       | GenAd **v1.24.0** `c8c102d` — additive 2nd arg `{errorName, errorMessage, source}`, no behaviour change                                         |
| Consume + report those details        | CXR `02332d16f` — `ad_blocked_error_name` / `_error_message` / `_source`, coerced via `asDiagnosticString` (non-strings → `null`, 300-char cap) |
| **Release 2 (narrow the guard rail)** | **Cancelled** — see reversal 4                                                                                                                  |

Backward-compat note: GenAd ships from the rolling `ad-sdk/1.0.0` CDN channel that CXR cannot pin, so
its declared callback types are not a runtime guarantee. All SDK-supplied diagnostic values are coerced
host-side rather than trusted.
