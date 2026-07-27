# Audio Diagnostic & unmuted-autoplay — analyst guide

**Scope:** the `Audio Diagnostic` beacon shipped on the `feature/cxr-audio-diagnostic-beacon` branch,
plus everything CXR does to obtain **audible (unmuted) autoplay** on Android and iOS, and how to keep
monitoring it.

**Live build:** `DidcsdpB.02332d16f` — verified from the built artifact (`dist/gen_ext.min.js` carries
`build: DidcsdpB.02332d16f`). This is the newest build and it **includes every field described here**,
`ad_blocked_error_name` included. Commits after `02332d16f` on this branch are documentation only, so
the core hash is unchanged. The beacon is **live and still collecting** — this is forward-looking
monitoring, not a closed dataset.

**Tag under investigation:** `6a39163e92929ebec64d78ab` (320×50, Triton/`infy` audio,
`initialVolume: 0.2`).

**New to this?** Read §0 first — it explains what the beacon is measuring in plain English, with no
SQL and no jargon. §2 then glosses every single field the same way.

---

## TL;DR

- **What the beacon is for.** Certain tags are contractually required to start **audible** with no user
  tap. They frequently don't. The beacon fires once per fill on those tags only, samples the real media
  element twice 800 ms apart, and records who silenced it — us, the browser, or the platform.
- **The creative is never at fault.** `has_audio_track = true` on 100% of ~40k rows. That whole branch
  of the investigation is closed.
- **Android is root-caused and is not our bug.** Chrome refuses unmuted autoplay because the host app's
  WebView never received a user gesture (`setMediaPlaybackRequiresUserGesture`, native config we can't
  reach). `ad_blocked_error_name = NotAllowedError` + `user_has_activated = false` on blocked rows.
  `com.audiomack` is ~92% muted and is numerically most of the problem; `wp.wattpad`/adform runs 0%
  muted, proving permissive configuration is achievable.
- **iOS is measured but not explained.** ~64% of iOS impressions muted; the contractual requirement is
  met on roughly 4%. The Android story does **not** transfer — 85 of 122 iOS events are muted _despite_
  `user_has_activated = true`. As of the last pull, no iOS traffic had reached `02332d16f`, so there was
  **no rejection evidence on iOS at all**. That build is now live, so **the top monitoring priority is
  watching for iOS rows on `02332d16f` with a populated `ad_blocked_error_name`** — that single field is
  what turns iOS from "outcome known, cause unknown" into the same closed case as Android.
- **Three numbers are not cleared for external use**: the Android mute rate is event-weighted and
  inflated; all iOS rates rest on 135 events with suspected incomplete warehouse data. Compute
  visit-weighted before quoting anything.
- **Exclude `forced_fill` from every rate.** Two internal test handsets are served a synthetic feed and
  emit beacons indistinguishable from real fills. They load far more often than ordinary traffic. See
  §2 and trap 7 in §5.
- **Don't propose a technical fix.** Narrowing GenAd's guard rail, SIMID/MRAID/VPAID, RTB filtering, and
  every WebView API were each investigated and closed on evidence. The gate sits below every protocol.
  The remedy is commercial (placement allowlisting), not code.

**Reading order:** §0 for the plain-English orientation · §1 for how to query · §2 for the field
dictionary · §3 for platform findings · §4 for standing queries · §5 for traps that have already
produced wrong answers.

---

## 0. Plain-English orientation

Skip this if you already know the domain. Everything here is restated precisely in §2.

### The business problem in four sentences

Some audio ads we serve are sold on the promise that they start **playing out loud on their own** — no
tap, no swipe, sound immediately. Browsers hate this, because an ad that blares at you unprompted is
exactly the thing autoplay rules were written to stop. So the browser often silently mutes our ad
instead of blocking it outright, and the ad "delivers" while nobody hears it. The beacon exists to find
out, on real phones in the field, how often that happens and **who** did the muting.

### The three players, and why we can't just ask

| Layer                  | What it is                                                                | Can we see it?                                    |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| **Our code (CXR)**     | The widget that requests the ad and asks for sound                        | Yes — fully                                       |
| **The browser engine** | Chrome on Android, WebKit on iOS. Enforces autoplay policy                | Partly — we see its rejections, not its reasoning |
| **The native app**     | Audiomack, Wattpad, etc. Hosts the browser in a WebView and configures it | **No.** Zero JavaScript access                    |

The whole difficulty is that the layer most likely to be at fault is the one we can't inspect. So the
beacon works by **elimination**: prove our layer did everything right, prove the browser either allowed
it or gave a named reason for refusing, and whatever silence is left over belongs to the native app.

### The core distinction: what we _asked for_ vs what _happened_

Three separate things could each be described as "the volume," and confusing them has produced wrong
conclusions before:

1. **What the ad strategy intended** — `configured_volume` (`0.2` on these tags). A number in a config
   file. Says nothing about reality.
