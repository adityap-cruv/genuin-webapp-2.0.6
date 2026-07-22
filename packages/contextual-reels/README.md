# @genuin/contextual-reels

Embeddable contextual-reel ad widget for Genuin Inc. Vite-built, served as a standalone
JS bundle (`gen_ext.min.js`) from CDN, embedded into host pages via `loader.js`.

Partners drop in a single `<script>` tag — the widget self-boots, scans for `.gen-ext`
mount points, and renders isolated React trees with no further setup required.

Full documentation → **[docs/README.md](docs/README.md)** (architecture, data flow, configuration,
conventions). AI-assistant memory map → **[CLAUDE.md](CLAUDE.md)**.

---

## Quick start

```sh
pnpm install                         # from repo root
cp .env.development.example .env.development   # fill in VITE_CXR_RUDDERSTACK_KEY
npm run dev                          # Vite dev server (validates env first)
npm run test                         # Vitest unit suite
npm run typecheck                    # tsc --noEmit (must be 0 errors)
npm run build:qa                     # QA bundle → validates env, syncs version, builds
npm run build:prod                   # Production bundle
```

---

## Deploy status

| Check             | Status                    |
| ----------------- | ------------------------- |
| `pnpm build:prod` | Passing — 3 s clean build |
| `pnpm typecheck`  | Passing — 0 errors        |
| `pnpm test`       | Passing — 1382/1382       |
| `pnpm lint`       | Passing — 0 errors        |

---

## Environment setup

Env loading happens in **two independent places** — this is subtle, so read carefully:

1. **Build/dev vars come from the sibling `genai` package.** `dev`, `build`, `build:qa`,
   and `build:prod` run under `env-cmd -f ../genai/.env.<mode>`, so the `VITE_CXR_*` values
   Vite bundles are read from `packages/genai/.env.<mode>` — **not** from a local file in
   this package. All vars also have prod-safe defaults in `src/config.ts` (see below), so a
   missing genai env file just falls back to defaults.
2. **`validate:env` checks a _local_ `.env.<mode>`.** The `predev` / `prebuild:qa` /
   `prebuild:prod` hooks run `scripts/validateEnv.ts`, which loads and Zod-validates a
   **local** `packages/contextual-reels/.env.<mode>`. This gate is about catching a
   misconfigured machine before a deploy; it does not feed the build.
3. **Deploy credentials come from `.env.common`.** `deploy:*` also reads local `./.env.<mode>`
   for the version-manager step, and the Oracle/Bunny upload scripts read `.env.common`.

| Command               | Build vars (bundled)        | Validated (local)  | Deploy creds  |
| --------------------- | --------------------------- | ------------------ | ------------- |
| `npm run dev`         | `../genai/.env.development` | `.env.development` | —             |
| `npm run build:qa`    | `../genai/.env.qa`          | `.env.qa`          | —             |
| `npm run build:prod`  | `../genai/.env.production`  | `.env.production`  | —             |
| `npm run deploy:qa`   | `../genai/.env.qa`          | `.env.qa`          | `.env.common` |
| `npm run deploy:prod` | `../genai/.env.production`  | `.env.production`  | `.env.common` |

**Dev setup (one time):**

```sh
cp .env.development.example .env.development   # satisfies validate:env
# Fill in VITE_CXR_RUDDERSTACK_KEY — ask team lead
# The values Vite actually bundles come from ../genai/.env.development (or src/config.ts defaults)
```

**Deploy setup (one time per machine):**

```sh
cp .env.qa.example .env.qa                 # fill in VITE_CXR_RUDDERSTACK_KEY + Oracle/Bunny creds
cp .env.production.example .env.production # fill in VITE_CXR_RUDDERSTACK_KEY + Oracle/Bunny creds
cp .env.common.example .env.common         # fill in ORACLE_ACCESS_KEY, ORACLE_SECRET_KEY, BUNNY_API_KEY
```

> **Never commit any `.env.*` file that contains real values.**

### Vite env vars

All vars have prod-safe defaults in `src/config.ts`; the env file overrides them at build time.

| Variable                              | Default                                     | Purpose                              |
| ------------------------------------- | ------------------------------------------- | ------------------------------------ |
| `VITE_CXR_API_BASE_URL`               | `https://api.begenuin.com`                  | Genuin API gateway                   |
| `VITE_CXR_RUDDERSTACK_KEY`            | `""` (analytics silent)                     | Rudderstack write key                |
| `VITE_CXR_RUDDERSTACK_DATA_PLANE_URL` | `https://etr.begenuin.com`                  | Rudderstack data plane               |
| `VITE_CXR_ASSET_BASE_URL`             | `https://media.begenuin.com/webapp_assets/` | Widget static assets (icons, images) |
| `VITE_CXR_GEN_AD_BASE_URL`            | `https://media.begenuin.com/ad-sdk/in-feed` | GenAd SDK bundle CDN                 |

---

## Deploy pipeline

