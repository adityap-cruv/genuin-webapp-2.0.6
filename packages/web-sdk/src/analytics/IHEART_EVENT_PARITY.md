<div align="center">

# 🎯 iHeart Event Parity

**Field-by-field reconciliation of our embed's analytics payloads against iHeart _production_ captures**

Cross-checked with the official **iHeart Analytics SDK** API · Spec source: `Highlights_AnalyticsSpec_June2026`

</div>

---

## 📊 Parity Status

| Event | Type string | Verified vs prod | Gaps |
|:------|:------------|:----------------:|:-----|
| **Stream Start** | `stream_start` | ✅ **1:1** | none |
| **Track Start** | `track_start` | ✅ **1:1** | none |
| **Track End** | `track_end` | ✅ **1:1** | none |
| **Stream End** | `stream_end` | ✅ **1:1** | none |
| **Play** | `play` | ✅ **1:1** | none |
| **Pause** | `pause` | ✅ **1:1** | `event.location` host-owned |
| **Share** | `share` | ✅ **1:1** | `nativeShare` enum unconfirmed |
| **Screen View** | `screen_view` | ✅ **spec-matched** | none |

> Legend — ✅ verified · ⚠️ verified with caveat · ⬜ not yet checked · ❌ mismatch

---

## 🧩 Ownership Model

The host page loads `window.iHeartAnalytics` and calls `initialize()` / `setGlobalData()`.
**Our embed only ever calls `track({ type, data })`.** The SDK merges four layers into the
payload seen on the wire:

| Badge | Layer | Owner | Fields | Mechanism |
|:-----:|:------|:------|:-------|:----------|
| 🟦 `US` | Event data | **our embed** | `action`(=type) + per-event `data` | `track({ type, data })` |
| 🟨 `HOST·G` | Global data | iHeart **host page** | `device`, `user` | `initialize()` / `setGlobalData()` |
| 🟨 `HOST·P` | Page context | iHeart **host page** | `view` | host-only taxonomy (`pageName:"live_profile"`) |
| 🟩 `SDK` | Auto-generated | iHeart **SDK** | `event.loggedTimestamp`, `querystring`, `session.sequenceNumber` | internal, per `track()` |

**Rule of thumb:** if a field needs iHeart account state, device fingerprint, or page taxonomy,
it is **not ours** — the SDK/host injects it. We must never fabricate those.

> 📌 `view` is **not** a documented global (`initialize`/`setGlobalData` list only `device.*` +
> `user.*`; the docs pass `view` inside per-event `data`). It stays host-owned regardless,
> because `pageName:"live_profile"` is iHeart page taxonomy our embed cannot know.

---

<div align="center">

## 🟢 `stream_start`

</div>

