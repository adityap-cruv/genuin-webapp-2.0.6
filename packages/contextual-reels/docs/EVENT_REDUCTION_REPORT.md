# Event Reduction Report — `6a39163e92929ebec64d78ab` (320×50 ads-only)

Impact of the per-tag `suppressedEvents` policy
(`ADS_ONLY_INTERSTITIAL_SUPPRESSED`) on this tag's analytics volume.

**Metric:** events emitted on **one happy-path impression** — a normal load where
the SDK boots, the ad fills, and the user unmutes. This counts events that
actually fire, not the whole vocabulary. Failure paths (no-fill, render error,
HAI) and pure-interaction events (clicks, re-toggles) are excluded from the
headline because they don't occur on every impression.

> **Why the video events are NOT in the "before" count.** This tag's feed entries
> are `type: "ads"` → normalise to `kind: "ad"` → render via **`AdLayout`**
> (`GenAdSlot` + `AdControlLayer`), which **never mounts `LightPlayer`**. The
> player-event pipeline (`Video Loaded`, `Video Started`, quartiles,
> `Video Complete`, …) is only wired by `VideoLayout`, used for `video` /
> `video-with-ad` kinds. So on an ads-only tag those events **never fire on any
> path** — suppressing them removes nothing here; it's defense-in-depth (and lets
> the sibling ads-only tags reuse the same list). They are counted as
> _never-fires_, not as a reduction.
>
> **Counting note.** Events are counted **once per load**. None of the actually-
> firing suppressed events are per-tick, so the reduction is a flat per-load
> count, not multiplied volume.

---

## Headline

|                             | Events / happy-path load |
| --------------------------- | ------------------------ |
| **Before** (no suppression) | **14**                   |
| **After** (current config)  | **12**                   |
| **Reduction**               | **2 events → 14.3%**     |

The real per-load reduction is modest because this tag never went down the
video path in the first place — the large-looking video-event list was already
structurally absent. The suppression that removes actually-emitted events is the
two static-feed lifecycle events.

---

## Before — 14 events (per happy-path load)

| Phase            | Events                                                                                      | Count  |
| ---------------- | ------------------------------------------------------------------------------------------- | ------ |
| Boot             | `Tag Init`, `Tag Captured`                                                                  | 2      |
| Feed             | `Batch Started`, `Feed API Call Completed`                                                  | 2      |
| Ad request/fill  | `Ad Requested`, `Ad Response Received`, `Ad Rendered`, `Ad Impression`, `Ad Started`        | 5      |
| Unmute + playout | `Unmuted`, `Visibility Diagnostic`, `Audio Diagnostic`, `Ad Media Quartile`, `Ad Completed` | 5      |
| **Total**        |                                                                                             | **14** |

**Never fired even before suppression** (`kind: "ad"` → `AdLayout`, no player):
`Video Loaded`, `Video Started`, `Video Play Started`, `Video Watch`,
`Video First Quartile`, `Midpoint`, `Video Third Quartile`, `Video Complete`,
`Video Play`, `Video Paused`, `Video Play Interrupted`. These are structural
non-events, not part of the "before" count.

Also excluded (don't fire on a normal single-fixture impression): `Batch
Completed` (needs a 2nd batch), `Feed Completed` / `Tag Displayed` (empty-feed
branch only), `Infolinks Impression` (host-triggered).

---

## After — 12 events (per happy-path load)

Suppressed events that were **actually firing** (**2**):

| Suppressed on the happy path | Why                                    |
| ---------------------------- | -------------------------------------- |
| `Batch Started`              | static fixture — no `/feed` round-trip |
| `Feed API Call Completed`    | static fixture — no `/feed` round-trip |

The other 23 names on the list are either structural non-events on this tag (the
video layer, above) or events that only fire on interaction / failure paths not
part of a happy-path impression.

Remaining **12** that still fire:

| Phase            | Events                                                                                      | Count  |
| ---------------- | ------------------------------------------------------------------------------------------- | ------ |
| Boot             | `Tag Init`, `Tag Captured`                                                                  | 2      |
| Feed             | —                                                                                           | 0      |
| Ad request/fill  | `Ad Requested`, `Ad Response Received`, `Ad Rendered`, `Ad Impression`, `Ad Started`        | 5      |
| Unmute + playout | `Unmuted`, `Visibility Diagnostic`, `Audio Diagnostic`, `Ad Media Quartile`, `Ad Completed` | 5      |
| **Total**        |                                                                                             | **12** |

**Net: 14 → 12 = 2 fewer events per impression = 14.3% reduction.**

If the two temporary diagnostics (`Audio Diagnostic`, `Visibility Diagnostic`)
are rolled off once their investigation closes, the same load drops to **10
events — a 28.6% reduction** vs. the original 14.

---

## What the suppression list still buys us (beyond the 2 events)

The list is 25 names but only 2 remove actually-emitted events on this tag today.
The rest earn their place as:

- **Defense-in-depth** — if a future config change ever routed this tag through
  `VideoLayout` (e.g. a mixed feed), the video events would be pre-suppressed
  rather than silently doubling the ad funnel.
- **Sibling reuse** — the shared `ADS_ONLY_INTERSTITIAL_SUPPRESSED` list is meant
  to attach to the 300×250 / 320×100 / 320×480 ads-only tags without drift; some
  of those may take the video path.
- **Interaction/nav noise** — `Scroll` / `Swipe *` / `Embed *` / CTA·share·spark
  don't fire on a clean impression but would on stray interaction; suppressing
  them caps the ceiling.

---

## Context — full vocabulary partition (all scenarios)

Of the tag's total event vocabulary, **25 event names are on the suppression
list**. See
[STRATEGIES.md → Event surface](STRATEGIES.md#event-surface-for-the-320×50-ads-only-tag-6a39163e92929ebec64d78ab)
for the kept / suppressed / never-fires partition and the per-scenario
chronology.

## Scope of the reduction

- **Analytics (Rudderstack) only.** Host-embed pixels (`px-lo`, `px-ti`,
  passback) are a separate layer and are unchanged.
- **Happy path only for the headline.** Every failure path (`Ad Request Failed`,
  `Ad Passback`, `Ad Render Failed`, `Ad Error`, `Ad Removed`) is fully preserved
  — suppression never touches an error branch.
- **Per-impression.** At 5000 loads/s the analytics-event rate for this tag drops
  proportionally (≈14 → ≈12 events per load × load rate).