`deploy:qa` and `deploy:prod` are the full one-command **interactive** deploys — run one
command and answer the prompts. Each:

1. **Bumps the version** (`package.json`) — interactive prompt (semver patch/minor/major)
2. **Builds the bundle** — Vite with the correct env file; syncs version into `loader.jsx` first
3. **Prompts for storage targets + paths, then uploads** via `scripts/deploy.ts` —
   versioned path `cxr/<version>/`. Target and path checkboxes are pre-selected (both
   targets, current version), so pressing enter through them accepts the defaults:
   - **Oracle Object Storage**, then purges Bunny CDN (`cxr/<version>/*`)
   - **Bunny Storage** (zone `infolink`), then purges its pull-zone `ginfo.b-cdn.net/cxr/<version>/*`

```sh
npm run deploy:qa    # requires .env.qa + .env.common
npm run deploy:prod  # requires .env.production + .env.common
```

Other entry points if needed:

```sh
npm run publish:qa               # upload dist/ to all targets, NO prompts, NO build (CI)
npm run publish:prod             # upload dist/ to all targets, NO prompts, NO build (CI)
npm run publish:interactive:qa   # interactive upload of existing dist/ (skips version bump + build)
npm run publish:interactive:prod # interactive upload of existing dist/ (skips version bump + build)
npm run purge:bunny:qa           # standalone Bunny CDN cache purge (QA)
npm run purge:bunny:prod         # standalone Bunny CDN cache purge (prod)
```

To preview an interactive deploy without uploading, add `--dry-run` to the script directly:

```sh
npx env-cmd -f ./.env.qa cross-env NODE_ENV=qa tsx scripts/deploy.ts --interactive --dry-run
```

`deploy.ts` accepts `--interactive` (checkbox target/path selection, both pre-selected) and
`--dry-run` (prints exactly what would be uploaded and purged, sends nothing). Without
`--interactive` it uploads to **both** Oracle and Bunny Storage using `S3_UPLOAD_PATHS`.

### Verifying a deploy from a CDN

After uploading, confirm the published build actually loads from a CDN host — loader, CSS,
entry, and every chunk must resolve relative to that host and return `200`:

```sh
npm run verify:cdn   # serves public/ on http://localhost:8799
```

Open `http://localhost:8799/cdn-verify.html` and watch the Network panel. Defaults to the
Bunny pull-zone (`https://ginfo.b-cdn.net`) and version `1.0.0`; override via query params:

```
?host=https://media.begenuin.com      # Oracle / prod media host
?host=https://media.qa.begenuin.com   # QA media host
?version=1.0.0&tag=<tagId>
```

Serve over HTTP, not `file://` — a `file://` origin blocks the widget's API/analytics calls.

### Version management

Version is the single source of truth in `package.json`. At build time `scripts/syncVersion.ts`
replaces `var CXR_VERSION = '...'` in `src/loader.jsx`, and `vite.config.mjs` uses the same
version to construct `CDN_BASE` (`https://media.begenuin.com/cxr/<version>/` for prod,
`https://media.qa.begenuin.com/cxr/<version>/` for qa/dev).

To bump manually without deploying:

```sh
npm version patch   # or minor / major
```

---

## Env validation

`scripts/validateEnv.ts` runs automatically before every `dev`, `build:qa`, and `build:prod`.
It checks that the env file exists and all required Vite vars are set. If not, it prints the
exact `cp` command to fix the problem and exits 1 before any build work begins.

```sh
npm run validate:env   # run manually with current NODE_ENV
```

---

## Multi-instance

Multiple `.gen-ext` elements on one page are fully supported. Each instance gets an isolated
`CxrEventBus`, React tree, and `InstanceRegistry` entry. `GlobalPlayerCoordinator` and
`GlobalMuteCoordinator` coordinate cross-instance play/mute state automatically.

---

## Autoplay & sound

The unit autoplays on load. Whether it starts **silent** or **audible** is decided by the
browser's autoplay policy, not by us:

- **Audible autoplay on load is not achievable for a real first-time visitor.** Browsers block
  autoplay that produces sound without a prior user gesture. A tag's `initialVolume` (e.g. `0.2`)
  only produces sound on load in already-trusted contexts (a dev machine with high Media Engagement
  Index, or `--autoplay-policy=no-user-gesture-required`). Everywhere else it falls back to
  **unmuted at volume 0** (silent) and shows the unmute affordance — the user raises volume to hear
  it. See `src/player/hlsPlayer.ts` (`tryPlay` / `silentFallback`).
- **As a native HTML ad in a cross-origin iframe**, the host page must set `allow="autoplay"` on the
  iframe for the unit to autoplay **at all** — this is the host's responsibility, not the SDK's.
  Note `allow="autoplay"` only enables **silent** autoplay; it does **not** grant audible autoplay.
  MEI does not help here either, since the iframe's origin is the ad server, which never accumulates
  the user's media engagement.

**Bottom line for ad placements:** design for silent autoplay + a visible unmute control. Do not
expect `initialVolume` to produce sound on load.

