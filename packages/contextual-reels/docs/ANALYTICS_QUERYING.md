# Querying CXR analytics in ClickHouse

How to get answers out of the CXR analytics warehouse without burning an hour on schema
archaeology. Written after a multi-day field investigation where roughly half the effort went into
discovering the things below rather than analysing data.

**Audience**: any agent or engineer asked to "check the analytics", "pull the data for X", or
"how often does Y happen in production".

---

## The 30-second version

```sql
select
  JSONExtractString(data, 'device_details_os_type')     as os_type,
  JSONExtractBool(data,   'event_details_element_muted') as element_muted,
  count(*)                                             as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 6 hour
  and event = 'audio_diagnostic'
group by 1, 2
order by events desc;
```

Five things that are not guessable and will each cost you a failed query:

1. **Table**: `temp_adreels_logs`. Despite the `temp_` prefix, this is the real table.
2. **There is no `properties` column.** Everything is one JSON blob in a column named `data`.
3. **Nested payload keys are flattened with underscores** — `properties.event_details.element_muted`
   becomes the key `event_details_element_muted` _inside_ `data`. One flat namespace, no nesting.
4. **The `event` column is snake_case**, even though the SDK sends Title Case. `"Audio Diagnostic"`
   in code → `event = 'audio_diagnostic'` in ClickHouse.
5. **It's ClickHouse**, so `JSONExtractString` / `JSONExtractBool` / `uniqExact`, not
   `json_extract_scalar` / `count(distinct …)`.

---

## Schema

### Columns

The only columns you normally need:

| Column       | Notes                                                                       |
| ------------ | --------------------------------------------------------------------------- |
| `event`      | snake_case event name — the main filter. See the name-transform rule below. |
| `_timestamp` | Event time. Use for all range filters.                                      |
| `data`       | JSON blob holding the entire payload. Everything else lives in here.        |

Run this if you need the full column list — do not guess:

```sql
select name, type from system.columns where table = 'temp_adreels_logs' order by position;
```

### Keys inside `data`

The RudderStack payload nests as `properties.{device_details,event_details,user_details}.<field>`.
The warehouse flattens that to a single underscore-joined key. So:

| Payload path                                   | Key inside `data`                   |
| ---------------------------------------------- | ----------------------------------- |
| `properties.event_details.element_muted`       | `event_details_element_muted`       |
| `properties.device_details.os_type`            | `device_details_os_type`            |
| `properties.device_details.geoip.country_code` | `device_details_geoip_country_code` |
| `properties.user_details.ifa`                  | `user_details_ifa`                  |