**Trigger:** first `Video Started` with no active session · **Frequency:** once per session

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📡 Prod on-wire payload (merged)</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "stream_start",
  "data": {
    "station": {
      "asset": {
        "id": "03b2bbc9-…",
        "name": "Elvis and Gandhi …",
        "sub": { "id": "live|1469",
                 "name": "Z100" },
        "type": "highlights"
      },
      "sessionId": "4d95e271-…",
      "hadPreroll": false,
      "isSaved": false,
      "offlineEnabled": "No Value",
      "streamInitTime": 1781760395576,
      "playbackStartTime": 1781760395576,
      "startPosition": 0,
      "playedFrom": 431
    },
    "isAutoplay": true,
    "streamIsMute": true,
    "streamFeedPosition": 1,
    "streamFeedTotal": 776
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "action": "stream_start",     // 🟦 US (=type)
  "station": { …13 fields… },   // 🟦 US  ✅
  "streamIsMute": true,         // 🟦 US  ✅
  "streamFeedPosition": 1,      // 🟦 US  ✅
  "streamFeedTotal": 776,       // 🟦 US  ✅
  "isAutoplay": true,           // 🟦 US  ✅

  "view":   { pageName,         // 🟨 HOST·P
              pageURL },
  "device": { appSessionId,     // 🟨 HOST·G
              lat, … },
  "user":   { profileId,        // 🟨 HOST·G
              abTestGroup, … },
  "event":  { loggedTimestamp },// 🟩 SDK
  "querystring": {},            // 🟩 SDK
  "session": { sequenceNumber } // 🟩 SDK
}
```

</td>
</tr>
</table>

### `station` block — every field (all 🟦 US)

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| `asset.id` | `03b2bbc9-…` | `content_id` ‖ `video_id` (clip id) | ✅ |
| `asset.name` | clip caption | `title` ‖ `description_text` ‖ `video_title` | ✅ |
| `asset.type` | `highlights` | const `"highlights"` | ✅ |
| `asset.sub.id` | `live\|1469` | `live\|<station_id>` ‖ `podcast\|<podcast_id>` | ✅ |
| `asset.sub.name` | `Z100` | `section_title` ‖ `station_name` ‖ … | ✅ |
| `hadPreroll` | `false` | const `false` — embed has no preroll | ✅ |
| `isSaved` | `false` | const `false` — no library-save in embed | ✅ |
| `playedFrom` | `431` | `playedFrom(payload)` → `432` for configured embed, `433` for configured placement, else `431` | ✅ |
| `sessionId` | uuid | `IHeartSession` — generated once | ✅ |
| `startPosition` | `0` | `session.startPosition` | ✅ |
| `streamInitTime` | `1781760395576` | `session.streamInitTime` — set once at stream start | ✅ |
| `playbackStartTime` | `1781760395576` | `session.playbackStartTime` — per load | ✅ |
| `offlineEnabled` | `"No Value"` | string sentinel `"No Value"` | ✅ |

**Difference summary**

| | Keys | Diff |
|:--|:--|:--|
| 🟦 Overlap (we send) | `action`, `station`, `streamIsMute`, `streamFeedPosition`, `streamFeedTotal`, `isAutoplay` | **None — identical values** |
| 🟨🟩 Omitted on purpose | `view`, `device`, `user`, `event`, `querystring`, `session` | Injected by host/SDK at runtime |

> 🔎 **Caveats**
> - **Key order** (`asset`: prod `id,name,type,sub` vs ours `id,name,sub,type`) is irrelevant —
>   JSON validates by key, not position.
> - **Runtime check:** open the embed, inspect the outgoing `events` request, and
>   confirm `device`/`user`/`view` are present (proves host init is wired). Missing `view` =
>   iHeart host-config gap, not ours.

**Verdict:** ✅ 13/13 station fields + 4 scalars match. Zero gaps on our side.

---

<div align="center">

## 🟢 `track_start`

</div>

**Trigger:** each clip play (`Video Started` / resume `Video Play`) · **Frequency:** once per clip

Same shape as `stream_start` **plus one field**: `station.subSessionId` — a per-track id
(`sessionId` stays constant across the session; `subSessionId` is fresh per clip).

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📡 Prod on-wire payload (merged)</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "track_start",
  "data": {
    "station": {
      "asset": {
        "id": "03b2bbc9-…",
        "name": "Elvis and Gandhi …",
        "sub": { "id": "live|1469",
                 "name": "Z100" },
        "type": "highlights"
      },
      "sessionId": "4d95e271-…",
      "hadPreroll": false,
      "isSaved": false,
      "offlineEnabled": "No Value",
      "streamInitTime": 1781760395576,
      "playbackStartTime": 1781760395576,
      "startPosition": 0,
      "playedFrom": 431,
      "subSessionId": "d5e1937b-…"   // ← NEW vs stream_start
    },
    "isAutoplay": true,
    "streamIsMute": true,
    "streamFeedPosition": 1,
    "streamFeedTotal": 776
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "action": "track_start",      // 🟦 US (=type)
  "station": { …14 fields… },   // 🟦 US  ✅ (+subSessionId)
  "streamIsMute": true,         // 🟦 US  ✅
  "isAutoplay": true,           // 🟦 US  ✅
  "streamFeedPosition": 1,      // 🟦 US  ✅
  "streamFeedTotal": 776,       // 🟦 US  ✅

  "device": { … },              // 🟨 HOST·G
  "user":   { … },              // 🟨 HOST·G
  "view":   { pageURL },        // 🟨 HOST·P (no pageName here)
  "event":  { loggedTimestamp },// 🟩 SDK
  "querystring": {},            // 🟩 SDK
  "session": { sequenceNumber } // 🟩 SDK
}
```