2. **What our app thinks is true** — `volume` / `is_muted`, from CXR's own player state. Our belief.
3. **What the actual media element reports** — `element_muted` / `element_volume`, read straight off the
   `<video>`/`<audio>` DOM node. **Reality.**

Only #3 is evidence. When #2 and #3 disagree, that gap is itself the finding: it means something outside
our app changed the state underneath us.

### How one beacon row is produced

An ad fills → we check whether this tag is supposed to start audible (`initialVolume > 0`); if not,
nothing fires → we find the real media element in the slot → we take a snapshot of ~25 properties →
**we wait 800 ms** → we take a second snapshot → we send one row containing the second snapshot plus the
_differences_ between the two.

The 800 ms gap is the entire reason the beacon can tell "playing" from "frozen." A single snapshot shows
a playhead position; two snapshots show whether it **moved**. That's `time_advancing`.

### The one question, and the honest answer to it

> **"Did this ad play out loud, on its own, without the user touching anything?"**

No single field answers that. It takes four, and they answer four different sub-questions:

| Sub-question                            | Field                | What "good" looks like |
| --------------------------------------- | -------------------- | ---------------------- |
| Did anything mute it?                   | `element_muted`      | `false`                |
| Was it actually playing?                | `time_advancing`     | `true`                 |
| Was it genuinely untouched by the user? | `user_has_activated` | `false`                |
| Was the screen even visible?            | `document_hidden`    | `false`                |

**`element_muted` is the primary outcome field** — if you only ever look at one, look at that. But
`element_muted = false` alone does **not** mean the ad played audibly. An unmuted ad that never started,
or that's playing in a backgrounded tab, is still silence. And an unmuted ad that played _after the user
tapped_ is not autoplay — it doesn't satisfy the contract, which is specifically about no-gesture starts.

### The honest ceiling on all of this

Even all four fields green only proves **the web layer did not silence it**. Below the web layer sit the
iOS ring/silent switch and the host app's native audio session (`AVAudioSession`) — neither of which has
_any_ JavaScript surface, on any browser, by design. If those are what's silencing the ad, this beacon
cannot see it and never could. That limitation is the reason the escalation to Infolinks is written as a
commercial ask rather than a bug report: we can prove it isn't us, and we cannot prove what it is.

### Jargon decoder

| Term                           | Plain meaning                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Autoplay**                   | Media starting on its own, with no user tap                                                     |
| **Muted autoplay**             | The browser's compromise: it lets the video play, but with sound off. Almost always allowed     |
| **Unmuted / audible autoplay** | Playing _with sound_, unprompted. Heavily restricted — this is what we need and often don't get |
| **User gesture / activation**  | A tap, click, or key press. Browsers treat it as permission to make noise                       |
| **Sticky activation**          | "Has this page **ever** been touched?" Once true, stays true                                    |
| **Transient activation**       | "Was the page touched **just now**?" Expires after a few seconds                                |
| **WebView**                    | A browser embedded inside a native app, rather than a standalone browser. Most of our traffic   |
| **Media element**              | The actual `<video>` or `<audio>` tag in the page                                               |
| **Fill**                       | An ad request that successfully returned an ad                                                  |
| **Passback**                   | No ad returned, so we hand the slot back to the publisher. Revenue-critical                     |
| **Guard rail**                 | GenAd's fallback: if unmuted play is refused, mute and retry so the ad still delivers           |
| **Impression**                 | One ad view. One `visit_id`. **The correct unit of analysis**                                   |
| **VAST**                       | The XML format that describes an ad and where its media file lives                              |
| **Progressive download**       | A plain media file fetched start-to-finish. What this tag uses                                  |
| **HLS**                        | Streaming in chunks. _Not_ used here — relevant only as a future regression risk                |
| **SSP / exchange**             | The marketplace the ad was bought through                                                       |
| **`initialVolume`**            | Per-tag config. `> 0` means "this tag must start audible" — the beacon's trigger                |

---

## 1. Querying basics

Five things that aren't guessable and each cost a failed query:

|                                         |                                                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Table**                               | `temp_adreels_logs` — despite the `temp_` prefix, this is the real table                                                   |
| **No `properties` column**              | Everything is one JSON blob in a column named `data`                                                                       |
| **Keys are flattened with underscores** | `properties.event_details.element_muted` → key `event_details_element_muted` inside `data`. One flat namespace, no nesting |
| **`event` column is snake_case**        | SDK sends `"Audio Diagnostic"` → warehouse stores `event = 'audio_diagnostic'`                                             |
| **It's ClickHouse**                     | `JSONExtractString` / `JSONExtractBool` / `uniqExact` — not `json_extract_scalar` / `count(distinct …)`                    |