---

## Host embed & loader params

A host embeds the widget with one `<script>` tag plus a `.gen-ext` mount element:

```html
<div class="gen-ext" id="gen-ext-1" data-tag-id="YOUR_TAG_ID"></div>
<script src="https://media.begenuin.com/cxr/1.0.0/gen_ext.min.js"></script>
```

Hosts can pass configuration on the **loader `<script src>` query string**. This is the most
reliable config channel: the query lives in the host's own `<script>` tag, so it is readable even
when the widget runs inside a cross-origin `srcdoc` iframe (where neither the frame URL nor
`window.top` can be read). The loader captures the whole query into `window.__CXR_SCRIPT_PARAMS__`;
the widget reads individual params from there.

| Param         | Value                | Effect                                                                                                             |
| ------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `tagId`       | Tag id string        | Overrides the per-div `data-tag-id`. The loader-src value wins; falls back to `data-tag-id` when absent.           |
| `GIV`         | Number `0`–`1`       | Sets the initial audible volume. Overrides the tag's `initialVolume`; falls back to per-div `data-giv`. See below. |
| `gen_variant` | `stacked`            | Opts a supported slot into the stacked (widget + Infolinks) layout.                                                |
| `purl`        | URL-encoded page URL | Overrides the Infolinks publisher attribution URL (used with the stacked layout).                                  |

### `GIV` — initial volume override

Set the initial volume as a page-global loader-script param **or** a per-div `data-giv` attribute:

```html
<!-- Page-global: applies to every .gen-ext on the page. -->
<script src="https://media.begenuin.com/cxr/1.0.0/gen_ext.min.js?GIV=0.5"></script>

<!-- Per-div: this instance only (fallback when no GIV script param is set). -->
<div class="gen-ext" data-tag-id="YOUR_TAG_ID" data-giv="0.5"></div>
```

- Accepts a number in the inclusive range `0`–`1` (e.g. `0`, `0.5`, `1`).
- **Precedence mirrors `tagId`:** the page-global `GIV` script param wins; the per-div `data-giv`
  attribute is the fallback used when `GIV` is absent (or invalid). `GIV` is page-wide (one loader
  `<script>`), so use `data-giv` when you need a different level per `.gen-ext` on the same page.
- When present and valid it **overrides the tag's configured `initialVolume`** and drives every
  point where a volume level is applied without a fresh user gesture:
  - the **on-load** autoplay level,
  - the **audible-ad-start** level (audible ad requests + init), and
  - the level a **later manual unmute** (tap / mute-toggle / expand) restores to.
- An absent, non-numeric, or out-of-range value is **ignored** — the widget falls back to the tag's
  configured `initialVolume` (or the `0` default).
- **Subject to the browser autoplay policy** (see [Autoplay & sound](#autoplay--sound)): a non-zero
  value only produces sound on load in already-trusted contexts. Elsewhere it falls back to silent
  autoplay until the user gestures, at which point this value becomes the unmute level.

---

## Public API

After the loader runs, `window.cxr` exposes the public surface:

```ts
window.cxr.on('play', ({ instanceId }) => { ... })   // subscribe to events
window.cxr.expand(instanceId)                          // programmatic expand
window.cxr.collapse(instanceId)                        // programmatic collapse
window.cxr.infolinksImpression(instanceId?)            // fire Infolinks Impression event (omit id to target all instances)
```

Events: `play`, `pause`, `fullscreen:enter`, `fullscreen:exit`, `ad:fill`, `ad:nofill`,
`ad:removed` (fires when Chrome's Heavy-Ad Intervention unloads the ad frame or a
resource-budget breach removes it).

Iframe embeds can't reach `window.cxr` across the frame boundary — post
`{ type: 'cxr:infolinksImpression', instanceId? }` to the iframe instead; the widget's
`installMessageBridge` (`src/publicApi.ts`) listens for it and calls `infolinksImpression`.

---

## Bundle output

| Artifact            | Gzip size | Notes                      |
| ------------------- | --------- | -------------------------- |
| `gen_ext.min.js`    | 0.66 kB   | Loader IIFE stub           |
| `chunks/index-*.js` | 74.9 kB   | Main React + widget bundle |
| `chunks/Feed-*.js`  | 27.0 kB   | Lazy-loaded feed           |
| `chunks/hls-*.js`   | 195.6 kB  | HLS.js (expected)          |
| `chunks/App-*.js`   | 7.9 kB    | App tree                   |
| `assets/cxr-*.css`  | 3.1 kB    | Styles                     |

---

## Known gaps (non-blocking)

- Ad play/pause sync not yet wired to GenAd SDK (mute/unmute is). Tracked in `src/ads/genAdSdk.ts`.
- `MutationObserver` in `src/index.jsx` observes child removal, not node removal — SPA host pages
  that remove the `.gen-ext` element directly will not trigger React cleanup. Workaround: call
  `window.cxr.collapse(instanceId)` before removing the element.