</td>
</tr>
</table>

### `station` block — only the delta vs `stream_start`

The 13 shared fields are identical to `stream_start` (see above). One field is added:

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| `subSessionId` | `d5e1937b-…` | `session.subSessionId` — fresh per `openTrack` | ✅ |

**Difference summary**

| | Keys | Diff |
|:--|:--|:--|
| 🟦 Overlap (we send) | `action`, `station` (+`subSessionId`), `streamIsMute`, `isAutoplay`, `streamFeedPosition`, `streamFeedTotal` | **None — identical values** |
| 🟨🟩 Omitted on purpose | `device`, `user`, `view`, `event`, `querystring`, `session` | Injected by host/SDK at runtime |

> 🔎 Prod `view` here carries only `pageURL` (no `pageName`) — still host-owned, not our concern.

**Verdict:** ✅ 14/14 station fields + 4 scalars match. `subSessionId` added; zero gaps.

---

<div align="center">

## 🟢 `play`

</div>

**Trigger:** play / resume button (`Video Play`) · **Frequency:** per interaction

Minimal `station` (3 fields) — **no** preroll/saved/offline/timing/feed fields, **no** top-level
scalars. Just asset identity + how the clip was reached + the session it belongs to.

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📡 Prod on-wire payload (merged)</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "play",
  "data": {
    "station": {
      "asset": {
        "id": "03b2bbc9-…",
        "name": "Elvis and Gandhi …",
        "sub": { "id": "live|1469",
                 "name": "Z100" },
        "type": "highlights"
      },
      "sessionId": "4d95e271-…",
      "playedFrom": 431
    }
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "action": "play",             // 🟦 US (=type)
  "station": { asset,           // 🟦 US  ✅
               playedFrom,
               sessionId },

  "view":   { pageName,         // 🟨 HOST·P
              pageURL },
  "device": { … },              // 🟨 HOST·G
  "user":   { … },              // 🟨 HOST·G
  "event":  { loggedTimestamp },// 🟩 SDK
  "querystring": {},            // 🟩 SDK
  "session": { sequenceNumber } // 🟩 SDK
}
```

</td>
</tr>
</table>

### `station` block — every field (all 🟦 US)

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| `asset.id` | `03b2bbc9-…` | `content_id` ‖ `video_id` | ✅ |
| `asset.name` | clip caption | `title` ‖ `description_text` ‖ `video_title` | ✅ |
| `asset.type` | `highlights` | const `"highlights"` | ✅ |
| `asset.sub.id` | `live\|1469` | `live\|<station_id>` ‖ `podcast\|<podcast_id>` | ✅ |
| `asset.sub.name` | `Z100` | `section_title` ‖ `station_name` ‖ … | ✅ |
| `playedFrom` | `431` | `playedFrom(payload)` → `432` for configured embed, `433` for configured placement, else `431` | ✅ |
| `sessionId` | uuid | `session.sessionId` | ✅ |

**Difference summary**

| | Keys | Diff |
|:--|:--|:--|
| 🟦 Overlap (we send) | `action`, `station` (asset + `playedFrom` + `sessionId`) | **None — identical values** |
| 🟨🟩 Omitted on purpose | `view`, `device`, `user`, `event`, `querystring`, `session` | Injected by host/SDK at runtime |

> 🔎 `play` carries **no** stream-level fields (`streamIsMute`/feed/`isAutoplay`) and **no** extended
> `station` fields (`hadPreroll`/`isSaved`/`offlineEnabled`/`startPosition`/timestamps/`subSessionId`).
> Prod omits them; we omit them. No shared `stationBlock` here — `buildPlay` builds the minimal set.

**Verdict:** ✅ 7/7 fields match (5 asset + `playedFrom` + `sessionId`). Zero extras, zero gaps. No code change needed.

---

<div align="center">

## 🟢 `track_end`

</div>

**Trigger:** clip completes (`Video Complete`) → auto-advances to next clip · **Frequency:** per clip

Shared streaming base + `subSessionId` (like `track_start`) **plus three track-end extras**:
`endReason`, `completionRate`, `listenTime`.

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📡 Prod on-wire payload (merged)</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "track_end",
  "data": {
    "station": {
      "asset": { "id": "357e4971-…",
                 "name": "In this conversation…",
                 "sub": { "id": "live|1469",
                          "name": "Z100" },
                 "type": "highlights" },
      "sessionId": "4d95e271-…",
      "hadPreroll": false,
      "isSaved": false,
      "offlineEnabled": "No Value",
      "streamInitTime": 1781760395576,
      "playbackStartTime": 1781760395576,
      "startPosition": 0,
      "playedFrom": 431,
      "subSessionId": "0e4495ff-…",  // ← added
      "endReason": "new_clip_start", // ← fixed (was "stop")
      "completionRate": 1,
      "listenTime": 116              // ⚠️ semantics (see note)
    },
    "isAutoplay": true,
    "streamIsMute": true,
    "streamFeedPosition": 3,
    "streamFeedTotal": 776
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "action": "track_end",        // 🟦 US (=type)
  "station": { …16 fields… },   // 🟦 US  ✅
  "streamIsMute": true,         // 🟦 US  ✅
  "isAutoplay": true,           // 🟦 US  ✅
  "streamFeedPosition": 3,      // 🟦 US  ✅
  "streamFeedTotal": 776,       // 🟦 US  ✅

  "device": { … },              // 🟨 HOST·G
  "user":   { … },              // 🟨 HOST·G
  "view":   { pageURL },        // 🟨 HOST·P
  "event":  { loggedTimestamp },// 🟩 SDK
  "querystring": {},            // 🟩 SDK
  "session": { sequenceNumber } // 🟩 SDK
}
```

