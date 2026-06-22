# Bundle Baseline — Pre-rewrite (Phase 0/1 build)

## Measurement Date

2026-05-14

## Method

```sh
ls -la dist/*.js dist/chunks/*.js dist/assets/*.css 2>/dev/null
node scripts/track-bundle-size.mjs
```

Actual dist was built from the Phase 0/1 source (legacy `App.jsx` still in place).
Gzip estimates computed via Node `zlib.gzipSync` on actual built files.

## Actual Dist File Sizes (Phase 0/1 build)

| File                                | Raw          | Gzip       |
| ----------------------------------- | ------------ | ---------- |
| `gen_ext.min.js`                    | 1.1KB        | 0.6KB      |
| `gen_ext-DmgxFlwN.js`               | 0.04KB       | 0.06KB     |
| `chunks/LightPlayer-yLMz0lYJ.js`    | 774KB        | 200KB      |
| `chunks/index-CfATuxk5.js`          | 404KB        | 103KB      |
| `chunks/index-Dbn15-1T.js`          | 132KB        | 36KB       |
| `chunks/OverLay-BX9qpPfN.js`        | 169KB        | 47KB       |
| `chunks/ReelItem-BbDCBXRG.js`       | 30KB         | 5.6KB      |
| `chunks/AdsPlaceholder-CVjYmDNh.js` | 12KB         | 3.3KB      |
| `chunks/App-kUoUvmoa.js`            | 5.4KB        | 2.2KB      |
| other chunks                        | ~14KB        | ~6.5KB     |
| `assets/cxr-CtAef6WC.css`           | 22KB         | 4.4KB      |
| **Total**                           | **~1,566KB** | **~409KB** |

The two dominant chunks are `LightPlayer` (hls.js + vlitejs bundled together) and
`index-CfATuxk5` (React + framer-motion + swiper vendor bundle).

## Dep Size Contributions (approximate gz, from npm stats)

| Dependency            | Approx gz | Status                                     |
| --------------------- | --------- | ------------------------------------------ |
| `framer-motion`       | ~50KB     | To be dropped (Phase 4)                    |
| `swiper`              | ~25KB     | To be dropped (Phase 4, ADR 001)           |
| `react` + `react-dom` | ~45KB     | Retained                                   |
| `vlitejs`             | ~25KB     | Under review (Phase 3)                     |
| `hls.js`              | ~40KB     | Retained, lazy-loaded (Phase 3)            |
| `react-device-detect` | ~5KB      | To be dropped (Phase 2, native UA)         |
| `axios`               | ~14KB     | To be dropped (Phase 2, native fetch)      |
| `uuid`                | ~2KB      | To be dropped (Phase 2, crypto.randomUUID) |

**Total estimated legacy baseline**: ~206KB gz (all deps eager-loaded, no chunking).
Actual measured Phase 0/1 build: ~409KB gz (includes source code on top of deps).

## Target State by Phase

| Chunk                     | Phase | Target gz  |
| ------------------------- | ----- | ---------- |
| loader (`gen_ext.min.js`) | 0     | ≤1.5KB     |
| core sync                 | 1–2   | ≤35KB      |
| feed                      | 4     | ≤25KB      |
| player                    | 3     | ≤30KB      |
| hls                       | 3     | ≤40KB      |
| ads                       | 2     | ≤8KB       |
| genai                     | 6     | ≤4KB       |
| **Total hot path**        | 6     | **≤145KB** |

## Savings Breakdown

Dropped deps net saving: framer-motion ~50KB + swiper ~25KB + react-device-detect ~5KB

- uuid ~2KB + axios ~14KB = **~96KB raw dep saving**.
  Minus native scroll-snap overhead vs. Swiper (~8KB polyfill budget) = **~88KB net**.
  Combined with code-split lazy loading of hls.js and GenAd SDK, target is ≤145KB on the
  hot path (what the browser must parse before first reel renders).

## How to Measure After Each Phase Build

```sh
pnpm build
node scripts/track-bundle-size.mjs
```

Paste the markdown table output into `PERFORMANCE_MATRIX.md` for the relevant phase
column. Gzip estimates from `track-bundle-size.mjs` use `zlib.gzipSync` — actual
CDN-served gzip will differ by ≤5% depending on compression level.
