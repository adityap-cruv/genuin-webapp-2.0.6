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

## The 30-second version

```sql
select
  JSONExtractString(data, 'device_details_os_type')                as os_type,
  JSONExtractBool(data,   'event_details_io_v1_intersecting')       as io_v1_intersecting,
  JSONExtractBool(data,   'event_details_io_v2_is_visible')         as io_v2_is_visible,
  round(JSONExtractFloat(data, 'event_details_raf_fps'), 1)         as raf_fps,
  count(*)                                                        as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id'))      as visits
from temp_adreels_logs
where _timestamp >= now() - interval 6 hour
  and event = 'visibility_diagnostic'
group by 1, 2, 3, 4
order by events desc;
```

The four schema facts that will each cost you a failed query are **identical to the audio doc** and
not repeated here — table is `temp_adreels_logs`, everything is one JSON blob in `data`, keys are
underscore-flattened, `event` is snake_case. Two that are specific to this beacon:

1. **The event name is `visibility_diagnostic`** (SDK sends `"Visibility Diagnostic"`).
2. **The interesting fields are Bools and Floats, not just Bools** — `raf_fps`, `io_v1_ratio`,
   `computed_opacity`, and all the geometry/viewport fields need `JSONExtractFloat`, not
   `JSONExtractBool`.

---

## Schema