</td>
</tr>
</table>

### `station` block — deltas vs `track_start`

13 shared fields + `subSessionId` identical to `track_start`. Three extras:

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| `endReason` | `new_clip_start` | `VIDEO_COMPLETED → "new_clip_start"` (bridge) | ✅ fixed |
| `completionRate` | `1` | `clamp(listenTime / video_length, 0..1)` | ✅ |
| `listenTime` | `116` | `session.listenTime` — cumulative since stream start, **dual-sent** | ✅ |

**`endReason` map (our bridge):**

| Trigger | endReason |
|:--|:--|
| clip completes → next auto-starts | `new_clip_start` ✅ matches prod |
| manual skip to a different clip mid-play | `next_clip_start` |
| pause / tab hidden | `pause` |
| page hide / destroy | `exit_app` |

> ✅ **`listenTime` — confirmed by spec** (`05_Track_End` row 19): *"Total listening time elapsed
> since last Stream_Start (wall time)"* + *"DUAL SEND: must be sent as both an attribute AND an
> event in a single call."* Our `session.listenTime` is exactly cumulative-since-stream-start, and
> `raiseWithDualSend` pushes it via `setGlobalData` **and** in the event data. Matches.
>
> ℹ️ **`completionRate`** — spec (row 20) marks it *"No value/type… Needs clarification."* No
> authoritative definition; we compute `clamp(listenTime / video_length, 0..1)` and prod showed `1`.

