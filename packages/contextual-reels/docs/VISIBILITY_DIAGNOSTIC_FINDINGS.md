# Visibility diagnostic — findings log

> Running record of what the `VISIBILITY_DIAGNOSTIC` beacon has established in the field. Companion
> to [VISIBILITY_DIAGNOSTIC_PLAN.md](VISIBILITY_DIAGNOSTIC_PLAN.md) (why the beacon exists + the
> decision tree) and [VISIBILITY_DIAGNOSTIC_QUERYING.md](VISIBILITY_DIAGNOSTIC_QUERYING.md) (how to
> pull the data). Read those first. This file records **conclusions and the evidence for them** — not
> how to query.

Same discipline as [AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md): every claim carries
its sample size and provenance, and a claim that later proves wrong is struck through, not deleted,
with the reason.

---

## Status at a glance

| Question                                                     | Verdict                                                 | Confidence               |
| ------------------------------------------------------------ | ------------------------------------------------------- | ------------------------ |
| Does the beacon emit end-to-end in a real WebView?           | **Yes** — confirmed on-device                           | High                     |
| Is the audible-but-invisible unit reproducible in the field? | **Yes** — captured on `com.wood.block.sudoku.puzzle.bm` | High (1 session)         |
| Which signal correctly reports "hidden" where IO v1 fails?   | **IO v2 `isVisible`** on Android; **geometry** on iOS   | High (fleet data, below) |
| Is rAF liveness a usable signal?                             | **No** — stays healthy while hidden                     | Medium                   |
| Is MRAID available to lean on?                               | **No** — absent on the repro                            | Low (1 app)              |
| Is IO v2 available on iOS?                                   | **No** — `io_v2_supported = 0` across ALL iOS traffic   | High (fleet data)        |
| Prevalence — how often IO v1 and IO v2 disagree on Android?  | **Large, per-app: 11%→99%**                             | High (fleet data)        |

---

## Established

### 1. The beacon works end-to-end (build `CdRpoxj5.4e7a3c03e`)

First field capture, 2026-08-07. Every `Visibility Diagnostic` event arrived with the full snapshot,
correct `user_details.ifa`/`deviceid`, a `visit_id` that pairs 1:1 with the `Audio Diagnostic` from
the same fill, and no partial/`null`-storm payloads. The one open verification gap flagged on PR #505
("not yet eyeballed live") is closed.

### 2. The audible-but-invisible native hide reproduces — and IO v2 catches it

**Sample**: 4 `Visibility Diagnostic` + 5 `Audio Diagnostic` events, one session, Android 17 / Pixel
9a WebView, app `com.wood.block.sudoku.puzzle.bm` (store name "Block Crush: Block Blast Fun"),
embedding origin `mraid.bigo.sg`, brand `betmgm` (Triton fill). Device is the registered Android
debug handset (`d92f58dd-…`).

Every visibility snapshot showed the **identical** signature:

| Signal                                                          | Value                    | Reading                                                                            |
| --------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `io_v1_intersecting`                                            | `true`                   | today's `unit_visible` → **visible** (the bug)                                     |
| `unit_visible`                                                  | `true`                   | we count it visible                                                                |
| `computed_display` / `computed_visibility` / `computed_opacity` | `flex` / `visible` / `1` | DOM says healthy                                                                   |
| `in_viewport`                                                   | `true`                   | DOM geometry says on-screen                                                        |
| **`io_v2_is_visible`**                                          | **`false`**              | **browser: not actually painted**                                                  |
| `io_v2_supported`                                               | `true`                   | IO v2 is available to answer                                                       |
| `rect_x` / `rect_y`                                             | `-160` / `-240`          | 320×480 box centered on (0,0) — pushed into the top-left corner, mostly off-screen |
| `viewport_inner_width` / `viewport_inner_height`                | `0` / `0`                | WebView laid out at zero inner size                                                |
| `visual_viewport_scale`                                         | `0.25`                   | collapsed/zoomed-out viewport                                                      |
| `raf_fps`                                                       | 42–63                    | surface **is** compositing                                                         |

The paired audio beacons showed `element_muted: false`, `element_volume: 0.4`, `time_advancing:
true`, `has_audio_track: true` — **audibly playing** the whole time.

**Conclusion**: the unit was audibly playing while the host had it collapsed off-screen at the native
/ viewport layer. IO v1 (and every DOM-only signal: display, visibility, opacity, `in_viewport`) read
"visible". **IO v2 `isVisible` was the one signal that correctly read `false`**, matching the plan's
top decision-tree branch — `io_v2_is_visible: false` while `io_v1_intersecting: true` → adopt IO v2.

### 3. rAF liveness is NOT the discriminator here