```sql
select
  JSONExtractString(data, 'device_details_os_type')      as os_type,
  JSONExtractBool(data,   'event_details_element_muted') as element_muted,
  count(*)                                               as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 6 hour
  and event = 'audio_diagnostic'
  and not JSONExtractBool(data, 'event_details_forced_fill')  -- exclude synthetic test-handset fills
group by 1, 2
order by events desc;
```

Key prefixes: `device_details_*` (os*type, app_bundle, user_agent, geoip*_), `event*details*_`(the
payload + tag_id/visit_id/build_id),`user*details*\*` (user_id, deviceid, ifa, app_store_id).

`app_bundle` differs by platform: **Android = package name** (`com.audiomack`); **iOS = numeric App
Store ID** (`1638139403`), resolvable via `https://itunes.apple.com/lookup?id=<id>`.

---

## 2. Field dictionary

Every field carries a **plain-English line** (what it means with no jargon) and the **precise note**
(what it technically is, and the traps). Read the plain line to orient; read the precise note before
you quote a number.

### When the event fires

Once per ad fill, **only** on tags with `initialVolume > 0` (audible-start). Fired from
`onWaterfallSuccess`; the payload is a single row containing deltas between two samples taken ~800 ms
apart. **No event is emitted** when the slot holds no media element (banner/native fills) or when the
sampler hits an internal error — it deliberately reports nothing rather than throwing an error into a
publisher's page. So absent rows mean "not applicable", not "broken".

### Always-present context (on every event, not just this one)

| Key                                                        | Type       | In plain English                                                                                       | Notes                                                                                                                                                                                                                       |
| ---------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag_id`                                                   | String     | Which ad placement this was                                                                            | scope to one placement                                                                                                                                                                                                      |
| `visit_id`                                                 | String     | The ID for one single ad view                                                                          | **one per impression — the correct unit of analysis**                                                                                                                                                                       |
| `build_id`                                                 | String     | Which version of our code the phone was running                                                        | `<coreHash>.<gitSha>`, e.g. `DidcsdpB.02332d16f`. Essential for recently-added fields                                                                                                                                       |
| `volume`, `is_muted`                                       | Int / Bool | What **our app** thinks the volume is — its belief, not reality                                        | from PlayerProvider. Divergence from `element_*` is itself the diagnostic                                                                                                                                                   |
| `unmute_blocked`                                           | Bool       | The ad SDK is telling us "something forced me to mute"                                                 | GenAd reported a system force-mute via `onVolumeChange({reason:"system"})`. Present on **all** ad events for an audible-start load, not just this beacon                                                                    |
| `forced_fill`                                              | Bool       | **This wasn't a real ad — it's one of our two test phones running a fake feed.** Throw these rows away | `true` on debug-device impressions ([genAdSdk.ts](../src/ads/genAdSdk.ts)). They are not auction wins and load far more often than real traffic, so they inflate every rate. **Exclude from every rate query** — see trap 7 |
| `passback`                                                 | Int        | We had no ad, so we gave the slot back to the publisher                                                | `1` = passback fired (revenue-critical)                                                                                                                                                                                     |
| `page`, `event_record_screen`, `dnt`, `gdpr`, `us_privacy` | mixed      | Where it ran and what privacy consent applied                                                          | host/consent context                                                                                                                                                                                                        |

### Outcome — the primary fields

| Key                      | Type  | In plain English                                                                                    | Notes                                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | ----- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `element_muted`          | Bool  | **Was the sound switched off?** `false` = nothing muted it. The single most important field         | The real `<video>`/`<audio>` `.muted`. **The primary outcome field.** But see §0 — `false` alone doesn't prove it played audibly                                                                                                                                                                                                                    |
| `element_volume`         | Float | How loud the element says it is. **Ignore this on iOS** — it's always `1` there regardless of truth | The element's real `.volume`. [Apple documents volume as read-only on iOS](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html) — level is under physical user control. `1` here is **not** evidence our level failed to apply |
| `configured_volume`      | Float | How loud we _intended_ it to be — a config value, not a measurement                                 | What the strategy/`GIV` intended (`0.2` on these tags)                                                                                                                                                                                                                                                                                              |
| `wants_audible_ad_start` | Bool  | "This ad was supposed to start out loud." Always true here                                          | Always `true` on this event — the beacon only fires when it is                                                                                                                                                                                                                                                                                      |

**Volume triangulation.** Three independent views land on every row: `volume`/`is_muted` (what the app
believes) · `configured_volume` (what the strategy intended) · `element_muted`/`element_volume` (what
the DOM actually reports). All three agreeing on "audible" while the user hears nothing points below
the web layer. `is_muted: true` or `element_muted: true` instead means something muted it — and the
`ad_blocked_*` fields say what.

### Why it was blocked

| Key                        | Type   | In plain English                                                                  | Notes                                                                                                                                                                                                                                                      |
| -------------------------- | ------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ad_blocked_reason`        | String | The ad SDK's own label for "I got refused." Too vague to rely on                  | GenAd's own bucket — currently only ever `unmuted_autoplay_restricted`. Coarse; GenAd applies it to _every_ `play()` rejection                                                                                                                             |
| `ad_blocked_error_name`    | String | **The browser's actual words for why it refused.** The field that cracked Android | `NotAllowedError` = genuine autoplay block (our SDK behaved correctly). `AbortError` = **not** a block (superseded/interrupted `play()`) — a false positive in GenAd's bucket. Requires GenAd ≥ 1.24.0 **and** CXR build ≥ `DidcsdpB.02332d16f` (now live) |
| `ad_blocked_error_message` | String | The full text of the browser's complaint                                          | Browser text, capped at 300 chars host-side                                                                                                                                                                                                                |
| `ad_blocked_source`        | String | Which of our two ad pipelines this went through                                   | `audio_vast` or `ima`. On this tag it is **always `audio_vast` by construction** — the 320×50 Triton/`infy` layout never uses IMA                                                                                                                          |