**Verdict:** ✅ All 16 station fields + 4 scalars match. Two fixes applied (`subSessionId`,
`endReason`); `listenTime` + dual-send confirmed against spec. Zero open gaps.

---

<div align="center">

## 🟢 `pause`

</div>

**Trigger:** user pauses (`Video Paused`) · **Frequency:** per interaction

Minimal `station` (3 fields), identical shape to `play`: asset + `playedFrom` + `sessionId`.
No stream-level scalars, no extended station fields.

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📡 Prod on-wire payload (merged)</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "pause",
  "data": {
    "station": {
      "asset": {
        "id": "94b02aa8-…",
        "name": "Taylor Swift and Timothée …",
        "sub": { "id": "live|1469",
                 "name": "Z100" },
        "type": "highlights"
      },
      "playedFrom": 431,
      "sessionId": "4d95e271-…"
    }
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "action": "pause",            // 🟦 US (=type)
  "station": { asset,           // 🟦 US  ✅
               playedFrom,
               sessionId },

  "event":  { location,         // 🟨 HOST·P (taxonomy) + 🟩 SDK
              loggedTimestamp },
  "view":   { pageName,         // 🟨 HOST·P
              pageURL },
  "device": { … },              // 🟨 HOST·G
  "user":   { … },              // 🟨 HOST·G
  "querystring": {},            // 🟩 SDK
  "session": { sequenceNumber } // 🟩 SDK
}
```

</td>
</tr>
</table>

### `station` block — every field (all 🟦 US)

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| `asset.id` | `94b02aa8-…` | `content_id` ‖ `video_id` | ✅ |
| `asset.name` | clip caption | `title` ‖ `description_text` ‖ `video_title` | ✅ |
| `asset.type` | `highlights` | const `"highlights"` | ✅ |
| `asset.sub.id` | `live\|1469` | `live\|<station_id>` ‖ `podcast\|<podcast_id>` | ✅ |
| `asset.sub.name` | `Z100` | `section_title` ‖ `station_name` ‖ … | ✅ |
| `playedFrom` | `431` | `playedFrom(payload)` — **added** | ✅ fixed |
| `sessionId` | uuid | `session.sessionId` | ✅ |

**Difference summary**

| | Keys | Diff |
|:--|:--|:--|
| 🟦 Overlap (we send) | `action`, `station` (asset + `playedFrom` + `sessionId`) | **None — identical values** |
| 🟨🟩 Omitted on purpose | `event`, `view`, `device`, `user`, `querystring`, `session` | Injected by host/SDK at runtime |

> ⚠️ **`event.location` — host-owned, not ours.** Prod sends `"live_profile_highlight_card"`.
> This is iHeart **page+component taxonomy** (`live_profile` = same as `view.pageName`, `+
> highlight_card`). Our embed cannot authentically produce that string. The spec marks
> `event.location` Required, but only the host knows the value — same class as `view.pageName`.
> **Open item:** confirm iHeart injects it, or have them give us the exact constant to send for the
> embedded-highlights card if they expect it from `track()`.

**Verdict:** ✅ 7/7 station fields match (was missing `playedFrom`, now fixed). `event.location`
is host taxonomy — pending iHeart confirmation, not a payload gap on our side.

---

<div align="center">

## 🟢 `share`

</div>

**Trigger:** share action (`Video Shared`) · **Frequency:** per interaction

`station` = asset + `offlineEnabled` only (no `sessionId`/`playedFrom`). Plus a top-level
`share.platform`. Three bugs found and fixed.

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📡 Prod on-wire payload (merged)</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "share",
  "data": {
    "station": {
      "asset": {
        "id": "94b02aa8-…",
        "name": "Taylor Swift and Timothée …",
        "sub": { "id": "live|1469",   // ← was {} (fixed)
                 "name": "Z100" },
        "type": "highlights"
      },
      "offlineEnabled": "No Value"    // ← was false (fixed)
    },
    "share": {
      "platform": "linkCopied"        // ← was snake_case (fixed)
    }
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "action": "share",            // 🟦 US (=type)
  "station": { asset,           // 🟦 US  ✅
               offlineEnabled }, //        "No Value"
  "share": { platform },        // 🟦 US  ✅ "linkCopied"

  "device": { … },              // 🟨 HOST·G
  "user":   { … },              // 🟨 HOST·G
  "view":   { pageURL },        // 🟨 HOST·P
  "event":  { loggedTimestamp },// 🟩 SDK
  "querystring": {},            // 🟩 SDK
  "session": { sequenceNumber } // 🟩 SDK
}
```

