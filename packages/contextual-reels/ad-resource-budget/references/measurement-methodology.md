# Measurement Methodology

How the harness turns a loaded ad tag into the numbers it asserts, and what to
trust about each one. Read this before relaxing any limit or arguing with a
result.

## The model: an ad frame on a host page

`check-tag.mjs` starts a tiny local HTTP server that serves a **host page**
(a stand-in publisher page). The host page creates a single iframe named
`ad-under-test` and loads the tag inside it — either a local built file served
by the same server, or a remote URL. This mirrors how a real ad runs: inside a
frame on someone else's page. Everything the tag does — including iframes it
injects — happens in that frame's subtree, which is exactly the unit Chrome's
HAI measures.

Measurement is done over the **Chrome DevTools Protocol (CDP)** via Playwright,
because CDP gives the same signals DevTools shows you and matches how HAI
accounts for resources.

## Frame attribution

After load, the harness reads the frame tree (`Page.getFrameTree`) and finds the
`ad-under-test` frame, then collects every descendant frame id into an "ad
subtree" set. It also listens for `Page.frameAttached` so iframes the tag injects
*after* load are added to the set live. Network requests are attributed to the ad
subtree by the `frameId` on `Network.requestWillBeSent`. This is the key to
honoring HAI's "descendant iframes count too" rule.

## Network / transferred bytes

- Source: `Network.loadingFinished.encodedDataLength` per request, summed over the
  ad subtree. `encodedDataLength` is the **on-the-wire (transferred)** size — it
  already reflects gzip/br as the origin actually served it.
- This is what the 4 MB HAI limit and the IAB initial-load limit are really about:
  bytes the user downloads.
- **Caveat — compression:** if your origin doesn't gzip a text asset, the measured
  size is the uncompressed transfer, which is *correct* (that's what ships) but
  will read higher than the theoretical gzipped k-weight. Fix the origin, not the
  measurement.
- **Caveat — cache:** the harness uses a fresh browser context with cache disabled
  so every build measures a cold load. A warm load would undercount.

## Initial vs. subload split

- The boundary is the host page's `window.load` event, captured via
  `Page.lifecycleEvent` (name `load`) for the main frame — this matches the IAB
  definition.
- Each ad-subtree request is bucketed by its start timestamp relative to that
  load timestamp: started before → **initial**; after → **subload**.
- **Caveat:** a tag that delays its first asset until after `window.load` will
  show a tiny "initial" bucket. That's legitimate per IAB (it's deferring to
  subload), but make sure the deferral is real and not just slow.

## CPU

CPU is the metric to read with the most care.

- Source: `Performance.getMetrics` is sampled on an interval (default every 1 s).
  The harness reads cumulative `TaskDuration` (seconds of main-thread task time)
  and derives:
  - **Total CPU** = last sample − baseline (taken at navigation start).
  - **Peak CPU in a 30 s window** = the max increase in `TaskDuration` across any
    30 s sliding window of samples.
  - **Average CPU %** = total CPU seconds ÷ observation seconds × 100.
- **Caveat — whole-page, not per-frame:** `TaskDuration` is for the whole renderer
  process, not just the ad frame. On the harness page the *only* meaningful
  content is the ad, so this slightly **over-attributes** to the ad — which is
  conservative (safe) for a gate. It is a proxy, not a courtroom-grade per-frame
  figure. Use it to catch regressions and gross breaches; don't litigate
  29% vs. 31%.
- **Caveat — observation length and the peak window:** the 15 s-in-30 s HAI check
  is only meaningful if you observe for at least 30 s. Default `--observe` is
  30000 ms for that reason. `--quick` shortens it for fast local iteration and
  the peak-window assertion is skipped (and labeled as skipped) when the window
  wasn't fully observed.
- **Caveat — throttling:** `--throttle N` applies `Emulation.setCPUThrottlingRate`
  to emulate a device N× slower. This is the realistic stress test for HAI's
  CPU-*seconds* limits, since those fire first on weak hardware. But throttling
  inflates wall-clock-relative ratios, so the **average CPU %** (IAB 30%) check is
  only asserted when `--throttle` is 1; under throttling it's reported but not
  gated.

### Recommended two-pass setup

1. **Unthrottled pass** — gates bytes, requests, initial load, and average CPU %.
2. **Throttled pass (`--throttle 4`)** — gates total and peak CPU seconds against
   HAI on emulated low-end hardware.

The README's CI snippet runs both.

## What the harness does *not* measure

- It does not run HAI itself or read intervention reports — it computes the same
  quantities and asserts the documented thresholds. (Relying on Chrome to fire HAI
  is unreliable headless and is deliberately noisy near the edge.)
- It does not evaluate slot-level **refresh** behavior (≥30 s, in-view) — that's a
  page-integration concern, not a creative-build one. See the refresh section in
  `resource-budgets.md`.
- It does not judge LEAN *behavioral* rules (auto-expand, hover-expand, auto-audio,
  close button). Those need either static review or interaction tests; the harness
  is a resource gate.

## Determinism

Real ad tags vary run-to-run (ad selection, lazy loads, animation). For a stable
CI gate:

- Pin the creative/config where possible (test against a fixed creative, not a
  live rotation).
- Keep `warnAtFraction` margins so normal variance doesn't flip the build.
- If a tag is inherently variable, run N times and assert the max; a `--runs N`
  flag is provided and reports the worst-case across runs.