`null`/`''` on the three detail fields means either "no block occurred" **or** "build too old to
report it" — disambiguate with `ad_blocked_reason` and `build_id`, never by assumption. (This exact
confusion produced a wrong conclusion once already; see §5.)

### Audio presence — is the creative even carrying audio?

| Key                   | Type       | In plain English                                                                                             | Notes                                                                                                                                                                |
| --------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `has_audio_track`     | Bool       | **Does the ad file even contain sound?** Separates "our ad is broken" from "our ad is fine but got silenced" | From `audioTracks.length`, falling back to the decode counter / `webkitHasAudio`. Has been `true` on 100% of ~40k rows                                               |
| `audio_track_source`  | String     | How we worked the above out                                                                                  | `audioTracks` / `awaitingMetadata` / `decodedBytes` / `webkitHasAudio` / `unknown`. `unknown` **and** `awaitingMetadata` both mean "couldn't tell", never "no audio" |
| `audio_decoded_bytes` | Int / null | How much audio the phone has actually processed. Blank on iPhones — the counter doesn't exist there          | `webkitAudioDecodedByteCount`. **Absent on current iOS** — null means unknown, never "no audio"                                                                      |
| `audio_decoding`      | Bool       | Is sound actively being processed right now. **Meaningless on iPhones** — always false there                 | Counter present AND climbing. Carries no information on iOS; use `has_audio_track` + `time_advancing` instead                                                        |

> **Regression risk to watch.** `has_audio_track` is reliable here because this tag is
> **progressive-download** (GenAd sets `audio.src` from a parsed VAST `<MediaFile>` — no HLS). WebKit
> has known HLS audio-track exposure gaps. If a future audio creative ships an HLS `<MediaFile>`,
> `has_audio_track` could silently read `false` on iOS with `audio_track_source: "audioTracks"` — which
> the decision tree would misread as _"our creative has no audio,"_ a false accusation against
> ourselves. If `has_audio_track: false` ever appears at volume, check the transport before concluding
> anything.
>
> **Partly closed.** The timing half of that risk is now guarded: an empty track list read before
> metadata loads reports `audio_track_source: "awaitingMetadata"` rather than `"audioTracks"`, so a
> slow network at sample time can no longer read as a silent creative. The HLS half stands — that one
> is a genuine platform gap, not a timing artifact, and still needs the transport check above. Treat
> **only** `audioTracks` + `has_audio_track: false` as evidence against our own creative.

### Playback health

| Key                                      | Type         | In plain English                                                                                                   | Notes                                                                                                                         |
| ---------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `time_advancing`                         | Bool         | **Did the ad actually play, or just sit there frozen?**                                                            | `currentTime` moved between the two samples                                                                                   |
| `time_advanced_ms`                       | Int          | How much of the ad played during our 800 ms look                                                                   | Window is 800 ms — ~600–800 = real-time, small = limping, 0 = stalled                                                         |
| `current_time_ms`                        | Int          | How far into the ad we were when we measured                                                                       | Playhead at second sample                                                                                                     |
| `duration_ms`                            | Int / null   | How long the ad is in total                                                                                        | Creative length where known                                                                                                   |
| `buffered_ahead_s`                       | Float / null | How much of the ad has downloaded ahead of the playhead. `0` while playing = network problem, not an audio problem | Seconds buffered ahead. `0` while `paused = false` points to a network/decode stall, not an audio-session issue               |
| `paused`, `ready_state`, `network_state` | Bool / Int   | Standard "is it playing / loaded / still fetching" states                                                          | Standard element state                                                                                                        |
| `media_error_code`                       | Int / null   | The ad file failed to load or play at all                                                                          | `MediaError.code` if the element failed outright                                                                              |
| `media_element_count`                    | Int          | How many video/audio tags were in the slot. Should be exactly 1                                                    | **Expect `1`.** A value >1 means a future layout change reintroduced a second element and element-selection needs re-checking |
| `element_src`                            | String       | The URL of the file we measured — proves we looked at the right thing                                              | Settles "did we measure the right thing" at a glance                                                                          |

