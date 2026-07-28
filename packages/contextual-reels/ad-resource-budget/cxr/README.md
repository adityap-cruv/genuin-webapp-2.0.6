# CXR wiring for the ad-resource-budget harness

This folder adapts the generic harness in `../scripts/` to the Contextual Reels
build. Run it from the package root:

```bash
pnpm --filter @genuin/contextual-reels run budget            # single tag, unthrottled
pnpm --filter @genuin/contextual-reels run budget:throttled  # emulate low-end CPU (4x)
pnpm --filter @genuin/contextual-reels run budget:build       # build then check
pnpm --filter @genuin/contextual-reels run budget:all         # full size × tag matrix + scorecard
```

The single-tag scripts call `../scripts/check-tag.mjs` with `--dir ./dist --html
./ad-resource-budget/cxr/tag-snippet.html --profile cxr` (mount size defaults to
320×100). `budget:all` runs `run-budgets.mjs`, which crosses every tag in
`tags.mjs` with every size in `CXR_SIZES` and prints a combined scorecard.

## How it maps to CXR

The CXR ad ships as a **loader** (`dist/gen_ext.min.js`) that resolves its base
URL from its own `<script src>` and dynamically `import()`s the hashed core
chunk (`gen_ext-<hash>.js`) plus `cxr-<hash>.css`. The core scans the page for
`.gen-ext[data-tag-id]` mount divs, requests a fill from the ad API, and plays
HLS video.

So the harness needs two things the generic flow doesn't provide:

1. **A mount div.** `tag-snippet.html` supplies a `.gen-ext` element with a real
   `data-tag-id` (kept in sync with `../../index.html`). Without a fill, the core
   boots but loads no creative and the budget reads near-zero.
2. **Same-origin serving of the build.** `--dir ./dist` serves the chunks from
   the local origin so the loader's `import()` resolves to the local build, not
   the CDN. The harness serves the ad frame as a real document (`/ad-frame.html`),
   not a `srcdoc` iframe — a `srcdoc` base URL is `about:srcdoc`, which makes the
   loader's path-based `src` and its `import()` silently fail (0 bytes measured).

## Size axis — 320×50 vs 320×100 vs 320×480

Mount size is a first-class dimension because it changes _which layout renders_,
not just the box. `resolveAdLayout` (in `src/config.ts`) maps pixel size to a
layout id, and the layouts differ in what they load:

- **320×50 → L3** ("compact bar, no player"). `renderL3` mounts **no**
  `LightPlayer`, so the reel MP4/HLS video is never fetched in the collapsed
  slot — it loads only on user expand, which HAI doesn't measure. Result: every
  320×50 cell passes the 4 MB HAI limit today.
- **320×100 → L4** ("banner with 100px thumbnail player"). `renderL4` mounts
  `LightPlayer` and autoplays the reel, so the full video/HLS cost lands in the
  un-interacted window. Every 320×100 cell breaches HAI.
- **320×480 → L5** ("tall mobile unit, full player"). Renders L1's full player,
  so like L4 it autoplays the reel up front — but into a viewport ~5x taller, the
  largest mobile surface we mount. It is here to bound the media cost of the new
  size, not because a different code path loads.

`CXR_SIZES` in `tags.mjs` holds the sizes; the runner keys each report as
`ad-budget-report.<variation>.<size>.json`. The size reaches the snippet via
`--width`/`--height` on `check-tag.mjs`, which substitute `__CR_WIDTH__` /
`__CR_HEIGHT__` in `tag-snippet.html` (default 320×100 when omitted, so the
single-tag `budget` path is unchanged).

## The `cxr` profile

`../scripts/budgets.json` → `profiles.cxr` scales the **IAB warn** limits for a
video unit (1.1 MB auto-init-15s initial-load allotment; higher subload request
count for HLS segmenting). The **Chrome HAI error limits are not scaled** — they
are Chrome's, and a breach means the creative is too heavy, not that the ceiling
is wrong.

## Network access

The dev/QA build hits `api.qa.begenuin.com` for fills and pulls video + the
external GenAd / GenAI SDKs and RudderStack from their CDNs. A faithful run needs
network access to those hosts; an offline run measures only the local loader.

## Known findings

- **Original (2026-06-28):** the reel autoplayed and **prefetched several
  upcoming videos**, pushing total transfer to ~18 MB over a 30 s un-interacted
  window. The prefetch has since been cut (load gated to the active slide).
- **Current matrix (worst-of-3 runs on the latest build):** size decides
  everything.

  | Variation  | 320×50 (L3)       | 320×100 (L4)        |
  | ---------- | ----------------- | ------------------- |
  | ads-only   | B · 2.75 MB · 69% | F · 6.90 MB · 173%  |
  | video+ad   | B · 2.25 MB · 56% | F · 10.11 MB · 253% |
  | video-only | B · 1.52 MB · 38% | F · 7.39 MB · 185%  |

  **All 320×50 cells pass HAI; all 320×100 cells breach it.** The breach is the
  reel video the L4 banner autoplays, so the fix is on the media side
  (lower-bitrate video, deferred segment prefetch), not a higher budget. None
  reaches grade A only because of one IAB warn: initial load ~1.26 MB vs the
  ~1.25 MB target (the core JS chunk + CSS), unrelated to the media breach.
  Fill is non-deterministic — always run `--runs 3+`.

  **320×480 (L5) is in `CXR_SIZES` but has no measured column yet.** It renders
  L1's autoplaying full player, so expect it to breach like L4 (probably worse —
  a taller viewport can pull a higher rendition), but that is a prediction, not a
  measurement. Run `budget:all` on a machine where the harness actually loads the
  feed and fill in the column.