</td>
</tr>
</table>

### Fields (all 🟦 US)

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| `station.asset.{id,name,type}` | full | `assetBlock` | ✅ |
| `station.asset.sub.{id,name}` | `live\|1469` / `Z100` | needs `station_id`/`podcast_id` in payload | ✅ fixed |
| `station.offlineEnabled` | `"No Value"` | const `"No Value"` | ✅ fixed |
| `share.platform` | `linkCopied` | `mapSharePlatform(share_method)` | ✅ fixed |

**Three bugs fixed**

| # | Was | Now | Where |
|:-:|:----|:----|:------|
| 1 | `offlineEnabled: false` (bool) | `"No Value"` (string) | `buildShare` |
| 2 | `asset.sub: {}` (empty) | `{id:"live\|1469", name:"Z100"}` | `controls.tsx` share emit now sends `station_id`/`podcast_id` (→ `sub.id`) **and** `section_title = video.attributes.title ?? section.title` (→ `sub.name`, was undefined) |
| 3 | `platform: "native_share"` (snake) | iHeart enum `linkCopied`/`nativeShare` | `mapSharePlatform` replaces `toSnakeCase` |

> ⚠️ **`share.platform` enum — partially confirmed.** Web embed produces only two methods:
> link copy → `linkCopied` (**confirmed by prod**) and native share sheet → `nativeShare`
> (**best guess** — pending the `06_Share` spec enum). Confirm/extend `SHARE_PLATFORM_MAP` if
> iHeart enumerates more platforms.
>
> ℹ️ Prod sample shows `linkCopied`; our sample showed `native_share` — different user actions,
> not a contradiction. The mapping now emits iHeart's camelCase format for both.

**Verdict:** ✅ Structure matches after 3 fixes. `nativeShare` value pending spec enum confirmation.

---

<div align="center">

## 🟢 `screen_view`

</div>

**Trigger:** Highlights tab / page view (`Embed Viewed`) · **Frequency:** per page load

**Not** a `station`/streaming event — has `pageName`, `pageURL`, and `view.item.asset` (the parent
container being viewed). Verified against the **07_Screen_View** spec tab (no host-merged prod
capture, so the right column is the spec contract). Three bugs found and fixed.

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📋 07_Screen_View spec contract</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "screen_view",
  "data": {
    "pageName": "podcast_profile",
    "pageURL": "http://localhost:3000/?…",
    "view": {
      "item": {
        "asset": {
          "id": "podcast|86783836",
          "name": "Ruthie's Table 4",
          "sub": { "id": "podcast|highlights" }
        }
      }
    }
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "pageName": "live_profile" |        // page taxonomy
              "podcast_profile",
  "pageURL":  "<url>",
  "view": { "item": { "asset": {
    "id":   "<parentType>|<parentId>", // live|1469 · podcast|1234
    "name": "<call letters / show>",   // e.g. WHTZ-FM
    "sub":  { "id": "<parentType>|highlights" } // live|highlights
  } } }
}
```

</td>
</tr>
</table>

### Fields (all 🟦 US)

| Field | Spec | Our source | |
|:------|:-----|:-----------|:--:|
| `pageName` | `live_profile` / `podcast_profile` | derived from parent type | ✅ fixed |
| `pageURL` | url | `payload.url` ‖ `location.href` | ✅ |
| `view.item.asset.id` | `<parentType>\|<parentId>` | `assetSubId(payload)` | ✅ fixed |
| `view.item.asset.name` | call letters / show name | `assetSubName(payload)` | ✅ |
| `view.item.asset.sub.id` | `<parentType>\|highlights` | `` `${parentType}|highlights` `` | ✅ fixed |

**Three bugs fixed**

| # | Was | Now | Why |
|:-:|:----|:----|:----|
| 1 | `asset.id` = `highlights\|86783836` | `podcast\|86783836` | spec: `id` = parent container, not `highlights\|` |
| 2 | `asset.sub.id` = `podcast\|86783836` | `podcast\|highlights` | spec: `sub.id` = `<parentType>\|highlights` |
| 3 | `pageName` = `Ruthie's Table 4` (show name) | `podcast_profile` | spec: page taxonomy, not the show title |