### Platform / gating

| Key                                           | Type          | In plain English                                                                                                                | Notes                                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user_has_activated`                          | Bool          | **Has the user tapped the page at any point?** If false, this was a true untouched autoplay. Explains nearly all Android muting | Sticky activation. Does _not_ explain iOS                                                                                                                                                                                                                                              |
| `user_activation_active`                      | Bool          | Did the user tap _just now_. **Currently useless** — we measure it too late to matter                                           | Transient activation at sample time, sampled ~800 ms _after_ GenAd's `play()` call, long after the moment that mattered. A known instrumentation gap, not a data problem                                                                                                               |
| `audio_session_type`                          | String        | Whether _we_ set an audio mode. **Does not tell us what the native app did** — a common misreading                              | iOS/WebKit only; empty on Android. Read strictly as "did CXR set a session type". `navigator.audioSession` _is_ implemented (Safari 16.4+) and `"auto"` is its documented default meaning "nobody set one." It was never capable of reporting the host app's `AVAudioSession` category |
| `document_hidden`                             | Bool          | Was the screen/tab hidden. iPhones silence hidden pages — an innocent explanation for silence                                   | iOS suspends media in a hidden webview — explains silence with no audio-session involvement                                                                                                                                                                                            |
| `is_webview`                                  | Bool          | Was this inside an app rather than a real browser                                                                               | Best-effort webview detection                                                                                                                                                                                                                                                          |
| `audiocontext_state`                          | String / null | Should always be blank — we deliberately never create one                                                                       | CXR never constructs an `AudioContext` (doing so can claim the iOS audio session), so **expect `null`**                                                                                                                                                                                |
| `provider`, `ad_source`, `brand_id`, `ad_url` | mixed         | Who sold and served the ad                                                                                                      | `ad_source` is the platform (`tritondigital`, `infy`). **Avoid selecting `ad_url` in aggregates** — very long                                                                                                                                                                          |

---

## 3. What we're trying to do, and what we've found

### The mechanism CXR uses to request audible autoplay

In `src/ads/genAdSdk.ts`, gated entirely on `wantsAudibleAdStart` (`initialVolume > 0`):

1. GenAd is initialized with `muted: false` and `volume: initialVolume` **up front** — CXR asks the
   browser for unmuted autoplay directly rather than muting then unmuting.
2. `unmute_blocked` is seeded `false` at init, flipped to `true` if GenAd reports a **system**-driven
   force-mute. User-initiated mute (`reason: "user"`) is deliberately excluded — that's not a block.
3. If the browser rejects `play()`, GenAd's guard rail catches it, force-mutes, and retries **so the ad
   still delivers muted rather than not at all**. CXR records the outcome; it does not participate in
   the retry.
4. Since GenAd v1.24.0, the raw rejection is exposed and CXR records it (`ad_blocked_error_name` et al).

There is **no** code path where CXR synthesizes a gesture, delays playback, or alters the audio session
— all were considered and rejected (below).

### Android — root cause identified, no code fix available to us

Chrome refuses unmuted autoplay because the host app's WebView never received a user gesture — native
`setMediaPlaybackRequiresUserGesture` configuration, outside anything our JS can reach. GenAd correctly
detects the `NotAllowedError` and mutes so the ad still plays.

- `ad_blocked_error_name = NotAllowedError` (_"play() can only be initiated by a user gesture"_) and
  `user_has_activated = false` on every blocked row — the correlation is perfect across all sampled rows.
- **`com.audiomack` ~92% muted; all other Android apps ~8.9%** — Audiomack is 84% of events and 93.4% of
  all muted events.
- **Cause is per-app, not per-SSP**: same app across two SSPs agrees (Audiomack: pubnative 94.9%,
  inneractive 95.7%); same SSP across apps diverges (pubmatic: 6.3% / 13.0% / 30.3%).
- **Unmuted autoplay is achievable**: `wp.wattpad`/adform — 31 events, **0% muted**, 29 genuine
  no-gesture autoplays. Permissive configuration exists in the wild.

### iOS — outcome measured, mechanism not

- ~64% of iOS impressions muted with GenAd self-reporting a block; the contractual audible requirement
  is met on roughly **4%** of genuine no-gesture impressions.
- **The Android explanation does not transfer**: 85 of 122 events are muted while
  `user_has_activated = true`. "The WebView never got a gesture" is not the iOS mechanism.
- **No rejection evidence existed on iOS** at last pull — `ad_blocked_error_name` absent on all 135 iOS
  rows because no iOS traffic had reached `02332d16f`. **That build is now live**, so this is the gap
  most likely to close on its own; see query ③.
- Leading unverified theory: WebKit gates on **transient** activation + Media Engagement Index, not
  sticky activation — so `user_has_activated = true` doesn't imply unmuted autoplay is permitted at the
  instant `play()` runs. (`user_activation_active` would speak to this but is sampled too late.)
- **iOS has no unexplained mute path**: only 2 of 87 muted iOS events have `unmute_blocked = false`
  (1.5%), vs 20.4% on Android `wp.wattpad`. Nearly all iOS muting is self-reported by GenAd.

**All iOS numbers are provisional** — 135 events against Android's ~40k in the same window, thin enough
that low volume and partial warehouse data are indistinguishable.

### Closed — do not re-propose

| Idea                                                                 | Verdict                                                                                                                                                                                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Narrow GenAd's guard rail (`AbortError` vs `NotAllowedError`)        | **Cancelled.** Field data: 100% `NotAllowedError`, 0% `AbortError`. The guard rail is correct; narrowing it fixes nothing and risks converting muted-but-delivered impressions into no impression                                     |
| SIMID / MRAID / VPAID / DAAST                                        | **No.** SIMID needs a player we don't have; MRAID isn't in this path (verified zero refs). The autoplay gate sits _below_ every protocol — `<video>`, `<audio>` and `AudioContext` all resolve through the same policy check in Blink |
| RTB filtering for audible-capable inventory                          | **Not conformantly.** OpenRTB 2.5/2.6 and AdCOM have no audio/playback field on `Banner` (`playbackmethod` is video-only). Needs a bilateral `imp.ext` extension — a commercial negotiation                                           |
| `navigator.getAutoplayPolicy()`                                      | **Absent from Chromium too**, not just WebKit — not present in Blink's `navigator.idl`. Firefox 112 is the only implementation                                                                                                        |
| `navigator.userAgentData.getHighEntropyValues()`                     | `webview_android: false`; and UA-CH only works for apps sending the default UA string — ad-serving hosts routinely override it. Unreliable precisely in our population                                                                |
| Constructing an `AudioContext`, or Web Audio `AnalyserNode`          | **Rejected on side effects.** Can claim the iOS audio session / reroutes the element's audio — unacceptable for instrumentation on a live ad                                                                                          |
| Reading `AVAudioSession`, ring/silent switch, Android `AudioManager` | **No JS surface at all.** If any were readable the beacon would have been unnecessary                                                                                                                                                 |

**Consequence for the escalation:** there is no signal a host app can read to _predict_ audible-autoplay
capability. The deliverable is placement-level allowlisting — a commercial ask, not a technical one.

---

## 4. Standing queries

**③ is the highest-value one right now** — it's the question whose answer is actively changing.

Every query below excludes `forced_fill`. Keep that line when you adapt them.

### ① Headline health, visit-weighted, by platform

```sql
select
  JSONExtractString(data, 'device_details_os_type')       as os_type,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits,
  uniqExactIf(JSONExtractString(data, 'event_details_visit_id'),
              JSONExtractBool(data, 'event_details_element_muted')) as muted_visits,
  round(100.0 * uniqExactIf(JSONExtractString(data, 'event_details_visit_id'),
              JSONExtractBool(data, 'event_details_element_muted'))
        / uniqExact(JSONExtractString(data, 'event_details_visit_id')), 1) as muted_pct_visits
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'audio_diagnostic'
  and not JSONExtractBool(data, 'event_details_forced_fill')
