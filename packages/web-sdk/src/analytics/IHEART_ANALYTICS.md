# iHeart Analytics Integration

Forwards Genuin analytics events to the iHeart Analytics SDK
(`window.iHeartAnalytics.track({ type, data })`) for Highlights article/clips pages.
Spec source: `Highlights_AnalyticsSpec_June2026`.

## How it works

- **Forwarded by default:** the bridge subscribes on SDK init; forwarding only requires
  `window.iHeartAnalytics` to be present + initialized by the host page.
- A viewing session is a **Stream** (once per session) containing many **Tracks** (one per clip),
  all sharing one `station.sessionId`.
- Session/track state that can't come from a single payload (sessionId, listenTime, mute,
  feed position, start position) is tracked in `IHeartSession`.
- The per-clip **lifecycle key** (clip-change detection) is `content_id`/`video_id` — distinct
  from `station.asset.id` (the show/station id, constant across a feed).

| File | Role |
|------|------|
| `iheart-analytics-bridge.ts` | Subscribes to `onAnalyticsTrack`, drives the stream/track lifecycle |
| `iheart-event-map.ts` | Builds each `{ type, data }` payload from the Genuin payload + session |
| `iheart-session.ts` | Stateful stream/track lifecycle engine |
| `iheart-sdk-adapter.ts` | Single chokepoint that calls `window.iHeartAnalytics` |

## Event triggers

| iHeart event | Genuin trigger | Frequency |
|--------------|----------------|-----------|
| `stream_start` | first `Video Started` (no active session) | once / session |
| `track_start` | `Video Started` (new clip) · `Video Play` resume | once / clip |
| `track_end` | `Video Complete`(stop) · `Video Paused`(pause) · clip change(next_clip_start) · tab hidden(pause) · exit(exit_app) | once / clip |
| `stream_end` | `pagehide` / SDK destroy | once / session |
| `play` | `Video Play` (play/resume button) | per click |
| `pause` | `Video Paused` | per click |
| `share` | `Video Shared` | per share |
| `screen_view` | `Embed Viewed` | per page load |

Tab-switch / backgrounding (`visibilitychange → hidden`) emits `track_end(pause)` but keeps the
stream **open** — it does not end the session. `Muted`/`Unmuted` and `Swipe Next/Previous` only
update session state (no event).

## Property → value mapping

**Legend:** 📦 Genuin payload · 🔒 const · ⚙️ session state · 🔧 lifecycle · `‖` first non-empty wins

📦 payload fields are resolved **deeply** — top level first, then a nested `video` (and `attributes`)
object — since Genuin nests clip fields inside the video object.

**Where the payload comes from (`packages/components`):** the analytics payload is built in
`feed-player.tsx` (`analyticsEventData`, the active path) / `feed-player/context/provider.tsx`
(`baseAnalyticsData`), fed by `embed-tile.tsx` from `postDetails.video.attributes`. The iHeart
keys map to: `podcast_id`/`station_id` ← `attributes.{podcast_id,station_id}`,
`section_title` ← `attributes.title`, `section_subtitle` ← `attributes.subtitle`. The
`embed_id`/`placement_id` values come from `AnalyticsProvider`'s per-layout `buildLayoutIdentity`
wrapper, and the `screen_view` payload is emitted separately in `embed.tsx` (`EMBED_VIEWED`).

### Shared streaming identity (`stream_start`, `track_start`, `track_end`, `stream_end`)

| Property | Value |
|----------|-------|
| `station.asset.id` | 📦 `content_id` ‖ `video_id` (the **clip** id — prod: asset block = the clip) |
| `station.asset.name` | 📦 `title` ‖ `description_text` ‖ `video_title` (clip caption) |
| `station.asset.sub.id` | 📦 `live\|<station_id>` else `podcast\|<podcast_id>` (parent container) |
| `station.asset.sub.name` | 📦 `section_title` ‖ `station_name` ‖ `show_name` ‖ `brand_name` (e.g. `"Z100"`) |
| `station.asset.type` | 🔒 `"highlights"` |
| `station.hadPreroll` | 🔒 `false` (web embed has no preroll) |
| `station.isSaved` | 🔒 `false` (no library-save concept in the embed) |
| `station.offlineEnabled` | 🔒 `"No Value"` (string sentinel — matches prod capture) |
| `station.streamInitTime` | ⚙️ epoch-ms at stream start (constant per session) |
| `station.playbackStartTime` | ⚙️ epoch-ms at load |
| `station.playedFrom` | 📦 `432` for `embed_id=69c38273686a088a80a25ea2`; `433` for `placement_id=69c2812fd98484cf6b83a5ba`; else `431` |
| `station.sessionId` | ⚙️ UUID (generated once per session) |
| `station.startPosition` | ⚙️ `start_position` (0 fresh, playhead on resume) |
| `isAutoplay` | 📦 `autoplay` ‖ `video_autoplay` === true |
| `streamIsMute` | ⚙️ `true/false` (starts `true`; Muted/Unmuted toggle) |
| `streamFeedPosition` | ⚙️ `position_index`/`video_index` +1 |
| `streamFeedTotal` | ⚙️ `total_videos` ‖ `video_count` |

