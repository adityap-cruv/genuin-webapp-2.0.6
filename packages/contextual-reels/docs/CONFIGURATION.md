# Configuration

Everything that changes widget behaviour without touching component code: env vars, ad layouts, the
stacked-Infolinks layout, initial volume, host macros, and the deploy pipeline. Runtime constants live
in [`src/config.ts`](../src/config.ts); per-tag feature flags live in
[`src/strategies/strategyConfig.ts`](../src/strategies/strategyConfig.ts) (see [STRATEGIES.md](STRATEGIES.md)).

## Environment variables

`VITE_CXR_*` vars are read via `import.meta.env` (defaults in [`config.ts`](../src/config.ts)). Required
ones are enforced by [`scripts/validateEnv.ts`](../scripts/validateEnv.ts) (runs in `predev` and the
QA/prod `prebuild`s).

| Var                                   | Purpose                                             | Default                                     |
| ------------------------------------- | --------------------------------------------------- | ------------------------------------------- |
| `VITE_CXR_API_BASE_URL`               | Genuin API gateway                                  | `https://api.begenuin.com`                  |
| `VITE_CXR_RUDDERSTACK_KEY`            | Rudderstack write key (never commit the real value) | `""`                                        |
| `VITE_CXR_RUDDERSTACK_DATA_PLANE_URL` | Rudderstack data plane                              | `https://etr.begenuin.com`                  |
| `VITE_CXR_ASSET_BASE_URL`             | CDN base for widget assets                          | `https://media.begenuin.com/webapp_assets/` |
| `VITE_CXR_GEN_AD_BASE_URL`            | GenAd SDK base URL                                  | — (required)                                |

**Triple env-loading model** (do not conflate the three):

1. **Build-time Vite vars** load from `../genai/.env.<mode>` (see the `env-cmd -f` flags in the `build*`
   scripts) — these become `import.meta.env.VITE_CXR_*`.
2. **`validateEnv`** reads the package's own **local** `.env.<mode>` (not `../genai/`).
3. **Deploy credentials** (Oracle/Bunny) load from `.env.common` / `.env.<mode>` in this package.

## Ad layouts — `AD_LAYOUT`

Numeric layout ids drive nearly all branching. `resolveAdLayout(width, height)` maps a slot's exact
pixel size to an id (any non-exact size → `Unknown`).

| Id  | Const     | Size    | Rendering                                                                                                              |
| --- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| 0   | `Unknown` | —       | fallback                                                                                                               |
| 1   | `L1`      | 300×600 | full player                                                                                                            |
| 2   | `L2`      | 300×250 | full player + Octo split overlay                                                                                       |
| 3   | `L3`      | 320×50  | compact bar, no player; audio via lazy offscreen player on unmute ([ADR 006](cxr-decisions/006-l3-audio-on-unmute.md)) |
| 4   | `L4`      | 320×100 | banner with a 100px thumbnail player                                                                                   |

## Stacked layout (widget + Infolinks)

A stacked slot is split into two equal halves — the widget on top, an Infolinks in-place unit below
([ADR 005](cxr-decisions/005-stacked-infolinks.md)). Activation requires the `gen_variant=stacked` URL
param **plus** a registered tag id.

- Registry: `STACKED_LAYOUT_TAGS` in [`config.ts`](../src/config.ts). Two tags opt in today:
  `320×100 → L4` (top L3 + 320×50 Infolinks) and `300×600 → L1` (top L1 + 300×300 Infolinks).
- `hasStackedVariant()` scans the frame chain + `document.referrer` for `gen_variant=stacked` (the signal
  survives a cross-origin `srcdoc` iframe). On **localhost** the tag-id gate is relaxed so either variant
  can be tested with `?gen_variant=stacked`.
- Infolinks publisher id `INFOLINKS_PID = 3446242`, isolated in a sized `srcdoc` iframe via
  `setupStackedRows` ([`utils/infolinks.ts`](../src/utils/infolinks.ts)). GAM still reports the full slot size.
- `INFOLINKS_PURL_PARAM = "purl"` (loader-script param) overrides the auto-resolved page URL for attribution.

## Initial volume — `GIV`

Sets the feed's initial audible volume `[0, 1]`, overriding the tag's resolved `initialVolume` strategy.
Precedence mirrors tag-id resolution: the page-global `GIV` **script param** wins; the per-div
`data-giv` **attribute** is the fallback. Both are validated to `[0, 1]`; an invalid script param does
not suppress a valid `data-giv`. `getInitVolumeOverride(dataGiv)` resolves it.

```html
<script src=".../gen_ext.min.js?GIV=0.5"></script>
<!-- page-global -->
<div class="gen-ext" data-tag-id="..." data-giv="0.5"></div>
<!-- per-div fallback -->
```

## Host macros

The host page substitutes macros (e.g. `appn`, `ifa`, `country`, `gdpr_consent`) into the loader URL.
The loader captures the whole query string into `window.__CXR_SCRIPT_PARAMS__`;
[`hostMacros.ts`](../src/hostMacros.ts) parses it into a cleaned map (dropping empties and unresolved
`{...}` / `~...~` placeholders). Consumed by ad-URL substitution ([`adUrlMacros.ts`](../src/ads/adUrlMacros.ts)),
analytics, and the pixel reporter. Design rulings (geo kept separate from IP geoip; Triton `site-url` is
web-only; the interim `TRITON_APP_PARAM_TAG_IDS` rewrite allowlist) live in
[the host-macro design spec](superpowers/specs/2026-07-09-cxr-host-macro-resolution-design.md).

### Statically-served ad-URL rewrite

For `servedStatically` tags (see [STRATEGIES.md](STRATEGIES.md#statically-served-tags)),
`resolveVideoAdMacros` takes a `{ servedStatically: true, clientIp }` option
(threaded from [`genAdSdk.ts`](../src/ads/genAdSdk.ts)) that, on top of the normal
`[PAGE_URL]` / host-macro substitution, rewrites the resolved URL in place: the
`ua` param is replaced with the real `navigator.userAgent`, and the `ip` param is
replaced with the real client IP. The IP comes from the shared geoip fetch
(`getSharedGeoIp` — the same `/ip_info` call analytics uses, so no extra request);
`genAdSdk` reads it best-effort and passes it as `clientIp`. When no IP is
available (geoip not resolved / unavailable), `ip` is **stripped** rather than
sent stale. Both edits are position-independent regex edits, so fixture ad URLs
may list params in any order. Omitting the option leaves the URL byte-identical to
the normal path — non-static tags are unaffected.

## Deploy pipeline

`pnpm build[:qa|:prod]` → Vite build (with `syncVersion.ts` stamping the version into `loader.jsx` for
QA/prod). `deploy:qa`/`deploy:prod` run the version manager, build, then `publish:oracle:*`.

- The deploy does **not** auto-derive the upload path — it uses `S3_UPLOAD_PATHS`.
- The deploy does **not** purge the CDN — run `purge:bunny:qa` / `purge:bunny:prod` manually.
- Loader filename is fixed at `gen_ext.min.js` (**partner contract** — see [CONTRIBUTING.md](CONTRIBUTING.md)).