> ℹ️ `parentType` is read off `assetSubId` (`live` for `station_id`, `podcast` for `podcast_id`).
> `live` stations → `live_profile` + `live|highlights`; podcasts → `podcast_profile` + `podcast|highlights`.

**Verdict:** ✅ Matches the 07_Screen_View spec after 3 fixes (`asset.id`, `asset.sub.id`, `pageName`).

---

<div align="center">

## 🟢 `stream_end`

</div>

**Trigger:** feed exit — `pagehide` / SDK destroy (**not** video-complete, **not** tab-switch) ·
**Frequency:** once per session

The closing event. Built from the **retained last payload** (the exit event itself has none).
**`isAutoplay` is omitted** (prod-confirmed). On `asset.id`/`asset.name`: prod sent empty strings,
but we deliberately send the **last clip's real values** — prod likely lost them because its exit
event carries no clip payload (the exact gap our `lastPayload` retention closes on our side).

<table>
<tr>
<th width="50%">🟦 What our embed sends — <code>track({ type, data })</code></th>
<th width="50%">📡 Prod on-wire payload (merged)</th>
</tr>
<tr>
<td valign="top">

```jsonc
{
  "type": "stream_end",
  "data": {
    "station": {
      "asset": {
        "id": "94b02aa8-…",            // ← last clip (prod sent "")
        "name": "Taylor Swift and …",  // ← last clip (prod sent "")
        "sub": { "id": "live|1469",    // ← retained
                 "name": "Z100" },
        "type": "highlights"
      },
      "sessionId": "5796db31-…",
      "hadPreroll": false,
      "isSaved": false,
      "offlineEnabled": "No Value",
      "streamInitTime": 1781766899705,
      "playbackStartTime": 1781766899705,
      "startPosition": 0,
      "playedFrom": 431,               // ← retained
      "endReason": "navigation",       // ← fixed (was close_app)
      "exitSpot": "music",
      "listenTime": 288                // cumulative, dual-sent
    },
    "streamIsMute": true,
    "streamFeedPosition": 4,
    "streamFeedTotal": 776
    // note: NO isAutoplay
  }
}
```

</td>
<td valign="top">

```jsonc
{
  "action": "stream_end",       // 🟦 US (=type)
  "station": { …blank asset +   // 🟦 US  ✅
               sub + 11 more… },
  "streamIsMute": true,         // 🟦 US  ✅
  "streamFeedPosition": 4,      // 🟦 US  ✅
  "streamFeedTotal": 776,       // 🟦 US  ✅
  // (no isAutoplay)

  "view":   { pageName,         // 🟨 HOST·P
              pageURL },
  "device": { … },              // 🟨 HOST·G
  "user":   { … },              // 🟨 HOST·G
  "event":  { loggedTimestamp },// 🟩 SDK
  "querystring": {},            // 🟩 SDK
  "session": { sequenceNumber } // 🟩 SDK
}
```

</td>
</tr>
</table>