`raf_fps` was healthy (42–63) on every hidden snapshot. The compositor keeps drawing the surface even
while it is positioned off-screen at zero inner-viewport, so a live frame count does **not** imply
on-screen. rAF may still catch a _backgrounded_ WebView (a different hide mode), but it does not catch
this one. Good that the beacon captured it — it rules the signal out for this failure mode rather than
leaving it a guess.

### 4. MRAID is unavailable on this repro

`mraid_present: false` despite the `mraid.bigo.sg` origin and `omid_present: true`. The "prefer the
native SDK's own `isViewable`" branch of the decision tree is not usable here — our unit is a MAX
mediation demand source, not an MRAID container in this integration. Any fix cannot depend on MRAID.

### 5. Fleet prevalence (2026-08-07, non-`forced_fill`) — the disagreement is large, and split by OS

First fleet-wide run of the IO-v1-vs-IO-v2 disagreement query, aggregated by OS / app /
`io_v2_supported` (raw head:
[`field-data/2026-08-07-io-v2-disagreement-rate.md`](field-data/2026-08-07-io-v2-disagreement-rate.md)).

> **Provenance.** This data is from the **live build (`CdRpoxj5.4e7a3c03e`) — the beacon only.** The
> `trulyVisible` consolidated verdict and its geometry rule are NOT deployed yet, so these are clean,
> unbiased observations of the raw beacon fields, not measurements of this branch's code. That makes
> them the right basis for shipping `trulyVisible` (it consumes exactly these fields) — but note the
> exact geometry THRESHOLD it uses (area-majority) has not itself been measured against live data; the
> `offscreen_rect` column below uses a cruder `rect < 0` proxy. Re-measure with the shipped rule once
> `unit_truly_visible` deploys.

Two findings, both high-confidence at these volumes:

**Android — IO v2 is supported and disagrees heavily with IO v1.** On the high-volume Android rows the
`v1_yes_v2_no` share (`io_v1_intersecting AND NOT io_v2_is_visible`) runs from ~11% to ~99%, per app:

| app                              | events | disagree_pct |
| -------------------------------- | -----: | -----------: |
| com.Beauchamp.Messenger.external |  4,852 |        46.6% |
| com.scatterlab.messenger         |  3,005 |        48.2% |
| net.uploss.water_app             |  1,965 |    **98.7%** |
| droom.sleepIfUCan                |  1,559 |        92.5% |
| net.uploss.affirmation           |  1,257 |    **98.8%** |
| com.animax.max                   |  1,093 |        95.8% |

The per-app spread (with tag/creative held constant) points at per-app WebView / mediation config as
the driver — the same shape the audio investigation found. IO v2 is the signal on Android.

**iOS — IO v2 is NOT available at all.** Every iOS row has `io_v2_supported = 0`, so `v1_yes_v2_no`
and `disagree_pct` are structurally `0` there — that is "IO v2 can't answer on iOS", NOT "iOS units
are visible". On iOS the consolidated verdict falls **entirely** to the geometry fallback, and the
corroborators show it is needed: e.g. iOS `1544750895` — 8,330 events, 7,176 `zero_inner_vp`, 8,325
`offscreen_rect`; iOS `6504324020` — 2,659 events, 2,658 `offscreen_rect`. Other iOS apps
(e.g. `281940292`, 14,665 events / 87 offscreen) are genuinely healthy, so the fallback discriminates
rather than blanket-hiding.

> **Caveat on the `offscreen_rect` column.** The query's `rect_x < 0 OR rect_y < 0` over-counts — a
> unit scrolled 1px up the page trips it while fully visible. `useInView`'s shipped rule is stricter
> (less than half the rect area on-screen), so the true iOS hidden rate is **below** what
> `offscreen_rect` suggests. Treat that column as a rough corroborator, not the verdict. A follow-up
> query should reproduce the area-majority rule to get the real iOS rate.

---

## Corroborating geometry (a fallback signal)

Independent of IO v2, two geometry fields flip cleanly on the repro:

- `rect_x/rect_y = -160/-240` — the element's own box is positioned so its centre sits at the
  viewport origin, i.e. three-quarters off-screen. A center-point-in-viewport test would read hidden.
- `viewport_inner_width/height = 0` — a zero inner viewport is not a state a genuinely-visible unit
  is ever in.

These matter because **IO v2 is not universally supported** (`io_v2_supported` can be `false` on
older WebViews). Where IO v2 can't answer, a geometry heuristic (center off-screen OR zero inner
viewport) is the fallback. Do not rely on `computed_*` or `in_viewport` — all four read "healthy" on
the repro.

---

## Answered by the fleet run

- **✅ Prevalence** — large and per-app on Android (11%→99% disagreement); see §5.
- **✅ IO v2 support coverage** — Android: supported. **iOS: not supported at all** — the geometry
  fallback is load-bearing there, not a rare edge case. This is why the fallback shipped in step 1
  rather than being deferred.

## Still not established (do not over-read the data)