**A key that does not exist extracts as `''` / `false` / `0`, never as an error.** This is the single
biggest source of wrong conclusions — see [Traps](#traps) below.

### Event-name transform

`EVENT` in [`src/analytics/analytics.ts`](../src/analytics/analytics.ts) is the source of truth for
what the SDK sends. The warehouse lowercases it and replaces spaces with underscores:

| SDK sends                | `event` column                   |
| ------------------------ | -------------------------------- |
| `"Audio Diagnostic"`     | `audio_diagnostic`               |
| `"Ad Response Received"` | `ad_response_received`           |
| `"Tag Init"`             | `tag_init`                       |
| `"Video Complete"`       | `video_complete`                 |
| `"Midpoint"`             | `midpoint`                       |
| `"cta_click"`            | `cta_click` (already snake_case) |

If a filter returns zero rows, check this transform before concluding the events aren't firing.

---

## Field reference

### `device_details_*`

| Key                                                                         | Type           | Notes                                                                                                                                              |
| --------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `os_type`                                                                   | String         | `android`, `ios`, `chromium` (Linux/ChromeOS Chrome — [ADR 002](cxr-decisions/002-chromium-os-quirk.md))                                           |
| `app_bundle`                                                                | String         | **Android: package name** (`com.audiomack`). **iOS: numeric App Store ID** (`1638139403`) — look up via `https://itunes.apple.com/lookup?id=<id>`. |
| `app_name`, `app_version`, `app_country`                                    | String         | Host-app metadata from macros                                                                                                                      |
| `device_type`                                                               | String         | e.g. `mobile`                                                                                                                                      |
| `user_agent`                                                                | String         |                                                                                                                                                    |
| `geoip_country_code`, `geoip_city_en`, `geoip_ip`, `geoip_lat`, `geoip_lng` | String / Float |                                                                                                                                                    |

### `event_details_*` — always present

| Key                         | Type   | Notes                                                                                        |
| --------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `tag_id`                    | String | Filter on this to scope to one placement                                                     |
| `visit_id`                  | String | **One per impression.** The correct unit of analysis — see [Traps](#traps).                  |
| `build_id`                  | String | `<coreHash>.<gitSha>`, e.g. `DidcsdpB.02332d16f`. Essential when a field was added recently. |
| `page`                      | String | Usually the host app bundle                                                                  |
| `passback`                  | Int    | `1` = passback fired (revenue-critical)                                                      |
| `event_record_screen`       | String | e.g. `embed`                                                                                 |
| `dnt`, `gdpr`, `us_privacy` | String | Consent macros, `"0"` / `"1"`                                                                |

### `event_details_*` — `audio_diagnostic` only

The audio-audibility beacon. Full rationale in
[AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md); emitted from
[`src/ads/audioDiagnostic.ts`](../src/ads/audioDiagnostic.ts).

| Key                                                                                                                               | Type       | Notes                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `element_muted`                                                                                                                   | Bool       | The real `<video>`/`<audio>` `.muted`. **The primary outcome field.**                                                                                                                                               |
| `element_volume`                                                                                                                  | Float      | The element's real `.volume`. **On iOS this is always `1`** — the platform ignores programmatic volume writes. Not a fault on iOS.                                                                                  |
| `configured_volume`                                                                                                               | Float      | What the strategy/`GIV` intended (`0.2` on the audible-start audio tags)                                                                                                                                            |
| `volume`, `is_muted`                                                                                                              | Int / Bool | What the CXR **app** believes (from PlayerProvider). Divergence from `element_*` is itself the diagnostic.                                                                                                          |
| `unmute_blocked`                                                                                                                  | Bool       | GenAd reported a system force-mute via `onVolumeChange({reason:"system"})`                                                                                                                                          |
| `ad_blocked_reason`                                                                                                               | String     | GenAd's `onAdBlocked` reason; currently only `unmuted_autoplay_restricted`                                                                                                                                          |
| `ad_blocked_error_name`                                                                                                           | String     | **GenAd ≥ 1.24.0 / CXR build ≥ `DidcsdpB.02332d16f`.** The real rejection: `NotAllowedError` = genuine autoplay block; `AbortError` = **not** a block; `AUTOPLAY_DISALLOWED` / `ima_message_match` on the IMA path. |
| `ad_blocked_error_message`                                                                                                        | String     | Browser text, capped at 300 chars host-side                                                                                                                                                                         |
| `ad_blocked_source`                                                                                                               | String     | `audio_vast` or `ima`                                                                                                                                                                                               |
| `user_has_activated`                                                                                                              | Bool       | Sticky activation — has this document **ever** had a user gesture. **The field that explains most muting.** WebKit ≥ Safari 17 and Chrome.                                                                          |
| `user_activation_active`                                                                                                          | Bool       | Transient activation at sample time                                                                                                                                                                                 |
| `has_audio_track`                                                                                                                 | Bool       | Creative genuinely carries audio                                                                                                                                                                                    |
| `audio_track_source`                                                                                                              | String     | `audioTracks` / `decodedBytes` / `webkitHasAudio` / `unknown` — which signal `has_audio_track` came from                                                                                                            |
| `audio_decoded_bytes`                                                                                                             | Int        | `webkitAudioDecodedByteCount`. **Absent on current iOS** — null means "unknown", never "no audio".                                                                                                                  |
| `audio_decoding`                                                                                                                  | Bool       | Counter present AND climbing. Carries no information on iOS.                                                                                                                                                        |
| `time_advancing`                                                                                                                  | Bool       | `currentTime` moved between samples                                                                                                                                                                                 |
| `time_advanced_ms`                                                                                                                | Int        | How far it moved. Sample window is 800 ms, so ~600–800 = real-time, 0 = stalled.                                                                                                                                    |
| `audio_session_type`                                                                                                              | String     | `navigator.audioSession.type` — **iOS/WebKit only**. Empty on Android. In observed data always `"auto"`, which may mean "not implemented" rather than "not ambient".                                                |
| `document_hidden`                                                                                                                 | Bool       | iOS suspends media in a hidden web view — explains silence with no audio-session involvement                                                                                                                        |
| `media_element_count`                                                                                                             | Int        | Media elements in the slot. Expect `1`.                                                                                                                                                                             |
| `paused`, `ready_state`, `network_state`, `buffered_ahead_s`, `duration_ms`, `current_time_ms`, `element_src`, `media_error_code` | mixed      | Playback health                                                                                                                                                                                                     |
| `is_webview`                                                                                                                      | Bool       |                                                                                                                                                                                                                     |
| `provider`, `ad_source`, `brand_id`, `ad_url`                                                                                     | mixed      | `ad_source` is the platform (`tritondigital`, `infy`); `ad_url` is long — avoid selecting it in aggregates                                                                                                          |
| `wants_audible_ad_start`                                                                                                          | Bool       | `configured_volume > 0`; the beacon only fires when true                                                                                                                                                            |
| `forced_fill`                                                                                                                     | Bool       | **Synthetic impression from a debug test handset — exclude from every rate.** See the trap below.                                                                                                                   |

### `user_details_*`

`user_id`, `deviceid`, `ifa`, `app_store_id`.

---

## Traps

Each of these produced a wrong answer during the investigation this document came out of.

### 1. Count visits, not events

Some buckets re-emit the beacon. Measured: **~5.7 events per visit** in the Android blocked bucket
versus **~1.0** everywhere else. Event-weighted percentages therefore over-weight exactly the bucket
you are usually investigating.

```sql
count(*)                                                     as events,
uniqExact(JSONExtractString(data, 'event_details_visit_id'))  as visits
```

Report both. Quote **visits**. (The repeat-emission cause is still unexplained — see
[Open questions](#open-questions).)

### 2. A missing key is indistinguishable from a false/empty value

`JSONExtractBool(data, 'event_details_typo_here')` returns `false`. `JSONExtractString` returns `''`.
No error. So a filter on a misspelled or **not-yet-deployed** field silently returns "no data" that
looks like a real finding.

Before drawing a conclusion from an empty column, confirm the key exists at all:

```sql
select
  JSONHas(data, 'event_details_ad_blocked_error_name') as key_present,
  count(*)
from temp_adreels_logs
where _timestamp >= now() - interval 2 hour and event = 'audio_diagnostic'
group by 1;
```

### 3. Always group by `build_id` for a recently-added field

This one cost the most time. A field added in build `DidcsdpB.02332d16f` does not exist in rows
served by the previous build, and traffic runs on both for hours after a deploy. Querying a 24-hour
window right after shipping returns overwhelmingly old-build rows with the new column empty — which
reads exactly like "the instrumentation is broken".

```sql
where _timestamp >= now() - interval 2 hour
  and JSONExtractString(data, 'event_details_build_id') = 'DidcsdpB.02332d16f'
```

Sanity-check what builds are even present before interpreting anything:

```sql
select
  JSONExtractString(data, 'event_details_build_id') as build_id,
  min(_timestamp) as first_seen, max(_timestamp) as last_seen, count(*) as events
from temp_adreels_logs
where _timestamp >= now() - interval 12 hour and event = 'audio_diagnostic'
group by 1 order by events desc;
```

### 4. Warehouse lag is real — RudderStack live ≠ ClickHouse

Events visible in the RudderStack **Live Events** dashboard can be absent from ClickHouse for tens of
minutes. If ClickHouse shows only the old `build_id` while the live dashboard shows the new fields
populated, that is sync lag, not a data problem.

```sql
select
  max(_timestamp) as newest_row,
  dateDiff('minute', max(_timestamp), now()) as lag_minutes
from temp_adreels_logs
where _timestamp >= now() - interval 6 hour and event = 'audio_diagnostic';
```

For a fast answer while the warehouse catches up, pull JSON straight from RudderStack Live Events and
filter client-side. That is how the decisive Android sample was obtained.

### 5. Small windows lie, and so do small samples

A 54-second sample gave `com.audiomack` at 96.9% muted and `com.mobilityware.freecell` at 6.2%.
Three days of data gave **92.3%** and **14.8%**. Same conclusion, but a materially different ratio —
and `com.callapp.contacts` went from 0.0% muted (2 events) to 59.1% (1,270 events), inverting its
meaning entirely.

Use windows of ≥ 24 hours for rates. Flag any segment under ~30 rows as indicative only.

### 6. `JSONExtract*` over `data` is a full scan

No index on JSON keys. A 3-day window with several extractions took **~90 seconds**; a 6-hour window
returns in seconds. Narrow `_timestamp` first, and avoid selecting `event_details_ad_url` (very long)
in aggregates.

### 7. Booleans are real Bools here — but verify once

`JSONExtractBool` works and `countIf(JSONExtractBool(...))` is correct for this table. If a boolean
column comes back all-`false` against expectation, the fallback is
`JSONExtractString(data, '…') = 'true'`. Check rather than assume.

### 8. Exclude `forced_fill` from every audio rate

Two internal test handsets are served a **static VAST feed** instead of the live
exchange, so the audible-ad path can be exercised on a real device (Triton fills
only intermittently, so most real loads passback). See
[STRATEGIES.md → Debug-device feeds](STRATEGIES.md#debug-device-feeds-temporary-diagnostic).

Those impressions emit an `Audio Diagnostic` beacon **indistinguishable from a real
fill** except for `forced_fill = true`. They are not real auction wins, and because
Infolinks device-targets those handsets they load far more often than ordinary
traffic — so leaving them in inflates the numerator of any audibility rate.

```sql
-- Add to every audio_diagnostic rate query:
AND NOT JSONExtractBool(data, 'event_details_forced_fill')
```

`NOT JSONExtractBool(...)` is correct here rather than `= false`: a missing key
extracts as `false`, which is what you want — every impression predating this
field, and every ordinary device, is genuine. Note this is the **opposite** of
trap 2, where a missing key was ambiguous; here the absent case and the `false`
case genuinely mean the same thing.

This only applies to `audio_diagnostic`. No other event carries the field.

---

## Recipes

### Outcome distribution by OS

```sql
select
  JSONExtractString(data, 'device_details_os_type')          as os_type,
  JSONExtractBool(data,   'event_details_element_muted')      as element_muted,
  JSONExtractBool(data,   'event_details_unmute_blocked')     as unmute_blocked,
  JSONExtractBool(data,   'event_details_user_has_activated') as user_has_activated,
  JSONExtractBool(data,   'event_details_has_audio_track')    as has_audio_track,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'audio_diagnostic'
group by 1, 2, 3, 4, 5
order by events desc;
```

### Per-publisher audible rate

The workhorse query. `muted_pct` is the headline number per app.

```sql
select
  JSONExtractString(data, 'device_details_os_type')    as os_type,
  JSONExtractString(data, 'device_details_app_bundle') as app_bundle,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits,
  countIf(JSONExtractBool(data, 'event_details_element_muted'))  as muted_events,
  countIf(JSONExtractBool(data, 'event_details_unmute_blocked')) as unmute_blocked_events,
  round(100.0 * countIf(JSONExtractBool(data, 'event_details_element_muted')) / count(*), 1) as muted_pct
from temp_adreels_logs
where date(_timestamp) between '2026-07-24' and '2026-07-26'
  and event = 'audio_diagnostic'
group by 1, 2
order by events desc;
```

Note `muted_events - unmute_blocked_events` — impressions muted with **no** reported autoplay block.
Normally < 5%; a materially higher share for one app is a distinct failure mode worth chasing.

### Why an ad was muted (needs build ≥ `DidcsdpB.02332d16f`)

```sql
select
  JSONExtractString(data, 'event_details_ad_blocked_error_name')  as error_name,
  JSONExtractString(data, 'event_details_ad_blocked_source')      as source,
  JSONExtractBool(data,   'event_details_user_has_activated')     as user_has_activated,
  JSONExtractString(data, 'device_details_os_type')               as os_type,
  JSONExtractString(data, 'device_details_app_bundle')            as app_bundle,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 6 hour
  and event = 'audio_diagnostic'
  and JSONExtractString(data, 'event_details_build_id') = 'DidcsdpB.02332d16f'
  and JSONExtractString(data, 'event_details_ad_blocked_reason') != ''
group by 1, 2, 3, 4, 5
order by events desc;
```

`NotAllowedError` = genuine browser block (our SDK behaved correctly).
`AbortError` = **not** an autoplay block; the guard rail muted an ad that could have been audible.

### Funnel across event types

```sql
select event, count(*) as events,
       uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 6 hour
  and event in ('tag_init','ad_requested','ad_response_received','ad_impression','audio_diagnostic','ad_passback')
group by 1 order by events desc;
```

### Inspect one raw event

Best first move on any unfamiliar event type — shows every available key.

```sql
select data from temp_adreels_logs
where event = 'audio_diagnostic' and _timestamp >= now() - interval 1 hour
limit 1 format Vertical;
```

---

## Interpreting the audio beacon

The decision tree the fields were designed to resolve. Buckets are mutually exclusive; a row matching
both A and B indicates a beacon bug.

| Bucket                   | Signature                                                                                         | Meaning                                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — native silencing** | `element_muted=false` AND `element_volume>0` AND `time_advancing=true` AND `unmute_blocked=false` | Web layer healthy. If the user still hears nothing it is native (iOS `AVAudioSession` / ring switch). **Note this is indistinguishable from a normal, audible, working ad** — treat it as a ceiling, not a measurement. |
| **B — autoplay gate**    | `unmute_blocked=true` OR `element_muted=true`                                                     | Browser refused unmuted autoplay; SDK muted and played on. Ad is silent, impression still counted. Cross-reference `user_has_activated`.                                                                                |
| **C — creative fault**   | `has_audio_track=false` OR (`time_advancing=false` AND `paused=false`)                            | No audio track, or stalled. **Ours.**                                                                                                                                                                                   |

Findings established with this beacon (July 2026, ~40k Android events):

- Android is **82.9% muted** overall; `user_has_activated=false` correlates perfectly with the
  blocked outcome, and `ad_blocked_error_name` is `NotAllowedError` — a **genuine** browser block.
- Per-app spread runs **12.5% → 92.3% muted** with tag, creative, and SDK held constant, which
  locates the cause in per-app WebView configuration (Android:
  `setMediaPlaybackRequiresUserGesture`), not in our code.
- `has_audio_track=true` on 100% of rows — bucket C is fully eliminated.

---

## Open questions

Do not re-derive these; they are known-unknown as of July 2026.

- **Repeat emission**: the Android blocked bucket emits ~5.7 events per `visit_id` versus ~1.0
  elsewhere. Cause unknown; inflates event-weighted rates. Always report visits.
- **`wp.wattpad`**: 20.4% of its muted events have **no** reported autoplay block, an order of
  magnitude above every other app. A distinct, unexplained mute path.
- **`audio_session_type` is always `"auto"`** in observed data. Cannot distinguish "publisher session
  is fine" from "the API is unimplemented in WKWebView" (WebKit bug 167788).

---

## See also

- [AUDIO_DIAGNOSTIC_PLAN.md](AUDIO_DIAGNOSTIC_PLAN.md) — why the beacon exists and what it can/cannot prove
- [`src/analytics/analytics.ts`](../src/analytics/analytics.ts) — `EVENT` vocabulary (**a partner contract**: append only, never rename)
- [`src/ads/audioDiagnostic.ts`](../src/ads/audioDiagnostic.ts) — what each beacon field measures
- [CONTRIBUTING.md](CONTRIBUTING.md) — partner contracts and invariants