### `station` block

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| `asset.id` / `asset.name` | `""` / `""` (prod) | **last clip's real values** from retained payload (we deliberately send these — prod blanked them, likely lost on exit) | ⚠️ intentional divergence |
| `asset.type` | `highlights` | const | ✅ |
| `asset.sub.{id,name}` | `live\|1469` / `Z100` | retained payload (`assetBlock`) | ✅ fixed |
| `hadPreroll`/`isSaved`/`offlineEnabled` | false/false/`"No Value"` | `stationBlock` | ✅ |
| `playedFrom` | `431` | retained payload | ✅ fixed |
| `sessionId`/`startPosition`/`streamInitTime`/`playbackStartTime` | — | `stationBlock` | ✅ |
| `endReason` | `navigation` | `finalizeOnExit → "navigation"` | ✅ fixed |
| `exitSpot` | `music` | const default | ✅ |
| `listenTime` | `288` | `session.listenTime` (cumulative, dual-sent) | ✅ |

**Four bugs fixed**

| # | Was | Now | Where |
|:-:|:----|:----|:------|
| 1 | `endReason: "close_app"` | `"navigation"` | `finalizeOnExit` (bridge) + new `StreamEndReason` value |
| 2 | `asset.sub: {}`, `playedFrom` missing | retained from last payload | `lastPayload` in `IHeartLifecycle` |
| 3 | `asset.sub: {}`, `asset.id`/`name` empty | last clip's real `id`/`name` + `sub` from retained payload | `buildStreamEnd` |
| 4 | `isAutoplay: false` present | omitted | `buildStreamEnd` (no `streamingBase`) |

> ℹ️ **Why retain payload:** the `pagehide`/destroy handler fires with no event payload, so the
> trailing `track_end(exit_app)` + `stream_end(navigation)` would lose `asset.sub`, `playedFrom`,
> feed position. `IHeartLifecycle.lastPayload` keeps the last clip's payload to preserve that context.
>
> ℹ️ `streamFeedTotal: 776` here assumes backend `no_of_videos` is populated — see the
> `streamFeedTotal` note (clamps to `1` when the feed API omits it).

**Verdict:** ✅ All station fields + 3 scalars match prod after 4 fixes; `isAutoplay` correctly omitted.

---

<!-- ════════════════════════════════════════════════════════════════════════════
     TEMPLATE — copy this block per new event. Replace EVENT_TYPE / values.
     Keep the four sections: header → side-by-side → field table → verdict.
     ════════════════════════════════════════════════════════════════════════════

## ⬜ `EVENT_TYPE`

**Trigger:** <Genuin event> · **Frequency:** <once per … / per clip / interaction>

<table>
<tr>
<th width="50%">🟦 What our embed sends</th>
<th width="50%">📡 Prod on-wire payload</th>
</tr>
<tr>
<td valign="top">

```jsonc
{ "type": "EVENT_TYPE", "data": { … } }
```

</td>
<td valign="top">

```jsonc
{ "action": "EVENT_TYPE", … }
```

</td>
</tr>
</table>

### `station` block — every field

| Field | Prod value | Our source | |
|:------|:-----------|:-----------|:--:|
| … | … | … | ✅ |

**Verdict:** <✅ / ⚠️ / ❌> <summary>

-->

---

## 🔗 Code References

| What | Where |
|:-----|:------|
| Payload builders | [`iheart-event-map.ts`](iheart-event-map.ts) → `buildStreamStart` / `stationBlock` |
| Session state | [`iheart-session.ts`](iheart-session.ts) → `streamInitTime`, `sessionId`, mute, feed pos |
| SDK chokepoint | [`iheart-sdk-adapter.ts`](iheart-sdk-adapter.ts) → `raiseIHeartEvent` |
| Lifecycle orchestration | [`iheart-analytics-bridge.ts`](iheart-analytics-bridge.ts) → `IHeartLifecycle` |
| Field spec & triggers | [`IHEART_ANALYTICS.md`](IHEART_ANALYTICS.md) |