group by 1;
```

Visit-weighted deliberately. The event-weighted Android figure on record (~83%) is inflated by repeat
emission and **must not be quoted externally** until this is run.

### ② Android — is it still just Audiomack?

```sql
select
  JSONExtractString(data, 'device_details_app_bundle') as app_bundle,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits,
  round(count(*) / uniqExact(JSONExtractString(data, 'event_details_visit_id')), 2) as ev_per_visit,
  countIf(JSONExtractBool(data, 'event_details_element_muted'))  as muted_events,
  countIf(JSONExtractBool(data, 'event_details_unmute_blocked')) as unmute_blocked_events,
  round(100.0 * countIf(JSONExtractBool(data, 'event_details_element_muted')) / count(*), 1) as muted_pct
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'audio_diagnostic'
  and JSONExtractString(data, 'device_details_os_type') = 'android'
  and not JSONExtractBool(data, 'event_details_forced_fill')
group by 1
having events >= 30
order by events desc;
```

Watch two things: a second app crossing into Audiomack's range, and
`muted_events - unmute_blocked_events` — impressions muted with **no** reported block. Normally <5%; a
materially higher share for one app is a distinct failure mode (this is the open `wp.wattpad` question
at 20.4%).

### ③ iOS — has real rejection evidence started arriving? ⭐

```sql
select
  JSONExtractString(data, 'event_details_build_id')              as build_id,
  JSONHas(data, 'event_details_ad_blocked_error_name')           as key_present,
  JSONExtractString(data, 'event_details_ad_blocked_error_name') as error_name,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits,
  min(_timestamp) as first_seen, max(_timestamp) as last_seen
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'audio_diagnostic'
  and JSONExtractString(data, 'device_details_os_type') = 'ios'
  and not JSONExtractBool(data, 'event_details_forced_fill')
