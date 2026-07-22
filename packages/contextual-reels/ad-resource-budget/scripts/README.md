# ad-resource-budget — harness

A per-build gate that loads a JS ad tag inside an ad iframe, measures what it
actually consumes, and fails the build if it breaches Chrome's Heavy Ad
Intervention limits or your IAB targets.

For the full explanation of the limits, see
[`../references/resource-budgets.md`](../references/resource-budgets.md).
For how each number is measured (and its caveats), see
[`../references/measurement-methodology.md`](../references/measurement-methodology.md).

## Install (once)

```bash
cd scripts
npm install
npx playwright install chromium   # downloads the browser binary
```

> CI note: `npx playwright install --with-deps chromium` also installs the OS
> libraries Chromium needs on a fresh Linux runner.

## Run

**Against a local build (recommended for CI):** serve the dist dir and name the
entry file. The tag and everything it fetches/injects is measured.

```bash
node check-tag.mjs --dir ../dist --entry tag.js --profile medium-rectangle-300x250
```

**Against a deployed URL** (smoke-test what's live):

```bash
node check-tag.mjs --url https://cdn.example.com/tags/tag.js
```

**Against inline tag HTML:**

```bash
node check-tag.mjs --html ./my-tag-snippet.html
```

Exit code is `0` within budget, `1` on an error-severity breach (fails the
build), `2` on a usage/runtime error. A JSON report is written to
`ad-budget-report.json` (override with `--out`).

## Flags

| Flag | Meaning |
|---|---|
| `--dir <path>` / `--entry <file>` | serve a local build directory and load `<file>` as the tag |
| `--url <url>` | load a deployed tag URL |
| `--html <file>` | inject inline tag HTML |
| `--profile <name>` | ad-size profile from `budgets.json` (default `default`) |
| `--budgets <path>` | use a different budget file |
| `--observe <ms>` | observation window (default 30000 — needed for the 30 s peak-CPU check) |
| `--throttle <n>` | emulate hardware `n`× slower (use `4` to stress HAI's CPU limits) |
| `--runs <n>` | run `n` times and assert the worst case |
| `--quick` | 10 s observation; skips the peak-CPU window check (fast local loop) |
| `--strict` | treat IAB warn-severity breaches as build failures too |
| `--out <path>` | JSON report path |

## Recommended two-pass CI setup

HAI's CPU limits fire first on weak hardware, so an unthrottled runner under-tests
them. Run both:

```bash
# Pass 1 — bytes, requests, initial load, average CPU% (unthrottled)
node check-tag.mjs --dir ../dist --entry tag.js --profile medium-rectangle-300x250

# Pass 2 — total & peak CPU seconds on emulated low-end hardware
node check-tag.mjs --dir ../dist --entry tag.js --profile medium-rectangle-300x250 --throttle 4
```

## Wiring into a build

Add it as the last step of your tag's build script so a breach blocks the
artifact from shipping:

```json
{
  "scripts": {
    "build": "your-bundler && npm run budget",
    "budget": "node ../ad-resource-budget/scripts/check-tag.mjs --dir ./dist --entry tag.js --profile medium-rectangle-300x250"
  }
}
```

GitHub Actions workflow: see
[`../assets/github-actions-ad-budget.yml`](../assets/github-actions-ad-budget.yml).

## Tuning budgets

Edit `budgets.json`. Two rules:

1. **Never raise an `error` limit** — those are Chrome's HAI thresholds, not
   yours. If a build fails on one, lighten the creative. Each `error` limit has
   `warnAtFraction` (default `0.8`) so you get a `NEAR` warning before the cliff.
2. **Scale `warn` limits per ad size via `profiles`**, not by editing the shared
   defaults. The methodology doc shows how to size a profile's initial-load
   k-weight from the unit's pixel area. Video units use the `video-15s` /
   `video-30s` profiles, which fold in the IAB 1.1 MB / 2.2 MB allotments.

## What it does and doesn't cover

Covers: transferred bytes (incl. descendant iframes), initial-vs-subload split,
file-request counts, total/peak/average main-thread CPU.

Does **not** cover: slot-level auto-refresh behavior (≥30 s, in-view — a
page-integration concern), or LEAN behavioral rules (auto-expand, hover-expand,
auto-audio, close button — need static review or interaction tests). See the
references for those.