- **False-positive risk (the gating blocker).** Does IO v2 report `isVisible: false` for a unit that
  is genuinely on-screen and painted — mid-scroll, brief occlusion, a compositor hiccup? A transient
  `false` that flips back within the ~500ms window would wrongly passback a good impression **if wired
  to the revenue gate**. The 46–48% rows (Beauchamp, scatterlab) are as consistent with "this app
  hides half its impressions" as with "IO v2 twitches mid-scroll"; the ~99% rows are almost certainly
  real hiding, but the mid-range needs a per-`visit_id` look at whether `io_v2_is_visible` is stable
  or flickering before the gate can trust it. **This is why step 1 is measurement-only.**
- **True iOS hidden rate.** The `offscreen_rect` corroborator over-counts (see §5 caveat). Re-run the
  iOS rate with the shipped area-majority rule (`< 50%` of rect area on-screen) to get the real number.
- **Audible-AND-hidden size.** Join `visit_id` to `audio_diagnostic` (`element_muted = false`) to size
  the revenue-relevant cell specifically — an ad that is both playing sound and not visible.

---

## Fix — step 1 shipped (measurement-only)

Per [the plan](VISIBILITY_DIAGNOSTIC_PLAN.md#intended-fix-not-in-this-change):

1. **✅ Consolidated verdict added to [`useInView.ts`](../src/monitoring/useInView.ts)** — a new
   `trulyVisible` output folds today's IO v1 reading together with `entry.isVisible` (IO v2, where
   supported) and a geometry fallback (rect area-majority on-screen + non-zero inner viewport) where
   v2 is unavailable or its observer fails to construct. Stamped as **`unit_truly_visible`** ALONGSIDE
   `unit_visible` in [`useFeedVisibilityGate.ts`](../src/app/useFeedVisibilityGate.ts) — the revenue
   gate still reads the IO-v1-based `isVisible`; this is measurement-only, and it fails open (`true`)
   exactly as `isVisible` does whenever no observer could attach. This exists so the field can compare
   the consolidated verdict against today's definition before anything revenue-touching changes.
2. **(later) Flip the gate to the consolidated verdict** once the prevalence + false-positive data
   below confirm it, and **consider gating audible autoplay** for the L1/L5 full-player path on real
   viewability so a preloaded/collapsed unit doesn't play audio before it is shown.

Sequencing: ship step 1 (gate still off), watch `unit_truly_visible` vs `unit_visible` diverge in the
field, _then_ enable the revenue gate per tag.

### What to query next

The fleet disagreement rate (§5) is done. Before flipping the gate, resolve the false-positive risk:

1. **Flicker check** — for a sample of Android `visit_id`s with `io_v1_intersecting = true AND
io_v2_is_visible = false`, is that verdict stable across the impression or does it flip back? A
   stable `false` = real hide; a flicker = a mid-scroll/occlusion false negative the gate must not act
   on. (Needs per-`visit_id` sequencing, or a repeat-beacon look at `io_v2_ratio`.)
2. **True iOS rate** — reproduce the shipped area-majority geometry rule (not `rect < 0`) to get the
   real iOS hidden rate.
3. **Audible-AND-hidden** — join `visit_id` to `audio_diagnostic` (`element_muted = false`) for the
   revenue-relevant cell. Once `unit_truly_visible` is deployed, the direct compare is
   `unit_visible = true AND unit_truly_visible = false`.

---

## Change log

- **2026-08-07** — first field data (build `CdRpoxj5.4e7a3c03e`). Beacon confirmed working;
  audible-but-invisible repro captured on `com.wood.block.sudoku.puzzle.bm`; IO v2 identified as the
  discriminating signal, rAF ruled out, MRAID absent. Raw sample:
  [`field-data/2026-08-07-visibility-diagnostic-sample.json`](field-data/2026-08-07-visibility-diagnostic-sample.json).
- **2026-08-07 (later, same day)** — first FLEET run of the disagreement query (§5). Prevalence
  answered: Android IO-v1-vs-IO-v2 disagreement is large and per-app (11%→99%); **iOS exposes no IO v2
  at all**, so the geometry fallback is load-bearing there. Remaining gating blocker: IO v2
  false-positive / flicker risk before the verdict is wired to the revenue gate.

---

## See also

- [VISIBILITY_DIAGNOSTIC_PLAN.md](VISIBILITY_DIAGNOSTIC_PLAN.md) — design + decision tree
- [VISIBILITY_DIAGNOSTIC_QUERYING.md](VISIBILITY_DIAGNOSTIC_QUERYING.md) — field reference + query recipes
- [AUDIO_DIAGNOSTIC_FINDINGS.md](AUDIO_DIAGNOSTIC_FINDINGS.md) — the sibling investigation this format follows
- [`src/monitoring/useInView.ts`](../src/monitoring/useInView.ts) — where the fix lands