group by 1, 2, 3
order by events desc;
```

The live build `DidcsdpB.02332d16f` carries the field. Once iOS rows appear on it with a populated
`error_name`, the iOS mechanism becomes answerable the same way Android's was. `NotAllowedError` would
confirm a genuine WebKit autoplay block; anything else — or a block with no error at all — is new
information and worth escalating immediately.

### ④ Guard-rail false-positive rate

```sql
select
  JSONExtractString(data, 'event_details_ad_blocked_error_name') as error_name,
  JSONExtractString(data, 'event_details_ad_blocked_source')     as source,
  JSONExtractString(data, 'device_details_os_type')              as os_type,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'audio_diagnostic'
  and JSONExtractString(data, 'event_details_build_id') = 'DidcsdpB.02332d16f'
  and JSONExtractString(data, 'event_details_ad_blocked_reason') != ''
  and not JSONExtractBool(data, 'event_details_forced_fill')
group by 1, 2, 3
order by events desc;
```

`AbortError` was 0% at last check. If it reappears at volume, the cancelled "narrow the guard rail"
work becomes live again — those are ads that could have been audible.

### ⑤ Self-check: is our own instrumentation still sound?

```sql
select
  JSONExtractBool(data,   'event_details_has_audio_track')     as has_audio_track,
  JSONExtractString(data, 'event_details_audio_track_source')  as track_source,
  JSONExtractInt(data,    'event_details_media_element_count') as media_element_count,
  count(*) as events
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'audio_diagnostic'
  and not JSONExtractBool(data, 'event_details_forced_fill')
group by 1, 2, 3
order by events desc;
```

Expect `has_audio_track = true`, `track_source = audioTracks`, `media_element_count = 1`. Any drift —
especially `has_audio_track: false` at volume — means check the creative transport (HLS regression risk)
**before** concluding our creative is broken.

### ⑥ The full audible-autoplay success rate

The four-field version of "did it actually work", per §0. Use this rather than `100 − muted_pct` when
you need the number that maps to the contractual promise.

```sql
select
  JSONExtractString(data, 'device_details_os_type') as os_type,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as no_gesture_visits,
  uniqExactIf(JSONExtractString(data, 'event_details_visit_id'),
              not JSONExtractBool(data, 'event_details_element_muted')
              and JSONExtractBool(data, 'event_details_time_advancing')
              and not JSONExtractBool(data, 'event_details_document_hidden')) as audible_visits,
  round(100.0 * uniqExactIf(JSONExtractString(data, 'event_details_visit_id'),
              not JSONExtractBool(data, 'event_details_element_muted')
              and JSONExtractBool(data, 'event_details_time_advancing')
              and not JSONExtractBool(data, 'event_details_document_hidden'))
        / uniqExact(JSONExtractString(data, 'event_details_visit_id')), 1) as audible_pct
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'audio_diagnostic'
  and not JSONExtractBool(data, 'event_details_forced_fill')
  and not JSONExtractBool(data, 'event_details_user_has_activated')  -- genuine no-gesture only
