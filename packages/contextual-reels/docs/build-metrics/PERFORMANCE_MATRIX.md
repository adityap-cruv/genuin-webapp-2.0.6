# Performance Matrix

Track key metrics after each phase build. Run `pnpm build && node scripts/track-bundle-size.mjs`
and paste the gzip total here. Test counts come from `pnpm test -- --reporter=verbose | tail -5`.

## How to Update

1. `pnpm build` in `packages/contextual-reels`.
2. `node scripts/track-bundle-size.mjs` — copy the **Total** gzip value.
3. `pnpm test` — copy the passing test count.
4. `pnpm typecheck` — confirm 0 errors (required invariant).
5. Edit the row for the phase you just completed.

## Metrics Table

| Metric              | Legacy | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 6 Target |
| ------------------- | ------ | ------- | ------- | ------- | ------- | ------- | -------------- |
| Total bundle gz     | ~206KB | ~409KB  | ~409KB  | TBD     | TBD     | TBD     | ≤145KB         |
| Loader gz           | ~1.5KB | 0.6KB   | 0.6KB   | ≤1.5KB  | ≤1.5KB  | ≤1.5KB  | ≤1.5KB         |
| First ad fill (ms)  | TBD    | TBD     | TBD     | TBD     | TBD     | TBD     | TBD            |
| Test count          | 0      | 51      | 183     | TBD     | TBD     | TBD     | 300+           |
| TypeScript coverage | 0%     | ~20%    | ~55%    | TBD     | TBD     | TBD     | 100%           |
| TS strict errors    | N/A    | 0       | 0       | 0       | 0       | 0       | 0              |

Notes:

- Legacy total gz is estimated from dep sizes (no built artifact available).
- Phase 0/1 total gz is measured from actual dist/ (see `BASELINE.md`); higher than
  legacy estimate because it includes source code chunked by Vite, not just deps.
- "Total bundle gz" for Phase 2+ will reflect dropped deps (axios, uuid, react-device-detect).

## Key Performance Invariants — Never Regress

These gates are checked in CI. A PR that breaks any of them must not merge.

- **Loader ≤ 1.5KB gz always** — partners hard-code the script tag; a bloated loader
  blocks the entire page parse.
- **TS strict errors: always 0** — `pnpm typecheck` must exit 0 on every branch.
- **Test suite: always green before merge** — `pnpm test` must exit 0.
- **HLS cold-start ≤ 500ms to first frame on 4G** — measure via Lighthouse network
  throttling (40ms RTT, 1.6Mbps down). Benchmark after Phase 3 lands.