### Per-event extras

| Event | Extra properties |
|-------|------------------|
| `track_end` | `station.endReason` 🔧 (`stop`/`pause`/`next_clip_start`/`exit_app`) · `station.completionRate` ⚙️ `clamp(listenTime/video_length, 0..1)` · `station.listenTime` ⚙️ **dual-sent** (global attr + event) |
| `stream_end` | `station.endReason` 🔧 `navigation` (feed exit) · `station.exitSpot` 🔒 `"music"` · `station.listenTime` ⚙️ **dual-sent** · `asset.id`/`asset.name` = last clip's real values (prod sent `""`; we send them via retained last payload) · **omits `isAutoplay`** |
| `play` | `station.asset.{id,name,sub.id,type}` · `station.playedFrom` 📦 · `station.sessionId` ⚙️ |
| `pause` | `station.asset.{id,name,sub.id,type}` · `station.sessionId` ⚙️ |
| `share` | `station.asset.{id,name,sub.id,type}` · `station.offlineEnabled` 🔒 `false` · `share.platform` 📦 snake_case(`share_platform` ‖ `share_method`) |
| `screen_view` | `pageName` 🔧 `live_profile`/`podcast_profile` (by parent type, ‖ `page_name`) · `pageURL` 📦(‖ `location.href`) · `view.item.asset.id` 📦 `<parentType>\|<parentId>` (`live\|<station_id>` ‖ `podcast\|<podcast_id>`) · `view.item.asset.name` 📦 `section_title` (station/show name) · `view.item.asset.sub.id` 🔧 `<parentType>\|highlights` |

## Open questions

| # | Field / Event | Question |
|---|--------------|----------|
| Q1 | ✅ `station.completionRate` (track_end) | Sent as `clamp(listenTime/video_length, 0..1)` (1 = full); confirmed against live (`1`). |
| Q2 | `event.location` (pause) | Required but no value/type. Expected value? (`feed`/`full_screen`?) — **not sent** |
| Q3 | ✅ `station.playedFrom` | Resolved as iHeart numeric source codes: `432` for embed `69c38273686a088a80a25ea2`, `433` for placement `69c2812fd98484cf6b83a5ba`, otherwise existing `431`. |
| Q4 | ✅ `view.item.asset.sub.id` (screen_view) | Resolved: `<parentType>\|highlights` (e.g. `live\|highlights`, `podcast\|highlights`) per 07_Screen_View spec. `asset.id` = `<parentType>\|<parentId>`; `pageName` = `live_profile`/`podcast_profile`. |
| Q5 | `view.item.asset.id` (screen_view) | We send `highlights\|<podcast_id‖station_id‖section_id>`. Confirm correct id + `assetType\|id` format. |
| Q6 | `endReason` / `exitSpot` (stream_end) | Web only observes exit → `close_app` / `music` always. Other enum values aren't observable in a web embed. Acceptable? |
| Q7 | ✅ `station.asset.{id,name,sub}` (all station events) | Resolved against prod: asset block = the **clip** (`id`=`content_id`/`video_id`, `name`=clip caption `title`); `asset.sub` = the **parent station** (`sub.id`=`live\|<station_id>`, `sub.name`=`section_title`, e.g. `"Z100"`). |

## Local testing

Load the embed normally — **no SDK stub needed**. `logIHeartEvent` (`iheart-sdk-adapter.ts`) logs
every built event **before** the SDK-ready gate, so payloads print even when
`window.iHeartAnalytics` is absent:

```
[iHeart-analytics] stream_start (SDK absent — not forwarded) { …full data… }
  └─ console.table of every property (1:1 against the spec)
```

- Not `NODE_ENV`-gated — fires in any build.
- When the real SDK is present the `(SDK absent …)` tag drops and the event also forwards
  (with `station.listenTime` dual-sent via `setGlobalData`).
- Trigger events: load → `screen_view`; play → `stream_start` + `track_start`; pause/resume →
  `pause`/`play`; swipe → `track_end(next_clip_start)` + `track_start`; close tab → `stream_end`.