Same columns (`event`, `_timestamp`, `data`), same underscore-flattening, same event-name transform
as the audio beacon — see [ANALYTICS_QUERYING.md → Schema](ANALYTICS_QUERYING.md#schema). The
snapshot lands under `event_details_*`; the analytics layer stamps the same envelope
(`build_id`, `page`, `tag_id`, `visit_id`, `device_details_*`, `user_details_*`) on this event as on
every other, so all the common-field queries in the audio doc work unchanged with `event =
'visibility_diagnostic'`.

### Event-name transform

| SDK sends                 | `event` column          |
| ------------------------- | ----------------------- |
| `"Visibility Diagnostic"` | `visibility_diagnostic` |

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

- **To study the known-hidden reproduction**, filter _in_: `AND JSONExtractBool(data,
'event_details_forced_fill')`. This isolates the test handset on the 320×480 L5 tag
  ([`6a6892e52ca77d200369fb9e`](../src/strategies/strategyConfig.ts)) where the audible-but-invisible
  symptom was confirmed on-device.
- **To measure the field prevalence** across real traffic (how often does IO v2 disagree with IO v1
  in the wild), filter it _out_, exactly like the audio rate: `AND NOT JSONExtractBool(data,
'event_details_forced_fill')`.

Decide which question you are answering before you write the `WHERE`. The debug handset is a
ground-truth probe, not a sample of the population.

### V2. A `null` signal is not a "visible" signal — split "unsupported" from "hidden"

Every candidate field is nullable and extracts as `false`/`0` when the API was unsupported or no
callback arrived (trap 2). For this beacon that ambiguity is dangerous in a specific way:
`io_v2_is_visible` extracting as `false` can mean **either** "the browser says it is not painted"
(the finding you want) **or** "IO v2 is unsupported here" (no information). Always gate on the
support flag:

```sql
-- IO v2 disagreement, restricted to runtimes that actually support IO v2
select
  JSONExtractBool(data, 'event_details_io_v1_intersecting') as io_v1,
  JSONExtractBool(data, 'event_details_io_v2_is_visible')   as io_v2_visible,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'visibility_diagnostic'
  and JSONExtractBool(data, 'event_details_io_v2_supported')          -- <-- gate
group by 1, 2
order by events desc;
```

Same discipline for `raf_fps` (gate on `raf_supported`), the MRAID fields (gate on `mraid_present`),
and `document_prerendering` (`JSONHas` it before trusting `false`).

---

## Recipes

### Which signal flips to "hidden" against the known-hidden reproduction

The headline query — run against the device-targeted test handset, where we _know_ the unit is
hidden, to see which signal correctly reports it.

```sql
select
  JSONExtractBool(data,  'event_details_io_v1_intersecting')  as io_v1_intersecting,   -- expect true (the bug)
  JSONExtractBool(data,  'event_details_io_v2_supported')     as io_v2_supported,
  JSONExtractBool(data,  'event_details_io_v2_is_visible')    as io_v2_is_visible,      -- candidate fix
  round(JSONExtractFloat(data, 'event_details_raf_fps'), 1)   as raf_fps,               -- candidate fix
  JSONExtractString(data, 'event_details_document_visibility_state') as visibility_state,
  JSONExtractBool(data,  'event_details_mraid_present')       as mraid_present,
  JSONExtractBool(data,  'event_details_mraid_is_viewable')   as mraid_is_viewable,     -- authoritative if present
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'visibility_diagnostic'
  and JSONExtractBool(data, 'event_details_forced_fill')       -- <-- the reproduction only
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
  JSONExtractString(data, 'device_details_os_type')    as os_type,
  JSONExtractString(data, 'device_details_app_bundle') as app_bundle,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits,
  countIf(
    JSONExtractBool(data, 'event_details_io_v1_intersecting')
    and not JSONExtractBool(data, 'event_details_io_v2_is_visible')
  ) as v1_yes_v2_no,
  round(100.0 * countIf(
    JSONExtractBool(data, 'event_details_io_v1_intersecting')
    and not JSONExtractBool(data, 'event_details_io_v2_is_visible')
  ) / count(*), 1) as disagree_pct
from temp_adreels_logs
where date(_timestamp) between '2026-08-05' and '2026-08-07'
  and event = 'visibility_diagnostic'
  and JSONExtractBool(data, 'event_details_io_v2_supported')     -- only where IO v2 can answer
  and not JSONExtractBool(data, 'event_details_forced_fill')     -- population, not the probe
group by 1, 2
order by events desc;
```

### rAF liveness distribution (composited vs not)

```sql
select
  JSONExtractString(data, 'device_details_os_type') as os_type,
  multiIf(
    JSONExtractFloat(data, 'event_details_raf_fps') < 1,  '0-1 fps (not drawn)',
    JSONExtractFloat(data, 'event_details_raf_fps') < 15, '1-15 fps (throttled)',
                                                          '15+ fps (live)') as raf_bucket,
  count(*) as events,
  uniqExact(JSONExtractString(data, 'event_details_visit_id')) as visits
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'visibility_diagnostic'
  and JSONExtractBool(data, 'event_details_raf_supported')
group by 1, 2
order by 1, 2;
```

### Geometry sanity — are hidden units zero-sized or off-screen

```sql
select
  round(JSONExtractFloat(data, 'event_details_rect_width'))  as w,
  round(JSONExtractFloat(data, 'event_details_rect_height')) as h,
  JSONExtractString(data, 'event_details_computed_display')    as display,
  JSONExtractString(data, 'event_details_computed_visibility') as visibility,
  round(JSONExtractFloat(data, 'event_details_computed_opacity'), 2) as opacity,
  JSONExtractBool(data, 'event_details_in_viewport') as in_viewport,
  count(*) as events
from temp_adreels_logs
where _timestamp >= now() - interval 24 hour
  and event = 'visibility_diagnostic'
  and JSONExtractBool(data, 'event_details_forced_fill')
group by 1, 2, 3, 4, 5, 6
order by events desc;
```

If these all read "healthy" (non-zero rect, `display:block`, `visibility:visible`, `opacity:1`,
`in_viewport:true`) on a unit we know is hidden, that confirms the hiding is native — no DOM geometry
signal can catch it, and the answer is IO v2 / rAF / MRAID or a partner ask.

### Inspect one raw event

Best first move on this event type — shows every key actually present in the current build.

```sql
select data from temp_adreels_logs
where event = 'visibility_diagnostic' and _timestamp >= now() - interval 1 hour
limit 1 format Vertical;
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
  (select JSONExtractString(data,'event_details_visit_id') as visit_id,
          JSONExtractString(data,'device_details_os_type') as os_type,
          JSONExtractBool(data,'event_details_element_muted') as element_muted
   from temp_adreels_logs
   where _timestamp >= now() - interval 24 hour and event = 'audio_diagnostic') a
inner join
  (select JSONExtractString(data,'event_details_visit_id') as visit_id,
          JSONExtractBool(data,'event_details_io_v2_is_visible') as io_v2_is_visible
   from temp_adreels_logs
   where _timestamp >= now() - interval 24 hour and event = 'visibility_diagnostic'
     and JSONExtractBool(data,'event_details_io_v2_supported')) v
  on a.visit_id = v.visit_id
group by 1, 2, 3
order by impressions desc;
```

The cell that matters: **audible (`element_muted=false`) AND not visible
(`io_v2_is_visible=false`)** — the audible-but-invisible impression the whole investigation is about.

---

## See also

- [VISIBILITY_DIAGNOSTIC_PLAN.md](VISIBILITY_DIAGNOSTIC_PLAN.md) — why the beacon exists, the field families, and the decision tree for picking the fix
- [ANALYTICS_QUERYING.md](ANALYTICS_QUERYING.md) — the audio beacon; the shared schema, traps, and querying mechanics live there
- [`src/monitoring/visibilityDiagnostic.ts`](../src/monitoring/visibilityDiagnostic.ts) — the sampler; `VisibilityDiagnosticSnapshot` is the source of truth for field names
- [`src/analytics/analytics.ts`](../src/analytics/analytics.ts) — `EVENT` vocabulary (**a partner contract**: append only, never rename)
- [STRATEGIES.md → Debug-device feeds](STRATEGIES.md#debug-device-feeds-temporary-diagnostic) — what `forced_fill` marks and why the test handsets are device-targeted
