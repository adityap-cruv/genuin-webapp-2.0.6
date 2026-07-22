# Ad Resource Budgets — Reference

This is the "why" behind the numbers the harness enforces. There are two layers:
a **hard enforcement boundary** the browser kills you on, and **softer design
targets** publishers certify against. Build to the targets; never cross the
boundary.

## Table of contents

1. [Layer 1 — Chrome Heavy Ad Intervention (the hard limit)](#layer-1)
2. [Layer 2 — IAB New Ad Portfolio / LEAN (the design targets)](#layer-2)
3. [Ad request frequency / refresh](#refresh)
4. [How the limits map to a JS tag in practice](#mapping)
5. [Quick budget table](#budget-table)

---

<a name="layer-1"></a>
## Layer 1 — Chrome Heavy Ad Intervention (HAI)

This is the one that actually breaks delivery. When an ad frame that the user
**has not interacted with** crosses any of the thresholds below, Chrome unloads
the frame and replaces it with a gray "Ad removed" box, then emits an
intervention report via the Reporting API (to both the ad frame and its
embedding parent).

| Limit | Threshold | Notes |
|---|---|---|
| Network | **> 4 MB** transferred | All bytes the ad frame *and its descendant iframes* download. |
| Peak CPU | **> 15 s** main-thread in any **30 s** window | Execution time of the ad's code, not wall-clock. |
| Total CPU | **> 60 s** main-thread total | Cumulative over the ad's life. |

Critical details:

- **Descendant iframes aggregate.** Every nested iframe under the ad frame
  counts against the *same* budget. An SDK that lazy-loads a player iframe plus
  a tracking iframe plus the creative pools all of their bytes and CPU together.
  This is the single easiest way to get burned when embedding an SDK into
  someone else's pipeline.
- **CPU is main-thread execution time**, measured by the browser — not elapsed
  time. A long-running animation that yields the thread is cheaper than a tight
  synchronous loop of the same duration.
- **The thresholds carry privacy noise** by default (randomized ±) so they fire
  non-deterministically near the edge. For deterministic local testing you can
  disable that via `chrome://flags/#heavy-ad-privacy-mitigations`. The harness
  does **not** rely on Chrome firing HAI — it measures raw consumption and
  asserts the thresholds itself, which is why it's reliable in headless CI.
- **Interaction clears the limit.** Once the user clicks/taps the ad, HAI stops
  applying to it. So heavy rich-media post-click is fine; the constraint is
  purely on the pre-interaction state. Budget the *initial, un-interacted* path.
- **Low-end devices fire first.** HAI's CPU limits are far more likely to trip
  on weak hardware. A tag that's clean on a CI runner can still be killed on a
  cheap Android phone. Always validate with CPU throttling (the harness exposes
  `--throttle`).

Because crossing 4 MB is a hard cliff, the harness also *warns* at a configurable
fraction of each hard limit (default 0.8 → warns at 3.2 MB / 48 s / 12 s) so a
creeping creative is flagged before it actually breaks.

---

<a name="layer-2"></a>
## Layer 2 — IAB New Ad Portfolio / LEAN (design targets)

These are what publishers spec and certify against. LEAN = **L**ight,
**E**ncrypted, **A**dChoices-supported, **N**on-invasive. The relevant
quantitative pieces:

### Load phases

File weight is bucketed by *when* it loads, split on the **publisher page's
`window.load` event**:

- **Initial load** — everything needed for first visual display, requested
  before the page's `load` event fires. This is the budget that matters most for
  page performance. Total **gzipped** size of all assets (HTML, CSS, JS, images,
  shared libs).
- **Host-initiated subload** — additional assets that may auto-load no sooner
  than **1 s after `domContentLoadedEventEnd`** (replaces the old, vaguely
  defined "polite load"). Allowed only for rich media / Rising Star units.
- **User-initiated load** — unlimited, loads only after a real user interaction
  (expansion, click). Defer everything heavy here.

### Common quantitative targets

| Metric | Typical target | Source |
|---|---|---|
| Initial load (gzipped) | **~150 KB** (up to ~200 KB depending on partner / ad size) | IAB New Ad Portfolio |
| Initial file requests | **≤ 15** | IAB New Ad Portfolio |
| Host-initiated subload file requests | **≤ 10** | IAB New Ad Portfolio |
| Max CPU per active ad | **≤ 30%** | IAB New Ad Portfolio |
| Auto-init 15 s video | **+1.1 MB** allotment | IAB New Ad Portfolio |
| Auto-init 30 s video | **+2.2 MB** allotment | IAB New Ad Portfolio |

### How k-weight scales with ad size

The portfolio sets initial load by the ad's **pixel area at 2× resolution**:
`area = width × height × 4`. A 728×90 leaderboard is `728 × 90 × 4 = 262,080`
px, which lands in the ~50–250 KB band. Larger canvases (billboard 970×250) get
more headroom (~200 KB); small units (financials) get less (~50 KB). When you add
a profile to `budgets.json`, size its `initialTransferredBytes` to the unit's
pixel group rather than reusing the 150 KB default for everything.

### Other LEAN behavioral rules worth coding to

- No auto-expansion without user initiation (expansion-on-scroll is allowed).
- Hover is not a click — no size/form change on hover.
- Audio must be user-initiated.
- Ad space must be visually distinguishable (clear borders), with a working
  close control on overlay formats.

---

<a name="refresh"></a>
## Ad request frequency / refresh

"How many ad requests is too many" splits two ways:

- **Per creative (file requests):** governed by the IAB per-phase limits above
  (≤15 initial, ≤10 host-initiated subload). The harness counts these.
- **Per slot (auto-refresh):** the well-established norm is a **≥30 s** minimum
  refresh interval, the slot must be **in view** when it refreshes, and
  refreshes per session should be capped. Google Ad Manager / AdSense policy
  enforces viewability-gated refresh and treats rapid re-requests on out-of-view
  slots as invalid traffic. This is a slot/page-integration concern rather than
  a creative-build concern, so the harness does not gate it — but it's the layer
  most likely to affect a publisher integration, so confirm the host page's
  refresh config separately.

---

<a name="mapping"></a>
## How the limits map to a JS tag in practice

When the deliverable is a JS tag (a `<script>` that injects an ad), the limits
attach to the **ad frame the tag runs in plus everything it creates**:

- The tag's own bytes (the script file) + every asset it fetches (creative
  images, video, config, beacons) → counts toward the 4 MB and the IAB initial
  load.
- Any iframe the tag injects (player, safeframe, tracker) → its bytes and CPU
  roll up into the same HAI budget.
- Synchronous work in the tag (parsing, decoding, animation setup, polling
  loops, crypto) → main-thread CPU.

Practical levers when you're over budget:

- Compress and right-size images/video; ship the smallest rendition that fits.
- Defer non-essential assets to **after** `window.load` (subload) or to
  **user-initiated** load — both are outside the initial budget.
- Collapse redundant/duplicate requests (a frequent cause of creeping over the
  4 MB or 15-request line is many small repeated fetches, not one big file).
- Avoid tight synchronous loops and excessive timers/observers; yield the main
  thread.
- Lazy-init heavy SDK features only on interaction.

---

<a name="budget-table"></a>
## Quick budget table (what the harness enforces by default)

| Check | Limit | Severity | Phase |
|---|---|---|---|
| Total transferred bytes | 4 MB | error (warn @ 0.8) | whole life |
| Total main-thread CPU | 60 s | error (warn @ 0.8) | whole life |
| Peak main-thread CPU | 15 s / 30 s window | error (warn @ 0.8) | whole life |
| Initial transferred bytes | ~150 KB (per profile) | warn | before window.load |
| Initial file requests | 15 | warn | before window.load |
| Subload file requests | 10 | warn | after window.load |
| Average CPU % | 30% | warn | observation window |

Video profiles add the 1.1 MB / 2.2 MB allotments on top of the initial budget.
