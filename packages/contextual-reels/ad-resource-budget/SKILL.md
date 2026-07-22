---
name: ad-resource-budget
description: >-
  Enforce per-build resource budgets on JavaScript ad tags / native HTML ad
  creatives so they never breach Chrome's Heavy Ad Intervention limits or IAB
  New Ad Portfolio targets. Use this skill whenever the user is building,
  modifying, reviewing, or CI-gating an ad tag, ad SDK loader, VAST/VPAID
  wrapper, native ad creative, or any browser-served ad unit and wants to check
  or guarantee resource consumption (transferred bytes, network/file requests,
  main-thread CPU, initial vs. subload weight). Trigger it for phrases like
  "heavy ad", "ad too big", "4MB limit", "ad got removed / gray box", "initial
  load size", "ad budget", "k-weight", "CPU usage of the ad", or any request to
  add a build/CI check that keeps an ad creative within resource limits.
---

# Ad Resource Budget

This skill keeps a browser-served ad tag inside two sets of limits:

1. **Chrome Heavy Ad Intervention (HAI)** — the *hard* limit. If an un-interacted
   ad frame crosses any of these, Chrome unloads it and shows an "Ad removed"
   gray box. This is enforcement, not advice: 4 MB transferred, 15 s main-thread
   CPU in any 30 s window, or 60 s total main-thread CPU. All descendant iframes
   of the ad frame count toward the same limits.
2. **IAB New Ad Portfolio / LEAN** — the *target* limits publishers certify
   against: ~150 KB gzipped initial load, ≤15 initial file requests, ≤30%
   main-thread CPU, with extra weight allotments for video.

The deliverable is a harness that loads the **built** tag inside an ad iframe,
measures real consumption, compares it to a budget file, prints a report, and
exits non-zero on a breach — so it can run on every build.

## When to use which path

- **"Explain the limits / what should our budget be"** → read
  `references/resource-budgets.md`. It has every threshold, where it comes from,
  and how the numbers scale by ad size.
- **"Build / wire up the check"** → use `scripts/`. See `scripts/README.md`.
- **"Why did the number look off / can I trust the CPU figure"** → read
  `references/measurement-methodology.md`. It explains exactly what each metric
  measures and its caveats (especially CPU, which is a conservative proxy).

## Building the check (the common request)

The harness lives in `scripts/`. The workflow is:

1. Copy `scripts/` next to the ad-tag project (or install it as a dev
   dependency / internal package).
2. Install once: `npm install && npx playwright install chromium`.
3. Point it at the freshly built tag. Two modes:
   - **Local build** (recommended for CI): serve the dist directory and name the
     entry file.
     ```bash
     node check-tag.mjs --dir ../dist --entry tag.js --profile medium-rectangle-300x250
     ```
   - **Deployed URL** (smoke-test what's actually live):
     ```bash
     node check-tag.mjs --url https://cdn.example.com/tags/tag.js
     ```
4. It writes `ad-budget-report.json` and exits `1` if any **error**-severity
   limit is breached. Add it as the last step of the build script so a breach
   fails the build.

Always run a **CPU-throttled** pass too (`--throttle 4`) — HAI's CPU limits fire
far more readily on low-end devices than on a CI runner, so an unthrottled pass
alone will miss real-world breaches. See the README for the recommended
two-pass setup.

## Tuning budgets

`scripts/budgets.json` holds the thresholds. The HAI limits (`error` severity)
should not be relaxed — they are Chrome's, not ours — but each `error` limit has
a `warnAtFraction` (default 0.8) so a build warns *before* it hits the cliff.
The IAB limits (`warn` severity) scale with ad size; pick or add a `profile`
that matches the unit under test rather than editing the shared defaults. The
methodology doc explains how to derive a profile's k-weight from its pixel area.

## Guardrails

- Never raise a Chrome HAI `error` limit to make a build pass. The fix is a
  lighter creative (compress images/video, defer non-essential assets to
  user-initiated load, cut redundant requests), not a higher ceiling.
- Treat the initial-load and request-count checks as `warn` by default, but run
  CI in `--strict` mode once a tag is known-good so regressions are caught.
- The CPU number is a conservative whole-page proxy (see methodology). Use it to
  catch regressions and gross breaches; don't treat a 29%-vs-31% difference as
  precise.
