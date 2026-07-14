# @genuin/contextual-reels

Embeddable contextual-reel ad widget for Genuin Inc. Vite-built, served as a standalone
JS bundle (`gen_ext.min.js`) from CDN, embedded into host pages via `loader.js`.

Partners drop in a single `<script>` tag — the widget self-boots, scans for `.gen-ext`
mount points, and renders isolated React trees with no further setup required.

Full documentation → **[docs/PROJECT.md](docs/PROJECT.md)**

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
| `pnpm test`       | Passing — 685/685         |
| `pnpm lint`       | Passing — 0 errors        |

---

## Environment setup

Vite auto-selects the env file based on `--mode`. Each command loads its own file — no
commenting/uncommenting needed.

| Command              | Env file loaded      | Copy from                    |
| -------------------- | -------------------- | ---------------------------- |
| `npm run dev`        | `.env.development`   | `.env.development.example`   |
| `npm run build:qa`   | `.env.qa`            | `.env.qa.example`            |
| `npm run build:prod` | `.env.production`    | `.env.production.example`    |
| `npm run deploy:qa`  | `.env.qa` + `.env.common` | `.env.qa.example` + `.env.common.example` |
| `npm run deploy:prod`| `.env.production` + `.env.common` | `.env.production.example` + `.env.common.example` |

**Dev setup (one time):**
```sh
cp .env.development.example .env.development
# Fill in VITE_CXR_RUDDERSTACK_KEY — ask team lead
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

| Variable                          | Default                                                     | Purpose                              |
| --------------------------------- | ----------------------------------------------------------- | ------------------------------------ |
| `VITE_CXR_API_BASE_URL`               | `https://api.begenuin.com`                                  | Genuin API gateway                   |
| `VITE_CXR_RUDDERSTACK_KEY`            | `""` (analytics silent)                                     | Rudderstack write key                |
| `VITE_CXR_RUDDERSTACK_DATA_PLANE_URL` | `https://etr.begenuin.com`                                  | Rudderstack data plane               |
| `VITE_CXR_ASSET_BASE_URL`             | `https://media.begenuin.com/webapp_assets/`                 | Widget static assets (icons, images) |
| `VITE_CXR_GEN_AD_BASE_URL`            | `https://media.begenuin.com/ad-sdk/in-feed`                 | GenAd SDK bundle CDN                 |
| `VITE_CXR_GENAI_SDK_URL`              | `https://media.begenuin.com/genai-sdk/octo/genai-sdk.es.js` | GenAI SDK bundle CDN                 |

---

## Deploy pipeline

`deploy:qa` and `deploy:prod` are the full one-command deploys. Each:

1. **Bumps the version** (`package.json`) — interactive prompt (semver patch/minor/major)
2. **Builds the bundle** — Vite with the correct env file; syncs version into `loader.jsx` first
3. **Uploads to Oracle Object Storage** — versioned path `cxr/<version>/`
4. **Purges Bunny CDN cache** — wildcard purge of `cxr/<version>/*`

```sh
npm run deploy:qa    # requires .env.qa + .env.common
npm run deploy:prod  # requires .env.production + .env.common
```

Individual steps if needed:
```sh
npm run publish:oracle:qa    # upload dist/ to Oracle (QA)
npm run publish:oracle:prod  # upload dist/ to Oracle (prod)
npm run purge:bunny:qa       # CDN cache purge (QA)
npm run purge:bunny:prod     # CDN cache purge (prod)
```

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

| Param            | Value                | Effect                                                                                                 |
| ---------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| `tagId`          | Tag id string        | Overrides the per-div `data-tag-id`. The loader-src value wins; falls back to `data-tag-id` when absent. |
| `gen_init_volume`| Number `0`–`1`       | Sets the initial audible volume. Overrides the tag's configured `initialVolume`. See below.            |
| `gen_variant`    | `stacked`            | Opts a supported slot into the stacked (widget + Infolinks) layout.                                    |
| `purl`           | URL-encoded page URL | Overrides the Infolinks publisher attribution URL (used with the stacked layout).                      |

### `gen_init_volume` — initial volume override

```html
<script src="https://media.begenuin.com/cxr/1.0.0/gen_ext.min.js?gen_init_volume=0.5"></script>
```

- Accepts a number in the inclusive range `0`–`1` (e.g. `0`, `0.5`, `1`).
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
```

Events: `play`, `pause`, `fullscreen:enter`, `fullscreen:exit`, `ad:fill`, `ad:nofill`.

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