group by 1;
```

The `user_has_activated` filter is in the **denominator** deliberately: the contract is about
no-gesture starts, so impressions where the user already tapped don't belong in either half. This is
the query behind "the requirement is met on roughly 4% of genuine no-gesture impressions."

Caveat: `user_has_activated` is nullable in the payload, and a missing key extracts as `false` — on
builds predating `3a9919590` that silently widens the denominator. Group by `build_id` if the number
looks off.

---

## 5. Traps — each of these already produced a wrong answer

**Count visits, not events.** Some buckets re-emit the beacon: ~4 events/visit on Audiomack (and up to
~5.7 in the Android blocked bucket) versus ~1.0 everywhere else. Event-weighted percentages therefore
over-weight exactly the bucket you're investigating. Report both, quote **visits**. (iOS runs ~1.0
ev/visit, so iOS event- and visit-weighted rates coincide.) The repeat-emission cause is still
unexplained.

**A missing key extracts as `false`/`''`, never an error.** Querying a field before its build is
deployed returns "no data" that reads exactly like a finding. Use `JSONHas(...)` to confirm the key
exists before interpreting an empty column.

**Fields ship in different commits.** "Another new field is populated, so the build must be new" is
**not** valid reasoning. `user_has_activated` shipped in `3a9919590`, two commits _before_ the
`02332d16f` that added `ad_blocked_error_name` — so a populated `user_has_activated` is perfectly
consistent with a build too old for the error fields. Always group by `build_id`.

**Small windows and small samples lie.** A 54-second sample gave Audiomack 96.9% / FreeCell 6.2%; three
days gave 92.3% / 14.8%. `com.callapp.contacts` went from 0.0% muted (2 events) to 59.1% (1,270 events),
inverting its meaning. Use ≥24-hour windows for rates; flag anything under ~30 rows as indicative only.

**The warehouse can return incomplete result sets, not just lagging ones.** Before trusting a small
segment, cross-check its total against a coarser query over the same window (`group by os_type` only)
and confirm the two agree.

**RudderStack Live Events ≠ ClickHouse.** Warehouse lag has run to tens of minutes. If ClickHouse shows
only the old `build_id` while Live Events shows new fields populated, that's sync lag.

**Exclude `forced_fill` from every rate.** Two internal test handsets are served a **static VAST feed**
instead of the live exchange, so the audible path can be exercised on a real device (Triton fills only
intermittently, so most real loads passback). Those impressions emit a beacon **indistinguishable from
a real fill** except for `forced_fill = true`, and because Infolinks device-targets those handsets they
load far more often than ordinary traffic — leaving them in inflates the numerator of any audibility
rate. Use `not JSONExtractBool(data, 'event_details_forced_fill')`, **not** `= false`: here a missing
key and an explicit `false` genuinely mean the same thing (every ordinary device, and everything
predating the field, is a real fill). Note this is the **opposite** of trap 2. Only `audio_diagnostic`
carries this field. See [STRATEGIES.md → Debug-device feeds](STRATEGIES.md#debug-device-feeds-temporary-diagnostic).

The flag tracks the feed **actually served**, not merely "is this one of the two test handsets". If a
fixture is missing or malformed the code falls back to the real feed, and that impression is a genuine
fill reported as `forced_fill = false` — correctly, since it should count toward the rate. So a debug
handset can legitimately appear on both sides of this filter, and `forced_fill = false` rows are never
by themselves proof that a row came from an ordinary device.

**`element_muted = false` is not the same as "it played audibly."** It means nothing muted the element
— not that playback happened, and not that it happened without a gesture. A stalled unmuted element
(`time_advancing = false`) is silence; a hidden document (`document_hidden = true`) is silence; and an
unmuted play _after_ a tap (`user_has_activated = true`) isn't autoplay and doesn't satisfy the
contract. Use query ⑥ for the number that maps to the promise. And even all four green only proves the
**web layer** didn't silence it — the ring/silent switch and the host's `AVAudioSession` remain invisible
to JavaScript.

**`JSONExtract*` over `data` is a full scan.** No index on JSON keys — a 3-day window with several
extractions took ~90 seconds; 6 hours returns in seconds. Narrow `_timestamp` first, and keep
`event_details_ad_url` out of aggregates.

### Conclusions that did not survive — don't re-walk these

| Claim                                                      | Outcome                                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Native iOS `AVAudioSession` is the cause"                 | **Not supported, but not disproved either.** `audio_session_type` reads `"auto"` on 132/135 rows and never `ambient` — but that field could never have reported the host's category, so it's evidence for neither side. Genuinely still open |
| "We're sampling the wrong (decoy) element"                 | Real once, fixed; confirmed not current (`media_element_count: 1`)                                                                                                                                                                           |
| "This ad went down the IMA path"                           | Wrong — this tag always plays through a `<video>` in our own container; `ad_blocked_source` is `audio_vast` by construction                                                                                                                  |
| "GenAd's guard rail fires on `AbortError` false positives" | Disproved once the field shipped: 100% `NotAllowedError`. Planned fix cancelled                                                                                                                                                              |
| "The SSP/demand path explains the variance"                | Artifact of measuring `autoplay_no_gesture` instead of `muted`. Grouping on `muted_pct` makes the SSP signal vanish entirely                                                                                                                 |
| "`app_name` proxies the supply path"                       | `app_name` is inconsistently-filled macro text — one value spanned 10 distinct `app_store_id`s with 0–100% autoplay rates. Group by `app_bundle`                                                                                             |

---

## Source documents

All in `packages/contextual-reels/docs/`:

- [AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md) — running findings log, reversals, data snapshots
- [ANALYTICS_QUERYING.md](ANALYTICS_QUERYING.md) — full ClickHouse guide, schema, recipes
- [AUDIO_DIAGNOSTIC_API_COVERAGE.md](AUDIO_DIAGNOSTIC_API_COVERAGE.md) — proof the instrumentation is complete, with citations
- [AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md) — beacon design and decision tree
- [AUDIO_DIAGNOSTIC_INFOLINKS_FEEDBACK.md](AUDIO_DIAGNOSTIC_INFOLINKS_FEEDBACK.md) — the outbound ask
- [STRATEGIES.md](STRATEGIES.md#debug-device-feeds-temporary-diagnostic) — debug-device feeds and `forced_fill`
- Implementation: [`src/ads/audioDiagnostic.ts`](../src/ads/audioDiagnostic.ts), emitted from [`src/ads/genAdSdk.ts`](../src/ads/genAdSdk.ts)
