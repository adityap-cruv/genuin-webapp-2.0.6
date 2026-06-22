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
