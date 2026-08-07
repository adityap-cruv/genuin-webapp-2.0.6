# Querying the visibility diagnostic in ClickHouse

How to read the `VISIBILITY_DIAGNOSTIC` beacon out of the CXR analytics warehouse. Companion to
[ANALYTICS_QUERYING.md](ANALYTICS_QUERYING.md) (the audio beacon) — **same table, same schema, same
traps**; this doc only covers what is specific to the visibility axis. Read the audio doc first if
you have not; everything in its [Schema](ANALYTICS_QUERYING.md#schema) and
[Traps](ANALYTICS_QUERYING.md#traps) sections applies here verbatim.

**Audience**: any agent or engineer asked to "check whether the unit is actually visible in the
field", "which viewability signal flips to hidden", or "pull the visibility data for the Sudoku
tag".

**Why this beacon exists**: `unit_visible` (IO v1 `isIntersecting` + CSS `visibility`) reads `true`
for a unit a host has hidden at the **native layer** — an off-screen / 0-size / `View.INVISIBLE`
WebView, or a preloaded-but-unshown interstitial. The beacon captures every candidate viewability
signal side-by-side so field data can name the one that correctly flips to "hidden" **before** we
change the `unit_visible` definition. Full rationale:
[VISIBILITY_DIAGNOSTIC_PLAN.md](VISIBILITY_DIAGNOSTIC_PLAN.md). Emitted from
[`src/monitoring/visibilityDiagnostic.ts`](../src/monitoring/visibilityDiagnostic.ts), fired from
[`genAdSdk.ts`](../src/ads/genAdSdk.ts) alongside the audio beacon.

---

## ⚠️ Two schemas — know which one you have

There are **two** ways this data is exposed, and the query syntax is completely different. Check which
one your warehouse gives you before copy-pasting anything below.

**A — the flattened relational view: `rudder_logs.visibility_diagnostic`** (what field runs on
2026-08 used). Every payload key is already its **own top-level column** with the underscore-flattened
name (`event_details_io_v2_is_visible`, `device_details_os_type`, `user_details_deviceid`) — a real
typed column, no JSON extraction. Bools are real Bools, so `NOT event_details_forced_fill` and
`countIf(event_details_io_v1_intersecting AND NOT event_details_io_v2_is_visible)` work directly. The
time column is `timestamp`. **This is the form the recipes below are written in.**

**B — the raw blob table: `temp_adreels_logs`** (the audio-doc schema). One JSON blob in a `data`
column; every field read via `JSONExtractString/Bool/Float(data, 'event_details_…')`; time column is
`_timestamp`; event filter `event = 'visibility_diagnostic'`. If you are on this table, translate each
recipe: `event_details_X` → `JSONExtractBool(data,'event_details_X')` (or `…String`/`…Float`), and
add `and event = 'visibility_diagnostic'`. See
[ANALYTICS_QUERYING.md → Schema](ANALYTICS_QUERYING.md#schema) for that form's traps (they still
apply: a missing key extracts as `false`/`''`/`0`, JSON extraction is a full scan, etc.).

The **field semantics** in the reference below are identical across both — only the access syntax
differs. Two things specific to this beacon regardless of schema:

1. The event is `Visibility Diagnostic` (view B lowercases it to `visibility_diagnostic`).
2. The interesting fields are **Bools and Floats** — `raf_fps`, `io_v1_ratio`, `computed_opacity`,
   geometry and viewport are numeric; treat them as such (`round(...)`, not a Bool test).

## The 30-second version

Schema A (flat columns — the field-tested form):

```sql
select
  device_details_os_type            as os_type,
  event_details_io_v1_intersecting  as io_v1_intersecting,
  event_details_io_v2_is_visible    as io_v2_is_visible,
  round(event_details_raf_fps, 1)   as raf_fps,
  count(*)                          as events,
  uniqExact(event_details_visit_id) as visits
from rudder_logs.visibility_diagnostic
where date(timestamp) >= today() - 1
group by 1, 2, 3, 4
order by events desc;
```

---

## Schema

Both forms carry the same underscore-flattened keys — the snapshot under `event_details_*`, plus the
envelope the analytics layer stamps on every event (`build_id`, `page`, `tag_id`, `visit_id`,
`device_details_*`, `user_details_*`). The only difference is access: **schema A** exposes each as its
own typed column (`event_details_io_v2_is_visible`); **schema B** nests everything in the `data` JSON
blob read via `JSONExtract*`. See the "Two schemas" box above. On schema B the common-field traps in
[ANALYTICS_QUERYING.md → Traps](ANALYTICS_QUERYING.md#traps) apply verbatim.

---

## Field reference — `visibility_diagnostic` only

The `event_details_*` common fields (`tag_id`, `visit_id`, `build_id`, `page`, `passback`, consent
macros) are the same as the audio beacon — see
[ANALYTICS*QUERYING.md → `event_details*\*` — always present](ANALYTICS_QUERYING.md#event_details_--always-present).
Below are the beacon-specific keys, grouped by signal family. Every field is a candidate for the
future `unit_visible` definition; the point of the beacon is to see which one disagrees with IO v1
against a known-hidden unit.

Source of truth for the shape: `VisibilityDiagnosticSnapshot` in
[`visibilityDiagnostic.ts`](../src/monitoring/visibilityDiagnostic.ts).

### IO v1 — today's `unit_visible` basis

| Key                      | Type          | Notes                                                                                                                                                                     |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `io_v1_intersecting`     | Bool \| null  | `isIntersecting` of the last v1 entry. **This is what `unit_visible` uses today** — the field that stays `true` for a natively-hidden unit. `null` = no callback arrived. |
| `io_v1_ratio`            | Float \| null | `intersectionRatio`.                                                                                                                                                      |
| `io_v1_root_bounds_null` | Bool \| null  | `rootBounds === null` — the browser nulls it when the IO root is cross-origin. `true` here means we are **not** the top document (see `is_top_window`).                   |

### IO v2 — `trackVisibility` (the prime candidate)

| Key                | Type          | Notes                                                                                                                                                                                                                                     |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `io_v2_supported`  | Bool          | Whether this runtime exposes `IntersectionObserverEntry.isVisible`. **Group by this first** — `false` means the whole IO v2 column is uninformative for that segment, not "hidden".                                                       |
| `io_v2_is_visible` | Bool \| null  | The browser's guaranteed-painted verdict (occlusion, zero opacity, non-composited frames all force `false`). `io_v1_intersecting=true` **AND** `io_v2_is_visible=false` is the drop-in fix signature. `null` = unsupported / no callback. |
| `io_v2_ratio`      | Float \| null | `intersectionRatio` from the v2 observer.                                                                                                                                                                                                 |

### rAF liveness — "is the surface being composited"

| Key                  | Type        | Notes                                                                                                                                                                       |
| -------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `raf_supported`      | Bool        | Whether `requestAnimationFrame` exists.                                                                                                                                     |
| `raf_frames`         | Int         | Frames observed during the window. Near-zero ⇒ surface likely not drawn.                                                                                                    |
| `raf_window_ms`      | Int         | Actual window length the count was measured over (~500 default). Divide by this, not the nominal window.                                                                    |
| `raf_fps`            | Float       | `raf_frames / raf_window_ms`. **`≈ 0` while playing is the strongest "not drawn" proxy** and works even where IO v2 is unsupported. A healthy foreground surface is ~30–60. |
| `raf_first_frame_ms` | Int \| null | Ms to the first frame; `null` if no frame ever fired (a hard stall).                                                                                                        |

### Page Visibility — preload / background

| Key                         | Type         | Notes                                                                                                                                       |
| --------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `document_visibility_state` | String       | `visible` / `hidden` / `prerender`. `hidden`/`prerender` ⇒ WebView backgrounded or preloading — the cheapest possible fix if it correlates. |
| `document_hidden`           | Bool         | `document.hidden`.                                                                                                                          |
| `document_has_focus`        | Bool         | `document.hasFocus()`.                                                                                                                      |
| `document_prerendering`     | Bool \| null | Speculation-Rules prerender; `null` where the API is absent.                                                                                |

### MRAID / OMID — the native ad SDK's own verdict

Authoritative **when present** — it is the only signal computed with knowledge of real native
geometry. Often absent (our unit is a MAX mediation demand source, not always an MRAID container).

| Key                    | Type           | Notes                                                                                                    |
| ---------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `mraid_present`        | Bool           | `window.mraid` exists. **Group by this** — the four fields below are only meaningful where it is `true`. |
| `mraid_state`          | String \| null | `mraid.getState()`.                                                                                      |
| `mraid_is_viewable`    | Bool \| null   | `mraid.isViewable()` — prefer this over every DOM signal when `mraid_present`.                           |
| `mraid_exposure`       | Float \| null  | MRAID 3 exposure percentage; `null` if absent.                                                           |
| `mraid_placement_type` | String \| null | `mraid.getPlacementType()`.                                                                              |
| `omid_present`         | Bool           | An OMID (Open Measurement) service is present.                                                           |

### Geometry / CSS

| Key                         | Type   | Notes                                                                                                                                  |
| --------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `rect_x`, `rect_y`          | Float  | `getBoundingClientRect` position. Large negative / off-screen values = pushed out of view.                                             |
| `rect_width`, `rect_height` | Float  | Rect size. `0` = zero-sized element.                                                                                                   |
| `computed_display`          | String | `display`; `none` = removed from layout.                                                                                               |
| `computed_visibility`       | String | CSS `visibility`; the **other** half of today's `unit_visible`.                                                                        |
| `computed_opacity`          | Float  | `0` = invisible but still laid out.                                                                                                    |
| `in_viewport`               | Bool   | Rect overlaps the inner viewport with positive area. A DOM-only check — `true` for the native-hidden case, which is the whole problem. |

### Viewport / device

| Key                                             | Type          | Notes                                                                   |
| ----------------------------------------------- | ------------- | ----------------------------------------------------------------------- |
| `viewport_inner_width`, `viewport_inner_height` | Float         | `window.inner*`. Tiny values (0/1px) betray a native-collapsed WebView. |
| `visual_viewport_width/height/scale`            | Float \| null | `window.visualViewport`; `null` where unsupported.                      |
| `screen_width`, `screen_height`                 | Float         | `screen.*`.                                                             |
| `device_pixel_ratio`                            | Float         | `window.devicePixelRatio`.                                              |

### Frame context

| Key             | Type | Notes                                                                                                                                                                                                            |
| --------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `is_top_window` | Bool | `window.top === window.self`, or `false` if the read is cross-origin. In the confirmed repro we are the **top document** of the WebView (so IO's root _is_ the WebView viewport — which is why IO v1 is fooled). |
| `is_webview`    | Bool | Best-effort WebView detection — the reported hiding is WebView-specific.                                                                                                                                         |

### Caller-merged context (shared with the audio beacon)

| Key                      | Type | Notes                                                                                                                                                                                                                                   |
| ------------------------ | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wants_audible_ad_start` | Bool | Always `true` on this beacon — it fires for the audible-start path, in parity with the audio beacon.                                                                                                                                    |
| `forced_fill`            | Bool | **Synthetic impression from a debug test handset.** Here it is a _feature_, not just noise: `forced_fill = true` isolates the device-targeted reproduction. **See the trap below** — you filter it the opposite way from the audio doc. |

---

## Traps

All eight traps in [ANALYTICS_QUERYING.md → Traps](ANALYTICS_QUERYING.md#traps) apply unchanged
(count visits not events; a missing key is `false`/`''`/`0`; group by `build_id` for a recently-added
field; warehouse lag; small samples lie; JSON extraction is a full scan; verify Bools once). Two are
specific to this beacon.

### V1. `forced_fill` is your friend here, not something to exclude

This is the **opposite** of the audio doc's trap 8. There, `forced_fill` impressions bias the
audibility _rate_ and must be filtered out. Here, the whole investigation started from a
device-targeted reproduction, so:

- **To study the known-hidden reproduction**, filter _in_: `AND event_details_forced_fill`. This
  isolates the test handset on the 320×480 L5 tag
  ([`6a6892e52ca77d200369fb9e`](../src/strategies/strategyConfig.ts)) where the audible-but-invisible
  symptom was confirmed on-device.
- **To measure the field prevalence** across real traffic (how often does IO v2 disagree with IO v1
  in the wild), filter it _out_, exactly like the audio rate: `AND NOT event_details_forced_fill`.

(Schema B: `JSONExtractBool(data,'event_details_forced_fill')`.) Decide which question you are
answering before you write the `WHERE`. The debug handset is a ground-truth probe, not a sample of the
population.

### V2. A `null` signal is not a "visible" signal — split "unsupported" from "hidden"

Every candidate field reads `false`/`0` when the API was unsupported or no callback arrived. For this
beacon that ambiguity is dangerous in a specific way: `io_v2_is_visible = false` can mean **either**
"the browser says it is not painted" (the finding you want) **or** "IO v2 is unsupported here" (no
information). Always gate on the support flag:

```sql
-- IO v2 disagreement, restricted to runtimes that actually support IO v2
select
  event_details_io_v1_intersecting  as io_v1,
  event_details_io_v2_is_visible    as io_v2_visible,
  count(*)                          as events,
  uniqExact(event_details_visit_id) as visits
from rudder_logs.visibility_diagnostic
where date(timestamp) >= today() - 1
  and event_details_io_v2_supported          -- <-- gate
group by 1, 2
order by events desc;
```

Same discipline for `raf_fps` (gate on `raf_supported`), the MRAID fields (gate on `mraid_present`),
and `document_prerendering` (confirm the column is populated before trusting `false`). This is the
`io_v2_supported = 0` iOS lesson from the field: a `false` there is "can't tell", not "hidden".

---

## Recipes

### Which signal flips to "hidden" against the known-hidden reproduction

The headline query — run against the device-targeted test handset, where we _know_ the unit is
hidden, to see which signal correctly reports it.

```sql
select
  event_details_io_v1_intersecting        as io_v1_intersecting,   -- expect true (the bug)
  event_details_io_v2_supported           as io_v2_supported,
  event_details_io_v2_is_visible          as io_v2_is_visible,      -- candidate fix
  round(event_details_raf_fps, 1)         as raf_fps,               -- candidate fix
  event_details_document_visibility_state as visibility_state,
  event_details_mraid_present             as mraid_present,
  event_details_mraid_is_viewable         as mraid_is_viewable,     -- authoritative if present
  count(*)                                as events,
  uniqExact(event_details_visit_id)       as visits
from rudder_logs.visibility_diagnostic
where date(timestamp) >= today() - 1
  and event_details_forced_fill       -- <-- the reproduction only
group by 1, 2, 3, 4, 5, 6, 7
order by events desc;
```

Read it against the [decision tree in the plan doc](VISIBILITY_DIAGNOSTIC_PLAN.md#reading-the-data--decision-tree):
`io_v2_is_visible=false` while `io_v1_intersecting=true` → adopt IO v2; `raf_fps≈0` → surface not
drawn; `mraid_is_viewable=false` → prefer the native verdict; all read "visible" → the hiding is
below anything JS can observe and the fix is a partner ask.

### IO v2 vs IO v1 disagreement rate across real traffic

How often would switching `unit_visible` to IO v2 change the verdict, on genuine (non-forced) fills.

```sql
select
  device_details_os_type            as os_type,
  device_details_app_bundle         as app_bundle,
  count(*)                          as events,
  uniqExact(event_details_visit_id) as visits,
  countIf(event_details_io_v1_intersecting
          and not event_details_io_v2_is_visible)                        as v1_yes_v2_no,
  round(100.0 * countIf(event_details_io_v1_intersecting
          and not event_details_io_v2_is_visible) / count(*), 1)         as disagree_pct
from rudder_logs.visibility_diagnostic
where date(timestamp) between '2026-08-05' and '2026-08-07'
  and event_details_io_v2_supported     -- only where IO v2 can answer
  and not event_details_forced_fill     -- population, not the probe
group by 1, 2
order by events desc;
```

This is the exact query whose fleet output is analysed in
[VISIBILITY_DIAGNOSTIC_FINDINGS.md §5](VISIBILITY_DIAGNOSTIC_FINDINGS.md). **Note the iOS lesson**: iOS
rows have `io_v2_supported = 0`, so they are excluded by the gate — for iOS you must read geometry
(next recipe), not this disagreement rate.

### rAF liveness distribution (composited vs not)

```sql
select
  device_details_os_type as os_type,
  multiIf(
    event_details_raf_fps < 1,  '0-1 fps (not drawn)',
    event_details_raf_fps < 15, '1-15 fps (throttled)',
                                '15+ fps (live)') as raf_bucket,
  count(*)                          as events,
  uniqExact(event_details_visit_id) as visits
from rudder_logs.visibility_diagnostic
where date(timestamp) >= today() - 1
  and event_details_raf_supported
group by 1, 2
order by 1, 2;
```

### Geometry sanity — the iOS signal (and the native-hide confirmation)

On iOS this is the ONLY signal (IO v2 absent). The shipped `trulyVisible` rule is
**area-majority**: hidden ⇔ less than half the rect area is inside the viewport, OR the inner viewport
is zero. Reproduce that rule rather than the cruder `rect_x < 0` proxy:

```sql
select
  device_details_os_type as os_type,
  countIf(event_details_viewport_inner_width = 0
          or event_details_viewport_inner_height = 0)                       as zero_inner_vp,
  -- area-majority off-screen: visible fraction of the rect <= 0.5
  countIf(
    (greatest(0, least(event_details_rect_x + event_details_rect_width,  event_details_viewport_inner_width)
                 - greatest(event_details_rect_x, 0))
     * greatest(0, least(event_details_rect_y + event_details_rect_height, event_details_viewport_inner_height)
                 - greatest(event_details_rect_y, 0)))
    / nullIf(event_details_rect_width * event_details_rect_height, 0) <= 0.5
  )                                                                          as area_majority_offscreen,
  count(*)                          as events,
  uniqExact(event_details_visit_id) as visits
from rudder_logs.visibility_diagnostic
where date(timestamp) >= today() - 1
  and device_details_os_type = 'ios'
  and not event_details_forced_fill
group by 1
order by events desc;
```

DOM signals (`computed_display`/`visibility`/`opacity`, `in_viewport`) read "healthy" even when the
unit is natively hidden — that is the whole bug — so do **not** use them as the verdict; the rect +
inner-viewport combination above is what discriminates.

### Inspect one raw event

Best first move on this event type — shows every field present in the current build.

```sql
-- schema A: every field is a column
select * from rudder_logs.visibility_diagnostic
where date(timestamp) >= today() order by timestamp desc limit 1 format Vertical;
-- schema B: select data from temp_adreels_logs
--   where event = 'visibility_diagnostic' and _timestamp >= now() - interval 1 hour
--   limit 1 format Vertical;
```

---

## Correlating with the audio beacon

Both beacons fire from the same `slot` on the same fill with the **same `visit_id` and
`forced_fill`**, so you can join audio audibility to visibility per impression:

```sql
select
  a.os_type,
  a.element_muted,
  v.io_v2_is_visible,
  count(*) as impressions
from
  (select event_details_visit_id   as visit_id,
          device_details_os_type   as os_type,
          event_details_element_muted as element_muted
   from rudder_logs.audio_diagnostic
   where date(timestamp) >= today() - 1) a
inner join
  (select event_details_visit_id   as visit_id,
          event_details_io_v2_is_visible as io_v2_is_visible
   from rudder_logs.visibility_diagnostic
   where date(timestamp) >= today() - 1
     and event_details_io_v2_supported) v
  on a.visit_id = v.visit_id
group by 1, 2, 3
order by impressions desc;
```

The cell that matters: **audible (`element_muted=false`) AND not visible
(`io_v2_is_visible=false`)** — the audible-but-invisible impression the whole investigation is about.
Once `unit_truly_visible` is deployed, join on it directly instead of `io_v2_is_visible` — it already
folds in the geometry fallback, so it covers iOS too.

---

## See also

- [VISIBILITY_DIAGNOSTIC_PLAN.md](VISIBILITY_DIAGNOSTIC_PLAN.md) — why the beacon exists, the field families, and the decision tree for picking the fix
- [ANALYTICS_QUERYING.md](ANALYTICS_QUERYING.md) — the audio beacon; the shared schema, traps, and querying mechanics live there
- [`src/monitoring/visibilityDiagnostic.ts`](../src/monitoring/visibilityDiagnostic.ts) — the sampler; `VisibilityDiagnosticSnapshot` is the source of truth for field names
- [`src/analytics/analytics.ts`](../src/analytics/analytics.ts) — `EVENT` vocabulary (**a partner contract**: append only, never rename)
- [STRATEGIES.md → Debug-device feeds](STRATEGIES.md#debug-device-feeds-temporary-diagnostic) — what `forced_fill` marks and why the test handsets are device-targeted
